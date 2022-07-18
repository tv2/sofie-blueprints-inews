import { Timeline, TSR } from '@tv2media/blueprints-integration'
import { SourceInfo, TimelineBlueprintExt } from 'tv2-common'
import { TV2BlueprintConfig } from '../blueprintConfig'
import { literal } from '../util'

export function GetSisyfosTimelineObjForCamera(
	config: TV2BlueprintConfig,
	sourceInfo: SourceInfo,
	minusMic: boolean,
	studioMicsLayer: string,
	enable?: Timeline.TimelineEnable
) {
	return GetSisyfosTimelineObjForSource(config, sourceInfo, false, minusMic, studioMicsLayer, enable)
}

export function GetSisyfosTimelineObjForRemote(
	config: TV2BlueprintConfig,
	sourceInfo: SourceInfo,
	studioMicsLayer: string,
	enable?: Timeline.TimelineEnable
) {
	return GetSisyfosTimelineObjForSource(config, sourceInfo, false, false, studioMicsLayer, enable)
}

export function GetSisyfosTimelineObjForReplay(
	config: TV2BlueprintConfig,
	sourceInfo: SourceInfo,
	vo: boolean,
	studioMicsLayer: string
) {
	return GetSisyfosTimelineObjForSource(config, sourceInfo, vo, true, studioMicsLayer)
}

export function GetSisyfosTimelineObjForServer(
	config: TV2BlueprintConfig,
	vo: boolean,
	clipPendingLayer: string,
	mediaPlayerSession: string,
	studioMicsLayer: string,
	enable?: Timeline.TimelineEnable
): TSR.TimelineObjSisyfosAny[] {
	const timelineEnable = getFallbackEnable(enable)
	const result: TSR.TimelineObjSisyfosAny[] = [
		literal<TSR.TimelineObjSisyfosChannel & TimelineBlueprintExt>({
			id: '',
			enable: timelineEnable,
			priority: 1,
			layer: clipPendingLayer,
			content: {
				deviceType: TSR.DeviceType.SISYFOS,
				type: TSR.TimelineContentTypeSisyfos.CHANNEL,
				isPgm: vo ? 2 : 1
			},
			metaData: {
				mediaPlayerSession
			},
			classes: []
		})
	]
	if (vo) {
		result.push(getStudioMicsTimelineObj(config, timelineEnable, studioMicsLayer))
	}
	return result
}

export function GetSisyfosTimelineObjForFull(
	config: TV2BlueprintConfig,
	studioMicsLayer: string,
	enable?: Timeline.TimelineEnable
): TSR.TimelineObjSisyfosAny[] {
	const result: TSR.TimelineObjSisyfosAny[] = []
	const timelineEnable = getFallbackEnable(enable)
	result.push(getStudioMicsTimelineObj(config, timelineEnable, studioMicsLayer))
	return result
}

export function GetSisyfosTimelineObjForTelefon(
	config: TV2BlueprintConfig,
	telefonLayer: string,
	studioMicsLayer: string,
	enable?: Timeline.TimelineEnable
): TSR.TimelineObjSisyfosAny[] {
	const timelineEnable = getFallbackEnable(enable)
	const result: TSR.TimelineObjSisyfosAny[] = [
		literal<TSR.TimelineObjSisyfosChannel>({
			id: '',
			enable: timelineEnable,
			priority: 1,
			layer: telefonLayer,
			content: {
				deviceType: TSR.DeviceType.SISYFOS,
				type: TSR.TimelineContentTypeSisyfos.CHANNEL,
				isPgm: 1
			}
		})
	]
	result.push(getStudioMicsTimelineObj(config, timelineEnable, studioMicsLayer))
	return result
}

function GetSisyfosTimelineObjForSource(
	config: TV2BlueprintConfig,
	sourceInfo: SourceInfo,
	vo: boolean,
	enableStudioMicsOnlyForVo: boolean,
	studioMicsLayer: string,
	enable?: Timeline.TimelineEnable
): TSR.TimelineObjSisyfosAny[] {
	const result: TSR.TimelineObjSisyfosAny[] = []
	const timelineEnable = getFallbackEnable(enable)
	sourceInfo.sisyfosLayers?.forEach(layer => {
		result.push(
			literal<TSR.TimelineObjSisyfosChannel>({
				id: '',
				enable: timelineEnable,
				priority: 1,
				layer,
				content: {
					deviceType: TSR.DeviceType.SISYFOS,
					type: TSR.TimelineContentTypeSisyfos.CHANNEL,
					isPgm: vo ? 2 : 1
				}
			})
		)
	})
	if (sourceInfo.useStudioMics && (!enableStudioMicsOnlyForVo || vo)) {
		result.push(getStudioMicsTimelineObj(config, timelineEnable, studioMicsLayer))
	}
	return result
}

function getStudioMicsTimelineObj(
	config: TV2BlueprintConfig,
	timelineEnable: Timeline.TimelineEnable,
	studioMicsLayer: string
): TSR.TimelineObjSisyfosChannels {
	const studioMicsChannels: TSR.TimelineObjSisyfosChannels['content']['channels'] = []
	config.studio.StudioMics.forEach(layer => {
		studioMicsChannels.push({
			mappedLayer: layer,
			isPgm: 1
		})
	})
	return {
		id: '',
		enable: timelineEnable,
		priority: studioMicsChannels.length ? 2 : 0,
		layer: studioMicsLayer,
		content: {
			deviceType: TSR.DeviceType.SISYFOS,
			type: TSR.TimelineContentTypeSisyfos.CHANNELS,
			channels: studioMicsChannels,
			overridePriority: 2
		}
	}
}

function getFallbackEnable(timelineEnable: Timeline.TimelineEnable | undefined): Timeline.TimelineEnable {
	return timelineEnable ?? { start: 0 }
}
