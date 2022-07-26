import {
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	IShowStyleUserContext
} from '@tv2media/blueprints-integration'
import { Adlib, CueDefinitionGraphic, GraphicInternal, PartDefinition, TV2BlueprintConfig } from 'tv2-common'
import { InternalGraphic } from '../InternalGraphic'

export function CreateInternalGraphic(
	config: TV2BlueprintConfig,
	context: IShowStyleUserContext,
	pieces: IBlueprintPiece[],
	adlibPieces: IBlueprintAdLibPiece[],
	actions: IBlueprintActionManifest[],
	partId: string,
	parsedCue: CueDefinitionGraphic<GraphicInternal>,
	partDefinition: PartDefinition,
	adlib?: Adlib
) {
	const internalGraphic: InternalGraphic = new InternalGraphic(config, parsedCue, adlib, partId, partDefinition)

	if (!internalGraphic.mappedTemplate || !internalGraphic.mappedTemplate.length) {
		context.notifyUserWarning(`No valid template found for ${parsedCue.graphic.template}`)
		return
	}

	if (adlib) {
		internalGraphic.createAdlibTargetingOVL(context, actions, adlibPieces)
		internalGraphic.createAdlib(context, actions, adlibPieces)
	} else {
		internalGraphic.createPiece(pieces)
	}
}
