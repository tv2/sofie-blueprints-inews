import {
	BlueprintResultBaseline,
	BlueprintResultRundown,
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintRundown,
	IBlueprintShowStyleVariant,
	IngestRundown,
	IShowStyleUserContext,
	IStudioContext,
	IStudioUserContext,
	PieceLifespan,
	PlaylistTimingType,
	SourceLayerType,
	TSR
} from '@tv2media/blueprints-integration'
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
	CreateDSKBaseline,
	CreateDSKBaselineAdlibs,
	CreateGraphicBaseline,
	CreateLYDBaseline,
	GetTagForKam,
	GetTagForLive,
	GetTransitionAdLibActions,
	literal,
	SourceInfo,
	t,
	TimeFromINewsField
} from 'tv2-common'
import {
	AdlibActionType,
	AdlibTagCutToBox,
	AdlibTags,
	CONSTANTS,
	SharedOutputLayers,
	SharedSisyfosLLayer,
	SharedSourceLayers,
	TallyTags
} from 'tv2-constants'
import * as _ from 'underscore'
import {
	getConfig as getShowStyleConfig,
	OfftubeShowstyleBlueprintConfig
} from '../tv2_offtube_showstyle/helpers/config'
import { OfftubeAtemLLayer, OfftubeCasparLLayer, OfftubeSisyfosLLayer } from '../tv2_offtube_studio/layers'
import { SisyfosChannel, sisyfosChannels } from '../tv2_offtube_studio/sisyfosChannels'
import { AtemSourceIndex } from '../types/atem'
import { NUMBER_OF_DVE_BOXES } from './content/OfftubeDVEContent'
import { OfftubeOutputLayers, OfftubeSourceLayer } from './layers'
import { postProcessPieceTimelineObjects } from './postProcessTimelineObjects'

export function getShowStyleVariantId(
	_context: IStudioContext,
	showStyleVariants: IBlueprintShowStyleVariant[],
	_ingestRundown: IngestRundown
): string | null {
	const variant = _.first(showStyleVariants)

	if (variant) {
		return variant._id
	}
	return null
}

export function getRundown(context: IShowStyleUserContext, ingestRundown: IngestRundown): BlueprintResultRundown {
	const config = getShowStyleConfig(context)

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
		globalAdLibPieces: getGlobalAdLibPiecesOfftube(context, config),
		globalActions: getGlobalAdlibActionsOfftube(context, config),
		baseline: getBaseline(config)
	}
}

function getGlobalAdLibPiecesOfftube(
	context: IStudioUserContext,
	config: OfftubeShowstyleBlueprintConfig
): IBlueprintAdLibPiece[] {
	const adlibItems: IBlueprintAdLibPiece[] = []

	adlibItems.forEach(p => postProcessPieceTimelineObjects(context, config, p, true))

	adlibItems.push(...CreateDSKBaselineAdlibs(config, 500))

	adlibItems.push({
		externalId: 'micUp',
		name: 'Mics Up',
		_rank: 600,
		sourceLayerId: SharedSourceLayers.PgmSisyfosAdlibs,
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
					layer: OfftubeSisyfosLLayer.SisyfosGroupStudioMics,
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
		sourceLayerId: SharedSourceLayers.PgmSisyfosAdlibs,
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
					layer: OfftubeSisyfosLLayer.SisyfosGroupStudioMics,
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
		sourceLayerId: SharedSourceLayers.PgmSisyfosAdlibs,
		outputLayerId: SharedOutputLayers.SEC,
		lifespan: PieceLifespan.WithinPart,
		tags: [AdlibTags.ADLIB_STATIC_BUTTON, AdlibTags.ADLIBS_RESYNC_SISYFOS],
		expectedDuration: 1000,
		content: {
			timelineObjects: _.compact<TSR.TSRTimelineObj>([
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
		sourceLayerId: SharedSourceLayers.PgmAudioBed,
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

	adlibItems.forEach(p => postProcessPieceTimelineObjects(context, config, p, true))
	return adlibItems
}

function getGlobalAdlibActionsOfftube(
	_context: IStudioUserContext,
	config: OfftubeShowstyleBlueprintConfig
): IBlueprintActionManifest[] {
	const res: IBlueprintActionManifest[] = []

	let globalRank = 2000

	function makeCutCameraActions(info: SourceInfo, queue: boolean, rank: number) {
		res.push(
			literal<IBlueprintActionManifest>({
				actionId: AdlibActionType.CUT_TO_CAMERA,
				userData: literal<ActionCutToCamera>({
					type: AdlibActionType.CUT_TO_CAMERA,
					queue,
					name: info.id
				}),
				userDataManifest: {},
				display: {
					_rank: rank,
					label: t(`KAM ${info.id}`),
					sourceLayerId: OfftubeSourceLayer.PgmCam,
					outputLayerId: SharedOutputLayers.PGM,
					content: {},
					tags: queue ? [AdlibTags.OFFTUBE_SET_CAM_NEXT, AdlibTags.ADLIB_QUEUE_NEXT] : [AdlibTags.ADLIB_CUT_DIRECT],
					currentPieceTags: [GetTagForKam(info.id)],
					nextPieceTags: [GetTagForKam(info.id)]
				}
			})
		)
	}

	function makeRemoteAction(name: string, type: 'Live' | 'Feed', port: number, rank: number) {
		res.push(
			literal<IBlueprintActionManifest>({
				actionId: AdlibActionType.CUT_TO_REMOTE,
				userData: literal<ActionCutToRemote>({
					type: AdlibActionType.CUT_TO_REMOTE,
					name,
					port
				}),
				userDataManifest: {},
				display: {
					_rank: rank,
					label: t(`${type} ${name}`),
					sourceLayerId: OfftubeSourceLayer.PgmLive,
					outputLayerId: OfftubeOutputLayers.PGM,
					content: {},
					tags: [AdlibTags.OFFTUBE_SET_REMOTE_NEXT, AdlibTags.ADLIB_QUEUE_NEXT],
					currentPieceTags: [GetTagForLive(name)],
					nextPieceTags: [GetTagForLive(name)]
				}
			})
		)
	}

	function makeAdlibBoxesActions(info: SourceInfo, type: 'Kamera' | 'Live', rank: number) {
		for (let box = 0; box < NUMBER_OF_DVE_BOXES; box++) {
			const feed = type === 'Live' && info.id.match(/^F(.+).*$/)
			const name = feed ? `Feed ${feed[1]}` : `${type} ${info.id}`
			const layer = type === 'Kamera' ? OfftubeSourceLayer.PgmCam : OfftubeSourceLayer.PgmLive
			res.push(
				literal<IBlueprintActionManifest>({
					actionId: AdlibActionType.CUT_SOURCE_TO_BOX,
					userData: literal<ActionCutSourceToBox>({
						type: AdlibActionType.CUT_SOURCE_TO_BOX,
						name,
						port: info.port,
						sourceType: info.type,
						box
					}),
					userDataManifest: {},
					display: {
						_rank: rank + 0.1 * box,
						label: t(`Cut ${name} to box ${box + 1}`),
						sourceLayerId: layer,
						outputLayerId: OfftubeOutputLayers.PGM,
						content: {},
						tags: [AdlibTagCutToBox(box)]
					}
				})
			)
		}
	}

	function makeServerAdlibBoxesActions(rank: number) {
		for (let box = 0; box < NUMBER_OF_DVE_BOXES; box++) {
			res.push(
				literal<IBlueprintActionManifest>({
					actionId: AdlibActionType.CUT_SOURCE_TO_BOX,
					userData: literal<ActionCutSourceToBox>({
						type: AdlibActionType.CUT_SOURCE_TO_BOX,
						name: `SERVER`,
						port: -1,
						sourceType: SourceLayerType.VT,
						box,
						server: true
					}),
					userDataManifest: {},
					display: {
						_rank: rank + 0.1 * box,
						label: t(`Server to box ${box + 1}`),
						sourceLayerId: OfftubeSourceLayer.PgmServer,
						outputLayerId: SharedOutputLayers.SEC,
						content: {},
						tags: [AdlibTagCutToBox(box)]
					}
				})
			)
		}
	}

	res.push(
		literal<IBlueprintActionManifest>({
			actionId: AdlibActionType.COMMENTATOR_SELECT_SERVER,
			userData: literal<ActionCommentatorSelectServer>({
				type: AdlibActionType.COMMENTATOR_SELECT_SERVER
			}),
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
		})
	)

	res.push(
		literal<IBlueprintActionManifest>({
			actionId: AdlibActionType.COMMENTATOR_SELECT_DVE,
			userData: literal<ActionCommentatorSelectDVE>({
				type: AdlibActionType.COMMENTATOR_SELECT_DVE
			}),
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
		})
	)

	res.push(
		literal<IBlueprintActionManifest>({
			actionId: AdlibActionType.COMMENTATOR_SELECT_FULL,
			userData: literal<ActionCommentatorSelectFull>({
				type: AdlibActionType.COMMENTATOR_SELECT_FULL
			}),
			userDataManifest: {},
			display: {
				_rank: globalRank++,
				label: t('GFX FULL'),
				sourceLayerId: SharedSourceLayers.PgmPilot,
				outputLayerId: OfftubeOutputLayers.PGM,
				content: {},
				tags: [AdlibTags.OFFTUBE_SET_FULL_NEXT],
				currentPieceTags: [TallyTags.FULL_IS_LIVE],
				nextPieceTags: [TallyTags.FULL_IS_LIVE]
			}
		})
	)

	res.push(
		literal<IBlueprintActionManifest>({
			actionId: AdlibActionType.CLEAR_GRAPHICS,
			userData: literal<ActionClearGraphics>({
				type: AdlibActionType.CLEAR_GRAPHICS,
				sendCommands: false,
				label: 'GFX Altud'
			}),
			userDataManifest: {},
			display: {
				_rank: 400,
				label: t(`GFX Altud`),
				sourceLayerId: SharedSourceLayers.PgmAdlibGraphicCmd,
				outputLayerId: SharedOutputLayers.SEC,
				content: {},
				tags: [AdlibTags.ADLIB_STATIC_BUTTON, AdlibTags.ADLIB_GFX_ALTUD],
				currentPieceTags: [TallyTags.GFX_ALTUD],
				nextPieceTags: [TallyTags.GFX_ALTUD]
			}
		})
	)

	res.push(...GetTransitionAdLibActions(config, 800))

	res.push(
		literal<IBlueprintActionManifest>({
			actionId: AdlibActionType.RECALL_LAST_DVE,
			userData: literal<ActionRecallLastDVE>({
				type: AdlibActionType.RECALL_LAST_DVE
			}),
			userDataManifest: {},
			display: {
				_rank: 1,
				label: t('Last DVE'),
				sourceLayerId: OfftubeSourceLayer.PgmDVEAdLib,
				outputLayerId: 'pgm',
				tags: [AdlibTags.ADLIB_RECALL_LAST_DVE]
			}
		})
	)

	_.each(config.showStyle.DVEStyles, (dveConfig, i) => {
		res.push(
			literal<IBlueprintActionManifest>({
				actionId: AdlibActionType.SELECT_DVE_LAYOUT,
				userData: literal<ActionSelectDVELayout>({
					type: AdlibActionType.SELECT_DVE_LAYOUT,
					config: dveConfig
				}),
				userDataManifest: {},
				display: {
					_rank: 200 + i,
					label: t(dveConfig.DVEName),
					sourceLayerId: OfftubeSourceLayer.PgmDVEAdLib,
					outputLayerId: SharedOutputLayers.PGM,
					tags: [AdlibTags.ADLIB_SELECT_DVE_LAYOUT, dveConfig.DVEName]
				}
			})
		)
	})

	config.sources
		.filter(u => u.type === SourceLayerType.CAMERA)
		.slice(0, 5) // the first x cameras to create INP1/2/3 cam-adlibs from
		.forEach(o => {
			makeCutCameraActions(o, false, globalRank++)
		})

	config.sources
		.filter(u => u.type === SourceLayerType.CAMERA)
		.slice(0, 5) // the first x cameras to create preview cam-adlibs from
		.forEach(o => {
			makeCutCameraActions(o, true, globalRank++)
		})

	config.sources
		.filter(u => u.type === SourceLayerType.CAMERA)
		.slice(0, 5) // the first x cameras to create preview cam-adlibs from
		.forEach(o => {
			makeAdlibBoxesActions(o, 'Kamera', globalRank++)
		})

	res.push(
		literal<IBlueprintActionManifest>({
			actionId: AdlibActionType.RECALL_LAST_LIVE,
			userData: literal<ActionRecallLastLive>({
				type: AdlibActionType.RECALL_LAST_LIVE
			}),
			userDataManifest: {},
			display: {
				_rank: 1,
				label: t('Last Live'),
				sourceLayerId: OfftubeSourceLayer.PgmLive,
				outputLayerId: SharedOutputLayers.PGM,
				tags: [AdlibTags.ADLIB_RECALL_LAST_LIVE]
			}
		})
	)

	config.sources
		.filter(u => u.type === SourceLayerType.REMOTE)
		.slice(0, 10) // the first x cameras to create live-adlibs from
		.forEach(o => {
			makeRemoteAction(o.id, o.id.match(/^F/) ? 'Feed' : 'Live', o.port, globalRank++)
		})

	config.sources
		.filter(u => u.type === SourceLayerType.REMOTE)
		.slice(0, 10) // the first x remote to create INP1/2/3 live-adlibs from
		.forEach(o => {
			makeAdlibBoxesActions(o, 'Live', globalRank++)
		})

	makeServerAdlibBoxesActions(globalRank++)

	res.push(
		literal<IBlueprintActionManifest>({
			actionId: AdlibActionType.COMMENTATOR_SELECT_JINGLE,
			userData: literal<ActionCommentatorSelectJingle>({
				type: AdlibActionType.COMMENTATOR_SELECT_JINGLE
			}),
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
		})
	)

	return res
}

function getBaseline(config: OfftubeShowstyleBlueprintConfig): BlueprintResultBaseline {
	return {
		timelineObjects: [
			...CreateGraphicBaseline(config),
			// Default timeline
			literal<TSR.TimelineObjAtemME>({
				id: '',
				enable: { while: '1' },
				priority: 0,
				layer: OfftubeAtemLLayer.AtemMEClean,
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
				layer: OfftubeAtemLLayer.AtemMENext,
				content: {
					deviceType: TSR.DeviceType.ATEM,
					type: TSR.TimelineContentTypeAtem.ME,
					me: {
						previewInput: config.studio.AtemSource.Default
					}
				}
			}),

			// route default outputs
			literal<TSR.TimelineObjAtemAUX>({
				id: '',
				enable: { while: '1' },
				priority: 0,
				layer: OfftubeAtemLLayer.AtemAuxClean,
				content: {
					deviceType: TSR.DeviceType.ATEM,
					type: TSR.TimelineContentTypeAtem.AUX,
					aux: {
						input: AtemSourceIndex.Prg2
					}
				}
			}),
			literal<TSR.TimelineObjAtemAUX>({
				id: '',
				enable: { while: '1' },
				priority: 0,
				layer: OfftubeAtemLLayer.AtemAuxScreen,
				content: {
					deviceType: TSR.DeviceType.ATEM,
					type: TSR.TimelineContentTypeAtem.AUX,
					aux: {
						input: config.studio.AtemSource.Loop
					}
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
			...CreateDSKBaseline(config),

			literal<TSR.TimelineObjAtemSsrcProps>({
				id: '',
				enable: { while: '1' },
				priority: 0,
				layer: OfftubeAtemLLayer.AtemSSrcArt,
				content: {
					deviceType: TSR.DeviceType.ATEM,
					type: TSR.TimelineContentTypeAtem.SSRCPROPS,
					ssrcProps: {
						artFillSource: config.studio.AtemSource.SplitArtF,
						artCutSource: config.studio.AtemSource.SplitArtK,
						artOption: 1, // foreground
						artPreMultiplied: true
					}
				}
			}),
			literal<TSR.TimelineObjAtemSsrc>({
				id: '',
				enable: { while: '1' },
				priority: 0,
				layer: OfftubeAtemLLayer.AtemSSrcDefault,
				content: {
					deviceType: TSR.DeviceType.ATEM,
					type: TSR.TimelineContentTypeAtem.SSRC,
					ssrc: {
						boxes: [
							{
								// left
								enabled: true,
								source: config.studio.AtemSource.SplitBackground,
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
						]
					}
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
					channels: Object.keys(sisyfosChannels).map(key => {
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
			literal<TSR.TimelineObjAtemME>({
				id: '',
				enable: { while: '1' },
				priority: 0,
				layer: OfftubeAtemLLayer.AtemMEProgram,
				content: {
					deviceType: TSR.DeviceType.ATEM,
					type: TSR.TimelineContentTypeAtem.ME,
					me: {
						programInput: AtemSourceIndex.Prg2
					}
				}
			}),

			...CreateLYDBaseline('offtube'),

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
				: [])
		]
	}
}
