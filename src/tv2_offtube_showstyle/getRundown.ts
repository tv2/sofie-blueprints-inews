import * as _ from 'underscore'

import {
	AtemTransitionStyle,
	DeviceType,
	TimelineContentTypeAtem,
	TimelineContentTypeCasparCg,
	TimelineContentTypeSisyfos,
	TimelineObjAbstractAny,
	TimelineObjAtemAUX,
	TimelineObjAtemDSK,
	TimelineObjAtemME,
	TimelineObjAtemSsrc,
	TimelineObjAtemSsrcProps,
	TimelineObjCCGMedia,
	TimelineObjSisyfosAny,
	TimelineObjSisyfosMessage,
	Transition,
	TSRTimelineObj,
	TSRTimelineObjBase
} from 'timeline-state-resolver-types'
import {
	BlueprintResultRundown,
	IBlueprintAdLibPiece,
	IBlueprintRundown,
	IBlueprintShowStyleVariant,
	IngestRundown,
	IStudioConfigContext,
	NotesContext,
	PieceLifespan,
	ShowStyleContext,
	SourceLayerType
} from 'tv-automation-sofie-blueprints-integration'
import {
	GetCameraMetaData,
	GetEksternMetaData,
	GetLayersForCamera,
	GetLayersForEkstern,
	GetSisyfosTimelineObjForEkstern,
	literal,
	MakeContentDVE2,
	SourceInfo,
	TimelineBlueprintExt
} from 'tv2-common'
import { AdlibTags, CONSTANTS, ControlClasses, Enablers, MEDIA_PLAYER_AUTO } from 'tv2-constants'
import {
	CasparPlayerClipLoadingLoop,
	OfftubeAbstractLLayer,
	OfftubeAtemLLayer,
	OfftubeCasparLLayer,
	OfftubeSisyfosLLayer
} from '../tv2_offtube_studio/layers'
import { SisyfosChannel, sisyfosChannels } from '../tv2_offtube_studio/sisyfosChannels'
import { AtemSourceIndex } from '../types/atem'
import { boxLayers, boxMappings, OFFTUBE_DVE_GENERATOR_OPTIONS } from './content/OfftubeDVEContent'
import { OffTubeShowstyleBlueprintConfig, parseConfig } from './helpers/config'
import { GetSisyfosTimelineObjForCamera } from './helpers/sisyfos'
import { OfftubeOutputLayers, OffTubeSourceLayer } from './layers'

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
		globalAdLibPieces: getGlobalAdLibPiecesOffTube(context, config),
		baseline: getBaseline(config)
	}
}

function getGlobalAdLibPiecesOffTube(
	context: NotesContext,
	config: OffTubeShowstyleBlueprintConfig
): IBlueprintAdLibPiece[] {
	const adlibItems: IBlueprintAdLibPiece[] = []

	let globalRank = 1000

	function makeSsrcAdlibBoxes(layer: OffTubeSourceLayer, port: number, mediaPlayer?: boolean) {
		// Generate boxes with classes to map across each layer
		const boxObjs = _.map(boxMappings, (m, i) =>
			literal<TimelineObjAtemSsrc & TimelineBlueprintExt>({
				id: '',
				enable: { while: `.${layer}_${m}` },
				priority: 1,
				layer: m,
				content: {
					deviceType: DeviceType.ATEM,
					type: TimelineContentTypeAtem.SSRC,
					ssrc: {
						boxes: [
							// Pad until we are on the right box
							..._.range(i).map(() => ({})),
							// Add the source setter
							{ source: port }
						]
					}
				},
				metaData: {
					dveAdlibEnabler: `.${layer}_${m} & !.${ControlClasses.DVEOnAir}`,
					mediaPlayerSession: mediaPlayer ? MEDIA_PLAYER_AUTO : undefined
				}
			})
		)
		const audioWhile = boxObjs.map(obj => obj.enable.while as string).join(' | ')
		return {
			boxObjs,
			audioWhile: `(.${Enablers.OFFTUBE_ENABLE_DVE}) & (${audioWhile})`
		}
	}
	function makeCameraAdLibs(info: SourceInfo, rank: number, preview: boolean = false): IBlueprintAdLibPiece[] {
		const res: IBlueprintAdLibPiece[] = []
		const camSisyfos = GetSisyfosTimelineObjForCamera(`Kamera ${info.id}`)
		res.push({
			externalId: 'cam',
			name: `Kamera ${info.id}`,
			_rank: rank,
			sourceLayerId: OffTubeSourceLayer.PgmCam,
			outputLayerId: 'pgm',
			expectedDuration: 0,
			infiniteMode: PieceLifespan.OutOnNextPart,
			toBeQueued: preview,
			metaData: GetCameraMetaData(config, GetLayersForCamera(config, info)),
			content: {
				timelineObjects: _.compact<TSRTimelineObj>([
					literal<TimelineObjAtemME>({
						id: '',
						enable: { while: '1' },
						priority: 1,
						layer: OfftubeAtemLLayer.AtemMEClean,
						content: {
							deviceType: DeviceType.ATEM,
							type: TimelineContentTypeAtem.ME,
							me: {
								input: info.port,
								transition: AtemTransitionStyle.CUT
							}
						},
						classes: ['adlib_deparent']
					}),
					...camSisyfos,
					...config.stickyLayers
						.filter(layer => camSisyfos.map(obj => obj.layer).indexOf(layer) === -1)
						.map<TimelineObjSisyfosAny & TimelineBlueprintExt>(layer => {
							return literal<TimelineObjSisyfosAny & TimelineBlueprintExt>({
								id: '',
								enable: {
									start: 0
								},
								priority: 1,
								layer,
								content: {
									deviceType: DeviceType.SISYFOS,
									type: TimelineContentTypeSisyfos.SISYFOS,
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
					].map<TimelineObjSisyfosMessage>(layer => {
						return literal<TimelineObjSisyfosMessage>({
							id: '',
							enable: {
								start: 0
							},
							priority: 2,
							layer,
							content: {
								deviceType: DeviceType.SISYFOS,
								type: TimelineContentTypeSisyfos.SISYFOS,
								isPgm: 0
							}
						})
					})
				])
			}
		})
		return res
	}

	// ssrc box
	function makeCameraAdlibBoxes(info: SourceInfo, rank: number): IBlueprintAdLibPiece[] {
		const res: IBlueprintAdLibPiece[] = []
		_.forEach(_.values(boxLayers), (layer: OffTubeSourceLayer, i) => {
			const { boxObjs, audioWhile } = makeSsrcAdlibBoxes(layer, info.port)

			res.push({
				externalId: 'cam',
				name: info.id + '',
				_rank: rank * 100 + i,
				sourceLayerId: layer,
				outputLayerId: 'sec',
				expectedDuration: 0,
				infiniteMode: PieceLifespan.OutOnNextPart,
				content: {
					timelineObjects: _.compact<TSRTimelineObj>([
						...boxObjs,
						...GetSisyfosTimelineObjForCamera(`Kamera ${info.id}`, { while: audioWhile })
					])
				}
			})
		})
		return res
	}

	function makeRemoteAdLibs(info: SourceInfo, rank: number): IBlueprintAdLibPiece[] {
		const res: IBlueprintAdLibPiece[] = []
		const eksternSisyfos = [
			...GetSisyfosTimelineObjForEkstern(context, config.sources, `Live ${info.id}`, GetLayersForEkstern),
			...GetSisyfosTimelineObjForCamera('telefon')
		]
		res.push({
			externalId: 'live',
			name: info.id + '',
			_rank: rank,
			sourceLayerId: OffTubeSourceLayer.PgmLive,
			outputLayerId: 'pgm',
			expectedDuration: 0,
			infiniteMode: PieceLifespan.OutOnNextPart,
			toBeQueued: true,
			metaData: GetEksternMetaData(
				config.stickyLayers,
				config.studio.StudioMics,
				GetLayersForEkstern(context, config.sources, `Live ${info.id}`)
			),
			content: {
				timelineObjects: _.compact<TSRTimelineObj>([
					literal<TimelineObjAtemME>({
						id: '',
						enable: { while: '1' },
						priority: 1,
						layer: OfftubeAtemLLayer.AtemMEClean,
						content: {
							deviceType: DeviceType.ATEM,
							type: TimelineContentTypeAtem.ME,
							me: {
								input: info.port,
								transition: AtemTransitionStyle.CUT
							}
						},
						classes: ['adlib_deparent']
					}),
					...eksternSisyfos,
					...config.stickyLayers
						.filter(layer => eksternSisyfos.map(obj => obj.layer).indexOf(layer) === -1)
						.filter(layer => config.liveAudio.indexOf(layer) === -1)
						.map<TimelineObjSisyfosAny & TimelineBlueprintExt>(layer => {
							return literal<TimelineObjSisyfosAny & TimelineBlueprintExt>({
								id: '',
								enable: {
									start: 0
								},
								priority: 1,
								layer,
								content: {
									deviceType: DeviceType.SISYFOS,
									type: TimelineContentTypeSisyfos.SISYFOS,
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
					].map<TimelineObjSisyfosMessage>(layer => {
						return literal<TimelineObjSisyfosMessage>({
							id: '',
							enable: {
								start: 0
							},
							priority: 2,
							layer,
							content: {
								deviceType: DeviceType.SISYFOS,
								type: TimelineContentTypeSisyfos.SISYFOS,
								isPgm: 0
							}
						})
					})
				])
			}
		})

		return res
	}

	// ssrc box
	function makeRemoteAdlibBoxes(info: SourceInfo, rank: number): IBlueprintAdLibPiece[] {
		const res: IBlueprintAdLibPiece[] = []
		_.forEach(_.values(boxLayers), (layer: OffTubeSourceLayer, i) => {
			const { boxObjs, audioWhile } = makeSsrcAdlibBoxes(layer, info.port)

			res.push({
				externalId: 'cam',
				name: info.id + '',
				_rank: rank * 100 + i,
				sourceLayerId: layer,
				outputLayerId: 'sec',
				expectedDuration: 0,
				infiniteMode: PieceLifespan.OutOnNextPart,
				content: {
					timelineObjects: _.compact<TSRTimelineObj>([
						...boxObjs,
						...GetSisyfosTimelineObjForEkstern(context, config.sources, `Live ${info.id}`, GetLayersForEkstern, {
							while: audioWhile
						}),
						...GetSisyfosTimelineObjForCamera('telefon', { while: audioWhile })
					])
				}
			})
		})
		return res
	}

	// Shortcuts
	config.sources
		.filter(u => u.type === SourceLayerType.CAMERA)
		.slice(0, 5) // the first x cameras to create INP1/2/3 cam-adlibs from
		.forEach(o => {
			adlibItems.push(...makeCameraAdLibs(o, globalRank++))
		})

	config.sources
		.filter(u => u.type === SourceLayerType.CAMERA)
		.slice(0, 5) // the first x cameras to create preview cam-adlibs from
		.forEach(o => {
			adlibItems.push(...makeCameraAdLibs(o, globalRank++, true))
		})

	config.sources
		.filter(u => u.type === SourceLayerType.CAMERA)
		.slice(0, 5) // the first x cameras to create INP1/2/3 cam-adlibs from
		.forEach(o => {
			adlibItems.push(...makeCameraAdlibBoxes(o, globalRank++))
		})

	config.sources
		.filter(u => u.type === SourceLayerType.REMOTE)
		.slice(0, 10) // the first x cameras to create live-adlibs from
		.forEach(o => {
			adlibItems.push(...makeRemoteAdLibs(o, globalRank++))
		})

	config.sources
		.filter(u => u.type === SourceLayerType.REMOTE)
		.slice(0, 10) // the first x cameras to create INP1/2/3 live-adlibs from
		.forEach(o => {
			adlibItems.push(...makeRemoteAdlibBoxes(o, globalRank++))
		})

	_.each(config.showStyle.DVEStyles, (dveConfig, i) => {
		// const boxSources = ['', '', '', '']
		const content = MakeContentDVE2(context, config, dveConfig, {}, undefined, OFFTUBE_DVE_GENERATOR_OPTIONS)
		if (content.valid) {
			adlibItems.push({
				externalId: `dve-${dveConfig.DVEName}`,
				name: (dveConfig.DVEName || 'DVE') + '',
				_rank: 200 + i,
				sourceLayerId: OffTubeSourceLayer.SelectedAdLibDVE,
				outputLayerId: 'pgm',
				expectedDuration: 0,
				infiniteMode: PieceLifespan.OutOnNextPart,
				toBeQueued: true,
				content: content.content,
				adlibPreroll: Number(config.studio.CasparPrerollDuration) || 0
			})
		}
	})

	// Multiview adlibs
	config.sources
		.filter(u => u.type === SourceLayerType.CAMERA)
		.slice(0, 5) // the first x cameras to create INP1/2/3 cam-adlibs from
		.forEach(o => {
			adlibItems.push(
				literal<IBlueprintAdLibPiece>({
					_rank: globalRank++,
					externalId: 'setNextToCam',
					name: 'Set Cam Next',
					sourceLayerId: OffTubeSourceLayer.PgmSourceSelect,
					outputLayerId: OfftubeOutputLayers.SEC,
					infiniteMode: PieceLifespan.OutOnNextPart,
					toBeQueued: true,
					canCombineQueue: true,
					content: {
						timelineObjects: [
							literal<TimelineObjAtemME>({
								id: '',
								enable: {
									while: '1'
								},
								layer: OfftubeAtemLLayer.AtemMEClean,
								priority: 1,
								content: {
									deviceType: DeviceType.ATEM,
									type: TimelineContentTypeAtem.ME,
									me: {
										input: o.port,
										transition: AtemTransitionStyle.CUT
									}
								}
							})
						]
					},
					tags: [AdlibTags.OFFTUBE_SET_CAM_NEXT]
				})
			)
		})

	config.sources
		.filter(u => u.type === SourceLayerType.REMOTE)
		.slice(0, 5)
		.forEach(o => {
			adlibItems.push(
				literal<IBlueprintAdLibPiece>({
					_rank: globalRank++,
					externalId: `setNextToWorldRemote-${o.id}`,
					name: `Set Remote ${o.id} Next`,
					sourceLayerId: OffTubeSourceLayer.PgmSourceSelect,
					outputLayerId: OfftubeOutputLayers.SEC,
					infiniteMode: PieceLifespan.OutOnNextPart,
					toBeQueued: true,
					canCombineQueue: true,
					content: {
						timelineObjects: [
							literal<TimelineObjAtemME>({
								id: '',
								enable: {
									while: '1'
								},
								layer: OfftubeAtemLLayer.AtemMEClean,
								priority: 1,
								content: {
									deviceType: DeviceType.ATEM,
									type: TimelineContentTypeAtem.ME,
									me: {
										input: o.port,
										transition: AtemTransitionStyle.CUT
									}
								}
							})
						]
					},
					tags: [AdlibTags.OFFTUBE_SET_REMOTE_NEXT]
				})
			)
		})

	adlibItems.push(
		literal<IBlueprintAdLibPiece>({
			_rank: globalRank++,
			externalId: 'setNextToFull',
			name: 'Set GFX Full Next',
			sourceLayerId: OffTubeSourceLayer.PgmSourceSelect,
			outputLayerId: OfftubeOutputLayers.SEC,
			infiniteMode: PieceLifespan.OutOnNextPart,
			toBeQueued: true,
			canCombineQueue: true,
			content: {
				timelineObjects: [
					literal<TimelineObjAtemME>({
						id: '',
						enable: {
							while: '1'
						},
						layer: OfftubeAtemLLayer.AtemMEClean,
						priority: 10,
						content: {
							deviceType: DeviceType.ATEM,
							type: TimelineContentTypeAtem.ME,
							me: {
								input: config.studio.AtemSource.GFXFull,
								transition: AtemTransitionStyle.CUT
							}
						},
						classes: [Enablers.OFFTUBE_ENABLE_FULL]
					})
				]
			},
			tags: [AdlibTags.OFFTUBE_SET_FULL_NEXT]
		})
	)

	// TODO: Future
	/*adlibItems.push(
		literal<IBlueprintAdLibPiece>({
			_rank: globalRank++,
			externalId: 'setNextToJingle',
			name: 'Set Jingle Next',
			sourceLayerId: OffTubeSourceLayer.PgmSourceSelect,
			outputLayerId: OfftubeOutputLayers.SEC,
			infiniteMode: PieceLifespan.OutOnNextPart,
			toBeQueued: true,
			content: {
				timelineObjects: [] // TODO
			},
			tags: [AdlibTags.OFFTUBE_SET_JINGLE_NEXT]
		})
	)*/

	adlibItems.push(
		literal<IBlueprintAdLibPiece>({
			_rank: globalRank++,
			externalId: 'setNextToServer',
			name: 'Set Server Next',
			sourceLayerId: OffTubeSourceLayer.PgmSourceSelect,
			outputLayerId: OfftubeOutputLayers.SEC,
			infiniteMode: PieceLifespan.OutOnNextPart,
			toBeQueued: true,
			canCombineQueue: true,
			content: {
				timelineObjects: [
					literal<TimelineObjAbstractAny>({
						id: '',
						enable: {
							while: '1'
						},
						priority: 1,
						layer: OfftubeAbstractLLayer.OfftubeAbstractLLayerPgmEnabler,
						content: {
							deviceType: DeviceType.ABSTRACT
						},
						classes: [Enablers.OFFTUBE_ENABLE_SERVER]
					})
				]
			},
			tags: [AdlibTags.OFFTUBE_SET_SERVER_NEXT]
		})
	)

	adlibItems.push(
		literal<IBlueprintAdLibPiece>({
			_rank: globalRank++,
			externalId: 'setNextToDVE',
			name: 'Set DVE Next',
			sourceLayerId: OffTubeSourceLayer.PgmSourceSelect,
			outputLayerId: OfftubeOutputLayers.SEC,
			infiniteMode: PieceLifespan.OutOnNextPart,
			toBeQueued: true,
			canCombineQueue: true,
			content: {
				timelineObjects: [
					literal<TimelineObjAbstractAny>({
						id: '',
						enable: {
							while: '1'
						},
						priority: 1,
						layer: OfftubeAbstractLLayer.OfftubeAbstractLLayerPgmEnabler,
						content: {
							deviceType: DeviceType.ABSTRACT
						},
						classes: [Enablers.OFFTUBE_ENABLE_DVE]
					})
				]
			},
			tags: [AdlibTags.OFFTUBE_SET_DVE_NEXT]
		})
	)

	config.sources
		.filter(u => u.type === SourceLayerType.CAMERA)
		.slice(0, 5) // the first x cameras to create INP1/2/3 cam-adlibs from
		.forEach(o => {
			adlibItems.push(...makeCameraAdLibs(o, globalRank++))
		})

	config.sources
		.filter(u => u.type === SourceLayerType.CAMERA)
		.slice(0, 5) // the first x cameras to create preview cam-adlibs from
		.forEach(o => {
			adlibItems.push(...makeCameraAdLibs(o, globalRank++, true))
		})

	config.sources
		.filter(u => u.type === SourceLayerType.CAMERA)
		.slice(0, 5) // the first x cameras to create INP1/2/3 cam-adlibs from
		.forEach(o => {
			adlibItems.push(...makeCameraAdlibBoxes(o, globalRank++))
		})

	config.sources
		.filter(u => u.type === SourceLayerType.REMOTE && !u.id.match(`DP`))
		.slice(0, 10) // the first x cameras to create live-adlibs from
		.forEach(o => {
			adlibItems.push(...makeRemoteAdLibs(o, globalRank++))
		})

	config.sources
		.filter(u => u.type === SourceLayerType.REMOTE && !u.id.match(`DP`))
		.slice(0, 10) // the first x cameras to create INP1/2/3 live-adlibs from
		.forEach(o => {
			adlibItems.push(...makeRemoteAdlibBoxes(o, globalRank++))
		})

	return adlibItems
}

function getBaseline(config: OffTubeShowstyleBlueprintConfig): TSRTimelineObjBase[] {
	return [
		// Default timeline
		literal<TimelineObjAtemME>({
			id: '',
			enable: { while: '1' },
			priority: 0,
			layer: OfftubeAtemLLayer.AtemMEClean,
			content: {
				deviceType: DeviceType.ATEM,
				type: TimelineContentTypeAtem.ME,
				me: {
					input: config.studio.AtemSource.Default,
					transition: AtemTransitionStyle.CUT
				}
			}
		}),

		// route default outputs
		literal<TimelineObjAtemAUX>({
			id: '',
			enable: { while: '1' },
			priority: 0,
			layer: OfftubeAtemLLayer.AtemAuxClean,
			content: {
				deviceType: DeviceType.ATEM,
				type: TimelineContentTypeAtem.AUX,
				aux: {
					input: AtemSourceIndex.Prg2
				}
			}
		}),
		literal<TimelineObjAtemAUX>({
			id: '',
			enable: { while: '1' },
			priority: 0,
			layer: OfftubeAtemLLayer.AtemAuxScreen,
			content: {
				deviceType: DeviceType.ATEM,
				type: TimelineContentTypeAtem.AUX,
				aux: {
					input: config.studio.AtemSource.Loop
				}
			}
		}),

		// keyers
		literal<TimelineObjAtemDSK>({
			id: '',
			enable: { while: `!.${Enablers.OFFTUBE_ENABLE_FULL}` },
			priority: 0,
			layer: OfftubeAtemLLayer.AtemDSKGraphics,
			content: {
				deviceType: DeviceType.ATEM,
				type: TimelineContentTypeAtem.DSK,
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
		literal<TimelineObjAtemSsrcProps>({
			id: '',
			enable: { while: '1' },
			priority: 0,
			layer: OfftubeAtemLLayer.AtemSSrcArt,
			content: {
				deviceType: DeviceType.ATEM,
				type: TimelineContentTypeAtem.SSRCPROPS,
				ssrcProps: {
					artFillSource: config.studio.AtemSource.SplitArtF,
					artCutSource: config.studio.AtemSource.SplitArtK,
					artOption: 1, // foreground
					artPreMultiplied: true
				}
			}
		}),
		literal<TimelineObjAtemSsrc>({
			id: '',
			enable: { while: '1' },
			priority: 0,
			layer: OfftubeAtemLLayer.AtemSSrcDefault,
			content: {
				deviceType: DeviceType.ATEM,
				type: TimelineContentTypeAtem.SSRC,
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
		literal<TimelineObjCCGMedia>({
			id: '',
			enable: { while: '1' },
			priority: 0,
			layer: OfftubeCasparLLayer.CasparCGDVEFrame,
			content: {
				deviceType: DeviceType.CASPARCG,
				type: TimelineContentTypeCasparCg.MEDIA,
				file: 'empty',
				mixer: {
					opacity: 0
				},
				transitions: {
					inTransition: {
						type: Transition.CUT,
						duration: CONSTANTS.DefaultClipFadeOut
					}
				}
			}
		}),
		literal<TimelineObjCCGMedia>({
			id: '',
			enable: { while: '1' },
			priority: 0,
			layer: OfftubeCasparLLayer.CasparCGDVEKey,
			content: {
				deviceType: DeviceType.CASPARCG,
				type: TimelineContentTypeCasparCg.MEDIA,
				file: 'empty',
				mixer: {
					opacity: 0
				},
				transitions: {
					inTransition: {
						type: Transition.CUT,
						duration: CONSTANTS.DefaultClipFadeOut
					}
				}
			}
		}),
		literal<TimelineObjCCGMedia>({
			id: '',
			enable: { while: '1' },
			priority: 0,
			layer: OfftubeCasparLLayer.CasparCGDVETemplate,
			content: {
				deviceType: DeviceType.CASPARCG,
				type: TimelineContentTypeCasparCg.MEDIA,
				file: 'empty',
				mixer: {
					opacity: 0
				},
				transitions: {
					inTransition: {
						type: Transition.CUT,
						duration: CONSTANTS.DefaultClipFadeOut
					}
				}
			}
		}),
		literal<TimelineObjCCGMedia>({
			id: '',
			enable: { while: '1' },
			priority: 0,
			layer: OfftubeCasparLLayer.CasparCGDVELoop,
			content: {
				deviceType: DeviceType.CASPARCG,
				type: TimelineContentTypeCasparCg.MEDIA,
				file: 'empty',
				transitions: {
					inTransition: {
						type: Transition.CUT,
						duration: CONSTANTS.DefaultClipFadeOut
					}
				}
			}
		}),

		literal<TimelineObjCCGMedia>({
			id: '',
			enable: { while: '1' },
			priority: 0,
			layer: OfftubeCasparLLayer.CasparGraphicsFull,
			content: {
				deviceType: DeviceType.CASPARCG,
				type: TimelineContentTypeCasparCg.MEDIA,
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
			return literal<TimelineObjSisyfosMessage>({
				id: '',
				enable: { while: '1' },
				priority: 0,
				layer: llayer,
				content: {
					deviceType: DeviceType.SISYFOS,
					type: TimelineContentTypeSisyfos.SISYFOS,
					isPgm: channel.isPgm,
					visible: true,
					label: channel.label
				}
			})
		}),

		// Route ME 2 PGM to ME 1 PGM
		literal<TimelineObjAtemME>({
			id: '',
			enable: { while: '1' },
			priority: 0,
			layer: OfftubeAtemLLayer.AtemMEProgram,
			content: {
				deviceType: DeviceType.ATEM,
				type: TimelineContentTypeAtem.ME,
				me: {
					input: AtemSourceIndex.Prg2,
					transition: AtemTransitionStyle.CUT
				}
			}
		}),

		...(config.showStyle.CasparCGLoadingClip && config.showStyle.CasparCGLoadingClip.length
			? [...config.mediaPlayers.map(mp => CasparPlayerClipLoadingLoop(mp.id))].map(layer => {
					return literal<TimelineObjCCGMedia>({
						id: '',
						enable: { while: '1' },
						priority: 0,
						layer,
						content: {
							deviceType: DeviceType.CASPARCG,
							type: TimelineContentTypeCasparCg.MEDIA,
							file: config.showStyle.CasparCGLoadingClip,
							loop: true
						}
					})
			  })
			: [])
	]
}
