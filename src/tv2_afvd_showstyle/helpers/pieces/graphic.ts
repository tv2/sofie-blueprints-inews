import {
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	SegmentContext
} from '@sofie-automation/blueprints-integration'
import {
	CreateInternalGraphic,
	CueDefinitionGraphic,
	GraphicInternalOrPilot,
	GraphicIsInternal,
	GraphicIsPilot,
	PartDefinition
} from 'tv2-common'
import { BlueprintConfig } from '../config'
import { EvaluateCueGraphicPilot } from './graphicPilot'
import { EvaluateCueRouting } from './routing'

export function EvaluateCueGraphic(
	config: BlueprintConfig,
	context: SegmentContext,
	pieces: IBlueprintPiece[],
	adlibPieces: IBlueprintAdLibPiece[],
	actions: IBlueprintActionManifest[],
	partId: string,
	parsedCue: CueDefinitionGraphic<GraphicInternalOrPilot>,
	adlib: boolean,
	partDefinition: PartDefinition,
	rank?: number
) {
	if (parsedCue.routing) {
		EvaluateCueRouting(config, context, pieces, adlibPieces, actions, partId, parsedCue.routing)
	}

	if (GraphicIsInternal(parsedCue)) {
		CreateInternalGraphic(config, context, pieces, adlibPieces, actions, partId, parsedCue, adlib, partDefinition, rank)
	} else if (GraphicIsPilot(parsedCue)) {
		EvaluateCueGraphicPilot(config, context, pieces, adlibPieces, actions, partId, parsedCue, adlib, rank)
	}
}
