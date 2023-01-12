import { Timeline, TSR } from 'blueprints-integration'
import { SourceInfo, TimelineBlueprintExt } from 'tv2-common'
import { SharedSisyfosLLayer } from 'tv2-constants'
import { TV2BlueprintConfig } from '../blueprintConfig'
import { literal } from '../util'

export function GetSisyfosTimelineObjForCamera(
	config: TV2BlueprintConfig,
	sourceInfo: SourceInfo,
	minusMic: boolean,
	enable?: Timeline.TimelineEnable
) {
	return GetSisyfosTimelineObjForSource(config, sourceInfo, false, minusMic, enable)
}

export function GetSisyfosTimelineObjForRemote(
	config: TV2BlueprintConfig,
	sourceInfo: SourceInfo,
	enable?: Timeline.TimelineEnable
) {
	return GetSisyfosTimelineObjForSource(config, sourceInfo, false, false, enable)
}

export function GetSisyfosTimelineObjForReplay(config: TV2BlueprintConfig, sourceInfo: SourceInfo, vo: boolean) {
	return GetSisyfosTimelineObjForSource(config, sourceInfo, vo, true)
}

export function GetSisyfosTimelineObjForServer(
	config: TV2BlueprintConfig,
	vo: boolean,
	clipPendingLayer: string,
	mediaPlayerSession: string,
	enable?: Timeline.TimelineEnable
): Array<TSR.TSRTimelineObj<TSR.TimelineContentSisyfosAny>> {
	const timelineEnable = getFallbackEnable(enable)
	const result: Array<TSR.TSRTimelineObj<TSR.TimelineContentSisyfosAny>> = [
		literal<TSR.TSRTimelineObj<TSR.TimelineContentSisyfosChannel> & TimelineBlueprintExt>({
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
	config: TV2BlueprintConfig,
	enable?: Timeline.TimelineEnable
): Array<TSR.TSRTimelineObj<TSR.TimelineContentSisyfosAny>> {
	const result: Array<TSR.TSRTimelineObj<TSR.TimelineContentSisyfosAny>> = []
	const timelineEnable = getFallbackEnable(enable)
	result.push(getStudioMicsTimelineObj(config, timelineEnable))
	return result
}

export function GetSisyfosTimelineObjForTelefon(
	config: TV2BlueprintConfig,
	telefonLayer: string,
	enable?: Timeline.TimelineEnable
): Array<TSR.TSRTimelineObj<TSR.TimelineContentSisyfosAny>> {
	const timelineEnable = getFallbackEnable(enable)
	const result: Array<TSR.TSRTimelineObj<TSR.TimelineContentSisyfosAny>> = [
		literal<TSR.TSRTimelineObj<TSR.TimelineContentSisyfosChannel>>({
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
	config: TV2BlueprintConfig,
	sourceInfo: SourceInfo,
	vo: boolean,
	enableStudioMicsOnlyForVo: boolean,
	enable?: Timeline.TimelineEnable
): Array<TSR.TSRTimelineObj<TSR.TimelineContentSisyfosAny>> {
	const result: Array<TSR.TSRTimelineObj<TSR.TimelineContentSisyfosAny>> = []
	const timelineEnable = getFallbackEnable(enable)
	sourceInfo.sisyfosLayers?.forEach(layer => {
		result.push(
			literal<TSR.TSRTimelineObj<TSR.TimelineContentSisyfosChannel>>({
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
		result.push(getStudioMicsTimelineObj(config, timelineEnable))
	}
	return result
}

function getStudioMicsTimelineObj(
	config: TV2BlueprintConfig,
	timelineEnable: Timeline.TimelineEnable
): TSR.TSRTimelineObj<TSR.TimelineContentSisyfosChannels> {
	const studioMicsChannels: TSR.TimelineContentSisyfosChannels['channels'] = []
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
