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
import { BlueprintConfig, StudioConfig } from '../../../tv2_afvd_studio/helpers/config'

export function GetSisyfosTimelineObjForCamera(
	context: NotesContext,
	config: { sources: SourceInfo[]; studio: { StudioMics: string[] } },
	sourceType: string,
	enable?: Timeline.TimelineEnable
): TSRTimelineObj[] {
	if (!enable) {
		enable = { start: 0 }
	}

	const audioTimeline: TSRTimelineObj[] = []
	const useMic = !sourceType.match(/^(?:KAM|CAM)(?:ERA)? (.+) minus mic(.*)$/i)
	const camName = sourceType.match(/^(?:KAM|CAM)(?:ERA)? (.+)$/i)
	const nonCam = !!sourceType.match(/server|telefon|full|evs/i)
	if ((useMic && camName) || nonCam) {
		const camLayers: string[] = []
		if (useMic && camName) {
			const sourceInfo = FindSourceInfoStrict(context, config.sources, SourceLayerType.CAMERA, sourceType)
			if (sourceInfo) {
				if (sourceInfo.sisyfosLayers) {
					camLayers.push(...sourceInfo.sisyfosLayers)
				}
				if (sourceInfo.useStudioMics) {
					camLayers.push(...config.studio.StudioMics)
				}
			}
		} else if (nonCam) {
			camLayers.push(...config.studio.StudioMics)
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

export function getStickyLayers(studioConfig: StudioConfig) {
	return [...studioConfig.StudioMics, ...getLiveAudioLayers(studioConfig)]
}

export function getLiveAudioLayers(studioConfig: StudioConfig): string[] {
	const res: Set<string> = new Set()

	_.each([studioConfig.SourcesRM, studioConfig.SourcesSkype], sources => {
		_.each(sources, src => {
			if (src.SisyfosLayers) {
				_.each(src.SisyfosLayers, layer => {
					res.add(layer)
				})
			}
		})
	})

	return Array.from(res)
}

export function GetLayersForEkstern(context: NotesContext, sources: SourceInfo[], sourceType: string) {
	const eksternProps = sourceType.match(/^(?:LIVE|SKYPE) ([^\s]+)(?: (.+))?$/i)
	const eksternLayers: string[] = []
	if (eksternProps) {
		const sourceInfo = FindSourceInfoStrict(context, sources, SourceLayerType.REMOTE, sourceType)
		if (sourceInfo && sourceInfo.sisyfosLayers) {
			eksternLayers.push(...sourceInfo.sisyfosLayers)
		}
	}
	return eksternLayers
}
