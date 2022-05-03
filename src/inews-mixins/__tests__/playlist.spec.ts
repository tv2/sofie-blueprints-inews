import {
	BlueprintResultRundown,
	ExtendedIngestRundown,
	IngestSegment,
	IShowStyleUserContext,
	PlaylistTimingType
} from '@tv2media/blueprints-integration'
import { getRundownWithBackTime } from 'inews-mixins'
import { ShowStyleUserContext } from '../../__mocks__/context'
import { parseConfig as parseShowStyleConfig } from '../../tv2_afvd_showstyle/helpers/config'
import { parseConfig as parseStudioConfig } from '../../tv2_afvd_studio/helpers/config'
import mappingsDefaults from '../../tv2_afvd_studio/migrations/mappings-defaults'
import { makeSegmentWithTime } from './rundownDuration.spec'

const RUNDOWN_ID = 'test_rundown'
const RUNDOWN_NAME = 'Rundown 1'
const SEGMENT_ID = 'test_segment'
const PART_ID = 'test_part'

function getMockContext(): IShowStyleUserContext {
	return new ShowStyleUserContext(
		RUNDOWN_NAME,
		mappingsDefaults,
		parseStudioConfig,
		parseShowStyleConfig,
		RUNDOWN_ID,
		SEGMENT_ID,
		PART_ID
	)
}

function getMockResult(): BlueprintResultRundown {
	return {
		rundown: {
			externalId: RUNDOWN_ID,
			name: RUNDOWN_NAME,
			timing: {
				type: PlaylistTimingType.None
			}
		},
		globalAdLibPieces: [],
		baseline: {
			timelineObjects: []
		},
		globalActions: []
	}
}

function getMockRundown(segments: IngestSegment[]): ExtendedIngestRundown {
	return {
		externalId: RUNDOWN_ID,
		name: RUNDOWN_NAME,
		type: 'mock',
		payload: {},
		segments,
		coreData: undefined
	}
}
describe('Rundown BackTime', () => {
	it('Discards back time if not on the first continuty', () => {
		const segments = [
			makeSegmentWithTime('test-segment_1', 1, 0, {}),
			makeSegmentWithTime('test-segment_2', 1, 1, { floated: true }),
			makeSegmentWithTime('test-segment_3', 1, 1, {}),
			makeSegmentWithTime('continuity', 2, 2, { untimed: true }),
			makeSegmentWithTime('test-segment_4', 2, 3, { untimed: true }),
			makeSegmentWithTime('continuity', 2, 4, { untimed: true, backTimeInHours: 2 }),
			makeSegmentWithTime('test-segment_5', 3, 5, { untimed: true })
		]

		const result = getRundownWithBackTime(getMockContext(), getMockRundown(segments), getMockResult())
		expect(result.rundown.timing.type).toEqual(PlaylistTimingType.None)
	})

	it('Takes back time if on the first continuty', () => {
		const segments = [
			makeSegmentWithTime('test-segment_1', 1, 0, { floated: true }),
			makeSegmentWithTime('test-segment_2', 1, 1, { floated: true }),
			makeSegmentWithTime('test-segment_3', 1, 1, {}),
			makeSegmentWithTime('continuity', 2, 2, { untimed: true, backTimeInHours: 2 }),
			makeSegmentWithTime('test-segment_4', 2, 3, { untimed: true }),
			makeSegmentWithTime('continuity', 2, 4, { untimed: true }),
			makeSegmentWithTime('test-segment_5', 3, 5, { untimed: true })
		]

		const result = getRundownWithBackTime(getMockContext(), getMockRundown(segments), getMockResult())
		expect(result.rundown.timing.type).toEqual(PlaylistTimingType.BackTime)
		// @todo test for correct endTime value after merging the midnight fix
	})
})
