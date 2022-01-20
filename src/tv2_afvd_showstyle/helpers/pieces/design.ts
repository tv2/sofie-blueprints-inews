import {
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	ISegmentUserContext
} from '@tv2media/blueprints-integration'
import { CueDefinitionGraphicDesign, EvaluateDesignBase } from 'tv2-common'
import * as _ from 'underscore'
import { BlueprintConfig } from '../../../tv2_afvd_studio/helpers/config'

export function EvaluateCueDesign(
	config: BlueprintConfig,
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
