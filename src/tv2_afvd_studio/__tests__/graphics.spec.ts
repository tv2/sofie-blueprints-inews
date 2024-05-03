import { PieceLifespan, TSR } from 'blueprints-integration'
import {
	CueDefinition,
	CueDefinitionBackgroundLoop,
	CueDefinitionGraphic,
	CueDefinitionGraphicDesign,
	CueDefinitionUnpairedPilot,
	CueDefinitionUnpairedTarget,
	GraphicInternal,
	GraphicPilot,
	literal,
	PartDefinition,
	RemoteType
} from 'tv2-common'
import { CueType, PartType, SharedGraphicLLayer, SharedOutputLayer, SourceType, SwitcherAuxLLayer } from 'tv2-constants'
import { makeMockGalleryContext, SegmentUserContextMock } from '../../__mocks__/context'
import { prefixLayer } from '../../tv2-common/__tests__/testUtil'
import { SourceLayer } from '../../tv2_afvd_showstyle/layers'
import { CreatePartGrafik } from '../../tv2_afvd_showstyle/parts/grafik'
import { CreatePartUnknown } from '../../tv2_afvd_showstyle/parts/unknown'
import { CasparLLayer } from '../layers'

const SEGMENT_EXTERNAL_ID = '00000000'

describe('Graphics', () => {
	it('Throws warning for unpaired target and creates invalid part', async () => {
		const context = makeMockGalleryContext()

		const cues: CueDefinition[] = [
			literal<CueDefinitionUnpairedTarget>({
				type: CueType.UNPAIRED_TARGET,
				target: 'FULL',
				iNewsCommand: 'GRAFIK'
			})
		]

		const partDefintion: PartDefinition = literal<PartDefinition>({
			type: PartType.Grafik,
			externalId: '',
			segmentExternalId: SEGMENT_EXTERNAL_ID,
			rawType: '',
			cues,
			script: '',
			fields: {},
			modified: 0,
			storyName: '',
			segmentRank: 0
		})

		const result = await CreatePartGrafik(context, partDefintion, 0)

		expect((context.core as SegmentUserContextMock).getNotes().map((msg) => msg.message)).toEqual([
			`No graphic found after GRAFIK cue`
		])
		expect(result.pieces).toHaveLength(0)
		expect(result.adLibPieces).toHaveLength(0)
		expect(result.actions).toHaveLength(0)
		expect(result.part.invalid).toBe(true)
	})

	it('Throws warning for unpaired pilot', () => {
		const context = makeMockGalleryContext()

		const cues: CueDefinition[] = [
			literal<CueDefinitionUnpairedPilot>({
				type: CueType.UNPAIRED_PILOT,
				name: '',
				vcpid: 1234567890,
				continueCount: -1,
				iNewsCommand: ''
			})
		]

		const partDefinition: PartDefinition = literal<PartDefinition>({
			type: PartType.Grafik,
			externalId: '',
			segmentExternalId: SEGMENT_EXTERNAL_ID,
			rawType: '',
			cues,
			script: '',
			fields: {},
			modified: 0,
			storyName: '',
			segmentRank: 0
		})

		CreatePartGrafik(context, partDefinition, 0)

		expect((context.core as SegmentUserContextMock).getNotes().map((msg) => msg.message)).toEqual([
			`Graphic found without target engine`
		])
	})

	it('Creates FULL graphic correctly', async () => {
		const context = makeMockGalleryContext()

		const cues: CueDefinition[] = [
			literal<CueDefinitionGraphic<GraphicPilot>>({
				type: CueType.Graphic,
				target: 'FULL',
				graphic: {
					type: 'pilot',
					name: '',
					vcpid: 1234567890,
					continueCount: -1
				},
				iNewsCommand: 'GRAFIK'
			})
		]

		const partDefinition: PartDefinition = literal<PartDefinition>({
			type: PartType.Grafik,
			externalId: '',
			segmentExternalId: SEGMENT_EXTERNAL_ID,
			rawType: '',
			cues,
			script: '',
			fields: {},
			modified: 0,
			storyName: '',
			segmentRank: 0
		})

		const result = await CreatePartGrafik(context, partDefinition, 0)
		expect(result.pieces).toHaveLength(2)
		const piece = result.pieces[0]
		expect(piece.sourceLayerId).toBe(SourceLayer.PgmPilot)
		expect(piece.outputLayerId).toBe(SharedOutputLayer.PGM)
		expect(piece.enable).toEqual({ start: 0 })
		// expect(piece.prerollDuration).toBe(config.studio.VizPilotGraphics.PrerollDuration)
		expect(piece.lifespan).toBe(PieceLifespan.WithinPart)
		const content = piece.content!
		const timeline = content.timelineObjects as TSR.TSRTimelineObj[]
		expect(timeline).toHaveLength(7) // @todo: this depends on unrelated configuration
		const vizObj = timeline.find(
			(t) =>
				t.content.deviceType === TSR.DeviceType.VIZMSE && t.content.type === TSR.TimelineContentTypeVizMSE.ELEMENT_PILOT
		)! as TSR.TimelineObjVIZMSEElementPilot
		expect(vizObj.enable).toEqual({ start: 0 })
		expect(vizObj.layer).toEqual(SharedGraphicLLayer.GraphicLLayerPilot)
		expect(vizObj.content.channelName).toBe('FULL1') // TODO: FULL1: Enum / Type
		expect(vizObj.content.templateVcpId).toBe(1234567890)
		expect(vizObj.content.continueStep).toBe(-1)
		expect(vizObj.content.delayTakeAfterOutTransition).toBe(true)
		expect(vizObj.content.outTransition).toEqual({
			type: TSR.VIZMSETransitionType.DELAY,
			delay: context.config.studio.VizPilotGraphics.OutTransitionDuration
		})
		expect(vizObj.classes).toEqual(['full'])
	})

	it('Creates OVL pilot graphic correctly', async () => {
		const context = makeMockGalleryContext()

		const cues: CueDefinition[] = [
			literal<CueDefinitionGraphic<GraphicPilot>>({
				type: CueType.Graphic,
				target: 'OVL',
				graphic: {
					type: 'pilot',
					name: '',
					vcpid: 1234567890,
					continueCount: -1
				},
				iNewsCommand: 'GRAFIK',
				start: {
					seconds: 2
				},
				end: {
					infiniteMode: 'O'
				}
			})
		]

		const partDefinition: PartDefinition = literal<PartDefinition>({
			type: PartType.Grafik,
			externalId: '',
			segmentExternalId: SEGMENT_EXTERNAL_ID,
			rawType: '',
			cues,
			script: '',
			fields: {},
			modified: 0,
			storyName: '',
			segmentRank: 0
		})

		const result = await CreatePartGrafik(context, partDefinition, 0)
		expect(result.pieces).toHaveLength(1)
		const piece = result.pieces[0]
		expect(piece.sourceLayerId).toBe(SourceLayer.PgmPilotOverlay)
		expect(piece.outputLayerId).toBe(SharedOutputLayer.OVERLAY)
		expect(piece.enable).toEqual({ start: 2000 })
		expect(piece.prerollDuration).toBe(context.config.studio.VizPilotGraphics.PrerollDuration)
		expect(piece.lifespan).toBe(PieceLifespan.OutOnRundownChange)
		const content = piece.content!
		const timeline = content.timelineObjects as TSR.TSRTimelineObj[]
		expect(timeline).toHaveLength(1)
		const vizObj = timeline.find(
			(t) =>
				t.content.deviceType === TSR.DeviceType.VIZMSE && t.content.type === TSR.TimelineContentTypeVizMSE.ELEMENT_PILOT
		)! as TSR.TimelineObjVIZMSEElementPilot
		expect(vizObj.enable).toEqual({ while: '!.full' })
		expect(vizObj.layer).toEqual(SharedGraphicLLayer.GraphicLLayerOverlayPilot)
		expect(vizObj.content.channelName).toBe('OVL1') // TODO: OVL1: Enum / Type
		expect(vizObj.content.templateVcpId).toBe(1234567890)
		expect(vizObj.content.continueStep).toBe(-1)
		expect(vizObj.content.delayTakeAfterOutTransition).toBe(true)
		expect(vizObj.content.outTransition).toEqual({
			delay: context.config.studio.VizPilotGraphics.OutTransitionDuration,
			type: TSR.VIZMSETransitionType.DELAY
		})
	})

	it('Creates WALL graphic correctly', async () => {
		const context = makeMockGalleryContext()

		const cues: CueDefinition[] = [
			literal<CueDefinitionGraphic<GraphicPilot>>({
				type: CueType.Graphic,
				target: 'WALL',
				graphic: {
					type: 'pilot',
					name: '',
					vcpid: 1234567890,
					continueCount: -1
				},
				iNewsCommand: 'GRAFIK'
			})
		]

		const partDefinition: PartDefinition = literal<PartDefinition>({
			type: PartType.Grafik,
			externalId: '',
			segmentExternalId: SEGMENT_EXTERNAL_ID,
			rawType: '',
			cues,
			script: '',
			fields: {},
			modified: 0,
			storyName: '',
			segmentRank: 0
		})

		const result = await CreatePartGrafik(context, partDefinition, 0)
		expect(result.pieces).toHaveLength(1)
		const piece = result.pieces[0]
		expect(piece.sourceLayerId).toBe(SourceLayer.WallGraphics)
		expect(piece.outputLayerId).toBe(SharedOutputLayer.SEC)
		expect(piece.enable).toEqual({ start: 0 })
		expect(piece.prerollDuration).toBe(context.config.studio.VizPilotGraphics.PrerollDuration)
		expect(piece.lifespan).toBe(PieceLifespan.OutOnRundownChange)
		const content = piece.content!
		const timeline = content.timelineObjects as TSR.TSRTimelineObj[]
		expect(timeline).toHaveLength(1)
		const vizObj = timeline.find(
			(t) =>
				t.content.deviceType === TSR.DeviceType.VIZMSE && t.content.type === TSR.TimelineContentTypeVizMSE.ELEMENT_PILOT
		)! as TSR.TimelineObjVIZMSEElementPilot
		expect(vizObj.enable).toEqual({ while: '1' })
		expect(vizObj.layer).toEqual(SharedGraphicLLayer.GraphicLLayerWall)
		expect(vizObj.content.channelName).toBe('WALL1') // TODO: OVL1: Enum / Type
		expect(vizObj.content.templateVcpId).toBe(1234567890)
		expect(vizObj.content.continueStep).toBe(-1)
		expect(vizObj.content.delayTakeAfterOutTransition).toBe(undefined)
		expect(vizObj.content.outTransition).toEqual(undefined)
	})

	it('Creates TLF graphic correctly', async () => {
		const context = makeMockGalleryContext()

		const cues: CueDefinition[] = [
			literal<CueDefinitionGraphic<GraphicPilot>>({
				type: CueType.Graphic,
				target: 'TLF',
				graphic: {
					type: 'pilot',
					name: '',
					vcpid: 1234567890,
					continueCount: -1
				},
				iNewsCommand: 'TLF'
			})
		]

		const partDefinition: PartDefinition = literal<PartDefinition>({
			type: PartType.Grafik,
			externalId: '',
			segmentExternalId: SEGMENT_EXTERNAL_ID,
			rawType: '',
			cues,
			script: '',
			fields: {},
			modified: 0,
			storyName: '',
			segmentRank: 0
		})

		const result = await CreatePartGrafik(context, partDefinition, 0)
		expect(result.pieces).toHaveLength(2)
		const piece = result.pieces[0]
		expect(piece.sourceLayerId).toBe(SourceLayer.PgmGraphicsTLF)
		expect(piece.outputLayerId).toBe(SharedOutputLayer.PGM)
		expect(piece.enable).toEqual({ start: 0 })
		expect(piece.prerollDuration).toBe(context.config.studio.VizPilotGraphics.PrerollDuration)
		expect(piece.lifespan).toBe(PieceLifespan.WithinPart)
		const content = piece.content!
		const timeline = content.timelineObjects as TSR.TSRTimelineObj[]
		expect(timeline).toHaveLength(7)
		const vizObj = timeline.find(
			(t) =>
				t.content.deviceType === TSR.DeviceType.VIZMSE && t.content.type === TSR.TimelineContentTypeVizMSE.ELEMENT_PILOT
		)! as TSR.TimelineObjVIZMSEElementPilot
		expect(vizObj.enable).toEqual({ start: 0 })
		expect(vizObj.layer).toEqual(SharedGraphicLLayer.GraphicLLayerPilot)
		expect(vizObj.content.channelName).toBe('FULL1') // TODO: FULL1: Enum / Type
		expect(vizObj.content.templateVcpId).toBe(1234567890)
		expect(vizObj.content.continueStep).toBe(-1)
		expect(vizObj.content.delayTakeAfterOutTransition).toBe(true)
		expect(vizObj.content.outTransition).toEqual({
			type: TSR.VIZMSETransitionType.DELAY,
			delay: context.config.studio.VizPilotGraphics.OutTransitionDuration
		})
		expect(vizObj.classes).toEqual(['full'])
	})

	it('Routes source to engine', async () => {
		const context = makeMockGalleryContext()

		const cues: CueDefinition[] = [
			literal<CueDefinitionGraphic<GraphicPilot>>({
				type: CueType.Graphic,
				target: 'TLF',
				routing: {
					type: CueType.Routing,
					target: 'TLF',
					INP1: {
						sourceType: SourceType.REMOTE,
						id: 'LIVE 1',
						name: 'LIVE 1',
						raw: 'LIVE 1',
						remoteType: RemoteType.LIVE
					},
					iNewsCommand: ''
				},
				graphic: {
					type: 'pilot',
					name: '',
					vcpid: 1234567890,
					continueCount: -1
				},
				iNewsCommand: 'TLF'
			})
		]

		const partDefinition: PartDefinition = literal<PartDefinition>({
			type: PartType.Grafik,
			externalId: '',
			segmentExternalId: SEGMENT_EXTERNAL_ID,
			rawType: '',
			cues,
			script: '',
			fields: {},
			modified: 0,
			storyName: '',
			segmentRank: 0
		})

		const result = await CreatePartGrafik(context, partDefinition, 0)
		expect(result.pieces).toHaveLength(3)
		const auxPiece = result.pieces.find((p) => p.outputLayerId === SharedOutputLayer.AUX)!
		expect(auxPiece.enable).toEqual({ start: 0 })
		expect(auxPiece.sourceLayerId).toBe(SourceLayer.VizFullIn1)
		expect(auxPiece.lifespan).toBe(PieceLifespan.WithinPart)
		const auxObj = (auxPiece.content?.timelineObjects as TSR.TSRTimelineObj[]).find(
			(obj) => obj.content.deviceType === TSR.DeviceType.ATEM && obj.content.type === TSR.TimelineContentTypeAtem.AUX
		) as TSR.TimelineObjAtemAUX | undefined
		expect(auxObj).toBeTruthy()
		expect(auxObj?.enable).toEqual({ start: 0 })
		expect(auxObj?.layer).toBe(prefixLayer(SwitcherAuxLLayer.VIZ_OVL_IN_1))
		expect(auxObj?.content.aux.input).toBe(1)
	})

	it('Creates design element', async () => {
		const context = makeMockGalleryContext()

		const cues: CueDefinition[] = [
			literal<CueDefinitionGraphicDesign>({
				type: CueType.GraphicDesign,
				design: 'DESIGN_FODBOLD',
				iNewsCommand: 'KG'
			})
		]

		const partDefinition: PartDefinition = literal<PartDefinition>({
			type: PartType.Unknown,
			externalId: '',
			segmentExternalId: SEGMENT_EXTERNAL_ID,
			rawType: '',
			cues,
			script: '',
			fields: {},
			modified: 0,
			storyName: '',
			segmentRank: 0
		})

		const result = await CreatePartUnknown(context, partDefinition, 0)
		expect(result.pieces).toHaveLength(1)
		const piece = result.pieces[0]
		expect(piece).toBeTruthy()
		expect(piece.outputLayerId).toBe(SharedOutputLayer.SEC)
		expect(piece.sourceLayerId).toBe(SourceLayer.PgmDesign)
		expect(piece.lifespan).toBe(PieceLifespan.OutOnRundownChange)
		expect(piece.enable).toEqual({ start: 0 })
	})

	test('Design from field(column) has OutOnRundownChangeWithSegmentLookback lifespan', async () => {
		const context = makeMockGalleryContext()

		const cues: CueDefinition[] = [
			literal<CueDefinitionGraphicDesign>({
				type: CueType.GraphicDesign,
				design: 'DESIGN_FODBOLD',
				iNewsCommand: 'KG',
				isFromField: true
			})
		]

		const partDefinition: PartDefinition = literal<PartDefinition>({
			type: PartType.Unknown,
			externalId: '',
			segmentExternalId: SEGMENT_EXTERNAL_ID,
			rawType: '',
			cues,
			script: '',
			fields: {},
			modified: 0,
			storyName: '',
			segmentRank: 0
		})

		const result = await CreatePartUnknown(context, partDefinition, 0)
		expect(result.pieces).toHaveLength(1)
		const piece = result.pieces[0]
		expect(piece.lifespan).toBe('rundown-change-segment-lookback')
	})

	it('Creates background loop', async () => {
		const context = makeMockGalleryContext()

		const cues: CueDefinition[] = [
			literal<CueDefinitionBackgroundLoop>({
				type: CueType.BackgroundLoop,
				target: 'DVE',
				backgroundLoop: 'DESIGN_SC',
				iNewsCommand: 'VIZ'
			})
		]

		const partDefinition: PartDefinition = literal<PartDefinition>({
			type: PartType.Unknown,
			externalId: '',
			segmentExternalId: SEGMENT_EXTERNAL_ID,
			rawType: '',
			cues,
			script: '',
			fields: {},
			modified: 0,
			storyName: '',
			segmentRank: 0
		})

		const result = await CreatePartUnknown(context, partDefinition, 0)
		expect(result.pieces).toHaveLength(1)
		const piece = result.pieces[0]
		expect(piece).toBeTruthy()
		expect(piece.name).toBe('DESIGN_SC')
		expect(piece.outputLayerId).toBe(SharedOutputLayer.SEC)
		expect(piece.sourceLayerId).toBe(SourceLayer.PgmDVEBackground)
		expect(piece.lifespan).toBe(PieceLifespan.OutOnRundownChange)
		const tlObj = (piece.content?.timelineObjects as TSR.TSRTimelineObj[]).find(
			(obj) =>
				obj.content.deviceType === TSR.DeviceType.CASPARCG && obj.content.type === TSR.TimelineContentTypeCasparCg.MEDIA
		) as TSR.TimelineObjCCGMedia | undefined
		expect(tlObj).toBeTruthy()
		expect(tlObj?.layer).toBe(CasparLLayer.CasparCGDVELoop)
		expect(tlObj?.content.file).toBe('dve/DESIGN_SC')
		expect(tlObj?.content.loop).toBe(true)
	})

	it('Creates overlay internal graphic', async () => {
		const context = makeMockGalleryContext()

		const cues: CueDefinition[] = [
			literal<CueDefinitionGraphic<GraphicInternal>>({
				type: CueType.Graphic,
				target: 'OVL',
				graphic: {
					type: 'internal',
					template: 'bund',
					cue: '#kg',
					textFields: ['Some Person', 'Some Info']
				},
				iNewsCommand: '#kg',
				start: {
					seconds: 5
				}
			})
		]

		const partDefinition: PartDefinition = literal<PartDefinition>({
			type: PartType.Unknown,
			externalId: '',
			segmentExternalId: SEGMENT_EXTERNAL_ID,
			rawType: '',
			cues,
			script: '',
			fields: {},
			modified: 0,
			storyName: '',
			segmentRank: 0
		})

		const result = await CreatePartUnknown(context, partDefinition, 0)
		expect(result.pieces).toHaveLength(1)
		const piece = result.pieces[0]
		expect(piece).toBeTruthy()
		expect(piece.enable).toEqual({ start: 5000, duration: 4000 })
		expect(piece.outputLayerId).toBe(SharedOutputLayer.OVERLAY)
		expect(piece.sourceLayerId).toBe(SourceLayer.PgmGraphicsLower)
		expect(piece.lifespan).toBe(PieceLifespan.WithinPart)
		const tlObj = (piece.content?.timelineObjects as TSR.TSRTimelineObj[]).find(
			(obj) =>
				obj.content.deviceType === TSR.DeviceType.VIZMSE &&
				obj.content.type === TSR.TimelineContentTypeVizMSE.ELEMENT_INTERNAL
		) as TSR.TimelineObjVIZMSEElementInternal | undefined
		expect(tlObj).toBeTruthy()
		expect(tlObj?.layer).toBe(SharedGraphicLLayer.GraphicLLayerOverlayLower)
		expect(tlObj?.content.templateName).toBe('bund')
		expect(tlObj?.content.templateData).toStrictEqual(['Some Person', 'Some Info'])
		expect(tlObj?.content.channelName).toBe('OVL1')
	})
})
