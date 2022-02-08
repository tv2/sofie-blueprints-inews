import { ExtendedIngestRundown, TSR } from '@tv2media/blueprints-integration'
import { ShowStyleUserContext } from '../../__mocks__/context'
import { checkAllLayers } from './layers-check'

// @ts-ignore
global.VERSION = 'test'
// @ts-ignore
global.VERSION_TSR = 'test'
// @ts-ignore
global.VERSION_INTEGRATION = 'test'

import { GraphicLLayer } from '../../tv2-constants'
import { parseConfig as parseStudioConfig } from '../../tv2_afvd_studio/helpers/config'
import mappingsDefaults from '../../tv2_afvd_studio/migrations/mappings-defaults'
import { parseConfig as parseShowStyleConfig } from '../helpers/config'
import Blueprints from '../index'
import { defaultShowStyleConfig, defaultStudioConfig } from './configs'

const configSpec = { id: 'default', studioConfig: defaultStudioConfig, showStyleConfig: defaultShowStyleConfig }

const RUNDOWN_ID = 'test_rundown'
const SEGMENT_ID = 'test_segment'
const PART_ID = 'test_part'

describe('Baseline', () => {
	test('Config: ' + configSpec.id, () => {
		expect(configSpec.studioConfig).toBeTruthy()
		expect(configSpec.showStyleConfig).toBeTruthy()

		const mockRundown: ExtendedIngestRundown = createMockRundown()
		const mockContext: ShowStyleUserContext = createMockContext(mockRundown.name)

		const result = Blueprints.getRundown(mockContext, mockRundown)

		expect(result).not.toBeNull()
		expect(result.baseline.timelineObjects).not.toHaveLength(0)
		expect(result.globalAdLibPieces).not.toHaveLength(0)

		checkAllLayers(mockContext, result.globalAdLibPieces, result.baseline.timelineObjects)

		// ensure there were no warnings
		expect(mockContext.getNotes()).toEqual([])
	})

	test('SetConcept timeline object is created in base rundown', () => {
		const mockRundown: ExtendedIngestRundown = createMockRundown()
		const mockContext: ShowStyleUserContext = createMockContext(mockRundown.name)

		const rundown = Blueprints.getRundown(mockContext, mockRundown)

		const result = rundown.baseline.timelineObjects.filter(
			timelineObject =>
				timelineObject.layer === GraphicLLayer.GraphicLLayerConcept &&
				timelineObject.content.deviceType === TSR.DeviceType.VIZMSE
		)

		expect(result).toHaveLength(1)
	})
})

function createMockRundown(): ExtendedIngestRundown {
	return {
		externalId: 'abc',
		name: 'Mock RO',
		type: 'mock',
		payload: {},
		segments: [],
		coreData: undefined
	}
}

function createMockContext(rundownName: string): ShowStyleUserContext {
	const mockContext = new ShowStyleUserContext(
		rundownName,
		mappingsDefaults,
		parseStudioConfig,
		parseShowStyleConfig,
		RUNDOWN_ID,
		SEGMENT_ID,
		PART_ID
	)
	mockContext.studioConfig = configSpec.studioConfig as any
	mockContext.showStyleConfig = configSpec.showStyleConfig as any

	return mockContext
}
