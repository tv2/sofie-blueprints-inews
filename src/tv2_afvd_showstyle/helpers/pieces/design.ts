import {
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	ISegmentUserContext
} from '@tv2media/blueprints-integration'
import { CueDefinitionGraphicDesign, EvaluateDesignBase, TV2BlueprintConfig } from 'tv2-common'
import * as _ from 'underscore'

export function EvaluateCueDesign(
	config: TV2BlueprintConfig,
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
