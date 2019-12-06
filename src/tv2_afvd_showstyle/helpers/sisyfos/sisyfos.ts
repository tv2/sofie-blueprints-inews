import {
	DeviceType,
	Timeline,
	TimelineContentTypeSisyfos,
	TimelineObjSisyfosMessage,
	TSRTimelineObj
} from 'timeline-state-resolver-types'
import { literal } from '../../../common/util'
import { SisyfosLLAyer } from '../../../tv2_afvd_studio/layers'

export const STUDIO_MICS = [
	SisyfosLLAyer.SisyfosSourceHost_1_ST_A,
	SisyfosLLAyer.SisyfosSourceHost_2_ST_A,
	SisyfosLLAyer.SisyfosSourceGuest_1_ST_A,
	SisyfosLLAyer.SisyfosSourceGuest_2_ST_A,
	SisyfosLLAyer.SisyfosSourceGuest_3_ST_A,
	SisyfosLLAyer.SisyfosSourceGuest_4_ST_A
]

export function GetSisyfosTimelineObjForCamera(sourceType: string, enable?: Timeline.TimelineEnable): TSRTimelineObj[] {
	if (!enable) {
		enable = { start: 0 }
	}

	const audioTimeline: TSRTimelineObj[] = []
	const useMic = !sourceType.match(/^(?:KAM|CAM)(?:ERA)? (.+) minus mic(.*)$/i)
	const camName = sourceType.match(/^(?:KAM|CAM)(?:ERA)? (.+)$/i)
	if ((useMic && camName) || !!sourceType.match(/server|telefon|full/i)) {
		audioTimeline.push(
			...STUDIO_MICS.map<TimelineObjSisyfosMessage>(layer => {
				return literal<TimelineObjSisyfosMessage>({
					id: '',
					enable: enable ? enable : { start: 0 },
					priority: 1,
					layer,
					content: {
						deviceType: DeviceType.SISYFOS,
						type: TimelineContentTypeSisyfos.SISYFOS,
						isPgm: 1
					}
				})
			})
		)
	}
	return audioTimeline
}

export function GetSisyfosTimelineObjForEkstern(
	sourceType: string,
	enable?: Timeline.TimelineEnable
): TSRTimelineObj[] {
	if (!enable) {
		enable = { start: 0 }
	}

	let audioTimeline: TSRTimelineObj[] = []
	let layer = SisyfosLLAyer.SisyfosSourceLive_1

	const eksternProps = sourceType.match(/^(?:LIVE|SKYPE) ([^\s]+)(?: (.+))?$/i)
	if (eksternProps) {
		const source = eksternProps[1]

		if (source) {
			switch (source) {
				case '1':
					layer = SisyfosLLAyer.SisyfosSourceLive_1
					break
				case '2':
					layer = SisyfosLLAyer.SisyfosSourceLive_2
					break
				case '3':
					layer = SisyfosLLAyer.SisyfosSourceLive_3
					break
				case '4':
					layer = SisyfosLLAyer.SisyfosSourceLive_4
					break
				case '5':
					layer = SisyfosLLAyer.SisyfosSourceLive_5
					break
				case '6':
					layer = SisyfosLLAyer.SisyfosSourceLive_6
					break
				case '7':
					layer = SisyfosLLAyer.SisyfosSourceLive_7
					break
				case '8':
					layer = SisyfosLLAyer.SisyfosSourceLive_8
					break
				case '9':
					layer = SisyfosLLAyer.SisyfosSourceLive_9
					break
				case '10':
					layer = SisyfosLLAyer.SisyfosSourceLive_10
					break
			}
			audioTimeline = [
				literal<TimelineObjSisyfosMessage>({
					id: '',
					enable,
					priority: 1,
					layer,
					content: {
						deviceType: DeviceType.SISYFOS,
						type: TimelineContentTypeSisyfos.SISYFOS,
						isPgm: 1
					}
				})
			]
		}
	}
	return audioTimeline
}
