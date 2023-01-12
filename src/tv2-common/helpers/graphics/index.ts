export * from './pilot'
export * from './pilot/create'
export * from './caspar'
export * from './viz'
export * from './name'
export * from './timing'
export * from './target'
export * from './layers'
export * from './internal'
export * from './design'
import { IBlueprintPart, TSR } from 'blueprints-integration'
import { getHtmlGraphicBaseline, TV2BlueprintConfig } from 'tv2-common'

export function ApplyFullGraphicPropertiesToPart(config: TV2BlueprintConfig, part: IBlueprintPart) {
	const keepAliveDuration =
		config.studio.GraphicsType === 'HTML'
			? config.studio.HTMLGraphics.KeepAliveDuration
			: config.studio.VizPilotGraphics.KeepAliveDuration
	if (part.inTransition === undefined) {
		part.inTransition = {
			partContentDelayDuration: 0,
			blockTakeDuration: 0,
			previousPartKeepaliveDuration: keepAliveDuration
		}
	} else {
		part.inTransition.previousPartKeepaliveDuration = keepAliveDuration
	}
}

export function CreateGraphicBaseline(config: TV2BlueprintConfig): Array<TSR.TSRTimelineObj<TSR.TSRTimelineContent>> {
	if (config.studio.GraphicsType === 'VIZ') {
		return []
	} else {
		return getHtmlGraphicBaseline(config)
	}
}
