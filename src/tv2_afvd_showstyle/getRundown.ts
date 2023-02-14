import {
	BlueprintResultBaseline,
	BlueprintResultRundown,
	GraphicsContent,
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	ICommonContext,
	IngestRundown,
	IShowStyleUserContext,
	PieceLifespan,
	PlaylistTimingType,
	TimelineObjectCoreExt,
	TSR,
	WithTimeline
} from 'blueprints-integration'
import {
	ActionCallRobotPreset,
	ActionClearGraphics,
	ActionCutSourceToBox,
	ActionCutToCamera,
	ActionFadeDownPersistedAudioLevels,
	ActionRecallLastDVE,
	ActionRecallLastLive,
	ActionSelectDVELayout,
	CasparPlayerClipLoadingLoop,
	CreateDSKBaseline,
	CreateDSKBaselineAdlibs,
	CreateGraphicBaseline,
	CreateLYDBaseline,
	ExtendedShowStyleContext,
	ExtendedShowStyleContextImpl,
	FindDSKJingle,
	generateExternalId,
	GetSisyfosTimelineObjForRemote,
	GetSisyfosTimelineObjForReplay,
	GetTransitionAdLibActions,
	literal,
	PieceMetaData,
	replaySourceName,
	SourceDefinitionKam,
	SourceInfo,
	SourceInfoToSourceDefinition,
	SourceInfoType,
	SpecialInput,
	t,
	TransitionStyle,
	VideoSwitcher
} from 'tv2-common'
import {
	AdlibActionType,
	AdlibTagCutToBox,
	AdlibTags,
	CONSTANTS,
	SharedGraphicLLayer,
	SharedOutputLayers,
	SourceType,
	SwitcherAuxLLayer,
	SwitcherDveLLayer,
	SwitcherMixEffectLLayer,
	TallyTags
} from 'tv2-constants'
import * as _ from 'underscore'
import { CasparLLayer, SisyfosLLAyer } from '../tv2_afvd_studio/layers'
import { SisyfosChannel, sisyfosChannels } from '../tv2_afvd_studio/sisyfosChannels'
import { GALLERY_UNIFORM_CONFIG } from '../tv2_afvd_studio/uniformConfig'
import { AtemSourceIndex } from '../types/atem'
import { GalleryBlueprintConfig } from './helpers/config'
import { NUMBER_OF_DVE_BOXES } from './helpers/content/dve'
import { SourceLayer } from './layers'

export function getRundown(coreContext: IShowStyleUserContext, ingestRundown: IngestRundown): BlueprintResultRundown {
	const context = new ExtendedShowStyleContextImpl<GalleryBlueprintConfig>(coreContext, GALLERY_UNIFORM_CONFIG)
	return {
		rundown: {
			externalId: ingestRundown.externalId,
			name: ingestRundown.name,
			timing: {
				type: PlaylistTimingType.None
			}
		},
		globalAdLibPieces: new GlobalAdLibPiecesGenerator(context).generate(),
		globalActions: getGlobalAdlibActionsAFVD(context.core, context.config), // @todo
		baseline: getBaseline(context, context.videoSwitcher) // @todo
	}
}

class GlobalAdLibPiecesGenerator {
	private config: GalleryBlueprintConfig
	constructor(private readonly context: ExtendedShowStyleContext<GalleryBlueprintConfig>) {
		this.config = context.config
	}

	public generate(): IBlueprintAdLibPiece[] {
		const adLibPieces: IBlueprintAdLibPiece[] = []
		let globalRank = 1000

		this.config.sources.lives
			.slice(0, 10) // the first x lives to create live-adlibs from
			.forEach(info => {
				adLibPieces.push(...this.makeRemoteAdLibs(info, globalRank++))
			})

		this.config.sources.lives
			.slice(0, 10) // the first x lives to create AUX1 (studio) adlibs
			.forEach(info => {
				adLibPieces.push(...this.makeRemoteAuxStudioAdLibs(info, globalRank++))
			})

		this.config.sources.replays.forEach(info => {
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

	// viz styles and dve backgrounds
	public makeDesignAdLib(): IBlueprintAdLibPiece {
		const timelineObjects: TimelineObjectCoreExt[] = [
			literal<TSR.TimelineObjCCGMedia>({
				id: '',
				enable: { start: 0 },
				priority: 110,
				layer: CasparLLayer.CasparCGDVELoop,
				content: {
					deviceType: TSR.DeviceType.CASPARCG,
					type: TSR.TimelineContentTypeCasparCg.MEDIA,
					file: 'dve/BG_LOADER_SC',
					loop: true
				}
			})
		]
		// @todo: use GraphicsGenerator
		if (this.config.studio.GraphicsType === 'VIZ') {
			timelineObjects.push(
				literal<TSR.TimelineObjVIZMSEElementInternal>({
					id: '',
					enable: { start: 0 },
					priority: 110,
					layer: SharedGraphicLLayer.GraphicLLayerDesign,
					content: {
						deviceType: TSR.DeviceType.VIZMSE,
						type: TSR.TimelineContentTypeVizMSE.ELEMENT_INTERNAL,
						templateName: 'BG_LOADER_SC',
						templateData: [],
						showName: this.config.selectedGfxSetup.OvlShowName
					}
				})
			)
		}
		const adLibPiece: IBlueprintAdLibPiece = {
			_rank: 301,
			externalId: 'dve-design-sc',
			name: 'DVE Design SC',
			outputLayerId: SharedOutputLayers.SEC,
			sourceLayerId: SourceLayer.PgmDesign,
			lifespan: PieceLifespan.OutOnShowStyleEnd,
			tags: [AdlibTags.ADLIB_DESIGN_STYLE_SC],
			content: literal<WithTimeline<GraphicsContent>>({
				fileName: 'BG_LOADER_SC',
				path: 'BG_LOADER_SC',
				ignoreMediaObjectStatus: true,
				timelineObjects
			})
		}
		return adLibPiece
	}

	private makeEvsAdLib(info: SourceInfo, rank: number, vo: boolean): IBlueprintAdLibPiece<PieceMetaData> {
		return {
			externalId: 'delayed',
			name: replaySourceName(info.id, vo),
			_rank: rank,
			sourceLayerId: SourceLayer.PgmLocal,
			outputLayerId: SharedOutputLayers.PGM,
			expectedDuration: 0,
			lifespan: PieceLifespan.WithinPart,
			toBeQueued: true,
			metaData: {
				sisyfosPersistMetaData: {
					sisyfosLayers: info.sisyfosLayers ?? [],
					acceptPersistAudio: vo
				}
			},
			tags: [AdlibTags.ADLIB_QUEUE_NEXT, vo ? AdlibTags.ADLIB_VO_AUDIO_LEVEL : AdlibTags.ADLIB_FULL_AUDIO_LEVEL],
			content: {
				ignoreMediaObjectStatus: true,
				timelineObjects: [
					...this.context.videoSwitcher.getOnAirTimelineObjects({
						enable: { while: '1' },
						priority: 1,
						content: {
							input: info.port,
							transition: TransitionStyle.CUT
						}
					}),
					...GetSisyfosTimelineObjForReplay(this.config, info, vo)
				]
			}
		}
	}

	private makeEvsStudioAuxAdLib(info: SourceInfo, rank: number) {
		return {
			externalId: 'delayedaux',
			name: `EVS in studio aux`,
			_rank: rank,
			sourceLayerId: SourceLayer.AuxStudioScreen,
			outputLayerId: SharedOutputLayers.AUX,
			expectedDuration: 0,
			lifespan: PieceLifespan.OutOnShowStyleEnd,
			tags: [AdlibTags.ADLIB_TO_STUDIO_SCREEN_AUX],
			content: {
				timelineObjects: [
					this.context.videoSwitcher.getAuxTimelineObject({
						enable: { while: '1' },
						priority: 1,
						layer: SwitcherAuxLLayer.AuxAR,
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
			outputLayerId: SharedOutputLayers.AUX,
			expectedDuration: 0,
			lifespan: PieceLifespan.OutOnShowStyleEnd,
			tags: [AdlibTags.ADLIB_TO_GRAPHICS_ENGINE_AUX],
			content: {
				timelineObjects: [
					this.context.videoSwitcher.getAuxTimelineObject({
						enable: { while: '1' },
						priority: 1,
						layer: SwitcherAuxLLayer.AuxVizOvlIn1,
						content: {
							input: info.port
						}
					})
				]
			}
		}
	}

	private makeRemoteAdLibs(info: SourceInfo, rank: number): Array<IBlueprintAdLibPiece<PieceMetaData>> {
		const res: Array<IBlueprintAdLibPiece<PieceMetaData>> = []
		const eksternSisyfos = GetSisyfosTimelineObjForRemote(this.config, info)
		res.push({
			externalId: 'live',
			name: `LIVE ${info.id}`,
			_rank: rank,
			sourceLayerId: SourceLayer.PgmLive,
			outputLayerId: SharedOutputLayers.PGM,
			expectedDuration: 0,
			lifespan: PieceLifespan.WithinPart,
			toBeQueued: true,
			metaData: {
				sisyfosPersistMetaData: {
					sisyfosLayers: info.sisyfosLayers ?? [],
					wantsToPersistAudio: info.wantsToPersistAudio,
					acceptPersistAudio: info.acceptPersistAudio
				}
			},
			tags: [AdlibTags.ADLIB_QUEUE_NEXT],
			content: {
				timelineObjects: [
					...this.context.videoSwitcher.getOnAirTimelineObjects({
						enable: { while: '1' },
						priority: 1,
						content: {
							input: info.port,
							transition: TransitionStyle.CUT
						},
						mixMinusInput: null // @should it be here?
					}),
					...eksternSisyfos
				]
			}
		})

		return res
	}

	// aux adlibs
	private makeRemoteAuxStudioAdLibs(info: SourceInfo, rank: number): Array<IBlueprintAdLibPiece<PieceMetaData>> {
		const res: Array<IBlueprintAdLibPiece<PieceMetaData>> = []
		res.push({
			externalId: 'auxstudio',
			name: info.id + '',
			_rank: rank,
			sourceLayerId: SourceLayer.AuxStudioScreen,
			outputLayerId: SharedOutputLayers.AUX,
			expectedDuration: 0,
			lifespan: PieceLifespan.OutOnShowStyleEnd,
			metaData: {
				sisyfosPersistMetaData: {
					sisyfosLayers: info.sisyfosLayers ?? [],
					wantsToPersistAudio: info.wantsToPersistAudio,
					acceptPersistAudio: info.acceptPersistAudio
				}
			},
			tags: [AdlibTags.ADLIB_TO_STUDIO_SCREEN_AUX],
			content: {
				timelineObjects: [
					this.context.videoSwitcher.getAuxTimelineObject({
						enable: { while: '1' },
						priority: 1,
						layer: SwitcherAuxLLayer.AuxAR,
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
				outputLayerId: SharedOutputLayers.SEC,
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
				}
			},
			{
				externalId: 'continueForward',
				name: 'GFX Continue',
				_rank: 200,
				sourceLayerId: SourceLayer.PgmAdlibGraphicCmd,
				outputLayerId: SharedOutputLayers.SEC,
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
				outputLayerId: SharedOutputLayers.SEC,
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
								channels: this.config.studio.StudioMics.map(layer => ({
									mappedLayer: layer,
									isPgm: 1
								})),
								overridePriority: 10
							}
						})
					]
				}
			},
			{
				externalId: 'micDown',
				name: 'Mics Down',
				_rank: 650,
				sourceLayerId: SourceLayer.PgmSisyfosAdlibs,
				outputLayerId: SharedOutputLayers.SEC,
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
								channels: this.config.studio.StudioMics.map(layer => ({
									mappedLayer: layer,
									isPgm: 0
								})),
								overridePriority: 10
							}
						})
					]
				}
			},
			{
				externalId: 'resyncSisyfos',
				name: 'Resync Sisyfos',
				_rank: 700,
				sourceLayerId: SourceLayer.PgmSisyfosAdlibs,
				outputLayerId: SharedOutputLayers.SEC,
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
			outputLayerId: 'musik',
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
			}
		}
	}
}

function getGlobalAdlibActionsAFVD(
	context: IShowStyleUserContext,
	config: GalleryBlueprintConfig
): IBlueprintActionManifest[] {
	const blueprintActions: IBlueprintActionManifest[] = []

	let globalRank = 1000

	function makeAdlibBoxesActions(info: SourceInfo, rank: number) {
		for (let box = 0; box < NUMBER_OF_DVE_BOXES; box++) {
			const name = `${info.type} ${info.id}`
			const layer = info.type === SourceInfoType.KAM ? SourceLayer.PgmCam : SourceLayer.PgmLive

			const userData: ActionCutSourceToBox = {
				type: AdlibActionType.CUT_SOURCE_TO_BOX,
				name,
				box,
				sourceDefinition: SourceInfoToSourceDefinition(info)
			}
			blueprintActions.push({
				externalId: generateExternalId(context, userData),
				actionId: AdlibActionType.CUT_SOURCE_TO_BOX,
				userData,
				userDataManifest: {},
				display: {
					_rank: rank + 0.1 * box,
					label: t(`${name} inp ${box + 1}`),
					sourceLayerId: layer,
					outputLayerId: SharedOutputLayers.SEC,
					content: {},
					tags: [AdlibTagCutToBox(box)]
				}
			})
		}
	}

	function makeAdlibBoxesActionsReplay(info: SourceInfo, rank: number, vo: boolean) {
		for (let box = 0; box < NUMBER_OF_DVE_BOXES; box++) {
			const name = replaySourceName(info.id, vo)
			const userData: ActionCutSourceToBox = {
				type: AdlibActionType.CUT_SOURCE_TO_BOX,
				name,
				box,
				sourceDefinition: {
					sourceType: SourceType.REPLAY,
					id: info.id,
					vo,
					raw: '',
					name
				}
			}
			blueprintActions.push({
				externalId: generateExternalId(context, userData),
				actionId: AdlibActionType.CUT_SOURCE_TO_BOX,
				userData,
				userDataManifest: {},
				display: {
					_rank: rank + 0.1 * box,
					label: t(`${name} inp ${box + 1}`),
					sourceLayerId: SourceLayer.PgmLocal,
					outputLayerId: SharedOutputLayers.SEC,
					content: {},
					tags: [AdlibTagCutToBox(box), vo ? AdlibTags.ADLIB_VO_AUDIO_LEVEL : AdlibTags.ADLIB_FULL_AUDIO_LEVEL]
				}
			})
		}
	}

	function makeServerAdlibBoxesActions(rank: number) {
		for (let box = 0; box < NUMBER_OF_DVE_BOXES; box++) {
			const userData: ActionCutSourceToBox = {
				type: AdlibActionType.CUT_SOURCE_TO_BOX,
				name: `SERVER`,
				box,
				sourceDefinition: { sourceType: SourceType.SERVER }
			}
			blueprintActions.push({
				externalId: generateExternalId(context, userData),
				actionId: AdlibActionType.CUT_SOURCE_TO_BOX,
				userData,
				userDataManifest: {},
				display: {
					_rank: rank + 0.1 * box,
					label: t(`Server inp ${box + 1}`),
					sourceLayerId: SourceLayer.PgmServer,
					outputLayerId: SharedOutputLayers.SEC,
					content: {},
					tags: [AdlibTagCutToBox(box)]
				}
			})
		}
	}

	function makeCutCameraActions(info: SourceInfo, queue: boolean, rank: number) {
		const sourceDefinition = SourceInfoToSourceDefinition(info) as SourceDefinitionKam
		const userData: ActionCutToCamera = {
			type: AdlibActionType.CUT_TO_CAMERA,
			queue,
			sourceDefinition
		}
		blueprintActions.push({
			externalId: generateExternalId(context, userData),
			actionId: AdlibActionType.CUT_TO_CAMERA,
			userData,
			userDataManifest: {},
			display: {
				_rank: rank,
				label: t(sourceDefinition.name),
				sourceLayerId: SourceLayer.PgmCam,
				outputLayerId: SharedOutputLayers.PGM,
				content: {},
				tags: queue ? [AdlibTags.ADLIB_QUEUE_NEXT] : [AdlibTags.ADLIB_CUT_DIRECT]
			}
		})
	}

	config.sources.cameras
		.slice(0, 5) // the first x cameras to create INP1/2/3 cam-adlibs from
		.forEach(o => {
			makeCutCameraActions(o, false, globalRank++)
		})

	config.sources.cameras
		.slice(0, 5) // the first x cameras to create preview cam-adlibs from
		.forEach(o => {
			makeCutCameraActions(o, true, globalRank++)
		})

	config.sources.cameras
		.slice(0, 5) // the first x cameras to dve actions from
		.forEach(o => {
			makeAdlibBoxesActions(o, globalRank++)
		})

	function makeRecallLastLiveAction() {
		const userData: ActionRecallLastLive = {
			type: AdlibActionType.RECALL_LAST_LIVE
		}
		blueprintActions.push({
			externalId: generateExternalId(context, userData),
			actionId: AdlibActionType.RECALL_LAST_LIVE,
			userData,
			userDataManifest: {},
			display: {
				_rank: 1,
				label: t('Last Live'),
				sourceLayerId: SourceLayer.PgmLive,
				outputLayerId: SharedOutputLayers.PGM,
				tags: [AdlibTags.ADLIB_RECALL_LAST_LIVE]
			}
		})
	}

	makeRecallLastLiveAction()

	config.sources.lives
		.slice(0, 10) // the first x remote to create INP1/2/3 live-adlibs from
		.forEach(o => {
			makeAdlibBoxesActions(o, globalRank++)
		})

	config.sources.feeds
		.slice(0, 10) // the first x remote to create INP1/2/3 live-adlibs from
		.forEach(o => {
			makeAdlibBoxesActions(o, globalRank++)
		})

	config.sources.replays.forEach(o => {
		if (!/EPSIO/i.test(o.id)) {
			makeAdlibBoxesActionsReplay(o, globalRank++, false)
		}
		makeAdlibBoxesActionsReplay(o, globalRank++, true)
	})

	makeServerAdlibBoxesActions(globalRank++)

	function makeClearGraphicsAction(): IBlueprintActionManifest {
		const userData: ActionClearGraphics = {
			type: AdlibActionType.CLEAR_GRAPHICS,
			sendCommands: true,
			label: 'GFX Clear'
		}
		return {
			externalId: generateExternalId(context, userData),
			actionId: AdlibActionType.CLEAR_GRAPHICS,
			userData,
			userDataManifest: {},
			display: {
				_rank: 300,
				label: t(`GFX Clear`),
				sourceLayerId: SourceLayer.PgmAdlibGraphicCmd,
				outputLayerId: SharedOutputLayers.SEC,
				content: {},
				tags: [AdlibTags.ADLIB_STATIC_BUTTON],
				currentPieceTags: [TallyTags.GFX_CLEAR],
				nextPieceTags: [TallyTags.GFX_CLEAR]
			}
		}
	}

	function makeClearGraphicsAltudAction(): IBlueprintActionManifest {
		const userData: ActionClearGraphics = {
			type: AdlibActionType.CLEAR_GRAPHICS,
			sendCommands: false,
			label: 'GFX Altud'
		}
		return {
			externalId: generateExternalId(context, userData),
			actionId: AdlibActionType.CLEAR_GRAPHICS,
			userData,
			userDataManifest: {},
			display: {
				_rank: 400,
				label: t(`GFX Altud`),
				sourceLayerId: SourceLayer.PgmAdlibGraphicCmd,
				outputLayerId: SharedOutputLayers.SEC,
				content: {},
				tags: [AdlibTags.ADLIB_STATIC_BUTTON, AdlibTags.ADLIB_GFX_ALTUD],
				currentPieceTags: [TallyTags.GFX_ALTUD],
				nextPieceTags: [TallyTags.GFX_ALTUD]
			}
		}
	}

	blueprintActions.push(makeClearGraphicsAction(), makeClearGraphicsAltudAction())

	blueprintActions.push(...GetTransitionAdLibActions(config, 800))

	const recallLastLiveDveUserData: ActionRecallLastDVE = {
		type: AdlibActionType.RECALL_LAST_DVE
	}
	blueprintActions.push({
		externalId: generateExternalId(context, recallLastLiveDveUserData),
		actionId: AdlibActionType.RECALL_LAST_DVE,
		userData: recallLastLiveDveUserData,
		userDataManifest: {},
		display: {
			_rank: 1,
			label: t('Last DVE'),
			sourceLayerId: SourceLayer.PgmDVEAdLib,
			outputLayerId: 'pgm',
			tags: [AdlibTags.ADLIB_RECALL_LAST_DVE]
		}
	})

	_.each(config.showStyle.DVEStyles, (dveConfig, i) => {
		const userData: ActionSelectDVELayout = {
			type: AdlibActionType.SELECT_DVE_LAYOUT,
			config: dveConfig
		}
		blueprintActions.push({
			externalId: generateExternalId(context, userData),
			actionId: AdlibActionType.SELECT_DVE_LAYOUT,
			userData,
			userDataManifest: {},
			display: {
				_rank: 200 + i,
				label: t(dveConfig.DVEName),
				sourceLayerId: SourceLayer.PgmDVEAdLib,
				outputLayerId: SharedOutputLayers.PGM,
				tags: [AdlibTags.ADLIB_SELECT_DVE_LAYOUT, dveConfig.DVEName]
			}
		})
	})

	const fadeDownPersistedAudioLevelsUserData: ActionFadeDownPersistedAudioLevels = {
		type: AdlibActionType.FADE_DOWN_PERSISTED_AUDIO_LEVELS
	}
	blueprintActions.push({
		externalId: generateExternalId(context, fadeDownPersistedAudioLevelsUserData),
		actionId: AdlibActionType.FADE_DOWN_PERSISTED_AUDIO_LEVELS,
		userData: fadeDownPersistedAudioLevelsUserData,
		userDataManifest: {},
		display: {
			_rank: 300,
			label: t('Fade down persisted audio levels'),
			sourceLayerId: SourceLayer.PgmSisyfosAdlibs,
			outputLayerId: SharedOutputLayers.SEC,
			tags: [AdlibTags.ADLIB_FADE_DOWN_PERSISTED_AUDIO_LEVELS]
		}
	})

	blueprintActions.push(createRobotPresetAction(context))

	return blueprintActions
}

function createRobotPresetAction(context: ICommonContext): IBlueprintActionManifest {
	const callRobotPresetAction: ActionCallRobotPreset = {
		type: AdlibActionType.CALL_ROBOT_PRESET
	}
	return {
		externalId: generateExternalId(context, callRobotPresetAction),
		actionId: AdlibActionType.CALL_ROBOT_PRESET,
		userData: callRobotPresetAction,
		userDataManifest: {},
		display: {
			_rank: 400,
			label: t(`Call Robot preset`),
			sourceLayerId: SourceLayer.RobotCamera,
			outputLayerId: SharedOutputLayers.SEC,
			tags: []
		}
	}
}

function getBaseline(
	context: ExtendedShowStyleContext<GalleryBlueprintConfig>,
	videoSwitcher: VideoSwitcher
): BlueprintResultBaseline {
	const jingleDSK = FindDSKJingle(context.config)

	return {
		timelineObjects: [
			...CreateGraphicBaseline(context.config),
			// Default timeline
			videoSwitcher.getMixEffectTimelineObject({
				enable: { while: '1' },
				layer: SwitcherMixEffectLLayer.Program,
				content: {
					input: context.config.studio.SwitcherSource.Default,
					transition: TransitionStyle.CUT
				}
			}),
			videoSwitcher.getMixEffectTimelineObject({
				enable: { while: '1' },
				layer: SwitcherMixEffectLLayer.Clean,
				content: {
					input: context.config.studio.SwitcherSource.Default,
					transition: TransitionStyle.CUT
				}
			}),

			// route default outputs
			videoSwitcher.getAuxTimelineObject({
				enable: { while: '1' },
				layer: SwitcherAuxLLayer.AuxProgram,
				content: {
					input: SpecialInput.ME1_PROGRAM
				}
			}),
			videoSwitcher.getAuxTimelineObject({
				id: '',
				enable: { while: '1' },
				layer: SwitcherAuxLLayer.AuxClean,
				content: {
					input: SpecialInput.ME4_PROGRAM
				}
			}),
			videoSwitcher.getAuxTimelineObject({
				enable: { while: '1' },
				layer: SwitcherAuxLLayer.AuxLookahead,
				content: {
					input: context.config.studio.SwitcherSource.Default
				}
			}),
			videoSwitcher.getAuxTimelineObject({
				enable: { while: '1' },
				layer: SwitcherAuxLLayer.AuxDve,
				content: {
					input: SpecialInput.DVE
				}
			}),
			videoSwitcher.getAuxTimelineObject({
				id: '',
				enable: { while: '1' },
				priority: 0,
				layer: SwitcherAuxLLayer.AuxVideoMixMinus,
				content: {
					input: context.config.studio.SwitcherSource.MixMinusDefault
				}
			}),

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
			...CreateDSKBaseline(context.config, videoSwitcher),

			// ties the DSK for jingles to ME4 USK1 to have effects on CLEAN (ME4)
			videoSwitcher.getMixEffectTimelineObject({
				enable: { while: '1' },
				layer: SwitcherMixEffectLLayer.CleanUSKEffect,
				content: {
					keyers: [
						{
							onAir: false,
							config: jingleDSK
						}
					]
				}
			}),
			literal<TSR.TimelineObjAtemSsrcProps>({
				id: '',
				enable: { while: '1' },
				priority: 0,
				layer: SwitcherDveLLayer.Dve,
				content: {
					deviceType: TSR.DeviceType.ATEM,
					type: TSR.TimelineContentTypeAtem.SSRCPROPS,
					ssrcProps: {
						artFillSource: context.config.studio.SwitcherSource.SplitArtF,
						artCutSource: context.config.studio.SwitcherSource.SplitArtK,
						artOption: 1,
						artPreMultiplied: true
					}
				}
			}),
			literal<TSR.TimelineObjAtemSsrc>({
				id: '',
				enable: { while: '1' },
				priority: 0,
				layer: SwitcherDveLLayer.DveBoxes,
				content: {
					deviceType: TSR.DeviceType.ATEM,
					type: TSR.TimelineContentTypeAtem.SSRC,
					ssrc: {
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
						]
					}
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
			literal<TSR.TimelineObjCCGMedia>({
				id: '',
				enable: { while: '1' },
				priority: 0,
				layer: CasparLLayer.CasparCGDVELoop,
				content: {
					deviceType: TSR.DeviceType.CASPARCG,
					type: TSR.TimelineContentTypeCasparCg.MEDIA,
					file: 'empty',
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
					channels: Object.keys(sisyfosChannels).map(key => {
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
				? [...context.config.mediaPlayers.map(mp => CasparPlayerClipLoadingLoop(mp.id))].map(layer => {
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
		]
	}
}
