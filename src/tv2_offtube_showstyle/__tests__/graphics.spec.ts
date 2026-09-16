import { PieceLifespan, TSR } from 'blueprints-integration'
import { CueDefinitionGraphic, GraphicInternal, GraphicPilot, literal, PartDefinition } from 'tv2-common'
import { CueType, PartType, SharedGraphicLLayer, SharedOutputLayers } from 'tv2-constants'
import { SegmentUserContext } from '../../__mocks__/context'
import { defaultShowStyleConfig, defaultStudioConfig, FULL_SHOW_NAME } from '../../tv2_afvd_showstyle/__tests__/configs'
import { parseConfig as parseStudioConfig } from '../../tv2_offtube_studio/helpers/config'
import mappingsDefaults from '../../tv2_offtube_studio/migrations/mappings-defaults'
import { getConfig, parseConfig as parseShowStyleConfig } from '../helpers/config'
import { OfftubeSourceLayer } from '../layers'
import { OfftubeCreatePartGrafik } from '../parts/OfftubeGrafik'

const SEGMENT_EXTERNAL_ID = '00000000'

function makeMockContext() {
	const context = new SegmentUserContext(
		'qbox_graphics_test',
		mappingsDefaults,
		parseStudioConfig,
		parseShowStyleConfig
	)
	context.studioConfig = { ...defaultStudioConfig, GraphicsType: 'HTML' } as any
	context.showStyleConfig = defaultShowStyleConfig as any
	return context
}

function makeGraphicPart(cue: CueDefinitionGraphic<GraphicInternal | GraphicPilot>): PartDefinition {
	return literal<PartDefinition>({
		type: PartType.Grafik,
		externalId: '',
		segmentExternalId: SEGMENT_EXTERNAL_ID,
		rawType: '',
		cues: [cue],
		script: '',
		fields: {},
		modified: 0,
		storyName: ''
	})
}

describe('Qbox graphics', () => {
	it('uses Viz MSE for a persistent SS wall loop in an HTML studio', async () => {
		const context = makeMockContext()
		const config = getConfig(context)
		const result = await OfftubeCreatePartGrafik(
			context,
			config,
			makeGraphicPart(
				literal<CueDefinitionGraphic<GraphicInternal>>({
					type: CueType.Graphic,
					target: 'WALL',
					graphic: {
						type: 'internal',
						template: 'SC_LOOP_ON',
						textFields: [],
						cue: 'sc-loop'
					},
					iNewsCommand: 'SS'
				})
			),
			0
		)

		const piece = result.pieces.find(candidate => candidate.sourceLayerId === OfftubeSourceLayer.WallGraphics)
		const timeline = piece?.content?.timelineObjects as TSR.TSRTimelineObj[]
		const vizObj = timeline.find(
			obj =>
				obj.content.deviceType === TSR.DeviceType.VIZMSE &&
				obj.content.type === TSR.TimelineContentTypeVizMSE.ELEMENT_INTERNAL
		) as TSR.TimelineObjVIZMSEElementInternal | undefined

		expect(piece?.outputLayerId).toBe(SharedOutputLayers.SEC)
		expect(piece?.lifespan).toBe(PieceLifespan.OutOnShowStyleEnd)
		expect(vizObj?.enable).toEqual({ while: '1' })
		expect(vizObj?.layer).toBe(SharedGraphicLLayer.GraphicLLayerWall)
		expect(vizObj?.content.channelName).toBe('WALL1')
		expect(vizObj?.content.templateName).toBe('SC_LOOP_ON')
		expect(vizObj?.content.showId).toBe(FULL_SHOW_NAME)
		expect(timeline.some(obj => obj.content.deviceType === TSR.DeviceType.CASPARCG)).toBe(false)
	})

	it('uses Viz MSE for an SS wall still in an HTML studio', async () => {
		const context = makeMockContext()
		const config = getConfig(context)
		const result = await OfftubeCreatePartGrafik(
			context,
			config,
			makeGraphicPart(
				literal<CueDefinitionGraphic<GraphicPilot>>({
					type: CueType.Graphic,
					target: 'WALL',
					graphic: {
						type: 'pilot',
						name: 'wall-still',
						vcpid: 1234567890,
						continueCount: -1
					},
					iNewsCommand: 'SS'
				})
			),
			0
		)

		const piece = result.pieces.find(candidate => candidate.sourceLayerId === OfftubeSourceLayer.WallGraphics)
		const timeline = piece?.content?.timelineObjects as TSR.TSRTimelineObj[]
		const vizObj = timeline.find(
			obj =>
				obj.content.deviceType === TSR.DeviceType.VIZMSE &&
				obj.content.type === TSR.TimelineContentTypeVizMSE.ELEMENT_PILOT
		) as TSR.TimelineObjVIZMSEElementPilot | undefined

		expect(vizObj?.layer).toBe(SharedGraphicLLayer.GraphicLLayerWall)
		expect(vizObj?.content.channelName).toBe('WALL1')
		expect(vizObj?.content.templateVcpId).toBe(1234567890)
		expect(piece?.prerollDuration).toBe(config.studio.VizPilotGraphics.PrerollDuration)
		expect(timeline.some(obj => obj.content.deviceType === TSR.DeviceType.CASPARCG)).toBe(false)
	})

	it('keeps non-wall graphics on CasparCG in an HTML studio', async () => {
		const context = makeMockContext()
		const config = getConfig(context)
		const result = await OfftubeCreatePartGrafik(
			context,
			config,
			makeGraphicPart(
				literal<CueDefinitionGraphic<GraphicPilot>>({
					type: CueType.Graphic,
					target: 'OVL',
					graphic: {
						type: 'pilot',
						name: 'overlay',
						vcpid: 1234567890,
						continueCount: -1
					},
					iNewsCommand: 'GRAFIK'
				})
			),
			0
		)

		const timeline = result.pieces[0].content?.timelineObjects as TSR.TSRTimelineObj[]

		expect(timeline.some(obj => obj.content.deviceType === TSR.DeviceType.CASPARCG)).toBe(true)
		expect(timeline.some(obj => obj.content.deviceType === TSR.DeviceType.VIZMSE)).toBe(false)
	})
})
