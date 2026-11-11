import { IngestRundown, TSR } from 'blueprints-integration'
import { AdlibActionType, SwitcherAuxLLayer } from 'tv2-constants'
import { GetRundownContext } from '../../__mocks__/context'
import { m2lxStudioSettings } from '../../__mocks__/m2lx'
import {
	DEFAULT_GRAPHICS_SETUP,
	defaultShowStyleConfig,
	defaultStudioConfig
} from '../../tv2_afvd_showstyle/__tests__/configs'
import { OfftubeStudioBlueprintConfig, parseConfig as parseStudioConfig } from '../../tv2_offtube_studio/helpers/config'
import { OfftubeGraphicLLayer } from '../../tv2_offtube_studio/layers'
import mappingsDefaults from '../../tv2_offtube_studio/migrations/mappings-defaults'
import { getRundown } from '../getRundown'
import { parseConfig as parseShowStyleConfig } from '../helpers/config'

describe('Offtube rundown baseline', () => {
	it('M2L-X active rundown uses one native mixer and retains Caspar/Sisyfos without fictitious clean/DVE routing', () => {
		const settings = m2lxStudioSettings(
			JSON.stringify({
				sources: [
					{ input: defaultStudioConfig.SwitcherSource.Default, source: 'real_default' },
					{ input: 12, source: 'real_loop' }
				],
				keyers: [],
				routers: [{ layer: SwitcherAuxLLayer.AuxScreen, node: 'router_node', output: 'wall' }]
			})
		)
		const context = new GetRundownContext(
			'native',
			{ ...mappingsDefaults, ...settings.mappingDefaults },
			parseStudioConfig,
			parseShowStyleConfig
		)
		context.studioConfig = {
			...JSON.parse(JSON.stringify(defaultStudioConfig)),
			...settings.studioConfig,
			SwitcherType: 'M2LX',
			SwitcherSource: {
				...settings.studioConfig.SwitcherSource,
				DSK: [],
				SplitBackground: 'real_default',
				Loop: 'real_loop'
			},
			SourcesCam: [],
			SourcesRM: [],
			SourcesFeed: []
		}
		context.showStyleConfig = JSON.parse(JSON.stringify(defaultShowStyleConfig))
		context.showStyleConfig.DVEStyles = ['program', 'preview'].map(bus => ({
			_id: `native-${bus}`,
			DVEName: `Native ${bus}`,
			DVEInputs: '1:INP1',
			DVEJSON: JSON.stringify({
				bus,
				background: 'real_default',
				boxes: {
					0: {
						index: 0,
						enabled: true,
						translation: { x: 100, y: 200 },
						scale: { x: 0.4, y: 0.4 },
						crop: { x: 0, y: 0, width: 1, height: 1 }
					}
				}
			})
		}))
		const result = getRundown(context, {
			externalId: 'native',
			name: 'Native',
			type: 'mock',
			payload: {},
			segments: []
		})
		const baseline = result.baseline.timelineObjects
		expect(baseline.filter(TSR.isTimelineObjM2LXMixer)).toHaveLength(1)
		expect(baseline.find(TSR.isTimelineObjM2LXMixer)?.content.mixer.program).toBe('real_default')
		expect(baseline.find(TSR.isTimelineObjM2LXMixer)?.content.mixer.composition).toEqual({
			pip: { 0: { visible: false }, 1: { visible: false }, 2: { visible: false }, 3: { visible: false } }
		})
		expect(baseline.find(TSR.isTimelineObjM2LXRouter)?.content.input).toBe('real_loop')
		expect(baseline.some(object => object.content.deviceType === TSR.DeviceType.CASPARCG)).toBe(true)
		expect(baseline.some(object => object.content.deviceType === TSR.DeviceType.SISYFOS)).toBe(true)
		expect(
			result.globalActions
				.filter(action => action.actionId === AdlibActionType.CUT_SOURCE_TO_BOX)
				.map(action => action.userData.box)
		).toEqual([0, 1, 2, 3])
		const layouts = result.globalActions.filter(action => action.actionId === AdlibActionType.SELECT_DVE_LAYOUT)
		expect(layouts).toHaveLength(1)
		expect(layouts[0].userData).toMatchObject({ config: { DVEName: 'Native program' } })
		expect(
			baseline.some(object => [TSR.DeviceType.ATEM, TSR.DeviceType.TRICASTER].includes(object.content.deviceType))
		).toBe(false)
	})
	it('does not use the idle Wall loop while a rundown is active', () => {
		const context = new GetRundownContext('idle_wall', mappingsDefaults, parseStudioConfig, parseShowStyleConfig)
		const config: OfftubeStudioBlueprintConfig = {
			studio: {
				...defaultStudioConfig,
				GraphicsType: 'HTML',
				SwitcherSource: {
					...defaultStudioConfig.SwitcherSource,
					SplitBackground: 11,
					Loop: 12
				},
				IdleSource: 7,
				IdleSisyfosLayers: [],
				IdleWallLoop: [{ _id: 'idle-wall-loop', Enabled: false, ShowName: 'OFF_AIR', TemplateName: 'WALL_LOOP' }]
			},
			sources: { cameras: [], lives: [], feeds: [], replays: [] },
			mediaPlayers: [],
			dsk: defaultStudioConfig.SwitcherSource.DSK
		}
		jest.spyOn(context, 'getStudioConfig').mockReturnValue(config)
		jest.spyOn(context, 'getShowStyleConfig').mockReturnValue({
			showStyle: defaultShowStyleConfig,
			selectedGraphicsSetup: DEFAULT_GRAPHICS_SETUP
		})
		const rundown: IngestRundown = { externalId: 'test', name: 'Test', type: 'mock', payload: {}, segments: [] }
		const disabledBaseline = getRundown(context, rundown).baseline

		config.studio.IdleWallLoop = [
			{ _id: 'idle-wall-loop', Enabled: true, ShowName: 'OFF_AIR', TemplateName: 'WALL_LOOP' }
		]
		const enabledBaseline = getRundown(context, rundown).baseline

		expect(enabledBaseline).toEqual(disabledBaseline)
		expect(enabledBaseline.timelineObjects.some(obj => obj.layer === OfftubeGraphicLLayer.GraphicLLayerWall)).toBe(
			false
		)
		expect(context.getNotes()).toEqual([])
	})
})
