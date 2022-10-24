import { IBlueprintPart, TSR } from 'blueprints-integration'
import { getHtmlGraphicBaseline, TV2BlueprintConfig } from 'tv2-common'

export * from './name'
export * from './timing'
export * from './target'
export * from './layers'
export * from './internal'
export * from './pilot'
export * from './caspar'
export * from './viz'
export * from './design'

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

export function CreateGraphicBaseline(config: TV2BlueprintConfig): TSR.TSRTimelineObj[] {
	if (config.studio.GraphicsType === 'VIZ') {
		return []
	} else {
		return getHtmlGraphicBaseline(config)
	}
}
