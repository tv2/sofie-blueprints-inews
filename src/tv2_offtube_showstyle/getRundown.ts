import {
	BlueprintResultRundown,
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintRundown,
	IBlueprintShowStyleVariant,
	IngestRundown,
	IStudioConfigContext,
	NotesContext,
	PieceLifespan,
	ShowStyleContext,
	SourceLayerType,
	TSR
} from 'tv-automation-sofie-blueprints-integration'
import {
	ActionCommentatorSelectDVE,
	ActionCommentatorSelectFull,
	ActionCommentatorSelectJingle,
	ActionCommentatorSelectServer,
	ActionCutSourceToBox,
	ActionCutToCamera,
	ActionCutToRemote,
	ActionSelectDVELayout,
	GetCameraMetaData,
	GetLayersForCamera,
	GetSisyfosTimelineObjForCamera,
	GetTagForKam,
	GetTagForLive,
	GraphicLLayer,
	literal,
	SourceInfo,
	TimelineBlueprintExt
} from 'tv2-common'
import { AdlibActionType, AdlibTags, CONSTANTS, Enablers, TallyTags } from 'tv2-constants'
import * as _ from 'underscore'
import {
	CasparPlayerClipLoadingLoop,
	OfftubeAtemLLayer,
	OfftubeCasparLLayer,
	OfftubeSisyfosLLayer
} from '../tv2_offtube_studio/layers'
import { SisyfosChannel, sisyfosChannels } from '../tv2_offtube_studio/sisyfosChannels'
import { AtemSourceIndex } from '../types/atem'
import { boxLayers } from './content/OfftubeDVEContent'
import { OfftubeShowstyleBlueprintConfig, parseConfig } from './helpers/config'
import { OfftubeOutputLayers, OfftubeSourceLayer } from './layers'
import { postProcessPieceTimelineObjects } from './postProcessTimelineObjects'

export function getShowStyleVariantId(
	_context: IStudioConfigContext,
	showStyleVariants: IBlueprintShowStyleVariant[],
	_ingestRundown: IngestRundown
): string | null {
	const variant = _.first(showStyleVariants)

	if (variant) {
		return variant._id
	}
	return null
}

export function getRundown(context: ShowStyleContext, ingestRundown: IngestRundown): BlueprintResultRundown {
	const config = parseConfig(context)

	let startTime: number = 0
	let endTime: number = 0

	// Set start / end times
	if ('payload' in ingestRundown) {
		if (ingestRundown.payload.expectedStart) {
			startTime = Number(ingestRundown.payload.expectedStart)
		}

		if (ingestRundown.payload.expectedEnd) {
			endTime = Number(ingestRundown.payload.expectedEnd)
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
			expectedStart: startTime,
			expectedDuration: endTime - startTime
		}),
		globalAdLibPieces: getGlobalAdLibPiecesOfftube(context, config),
		globalActions: getGlobalAdlibActionsOfftube(context, config),
		baseline: getBaseline(config)
	}
}

function getGlobalAdLibPiecesOfftube(
	context: NotesContext,
	config: OfftubeShowstyleBlueprintConfig
): IBlueprintAdLibPiece[] {
	const adlibItems: IBlueprintAdLibPiece[] = []

	let globalRank = 1000

	function makeCameraAdLibs(info: SourceInfo, rank: number, preview: boolean = false): IBlueprintAdLibPiece[] {
		const res: IBlueprintAdLibPiece[] = []
		const camSisyfos = GetSisyfosTimelineObjForCamera(context, config, `Kamera ${info.id}`)
		res.push({
			externalId: 'cam',
			name: `Kamera ${info.id}`,
			_rank: rank,
			sourceLayerId: OfftubeSourceLayer.PgmCam,
			outputLayerId: 'pgm',
			expectedDuration: 0,
			infiniteMode: PieceLifespan.OutOnNextPart,
			toBeQueued: preview,
			metaData: GetCameraMetaData(config, GetLayersForCamera(config, info)),
			onAirTags: [GetTagForKam(info.id)],
			setNextTags: [GetTagForKam(info.id)],
			content: {
				timelineObjects: _.compact<TSR.TSRTimelineObj>([
					literal<TSR.TimelineObjAtemME>({
						id: '',
						enable: { while: '1' },
						priority: 1,
						layer: OfftubeAtemLLayer.AtemMEProgram,
						content: {
							deviceType: TSR.DeviceType.ATEM,
							type: TSR.TimelineContentTypeAtem.ME,
							me: {
								input: info.port,
								transition: TSR.AtemTransitionStyle.CUT
							}
						},
						classes: ['adlib_deparent']
					}),
					...camSisyfos,
					...config.stickyLayers
						.filter(layer => camSisyfos.map(obj => obj.layer).indexOf(layer) === -1)
						.map<TSR.TimelineObjSisyfosChannel & TimelineBlueprintExt>(layer => {
							return literal<TSR.TimelineObjSisyfosChannel & TimelineBlueprintExt>({
								id: '',
								enable: {
									start: 0
								},
								priority: 1,
								layer,
								content: {
									deviceType: TSR.DeviceType.SISYFOS,
									type: TSR.TimelineContentTypeSisyfos.CHANNEL,
									isPgm: 0
								},
								metaData: {
									sisyfosPersistLevel: true
								}
							})
						}),
					// Force server to be muted (for adlibbing over DVE)
					...[
						OfftubeSisyfosLLayer.SisyfosSourceClipPending,
						OfftubeSisyfosLLayer.SisyfosSourceServerA,
						OfftubeSisyfosLLayer.SisyfosSourceServerB
					].map<TSR.TimelineObjSisyfosChannel>(layer => {
						return literal<TSR.TimelineObjSisyfosChannel>({
							id: '',
							enable: {
								start: 0
							},
							priority: 2,
							layer,
							content: {
								deviceType: TSR.DeviceType.SISYFOS,
								type: TSR.TimelineContentTypeSisyfos.CHANNEL,
								isPgm: 0
							}
						})
					})
				])
			}
		})
		return res
	}

	config.sources
		.filter(u => u.type === SourceLayerType.CAMERA)
		.slice(0, 5) // the first x cameras to create INP1/2/3 cam-adlibs from
		.forEach(o => {
			adlibItems.push(...makeCameraAdLibs(o, globalRank++))
		})

	adlibItems.forEach(p => postProcessPieceTimelineObjects(context, config, p, true))
	return adlibItems
}

function getGlobalAdlibActionsOfftube(
	_context: ShowStyleContext,
	config: OfftubeShowstyleBlueprintConfig
): IBlueprintActionManifest[] {
	const res: IBlueprintActionManifest[] = []

	let globalRank = 2000

	function makeKameraAction(name: string, queue: boolean, rank: number) {
		res.push(
			literal<IBlueprintActionManifest>({
				actionId: AdlibActionType.CUT_TO_CAMERA,
				userData: literal<ActionCutToCamera>({
					type: AdlibActionType.CUT_TO_CAMERA,
					queue,
					name
				}),
				userDataManifest: {},
				display: {
					_rank: rank,
					label: `Kamera ${name}`,
					sourceLayerId: OfftubeSourceLayer.PgmCam,
					outputLayerId: OfftubeOutputLayers.PGM,
					content: {},
					tags: queue ? [AdlibTags.OFFTUBE_SET_CAM_NEXT] : [],
					onAirTags: [GetTagForKam(name)],
					setNextTags: [GetTagForKam(name)]
				}
			})
		)
	}

	function makeRemoteAction(name: string, port: number, rank: number) {
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
					label: `Live ${name}`,
					sourceLayerId: OfftubeSourceLayer.PgmLive,
					outputLayerId: OfftubeOutputLayers.PGM,
					content: {},
					tags: [AdlibTags.OFFTUBE_SET_REMOTE_NEXT],
					onAirTags: [GetTagForLive(name)],
					setNextTags: [GetTagForLive(name)]
				}
			})
		)
	}

	function makeAdlibBoxesActions(info: SourceInfo, type: 'Kamera' | 'Live', rank: number) {
		Object.values(boxLayers).forEach((layer, box) => {
			res.push(
				literal<IBlueprintActionManifest>({
					actionId: AdlibActionType.CUT_SOURCE_TO_BOX,
					userData: literal<ActionCutSourceToBox>({
						type: AdlibActionType.CUT_SOURCE_TO_BOX,
						name: `${type} ${info.id}`,
						port: info.port,
						sourceType: info.type,
						box
					}),
					userDataManifest: {},
					display: {
						_rank: rank + 0.1 * box,
						label: `Cut ${type} ${info.id} to box ${box + 1}`,
						sourceLayerId: layer,
						outputLayerId: OfftubeOutputLayers.PGM,
						content: {},
						tags: []
					}
				})
			)
		})
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
				label: 'Server',
				sourceLayerId: OfftubeSourceLayer.PgmServer,
				outputLayerId: OfftubeOutputLayers.PGM,
				content: {},
				tags: [AdlibTags.OFFTUBE_SET_SERVER_NEXT],
				onAirTags: [TallyTags.SERVER_IS_LIVE],
				setNextTags: [TallyTags.SERVER_IS_LIVE]
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
				label: 'DVE',
				sourceLayerId: OfftubeSourceLayer.PgmDVE,
				outputLayerId: OfftubeOutputLayers.PGM,
				content: {},
				tags: [AdlibTags.OFFTUBE_SET_DVE_NEXT],
				onAirTags: [TallyTags.DVE_IS_LIVE],
				setNextTags: [TallyTags.DVE_IS_LIVE]
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
				label: 'GFX FULL',
				sourceLayerId: OfftubeSourceLayer.PgmFull,
				outputLayerId: OfftubeOutputLayers.PGM,
				content: {},
				tags: [AdlibTags.OFFTUBE_SET_FULL_NEXT],
				onAirTags: [TallyTags.FULL_IS_LIVE],
				setNextTags: [TallyTags.FULL_IS_LIVE]
			}
		})
	)

	_.each(config.showStyle.DVEStyles, (dveConfig, i) => {
		// const boxSources = ['', '', '', '']
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
					label: dveConfig.DVEName,
					sourceLayerId: OfftubeSourceLayer.PgmDVE,
					outputLayerId: 'pgm'
				}
			})
		)
	})

	config.sources
		.filter(u => u.type === SourceLayerType.CAMERA)
		.slice(0, 5) // the first x cameras to create preview cam-adlibs from
		.forEach(o => {
			makeKameraAction(o.id, true, globalRank++)
		})

	config.sources
		.filter(u => u.type === SourceLayerType.CAMERA)
		.slice(0, 5) // the first x cameras to create preview cam-adlibs from
		.forEach(o => {
			makeAdlibBoxesActions(o, 'Kamera', globalRank++)
		})

	config.sources
		.filter(u => u.type === SourceLayerType.REMOTE && !u.id.match(`DP`))
		.slice(0, 10) // the first x cameras to create live-adlibs from
		.forEach(o => {
			makeRemoteAction(o.id, o.port, globalRank++)
		})

	config.sources
		.filter(u => u.type === SourceLayerType.REMOTE && !u.id.match(`DP`))
		.slice(0, 10) // the first x remote to create INP1/2/3 live-adlibs from
		.forEach(o => {
			makeAdlibBoxesActions(o, 'Live', globalRank++)
		})

	res.push(
		literal<IBlueprintActionManifest>({
			actionId: AdlibActionType.COMMENTATOR_SELECT_JINGLE,
			userData: literal<ActionCommentatorSelectJingle>({
				type: AdlibActionType.COMMENTATOR_SELECT_JINGLE
			}),
			userDataManifest: {},
			display: {
				_rank: globalRank++,
				label: 'JINGLE',
				sourceLayerId: OfftubeSourceLayer.PgmJingle,
				outputLayerId: OfftubeOutputLayers.PGM,
				content: {},
				tags: [AdlibTags.OFFTUBE_SET_JINGLE_NEXT],
				onAirTags: [TallyTags.JINGLE_IS_LIVE],
				setNextTags: [TallyTags.JINGLE_IS_LIVE]
			}
		})
	)

	return res
}

function getBaseline(config: OfftubeShowstyleBlueprintConfig): TSR.TSRTimelineObjBase[] {
	return [
		literal<TSR.TimelineObjCCGTemplate>({
			id: '',
			enable: {
				while: '1'
			},
			layer: GraphicLLayer.GraphicLLayerOverlayLower,
			content: {
				deviceType: TSR.DeviceType.CASPARCG,
				type: TSR.TimelineContentTypeCasparCg.TEMPLATE,
				// tslint:disable-next-line: prettier
				templateType: "html",
				// tslint:disable-next-line: prettier
				name: "sport-overlay/index",
				data: `<templateData>${encodeURI(
					JSON.stringify({
						// tslint:disable-next-line: prettier
						display: "program",
						slots: {}
					})
				)}</templateData>`,
				useStopCommand: false
			}
		}),
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
		literal<TSR.TimelineObjAtemDSK>({
			id: '',
			enable: { while: `!.${Enablers.OFFTUBE_ENABLE_FULL}` },
			priority: 0,
			layer: OfftubeAtemLLayer.AtemDSKGraphics,
			content: {
				deviceType: TSR.DeviceType.ATEM,
				type: TSR.TimelineContentTypeAtem.DSK,
				dsk: {
					onAir: true,
					sources: {
						fillSource: config.studio.AtemSource.DSK1F,
						cutSource: config.studio.AtemSource.DSK1K
					},
					properties: {
						tie: false,
						preMultiply: true,
						clip: config.studio.AtemSettings.CCGClip * 10, // input is percents (0-100), atem uses 1-000,
						gain: config.studio.AtemSettings.CCGGain * 10, // input is percents (0-100), atem uses 1-000,
						mask: {
							enabled: false
						}
					}
				}
			}
		}),
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
							source: config.studio.AtemSource.Loop,
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
			layer: OfftubeCasparLLayer.CasparCGDVETemplate,
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

		literal<TSR.TimelineObjCCGMedia>({
			id: '',
			enable: { while: '1' },
			priority: 0,
			layer: OfftubeCasparLLayer.CasparGraphicsFull,
			content: {
				deviceType: TSR.DeviceType.CASPARCG,
				type: TSR.TimelineContentTypeCasparCg.MEDIA,
				file: 'empty',
				mixer: {
					opacity: 0
				}
			}
		}),

		// create sisyfos channels from the config
		...Object.keys(sisyfosChannels).map(key => {
			const llayer = key as OfftubeSisyfosLLayer
			const channel = sisyfosChannels[llayer] as SisyfosChannel
			return literal<TSR.TimelineObjSisyfosChannel>({
				id: '',
				enable: { while: '1' },
				priority: 0,
				layer: llayer,
				content: {
					deviceType: TSR.DeviceType.SISYFOS,
					type: TSR.TimelineContentTypeSisyfos.CHANNEL,
					isPgm: channel.isPgm,
					visible: true,
					label: channel.label
				}
			})
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
