import {
	DeviceType,
	Timeline,
	TimelineContentTypeSisyfos,
	TimelineObjSisyfosMessage,
	TSRTimelineObj
} from 'timeline-state-resolver-types'
import { NotesContext, SourceLayerType } from 'tv-automation-sofie-blueprints-integration'
import { FindSourceInfoStrict, literal, SourceInfo } from 'tv2-common'
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

export function GetLayersForEkstern(context: NotesContext, sources: SourceInfo[], sourceType: string) {
	const eksternProps = sourceType.match(/^(?:LIVE|SKYPE) ([^\s]+)(?: (.+))?$/i)
	let eksternLayers: string[] = []
	if (eksternProps) {
		const source = eksternProps[1]

		if (source) {
			switch (source) {
				case '1':
					eksternLayers = [OfftubeSisyfosLLayer.SisyfosSourceLive_1]
					break
				case '2':
					eksternLayers = [OfftubeSisyfosLLayer.SisyfosSourceLive_2]
					break
				case '3':
					eksternLayers = [
						OfftubeSisyfosLLayer.SisyfosSourceWorldFeed_Stereo,
						OfftubeSisyfosLLayer.SisyfosSourceWorldFeed_Surround
					]
					break
			}
		}
		const sourceInfo = FindSourceInfoStrict(context, sources, SourceLayerType.REMOTE, sourceType)
		if (sourceInfo && sourceInfo.sisyfosLayers) {
			eksternLayers.push(...sourceInfo.sisyfosLayers)
		}
	}
	return eksternLayers
}
