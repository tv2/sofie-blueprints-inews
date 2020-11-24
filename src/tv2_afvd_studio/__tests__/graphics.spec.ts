import { SegmentContext } from '../../__mocks__/context'
import {
	CueDefinition,
	CueDefinitionBackgroundLoop,
	CueDefinitionGraphic,
	CueDefinitionGraphicDesign,
	CueDefinitionUnpairedPilot,
	CueDefinitionUnpairedTarget,
	GraphicInternal,
	GraphicLLayer,
	GraphicPilot,
	literal,
	PartContext2,
	PartDefinition
} from 'tv2-common'
import { IBlueprintRundownDB, PieceLifespan, TSR } from 'tv-automation-sofie-blueprints-integration'
import mappingsDefaults from '../migrations/mappings-defaults'
import { CueType, PartType } from 'tv2-constants'
import { defaultShowStyleConfig, defaultStudioConfig } from '../../tv2_afvd_showstyle/__tests__/configs'
import { CreatePartGrafik } from '../../tv2_afvd_showstyle/parts/grafik'
import { getConfig } from '../../tv2_afvd_showstyle/helpers/config'
import { SourceLayer } from '../../tv2_afvd_showstyle/layers'
import { AtemLLayer, CasparLLayer } from '../layers'
import { CreatePartUnknown } from '../../tv2_afvd_showstyle/parts/unknown'

const RUNDOWN_EXTERNAL_ID = 'TEST.SOFIE.JEST'
const SEGMENT_EXTERNAL_ID = '00000000'
const PART_EXTERNAL_ID = '00000000'

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

describe('Graphics', () => {
	it('Throws warning for unpaired target and creates invalid part', () => {
		const context = makeMockContext()
		const config = getConfig(context)
		const partContext = new PartContext2(context, PART_EXTERNAL_ID)

		const cues: CueDefinition[] = [
			literal<CueDefinitionUnpairedTarget>({
				type: CueType.UNPAIRED_TARGET,
				target: 'FULL',
				iNewsCommand: 'GRAFIK'
			})
		]

		const partDefintion: PartDefinition = literal<PartDefinition>({
			type: PartType.Grafik,
			variant: {},
			externalId: '',
			segmentExternalId: SEGMENT_EXTERNAL_ID,
			rawType: '',
			cues,
			script: '',
			fields: {},
			modified: 0,
			storyName: ''
		})

		const result = CreatePartGrafik(partContext, config, partDefintion, 0)

		expect(context.getNotes().map(msg => msg.message)).toEqual([`No graphic found after GRAFIK cue`])
		expect(result.pieces).toHaveLength(0)
		expect(result.adLibPieces).toHaveLength(0)
		expect(result.actions).toHaveLength(0)
		expect(result.part.invalid).toBe(true)
	})

	it('Throws warning for unpaired pilot', () => {
		const context = makeMockContext()
		const config = getConfig(context)
		const partContext = new PartContext2(context, PART_EXTERNAL_ID)

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
			variant: {},
			externalId: '',
			segmentExternalId: SEGMENT_EXTERNAL_ID,
			rawType: '',
			cues,
			script: '',
			fields: {},
			modified: 0,
			storyName: ''
		})

		CreatePartGrafik(partContext, config, partDefinition, 0)

		expect(context.getNotes().map(msg => msg.message)).toEqual([`Graphic found without target engine`])
	})

	it('Creates FULL graphic correctly', () => {
		const context = makeMockContext()
		const config = getConfig(context)
		const partContext = new PartContext2(context, PART_EXTERNAL_ID)

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
			variant: {},
			externalId: '',
			segmentExternalId: SEGMENT_EXTERNAL_ID,
			rawType: '',
			cues,
			script: '',
			fields: {},
			modified: 0,
			storyName: ''
		})

		const result = CreatePartGrafik(partContext, config, partDefinition, 0)
		expect(result.pieces).toHaveLength(1)
		const piece = result.pieces[0]
		expect(piece.sourceLayerId).toBe(SourceLayer.PgmPilot)
		expect(piece.outputLayerId).toBe('pgm') // TODO: Enum
		expect(piece.enable).toEqual({ start: 0 })
		expect(piece.adlibPreroll).toBe(config.studio.PilotPrerollDuration)
		expect(piece.lifespan).toBe(PieceLifespan.WithinPart)
		const content = piece.content!
		const timeline = content.timelineObjects as TSR.TSRTimelineObj[]
		expect(timeline).toHaveLength(19)
		const vizObj = timeline.find(
			t =>
				t.content.deviceType === TSR.DeviceType.VIZMSE && t.content.type === TSR.TimelineContentTypeVizMSE.ELEMENT_PILOT
		)! as TSR.TimelineObjVIZMSEElementPilot
		expect(vizObj.enable).toEqual({ start: 0 })
		expect(vizObj.layer).toEqual(GraphicLLayer.GraphicLLayerPilot)
		expect(vizObj.content.channelName).toBe('FULL1') // TODO: FULL1: Enum / Type
		expect(vizObj.content.templateVcpId).toBe(1234567890)
		expect(vizObj.content.continueStep).toBe(-1)
		expect(vizObj.content.delayTakeAfterOutTransition).toBe(true)
		expect(vizObj.content.outTransition).toEqual({
			type: TSR.VIZMSETransitionType.DELAY,
			delay: config.studio.PilotOutTransitionDuration
		})
		expect(vizObj.classes).toEqual(['full'])
	})

	it('Creates OVL pilot graphic correctly', () => {
		const context = makeMockContext()
		const config = getConfig(context)
		const partContext = new PartContext2(context, PART_EXTERNAL_ID)

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
			variant: {},
			externalId: '',
			segmentExternalId: SEGMENT_EXTERNAL_ID,
			rawType: '',
			cues,
			script: '',
			fields: {},
			modified: 0,
			storyName: ''
		})

		const result = CreatePartGrafik(partContext, config, partDefinition, 0)
		expect(result.pieces).toHaveLength(1)
		const piece = result.pieces[0]
		expect(piece.sourceLayerId).toBe(SourceLayer.PgmPilotOverlay)
		expect(piece.outputLayerId).toBe('overlay') // TODO: Enum
		expect(piece.enable).toEqual({ start: 2000 })
		expect(piece.adlibPreroll).toBe(config.studio.PilotPrerollDuration)
		expect(piece.lifespan).toBe(PieceLifespan.OutOnRundownEnd)
		const content = piece.content!
		const timeline = content.timelineObjects as TSR.TSRTimelineObj[]
		expect(timeline).toHaveLength(1)
		const vizObj = timeline.find(
			t =>
				t.content.deviceType === TSR.DeviceType.VIZMSE && t.content.type === TSR.TimelineContentTypeVizMSE.ELEMENT_PILOT
		)! as TSR.TimelineObjVIZMSEElementPilot
		expect(vizObj.enable).toEqual({ while: '!.full' })
		expect(vizObj.layer).toEqual(GraphicLLayer.GraphicLLayerPilotOverlay)
		expect(vizObj.content.channelName).toBe('OVL1') // TODO: OVL1: Enum / Type
		expect(vizObj.content.templateVcpId).toBe(1234567890)
		expect(vizObj.content.continueStep).toBe(-1)
		expect(vizObj.content.delayTakeAfterOutTransition).toBe(true)
		expect(vizObj.content.outTransition).toEqual({
			delay: config.studio.PilotOutTransitionDuration,
			type: TSR.VIZMSETransitionType.DELAY
		})
	})

	it('Creates WALL graphic correctly', () => {
		const context = makeMockContext()
		const config = getConfig(context)
		const partContext = new PartContext2(context, PART_EXTERNAL_ID)

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
			variant: {},
			externalId: '',
			segmentExternalId: SEGMENT_EXTERNAL_ID,
			rawType: '',
			cues,
			script: '',
			fields: {},
			modified: 0,
			storyName: ''
		})

		const result = CreatePartGrafik(partContext, config, partDefinition, 0)
		expect(result.pieces).toHaveLength(1)
		const piece = result.pieces[0]
		expect(piece.sourceLayerId).toBe(SourceLayer.WallGraphics)
		expect(piece.outputLayerId).toBe('sec') // TODO: Enum
		expect(piece.enable).toEqual({ start: 0 })
		expect(piece.adlibPreroll).toBe(config.studio.PilotPrerollDuration)
		expect(piece.lifespan).toBe(PieceLifespan.OutOnRundownEnd)
		const content = piece.content!
		const timeline = content.timelineObjects as TSR.TSRTimelineObj[]
		expect(timeline).toHaveLength(1)
		const vizObj = timeline.find(
			t =>
				t.content.deviceType === TSR.DeviceType.VIZMSE && t.content.type === TSR.TimelineContentTypeVizMSE.ELEMENT_PILOT
		)! as TSR.TimelineObjVIZMSEElementPilot
		expect(vizObj.enable).toEqual({ start: 0 })
		expect(vizObj.layer).toEqual(GraphicLLayer.GraphicLLayerWall)
		expect(vizObj.content.channelName).toBe('WALL1') // TODO: OVL1: Enum / Type
		expect(vizObj.content.templateVcpId).toBe(1234567890)
		expect(vizObj.content.continueStep).toBe(-1)
		expect(vizObj.content.delayTakeAfterOutTransition).toBe(undefined)
		expect(vizObj.content.outTransition).toEqual(undefined)
	})

	it('Creates TLF graphic correctly', () => {
		const context = makeMockContext()
		const config = getConfig(context)
		const partContext = new PartContext2(context, PART_EXTERNAL_ID)

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
			variant: {},
			externalId: '',
			segmentExternalId: SEGMENT_EXTERNAL_ID,
			rawType: '',
			cues,
			script: '',
			fields: {},
			modified: 0,
			storyName: ''
		})

		const result = CreatePartGrafik(partContext, config, partDefinition, 0)
		expect(result.pieces).toHaveLength(1)
		const piece = result.pieces[0]
		expect(piece.sourceLayerId).toBe(SourceLayer.PgmGraphicsTLF)
		expect(piece.outputLayerId).toBe('pgm') // TODO: Enum
		expect(piece.enable).toEqual({ start: 0 })
		expect(piece.adlibPreroll).toBe(config.studio.PilotPrerollDuration)
		expect(piece.lifespan).toBe(PieceLifespan.WithinPart)
		const content = piece.content!
		const timeline = content.timelineObjects as TSR.TSRTimelineObj[]
		expect(timeline).toHaveLength(19)
		const vizObj = timeline.find(
			t =>
				t.content.deviceType === TSR.DeviceType.VIZMSE && t.content.type === TSR.TimelineContentTypeVizMSE.ELEMENT_PILOT
		)! as TSR.TimelineObjVIZMSEElementPilot
		expect(vizObj.enable).toEqual({ start: 0 })
		expect(vizObj.layer).toEqual(GraphicLLayer.GraphicLLayerPilot)
		expect(vizObj.content.channelName).toBe('FULL1') // TODO: FULL1: Enum / Type
		expect(vizObj.content.templateVcpId).toBe(1234567890)
		expect(vizObj.content.continueStep).toBe(-1)
		expect(vizObj.content.delayTakeAfterOutTransition).toBe(true)
		expect(vizObj.content.outTransition).toEqual({
			type: TSR.VIZMSETransitionType.DELAY,
			delay: config.studio.PilotOutTransitionDuration
		})
		expect(vizObj.classes).toEqual(['full'])
	})

	it('Routes source to engine', () => {
		const context = makeMockContext()
		const config = getConfig(context)
		const partContext = new PartContext2(context, PART_EXTERNAL_ID)

		const cues: CueDefinition[] = [
			literal<CueDefinitionGraphic<GraphicPilot>>({
				type: CueType.Graphic,
				target: 'TLF',
				routing: {
					type: CueType.Routing,
					target: 'TLF',
					INP1: 'LIVE 1',
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
			variant: {},
			externalId: '',
			segmentExternalId: SEGMENT_EXTERNAL_ID,
			rawType: '',
			cues,
			script: '',
			fields: {},
			modified: 0,
			storyName: ''
		})

		const result = CreatePartGrafik(partContext, config, partDefinition, 0)
		expect(result.pieces).toHaveLength(2)
		const auxPiece = result.pieces.find(p => p.outputLayerId === 'aux')! // TODO: AUX
		expect(auxPiece.enable).toEqual({ start: 0 })
		expect(auxPiece.sourceLayerId).toBe(SourceLayer.VizFullIn1)
		expect(auxPiece.lifespan).toBe(PieceLifespan.WithinPart)
		const auxObj = (auxPiece.content?.timelineObjects as TSR.TSRTimelineObj[]).find(
			obj => obj.content.deviceType === TSR.DeviceType.ATEM && obj.content.type === TSR.TimelineContentTypeAtem.AUX
		) as TSR.TimelineObjAtemAUX | undefined
		expect(auxObj).toBeTruthy()
		expect(auxObj?.enable).toEqual({ start: 0 })
		expect(auxObj?.layer).toBe(AtemLLayer.AtemAuxVizOvlIn1)
		expect(auxObj?.content.aux.input).toBe(1)
	})

	it('Creates design element', () => {
		const context = makeMockContext()
		const config = getConfig(context)
		const partContext = new PartContext2(context, PART_EXTERNAL_ID)

		const cues: CueDefinition[] = [
			literal<CueDefinitionGraphicDesign>({
				type: CueType.GraphicDesign,
				design: 'DESIGN_FODBOLD',
				iNewsCommand: 'KG'
			})
		]

		const partDefinition: PartDefinition = literal<PartDefinition>({
			type: PartType.Unknown,
			variant: {},
			externalId: '',
			segmentExternalId: SEGMENT_EXTERNAL_ID,
			rawType: '',
			cues,
			script: '',
			fields: {},
			modified: 0,
			storyName: ''
		})

		const result = CreatePartUnknown(partContext, config, partDefinition, 0)
		expect(result.pieces).toHaveLength(1)
		const piece = result.pieces[0]
		expect(piece).toBeTruthy()
		expect(piece.outputLayerId).toBe('sec')
		expect(piece.sourceLayerId).toBe(SourceLayer.PgmDesign)
		expect(piece.lifespan).toBe(PieceLifespan.WithinPart)
		expect(piece.enable).toEqual({ start: 0 })
	})

	it('Creates background loop', () => {
		const context = makeMockContext()
		const config = getConfig(context)
		const partContext = new PartContext2(context, PART_EXTERNAL_ID)

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
			variant: {},
			externalId: '',
			segmentExternalId: SEGMENT_EXTERNAL_ID,
			rawType: '',
			cues,
			script: '',
			fields: {},
			modified: 0,
			storyName: ''
		})

		const result = CreatePartUnknown(partContext, config, partDefinition, 0)
		expect(result.pieces).toHaveLength(1)
		const piece = result.pieces[0]
		expect(piece).toBeTruthy()
		expect(piece.name).toBe('DESIGN_SC')
		expect(piece.outputLayerId).toBe('sec')
		expect(piece.sourceLayerId).toBe(SourceLayer.PgmDVEBackground)
		expect(piece.lifespan).toBe(PieceLifespan.OutOnRundownEnd)
		const tlObj = (piece.content?.timelineObjects as TSR.TSRTimelineObj[]).find(
			obj =>
				obj.content.deviceType === TSR.DeviceType.CASPARCG && obj.content.type === TSR.TimelineContentTypeCasparCg.MEDIA
		) as TSR.TimelineObjCCGMedia | undefined
		expect(tlObj).toBeTruthy()
		expect(tlObj?.layer).toBe(CasparLLayer.CasparCGDVELoop)
		expect(tlObj?.content.file).toBe('dve/DESIGN_SC')
		expect(tlObj?.content.loop).toBe(true)
	})

	it('Creates overlay internal graphic', () => {
		const context = makeMockContext()
		const config = getConfig(context)
		const partContext = new PartContext2(context, PART_EXTERNAL_ID)

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
			variant: {},
			externalId: '',
			segmentExternalId: SEGMENT_EXTERNAL_ID,
			rawType: '',
			cues,
			script: '',
			fields: {},
			modified: 0,
			storyName: ''
		})

		const result = CreatePartUnknown(partContext, config, partDefinition, 0)
		expect(result.pieces).toHaveLength(1)
		const piece = result.pieces[0]
		expect(piece).toBeTruthy()
		expect(piece.enable).toEqual({ start: 5000, duration: 4000 })
		expect(piece.outputLayerId).toBe('overlay')
		expect(piece.sourceLayerId).toBe(SourceLayer.PgmGraphicsLower)
		expect(piece.lifespan).toBe(PieceLifespan.WithinPart)
		const tlObj = (piece.content?.timelineObjects as TSR.TSRTimelineObj[]).find(
			obj =>
				obj.content.deviceType === TSR.DeviceType.VIZMSE &&
				obj.content.type == TSR.TimelineContentTypeVizMSE.ELEMENT_INTERNAL
		) as TSR.TimelineObjVIZMSEElementInternal | undefined
		expect(tlObj).toBeTruthy()
		expect(tlObj?.layer).toBe(GraphicLLayer.GraphicLLayerOverlayLower)
		expect(tlObj?.content.templateName).toBe('bund')
		expect(tlObj?.content.templateData).toStrictEqual(['Some Person', 'Some Info'])
		expect(tlObj?.content.channelName).toBe('OVL1')
	})
})
