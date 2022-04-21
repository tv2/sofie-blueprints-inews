import {
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPart,
	IBlueprintPiece,
	IShowStyleUserContext
} from '@tv2media/blueprints-integration'
import { CueDefinitionGraphic, GraphicInternal, PartDefinition, TV2BlueprintConfig } from 'tv2-common'
import { InternalGraphic } from '../InternalGraphic'

export function CreateInternalGraphic(
	config: TV2BlueprintConfig,
	context: IShowStyleUserContext,
	part: Readonly<IBlueprintPart>,
	pieces: IBlueprintPiece[],
	adlibPieces: IBlueprintAdLibPiece[],
	actions: IBlueprintActionManifest[],
	partId: string,
	parsedCue: CueDefinitionGraphic<GraphicInternal>,
	adlib: boolean,
	partDefinition: PartDefinition,
	rank?: number
) {
	const internalGraphic: InternalGraphic = new InternalGraphic(
		config,
		parsedCue,
		adlib,
		part,
		partId,
		partDefinition,
		rank
	)

	if (!internalGraphic.mappedTemplate || !internalGraphic.mappedTemplate.length) {
		context.notifyUserWarning(`No valid template found for ${parsedCue.graphic.template}`)
		return
	}

	if (adlib) {
		internalGraphic.createAdlibTargetingOVL(actions, adlibPieces)
		internalGraphic.createAdlib(actions, adlibPieces)
	} else {
		internalGraphic.createPiece(pieces)
	}
}
