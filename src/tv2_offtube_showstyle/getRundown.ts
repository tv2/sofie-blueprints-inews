import {
	BlueprintResultBaseline,
	BlueprintResultRundown,
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintRundown,
	IngestRundown,
	IShowStyleUserContext,
	IStudioUserContext,
	PieceLifespan,
	PlaylistTimingType,
	TSR
} from 'blueprints-integration'
import {
	ActionClearGraphics,
	ActionCommentatorSelectDVE,
	ActionCommentatorSelectFull,
	ActionCommentatorSelectJingle,
	ActionCommentatorSelectServer,
	ActionCutSourceToBox,
	ActionCutToCamera,
	ActionCutToRemote,
	ActionRecallLastDVE,
	ActionRecallLastLive,
	ActionSelectDVELayout,
	CasparPlayerClipLoadingLoop,
	createDskBaseline,
	CreateDSKBaselineAdlibs,
	CreateLYDBaseline,
	generateExternalId,
	getGraphicBaseline,
	GetTagForKam,
	GetTagForLive,
	GetTransitionAdLibActions,
	literal,
	ShowStyleContext,
	ShowStyleContextImpl,
	SourceDefinitionKam,
	SourceDefinitionRemote,
	SourceInfo,
	SourceInfoToSourceDefinition,
	SourceInfoType,
	t,
	TimeFromINewsField,
	TransitionStyle
} from 'tv2-common'
import {
	AdlibActionType,
	AdlibTagCutToBox,
	AdlibTags,
	CONSTANTS,
	SharedOutputLayer,
	SharedSisyfosLLayer,
	SharedSourceLayer,
	SourceType,
	SwitcherAuxLLayer,
	TallyTags
} from 'tv2-constants'
import * as _ from 'underscore'
import { OfftubeBlueprintConfig } from '../tv2_offtube_showstyle/helpers/config'
import { OfftubeCasparLLayer, OfftubeSisyfosLLayer } from '../tv2_offtube_studio/layers'
import { SisyfosChannel, sisyfosChannels } from '../tv2_offtube_studio/sisyfosChannels'
import { QBOX_UNIFORM_CONFIG } from '../tv2_offtube_studio/uniformConfig'
import { NUMBER_OF_DVE_BOXES } from './content/OfftubeDVEContent'
import { OfftubeOutputLayers, OfftubeSourceLayer } from './layers'

export function getRundown(coreContext: IShowStyleUserContext, ingestRundown: IngestRundown): BlueprintResultRundown {
	const context = new ShowStyleContextImpl<OfftubeBlueprintConfig>(coreContext, QBOX_UNIFORM_CONFIG)

	let startTime: number = 0
	let endTime: number = 0

	// Set start / end times
	if ('payload' in ingestRundown) {
		if (ingestRundown.payload.expectedStart) {
			startTime = TimeFromINewsField(ingestRundown.payload.expectedStart)
		}

		if (ingestRundown.payload.expectedEnd) {
			endTime = TimeFromINewsField(ingestRundown.payload.expectedEnd)
		}
	}

	// Can't end before we begin
	if (endTime < startTime) {
		endTime = startTime
	}

	return {
		rundown: literal<IBlueprintRundown>({
			externalId: ingestRundown.externalId,
			name: ingestRundown.name,
			timing: {
				type: PlaylistTimingType.BackTime,
				expectedStart: startTime,
				expectedDuration: endTime - startTime,
				expectedEnd: endTime
			}
		}),
		globalAdLibPieces: getGlobalAdLibPiecesOfftube(context),
		globalActions: getGlobalAdlibActionsOfftube(context.core, context.config),
		baseline: getBaseline(context)
	}
}

function getGlobalAdLibPiecesOfftube(context: ShowStyleContext<OfftubeBlueprintConfig>): IBlueprintAdLibPiece[] {
	const adlibItems: IBlueprintAdLibPiece[] = []

	adlibItems.push(...CreateDSKBaselineAdlibs(context.config, 500, context.videoSwitcher))

	adlibItems.push({
		externalId: 'micUp',
		name: 'Mics Up',
		_rank: 600,
		sourceLayerId: SharedSourceLayer.PgmSisyfosAdlibs,
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
					layer: OfftubeSisyfosLLayer.SisyfosGroupStudioMics,
					content: {
						deviceType: TSR.DeviceType.SISYFOS,
						type: TSR.TimelineContentTypeSisyfos.CHANNELS,
						channels: context.config.studio.StudioMics.map((layer) => ({
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
		sourceLayerId: SharedSourceLayer.PgmSisyfosAdlibs,
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
					layer: OfftubeSisyfosLLayer.SisyfosGroupStudioMics,
					content: {
						deviceType: TSR.DeviceType.SISYFOS,
						type: TSR.TimelineContentTypeSisyfos.CHANNELS,
						channels: context.config.studio.StudioMics.map((layer) => ({
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
		sourceLayerId: SharedSourceLayer.PgmSisyfosAdlibs,
		outputLayerId: SharedOutputLayer.SEC,
		lifespan: PieceLifespan.WithinPart,
		tags: [AdlibTags.ADLIB_STATIC_BUTTON, AdlibTags.ADLIBS_RESYNC_SISYFOS],
		expectedDuration: 1000,
		content: {
			timelineObjects: _.compact<TSR.TSRTimelineObj[]>([
				literal<TSR.TimelineObjSisyfosChannel>({
					id: '',
					enable: { start: 0 },
					priority: 2,
					layer: SharedSisyfosLLayer.SisyfosResync,
					content: {
						deviceType: TSR.DeviceType.SISYFOS,
						type: TSR.TimelineContentTypeSisyfos.CHANNEL,
						resync: true
					}
				})
			])
		}
	})

	adlibItems.push({
		externalId: 'stopAudioBed',
		name: 'Stop Soundplayer',
		_rank: 700,
		sourceLayerId: SharedSourceLayer.PgmAudioBed,
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
					layer: SharedSisyfosLLayer.SisyfosSourceAudiobed,
					content: {
						deviceType: TSR.DeviceType.ABSTRACT,
						type: 'empty'
					},
					classes: []
				})
			]
		}
	})

	return adlibItems
}

function getGlobalAdlibActionsOfftube(
	context: IStudioUserContext,
	config: OfftubeBlueprintConfig
): IBlueprintActionManifest[] {
	const blueprintActions: IBlueprintActionManifest[] = []

	let globalRank = 2000

	function makeCutDirectlyCameraAction(cameraSourceInfo: SourceInfo, rank: number): IBlueprintActionManifest {
		return makeCutCameraAction(cameraSourceInfo, true, rank)
	}

	function makeQueueAsNextCameraAction(cameraSourceInfo: SourceInfo, rank: number): IBlueprintActionManifest {
		return makeCutCameraAction(cameraSourceInfo, false, rank)
	}

	function makeCutCameraAction(
		cameraSourceInfo: SourceInfo,
		cutDirectly: boolean,
		rank: number
	): IBlueprintActionManifest {
		const sourceDefinition = SourceInfoToSourceDefinition(cameraSourceInfo) as SourceDefinitionKam
		const userData: ActionCutToCamera = {
			type: AdlibActionType.CUT_TO_CAMERA,
			cutDirectly,
			sourceDefinition
		}
		return {
			externalId: generateExternalId(context, userData),
			actionId: AdlibActionType.CUT_TO_CAMERA,
			userData,
			userDataManifest: {},
			display: {
				_rank: rank,
				label: t(sourceDefinition.name),
				sourceLayerId: OfftubeSourceLayer.PgmCam,
				outputLayerId: SharedOutputLayer.PGM,
				content: {},
				tags: cutDirectly ? [AdlibTags.ADLIB_CUT_DIRECT] : [AdlibTags.OFFTUBE_SET_CAM_NEXT, AdlibTags.ADLIB_QUEUE_NEXT],
				currentPieceTags: [GetTagForKam(sourceDefinition)],
				nextPieceTags: [GetTagForKam(sourceDefinition)]
			}
		}
	}

	function makeRemoteAction(sourceInfo: SourceInfo, rank: number) {
		const sourceDefinition = SourceInfoToSourceDefinition(sourceInfo) as SourceDefinitionRemote
		const userData: ActionCutToRemote = {
			type: AdlibActionType.CUT_TO_REMOTE,
			cutDirectly: false,
			sourceDefinition
		}
		blueprintActions.push({
			externalId: generateExternalId(context, userData),
			actionId: AdlibActionType.CUT_TO_REMOTE,
			userData,
			userDataManifest: {},
			display: {
				_rank: rank,
				label: t(`${sourceDefinition.name}`),
				sourceLayerId: OfftubeSourceLayer.PgmLive,
				outputLayerId: OfftubeOutputLayers.PGM,
				content: {},
				tags: [AdlibTags.OFFTUBE_SET_REMOTE_NEXT, AdlibTags.ADLIB_QUEUE_NEXT],
				currentPieceTags: [GetTagForLive(sourceDefinition)],
				nextPieceTags: [GetTagForLive(sourceDefinition)]
			}
		})
	}

	function makeAdlibBoxesActions(
		info: SourceInfo,
		type: SourceInfoType.KAM | SourceInfoType.LIVE | SourceInfoType.FEED,
		rank: number
	) {
		for (let box = 0; box < NUMBER_OF_DVE_BOXES; box++) {
			const sourceDefinition = SourceInfoToSourceDefinition(info)
			const layer = type === SourceInfoType.KAM ? OfftubeSourceLayer.PgmCam : OfftubeSourceLayer.PgmLive
			const userData: ActionCutSourceToBox = {
				type: AdlibActionType.CUT_SOURCE_TO_BOX,
				name: sourceDefinition.name,
				box,
				sourceDefinition
			}
			blueprintActions.push({
				externalId: generateExternalId(context, userData),
				actionId: AdlibActionType.CUT_SOURCE_TO_BOX,
				userData,
				userDataManifest: {},
				display: {
					_rank: rank + 0.1 * box,
					label: t(`${sourceDefinition.name} inp ${box + 1}`),
					sourceLayerId: layer,
					outputLayerId: OfftubeOutputLayers.PGM,
					content: {},
					tags: [AdlibTagCutToBox(box)]
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
					sourceLayerId: OfftubeSourceLayer.PgmServer,
					outputLayerId: SharedOutputLayer.SEC,
					content: {},
					tags: [AdlibTagCutToBox(box)]
				}
			})
		}
	}

	function makeCommentatorSelectServerAction(): IBlueprintActionManifest {
		const userData: ActionCommentatorSelectServer = {
			type: AdlibActionType.COMMENTATOR_SELECT_SERVER
		}
		return {
			externalId: generateExternalId(context, userData),
			actionId: AdlibActionType.COMMENTATOR_SELECT_SERVER,
			userData,
			userDataManifest: {},
			display: {
				_rank: globalRank++,
				label: t('Server'),
				sourceLayerId: OfftubeSourceLayer.PgmServer,
				outputLayerId: OfftubeOutputLayers.PGM,
				content: {},
				tags: [AdlibTags.OFFTUBE_SET_SERVER_NEXT],
				currentPieceTags: [TallyTags.SERVER_IS_LIVE],
				nextPieceTags: [TallyTags.SERVER_IS_LIVE]
			}
		}
	}

	blueprintActions.push(makeCommentatorSelectServerAction())

	function makeCommentatorSelectDveAction(): IBlueprintActionManifest {
		const userData: ActionCommentatorSelectDVE = {
			type: AdlibActionType.COMMENTATOR_SELECT_DVE
		}
		return {
			externalId: generateExternalId(context, userData),
			actionId: AdlibActionType.COMMENTATOR_SELECT_DVE,
			userData,
			userDataManifest: {},
			display: {
				_rank: globalRank++,
				label: t('DVE'),
				sourceLayerId: OfftubeSourceLayer.PgmDVE,
				outputLayerId: OfftubeOutputLayers.PGM,
				content: {},
				tags: [AdlibTags.OFFTUBE_SET_DVE_NEXT],
				currentPieceTags: [TallyTags.DVE_IS_LIVE],
				nextPieceTags: [TallyTags.DVE_IS_LIVE]
			}
		}
	}

	blueprintActions.push(makeCommentatorSelectDveAction())

	function makeCommentatorSelectFullAction(): IBlueprintActionManifest {
		const userData: ActionCommentatorSelectFull = {
			type: AdlibActionType.COMMENTATOR_SELECT_FULL
		}
		return {
			externalId: generateExternalId(context, userData),
			actionId: AdlibActionType.COMMENTATOR_SELECT_FULL,
			userData,
			userDataManifest: {},
			display: {
				_rank: globalRank++,
				label: t('GFX FULL'),
				sourceLayerId: SharedSourceLayer.PgmPilot,
				outputLayerId: OfftubeOutputLayers.PGM,
				content: {},
				tags: [AdlibTags.OFFTUBE_SET_FULL_NEXT],
				currentPieceTags: [TallyTags.FULL_IS_LIVE],
				nextPieceTags: [TallyTags.FULL_IS_LIVE]
			}
		}
	}

	blueprintActions.push(makeCommentatorSelectFullAction())

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
				sourceLayerId: SharedSourceLayer.PgmAdlibGraphicCmd,
				outputLayerId: SharedOutputLayer.SEC,
				content: {},
				tags: [AdlibTags.ADLIB_STATIC_BUTTON, AdlibTags.ADLIB_GFX_ALTUD],
				currentPieceTags: [TallyTags.GFX_ALTUD],
				nextPieceTags: [TallyTags.GFX_ALTUD]
			}
		}
	}

	blueprintActions.push(makeClearGraphicsAltudAction())

	blueprintActions.push(...GetTransitionAdLibActions(config, 800))

	function makeRecallLastDveAction(): IBlueprintActionManifest {
		const userData: ActionRecallLastDVE = {
			type: AdlibActionType.RECALL_LAST_DVE
		}
		return {
			externalId: generateExternalId(context, userData),
			actionId: AdlibActionType.RECALL_LAST_DVE,
			userData,
			userDataManifest: {},
			display: {
				_rank: 1,
				label: t('Last DVE'),
				sourceLayerId: OfftubeSourceLayer.PgmDVEAdLib,
				outputLayerId: 'pgm',
				tags: [AdlibTags.ADLIB_RECALL_LAST_DVE]
			}
		}
	}

	blueprintActions.push(makeRecallLastDveAction())

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
				sourceLayerId: OfftubeSourceLayer.PgmDVEAdLib,
				outputLayerId: SharedOutputLayer.PGM,
				tags: [AdlibTags.ADLIB_SELECT_DVE_LAYOUT, dveConfig.DVEName]
			}
		})
	})

	config.sources.cameras
		.slice(0, 5) // the first x cameras to create INP1/2/3 cam-adlibs from
		.forEach((cameraSourceInfo) => {
			blueprintActions.push(makeCutDirectlyCameraAction(cameraSourceInfo, globalRank++))
			blueprintActions.push(makeQueueAsNextCameraAction(cameraSourceInfo, globalRank++))
		})

	config.sources.cameras
		.slice(0, 5) // the first x cameras to create preview cam-adlibs from
		.forEach((o) => {
			makeAdlibBoxesActions(o, SourceInfoType.KAM, globalRank++)
		})

	function makeRecallLastLiveAction(): IBlueprintActionManifest {
		const userData: ActionRecallLastLive = {
			type: AdlibActionType.RECALL_LAST_LIVE
		}
		return {
			externalId: generateExternalId(context, userData),
			actionId: AdlibActionType.RECALL_LAST_LIVE,
			userData,
			userDataManifest: {},
			display: {
				_rank: 1,
				label: t('Last Live'),
				sourceLayerId: OfftubeSourceLayer.PgmLive,
				outputLayerId: SharedOutputLayer.PGM,
				tags: [AdlibTags.ADLIB_RECALL_LAST_LIVE]
			}
		}
	}

	blueprintActions.push(makeRecallLastLiveAction())

	config.sources.feeds
		.slice(0, 10) // the first x sources to create feed-adlibs from
		.forEach((o) => {
			makeRemoteAction(o, globalRank++)
		})

	config.sources.lives
		.slice(0, 10) // the first x sources to create live-adlibs from
		.forEach((o) => {
			makeRemoteAction(o, globalRank++)
		})

	config.sources.feeds
		.slice(0, 10) // the first x remote to create INP1/2/3 feed-adlibs from
		.forEach((o) => {
			makeAdlibBoxesActions(o, SourceInfoType.FEED, globalRank++)
		})

	config.sources.lives
		.slice(0, 10) // the first x remote to create INP1/2/3 live-adlibs from
		.forEach((o) => {
			makeAdlibBoxesActions(o, SourceInfoType.LIVE, globalRank++)
		})

	makeServerAdlibBoxesActions(globalRank++)

	function makeCommentatorSelectJingleAction(): IBlueprintActionManifest {
		const userData: ActionCommentatorSelectJingle = {
			type: AdlibActionType.COMMENTATOR_SELECT_JINGLE
		}
		return {
			externalId: generateExternalId(context, userData),
			actionId: AdlibActionType.COMMENTATOR_SELECT_JINGLE,
			userData,
			userDataManifest: {},
			display: {
				_rank: globalRank++,
				label: t('JINGLE'),
				sourceLayerId: OfftubeSourceLayer.PgmJingle,
				outputLayerId: OfftubeOutputLayers.PGM,
				content: {},
				tags: [AdlibTags.OFFTUBE_SET_JINGLE_NEXT],
				currentPieceTags: [TallyTags.JINGLE_IS_LIVE],
				nextPieceTags: [TallyTags.JINGLE_IS_LIVE]
			}
		}
	}

	blueprintActions.push(makeCommentatorSelectJingleAction())

	return blueprintActions
}

function getBaseline(context: ShowStyleContext<OfftubeBlueprintConfig>): BlueprintResultBaseline {
	return {
		timelineObjects: _.compact([
			...getGraphicBaseline(context.config),
			// Default timeline
			context.videoSwitcher.getMixEffectTimelineObject({
				layer: context.uniformConfig.mixEffects.program.mixEffectLayer,
				enable: { while: '1' },
				content: {
					input: context.config.studio.SwitcherSource.Default,
					transition: TransitionStyle.CUT
				}
			}),
			context.uniformConfig.switcherLLayers.nextPreviewMixEffect
				? context.videoSwitcher.getMixEffectTimelineObject({
						enable: { while: '1' },
						layer: context.uniformConfig.switcherLLayers.nextPreviewMixEffect,
						content: {
							previewInput: context.config.studio.SwitcherSource.Default
						}
				  })
				: undefined,

			// route default outputs
			context.uniformConfig.mixEffects.clean.auxLayer
				? context.videoSwitcher.getAuxTimelineObject({
						enable: { while: '1' },
						layer: context.uniformConfig.mixEffects.clean.auxLayer,
						content: {
							input: context.uniformConfig.mixEffects.clean.input
						}
				  })
				: undefined,
			context.videoSwitcher.getAuxTimelineObject({
				enable: { while: '1' },
				layer: SwitcherAuxLLayer.SCREEN,
				content: {
					input: context.config.studio.SwitcherSource.Loop
				}
			}),
			literal<TSR.TimelineObjCCGRoute>({
				id: '',
				enable: { while: 1 },
				priority: 0,
				layer: OfftubeCasparLLayer.CasparCGDVEKeyedLoop,
				content: {
					deviceType: TSR.DeviceType.CASPARCG,
					type: TSR.TimelineContentTypeCasparCg.ROUTE,
					mappedLayer: OfftubeCasparLLayer.CasparCGDVELoop
				}
			}),

			// keyers
			...createDskBaseline(context.config, context.videoSwitcher),
			...context.videoSwitcher.getDveTimelineObjects({
				enable: { while: '1' },
				content: {
					boxes: [
						{
							// left
							enabled: true,
							source: context.config.studio.SwitcherSource.SplitBackground,
							size: 1000,
							x: 0,
							y: 0,
							cropped: false
						},
						{
							// right
							enabled: false
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
				layer: OfftubeCasparLLayer.CasparCGDVEFrame,
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
				layer: OfftubeCasparLLayer.CasparCGDVEKey,
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
				layer: OfftubeCasparLLayer.CasparCGDVELoop,
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

			literal<TSR.TimelineObjCasparCGAny>({
				id: '',
				enable: { while: 1 },
				priority: 1,
				layer: OfftubeCasparLLayer.CasparGraphicsFullLoop,
				content: {
					deviceType: TSR.DeviceType.CASPARCG,
					type: TSR.TimelineContentTypeCasparCg.ROUTE,
					mappedLayer: OfftubeCasparLLayer.CasparCGDVELoop
				}
			}),

			// create sisyfos channels from the config
			literal<TSR.TimelineObjSisyfosChannels>({
				id: '',
				enable: { while: '1' },
				priority: 0,
				layer: OfftubeSisyfosLLayer.SisyfosConfig,
				content: {
					deviceType: TSR.DeviceType.SISYFOS,
					type: TSR.TimelineContentTypeSisyfos.CHANNELS,
					channels: Object.keys(sisyfosChannels).map((key) => {
						const llayer = key as OfftubeSisyfosLLayer
						const channel = sisyfosChannels[llayer] as SisyfosChannel
						return literal<TSR.TimelineObjSisyfosChannels['content']['channels'][0]>({
							mappedLayer: llayer,
							isPgm: channel.isPgm,
							visible: true
						})
					}),
					overridePriority: 0
				}
			}),

			// Route ME 2 PGM to ME 1 PGM
			context.videoSwitcher.getMixEffectTimelineObject({
				enable: { while: '1' },
				layer: context.uniformConfig.mixEffects.program.mixEffectLayer,
				content: {
					input: context.uniformConfig.mixEffects.clean.input
				}
			}),

			...CreateLYDBaseline('offtube'),

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
				: [])
		])
	}
}
