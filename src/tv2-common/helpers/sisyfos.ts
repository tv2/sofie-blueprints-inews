import { Timeline, TSR } from 'blueprints-integration'
import { SourceInfo, TimelineBlueprintExt } from 'tv2-common'
import { SharedSisyfosLLayer } from 'tv2-constants'
import { TV2ShowStyleConfig } from '../blueprintConfig'
import { literal } from '../util'

export function GetSisyfosTimelineObjForCamera(
	config: TV2ShowStyleConfig,
	sourceInfo: SourceInfo,
	minusMic: boolean,
	enable?: Timeline.TimelineEnable
) {
	return GetSisyfosTimelineObjForSource(config, sourceInfo, false, minusMic, enable)
}

export function GetSisyfosTimelineObjForRemote(
	config: TV2ShowStyleConfig,
	sourceInfo: SourceInfo,
	enable?: Timeline.TimelineEnable
) {
	return GetSisyfosTimelineObjForSource(config, sourceInfo, false, false, enable)
}

export function GetSisyfosTimelineObjForReplay(config: TV2ShowStyleConfig, sourceInfo: SourceInfo, vo: boolean) {
	return GetSisyfosTimelineObjForSource(config, sourceInfo, vo, true)
}

export function GetSisyfosTimelineObjForServer(
	config: TV2ShowStyleConfig,
	vo: boolean,
	clipPendingLayer: string,
	mediaPlayerSession: string,
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
		result.push(getStudioMicsTimelineObj(config, timelineEnable))
	}
	return result
}

export function GetSisyfosTimelineObjForFull(
	config: TV2ShowStyleConfig,
	enable?: Timeline.TimelineEnable
): TSR.TimelineObjSisyfosAny[] {
	const result: TSR.TimelineObjSisyfosAny[] = []
	const timelineEnable = getFallbackEnable(enable)
	result.push(getStudioMicsTimelineObj(config, timelineEnable))
	return result
}

export function GetSisyfosTimelineObjForTelefon(
	config: TV2ShowStyleConfig,
	telefonLayer: string,
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
	result.push(getStudioMicsTimelineObj(config, timelineEnable))
	return result
}

function GetSisyfosTimelineObjForSource(
	config: TV2ShowStyleConfig,
	sourceInfo: SourceInfo,
	vo: boolean,
	enableStudioMicsOnlyForVo: boolean,
	enable?: Timeline.TimelineEnable
): TSR.TimelineObjSisyfosAny[] {
	const result: TSR.TimelineObjSisyfosAny[] = []
	const timelineEnable = getFallbackEnable(enable)
	sourceInfo.sisyfosLayers?.forEach((layer) => {
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
	if (vo || (sourceInfo.useStudioMics && !enableStudioMicsOnlyForVo)) {
		result.push(getStudioMicsTimelineObj(config, timelineEnable))
	}
	return result
}

function getStudioMicsTimelineObj(
	config: TV2ShowStyleConfig,
	timelineEnable: Timeline.TimelineEnable
): TSR.TimelineObjSisyfosChannels {
	const studioMicsChannels: TSR.TimelineObjSisyfosChannels['content']['channels'] = []
	config.studio.StudioMics.forEach((layer) => {
		studioMicsChannels.push({
			mappedLayer: layer,
			isPgm: 1
		})
	})
	return {
		id: '',
		enable: timelineEnable,
		priority: studioMicsChannels.length ? 2 : 0,
		layer: SharedSisyfosLLayer.SisyfosGroupStudioMics,
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
