import { IBlueprintActionManifest, IBlueprintAdLibPiece, IBlueprintPiece } from 'blueprints-integration'
import {
	Adlib,
	CreateInternalGraphic,
	CueDefinitionGraphic,
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
	pieces: IBlueprintPiece[],
	adlibPieces: IBlueprintAdLibPiece[],
	actions: IBlueprintActionManifest[],
	partId: string,
	parsedCue: CueDefinitionGraphic<GraphicInternalOrPilot>,
	partDefinition: PartDefinition,
	adlib?: Adlib
) {
	if (parsedCue.routing) {
		EvaluateCueRouting(context, pieces, partId, parsedCue.routing)
	}

	if (GraphicIsInternal(parsedCue)) {
		CreateInternalGraphic(context, pieces, adlibPieces, partId, parsedCue, partDefinition, adlib)
	} else if (GraphicIsPilot(parsedCue)) {
		EvaluateCueGraphicPilot(
			context,
			pieces,
			adlibPieces,
			actions,
			partId,
			parsedCue,
			partDefinition.segmentExternalId,
			adlib
		)
	}
}
