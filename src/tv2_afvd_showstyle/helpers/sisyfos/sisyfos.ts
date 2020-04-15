import {
	DeviceType,
	Timeline,
	TimelineContentTypeSisyfos,
	TimelineObjSisyfosMessage,
	TSRTimelineObj
} from 'timeline-state-resolver-types'
import { NotesContext, SourceLayerType } from 'tv-automation-sofie-blueprints-integration'
import { FindSourceInfoStrict, literal, PieceMetaData, SourceInfo } from 'tv2-common'
import _ = require('underscore')
import { BlueprintConfig } from '../../../tv2_afvd_studio/helpers/config'
import { SisyfosLLAyer } from '../../../tv2_afvd_studio/layers'

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

export function GetSisyfosTimelineObjForCamera(
	context: NotesContext,
	sources: SourceInfo[],
	sourceType: string,
	enable?: Timeline.TimelineEnable
): TSRTimelineObj[] {
	if (!enable) {
		enable = { start: 0 }
	}

	const audioTimeline: TSRTimelineObj[] = []
	const useMic = !sourceType.match(/^(?:KAM|CAM)(?:ERA)? (.+) minus mic(.*)$/i)
	const camName = sourceType.match(/^(?:KAM|CAM)(?:ERA)? (.+)$/i)
	if ((useMic && camName) || !!sourceType.match(/server|telefon|full|evs/i)) {
		const camLayers: string[] = [...STUDIO_MICS]
		if (useMic && camName) {
			const sourceInfo = FindSourceInfoStrict(context, sources, SourceLayerType.CAMERA, sourceType)
			if (sourceInfo && sourceInfo.sisyfosLayers) {
				camLayers.push(...sourceInfo.sisyfosLayers)
			}
		}
		audioTimeline.push(
			...camLayers.map<TimelineObjSisyfosMessage>(layer => {
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

export function GetLayersForCamera(context: NotesContext, sources: SourceInfo[], sourceType: string) {
	const camName = sourceType.match(/^(?:KAM|CAM)(?:ERA)? (.+)$/i)
	const eksternLayers: string[] = []
	if (camName) {
		const sourceInfo = FindSourceInfoStrict(context, sources, SourceLayerType.CAMERA, sourceType)
		if (sourceInfo && sourceInfo.sisyfosLayers) {
			eksternLayers.push(...sourceInfo.sisyfosLayers)
		}
	}
	return eksternLayers
}

export function GetStickyForPiece(
	config: BlueprintConfig,
	layers: Array<{ layer: string; isPgm: 0 | 1 | 2 }>
): PieceMetaData | undefined {
	return literal<PieceMetaData>({
		stickySisyfosLevels: _.object(
			layers
				.filter(layer => config.stickyLayers.indexOf(layer.layer) !== -1)
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

export function getStickyLayers(liveAudio: string[]) {
	return [...liveAudio, ...STUDIO_MICS]
}
