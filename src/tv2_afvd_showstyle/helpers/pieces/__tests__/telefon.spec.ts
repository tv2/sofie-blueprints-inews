import { GraphicsContent, IBlueprintPiece, PieceLifespan, TSR, WithTimeline } from 'blueprints-integration'
import {
	CueDefinitionGraphic,
	CueDefinitionTelefon,
	getDskLLayerName,
	GraphicInternal,
	GraphicPieceMetaData,
	literal,
	PartDefinitionKam
} from 'tv2-common'
import { CueType, PartType, SharedGraphicLLayer, SharedOutputLayer, SourceType } from 'tv2-constants'
import { makeMockGalleryContext } from '../../../../__mocks__/context'
import { prefixLayer } from '../../../../tv2-common/__tests__/testUtil'
import { OVL_SHOW_NAME } from '../../../../tv2_afvd_showstyle/__tests__/configs'
import { SourceLayer } from '../../../../tv2_afvd_showstyle/layers'
import { SisyfosLLAyer } from '../../../../tv2_afvd_studio/layers'
import { EvaluateTelefon } from '../telefon'

const mockContext = makeMockGalleryContext()

const dummyPart = literal<PartDefinitionKam>({
	type: PartType.Kam,
	sourceDefinition: {
		sourceType: SourceType.KAM,
		id: '1',
		raw: 'Kam 1',
		minusMic: false,
		name: 'KAM 2'
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

describe('telefon', () => {
	test('telefon with vizObj', () => {
		const cue: CueDefinitionTelefon = {
			type: CueType.Telefon,
			source: 'TLF 1',
			graphic: literal<CueDefinitionGraphic<GraphicInternal>>({
				type: CueType.Graphic,
				target: 'TLF',
				graphic: {
					type: 'internal',
					template: 'bund',
					cue: 'kg',
					textFields: ['Odense', 'Copenhagen']
				},
				iNewsCommand: 'kg'
			}),
			start: {
				seconds: 0
			},
			iNewsCommand: 'TELEFON'
		}
		const partId = '0000000001'
		const result = EvaluateTelefon(mockContext, partId, dummyPart, cue)
		expect(result.pieces).toEqual([
			literal<IBlueprintPiece<GraphicPieceMetaData>>({
				externalId: partId,
				name: 'TLF 1',
				enable: {
					start: 0
				},
				outputLayerId: SharedOutputLayer.OVERLAY,
				sourceLayerId: SourceLayer.PgmGraphicsLower,
				lifespan: PieceLifespan.WithinPart,
				metaData: {
					partType: PartType.Kam,
					pieceExternalId: dummyPart.externalId
				},
				content: literal<WithTimeline<GraphicsContent>>({
					fileName: 'bund',
					path: 'bund',
					ignoreMediaObjectStatus: true,
					timelineObjects: [
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
						literal<TSR.TimelineObjAtemDSK>({
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
						}),
						literal<TSR.TimelineObjSisyfosChannel>({
							id: '',
							enable: {
								start: 0
							},
							priority: 1,
							layer: SisyfosLLAyer.SisyfosSourceTLF,
							content: {
								deviceType: TSR.DeviceType.SISYFOS,
								type: TSR.TimelineContentTypeSisyfos.CHANNEL,
								isPgm: 1
							}
						}),
						literal<TSR.TimelineObjSisyfosChannels>({
							id: '',
							enable: {
								start: 0
							},
							priority: 2,
							layer: SisyfosLLAyer.SisyfosGroupStudioMics,
							content: {
								deviceType: TSR.DeviceType.SISYFOS,
								type: TSR.TimelineContentTypeSisyfos.CHANNELS,
								channels: [
									{
										mappedLayer: SisyfosLLAyer.SisyfosSourceHost_1_ST_A,
										isPgm: 1
									},
									{
										mappedLayer: SisyfosLLAyer.SisyfosSourceHost_2_ST_A,
										isPgm: 1
									},
									{
										mappedLayer: SisyfosLLAyer.SisyfosSourceGuest_1_ST_A,
										isPgm: 1
									},
									{
										mappedLayer: SisyfosLLAyer.SisyfosSourceGuest_2_ST_A,
										isPgm: 1
									},
									{
										mappedLayer: SisyfosLLAyer.SisyfosSourceGuest_3_ST_A,
										isPgm: 1
									},
									{
										mappedLayer: SisyfosLLAyer.SisyfosSourceGuest_4_ST_A,
										isPgm: 1
									}
								],
								overridePriority: 2
							}
						})
					]
				})
			})
		])
	})
})
