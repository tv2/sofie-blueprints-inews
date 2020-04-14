import {
	DeviceType,
	Timeline,
	TimelineContentTypeSisyfos,
	TimelineObjSisyfosMessage,
	TSRTimelineObj
} from 'timeline-state-resolver-types'
import { literal } from 'tv2-common'
import { OfftubeSisyfosLLayer } from '../../tv2_offtube_studio/layers'

export const STUDIO_MICS = [
	OfftubeSisyfosLLayer.SisyfosSourceHost_1_ST_A,
	OfftubeSisyfosLLayer.SisyfosSourceHost_2_ST_A,
	OfftubeSisyfosLLayer.SisyfosSourceHost_3_ST_A
]

export const LIVE_AUDIO = [] // TODO

export const STICKY_LAYERS = [] // TODO

export function GetSisyfosTimelineObjForCamera(sourceType: string, enable?: Timeline.TimelineEnable): TSRTimelineObj[] {
	if (!enable) {
		enable = { start: 0 }
	}

	const audioTimeline: TSRTimelineObj[] = []
	const useMic = !sourceType.match(/^(?:KAM|CAM)(?:ERA)? (.+) minus mic(.*)$/i)
	const camName = sourceType.match(/^(?:KAM|CAM)(?:ERA)? (.+)$/i)
	if ((useMic && camName) || !!sourceType.match(/server|telefon|full|evs/i)) {
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

export function GetLayerForEkstern(sourceType: string): string[] | undefined {
	const eksternProps = sourceType.match(/^(?:LIVE|SKYPE) ([^\s]+)(?: (.+))?$/i)
	if (eksternProps) {
		const source = eksternProps[1]

		if (source) {
			switch (source) {
				case '1':
					return [OfftubeSisyfosLLayer.SisyfosSourceLive_1]
				case '2':
					return [OfftubeSisyfosLLayer.SisyfosSourceLive_2]
				case '3':
					return [
						OfftubeSisyfosLLayer.SisyfosSourceWorldFeed_Stereo,
						OfftubeSisyfosLLayer.SisyfosSourceWorldFeed_Surround
					]
			}
		}
	}
	return
}
