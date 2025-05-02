import {
	BlueprintResultBaseline,
	BlueprintResultRundown,
	IBlueprintAdLibPiece,
	IngestRundown,
	IShowStyleUserContext,
	PieceLifespan,
	PlaylistTimingType,
	TSR
} from 'blueprints-integration'
import {
	CasparPlayerClipLoadingLoop,
	createDskBaseline,
	CreateDSKBaselineAdlibs,
	CreateLYDBaseline,
	findDskFullGfx,
	findDskJingle,
	getGraphicBaseline,
	getMixMinusTimelineObject,
	GetSisyfosTimelineObjForReplay,
	literal,
	MixMinusPriority,
	PieceMetaData,
	replaySourceName,
	ShowStyleContext,
	ShowStyleContextImpl,
	SourceInfo,
	SpecialInput,
	SwitcherType,
	TransitionStyle
} from 'tv2-common'
import { AdlibTags, CONSTANTS, SharedGraphicLLayer, SharedOutputLayer, SwitcherAuxLLayer } from 'tv2-constants'
import * as _ from 'underscore'
import { GfxSchemaGenerator } from '../tv2-common/cues/gfx-schema-generator'
import { GfxSchemaGeneratorFacade } from '../tv2-common/cues/gfx-schema-generator-facade'
import { Tv2OutputLayer } from '../tv2-constants/tv2-output-layer'
import { PlayoutContentType } from '../tv2-constants/tv2-playout-content'
import { getMixEffectBaseline } from '../tv2_afvd_studio/getBaseline'
import { CasparLLayer, SisyfosLLAyer } from '../tv2_afvd_studio/layers'
import { SisyfosChannel, sisyfosChannels } from '../tv2_afvd_studio/sisyfosChannels'
import { GALLERY_UNIFORM_CONFIG } from '../tv2_afvd_studio/uniformConfig'
import { AtemSourceIndex } from '../types/atem'
import { GlobalAdlibActionsGenerator } from './GlobalAdlibActionsGenerator'
import { GalleryBlueprintConfig } from './helpers/config'
import { SourceLayer } from './layers'

const gfxSchemaGenerator: GfxSchemaGenerator = GfxSchemaGeneratorFacade.create()

export function getRundown(coreContext: IShowStyleUserContext, ingestRundown: IngestRundown): BlueprintResultRundown {
	const context = new ShowStyleContextImpl<GalleryBlueprintConfig>(coreContext, GALLERY_UNIFORM_CONFIG)
	return {
		rundown: {
			externalId: ingestRundown.externalId,
			name: ingestRundown.name,
			timing: {
				type: PlaylistTimingType.None
			}
		},
		globalAdLibPieces: new GlobalAdLibPiecesGenerator(context).generate(),
		globalActions: new GlobalAdlibActionsGenerator(context).generate(),
		baseline: getBaseline(context)
	}
}

class GlobalAdLibPiecesGenerator {
	private config: GalleryBlueprintConfig
	constructor(private readonly context: ShowStyleContext<GalleryBlueprintConfig>) {
		this.config = context.config
	}

	public generate(): IBlueprintAdLibPiece[] {
		const adLibPieces: IBlueprintAdLibPiece[] = []
		let globalRank = 1000

		this.config.sources.lives
			.slice(0, 10) // the first x lives to create AUX1 (studio) adlibs
			.forEach((info) => {
				adLibPieces.push(...this.makeRemoteAuxStudioAdLibs(info, globalRank++))
			})

		this.config.sources.replays.forEach((info) => {
			if (!/EPSIO/i.test(info.id)) {
				adLibPieces.push(this.makeEvsAdLib(info, globalRank++, false))
			}
			adLibPieces.push(this.makeEvsAdLib(info, globalRank++, true))
			adLibPieces.push(this.makeEvsStudioAuxAdLib(info, globalRank++))
			adLibPieces.push(this.makeEvsVizAuxAdLib(info, globalRank++))
		})

		// the rank (order) of adlibs on SourceLayer.PgmAdlibVizCmd is important, to ensure keyboard shortcuts
		adLibPieces.push(...this.makeGfxCommandAdLibs())
		adLibPieces.push(...CreateDSKBaselineAdlibs(this.config, 500, this.context.videoSwitcher))

		adLibPieces.push(...this.makeSisyfosAdLibs())
		adLibPieces.push(this.makeAudioBedAdLib())

		return adLibPieces
	}

	private makeEvsAdLib(info: SourceInfo, rank: number, vo: boolean): IBlueprintAdLibPiece<PieceMetaData> {
		return {
			externalId: 'delayed',
			name: replaySourceName(info.id, vo),
			_rank: rank,
			sourceLayerId: SourceLayer.PgmLocal,
			outputLayerId: SharedOutputLayer.PGM,
			expectedDuration: 0,
			lifespan: PieceLifespan.WithinPart,
			toBeQueued: true,
			tags: [AdlibTags.ADLIB_QUEUE_NEXT, vo ? AdlibTags.ADLIB_VO_AUDIO_LEVEL : AdlibTags.ADLIB_FULL_AUDIO_LEVEL],
			content: {
				ignoreMediaObjectStatus: true,
				timelineObjects: [
					...this.context.videoSwitcher.getOnAirTimelineObjectsWithLookahead({
						enable: { while: '1' },
						priority: 1,
						content: {
							input: info.port,
							transition: TransitionStyle.CUT
						}
					}),
					...GetSisyfosTimelineObjForReplay(this.config, info, vo)
				]
			},
			metaData: {
				playoutContent: {
					type: PlayoutContentType.REPLAY,
					source: info.id
				},
				outputLayer: Tv2OutputLayer.PROGRAM,
				sisyfosPersistMetaData: {
					sisyfosLayers: info.sisyfosLayers ?? [],
					acceptsPersistedAudio: vo
				}
			}
		}
	}

	private makeEvsStudioAuxAdLib(info: SourceInfo, rank: number) {
		return {
			externalId: 'delayedaux',
			name: `EVS in studio aux`,
			_rank: rank,
			sourceLayerId: SourceLayer.AuxStudioScreen,
			outputLayerId: SharedOutputLayer.AUX,
			expectedDuration: 0,
			lifespan: PieceLifespan.OutOnShowStyleEnd,
			tags: [AdlibTags.ADLIB_TO_STUDIO_SCREEN_AUX],
			content: {
				timelineObjects: [
					this.context.videoSwitcher.getAuxTimelineObject({
						enable: { while: '1' },
						priority: 1,
						layer: SwitcherAuxLLayer.AR,
						content: {
							input: info.port
						}
					})
				]
			}
		}
	}

	private makeEvsVizAuxAdLib(info: SourceInfo, rank: number) {
		return {
			externalId: 'delayedaux',
			name: `EVS in viz aux`,
			_rank: rank,
			sourceLayerId: SourceLayer.VizFullIn1,
			outputLayerId: SharedOutputLayer.AUX,
			expectedDuration: 0,
			lifespan: PieceLifespan.OutOnShowStyleEnd,
			tags: [AdlibTags.ADLIB_TO_GRAPHICS_ENGINE_AUX],
			content: {
				timelineObjects: [
					this.context.videoSwitcher.getAuxTimelineObject({
						enable: { while: '1' },
						priority: 1,
						layer: SwitcherAuxLLayer.VIZ_OVL_IN_1,
						content: {
							input: info.port
						}
					})
				]
			},
			metaData: {
				playoutContent: {
					type: PlayoutContentType.UNKNOWN
				}
			}
		}
	}

	// aux adlibs
	private makeRemoteAuxStudioAdLibs(info: SourceInfo, rank: number): Array<IBlueprintAdLibPiece<PieceMetaData>> {
		const res: Array<IBlueprintAdLibPiece<PieceMetaData>> = []
		res.push({
			externalId: 'auxstudio',
			name: info.id + '',
			_rank: rank,
			sourceLayerId: SourceLayer.AuxStudioScreen,
			outputLayerId: SharedOutputLayer.AUX,
			expectedDuration: 0,
			lifespan: PieceLifespan.OutOnShowStyleEnd,
			metaData: {
				playoutContent: {
					type: PlayoutContentType.UNKNOWN
				},
				sisyfosPersistMetaData: {
					sisyfosLayers: info.sisyfosLayers ?? [],
					wantsToPersistAudio: info.wantsToPersistAudio,
					acceptsPersistedAudio: info.acceptPersistAudio
				}
			},
			tags: [AdlibTags.ADLIB_TO_STUDIO_SCREEN_AUX],
			content: {
				timelineObjects: [
					this.context.videoSwitcher.getAuxTimelineObject({
						enable: { while: '1' },
						priority: 1,
						layer: SwitcherAuxLLayer.AR,
						content: {
							input: info.port
						}
					})
				]
			}
		})

		return res
	}

	private makeGfxCommandAdLibs() {
		// the rank (order) of adlibs on SourceLayer.PgmAdlibVizCmd is important, to ensure keyboard shortcuts
		return [
			{
				externalId: 'loadGFX',
				name: 'OVL INIT',
				_rank: 100,
				sourceLayerId: SourceLayer.PgmAdlibGraphicCmd,
				outputLayerId: SharedOutputLayer.SEC,
				expectedDuration: 1000,
				lifespan: PieceLifespan.WithinPart,
				tags: [AdlibTags.ADLIB_STATIC_BUTTON, AdlibTags.ADLIB_GFX_LOAD],
				content: {
					timelineObjects: _.compact<TSR.TSRTimelineObj[]>([
						literal<TSR.TimelineObjVIZMSELoadAllElements>({
							id: 'loadAllElements',
							enable: {
								start: 0,
								duration: 1000
							},
							priority: 100,
							layer: SharedGraphicLLayer.GraphicLLayerAdLibs,
							content: {
								deviceType: TSR.DeviceType.VIZMSE,
								type: TSR.TimelineContentTypeVizMSE.LOAD_ALL_ELEMENTS
							}
						})
					])
				},
				metadata: {
					playoutContent: {
						type: PlayoutContentType.COMMAND
					},
					outputLayer: Tv2OutputLayer.SECONDARY
				}
			},
			{
				externalId: 'continueForward',
				name: 'GFX Continue',
				_rank: 200,
				sourceLayerId: SourceLayer.PgmAdlibGraphicCmd,
				outputLayerId: SharedOutputLayer.SEC,
				expectedDuration: 1000,
				lifespan: PieceLifespan.WithinPart,
				tags: [AdlibTags.ADLIB_STATIC_BUTTON, AdlibTags.ADLIB_GFX_CONTINUE_FORWARD],
				content: {
					timelineObjects: [
						literal<TSR.TimelineObjVIZMSEElementContinue>({
							id: '',
							enable: {
								start: 0,
								duration: 1000
							},
							priority: 100,
							layer: SharedGraphicLLayer.GraphicLLayerAdLibs,
							content: {
								deviceType: TSR.DeviceType.VIZMSE,
								type: TSR.TimelineContentTypeVizMSE.CONTINUE,
								direction: 1,
								reference: SharedGraphicLLayer.GraphicLLayerPilot
							}
						})
					]
				},
				metadata: {
					playoutContent: {
						type: PlayoutContentType.COMMAND
					},
					outputLayer: Tv2OutputLayer.SECONDARY
				}
			}
		]
	}

	private makeSisyfosAdLibs(): IBlueprintAdLibPiece[] {
		return [
			{
				externalId: 'micUp',
				name: 'Mics Up',
				_rank: 600,
				sourceLayerId: SourceLayer.PgmSisyfosAdlibs,
				outputLayerId: SharedOutputLayer.SEC,
				lifespan: PieceLifespan.WithinPart,
				tags: [AdlibTags.ADLIB_STATIC_BUTTON, AdlibTags.ADLIB_MICS_UP],
				expectedDuration: 0,
				content: {
					timelineObjects: [
						literal<TSR.TimelineObjSisyfosChannels>({
							id: '',
							enable: { start: 0 },
							priority: 10,
							layer: SisyfosLLAyer.SisyfosGroupStudioMics,
							content: {
								deviceType: TSR.DeviceType.SISYFOS,
								type: TSR.TimelineContentTypeSisyfos.CHANNELS,
								channels: this.config.studio.StudioMics.map((layer) => ({
									mappedLayer: layer,
									isPgm: 1
								})),
								overridePriority: 10
							}
						})
					]
				},
				metaData: {
					playoutContent: {
						type: PlayoutContentType.COMMAND
					},
					outputLayer: Tv2OutputLayer.SECONDARY
				}
			},
			{
				externalId: 'micDown',
				name: 'Mics Down',
				_rank: 650,
				sourceLayerId: SourceLayer.PgmSisyfosAdlibs,
				outputLayerId: SharedOutputLayer.SEC,
				lifespan: PieceLifespan.WithinPart,
				tags: [AdlibTags.ADLIB_STATIC_BUTTON, AdlibTags.ADLIB_MICS_DOWN],
				expectedDuration: 0,
				content: {
					timelineObjects: [
						literal<TSR.TimelineObjSisyfosChannels>({
							id: '',
							enable: { start: 0 },
							priority: 10,
							layer: SisyfosLLAyer.SisyfosGroupStudioMics,
							content: {
								deviceType: TSR.DeviceType.SISYFOS,
								type: TSR.TimelineContentTypeSisyfos.CHANNELS,
								channels: this.config.studio.StudioMics.map((layer) => ({
									mappedLayer: layer,
									isPgm: 0
								})),
								overridePriority: 10
							}
						})
					]
				},
				metaData: {
					playoutContent: {
						type: PlayoutContentType.COMMAND
					},
					outputLayer: Tv2OutputLayer.SECONDARY
				}
			},
			{
				externalId: 'resyncSisyfos',
				name: 'Resync Sisyfos',
				_rank: 700,
				sourceLayerId: SourceLayer.PgmSisyfosAdlibs,
				outputLayerId: SharedOutputLayer.SEC,
				lifespan: PieceLifespan.WithinPart,
				tags: [AdlibTags.ADLIB_STATIC_BUTTON, AdlibTags.ADLIBS_RESYNC_SISYFOS],
				expectedDuration: 1000,
				content: {
					timelineObjects: [
						literal<TSR.TimelineObjSisyfosChannel>({
							id: '',
							enable: { start: 0 },
							priority: 2,
							layer: SisyfosLLAyer.SisyfosResync,
							content: {
								deviceType: TSR.DeviceType.SISYFOS,
								type: TSR.TimelineContentTypeSisyfos.CHANNEL,
								resync: true
							}
						})
					]
				},
				metaData: {
					playoutContent: {
						type: PlayoutContentType.COMMAND
					},
					outputLayer: Tv2OutputLayer.SECONDARY
				}
			}
		]
	}

	private makeAudioBedAdLib(): IBlueprintAdLibPiece {
		return {
			externalId: 'stopAudioBed',
			name: 'Stop Soundplayer',
			_rank: 700,
			sourceLayerId: SourceLayer.PgmAudioBed,
			outputLayerId: SharedOutputLayer.MUSIK,
			expectedDuration: 1000,
			lifespan: PieceLifespan.WithinPart,
			tags: [AdlibTags.ADLIB_STOP_AUDIO_BED],
			content: {
				timelineObjects: [
					literal<TSR.TimelineObjEmpty>({
						id: '',
						enable: {
							start: 0,
							duration: 1000
						},
						priority: 50,
						layer: SisyfosLLAyer.SisyfosSourceAudiobed,
						content: {
							deviceType: TSR.DeviceType.ABSTRACT,
							type: 'empty'
						},
						classes: []
					})
				]
			},
			metaData: {
				playoutContent: {
					type: PlayoutContentType.COMMAND
				},
				outputLayer: Tv2OutputLayer.SECONDARY
			}
		}
	}
}

function getBaseline(context: ShowStyleContext<GalleryBlueprintConfig>): BlueprintResultBaseline {
	const jingleDsk = findDskJingle(context.config)
	const fullGfxDsk = findDskFullGfx(context.config)
	const selectedGfxSetup = context.config.selectedGfxSetup

	return {
		timelineObjects: _.compact([
			...getGraphicBaseline(context),
			...gfxSchemaGenerator.createBaselineTimelineObjectsFromGfxDefaults(context),
			// Default timeline
			...getMixEffectBaseline(context, context.config.studio.SwitcherSource.Default),

			context.videoSwitcher.getAuxTimelineObject({
				enable: { while: '1' },
				layer: SwitcherAuxLLayer.LOOKAHEAD,
				content: {
					input: context.config.studio.SwitcherSource.Default
				}
			}),
			...(context.config.studio.SwitcherType === SwitcherType.TRICASTER
				? [
						context.videoSwitcher.getAuxTimelineObject({
							enable: { while: '1' },
							layer: SwitcherAuxLLayer.MIX_EFFECT_3,
							content: {
								input: SpecialInput.ME3_PROGRAM
							}
						})
				  ]
				: [
						context.videoSwitcher.getAuxTimelineObject({
							enable: { while: '1' },
							layer: SwitcherAuxLLayer.DVE,
							content: {
								input: SpecialInput.DVE
							}
						})
				  ]),
			context.videoSwitcher.getAuxTimelineObject({
				enable: { while: '1' },
				layer: SwitcherAuxLLayer.VIDEO_MIX_MINUS,
				content: {
					input: context.uniformConfig.mixEffects.program.input
				}
			}),
			getMixMinusTimelineObject(
				context,
				context.config.studio.SwitcherSource.MixMinusDefault,
				MixMinusPriority.STUDIO_CONFIG
			),

			// render presenter screen
			literal<TSR.TimelineObjCCGHTMLPage>({
				id: '',
				enable: { while: '1' },
				priority: 0,
				layer: CasparLLayer.CasparCountdown,
				content: {
					deviceType: TSR.DeviceType.CASPARCG,
					type: TSR.TimelineContentTypeCasparCg.HTMLPAGE,
					url: context.config.studio.SofieHostURL + '/countdowns/studio0/presenter'
				}
			}),

			// keyers
			...createDskBaseline(context.config, context.videoSwitcher),

			// ties the DSK for jingles to ME4 USK1 to have effects on CLEAN (ME4)
			context.uniformConfig.switcherLLayers.jingleUskMixEffect
				? context.videoSwitcher.getMixEffectTimelineObject({
						enable: { while: '1' },
						layer: context.uniformConfig.switcherLLayers.jingleUskMixEffect,
						content: {
							keyers: [
								{
									onAir: false,
									config: jingleDsk
								}
							]
						}
				  })
				: undefined,
			context.uniformConfig.switcherLLayers.fullUskMixEffect
				? context.videoSwitcher.getMixEffectTimelineObject({
						enable: { while: '1' },
						layer: context.uniformConfig.switcherLLayers.fullUskMixEffect,
						content: {
							keyers: [
								{
									onAir: false,
									config: fullGfxDsk
								}
							]
						}
				  })
				: undefined,
			...context.videoSwitcher.getDveTimelineObjects({
				enable: { while: '1' },
				content: {
					boxes: [
						{
							// left
							enabled: true,
							source: AtemSourceIndex.Bars,
							size: 580,
							x: -800,
							y: 50,
							cropped: true,
							cropRight: 2000
						},
						{
							// right
							enabled: true,
							source: AtemSourceIndex.Bars,
							size: 580,
							x: 800,
							y: 50
							// note: this sits behind box1, so don't crop it to ensure there is no gap between
						},
						{
							// box 3
							enabled: false
						},
						{
							// box 4
							enabled: false
						}
					],
					template: {
						properties: {
							artPreMultiplied: true
						}
					},
					artFillSource: context.config.studio.SwitcherSource.SplitArtFill,
					artCutSource: context.config.studio.SwitcherSource.SplitArtKey
				}
			}),
			literal<TSR.TimelineObjCCGMedia>({
				id: '',
				enable: { while: '1' },
				priority: 0,
				layer: CasparLLayer.CasparCGDVEFrame,
				content: {
					deviceType: TSR.DeviceType.CASPARCG,
					type: TSR.TimelineContentTypeCasparCg.MEDIA,
					file: 'empty',
					mixer: {
						opacity: 0
					},
					transitions: {
						inTransition: {
							type: TSR.Transition.CUT,
							duration: CONSTANTS.DefaultClipFadeOut
						}
					}
				}
			}),
			literal<TSR.TimelineObjCCGMedia>({
				id: '',
				enable: { while: '1' },
				priority: 0,
				layer: CasparLLayer.CasparCGDVEKey,
				content: {
					deviceType: TSR.DeviceType.CASPARCG,
					type: TSR.TimelineContentTypeCasparCg.MEDIA,
					file: 'empty',
					mixer: {
						opacity: 0
					},
					transitions: {
						inTransition: {
							type: TSR.Transition.CUT,
							duration: CONSTANTS.DefaultClipFadeOut
						}
					}
				}
			}),
			literal<TSR.TimelineObjCCGRoute>({
				id: '',
				enable: { while: 1 },
				priority: 0,
				layer: CasparLLayer.CasparCGFullBg,
				content: {
					deviceType: TSR.DeviceType.CASPARCG,
					type: TSR.TimelineContentTypeCasparCg.ROUTE,
					mappedLayer: CasparLLayer.CasparCGDVELoop
				}
			}),

			...(context.config.studio.GraphicsType === 'HTML'
				? [
						literal<TSR.TimelineObjCasparCGAny>({
							id: '',
							enable: { start: 0 },
							priority: 2, // Take priority over anything trying to set the template on the Viz version of this layer
							layer: SharedGraphicLLayer.GraphicLLayerFullLoop,
							content: {
								deviceType: TSR.DeviceType.CASPARCG,
								type: TSR.TimelineContentTypeCasparCg.ROUTE,
								mappedLayer: CasparLLayer.CasparCGDVELoop
							}
						}),
						literal<TSR.TimelineObjCCGRoute>({
							id: '',
							enable: { while: 1 },
							priority: 0,
							layer: CasparLLayer.CasparCGDVEKeyedLoop,
							content: {
								deviceType: TSR.DeviceType.CASPARCG,
								type: TSR.TimelineContentTypeCasparCg.ROUTE,
								mappedLayer: CasparLLayer.CasparCGDVELoop
							}
						})
				  ]
				: []),

			literal<TSR.TimelineObjSisyfosChannels>({
				id: '',
				enable: { while: '1' },
				priority: 0,
				layer: SisyfosLLAyer.SisyfosConfig,
				content: {
					deviceType: TSR.DeviceType.SISYFOS,
					type: TSR.TimelineContentTypeSisyfos.CHANNELS,
					channels: Object.keys(sisyfosChannels).map((key) => {
						const llayer = key as SisyfosLLAyer
						const channel = sisyfosChannels[llayer] as SisyfosChannel
						return literal<TSR.TimelineObjSisyfosChannels['content']['channels'][0]>({
							mappedLayer: llayer,
							isPgm: channel.isPgm,
							visible: !channel.hideInStudioA
						})
					}),
					overridePriority: 0
				}
			}),

			...CreateLYDBaseline('afvd'),

			...(context.config.showStyle.CasparCGLoadingClip && context.config.showStyle.CasparCGLoadingClip.length
				? [...context.config.mediaPlayers.map((mp) => CasparPlayerClipLoadingLoop(mp.id))].map((layer) => {
						return literal<TSR.TimelineObjCCGMedia>({
							id: '',
							enable: { while: '1' },
							priority: 0,
							layer,
							content: {
								deviceType: TSR.DeviceType.CASPARCG,
								type: TSR.TimelineContentTypeCasparCg.MEDIA,
								file: context.config.showStyle.CasparCGLoadingClip,
								loop: true
							}
						})
				  })
				: []),

			literal<TSR.TimelineObjVIZMSEConcept>({
				id: '',
				enable: { while: '1' },
				layer: SharedGraphicLLayer.GraphicLLayerConcept,
				content: {
					deviceType: TSR.DeviceType.VIZMSE,
					type: TSR.TimelineContentTypeVizMSE.CONCEPT,
					concept: context.config.selectedGfxSetup.VcpConcept
				}
			})
		]),
		expectedPlayoutItems: [
			{
				deviceSubType: TSR.DeviceType.VIZMSE,
				content: {
					templateName: 'OUT_TEMA_H',
					channel: 'OVL1',
					templateData: [],
					showName: selectedGfxSetup.OvlShowName
				}
			},
			{
				deviceSubType: TSR.DeviceType.VIZMSE,
				content: {
					templateName: 'altud',
					channel: 'OVL1',
					templateData: [],
					showName: selectedGfxSetup.OvlShowName
				}
			}
		]
	}
}
