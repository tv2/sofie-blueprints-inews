import { IBlueprintPart, TSR } from 'blueprints-integration'
import { getHtmlGraphicBaseline, getVizBaselineDesignTimelineObject, TV2ShowStyleConfig } from 'tv2-common'

export const NON_BASELINE_DESIGN_ID = 'NON_BASELINE_DESIGN_ID'

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

export function getGraphicBaseline(config: TV2ShowStyleConfig): TSR.TSRTimelineObj[] {
	if (config.studio.GraphicsType === 'VIZ') {
		return [getVizBaselineDesignTimelineObject(config)]
	} else {
		return getHtmlGraphicBaseline(config)
	}
}
