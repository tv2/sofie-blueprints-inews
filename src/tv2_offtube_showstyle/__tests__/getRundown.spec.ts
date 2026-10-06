import { IngestRundown } from 'blueprints-integration'
import { GetRundownContext } from '../../__mocks__/context'
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
	it('does not use the idle Wall loop while a rundown is active', () => {
		const context = new GetRundownContext('idle_wall', mappingsDefaults, parseStudioConfig, parseShowStyleConfig)
		const config: OfftubeStudioBlueprintConfig = {
			studio: {
				...defaultStudioConfig,
				GraphicsType: 'HTML',
				AtemSource: {
					...defaultStudioConfig.AtemSource,
					SplitBackground: 11,
					Loop: 12
				},
				IdleSource: 7,
				IdleSisyfosLayers: [],
				IdleWallLoop: [{ _id: 'idle-wall-loop', Enabled: false, ShowName: 'OFF_AIR', TemplateName: 'WALL_LOOP' }]
			},
			sources: { cameras: [], lives: [], feeds: [], replays: [] },
			mediaPlayers: [],
			dsk: defaultStudioConfig.AtemSource.DSK
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
