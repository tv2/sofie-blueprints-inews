import { IngestSegment } from '@sofie-automation/blueprints-integration'
import { literal } from 'tv2-common'
import { getRundownDuration } from '../rundownDuration'

function makeSegmentWithoutTime(externalId: string, rank: number): IngestSegment {
	return literal<IngestSegment>({
		externalId,
		name: externalId,
		rank,
		parts: []
	})
}

function makeSegmentWithTime(externalId: string, time: number, rank: number, floated?: boolean): IngestSegment {
	const segment = makeSegmentWithoutTime(externalId, rank)
	segment.payload = {
		iNewsStory: {
			fields: {
				totalTime: time
			},
			meta: {
				float: floated ? 'float' : undefined
			}
		}
	}
	return segment
}

describe('Rundown Duration', () => {
	it('Adds all times in rundown', () => {
		const segments = [
			makeSegmentWithTime('test-segment_1', 1, 0),
			makeSegmentWithTime('test-segment_2', 1, 1),
			makeSegmentWithTime('test-segment_3', 2, 2),
			makeSegmentWithTime('test-segment_4', 3, 3)
		]

		const result = getRundownDuration(segments)
		expect(result).toEqual(7000)
	})

	it('Excludes segments after continuity', () => {
		const segments = [
			makeSegmentWithTime('test-segment_1', 1, 0),
			makeSegmentWithTime('test-segment_2', 1, 1),
			makeSegmentWithTime('test-segment_3', 2, 2),
			makeSegmentWithTime('continuity', 2, 3),
			makeSegmentWithTime('test-segment_4', 3, 4)
		]

		const result = getRundownDuration(segments)
		expect(result).toEqual(6000)
	})

	it('Uses the first continuity segment in the rundown as the cutoff', () => {
		const segments = [
			makeSegmentWithTime('test-segment_1', 1, 0),
			makeSegmentWithTime('test-segment_2', 1, 1),
			makeSegmentWithTime('continuity', 2, 2),
			makeSegmentWithTime('test-segment_3', 2, 3),
			makeSegmentWithTime('continuity', 2, 4),
			makeSegmentWithTime('test-segment_4', 3, 5)
		]

		const result = getRundownDuration(segments)
		expect(result).toEqual(4000)
	})

	it('Does not include floated segments in timing', () => {
		const segments = [
			makeSegmentWithTime('test-segment_1', 1, 0, true),
			makeSegmentWithTime('test-segment_2', 1, 1, true),
			makeSegmentWithTime('continuity', 2, 2),
			makeSegmentWithTime('test-segment_3', 2, 3),
			makeSegmentWithTime('continuity', 2, 4),
			makeSegmentWithTime('test-segment_4', 3, 5, true)
		]

		const result = getRundownDuration(segments)
		expect(result).toEqual(2000)
	})

	it('Ignores floated continuity segment', () => {
		const segments = [
			makeSegmentWithTime('test-segment_1', 1, 0),
			makeSegmentWithTime('test-segment_2', 1, 1),
			makeSegmentWithTime('continuity', 2, 2, true),
			makeSegmentWithTime('test-segment_3', 2, 3),
			makeSegmentWithTime('continuity', 2, 4),
			makeSegmentWithTime('test-segment_4', 3, 5)
		]

		const result = getRundownDuration(segments)
		expect(result).toEqual(6000)
	})

	it('Handles segments without payload', () => {
		// Shouldn't be possible, but we should test that we can accept missing payload data
		const segments = [
			makeSegmentWithTime('test-segment_1', 1, 0),
			makeSegmentWithTime('test-segment_2', 1, 1),
			makeSegmentWithoutTime('test-segment_3', 2),
			makeSegmentWithTime('test-segment_4', 3, 3)
		]

		const result = getRundownDuration(segments)
		expect(result).toEqual(5000)
	})

	it('Handles segments arriving out of order', () => {
		// Tests whether it sorts segments by rank
		const segments = [
			makeSegmentWithTime('continuity', 2, 3),
			makeSegmentWithTime('test-segment_4', 3, 4),
			makeSegmentWithTime('test-segment_1', 1, 0),
			makeSegmentWithTime('test-segment_2', 1, 1),
			makeSegmentWithTime('test-segment_3', 2, 2)
		]

		const result = getRundownDuration(segments)
		expect(result).toEqual(6000)
	})
})
