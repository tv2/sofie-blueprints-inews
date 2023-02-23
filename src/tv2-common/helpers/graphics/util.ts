import { IBlueprintPart, TSR } from 'blueprints-integration'
import { getHtmlGraphicBaseline, TV2ShowStyleConfig } from 'tv2-common'

export function ApplyFullGraphicPropertiesToPart(config: TV2ShowStyleConfig, part: IBlueprintPart) {
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

export function getGraphicBaseline(config: TV2ShowStyleConfig): TSR.TSRTimelineObj[] {
	if (config.studio.GraphicsType === 'VIZ') {
		return []
	} else {
		return getHtmlGraphicBaseline(config)
	}
}
