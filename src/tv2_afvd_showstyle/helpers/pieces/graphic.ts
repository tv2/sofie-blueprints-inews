import {
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	ISegmentUserContext
} from '@tv2media/blueprints-integration'
import {
	Adlib,
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
	context: ISegmentUserContext,
	pieces: IBlueprintPiece[],
	adlibPieces: IBlueprintAdLibPiece[],
	actions: IBlueprintActionManifest[],
	partId: string,
	parsedCue: CueDefinitionGraphic<GraphicInternalOrPilot>,
	partDefinition: PartDefinition,
	adlib?: Adlib
) {
	if (parsedCue.routing) {
		EvaluateCueRouting(config, context, pieces, adlibPieces, actions, partId, parsedCue.routing)
	}

	if (GraphicIsInternal(parsedCue)) {
		CreateInternalGraphic(config, context, pieces, adlibPieces, partId, parsedCue, partDefinition, adlib)
	} else if (GraphicIsPilot(parsedCue)) {
		EvaluateCueGraphicPilot(
			config,
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
