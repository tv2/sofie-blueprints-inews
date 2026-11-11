import { BlueprintMappings, IBlueprintConfig, TSR } from 'blueprints-integration'
import { SwitcherType } from 'tv2-common'
import { NoteType } from 'tv2-constants'
import { StudioContext } from '../../__mocks__/context'
import { m2lxStudioSettings } from '../../__mocks__/m2lx'
import { getBaseline } from '../getBaseline'
import { parseConfig } from '../helpers/config'
import { OfftubeGraphicLLayer, OfftubeSisyfosLLayer } from '../layers'
import mappingsDefaults from '../migrations/mappings-defaults'

const idleWallLoop = {
	_id: 'idle-wall-loop',
	Enabled: true,
	ShowName: 'OFF_AIR',
	TemplateName: 'WALL_LOOP'
}

function makeMockContext(config: IBlueprintConfig = {}, mappings: BlueprintMappings = mappingsDefaults) {
	const context = new StudioContext('idle_wall', mappings, parseConfig)
	context.studioConfig = {
		SourcesCam: [],
		SourcesRM: [],
		SourcesFeed: [],
		ABMediaPlayers: [],
		SwitcherSource: { DSK: [] },
		GraphicsType: 'HTML',
		IdleSource: 7,
		IdleSisyfosLayers: [OfftubeSisyfosLLayer.SisyfosSourceLive_1_Stereo],
		...config
	}
	return context
}

function getWallObjects(context: StudioContext) {
	return getBaseline(context).timelineObjects.filter(obj => obj.layer === OfftubeGraphicLLayer.GraphicLLayerWall)
}

describe('Idle Wall Loop baseline', () => {
	it('M2L-X uses one real mixer without recursive clean routing while preserving Sisyfos and the opt-in wall loop', () => {
		const settings = m2lxStudioSettings(
			JSON.stringify({
				sources: [{ input: 7, source: 'real_idle' }],
				keyers: [],
				routers: []
			})
		)
		const context = makeMockContext(
			{
				IdleSource: 'real_idle',
				SwitcherType: SwitcherType.M2LX,
				IdleWallLoop: [idleWallLoop]
			},
			{ ...mappingsDefaults, ...settings.mappingDefaults }
		)
		const baseline = getBaseline(context).timelineObjects
		expect(baseline.filter(TSR.isTimelineObjM2LXMixer)).toHaveLength(1)
		expect(baseline.find(TSR.isTimelineObjM2LXMixer)?.content.mixer.program).toBe('real_idle')
		expect(baseline.find(TSR.isTimelineObjM2LXMixer)?.content.mixer.composition).toEqual({
			pip: { 0: { visible: false }, 1: { visible: false }, 2: { visible: false }, 3: { visible: false } }
		})
		expect(baseline.some(object => object.content.deviceType === TSR.DeviceType.SISYFOS)).toBe(true)
		expect(baseline.some(object => object.content.deviceType === TSR.DeviceType.VIZMSE)).toBe(true)
		expect(
			baseline.some(object => [TSR.DeviceType.ATEM, TSR.DeviceType.TRICASTER].includes(object.content.deviceType))
		).toBe(false)
	})
	it('leaves the existing baseline unchanged when settings are absent', () => {
		const context = makeMockContext()
		const baseline = getBaseline(context)

		expect(baseline.timelineObjects).toHaveLength(4)
		expect(baseline.timelineObjects.every(obj => obj.content.deviceType !== TSR.DeviceType.VIZMSE)).toBe(true)
		expect(context.getNotes()).toEqual([])
	})

	it.each<IBlueprintConfig>([
		{ Enabled: false },
		{ ...idleWallLoop, Enabled: false },
		{ ShowName: 'OFF_AIR', TemplateName: 'WALL_LOOP' },
		{ ...idleWallLoop, Enabled: 'true' }
	])('requires explicit opt-in: %p', settings => {
		const context = makeMockContext({ IdleWallLoop: [{ _id: 'idle-wall-loop', ...settings }] })

		expect(getBaseline(context)).toEqual(getBaseline(makeMockContext()))
		expect(context.getNotes()).toEqual([])
	})

	it.each(['HTML', 'VIZ'])('creates the internal Wall loop with %s graphics and no showstyle', graphicsType => {
		const context = makeMockContext({ GraphicsType: graphicsType, IdleWallLoop: [idleWallLoop] })

		expect(context.showStyleConfig).toEqual({})
		expect(getWallObjects(context)).toEqual([
			{
				id: '',
				enable: { while: '1' },
				priority: 0,
				layer: OfftubeGraphicLLayer.GraphicLLayerWall,
				content: {
					deviceType: TSR.DeviceType.VIZMSE,
					type: TSR.TimelineContentTypeVizMSE.ELEMENT_INTERNAL,
					channelName: 'WALL1',
					showName: 'OFF_AIR',
					templateName: 'WALL_LOOP',
					templateData: []
				}
			}
		])
		expect(context.getNotes()).toEqual([])
	})

	it('trims surrounding whitespace in show and template names', () => {
		const context = makeMockContext({
			IdleWallLoop: [{ ...idleWallLoop, ShowName: ' OFF_AIR ', TemplateName: ' WALL_LOOP ' }]
		})

		expect(getWallObjects(context)).toEqual(getWallObjects(makeMockContext({ IdleWallLoop: [idleWallLoop] })))
		expect(context.getNotes()).toEqual([])
	})

	it.each<IBlueprintConfig>([
		{ Enabled: true },
		{ Enabled: true, ShowName: 'OFF_AIR' },
		{ Enabled: true, TemplateName: 'WALL_LOOP' },
		{ ...idleWallLoop, ShowName: '' },
		{ ...idleWallLoop, ShowName: ' \t ' },
		{ ...idleWallLoop, TemplateName: '' },
		{ ...idleWallLoop, TemplateName: ' \t ' },
		{ ...idleWallLoop, ShowName: 123 },
		{ ...idleWallLoop, TemplateName: 123 }
	])('warns and preserves the non-Wall baseline for incomplete settings: %p', settings => {
		const context = makeMockContext({ IdleWallLoop: [{ _id: 'idle-wall-loop', ...settings }] })

		expect(getBaseline(context)).toEqual(getBaseline(makeMockContext()))
		expect(context.getNotes()).toEqual([
			expect.objectContaining({
				type: NoteType.WARNING,
				message: 'Idle Wall Loop is enabled but requires both a Show Name and a Template Name.'
			})
		])
	})

	it.each(['missing', 'abstract'])('warns and preserves the non-Wall baseline for a %s Wall mapping', mappingType => {
		const mappings: BlueprintMappings = { ...mappingsDefaults }
		if (mappingType === 'missing') {
			delete mappings[OfftubeGraphicLLayer.GraphicLLayerWall]
		} else {
			mappings[OfftubeGraphicLLayer.GraphicLLayerWall] = {
				...mappings[OfftubeGraphicLLayer.GraphicLLayerWall],
				device: TSR.DeviceType.ABSTRACT,
				deviceId: 'abstract0'
			}
		}
		const context = makeMockContext({ IdleWallLoop: [idleWallLoop] }, mappings)

		expect(getBaseline(context)).toEqual(getBaseline(makeMockContext({}, mappings)))
		expect(context.getNotes()).toEqual([
			expect.objectContaining({
				type: NoteType.WARNING,
				message: 'Idle Wall Loop requires the graphic_wall mapping to target a Viz MSE device.'
			})
		])
	})

	it('respects a customized Viz device mapping', () => {
		const mappings: BlueprintMappings = {
			...mappingsDefaults,
			[OfftubeGraphicLLayer.GraphicLLayerWall]: {
				...mappingsDefaults[OfftubeGraphicLLayer.GraphicLLayerWall],
				deviceId: 'sharedWallViz'
			}
		}
		const context = makeMockContext({ IdleWallLoop: [idleWallLoop] }, mappings)

		expect(getWallObjects(context)).toHaveLength(1)
		expect(context.getStudioMappings()).toEqual(mappings)
		expect(context.getNotes()).toEqual([])
	})

	it('preserves ATEM and Sisyfos objects and emits a stable single Wall object', () => {
		const context = makeMockContext({ IdleWallLoop: [idleWallLoop] })
		const first = getBaseline(context)
		const second = getBaseline(context)
		const withoutWall = first.timelineObjects.filter(obj => obj.layer !== OfftubeGraphicLLayer.GraphicLLayerWall)

		expect(first.timelineObjects).toHaveLength(5)
		expect(withoutWall).toEqual(getBaseline(makeMockContext()).timelineObjects)
		expect(second).toEqual(first)
		expect(context.getNotes()).toEqual([])
	})

	it('treats an empty table as disabled', () => {
		const context = makeMockContext({ IdleWallLoop: [] })

		expect(getBaseline(context)).toEqual(getBaseline(makeMockContext()))
		expect(context.getNotes()).toEqual([])
	})

	it.each([true, false])('rejects multiple rows even when the extra row is enabled=%s', enabled => {
		const context = makeMockContext({
			IdleWallLoop: [idleWallLoop, { ...idleWallLoop, _id: 'another-loop', Enabled: enabled }]
		})

		expect(getBaseline(context)).toEqual(getBaseline(makeMockContext()))
		expect(context.getNotes()).toEqual([
			expect.objectContaining({
				type: NoteType.WARNING,
				message: 'Idle Wall Loop must contain only one configuration row. Remove the extra rows.'
			})
		])
	})
})
