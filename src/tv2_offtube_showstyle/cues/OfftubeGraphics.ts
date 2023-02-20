import {
	Adlib,
	CreateInternalGraphic,
	CreatePilotGraphic,
	CueDefinitionGraphic,
	EvaluateCueResult,
	ExtendedShowStyleContext,
	GraphicInternalOrPilot,
	GraphicIsInternal,
	GraphicIsPilot,
	PartDefinition
} from 'tv2-common'
import { OfftubeBlueprintConfig } from '../helpers/config'

export function OfftubeEvaluateGrafikCaspar(
	context: ExtendedShowStyleContext<OfftubeBlueprintConfig>,
	partId: string,
	parsedCue: CueDefinitionGraphic<GraphicInternalOrPilot>,
	partDefinition: PartDefinition,
	adlib?: Adlib
): EvaluateCueResult {
	if (GraphicIsPilot(parsedCue)) {
		return CreatePilotGraphic({
			context,
			partId,
			parsedCue,
			adlib,
			segmentExternalId: partDefinition.segmentExternalId
		})
	} else if (GraphicIsInternal(parsedCue)) {
		return CreateInternalGraphic(context, partId, parsedCue, partDefinition, adlib)
	}
	return new EvaluateCueResult()
}
