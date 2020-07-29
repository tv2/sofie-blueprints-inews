import {
	BlueprintResultRundown,
	GraphicsContent,
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
	ActionClearGraphics,
	ActionCutSourceToBox,
	ActionSelectDVELayout,
	ActionTakeWithTransition,
	GetCameraMetaData,
	GetEksternMetaData,
	GetLayersForCamera,
	GetLayersForEkstern,
	GetSisyfosTimelineObjForCamera,
	GetSisyfosTimelineObjForEkstern,
	GraphicLLayer,
	literal,
	SourceInfo,
	TimelineBlueprintExt
} from 'tv2-common'
import { AdlibActionType, AdlibTags, CONSTANTS } from 'tv2-constants'
import * as _ from 'underscore'
import { AtemLLayer, CasparLLayer, CasparPlayerClipLoadingLoop, SisyfosLLAyer } from '../tv2_afvd_studio/layers'
import { SisyfosChannel, sisyfosChannels } from '../tv2_afvd_studio/sisyfosChannels'
import { AtemSourceIndex } from '../types/atem'
import { BlueprintConfig, parseConfig } from './helpers/config'
import { boxLayers } from './helpers/content/dve'
import { SourceLayer } from './layers'
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
		globalAdLibPieces: getGlobalAdLibPiecesAFKD(context, config),
		globalActions: getGlobalAdlibActionsAFVD(context, config),
		baseline: getBaseline(config)
	}
}

function getGlobalAdLibPiecesAFKD(context: NotesContext, config: BlueprintConfig): IBlueprintAdLibPiece[] {
	function makeCameraAdLibs(info: SourceInfo, rank: number, preview: boolean = false): IBlueprintAdLibPiece[] {
		const res: IBlueprintAdLibPiece[] = []
		const camSisyfos = GetSisyfosTimelineObjForCamera(context, config, `Kamera ${info.id}`)
		res.push({
			externalId: 'cam',
			name: `Kamera ${info.id}`,
			_rank: rank,
			sourceLayerId: SourceLayer.PgmCam,
			outputLayerId: 'pgm',
			expectedDuration: 0,
			infiniteMode: PieceLifespan.OutOnNextPart,
			toBeQueued: preview,
			metaData: GetCameraMetaData(config, GetLayersForCamera(config, info)),
			content: {
				timelineObjects: _.compact<TSR.TSRTimelineObj>([
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
						SisyfosLLAyer.SisyfosSourceClipPending,
						SisyfosLLAyer.SisyfosSourceServerA,
						SisyfosLLAyer.SisyfosSourceServerB
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

	function makeEVSAdLibs(info: SourceInfo, rank: number, vo: boolean): IBlueprintAdLibPiece[] {
		const res: IBlueprintAdLibPiece[] = []
		res.push({
			externalId: 'delayed',
			name: `Delayed Playback`,
			_rank: rank,
			sourceLayerId: SourceLayer.PgmDelayed,
			outputLayerId: 'pgm',
			expectedDuration: 0,
			infiniteMode: PieceLifespan.OutOnNextPart,
			toBeQueued: true,
			metaData: GetEksternMetaData(config.stickyLayers, config.studio.StudioMics, info.sisyfosLayers),
			content: {
				timelineObjects: _.compact<TSR.TSRTimelineObj>([
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
						},
						classes: ['adlib_deparent']
					}),
					...(info.sisyfosLayers || []).map(l => {
						return literal<TSR.TimelineObjSisyfosChannel>({
							id: '',
							enable: { while: '1' },
							priority: 1,
							layer: l,
							content: {
								deviceType: TSR.DeviceType.SISYFOS,
								type: TSR.TimelineContentTypeSisyfos.CHANNEL,
								isPgm: vo ? 2 : 1
							}
						})
					}),
					...config.stickyLayers
						.filter(layer => !info.sisyfosLayers || !info.sisyfosLayers.includes(layer))
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
					...GetSisyfosTimelineObjForCamera(context, config, 'evs')
				])
			}
		})

		return res
	}

	function makeRemoteAdLibs(info: SourceInfo, rank: number): IBlueprintAdLibPiece[] {
		const res: IBlueprintAdLibPiece[] = []
		const eksternSisyfos = [
			...GetSisyfosTimelineObjForEkstern(context, config.sources, `Live ${info.id}`, GetLayersForEkstern),
			...GetSisyfosTimelineObjForCamera(context, config, 'telefon')
		]
		res.push({
			externalId: 'live',
			name: `Ekstern ${info.id}`,
			_rank: rank,
			sourceLayerId: SourceLayer.PgmLive,
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
				timelineObjects: _.compact<TSR.TSRTimelineObj>([
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
						},
						classes: ['adlib_deparent']
					}),
					...eksternSisyfos,
					...config.stickyLayers
						.filter(layer => eksternSisyfos.map(obj => obj.layer).indexOf(layer) === -1)
						.filter(layer => config.liveAudio.indexOf(layer) === -1)
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
						SisyfosLLAyer.SisyfosSourceClipPending,
						SisyfosLLAyer.SisyfosSourceServerA,
						SisyfosLLAyer.SisyfosSourceServerB
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

	// aux adlibs
	function makeRemoteAuxStudioAdLibs(info: SourceInfo, rank: number): IBlueprintAdLibPiece[] {
		const res: IBlueprintAdLibPiece[] = []
		res.push({
			externalId: 'auxstudio',
			name: info.id + '',
			_rank: rank,
			sourceLayerId: SourceLayer.AuxStudioScreen,
			outputLayerId: 'aux',
			expectedDuration: 0,
			infiniteMode: PieceLifespan.Infinite,
			metaData: GetEksternMetaData(
				config.stickyLayers,
				config.studio.StudioMics,
				GetLayersForEkstern(context, config.sources, `Live ${info.id}`)
			),
			content: {
				timelineObjects: _.compact<TSR.TSRTimelineObj>([
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
				])
			}
		})

		return res
	}

	const adlibItems: IBlueprintAdLibPiece[] = []

	let globalRank = 1000

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
		.filter(u => u.type === SourceLayerType.REMOTE && !u.id.match(`DP`))
		.slice(0, 10) // the first x cameras to create live-adlibs from
		.forEach(o => {
			adlibItems.push(...makeRemoteAdLibs(o, globalRank++))
		})

	config.sources
		.filter(u => u.type === SourceLayerType.REMOTE && !u.id.match(`DP`))
		.slice(0, 10) // the first x lives to create AUX1 (studio) adlibs
		.forEach(o => {
			adlibItems.push(...makeRemoteAuxStudioAdLibs(o, globalRank++))
		})

	config.sources
		.filter(u => u.type === SourceLayerType.REMOTE && !!u.id.match(`DP`))
		.forEach(o => {
			adlibItems.push(...makeEVSAdLibs(o, globalRank++, false))
			adlibItems.push(...makeEVSAdLibs(o, globalRank++, true))
			adlibItems.push({
				externalId: 'delayedaux',
				name: `Delayed Playback in studio aux`,
				_rank: globalRank++,
				sourceLayerId: SourceLayer.AuxStudioScreen,
				outputLayerId: 'aux',
				expectedDuration: 0,
				infiniteMode: PieceLifespan.Infinite,
				content: {
					timelineObjects: _.compact<TSR.TSRTimelineObj>([
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
					])
				}
			})
			adlibItems.push({
				externalId: 'delayedaux',
				name: `Delayed Playback in viz aux`,
				_rank: globalRank++,
				sourceLayerId: SourceLayer.VizFullIn1,
				outputLayerId: 'aux',
				expectedDuration: 0,
				infiniteMode: PieceLifespan.Infinite,
				content: {
					timelineObjects: _.compact<TSR.TSRTimelineObj>([
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
					])
				}
			})
		})

	// the rank (order) of adlibs on SourceLayer.PgmAdlibVizCmd is important, to ensure keyboard shortcuts
	adlibItems.push({
		externalId: 'loadGFX',
		name: 'OVL INIT',
		_rank: 100,
		sourceLayerId: SourceLayer.PgmAdlibVizCmd,
		outputLayerId: 'sec',
		expectedDuration: 1000,
		infiniteMode: PieceLifespan.Normal,
		tags: [AdlibTags.ADLIB_STATIC_BUTTON],
		content: {
			timelineObjects: _.compact<TSR.TSRTimelineObj>([
				literal<TSR.TimelineObjVIZMSELoadAllElements>({
					id: 'loadAllElements',
					enable: {
						start: 0,
						duration: 1000
					},
					priority: 100,
					layer: GraphicLLayer.GraphicLLayerAdLibs,
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
		sourceLayerId: SourceLayer.PgmAdlibVizCmd,
		outputLayerId: 'sec',
		expectedDuration: 1000,
		infiniteMode: PieceLifespan.Normal,
		tags: [AdlibTags.ADLIB_STATIC_BUTTON],
		content: {
			timelineObjects: _.compact<TSR.TSRTimelineObj>([
				literal<TSR.TimelineObjVIZMSEElementContinue>({
					id: '',
					enable: {
						start: 0,
						duration: 1000
					},
					priority: 100,
					layer: GraphicLLayer.GraphicLLayerAdLibs,
					content: {
						deviceType: TSR.DeviceType.VIZMSE,
						type: TSR.TimelineContentTypeVizMSE.CONTINUE,
						direction: 1,
						reference: GraphicLLayer.GraphicLLayerPilot
					}
				})
			])
		}
	})

	adlibItems.push({
		externalId: 'sendAltud',
		name: 'GFX Altud',
		_rank: 400,
		sourceLayerId: SourceLayer.PgmAdlibVizCmd,
		outputLayerId: 'sec',
		expectedDuration: 2000,
		infiniteMode: PieceLifespan.Normal,
		content: {
			timelineObjects: _.compact<TSR.TSRTimelineObj>([
				literal<TSR.TimelineObjVIZMSEClearAllElements>({
					id: '',
					enable: {
						start: 1000,
						duration: 1000
					},
					priority: 100,
					layer: GraphicLLayer.GraphicLLayerAdLibs,
					content: {
						deviceType: TSR.DeviceType.VIZMSE,
						type: TSR.TimelineContentTypeVizMSE.CLEAR_ALL_ELEMENTS
					}
				})
			])
		}
	})
	// the rank (order) of adlibs on SourceLayer.PgmAdlibVizCmd is important, to ensure keyboard shortcuts
	adlibItems.push({
		externalId: 'dskoff',
		name: 'DSK OFF',
		_rank: 500,
		sourceLayerId: SourceLayer.PgmDSK,
		outputLayerId: 'sec',
		infiniteMode: PieceLifespan.Infinite,
		tags: [AdlibTags.ADLIB_STATIC_BUTTON],
		content: {
			timelineObjects: _.compact<TSR.TSRTimelineObj>([
				literal<TSR.TimelineObjAtemDSK>({
					id: '',
					enable: { while: '1' },
					priority: 10,
					layer: AtemLLayer.AtemDSKGraphics,
					content: {
						deviceType: TSR.DeviceType.ATEM,
						type: TSR.TimelineContentTypeAtem.DSK,
						dsk: {
							onAir: false
						}
					}
				})
			])
		}
	})

	adlibItems.push({
		externalId: 'micUp',
		name: 'Mics Up',
		_rank: 600,
		sourceLayerId: SourceLayer.PgmSisyfosAdlibs,
		outputLayerId: 'sec',
		infiniteMode: PieceLifespan.Infinite,
		tags: [AdlibTags.ADLIB_STATIC_BUTTON],
		expectedDuration: 0,
		content: {
			timelineObjects: _.compact<TSR.TSRTimelineObj>([
				...config.studio.StudioMics.map<TSR.TimelineObjSisyfosChannel>(layer => {
					return literal<TSR.TimelineObjSisyfosChannel>({
						id: '',
						enable: { start: 0 },
						priority: 1,
						layer,
						content: {
							deviceType: TSR.DeviceType.SISYFOS,
							type: TSR.TimelineContentTypeSisyfos.CHANNEL,
							isPgm: 1
						}
					})
				})
			])
		}
	})

	adlibItems.push({
		externalId: 'micDown',
		name: 'Mics Down',
		_rank: 650,
		sourceLayerId: SourceLayer.PgmSisyfosAdlibs,
		outputLayerId: 'sec',
		infiniteMode: PieceLifespan.Infinite,
		tags: [AdlibTags.ADLIB_STATIC_BUTTON],
		expectedDuration: 0,
		content: {
			timelineObjects: _.compact<TSR.TSRTimelineObj>([
				...config.studio.StudioMics.map<TSR.TimelineObjSisyfosChannel>(layer => {
					return literal<TSR.TimelineObjSisyfosChannel>({
						id: '',
						enable: { start: 0 },
						priority: 1,
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

	adlibItems.push({
		externalId: 'resyncSisyfos',
		name: 'Resync Sisyfos',
		_rank: 700,
		sourceLayerId: SourceLayer.PgmSisyfosAdlibs,
		outputLayerId: 'sec',
		infiniteMode: PieceLifespan.Normal,
		tags: [AdlibTags.ADLIB_STATIC_BUTTON],
		expectedDuration: 1000,
		content: {
			timelineObjects: _.compact<TSR.TSRTimelineObj>([
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
			])
		}
	})

	// viz styles and dve backgrounds
	adlibItems.push(
		literal<IBlueprintAdLibPiece>({
			_rank: 301,
			externalId: 'dve-design-sc',
			name: 'DVE Design SC',
			outputLayerId: 'sec',
			sourceLayerId: SourceLayer.PgmDesign,
			infiniteMode: PieceLifespan.Infinite,
			content: literal<GraphicsContent>({
				fileName: 'BG_LOADER_SC',
				path: 'BG_LOADER_SC',
				timelineObjects: _.compact<TSR.TSRTimelineObj>([
					literal<TSR.TimelineObjVIZMSEElementInternal>({
						id: '',
						enable: { start: 0 },
						priority: 110,
						layer: GraphicLLayer.GraphicLLayerDesign,
						content: {
							deviceType: TSR.DeviceType.VIZMSE,
							type: TSR.TimelineContentTypeVizMSE.ELEMENT_INTERNAL,
							templateName: 'BG_LOADER_SC',
							templateData: []
						}
					}),
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
				])
			})
		})
	)

	adlibItems.push({
		externalId: 'stopAudioBed',
		name: 'Stop Soundplayer',
		_rank: 700,
		sourceLayerId: SourceLayer.PgmAudioBed,
		outputLayerId: 'musik',
		expectedDuration: 1000,
		infiniteMode: PieceLifespan.Normal,
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

function getGlobalAdlibActionsAFVD(_context: ShowStyleContext, config: BlueprintConfig): IBlueprintActionManifest[] {
	const res: IBlueprintActionManifest[] = []

	let globalRank = 1000

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
						outputLayerId: 'sec',
						content: {},
						tags: []
					}
				})
			)
		})
	}

	function makeAdlibBoxesActionsDirectPlayback(info: SourceInfo, vo: boolean, rank: number) {
		Object.values(boxLayers).forEach((layer, box) => {
			res.push(
				literal<IBlueprintActionManifest>({
					actionId: AdlibActionType.CUT_SOURCE_TO_BOX,
					userData: literal<ActionCutSourceToBox>({
						type: AdlibActionType.CUT_SOURCE_TO_BOX,
						name: `DP ${info.id}`,
						port: info.port,
						sourceType: info.type,
						box,
						vo
					}),
					userDataManifest: {},
					display: {
						_rank: rank + 0.1 * box,
						label: `Cut EVS ${info.id}${vo ? 'VO' : ''} to box ${box + 1}`,
						sourceLayerId: layer,
						outputLayerId: 'sec',
						content: {},
						tags: []
					}
				})
			)
		})
	}

	function makeServerAdlibBoxesActions(rank: number) {
		Object.values(boxLayers).forEach((layer, box) => {
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
						label: `Cut server to box ${box + 1}`,
						sourceLayerId: layer,
						outputLayerId: 'sec',
						content: {},
						tags: []
					}
				})
			)
		})
	}

	config.sources
		.filter(u => u.type === SourceLayerType.CAMERA)
		.slice(0, 5) // the first x cameras to create preview cam-adlibs from
		.forEach(o => {
			makeAdlibBoxesActions(o, 'Kamera', globalRank++)
		})

	config.sources
		.filter(u => u.type === SourceLayerType.REMOTE && !u.id.match(`DP`))
		.slice(0, 10) // the first x remote to create INP1/2/3 live-adlibs from
		.forEach(o => {
			makeAdlibBoxesActions(o, 'Live', globalRank++)
		})

	config.sources
		.filter(u => u.type === SourceLayerType.REMOTE && !!u.id.match(`DP`))
		.slice(0, 10) // the first x remote to create INP1/2/3 live-adlibs from
		.forEach(o => {
			makeAdlibBoxesActionsDirectPlayback(o, false, globalRank++)
			makeAdlibBoxesActionsDirectPlayback(o, true, globalRank++)
		})

	makeServerAdlibBoxesActions(globalRank++)

	res.push(
		literal<IBlueprintActionManifest>({
			actionId: AdlibActionType.CLEAR_GRAPHICS,
			userData: literal<ActionClearGraphics>({
				type: AdlibActionType.CLEAR_GRAPHICS
			}),
			userDataManifest: {},
			display: {
				_rank: 300,
				label: `GFX Clear`,
				sourceLayerId: SourceLayer.PgmAdlibVizCmd,
				outputLayerId: 'sec',
				content: {},
				tags: [AdlibTags.ADLIB_STATIC_BUTTON]
			}
		})
	)

	res.push(
		literal<IBlueprintActionManifest>({
			actionId: AdlibActionType.TAKE_WITH_TRANSITION,
			userData: literal<ActionTakeWithTransition>({
				type: AdlibActionType.TAKE_WITH_TRANSITION,
				variant: {
					type: 'mix',
					frames: config.showStyle.TakeWithMixDuration
				}
			}),
			userDataManifest: {},
			display: {
				_rank: 800,
				label: 'MIX',
				sourceLayerId: SourceLayer.PgmJingle,
				outputLayerId: 'pgm',
				tags: [AdlibTags.ADLIB_STATIC_BUTTON]
			}
		})
	)

	config.showStyle.TakeEffekts.forEach((effekt, i) => {
		res.push(
			literal<IBlueprintActionManifest>({
				actionId: AdlibActionType.TAKE_WITH_TRANSITION,
				userData: literal<ActionTakeWithTransition>({
					type: AdlibActionType.TAKE_WITH_TRANSITION,
					variant: {
						type: 'effekt',
						effekt: Number(effekt.Effekt)
					}
				}),
				userDataManifest: {},
				display: {
					_rank: 810 + 0.01 * i,
					label: `EFFEKT ${effekt.Effekt}`,
					sourceLayerId: SourceLayer.PgmJingle,
					outputLayerId: 'pgm',
					tags: [AdlibTags.ADLIB_STATIC_BUTTON]
				}
			})
		)
	})

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
					sourceLayerId: SourceLayer.PgmDVEAdlib,
					outputLayerId: 'pgm'
				}
			})
		)
	})

	return res
}

function getBaseline(config: BlueprintConfig): TSR.TSRTimelineObjBase[] {
	return [
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
		literal<TSR.TimelineObjAtemDSK>({
			id: '',
			enable: { while: '1' },
			priority: 0,
			layer: AtemLLayer.AtemDSKGraphics,
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
						preMultiply: false,
						clip: config.studio.AtemSettings.VizClip * 10, // input is percents (0-100), atem uses 1-000,
						gain: config.studio.AtemSettings.VizGain * 10, // input is percents (0-100), atem uses 1-000,
						mask: {
							enabled: false
						}
					}
				}
			}
		}),
		literal<TSR.TimelineObjAtemDSK>({
			id: '',
			enable: { while: '1' },
			priority: 0,
			layer: AtemLLayer.AtemDSKEffect,
			content: {
				deviceType: TSR.DeviceType.ATEM,
				type: TSR.TimelineContentTypeAtem.DSK,
				dsk: {
					onAir: false,
					sources: {
						fillSource: config.studio.AtemSource.JingleFill,
						cutSource: config.studio.AtemSource.JingleKey
					},
					properties: {
						tie: false,
						preMultiply: false,
						clip: config.studio.AtemSettings.CCGClip * 10, // input is percents (0-100), atem uses 1-000,
						gain: config.studio.AtemSettings.CCGGain * 10, // input is percents (0-100), atem uses 1-000,
						mask: {
							enabled: false
						}
					}
				}
			}
		}),
		// slaves the DSK2 for jingles to ME4 USK1 to have effects on CLEAN (ME4)
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
							fillSource: config.studio.AtemSource.JingleFill,
							cutSource: config.studio.AtemSource.JingleKey,
							maskEnabled: false,
							lumaSettings: {
								preMultiplied: false,
								clip: config.studio.AtemSettings.CCGClip * 10, // input is percents (0-100), atem uses 1-000
								gain: config.studio.AtemSettings.CCGGain * 10 // input is percents (0-100), atem uses 1-000
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
					artOption: 1, // foreground
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
			layer: CasparLLayer.CasparCGDVETemplate,
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

		// create sisyfos channels from the config
		...Object.keys(sisyfosChannels).map(key => {
			const llayer = key as SisyfosLLAyer
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
					visible: !channel.hideInStudioA,
					label: channel.label
				}
			})
		}),

		literal<TSR.TimelineObjCCGMedia>({
			id: '',
			enable: { while: '1' },
			priority: 0,
			layer: CasparLLayer.CasparCGLYD,
			content: {
				deviceType: TSR.DeviceType.CASPARCG,
				type: TSR.TimelineContentTypeCasparCg.MEDIA,
				loop: true,
				file: 'EMPTY',
				mixer: {
					volume: {
						_value: 0,
						inTransition: {
							type: TSR.Transition.MIX,
							easing: TSR.Ease.LINEAR,
							direction: TSR.Direction.LEFT,
							duration: config.studio.AudioBedSettings.fadeIn
						},
						changeTransition: {
							type: TSR.Transition.MIX,
							easing: TSR.Ease.LINEAR,
							direction: TSR.Direction.LEFT,
							duration: config.studio.AudioBedSettings.fadeOut
						},
						outTransition: {
							type: TSR.Transition.MIX,
							easing: TSR.Ease.LINEAR,
							direction: TSR.Direction.LEFT,
							duration: config.studio.AudioBedSettings.fadeOut
						}
					}
				},
				transitions: {
					inTransition: {
						type: TSR.Transition.MIX,
						easing: TSR.Ease.LINEAR,
						direction: TSR.Direction.LEFT,
						duration: config.studio.AudioBedSettings.fadeIn
					},
					outTransition: {
						type: TSR.Transition.MIX,
						easing: TSR.Ease.LINEAR,
						direction: TSR.Direction.LEFT,
						duration: config.studio.AudioBedSettings.fadeOut
					}
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
