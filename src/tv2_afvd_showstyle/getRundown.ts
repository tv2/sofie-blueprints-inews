import {
	BlueprintResultBaseline,
	BlueprintResultRundown,
	GraphicsContent,
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	ICommonContext,
	IngestRundown,
	IShowStyleUserContext,
	IStudioUserContext,
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
	t
} from 'tv2-common'
import {
	AdlibActionType,
	AdlibTagCutToBox,
	AdlibTags,
	CONSTANTS,
	SharedGraphicLLayer,
	SharedOutputLayers,
	SourceType,
	TallyTags
} from 'tv2-constants'
import * as _ from 'underscore'
import { AtemLLayer, CasparLLayer, SisyfosLLAyer } from '../tv2_afvd_studio/layers'
import { SisyfosChannel, sisyfosChannels } from '../tv2_afvd_studio/sisyfosChannels'
import { AtemSourceIndex } from '../types/atem'
import { BlueprintConfig, getConfig as getShowStyleConfig } from './helpers/config'
import { NUMBER_OF_DVE_BOXES } from './helpers/content/dve'
import { SourceLayer } from './layers'
import { postProcessPieceTimelineObjects } from './postProcessTimelineObjects'

export function getRundown(context: IShowStyleUserContext, ingestRundown: IngestRundown): BlueprintResultRundown {
	const config = getShowStyleConfig(context)

	return {
		rundown: {
			externalId: ingestRundown.externalId,
			name: ingestRundown.name,
			timing: {
				type: PlaylistTimingType.None
			}
		},
		globalAdLibPieces: getGlobalAdLibPiecesAFVD(context, config),
		globalActions: getGlobalAdlibActionsAFVD(context, config),
		baseline: getBaseline(config)
	}
}

function getGlobalAdLibPiecesAFVD(context: IStudioUserContext, config: BlueprintConfig): IBlueprintAdLibPiece[] {
	function makeEVSAdLibs(info: SourceInfo, rank: number, vo: boolean): Array<IBlueprintAdLibPiece<PieceMetaData>> {
		const res: Array<IBlueprintAdLibPiece<PieceMetaData>> = []
		res.push({
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
					literal<TSR.TimelineObjAtemME>({
						id: '',
						enable: { while: '1' },
						priority: 1,
						layer: AtemLLayer.AtemMEProgram,
						content: {
							deviceType: TSR.DeviceType.ATEM,
							type: TSR.TimelineContentTypeAtem.ME,
							me: {
								input: info.port,
								transition: TSR.AtemTransitionStyle.CUT
							}
						}
					}),
					...GetSisyfosTimelineObjForReplay(config, info, vo)
				]
			}
		})
		return res
	}

	function makeRemoteAdLibs(info: SourceInfo, rank: number): Array<IBlueprintAdLibPiece<PieceMetaData>> {
		const res: Array<IBlueprintAdLibPiece<PieceMetaData>> = []
		const eksternSisyfos = GetSisyfosTimelineObjForRemote(config, info)
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
					literal<TSR.TimelineObjAtemME>({
						id: '',
						enable: { while: '1' },
						priority: 1,
						layer: AtemLLayer.AtemMEProgram,
						content: {
							deviceType: TSR.DeviceType.ATEM,
							type: TSR.TimelineContentTypeAtem.ME,
							me: {
								input: info.port,
								transition: TSR.AtemTransitionStyle.CUT
							}
						}
					}),
					...eksternSisyfos
				]
			}
		})

		return res
	}

	// aux adlibs
	function makeRemoteAuxStudioAdLibs(info: SourceInfo, rank: number): Array<IBlueprintAdLibPiece<PieceMetaData>> {
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
					literal<TSR.TimelineObjAtemAUX>({
						id: '',
						enable: { while: '1' },
						priority: 1,
						layer: AtemLLayer.AtemAuxAR,
						content: {
							deviceType: TSR.DeviceType.ATEM,
							type: TSR.TimelineContentTypeAtem.AUX,
							aux: {
								input: info.port
							}
						}
					})
				]
			}
		})

		return res
	}

	const adlibItems: IBlueprintAdLibPiece[] = []

	let globalRank = 1000

	config.sources.lives
		.slice(0, 10) // the first x lives to create live-adlibs from
		.forEach(o => {
			adlibItems.push(...makeRemoteAdLibs(o, globalRank++))
		})

	config.sources.lives
		.slice(0, 10) // the first x lives to create AUX1 (studio) adlibs
		.forEach(o => {
			adlibItems.push(...makeRemoteAuxStudioAdLibs(o, globalRank++))
		})

	config.sources.replays.forEach(o => {
		if (!/EPSIO/i.test(o.id)) {
			adlibItems.push(...makeEVSAdLibs(o, globalRank++, false))
		}
		adlibItems.push(...makeEVSAdLibs(o, globalRank++, true))
		adlibItems.push({
			externalId: 'delayedaux',
			name: `EVS in studio aux`,
			_rank: globalRank++,
			sourceLayerId: SourceLayer.AuxStudioScreen,
			outputLayerId: SharedOutputLayers.AUX,
			expectedDuration: 0,
			lifespan: PieceLifespan.OutOnShowStyleEnd,
			tags: [AdlibTags.ADLIB_TO_STUDIO_SCREEN_AUX],
			content: {
				timelineObjects: [
					literal<TSR.TimelineObjAtemAUX>({
						id: '',
						enable: { while: '1' },
						priority: 1,
						layer: AtemLLayer.AtemAuxAR,
						content: {
							deviceType: TSR.DeviceType.ATEM,
							type: TSR.TimelineContentTypeAtem.AUX,
							aux: {
								input: o.port
							}
						}
					})
				]
			}
		})
		adlibItems.push({
			externalId: 'delayedaux',
			name: `EVS in viz aux`,
			_rank: globalRank++,
			sourceLayerId: SourceLayer.VizFullIn1,
			outputLayerId: SharedOutputLayers.AUX,
			expectedDuration: 0,
			lifespan: PieceLifespan.OutOnShowStyleEnd,
			tags: [AdlibTags.ADLIB_TO_GRAPHICS_ENGINE_AUX],
			content: {
				timelineObjects: [
					literal<TSR.TimelineObjAtemAUX>({
						id: '',
						enable: { while: '1' },
						priority: 1,
						layer: AtemLLayer.AtemAuxVizOvlIn1,
						content: {
							deviceType: TSR.DeviceType.ATEM,
							type: TSR.TimelineContentTypeAtem.AUX,
							aux: {
								input: o.port
							}
						}
					})
				]
			}
		})
	})

	// the rank (order) of adlibs on SourceLayer.PgmAdlibVizCmd is important, to ensure keyboard shortcuts
	adlibItems.push({
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
	})
	// the rank (order) of adlibs on SourceLayer.PgmAdlibVizCmd is important, to ensure keyboard shortcuts
	adlibItems.push({
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
	})

	// the rank (order) of adlibs on SourceLayer.PgmAdlibVizCmd is important, to ensure keyboard shortcuts
	adlibItems.push(...CreateDSKBaselineAdlibs(config, 500))

	adlibItems.push({
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
						channels: config.studio.StudioMics.map(layer => ({
							mappedLayer: layer,
							isPgm: 1
						})),
						overridePriority: 10
					}
				})
			]
		}
	})

	adlibItems.push({
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
						channels: config.studio.StudioMics.map(layer => ({
							mappedLayer: layer,
							isPgm: 0
						})),
						overridePriority: 10
					}
				})
			]
		}
	})

	adlibItems.push({
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
	})

	// viz styles and dve backgrounds
	function makeDesignAdLib(): IBlueprintAdLibPiece {
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
		if (config.studio.GraphicsType === 'VIZ') {
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
						showId: config.selectedGraphicsSetup.OvlShowName
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
	adlibItems.push(makeDesignAdLib())

	adlibItems.push({
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
	})

	adlibItems.forEach(p => postProcessPieceTimelineObjects(context, config, p, true))
	return adlibItems
}

function getGlobalAdlibActionsAFVD(_context: IStudioUserContext, config: BlueprintConfig): IBlueprintActionManifest[] {
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
				externalId: generateExternalId(_context, userData),
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
				externalId: generateExternalId(_context, userData),
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
				externalId: generateExternalId(_context, userData),
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
			externalId: generateExternalId(_context, userData),
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
			externalId: generateExternalId(_context, userData),
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
			externalId: generateExternalId(_context, userData),
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
			externalId: generateExternalId(_context, userData),
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
		externalId: generateExternalId(_context, recallLastLiveDveUserData),
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
			externalId: generateExternalId(_context, userData),
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
		externalId: generateExternalId(_context, fadeDownPersistedAudioLevelsUserData),
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

	blueprintActions.push(createRobotPresetAction(_context))

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

function getBaseline(config: BlueprintConfig): BlueprintResultBaseline {
	const jingleDSK = FindDSKJingle(config)

	return {
		timelineObjects: [
			...CreateGraphicBaseline(config),
			// Default timeline
			literal<TSR.TimelineObjAtemME>({
				id: '',
				enable: { while: '1' },
				priority: 0,
				layer: AtemLLayer.AtemMEProgram,
				content: {
					deviceType: TSR.DeviceType.ATEM,
					type: TSR.TimelineContentTypeAtem.ME,
					me: {
						input: config.studio.AtemSource.Default,
						transition: TSR.AtemTransitionStyle.CUT
					}
				}
			}),
			literal<TSR.TimelineObjAtemME>({
				id: '',
				enable: { while: '1' },
				priority: 0,
				layer: AtemLLayer.AtemMEClean,
				content: {
					deviceType: TSR.DeviceType.ATEM,
					type: TSR.TimelineContentTypeAtem.ME,
					me: {
						input: config.studio.AtemSource.Default,
						transition: TSR.AtemTransitionStyle.CUT
					}
				}
			}),

			// route default outputs
			literal<TSR.TimelineObjAtemAUX>({
				id: '',
				enable: { while: '1' },
				priority: 0,
				layer: AtemLLayer.AtemAuxPGM,
				content: {
					deviceType: TSR.DeviceType.ATEM,
					type: TSR.TimelineContentTypeAtem.AUX,
					aux: {
						input: AtemSourceIndex.Prg1
					}
				}
			}),
			literal<TSR.TimelineObjAtemAUX>({
				id: '',
				enable: { while: '1' },
				priority: 0,
				layer: AtemLLayer.AtemAuxClean,
				content: {
					deviceType: TSR.DeviceType.ATEM,
					type: TSR.TimelineContentTypeAtem.AUX,
					aux: {
						input: AtemSourceIndex.Prg4
					}
				}
			}),
			literal<TSR.TimelineObjAtemAUX>({
				id: '',
				enable: { while: '1' },
				priority: 0,
				layer: AtemLLayer.AtemAuxLookahead,
				content: {
					deviceType: TSR.DeviceType.ATEM,
					type: TSR.TimelineContentTypeAtem.AUX,
					aux: {
						input: config.studio.AtemSource.Default
					}
				}
			}),
			literal<TSR.TimelineObjAtemAUX>({
				id: '',
				enable: { while: '1' },
				priority: 0,
				layer: AtemLLayer.AtemAuxSSrc,
				content: {
					deviceType: TSR.DeviceType.ATEM,
					type: TSR.TimelineContentTypeAtem.AUX,
					aux: {
						input: AtemSourceIndex.SSrc
					}
				}
			}),
			literal<TSR.TimelineObjAtemAUX>({
				id: '',
				enable: { while: '1' },
				priority: 0,
				layer: AtemLLayer.AtemAuxVideoMixMinus,
				content: {
					deviceType: TSR.DeviceType.ATEM,
					type: TSR.TimelineContentTypeAtem.AUX,
					aux: {
						input: config.studio.AtemSource.MixMinusDefault
					}
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
					url: config.studio.SofieHostURL + '/countdowns/studio0/presenter'
				}
			}),

			// keyers
			...CreateDSKBaseline(config),

			// ties the DSK for jingles to ME4 USK1 to have effects on CLEAN (ME4)
			literal<TSR.TimelineObjAtemME>({
				id: '',
				enable: { while: '1' },
				priority: 0,
				layer: AtemLLayer.AtemCleanUSKEffect,
				content: {
					deviceType: TSR.DeviceType.ATEM,
					type: TSR.TimelineContentTypeAtem.ME,
					me: {
						upstreamKeyers: [
							{
								upstreamKeyerId: 0,
								onAir: false,
								mixEffectKeyType: 0,
								flyEnabled: false,
								fillSource: jingleDSK.Fill,
								cutSource: jingleDSK.Key,
								maskEnabled: false,
								lumaSettings: {
									preMultiplied: false,
									clip: Number(jingleDSK.Clip) * 10, // input is percents (0-100), atem uses 1-000
									gain: Number(jingleDSK.Gain) * 10 // input is percents (0-100), atem uses 1-000
								}
							}
						]
					}
				}
			}),
			literal<TSR.TimelineObjAtemSsrcProps>({
				id: '',
				enable: { while: '1' },
				priority: 0,
				layer: AtemLLayer.AtemSSrcArt,
				content: {
					deviceType: TSR.DeviceType.ATEM,
					type: TSR.TimelineContentTypeAtem.SSRCPROPS,
					ssrcProps: {
						artFillSource: config.studio.AtemSource.SplitArtF,
						artCutSource: config.studio.AtemSource.SplitArtK,
						artOption: 1,
						artPreMultiplied: true
					}
				}
			}),
			literal<TSR.TimelineObjAtemSsrc>({
				id: '',
				enable: { while: '1' },
				priority: 0,
				layer: AtemLLayer.AtemSSrcDefault,
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

			...(config.studio.GraphicsType === 'HTML'
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

			...(config.showStyle.CasparCGLoadingClip && config.showStyle.CasparCGLoadingClip.length
				? [...config.mediaPlayers.map(mp => CasparPlayerClipLoadingLoop(mp.id))].map(layer => {
						return literal<TSR.TimelineObjCCGMedia>({
							id: '',
							enable: { while: '1' },
							priority: 0,
							layer,
							content: {
								deviceType: TSR.DeviceType.CASPARCG,
								type: TSR.TimelineContentTypeCasparCg.MEDIA,
								file: config.showStyle.CasparCGLoadingClip,
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
					concept: config.selectedGraphicsSetup.VcpConcept
				}
			})
		]
	}
}
