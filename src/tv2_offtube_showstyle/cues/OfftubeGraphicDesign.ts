import { CueDefinitionGraphicDesign, EvaluateDesignBase, SegmentContext } from 'tv2-common'
import { OfftubeBlueprintConfig } from '../helpers/config'

export function OfftubeEvaluateGraphicDesign(
	context: SegmentContext<OfftubeBlueprintConfig>,
	partId: string,
	parsedCue: CueDefinitionGraphicDesign,
	adlib?: boolean,
	rank?: number
) {
	return EvaluateDesignBase(context, partId, parsedCue, adlib, rank)
}
