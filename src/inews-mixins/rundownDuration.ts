import { IngestSegment } from '@tv2media/blueprints-integration'
import { INewsPayload, TimeFromINewsField } from 'tv2-common'

export function getRundownDuration(segments: IngestSegment[]) {
	let totalTime = 0
	for (const segment of segments.sort((a, b) => a.rank - b.rank)) {
		const payload = segment.payload as INewsPayload | undefined
		if (payload?.iNewsStory?.meta?.float === 'float' || payload?.untimed) {
			continue
		}

		totalTime += TimeFromINewsField(payload?.iNewsStory?.fields.totalTime)
	}

	return totalTime * 1000
}
