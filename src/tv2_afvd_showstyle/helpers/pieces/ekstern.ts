import { IBlueprintPart } from 'blueprints-integration'
import {
	CueDefinitionEkstern,
	EvaluateCueResult,
	EvaluateEksternBase,
	PartDefinition,
	ShowStyleContext,
	TV2ShowStyleConfig
} from 'tv2-common'
import { SourceLayer } from '../../layers'

export function EvaluateEkstern(
	context: ShowStyleContext<TV2ShowStyleConfig>,
	part: IBlueprintPart,
	partId: string,
	parsedCue: CueDefinitionEkstern,
	partDefinition: PartDefinition,
	adlib?: boolean,
	rank?: number
): EvaluateCueResult {
	return EvaluateEksternBase(
		context,
		part,
		partId,
		parsedCue,
		partDefinition,
		{
			SourceLayer: {
				PgmLive: SourceLayer.PgmLive
			}
		},
		adlib,
		rank
	)
}
