import {
	GraphicsContent,
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPart,
	IBlueprintPiece,
	PieceLifespan,
	TSR,
	WithTimeline
} from '@tv2media/blueprints-integration'
import {
	AtemLLayerDSK,
	CueDefinitionGraphic,
	GraphicInternal,
	GraphicPilot,
	literal,
	PartDefinitionKam
} from 'tv2-common'
import { AbstractLLayer, AdlibTags, CueType, PartType, SharedGraphicLLayer, SharedOutputLayers } from 'tv2-constants'
import { SegmentUserContext } from '../../../../__mocks__/context'
import { parseConfig as parseStudioConfig } from '../../../../tv2_afvd_studio/helpers/config'
import mappingsDefaults from '../../../../tv2_afvd_studio/migrations/mappings-defaults'
import { defaultShowStyleConfig, defaultStudioConfig, OVL_SHOW_ID } from '../../../__tests__/configs'
import { SourceLayer } from '../../../layers'
import { BlueprintConfig, getConfig, parseConfig as parseShowStyleConfig } from '../../config'
import { EvaluateCueGraphic } from '../graphic'

function makeMockContext() {
	const mockContext = new SegmentUserContext('test', mappingsDefaults, parseStudioConfig, parseShowStyleConfig)
	mockContext.studioConfig = defaultStudioConfig as any
	mockContext.showStyleConfig = defaultShowStyleConfig as any

	return mockContext
}

const config = getConfig(makeMockContext())

const dummyPart = literal<PartDefinitionKam>({
	type: PartType.Kam,
	variant: {
		name: '1'
	},
	externalId: '0001',
	rawType: 'Kam 1',
	cues: [],
	script: '',
	storyName: '',
	fields: {},
	modified: 0,
	segmentExternalId: ''
})

const dummyBlueprintPart: IBlueprintPart = {
	title: 'Kam 1',
	externalId: '0001'
}

const dskEnableObj = literal<TSR.TimelineObjAtemDSK>({
	id: '',
	enable: {
		start: 0
	},
	priority: 1,
	layer: AtemLLayerDSK(0),
	content: {
		deviceType: TSR.DeviceType.ATEM,
		type: TSR.TimelineContentTypeAtem.DSK,
		dsk: {
			onAir: true,
			sources: {
				fillSource: 21,
				cutSource: 34
			},
			properties: {
				clip: 500,
				gain: 125,
				mask: {
					enabled: false
				}
			}
		}
	}
})

describe('grafik piece', () => {
	test('kg bund', () => {
		const cue: CueDefinitionGraphic<GraphicInternal> = {
			type: CueType.Graphic,
			target: 'OVL',
			graphic: {
				type: 'internal',
				template: 'bund',
				cue: 'kg',
				textFields: ['Odense', 'Copenhagen']
			},
			start: {
				seconds: 0
			},
			iNewsCommand: 'kg'
		}
		const pieces: IBlueprintPiece[] = []
		const adLibPieces: IBlueprintAdLibPiece[] = []
		const actions: IBlueprintActionManifest[] = []
		const partId = '0000000001'

		EvaluateCueGraphic(
			config,
			makeMockContext(),
			dummyBlueprintPart,
			pieces,
			adLibPieces,
			actions,
			partId,
			cue,
			cue.adlib ? cue.adlib : false,
			dummyPart,
			0
		)
		expect(pieces).toEqual([
			literal<IBlueprintPiece>({
				externalId: partId,
				name: 'bund - Odense\n - Copenhagen',
				enable: {
					start: 0,
					duration: 4000
				},
				lifespan: PieceLifespan.WithinPart,
				outputLayerId: SharedOutputLayers.OVERLAY,
				sourceLayerId: SourceLayer.PgmGraphicsLower,
				content: literal<WithTimeline<GraphicsContent>>({
					fileName: 'bund',
					path: 'bund',
					ignoreMediaObjectStatus: true,
					timelineObjects: literal<TSR.TSRTimelineObj[]>([
						literal<TSR.TimelineObjVIZMSEElementInternal>({
							id: '',
							enable: {
								while: '!.full'
							},
							priority: 1,
							layer: SharedGraphicLLayer.GraphicLLayerOverlayLower,
							content: {
								deviceType: TSR.DeviceType.VIZMSE,
								type: TSR.TimelineContentTypeVizMSE.ELEMENT_INTERNAL,
								templateName: 'bund',
								templateData: ['Odense', 'Copenhagen'],
								channelName: 'OVL1',
								showId: OVL_SHOW_ID
							}
						}),
						dskEnableObj
					])
				})
			})
		])
	})

	test('adlib kg bund', () => {
		const cue: CueDefinitionGraphic<GraphicInternal> = {
			type: CueType.Graphic,
			target: 'OVL',
			graphic: {
				type: 'internal',
				template: 'bund',
				cue: 'kg',
				textFields: ['Odense', 'Copenhagen']
			},
			adlib: true,
			iNewsCommand: 'kg'
		}
		const pieces: IBlueprintPiece[] = []
		const adLibPieces: IBlueprintAdLibPiece[] = []
		const actions: IBlueprintActionManifest[] = []
		const partId = '0000000001'

		EvaluateCueGraphic(
			config,
			makeMockContext(),
			dummyBlueprintPart,
			pieces,
			adLibPieces,
			actions,
			partId,
			cue,
			cue.adlib ? cue.adlib : false,
			dummyPart,
			0
		)
		expect(adLibPieces).toEqual([
			literal<IBlueprintAdLibPiece>({
				_rank: 0,
				externalId: partId,
				name: 'bund - Odense\n - Copenhagen',
				lifespan: PieceLifespan.WithinPart,
				outputLayerId: SharedOutputLayers.OVERLAY,
				sourceLayerId: SourceLayer.PgmGraphicsLower,
				uniquenessId: 'gfx_bund - Odense\n - Copenhagen_studio0_graphicsLower_overlay_commentator',
				expectedDuration: 5000,
				tags: [AdlibTags.ADLIB_KOMMENTATOR],
				noHotKey: true,
				content: literal<WithTimeline<GraphicsContent>>({
					fileName: 'bund',
					path: 'bund',
					ignoreMediaObjectStatus: true,
					timelineObjects: literal<TSR.TSRTimelineObj[]>([
						literal<TSR.TimelineObjVIZMSEElementInternal>({
							id: '',
							enable: {
								while: '!.full'
							},
							priority: 1,
							layer: SharedGraphicLLayer.GraphicLLayerOverlayLower,
							content: {
								deviceType: TSR.DeviceType.VIZMSE,
								type: TSR.TimelineContentTypeVizMSE.ELEMENT_INTERNAL,
								templateName: 'bund',
								templateData: ['Odense', 'Copenhagen'],
								channelName: 'OVL1',
								showId: OVL_SHOW_ID
							}
						}),
						dskEnableObj
					])
				})
			}),
			literal<IBlueprintAdLibPiece>({
				_rank: 0,
				externalId: partId,
				name: 'bund - Odense\n - Copenhagen',
				lifespan: PieceLifespan.WithinPart,
				outputLayerId: SharedOutputLayers.OVERLAY,
				sourceLayerId: SourceLayer.PgmGraphicsLower,
				uniquenessId: 'gfx_bund - Odense\n - Copenhagen_studio0_graphicsLower_overlay_flow',
				expectedDuration: 4000,
				tags: [AdlibTags.ADLIB_FLOW_PRODUCER],
				content: literal<WithTimeline<GraphicsContent>>({
					fileName: 'bund',
					path: 'bund',
					ignoreMediaObjectStatus: true,
					timelineObjects: literal<TSR.TSRTimelineObj[]>([
						literal<TSR.TimelineObjVIZMSEElementInternal>({
							id: '',
							enable: {
								while: '!.full'
							},
							priority: 1,
							layer: SharedGraphicLLayer.GraphicLLayerOverlayLower,
							content: {
								deviceType: TSR.DeviceType.VIZMSE,
								type: TSR.TimelineContentTypeVizMSE.ELEMENT_INTERNAL,
								templateName: 'bund',
								templateData: ['Odense', 'Copenhagen'],
								channelName: 'OVL1',
								showId: OVL_SHOW_ID
							}
						}),
						dskEnableObj
					])
				})
			})
		])
	})

	test('adlib kg bund (overlay+full allowed)', () => {
		const cue: CueDefinitionGraphic<GraphicInternal> = {
			type: CueType.Graphic,
			target: 'OVL',
			graphic: {
				type: 'internal',
				template: 'bund',
				cue: 'kg',
				textFields: ['Odense', 'Copenhagen']
			},
			adlib: true,
			iNewsCommand: 'kg'
		}
		const pieces: IBlueprintPiece[] = []
		const adLibPieces: IBlueprintAdLibPiece[] = []
		const actions: IBlueprintActionManifest[] = []
		const partId = '0000000001'
		const newConfig = JSON.parse(JSON.stringify(config)) as BlueprintConfig
		newConfig.studio.PreventOverlayWithFull = false

		EvaluateCueGraphic(
			newConfig,
			makeMockContext(),
			dummyBlueprintPart,
			pieces,
			adLibPieces,
			actions,
			partId,
			cue,
			cue.adlib ? cue.adlib : false,
			dummyPart,
			0
		)
		expect(adLibPieces).toEqual([
			literal<IBlueprintAdLibPiece>({
				_rank: 0,
				externalId: partId,
				name: 'bund - Odense\n - Copenhagen',
				lifespan: PieceLifespan.WithinPart,
				outputLayerId: SharedOutputLayers.OVERLAY,
				sourceLayerId: SourceLayer.PgmGraphicsLower,
				uniquenessId: 'gfx_bund - Odense\n - Copenhagen_studio0_graphicsLower_overlay_commentator',
				tags: [AdlibTags.ADLIB_KOMMENTATOR],
				expectedDuration: 5000,
				noHotKey: true,
				content: literal<WithTimeline<GraphicsContent>>({
					fileName: 'bund',
					path: 'bund',
					ignoreMediaObjectStatus: true,
					timelineObjects: literal<TSR.TSRTimelineObj[]>([
						literal<TSR.TimelineObjVIZMSEElementInternal>({
							id: '',
							enable: {
								start: 0
							},
							priority: 1,
							layer: SharedGraphicLLayer.GraphicLLayerOverlayLower,
							content: {
								deviceType: TSR.DeviceType.VIZMSE,
								type: TSR.TimelineContentTypeVizMSE.ELEMENT_INTERNAL,
								templateName: 'bund',
								templateData: ['Odense', 'Copenhagen'],
								channelName: 'OVL1',
								showId: OVL_SHOW_ID
							}
						}),
						dskEnableObj
					])
				})
			}),
			literal<IBlueprintAdLibPiece>({
				_rank: 0,
				externalId: partId,
				name: 'bund - Odense\n - Copenhagen',
				lifespan: PieceLifespan.WithinPart,
				outputLayerId: SharedOutputLayers.OVERLAY,
				sourceLayerId: SourceLayer.PgmGraphicsLower,
				uniquenessId: 'gfx_bund - Odense\n - Copenhagen_studio0_graphicsLower_overlay_flow',
				tags: [AdlibTags.ADLIB_FLOW_PRODUCER],
				expectedDuration: 4000,
				content: literal<WithTimeline<GraphicsContent>>({
					fileName: 'bund',
					path: 'bund',
					ignoreMediaObjectStatus: true,
					timelineObjects: literal<TSR.TSRTimelineObj[]>([
						literal<TSR.TimelineObjVIZMSEElementInternal>({
							id: '',
							enable: {
								start: 0
							},
							priority: 1,
							layer: SharedGraphicLLayer.GraphicLLayerOverlayLower,
							content: {
								deviceType: TSR.DeviceType.VIZMSE,
								type: TSR.TimelineContentTypeVizMSE.ELEMENT_INTERNAL,
								templateName: 'bund',
								templateData: ['Odense', 'Copenhagen'],
								channelName: 'OVL1',
								showId: OVL_SHOW_ID
							}
						}),
						dskEnableObj
					])
				})
			})
		])
	})

	test('kg bund length', () => {
		const cue: CueDefinitionGraphic<GraphicInternal> = {
			type: CueType.Graphic,
			target: 'OVL',
			graphic: {
				type: 'internal',
				template: 'bund',
				cue: 'kg',
				textFields: ['Odense', 'Copenhagen']
			},
			start: {
				seconds: 10
			},
			iNewsCommand: 'kg'
		}
		const pieces: IBlueprintPiece[] = []
		const adLibPieces: IBlueprintAdLibPiece[] = []
		const actions: IBlueprintActionManifest[] = []
		const partId = '0000000001'

		EvaluateCueGraphic(
			config,
			makeMockContext(),
			dummyBlueprintPart,
			pieces,
			adLibPieces,
			actions,
			partId,
			cue,
			cue.adlib ? cue.adlib : false,
			dummyPart,
			0
		)
		expect(pieces).toEqual([
			literal<IBlueprintPiece>({
				externalId: partId,
				name: 'bund - Odense\n - Copenhagen',
				enable: {
					start: 10000,
					duration: 4000
				},
				lifespan: PieceLifespan.WithinPart,
				outputLayerId: SharedOutputLayers.OVERLAY,
				sourceLayerId: SourceLayer.PgmGraphicsLower,
				content: literal<WithTimeline<GraphicsContent>>({
					fileName: 'bund',
					path: 'bund',
					ignoreMediaObjectStatus: true,
					timelineObjects: literal<TSR.TSRTimelineObj[]>([
						literal<TSR.TimelineObjVIZMSEElementInternal>({
							id: '',
							enable: {
								while: '!.full'
							},
							priority: 1,
							layer: SharedGraphicLLayer.GraphicLLayerOverlayLower,
							content: {
								deviceType: TSR.DeviceType.VIZMSE,
								type: TSR.TimelineContentTypeVizMSE.ELEMENT_INTERNAL,
								templateName: 'bund',
								templateData: ['Odense', 'Copenhagen'],
								channelName: 'OVL1',
								showId: OVL_SHOW_ID
							}
						}),
						dskEnableObj
					])
				})
			})
		])
	})

	test('kg bund infinite', () => {
		const cue: CueDefinitionGraphic<GraphicInternal> = {
			type: CueType.Graphic,
			target: 'OVL',
			graphic: {
				type: 'internal',
				template: 'bund',
				cue: 'kg',
				textFields: ['Odense', 'Copenhagen']
			},
			start: {
				seconds: 10
			},
			end: {
				infiniteMode: 'B'
			},
			iNewsCommand: 'kg'
		}
		const pieces: IBlueprintPiece[] = []
		const adLibPieces: IBlueprintAdLibPiece[] = []
		const actions: IBlueprintActionManifest[] = []
		const partId = '0000000001'

		EvaluateCueGraphic(
			config,
			makeMockContext(),
			dummyBlueprintPart,
			pieces,
			adLibPieces,
			actions,
			partId,
			cue,
			cue.adlib ? cue.adlib : false,
			dummyPart,
			0
		)
		expect(pieces).toEqual([
			literal<IBlueprintPiece>({
				externalId: partId,
				name: 'bund - Odense\n - Copenhagen',
				enable: {
					start: 10000
				},
				lifespan: PieceLifespan.WithinPart,
				outputLayerId: SharedOutputLayers.OVERLAY,
				sourceLayerId: SourceLayer.PgmGraphicsLower,
				content: literal<WithTimeline<GraphicsContent>>({
					fileName: 'bund',
					path: 'bund',
					ignoreMediaObjectStatus: true,
					timelineObjects: literal<TSR.TSRTimelineObj[]>([
						literal<TSR.TimelineObjVIZMSEElementInternal>({
							id: '',
							enable: {
								while: `.studio0_parent_camera_1 & !.adlib_deparent & !.full`
							},
							priority: 1,
							layer: SharedGraphicLLayer.GraphicLLayerOverlayLower,
							content: {
								deviceType: TSR.DeviceType.VIZMSE,
								type: TSR.TimelineContentTypeVizMSE.ELEMENT_INTERNAL,
								templateName: 'bund',
								templateData: ['Odense', 'Copenhagen'],
								channelName: 'OVL1',
								showId: OVL_SHOW_ID
							}
						}),
						dskEnableObj
					])
				})
			})
		])
	})

	test('kg direkte', () => {
		const cue = literal<CueDefinitionGraphic<GraphicInternal>>({
			type: CueType.Graphic,
			target: 'OVL',
			graphic: {
				type: 'internal',
				template: 'direkte',
				cue: 'kg',
				textFields: ['KØBENHAVN']
			},
			start: {
				seconds: 0
			},
			iNewsCommand: '#kg'
		})
		const pieces: IBlueprintPiece[] = []
		const adLibPieces: IBlueprintAdLibPiece[] = []
		const actions: IBlueprintActionManifest[] = []
		const partId = '0000000001'

		EvaluateCueGraphic(
			config,
			makeMockContext(),
			dummyBlueprintPart,
			pieces,
			adLibPieces,
			actions,
			partId,
			cue,
			cue.adlib ? cue.adlib : false,
			dummyPart,
			0
		)
		expect(pieces).toEqual([
			literal<IBlueprintPiece>({
				externalId: partId,
				name: 'direkte - KØBENHAVN',
				enable: {
					start: 0
				},
				lifespan: PieceLifespan.OutOnSegmentEnd,
				outputLayerId: SharedOutputLayers.OVERLAY,
				sourceLayerId: SourceLayer.PgmGraphicsIdentPersistent,
				content: literal<WithTimeline<GraphicsContent>>({
					fileName: 'direkte',
					path: 'direkte',
					ignoreMediaObjectStatus: true,
					timelineObjects: literal<TSR.TSRTimelineObj[]>([
						literal<TSR.TimelineObjVIZMSEElementInternal>({
							id: '',
							enable: {
								while: `.studio0_parent_camera_1 & !.adlib_deparent & !.full`
							},
							priority: 1,
							layer: SharedGraphicLLayer.GraphicLLayerOverlayIdent,
							content: {
								deviceType: TSR.DeviceType.VIZMSE,
								type: TSR.TimelineContentTypeVizMSE.ELEMENT_INTERNAL,
								templateName: 'direkte',
								templateData: ['KØBENHAVN'],
								channelName: 'OVL1',
								showId: OVL_SHOW_ID
							}
						}),
						dskEnableObj
					])
				})
			}),
			literal<IBlueprintPiece>({
				externalId: partId,
				name: 'direkte - KØBENHAVN',
				enable: {
					start: 0
				},
				lifespan: PieceLifespan.WithinPart,
				outputLayerId: SharedOutputLayers.OVERLAY,
				sourceLayerId: SourceLayer.PgmGraphicsIdent,
				content: {
					timelineObjects: [
						literal<TSR.TimelineObjAbstractAny>({
							id: '',
							enable: {
								while: '1'
							},
							layer: AbstractLLayer.IdentMarker,
							content: {
								deviceType: TSR.DeviceType.ABSTRACT
							}
						})
					]
				}
			})
		])
	})

	test('kg arkiv', () => {
		const cue = literal<CueDefinitionGraphic<GraphicInternal>>({
			type: CueType.Graphic,
			target: 'OVL',
			graphic: {
				type: 'internal',
				template: 'arkiv',
				cue: 'kg',
				textFields: ['unnamed org']
			},
			start: {
				seconds: 0
			},
			iNewsCommand: '#kg'
		})
		const pieces: IBlueprintPiece[] = []
		const adLibPieces: IBlueprintAdLibPiece[] = []
		const actions: IBlueprintActionManifest[] = []
		const partId = '0000000001'

		EvaluateCueGraphic(
			config,
			makeMockContext(),
			dummyBlueprintPart,
			pieces,
			adLibPieces,
			actions,
			partId,
			cue,
			cue.adlib ? cue.adlib : false,
			dummyPart,
			0
		)
		expect(pieces).toEqual([
			literal<IBlueprintPiece>({
				externalId: partId,
				name: 'arkiv - unnamed org',
				enable: {
					start: 0,
					duration: 4000
				},
				lifespan: PieceLifespan.WithinPart,
				outputLayerId: SharedOutputLayers.OVERLAY,
				sourceLayerId: SourceLayer.PgmGraphicsIdent,
				content: literal<WithTimeline<GraphicsContent>>({
					fileName: 'arkiv',
					path: 'arkiv',
					ignoreMediaObjectStatus: true,
					timelineObjects: literal<TSR.TSRTimelineObj[]>([
						literal<TSR.TimelineObjVIZMSEElementInternal>({
							id: '',
							enable: {
								while: `!.full`
							},
							priority: 1,
							layer: SharedGraphicLLayer.GraphicLLayerOverlayIdent,
							content: {
								deviceType: TSR.DeviceType.VIZMSE,
								type: TSR.TimelineContentTypeVizMSE.ELEMENT_INTERNAL,
								templateName: 'arkiv',
								templateData: ['unnamed org'],
								channelName: 'OVL1',
								showId: OVL_SHOW_ID
							}
						}),
						dskEnableObj
					])
				})
			})
		])
	})

	test('adlib tlftoptlive', () => {
		const cue = literal<CueDefinitionGraphic<GraphicInternal>>({
			type: CueType.Graphic,
			target: 'OVL',
			graphic: {
				type: 'internal',
				template: 'tlftoptlive',
				cue: 'kg',
				textFields: ['Line 1', 'Line 2']
			},
			adlib: true,
			iNewsCommand: '#kg'
		})
		const pieces: IBlueprintPiece[] = []
		const adLibPieces: IBlueprintAdLibPiece[] = []
		const actions: IBlueprintActionManifest[] = []
		const partId = '0000000001'

		EvaluateCueGraphic(
			config,
			makeMockContext(),
			dummyBlueprintPart,
			pieces,
			adLibPieces,
			actions,
			partId,
			cue,
			cue.adlib ? cue.adlib : false,
			dummyPart,
			0
		)
		expect(adLibPieces).toEqual([
			literal<IBlueprintAdLibPiece>({
				_rank: 0,
				externalId: partId,
				name: 'tlftoptlive - Line 1\n - Line 2',
				lifespan: PieceLifespan.WithinPart,
				outputLayerId: SharedOutputLayers.OVERLAY,
				sourceLayerId: SourceLayer.PgmGraphicsTop,
				expectedDuration: 5000,
				tags: ['kommentator'],
				uniquenessId: 'gfx_tlftoptlive - Line 1\n - Line 2_studio0_graphicsTop_overlay_commentator',
				noHotKey: true,
				content: literal<WithTimeline<GraphicsContent>>({
					fileName: 'tlftoptlive',
					path: 'tlftoptlive',
					ignoreMediaObjectStatus: true,
					timelineObjects: literal<TSR.TSRTimelineObj[]>([
						literal<TSR.TimelineObjVIZMSEElementInternal>({
							id: '',
							enable: {
								while: `!.full`
							},
							priority: 1,
							layer: SharedGraphicLLayer.GraphicLLayerOverlayTopt,
							content: {
								deviceType: TSR.DeviceType.VIZMSE,
								type: TSR.TimelineContentTypeVizMSE.ELEMENT_INTERNAL,
								templateName: 'tlftoptlive',
								templateData: ['Line 1', 'Line 2'],
								channelName: 'OVL1',
								showId: OVL_SHOW_ID
							}
						}),
						dskEnableObj
					])
				})
			}),
			literal<IBlueprintAdLibPiece>({
				_rank: 0,
				externalId: partId,
				name: 'tlftoptlive - Line 1\n - Line 2',
				lifespan: PieceLifespan.OutOnSegmentEnd,
				outputLayerId: SharedOutputLayers.OVERLAY,
				sourceLayerId: SourceLayer.PgmGraphicsTop,
				expectedDuration: 4000,
				tags: ['flow_producer'],
				uniquenessId: 'gfx_tlftoptlive - Line 1\n - Line 2_studio0_graphicsTop_overlay_flow',
				content: literal<WithTimeline<GraphicsContent>>({
					fileName: 'tlftoptlive',
					path: 'tlftoptlive',
					ignoreMediaObjectStatus: true,
					timelineObjects: literal<TSR.TSRTimelineObj[]>([
						literal<TSR.TimelineObjVIZMSEElementInternal>({
							id: '',
							enable: {
								while: `!.full`
							},
							priority: 1,
							layer: SharedGraphicLLayer.GraphicLLayerOverlayTopt,
							content: {
								deviceType: TSR.DeviceType.VIZMSE,
								type: TSR.TimelineContentTypeVizMSE.ELEMENT_INTERNAL,
								templateName: 'tlftoptlive',
								templateData: ['Line 1', 'Line 2'],
								channelName: 'OVL1',
								showId: OVL_SHOW_ID
							}
						}),
						dskEnableObj
					])
				})
			})
		])
	})

	it('Applies delay to WALL graphics when part has prerollDuration', () => {
		const partWithPreroll: IBlueprintPart = {
			title: 'Server',
			externalId: '0001',
			prerollDuration: 1000
		}
		const cue: CueDefinitionGraphic<GraphicPilot> = {
			type: CueType.Graphic,
			target: 'WALL',
			graphic: {
				type: 'pilot',
				name: '',
				vcpid: 1234567890,
				continueCount: -1
			},
			iNewsCommand: 'GRAFIK'
		}

		const pieces: IBlueprintPiece[] = []
		const adLibPieces: IBlueprintAdLibPiece[] = []
		const actions: IBlueprintActionManifest[] = []
		const partId = '0000000001'

		EvaluateCueGraphic(
			config,
			makeMockContext(),
			partWithPreroll,
			pieces,
			adLibPieces,
			actions,
			partId,
			cue,
			cue.adlib ? cue.adlib : false,
			dummyPart,
			0
		)
		const piece = pieces[0]
		expect(piece).toBeTruthy()
		const tlObj = (piece.content?.timelineObjects as TSR.TSRTimelineObj[]).find(
			obj =>
				obj.content.deviceType === TSR.DeviceType.VIZMSE &&
				obj.content.type === TSR.TimelineContentTypeVizMSE.ELEMENT_PILOT
		) as TSR.TimelineObjVIZMSEElementInternal | undefined
		expect(tlObj).toBeTruthy()
		expect(tlObj?.enable).toEqual({ start: 1000 })
	})

	it('Applies delay to WALL graphics when part has transitionPrerollDuration', () => {
		const partWithPreroll: IBlueprintPart = {
			title: 'Kam 1',
			externalId: '0001',
			transitionPrerollDuration: 2000
		}
		const cue: CueDefinitionGraphic<GraphicPilot> = {
			type: CueType.Graphic,
			target: 'WALL',
			graphic: {
				type: 'pilot',
				name: '',
				vcpid: 1234567890,
				continueCount: -1
			},
			iNewsCommand: 'GRAFIK'
		}

		const pieces: IBlueprintPiece[] = []
		const adLibPieces: IBlueprintAdLibPiece[] = []
		const actions: IBlueprintActionManifest[] = []
		const partId = '0000000001'

		EvaluateCueGraphic(
			config,
			makeMockContext(),
			partWithPreroll,
			pieces,
			adLibPieces,
			actions,
			partId,
			cue,
			cue.adlib ? cue.adlib : false,
			dummyPart,
			0
		)
		const piece = pieces[0]
		expect(piece).toBeTruthy()
		const tlObj = (piece.content?.timelineObjects as TSR.TSRTimelineObj[]).find(
			obj =>
				obj.content.deviceType === TSR.DeviceType.VIZMSE &&
				obj.content.type === TSR.TimelineContentTypeVizMSE.ELEMENT_PILOT
		) as TSR.TimelineObjVIZMSEElementInternal | undefined
		expect(tlObj).toBeTruthy()
		expect(tlObj?.enable).toEqual({ start: 2000 })
	})
})
