import { IBlueprintPart, TSR } from 'blueprints-integration'
import {
	getHtmlGraphicBaseline,
	getVizBaselineDesignTimelineObject,
	ShowStyleContext,
	TV2ShowStyleConfig
} from 'tv2-common'

export function applyFullGraphicPropertiesToPart(config: TV2ShowStyleConfig, part: IBlueprintPart) {
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

export function getGraphicBaseline(context: ShowStyleContext): TSR.TSRTimelineObj[] {
	if (context.config.studio.GraphicsType === 'VIZ') {
		return getVizBaselineDesignTimelineObject(context)
	} else {
		return getHtmlGraphicBaseline(context)
	}
}
