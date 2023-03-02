import { IBlueprintActionManifest, IBlueprintAdLibPiece, IBlueprintPiece } from 'blueprints-integration'
import { CueDefinitionGraphicDesign, EvaluateDesignBase, ShowStyleContext } from 'tv2-common'
import * as _ from 'underscore'

export function EvaluateCueDesign(
	context: ShowStyleContext,
	pieces: IBlueprintPiece[],
	adlibPieces: IBlueprintAdLibPiece[],
	actions: IBlueprintActionManifest[],
	partId: string,
	parsedCue: CueDefinitionGraphicDesign,
	adlib?: boolean,
	rank?: number
) {
	EvaluateDesignBase(context, pieces, adlibPieces, actions, partId, parsedCue, adlib, rank)
}
