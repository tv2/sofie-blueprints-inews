// @ts-ignore
global.VERSION = 'test'
// @ts-ignore
global.VERSION_TSR = 'test'
// @ts-ignore
global.VERSION_INTEGRATION = 'test'

import {
	BlueprintMappings,
	ConfigItemValue,
	IBlueprintRundownDB,
	IngestRundown,
	IngestSegment,
	ShowStyleBlueprintManifest
} from 'tv-automation-sofie-blueprints-integration'
import { literal } from 'tv2-common'
import { SegmentContext, ShowStyleContext } from '../../__mocks__/context'
import { defaultShowStyleConfig, defaultStudioConfig } from '../../tv2_afvd_showstyle/__tests__/configs'
import BlueprintsAFVD from '../../tv2_afvd_showstyle/index'
import mappingsDefaults from '../../tv2_afvd_studio/migrations/mappings-defaults'

export interface ConfigMap {
	[key: string]: ConfigItemValue | ConfigMap | any[]
}

interface TestBlueprint {
	studioConfig: ConfigMap
	showStyleConfig: ConfigMap
	mappingsDefaults: BlueprintMappings
	blueprint: ShowStyleBlueprintManifest
}

const testBlueprints: TestBlueprint[] = [
	{
		studioConfig: defaultStudioConfig,
		showStyleConfig: defaultShowStyleConfig,
		mappingsDefaults,
		blueprint: BlueprintsAFVD
	}
]

function getTimingsForSegments(
	blueprint: TestBlueprint,
	segments: IngestSegment[]
): {
	[segmentId: string]: {
		[partId: string]: number
	}
} {
	const ingestRundown: IngestRundown = {
		externalId: '00000000:00000000:00000001',
		name: 'Rundown Timing Test',
		type: 'inews',
		segments
	}

	const timings: { [segmentId: string]: { [partId: string]: number } } = {}
	const showStyleContext = new ShowStyleContext('mockRo', mappingsDefaults)
	showStyleContext.studioConfig = blueprint.studioConfig as any
	showStyleContext.showStyleConfig = blueprint.showStyleConfig as any
	const blueprintRundown = blueprint.blueprint.getRundown(showStyleContext, { ...ingestRundown, coreData: undefined })
	const rundown = literal<IBlueprintRundownDB>({
		...blueprintRundown.rundown,
		_id: 'mockRo',
		showStyleVariantId: 'mock'
	})

	const mockContext = new SegmentContext(rundown, mappingsDefaults)
	mockContext.studioConfig = blueprint.studioConfig as any
	mockContext.showStyleConfig = blueprint.showStyleConfig as any

	ingestRundown.segments.forEach(segment => {
		const res = blueprint.blueprint.getSegment(mockContext, segment)
		timings[segment.externalId] = {}
		res.parts.forEach(part => {
			timings[segment.externalId][part.part.externalId] = part.part.expectedDuration || 0
		})
	})

	return timings
}

function runTestForAllBlueprints(name: string, testFn: (blueprint: TestBlueprint) => void) {
	test.each(testBlueprints)(name, testFn)
}

describe('Part Timing', () => {
	runTestForAllBlueprints('Splits timing between parts according to amount of script', (blueprint: TestBlueprint) => {
		const segments: IngestSegment[] = [
			literal<IngestSegment>({
				externalId: '00000000:00000000:10000001',
				name: 'Two_Cam_Equal_Script_Length',
				rank: 10,
				payload: {
					rundownId: 'NYHEDERNE-TEST.SOFIE.ON-AIR',
					iNewsStory: {
						fields: {
							pageNumber: '17',
							title: 'Two_Cam_Equal_Script_Length',
							tapeTime: '0',
							audioTime: '10',
							totalTime: '10'
						},
						meta: {},
						cues: [],
						id: '00000000:00000000:10000001',
						body: '\r\n<p><pi>Kam 1</pi></p>\r\n<p>11111</p>\r\n<p><pi>Kam 1</pi></p>\r\n<p>11111</p>\r\n',
						fileId: '1DD244CB:0093A9A8:5E1DB5C9'
					},
					externalId: '00000000:00000000:10000001',
					rank: 10,
					name: 'Two_Cam_Equal_Script_Length',
					float: false
				},
				parts: []
			})
		]

		const timings = getTimingsForSegments(blueprint, segments)
		expect(timings['00000000:00000000:10000001']).toEqual({
			'00000000:00000000:10000001-Kam-Kam-1-1-0': 5000,
			'00000000:00000000:10000001-Kam-Kam-1-1-0-2': 5000
		})
	})
})
