import {
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	ISegmentUserContext
} from 'blueprints-integration'
import { CueDefinitionGraphicDesign, EvaluateDesignBase } from 'tv2-common'
import { OfftubeShowstyleBlueprintConfig } from '../helpers/config'

export function OfftubeEvaluateGraphicDesign(
	config: OfftubeShowstyleBlueprintConfig,
	context: ISegmentUserContext,
	pieces: IBlueprintPiece[],
	adlibPieces: IBlueprintAdLibPiece[],
	actions: IBlueprintActionManifest[],
	partId: string,
	parsedCue: CueDefinitionGraphicDesign,
	adlib?: boolean,
	rank?: number
) {
	EvaluateDesignBase(config, context, pieces, adlibPieces, actions, partId, parsedCue, adlib, rank)
}
