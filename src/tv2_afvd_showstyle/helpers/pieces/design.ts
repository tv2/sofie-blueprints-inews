import { CueDefinitionGraphicDesign, EvaluateDesignBase, ShowStyleContext } from 'tv2-common'
import * as _ from 'underscore'

export function EvaluateCueDesign(
	context: ShowStyleContext,
	partId: string,
	parsedCue: CueDefinitionGraphicDesign,
	adlib?: boolean,
	rank?: number
) {
	return EvaluateDesignBase(context, partId, parsedCue, adlib, rank)
}
