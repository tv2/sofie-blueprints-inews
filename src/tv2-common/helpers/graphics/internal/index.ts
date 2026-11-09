import {
	Adlib,
	CueDefinitionGraphic,
	EvaluateCueResult,
	GraphicInternal,
	IsTargetingOVL,
	PartDefinition,
	ShowStyleContext
} from 'tv2-common'
import { InternalGraphic } from '../InternalGraphic'

export function CreateInternalGraphic(
	context: ShowStyleContext,
	partId: string,
	parsedCue: CueDefinitionGraphic<GraphicInternal>,
	partDefinition: PartDefinition,
	adlib?: Adlib
): EvaluateCueResult {
	const result = new EvaluateCueResult()
	const internalGraphic: InternalGraphic = new InternalGraphic(context, parsedCue, partId, partDefinition)

	if (!internalGraphic.mappedTemplate || !internalGraphic.mappedTemplate.length) {
		context.core.notifyUserWarning(`No valid template found for ${parsedCue.graphic.template}`)
		return result
	}

	if (adlib) {
		if (IsTargetingOVL(parsedCue.target)) {
			result.adlibPieces.push(internalGraphic.createCommentatorAdlib())
		}
		result.adlibPieces.push(internalGraphic.createAdlib())
	} else {
		result.pieces.push(internalGraphic.createPiece())
	}
	return result
}
