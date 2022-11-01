import { IBlueprintAdLibPiece, IBlueprintPiece, IShowStyleUserContext } from 'blueprints-integration'
import {
	Adlib,
	CueDefinitionGraphic,
	GraphicInternal,
	IsTargetingOVL,
	PartDefinition,
	TV2BlueprintConfig
} from 'tv2-common'
import { InternalGraphic } from '../InternalGraphic'

export function CreateInternalGraphic(
	config: TV2BlueprintConfig,
	context: IShowStyleUserContext,
	pieces: IBlueprintPiece[],
	adlibPieces: IBlueprintAdLibPiece[],
	partId: string,
	parsedCue: CueDefinitionGraphic<GraphicInternal>,
	partDefinition: PartDefinition,
	adlib?: Adlib
) {
	const internalGraphic: InternalGraphic = new InternalGraphic(config, context, parsedCue, partId, partDefinition)

	if (!internalGraphic.mappedTemplate || !internalGraphic.mappedTemplate.length) {
		context.notifyUserWarning(`No valid template found for ${parsedCue.graphic.template}`)
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
