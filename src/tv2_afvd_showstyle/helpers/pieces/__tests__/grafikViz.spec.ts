import {
	GraphicsContent,
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	PieceLifespan,
	TSR,
	WithTimeline
} from 'blueprints-integration'
import {
	CueDefinitionGraphic,
	CueTime,
	getDskLLayerName,
	GraphicInternal,
	GraphicPieceMetaData,
	GraphicPilot,
	literal,
	PartDefinitionKam,
	PieceMetaData
} from 'tv2-common'
import { AdlibTags, CueType, PartType, SharedGraphicLLayer, SharedOutputLayers, SourceType } from 'tv2-constants'
import { makeMockGalleryContext } from '../../../../__mocks__/context'
import { prefixLayer } from '../../../../tv2-common/__tests__/testUtil'
import { OVL_SHOW_NAME } from '../../../__tests__/configs'
import { SourceLayer } from '../../../layers'
import { EvaluateCueGraphic } from '../graphic'

const dummyPart = literal<PartDefinitionKam>({
	type: PartType.Kam,
	sourceDefinition: { sourceType: SourceType.KAM, id: '1', raw: 'Kam 1', minusMic: false, name: 'KAM 1' },
	externalId: '0001',
	rawType: 'Kam 1',
	cues: [],
	script: '',
	storyName: '',
	fields: {},
	modified: 0,
	segmentExternalId: ''
})

function makeTestBundCue(infiniteMode: CueTime['infiniteMode']): CueDefinitionGraphic<GraphicInternal> {
	return {
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
			infiniteMode
		},
		iNewsCommand: 'kg'
	}
}

const dskEnableObj = literal<TSR.TimelineObjAtemDSK>({
	id: '',
	enable: {
		start: 0
	},
	priority: 1,
	layer: prefixLayer(getDskLLayerName(0)),
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
		const partId = '0000000001'

		const result = EvaluateCueGraphic(
			makeMockGalleryContext(),
			partId,
			cue,
			dummyPart,
			cue.adlib ? { rank: 0 } : undefined
		)
		expect(result.pieces).toEqual([
			literal<IBlueprintPiece<GraphicPieceMetaData>>({
				externalId: partId,
				name: 'bund - Odense\n - Copenhagen',
				enable: {
					start: 0,
					duration: 4000
				},
				lifespan: PieceLifespan.WithinPart,
				metaData: {
					sisyfosPersistMetaData: {
						sisyfosLayers: []
					},
					partType: PartType.Kam,
					pieceExternalId: dummyPart.externalId
				},
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
								showName: OVL_SHOW_NAME
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
		const partId = '0000000001'

		const result = EvaluateCueGraphic(
			makeMockGalleryContext(),
			partId,
			cue,
			dummyPart,
			cue.adlib ? { rank: 0 } : undefined
		)
		expect(result.adlibPieces).toEqual([
			literal<IBlueprintAdLibPiece>({
				_rank: 0,
				externalId: partId,
				name: 'bund - Odense\n - Copenhagen',
				lifespan: PieceLifespan.WithinPart,
				metaData: literal<PieceMetaData>({
					sisyfosPersistMetaData: {
						sisyfosLayers: []
					}
				}),
				outputLayerId: SharedOutputLayers.OVERLAY,
				sourceLayerId: SourceLayer.PgmGraphicsLower,
				uniquenessId: 'gfx_bund - Odense\n - Copenhagen_studio0_graphicsLower_overlay_commentator',
				expectedDuration: 5000,
				tags: [AdlibTags.ADLIB_KOMMENTATOR],
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
								showName: OVL_SHOW_NAME
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
				metaData: literal<PieceMetaData>({
					sisyfosPersistMetaData: {
						sisyfosLayers: []
					}
				}),
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
								showName: OVL_SHOW_NAME
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
		const partId = '0000000001'

		const result = EvaluateCueGraphic(
			makeMockGalleryContext({ studioConfig: { PreventOverlayWithFull: false } }),
			partId,
			cue,
			dummyPart,
			cue.adlib ? { rank: 0 } : undefined
		)
		expect(result.adlibPieces).toEqual([
			literal<IBlueprintAdLibPiece>({
				_rank: 0,
				externalId: partId,
				name: 'bund - Odense\n - Copenhagen',
				lifespan: PieceLifespan.WithinPart,
				metaData: literal<PieceMetaData>({
					sisyfosPersistMetaData: {
						sisyfosLayers: []
					}
				}),
				outputLayerId: SharedOutputLayers.OVERLAY,
				sourceLayerId: SourceLayer.PgmGraphicsLower,
				uniquenessId: 'gfx_bund - Odense\n - Copenhagen_studio0_graphicsLower_overlay_commentator',
				tags: [AdlibTags.ADLIB_KOMMENTATOR],
				expectedDuration: 5000,
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
								showName: OVL_SHOW_NAME
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
				metaData: literal<PieceMetaData>({
					sisyfosPersistMetaData: {
						sisyfosLayers: []
					}
				}),
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
								showName: OVL_SHOW_NAME
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
		const partId = '0000000001'

		const result = EvaluateCueGraphic(
			makeMockGalleryContext(),
			partId,
			cue,
			dummyPart,
			cue.adlib ? { rank: 0 } : undefined
		)
		expect(result.pieces).toEqual([
			literal<IBlueprintPiece<GraphicPieceMetaData>>({
				externalId: partId,
				name: 'bund - Odense\n - Copenhagen',
				enable: {
					start: 10000,
					duration: 4000
				},
				lifespan: PieceLifespan.WithinPart,
				metaData: {
					sisyfosPersistMetaData: {
						sisyfosLayers: []
					},
					partType: PartType.Kam,
					pieceExternalId: dummyPart.externalId
				},
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
								showName: OVL_SHOW_NAME
							}
						}),
						dskEnableObj
					])
				})
			})
		])
	})

	test('kg bund infinite (B) has piece and object timing', () => {
		const cue = makeTestBundCue('B')
		const partId = '0000000001'

		const result = EvaluateCueGraphic(
			makeMockGalleryContext(),
			partId,
			cue,
			dummyPart,
			cue.adlib ? { rank: 0 } : undefined
		)
		expect(result.pieces.length).toBe(1)
		expect(result.pieces[0]).toMatchObject({
			enable: {
				start: 10000
			},
			lifespan: PieceLifespan.WithinPart
		})
		expect(
			result.pieces[0].content.timelineObjects.find((tlObject) => tlObject.content.deviceType === TSR.DeviceType.VIZMSE)
		).toMatchObject({
			enable: {
				while: `!.full`
			}
		})
	})

	test('kg bund infinite (S) has piece and object timing', () => {
		const cue = makeTestBundCue('S')
		const partId = '0000000001'

		const result = EvaluateCueGraphic(
			makeMockGalleryContext(),
			partId,
			cue,
			dummyPart,
			cue.adlib ? { rank: 0 } : undefined
		)
		expect(result.pieces.length).toBe(1)
		expect(result.pieces[0]).toMatchObject({
			enable: {
				start: 10000
			},
			lifespan: PieceLifespan.OutOnSegmentEnd
		})
		expect(
			result.pieces[0].content.timelineObjects.find((tlObject) => tlObject.content.deviceType === TSR.DeviceType.VIZMSE)
		).toMatchObject({
			enable: {
				while: `!.full`
			}
		})
	})

	test('kg bund infinite (O)', () => {
		const cue = makeTestBundCue('O')
		const partId = '0000000001'

		const result = EvaluateCueGraphic(
			makeMockGalleryContext(),
			partId,
			cue,
			dummyPart,
			cue.adlib ? { rank: 0 } : undefined
		)

		expect(result.pieces.length).toBe(1)
		expect(result.pieces[0]).toMatchObject({
			enable: {
				start: 10000
			},
			lifespan: PieceLifespan.OutOnShowStyleEnd
		})
		expect(
			result.pieces[0].content.timelineObjects.find((tlObject) => tlObject.content.deviceType === TSR.DeviceType.VIZMSE)
		).toMatchObject({
			enable: {
				while: `!.full`
			}
		})
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
		const partId = '0000000001'

		const result = EvaluateCueGraphic(
			makeMockGalleryContext(),
			partId,
			cue,
			dummyPart,
			cue.adlib ? { rank: 0 } : undefined
		)
		expect(result.pieces).toEqual([
			literal<IBlueprintPiece<GraphicPieceMetaData>>({
				externalId: partId,
				name: 'direkte - KØBENHAVN',
				enable: {
					start: 0
				},
				lifespan: PieceLifespan.WithinPart,
				metaData: {
					sisyfosPersistMetaData: {
						sisyfosLayers: []
					},
					partType: PartType.Kam,
					pieceExternalId: dummyPart.externalId
				},
				outputLayerId: SharedOutputLayers.OVERLAY,
				sourceLayerId: SourceLayer.PgmGraphicsIdent,
				content: literal<WithTimeline<GraphicsContent>>({
					fileName: 'direkte',
					path: 'direkte',
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
								templateName: 'direkte',
								templateData: ['KØBENHAVN'],
								channelName: 'OVL1',
								showName: OVL_SHOW_NAME
							}
						}),
						dskEnableObj
					])
				})
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
		const partId = '0000000001'

		const result = EvaluateCueGraphic(
			makeMockGalleryContext(),
			partId,
			cue,
			dummyPart,
			cue.adlib ? { rank: 0 } : undefined
		)
		expect(result.pieces).toEqual([
			literal<IBlueprintPiece<GraphicPieceMetaData>>({
				externalId: partId,
				name: 'arkiv - unnamed org',
				enable: {
					start: 0,
					duration: 4000
				},
				lifespan: PieceLifespan.WithinPart,
				metaData: {
					sisyfosPersistMetaData: {
						sisyfosLayers: []
					},
					partType: PartType.Kam,
					pieceExternalId: dummyPart.externalId
				},
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
								showName: OVL_SHOW_NAME
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
		const partId = '0000000001'

		const result = EvaluateCueGraphic(
			makeMockGalleryContext(),
			partId,
			cue,
			dummyPart,
			cue.adlib ? { rank: 0 } : undefined
		)
		expect(result.adlibPieces).toEqual([
			literal<IBlueprintAdLibPiece>({
				_rank: 0,
				externalId: partId,
				name: 'tlftoptlive - Line 1\n - Line 2',
				lifespan: PieceLifespan.WithinPart,
				metaData: literal<PieceMetaData>({
					sisyfosPersistMetaData: {
						sisyfosLayers: []
					}
				}),
				outputLayerId: SharedOutputLayers.OVERLAY,
				sourceLayerId: SourceLayer.PgmGraphicsTop,
				expectedDuration: 5000,
				tags: ['kommentator'],
				uniquenessId: 'gfx_tlftoptlive - Line 1\n - Line 2_studio0_graphicsTop_overlay_commentator',
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
								showName: OVL_SHOW_NAME
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
				metaData: literal<PieceMetaData>({
					sisyfosPersistMetaData: {
						sisyfosLayers: []
					}
				}),
				outputLayerId: SharedOutputLayers.OVERLAY,
				sourceLayerId: SourceLayer.PgmGraphicsTop,
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
								showName: OVL_SHOW_NAME
							}
						}),
						dskEnableObj
					])
				})
			})
		])
	})

	test('kg tlftoptlive: timecode has priority over OutType column', () => {
		const cue = literal<CueDefinitionGraphic<GraphicInternal>>({
			type: CueType.Graphic,
			target: 'OVL',
			graphic: {
				type: 'internal',
				template: 'tlftoptlive',
				cue: 'kg',
				textFields: ['Line 1', 'Line 2']
			},
			start: {
				seconds: 5
			},
			end: {
				seconds: 10
			},
			iNewsCommand: 'kg'
		})
		const partId = '0000000001'

		const result = EvaluateCueGraphic(
			makeMockGalleryContext(),
			partId,
			cue,
			dummyPart,
			cue.adlib ? { rank: 0 } : undefined
		)

		expect(result.pieces.length).toBe(1)
		expect(result.pieces[0]).toMatchObject({
			enable: {
				start: 5000,
				duration: 5000
			},
			lifespan: PieceLifespan.WithinPart
		})
	})

	test('kg tlftoptlive adilb: timecode has priority over OutType column', () => {
		const cue = literal<CueDefinitionGraphic<GraphicInternal>>({
			type: CueType.Graphic,
			target: 'OVL',
			graphic: {
				type: 'internal',
				template: 'tlftoptlive',
				cue: 'kg',
				textFields: ['Line 1', 'Line 2']
			},
			end: {
				seconds: 10
			},
			adlib: true,
			iNewsCommand: 'kg'
		})
		const partId = '0000000001'

		const result = EvaluateCueGraphic(
			makeMockGalleryContext(),
			partId,
			cue,
			dummyPart,
			cue.adlib ? { rank: 0 } : undefined
		)

		const adlibPiece = result.adlibPieces.find((piece) => piece.tags?.includes('flow_producer'))
		expect(adlibPiece).toBeDefined()
		expect(adlibPiece).toMatchObject({
			expectedDuration: 10000,
			lifespan: PieceLifespan.WithinPart
		})
	})

	it('WALL graphics have enable equal while 1', () => {
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

		const partId = '0000000001'

		const result = EvaluateCueGraphic(
			makeMockGalleryContext(),
			partId,
			cue,
			dummyPart,
			cue.adlib ? { rank: 0 } : undefined
		)
		const piece = result.pieces[0]
		expect(piece).toBeTruthy()
		const tlObj = (piece.content?.timelineObjects as TSR.TSRTimelineObj[]).find(
			(obj) =>
				obj.content.deviceType === TSR.DeviceType.VIZMSE &&
				obj.content.type === TSR.TimelineContentTypeVizMSE.ELEMENT_PILOT
		) as TSR.TimelineObjVIZMSEElementInternal | undefined
		expect(tlObj).toBeTruthy()
		expect(tlObj?.enable).toEqual({ while: '1' })
	})
})
