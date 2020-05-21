import { TSR } from 'tv-automation-sofie-blueprints-integration'
import { literal } from 'tv2-common'
import { OfftubeSisyfosLLayer } from '../../tv2_offtube_studio/layers'

export const STUDIO_MICS = [
	OfftubeSisyfosLLayer.SisyfosSourceHost_1_ST_A,
	OfftubeSisyfosLLayer.SisyfosSourceHost_2_ST_A,
	OfftubeSisyfosLLayer.SisyfosSourceHost_3_ST_A
]

export const LIVE_AUDIO = [] // TODO

export const STICKY_LAYERS = [] // TODO

export function GetSisyfosTimelineObjForCamera(
	sourceType: string,
	enable?: TSR.Timeline.TimelineEnable
): TSR.TSRTimelineObj[] {
	if (!enable) {
		enable = { start: 0 }
	}

	const audioTimeline: TSR.TSRTimelineObj[] = []
	const useMic = !sourceType.match(/^(?:KAM|CAM)(?:ERA)? (.+) minus mic(.*)$/i)
	const camName = sourceType.match(/^(?:KAM|CAM)(?:ERA)? (.+)$/i)
	if ((useMic && camName) || !!sourceType.match(/server|telefon|full|evs/i)) {
		audioTimeline.push(
			...STUDIO_MICS.map<TSR.TimelineObjSisyfosMessage>(layer => {
				return literal<TSR.TimelineObjSisyfosMessage>({
					id: '',
					enable: enable ? enable : { start: 0 },
					priority: 1,
					layer,
					content: {
						deviceType: TSR.DeviceType.SISYFOS,
						type: TSR.TimelineContentTypeSisyfos.SISYFOS,
						isPgm: 1
					}
				})
			})
		)
	}
	return audioTimeline
}

// export function GetLayersForEkstern(context: NotesContext, sources: SourceInfo[], sourceType: string) {
// 	const eksternProps = sourceType.match(/^(?:LIVE|SKYPE) ([^\s]+)(?: (.+))?$/i)
// 	let eksternLayers: string[] = []
// 	if (eksternProps) {
// 		const source = eksternProps[1]

// 		if (source) {
// 			switch (source) {
// 				case '1':
// 					eksternLayers = [OfftubeSisyfosLLayer.SisyfosSourceLive_1]
// 					break
// 				case '2':
// 					eksternLayers = [OfftubeSisyfosLLayer.SisyfosSourceLive_2]
// 					break
// 				case '3':
// 					eksternLayers = [
// 						OfftubeSisyfosLLayer.SisyfosSourceWorldFeed_Stereo,
// 						OfftubeSisyfosLLayer.SisyfosSourceWorldFeed_Surround
// 					]
// 					break
// 			}
// 		}
// 		const sourceInfo = FindSourceInfoStrict(context, sources, SourceLayerType.REMOTE, sourceType)
// 		if (sourceInfo && sourceInfo.sisyfosLayers) {
// 			eksternLayers.push(...sourceInfo.sisyfosLayers)
// 		}
// 	}
// 	return eksternLayers
// }
