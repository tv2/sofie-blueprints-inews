import {
	Adlib,
	CreateInternalGraphic,
	CreatePilotGraphic,
	CueDefinitionGraphic,
	EvaluateCueResult,
	GraphicInternalOrPilot,
	GraphicIsInternal,
	GraphicIsPilot,
	PartDefinition,
	ShowStyleContext
} from 'tv2-common'
import { OfftubeBlueprintConfig } from '../helpers/config'

export function OfftubeEvaluateGrafikCaspar(
	context: ShowStyleContext<OfftubeBlueprintConfig>,
	partId: string,
	parsedCue: CueDefinitionGraphic<GraphicInternalOrPilot>,
	partDefinition: PartDefinition,
	rank: number,
	adlib?: Adlib
): EvaluateCueResult {
	if (GraphicIsPilot(parsedCue)) {
		return CreatePilotGraphic({
			context,
			partId,
			parsedCue,
			adlib,
			rank,
			segmentExternalId: partDefinition.segmentExternalId
		})
	} else if (GraphicIsInternal(parsedCue)) {
		return CreateInternalGraphic(context, partId, parsedCue, partDefinition, adlib)
	}
	return new EvaluateCueResult()
}
