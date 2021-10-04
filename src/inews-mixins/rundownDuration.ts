import { IngestSegment } from '@sofie-automation/blueprints-integration'
import { INewsPayload } from 'tv2-common'

export function getRundownDuration(segments: IngestSegment[]) {
	let totalTime = 0
	for (const segment of segments.sort((a, b) => a.rank - b.rank)) {
		const payload = segment.payload as INewsPayload | undefined
		if (payload?.iNewsStory?.meta?.float === 'float') {
			continue
		}

		const time = payload?.iNewsStory?.fields.totalTime ?? 0
		totalTime += Number(time)

		if (segment.name.match(/continuity/i)) {
			break
		}
	}

	return totalTime * 1000
}
