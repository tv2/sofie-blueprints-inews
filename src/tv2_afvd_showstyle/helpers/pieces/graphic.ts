import {
	Adlib,
	CreateInternalGraphic,
	CueDefinitionGraphic,
	EvaluateCueResult,
	ExtendedShowStyleContext,
	GraphicInternalOrPilot,
	GraphicIsInternal,
	GraphicIsPilot,
	PartDefinition
} from 'tv2-common'
import { GalleryBlueprintConfig } from '../config'
import { EvaluateCueGraphicPilot } from './graphicPilot'
import { EvaluateCueRouting } from './routing'

export function EvaluateCueGraphic(
	context: ExtendedShowStyleContext<GalleryBlueprintConfig>,
	partId: string,
	parsedCue: CueDefinitionGraphic<GraphicInternalOrPilot>,
	partDefinition: PartDefinition,
	adlib?: Adlib
): EvaluateCueResult {
	const result = new EvaluateCueResult()
	if (parsedCue.routing) {
		result.push(EvaluateCueRouting(context, partId, parsedCue.routing))
	}

	if (GraphicIsInternal(parsedCue)) {
		result.push(CreateInternalGraphic(context, partId, parsedCue, partDefinition, adlib))
	} else if (GraphicIsPilot(parsedCue)) {
		result.push(EvaluateCueGraphicPilot(context, partId, parsedCue, partDefinition.segmentExternalId, adlib))
	}

	return result
}
