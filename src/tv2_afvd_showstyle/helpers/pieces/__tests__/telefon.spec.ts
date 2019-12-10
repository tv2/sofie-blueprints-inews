import {
	DeviceType,
	TimelineContentTypeSisyfos,
	TimelineContentTypeVizMSE,
	TimelineObjSisyfosMessage,
	TimelineObjVIZMSEElementInternal
} from 'timeline-state-resolver-types'
import {
	GraphicsContent,
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	PieceLifespan
} from 'tv-automation-sofie-blueprints-integration'
import { SegmentContext } from '../../../../__mocks__/context'
import { literal } from '../../../../common/util'
import { defaultShowStyleConfig, defaultStudioConfig } from '../../../../tv2_afvd_showstyle/__tests__/configs'
import { PartContext2 } from '../../../../tv2_afvd_showstyle/getSegment'
import {
	CueDefinitionGrafik,
	CueDefinitionTelefon,
	CueType
} from '../../../../tv2_afvd_showstyle/inewsConversion/converters/ParseCue'
import { SourceLayer } from '../../../../tv2_afvd_showstyle/layers'
import { StudioConfig } from '../../../../tv2_afvd_studio/helpers/config'
import { SisyfosLLAyer, VizLLayer } from '../../../../tv2_afvd_studio/layers'
import mappingsDefaults from '../../../../tv2_afvd_studio/migrations/mappings-defaults'
import { ShowStyleConfig } from '../../config'
import { EvaluateTelefon } from '../telefon'

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

describe('telefon', () => {
	test('telefon with vizObj', () => {
		const cue: CueDefinitionTelefon = {
			type: CueType.Telefon,
			source: 'TLF 1',
			vizObj: literal<CueDefinitionGrafik>({
				type: CueType.Grafik,
				template: 'bund',
				cue: 'kg',
				textFields: ['Odense', 'Copenhagen']
			}),
			start: {
				seconds: 0
			}
		}
		const pieces: IBlueprintPiece[] = []
		const adLibPieces: IBlueprintAdLibPiece[] = []
		const partId = '0000000001'
		EvaluateTelefon(
			{
				showStyle: (defaultShowStyleConfig as unknown) as ShowStyleConfig,
				studio: (defaultStudioConfig as unknown) as StudioConfig,
				sources: [],
				mediaPlayers: []
			},
			partContext,
			pieces,
			adLibPieces,
			partId,
			cue
		)
		expect(pieces).toEqual([
			literal<IBlueprintPiece>({
				_id: '',
				externalId: partId,
				name: 'TLF 1',
				enable: {
					start: 0
				},
				outputLayerId: 'overlay',
				sourceLayerId: SourceLayer.PgmGraphicsTLF,
				infiniteMode: PieceLifespan.OutOnNextPart,
				content: literal<GraphicsContent>({
					fileName: 'bund',
					path: 'bund',
					timelineObjects: [
						literal<TimelineObjVIZMSEElementInternal>({
							id: '',
							enable: {
								start: 0
							},
							priority: 1,
							layer: VizLLayer.VizLLayerOverlay,
							content: {
								deviceType: DeviceType.VIZMSE,
								type: TimelineContentTypeVizMSE.ELEMENT_INTERNAL,
								templateName: 'bund',
								templateData: ['Odense', 'Copenhagen'],
								channelName: 'OVL1'
							}
						}),
						literal<TimelineObjSisyfosMessage>({
							id: '',
							enable: {
								start: 0
							},
							priority: 1,
							layer: SisyfosLLAyer.SisyfosSourceTLF,
							content: {
								deviceType: DeviceType.SISYFOS,
								type: TimelineContentTypeSisyfos.SISYFOS,
								isPgm: 1
							}
						}),
						literal<TimelineObjSisyfosMessage>({
							id: '',
							enable: {
								start: 0
							},
							priority: 1,
							layer: SisyfosLLAyer.SisyfosSourceHost_1_ST_A,
							content: {
								deviceType: DeviceType.SISYFOS,
								type: TimelineContentTypeSisyfos.SISYFOS,
								isPgm: 1
							}
						}),
						literal<TimelineObjSisyfosMessage>({
							id: '',
							enable: {
								start: 0
							},
							priority: 1,
							layer: SisyfosLLAyer.SisyfosSourceHost_2_ST_A,
							content: {
								deviceType: DeviceType.SISYFOS,
								type: TimelineContentTypeSisyfos.SISYFOS,
								isPgm: 1
							}
						}),
						literal<TimelineObjSisyfosMessage>({
							id: '',
							enable: {
								start: 0
							},
							priority: 1,
							layer: SisyfosLLAyer.SisyfosSourceGuest_1_ST_A,
							content: {
								deviceType: DeviceType.SISYFOS,
								type: TimelineContentTypeSisyfos.SISYFOS,
								isPgm: 1
							}
						}),
						literal<TimelineObjSisyfosMessage>({
							id: '',
							enable: {
								start: 0
							},
							priority: 1,
							layer: SisyfosLLAyer.SisyfosSourceGuest_2_ST_A,
							content: {
								deviceType: DeviceType.SISYFOS,
								type: TimelineContentTypeSisyfos.SISYFOS,
								isPgm: 1
							}
						}),
						literal<TimelineObjSisyfosMessage>({
							id: '',
							enable: {
								start: 0
							},
							priority: 1,
							layer: SisyfosLLAyer.SisyfosSourceGuest_3_ST_A,
							content: {
								deviceType: DeviceType.SISYFOS,
								type: TimelineContentTypeSisyfos.SISYFOS,
								isPgm: 1
							}
						}),
						literal<TimelineObjSisyfosMessage>({
							id: '',
							enable: {
								start: 0
							},
							priority: 1,
							layer: SisyfosLLAyer.SisyfosSourceGuest_4_ST_A,
							content: {
								deviceType: DeviceType.SISYFOS,
								type: TimelineContentTypeSisyfos.SISYFOS,
								isPgm: 1
							}
						})
					]
				})
			})
		])
	})
})
