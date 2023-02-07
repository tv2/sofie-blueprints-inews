import { IBlueprintActionManifest, IBlueprintAdLibPiece, IBlueprintPiece } from 'blueprints-integration'
import { Adlib, CreatePilotGraphic, CueDefinitionGraphic, ExtendedShowStyleContext, GraphicPilot } from 'tv2-common'

export function EvaluateCueGraphicPilot(
	context: ExtendedShowStyleContext,
	pieces: IBlueprintPiece[],
	adlibPieces: IBlueprintAdLibPiece[],
	actions: IBlueprintActionManifest[],
	partId: string,
	parsedCue: CueDefinitionGraphic<GraphicPilot>,
	segmentExternalId: string,
	adlib?: Adlib
) {
	CreatePilotGraphic(pieces, adlibPieces, actions, {
		context,
		partId,
		parsedCue,
		adlib,
		segmentExternalId
	})
}
