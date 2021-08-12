import { ExtendedIngestRundown } from '@sofie-automation/blueprints-integration'
import { ShowStyleUserContext } from '../../__mocks__/context'
import { checkAllLayers } from './layers-check'

// @ts-ignore
global.VERSION = 'test'
// @ts-ignore
global.VERSION_TSR = 'test'
// @ts-ignore
global.VERSION_INTEGRATION = 'test'
import { parseConfig as parseStudioConfig } from '../../tv2_afvd_studio/helpers/config'
import mappingsDefaults from '../../tv2_afvd_studio/migrations/mappings-defaults'
import { parseConfig as parseShowStyleConfig } from '../helpers/config'
import Blueprints from '../index'
import { defaultShowStyleConfig, defaultStudioConfig } from './configs'

const configs = [{ id: 'default', studioConfig: defaultStudioConfig, showStyleConfig: defaultShowStyleConfig }]

const RUNDOWN_ID = 'test_rundown'
const SEGMENT_ID = 'test_segment'
const PART_ID = 'test_part'

describe('Baseline', () => {
	for (const configSpec of configs) {
		test('Config: ' + configSpec.id, () => {
			expect(configSpec.studioConfig).toBeTruthy()
			expect(configSpec.showStyleConfig).toBeTruthy()

			const rundown: ExtendedIngestRundown = {
				externalId: 'abc',
				name: 'Mock RO',
				type: 'mock',
				payload: {},
				segments: [],
				coreData: undefined
			}

			const mockContext = new ShowStyleUserContext(
				rundown.name,
				mappingsDefaults,
				parseStudioConfig,
				parseShowStyleConfig,
				RUNDOWN_ID,
				SEGMENT_ID,
				PART_ID
			)
			mockContext.studioConfig = configSpec.studioConfig as any
			mockContext.showStyleConfig = configSpec.showStyleConfig as any

			const res = Blueprints.getRundown(mockContext, rundown)

			expect(res).not.toBeNull()
			expect(res.baseline).not.toHaveLength(0)
			expect(res.globalAdLibPieces).not.toHaveLength(0)

			checkAllLayers(mockContext, res.globalAdLibPieces, res.baseline.timelineObjects)

			// ensure there were no warnings
			expect(mockContext.getNotes()).toEqual([])
		})
	}
})
