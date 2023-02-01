import { IBlueprintAdLibPiece, IBlueprintPiece } from 'blueprints-integration'
import {
	Adlib,
	CueDefinitionGraphic,
	ExtendedShowStyleContext,
	GraphicInternal,
	InternalGraphic,
	IsTargetingOVL,
	PartDefinition
} from 'tv2-common'

export function CreateInternalGraphic(
	context: ExtendedShowStyleContext,
	pieces: IBlueprintPiece[],
	adlibPieces: IBlueprintAdLibPiece[],
	partId: string,
	parsedCue: CueDefinitionGraphic<GraphicInternal>,
	partDefinition: PartDefinition,
	adlib?: Adlib
) {
	const internalGraphic = InternalGraphic.createInternalGraphicGenerator({ context, parsedCue, partId, partDefinition })

	if (!internalGraphic.templateName || !internalGraphic.templateName.length) {
		context.core.notifyUserWarning(`No valid template found for ${parsedCue.graphic.template}`)
		return
	}

	if (adlib) {
		if (IsTargetingOVL(parsedCue.target)) {
			adlibPieces.push(internalGraphic.createCommentatorAdlib())
		}
		adlibPieces.push(internalGraphic.createAdlib())
	} else {
		pieces.push(internalGraphic.createPiece())
	}
}
