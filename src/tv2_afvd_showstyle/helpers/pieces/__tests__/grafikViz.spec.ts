import {
	GraphicsContent,
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	IBlueprintRundownDB,
	PieceLifespan,
	TSR
} from 'tv-automation-sofie-blueprints-integration'
import {
	CueDefinitionGraphic,
	GraphicInternal,
	GraphicLLayer,
	literal,
	PartContext2,
	PartDefinitionKam
} from 'tv2-common'
import { CueType, PartType } from 'tv2-constants'
import { SegmentContext } from '../../../../__mocks__/context'
import mappingsDefaults from '../../../../tv2_afvd_studio/migrations/mappings-defaults'
import { defaultShowStyleConfig, defaultStudioConfig } from '../../../__tests__/configs'
import { SourceLayer } from '../../../layers'
import { getConfig } from '../../config'
import { EvaluateCueGraphic } from '../graphic'
import { BlueprintConfig } from 'src/tv2_afvd_studio/helpers/config'

const mockContext = new SegmentContext(
	{
		_id: '',
		externalId: '',
		name: '',
		showStyleVariantId: ''
	},
	mappingsDefaults
)
mockContext.studioConfig = defaultStudioConfig as any
mockContext.showStyleConfig = defaultShowStyleConfig as any

const partContext = new PartContext2(mockContext, '00001')

const RUNDOWN_EXTERNAL_ID = 'TEST.SOFIE.JEST'

function makeMockContext() {
	const rundown = literal<IBlueprintRundownDB>({
		externalId: RUNDOWN_EXTERNAL_ID,
		name: RUNDOWN_EXTERNAL_ID,
		_id: '',
		showStyleVariantId: ''
	})
	const mockContext = new SegmentContext(rundown, mappingsDefaults)
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
			partContext,
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
				name: 'bund - Odense - Copenhagen',
				enable: {
					start: 0,
					duration: 4000
				},
				lifespan: PieceLifespan.WithinPart,
				outputLayerId: 'overlay',
				sourceLayerId: SourceLayer.PgmGraphicsLower,
				content: literal<GraphicsContent>({
					fileName: 'bund',
					path: 'bund',
					ignoreMediaObjectStatus: true,
					timelineObjects: literal<TSR.TimelineObjVIZMSEAny[]>([
						literal<TSR.TimelineObjVIZMSEElementInternal>({
							id: '',
							enable: {
								while: '!.full'
							},
							priority: 1,
							layer: GraphicLLayer.GraphicLLayerOverlayLower,
							content: {
								deviceType: TSR.DeviceType.VIZMSE,
								type: TSR.TimelineContentTypeVizMSE.ELEMENT_INTERNAL,
								templateName: 'bund',
								templateData: ['Odense', 'Copenhagen'],
								channelName: 'OVL1'
							}
						})
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
			partContext,
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
				name: 'bund - Odense - Copenhagen',
				lifespan: PieceLifespan.WithinPart,
				outputLayerId: 'overlay',
				sourceLayerId: SourceLayer.PgmGraphicsLower,
				expectedDuration: 4000,
				content: literal<GraphicsContent>({
					fileName: 'bund',
					path: 'bund',
					ignoreMediaObjectStatus: true,
					timelineObjects: literal<TSR.TimelineObjVIZMSEAny[]>([
						literal<TSR.TimelineObjVIZMSEElementInternal>({
							id: '',
							enable: {
								while: '!.full'
							},
							priority: 1,
							layer: GraphicLLayer.GraphicLLayerOverlayLower,
							content: {
								deviceType: TSR.DeviceType.VIZMSE,
								type: TSR.TimelineContentTypeVizMSE.ELEMENT_INTERNAL,
								templateName: 'bund',
								templateData: ['Odense', 'Copenhagen'],
								channelName: 'OVL1'
							}
						})
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
			partContext,
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
				name: 'bund - Odense - Copenhagen',
				lifespan: PieceLifespan.WithinPart,
				outputLayerId: 'overlay',
				sourceLayerId: SourceLayer.PgmGraphicsLower,
				expectedDuration: 4000,
				content: literal<GraphicsContent>({
					fileName: 'bund',
					path: 'bund',
					ignoreMediaObjectStatus: true,
					timelineObjects: literal<TSR.TimelineObjVIZMSEAny[]>([
						literal<TSR.TimelineObjVIZMSEElementInternal>({
							id: '',
							enable: {
								start: 0
							},
							priority: 1,
							layer: GraphicLLayer.GraphicLLayerOverlayLower,
							content: {
								deviceType: TSR.DeviceType.VIZMSE,
								type: TSR.TimelineContentTypeVizMSE.ELEMENT_INTERNAL,
								templateName: 'bund',
								templateData: ['Odense', 'Copenhagen'],
								channelName: 'OVL1'
							}
						})
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
			partContext,
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
				name: 'bund - Odense - Copenhagen',
				enable: {
					start: 10000,
					duration: 4000
				},
				lifespan: PieceLifespan.WithinPart,
				outputLayerId: 'overlay',
				sourceLayerId: SourceLayer.PgmGraphicsLower,
				content: literal<GraphicsContent>({
					fileName: 'bund',
					path: 'bund',
					ignoreMediaObjectStatus: true,
					timelineObjects: literal<TSR.TimelineObjVIZMSEAny[]>([
						literal<TSR.TimelineObjVIZMSEElementInternal>({
							id: '',
							enable: {
								while: '!.full'
							},
							priority: 1,
							layer: GraphicLLayer.GraphicLLayerOverlayLower,
							content: {
								deviceType: TSR.DeviceType.VIZMSE,
								type: TSR.TimelineContentTypeVizMSE.ELEMENT_INTERNAL,
								templateName: 'bund',
								templateData: ['Odense', 'Copenhagen'],
								channelName: 'OVL1'
							}
						})
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
			partContext,
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
				name: 'bund - Odense - Copenhagen',
				enable: {
					start: 10000
				},
				lifespan: PieceLifespan.WithinPart,
				outputLayerId: 'overlay',
				sourceLayerId: SourceLayer.PgmGraphicsLower,
				content: literal<GraphicsContent>({
					fileName: 'bund',
					path: 'bund',
					ignoreMediaObjectStatus: true,
					timelineObjects: literal<TSR.TimelineObjVIZMSEAny[]>([
						literal<TSR.TimelineObjVIZMSEElementInternal>({
							id: '',
							enable: {
								while: `.studio0_parent_camera_1 & !.adlib_deparent & !.full`
							},
							priority: 1,
							layer: GraphicLLayer.GraphicLLayerOverlayLower,
							content: {
								deviceType: TSR.DeviceType.VIZMSE,
								type: TSR.TimelineContentTypeVizMSE.ELEMENT_INTERNAL,
								templateName: 'bund',
								templateData: ['Odense', 'Copenhagen'],
								channelName: 'OVL1'
							}
						})
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
			partContext,
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
				outputLayerId: 'overlay',
				sourceLayerId: SourceLayer.PgmGraphicsIdentPersistent,
				content: literal<GraphicsContent>({
					fileName: 'direkte',
					path: 'direkte',
					ignoreMediaObjectStatus: true,
					timelineObjects: literal<TSR.TimelineObjVIZMSEAny[]>([
						literal<TSR.TimelineObjVIZMSEElementInternal>({
							id: '',
							enable: {
								while: `.show_ident_graphic & !.full`
							},
							priority: 1,
							layer: GraphicLLayer.GraphicLLayerOverlayIdent,
							content: {
								deviceType: TSR.DeviceType.VIZMSE,
								type: TSR.TimelineContentTypeVizMSE.ELEMENT_INTERNAL,
								templateName: 'direkte',
								templateData: ['KØBENHAVN'],
								channelName: 'OVL1'
							}
						})
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
				outputLayerId: 'overlay',
				sourceLayerId: SourceLayer.PgmGraphicsIdent
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
			partContext,
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
				outputLayerId: 'overlay',
				sourceLayerId: SourceLayer.PgmGraphicsIdent,
				content: literal<GraphicsContent>({
					fileName: 'arkiv',
					path: 'arkiv',
					ignoreMediaObjectStatus: true,
					timelineObjects: literal<TSR.TimelineObjVIZMSEAny[]>([
						literal<TSR.TimelineObjVIZMSEElementInternal>({
							id: '',
							enable: {
								while: `!.full`
							},
							priority: 1,
							layer: GraphicLLayer.GraphicLLayerOverlayIdent,
							content: {
								deviceType: TSR.DeviceType.VIZMSE,
								type: TSR.TimelineContentTypeVizMSE.ELEMENT_INTERNAL,
								templateName: 'arkiv',
								templateData: ['unnamed org'],
								channelName: 'OVL1'
							}
						})
					])
				})
			})
		])
	})
})
