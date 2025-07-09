import {
	Adlib,
	CreateInternalGraphic,
	CueDefinitionGraphic,
	EvaluateCueResult,
	GraphicInternalOrPilot,
	GraphicIsInternal,
	GraphicIsPilot,
	Part,
	PartDefinition,
	ShowStyleContext
} from 'tv2-common'
import { GalleryBlueprintConfig } from '../config'
import { EvaluateCueGraphicPilot } from './graphicPilot'
import { EvaluateCueRouting } from './routing'

export function EvaluateCueGraphic(
	context: ShowStyleContext<GalleryBlueprintConfig>,
	partId: string,
	part: Part,
	parsedCue: CueDefinitionGraphic<GraphicInternalOrPilot>,
	partDefinition: PartDefinition,
	rank: number,
	adlib?: Adlib
): EvaluateCueResult {
	const result = new EvaluateCueResult()
	if (parsedCue.routing) {
		result.push(EvaluateCueRouting(context, partId, parsedCue.routing))
	}

	if (GraphicIsInternal(parsedCue)) {
		result.push(CreateInternalGraphic(context, partId, parsedCue, partDefinition, adlib))
		if (parsedCue.target === 'FULL') {
			part.title = parsedCue.graphic.template
		}
	} else if (GraphicIsPilot(parsedCue)) {
		result.push(EvaluateCueGraphicPilot(context, partId, parsedCue, partDefinition.segmentExternalId, rank, adlib))
		if (parsedCue.target === 'FULL') {
			part.title = parsedCue.graphic.name
		}
	}

	return result
}
