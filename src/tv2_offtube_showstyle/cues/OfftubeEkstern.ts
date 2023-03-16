import { IBlueprintPart } from 'blueprints-integration'
import {
	CueDefinitionEkstern,
	EvaluateCueResult,
	EvaluateEksternBase,
	PartDefinition,
	SegmentContext
} from 'tv2-common'
import { OfftubeBlueprintConfig } from '../helpers/config'
import { OfftubeSourceLayer } from '../layers'

export function OfftubeEvaluateEkstern(
	context: SegmentContext<OfftubeBlueprintConfig>,
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
				PgmLive: OfftubeSourceLayer.PgmLive
			}
		},
		adlib,
		rank
	)
}
