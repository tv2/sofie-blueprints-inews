import {
	Adlib,
	CueDefinitionGraphic,
	EvaluateCueResult,
	GraphicInternal,
	InternalGraphic,
	IsTargetingOVL,
	PartDefinition,
	ShowStyleContext
} from 'tv2-common'

export function CreateInternalGraphic(
	context: ShowStyleContext,
	partId: string,
	parsedCue: CueDefinitionGraphic<GraphicInternal>,
	partDefinition: PartDefinition,
	adlib?: Adlib
): EvaluateCueResult {
	const result = new EvaluateCueResult()
	const internalGraphic = InternalGraphic.createInternalGraphicGenerator({
		context,
		parsedCue,
		partId,
		partDefinition,
		rank: adlib?.rank ?? 0
	})

	if (!internalGraphic.templateName || !internalGraphic.templateName.length) {
		context.core.notifyUserWarning(`No valid template found for ${parsedCue.graphic.template}`)
		return result
	}

	if (!adlib) {
		result.pieces.push(internalGraphic.createPiece())
		return result
	}

	if (IsTargetingOVL(parsedCue.target)) {
		result.adlibPieces.push(internalGraphic.createCommentatorAdlib())
	}
	result.adlibPieces.push(internalGraphic.createAdlib())

	return result
}
