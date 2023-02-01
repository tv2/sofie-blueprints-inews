import { IBlueprintActionManifest, IBlueprintAdLibPiece, IBlueprintPiece } from 'blueprints-integration'
import { CueDefinitionGraphicDesign, EvaluateDesignBase, ExtendedSegmentContext } from 'tv2-common'
import { OfftubeBlueprintConfig } from '../helpers/config'

export function OfftubeEvaluateGraphicDesign(
	context: ExtendedSegmentContext<OfftubeBlueprintConfig>,
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
