import {
	DeviceType,
	Timeline,
	TimelineContentTypeSisyfos,
	TimelineObjSisyfosMessage,
	TSRTimelineObj
} from 'timeline-state-resolver-types'
import { NotesContext } from 'tv-automation-sofie-blueprints-integration'
import { literal } from 'tv2-common'
import _ = require('underscore')
import { SisyfosLLAyer } from '../../../tv2_afvd_studio/layers'
import { PieceMetaData } from '../../../tv2_afvd_studio/onTimelineGenerate'

export const STUDIO_MICS = [
	SisyfosLLAyer.SisyfosSourceHost_1_ST_A,
	SisyfosLLAyer.SisyfosSourceHost_2_ST_A,
	SisyfosLLAyer.SisyfosSourceGuest_1_ST_A,
	SisyfosLLAyer.SisyfosSourceGuest_2_ST_A,
	SisyfosLLAyer.SisyfosSourceGuest_3_ST_A,
	SisyfosLLAyer.SisyfosSourceGuest_4_ST_A
]

export const LIVE_AUDIO = [
	SisyfosLLAyer.SisyfosSourceLive_1,
	SisyfosLLAyer.SisyfosSourceLive_2,
	SisyfosLLAyer.SisyfosSourceLive_3,
	SisyfosLLAyer.SisyfosSourceLive_4,
	SisyfosLLAyer.SisyfosSourceLive_5,
	SisyfosLLAyer.SisyfosSourceLive_6,
	SisyfosLLAyer.SisyfosSourceLive_7,
	SisyfosLLAyer.SisyfosSourceLive_8,
	SisyfosLLAyer.SisyfosSourceLive_9,
	SisyfosLLAyer.SisyfosSourceLive_10
]

export const STICKY_LAYERS = [...STUDIO_MICS, ...LIVE_AUDIO]

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

export function GetSisyfosTimelineObjForEkstern(
	context: NotesContext,
	sourceType: string,
	enable?: Timeline.TimelineEnable
): TSRTimelineObj[] {
	if (!enable) {
		enable = { start: 0 }
	}

	let audioTimeline: TSRTimelineObj[] = []
	const layer = GetLayerForEkstern(sourceType)

	if (!layer) {
		context.warning(`Could not set audio levels for ${sourceType}`)
		return audioTimeline
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
	return audioTimeline
}

export function GetLayerForEkstern(sourceType: string) {
	const eksternProps = sourceType.match(/^(?:LIVE|SKYPE) ([^\s]+)(?: (.+))?$/i)
	if (eksternProps) {
		const source = eksternProps[1]

		if (source) {
			switch (source) {
				case '1':
					return SisyfosLLAyer.SisyfosSourceLive_1
				case '2':
					return SisyfosLLAyer.SisyfosSourceLive_2
				case '3':
					return SisyfosLLAyer.SisyfosSourceLive_3
				case '4':
					return SisyfosLLAyer.SisyfosSourceLive_4
				case '5':
					return SisyfosLLAyer.SisyfosSourceLive_5
				case '6':
					return SisyfosLLAyer.SisyfosSourceLive_6
				case '7':
					return SisyfosLLAyer.SisyfosSourceLive_7
				case '8':
					return SisyfosLLAyer.SisyfosSourceLive_8
				case '9':
					return SisyfosLLAyer.SisyfosSourceLive_9
				case '10':
					return SisyfosLLAyer.SisyfosSourceLive_10
			}
		}
	}
	return
}

export function GetStickyForPiece(
	layers: Array<{ layer: SisyfosLLAyer; isPgm: 0 | 1 | 2 }>
): PieceMetaData | undefined {
	return literal<PieceMetaData>({
		stickySisyfosLevels: _.object(
			layers
				.filter(layer => STICKY_LAYERS.indexOf(layer.layer) !== -1)
				.map<[string, { value: number; followsPrevious: boolean }]>(layer => {
					return [
						layer.layer,
						{
							value: layer.isPgm,
							followsPrevious: false
						}
					]
				})
		)
	})
}
