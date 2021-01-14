import {
	BlueprintResultPart,
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPart,
	IBlueprintPiece,
	SegmentContext
} from 'tv-automation-sofie-blueprints-integration'
import { AddScript, literal, PartDefinition, PartTime } from 'tv2-common'
import { BlueprintConfig } from '../helpers/config'
import { EvaluateCues } from '../helpers/pieces/evaluateCues'
import { SourceLayer } from '../layers'

export function CreatePartGrafik(
	context: SegmentContext,
	config: BlueprintConfig,
	partDefinition: PartDefinition,
	totalWords: number
): BlueprintResultPart {
	const partTime = PartTime(config, partDefinition, totalWords, false)
	const part = literal<IBlueprintPart>({
		externalId: partDefinition.externalId,
		title: partDefinition.type + ' - ' + partDefinition.rawType,
		metaData: {}
	})

	const adLibPieces: IBlueprintAdLibPiece[] = []
	const pieces: IBlueprintPiece[] = []
	const actions: IBlueprintActionManifest[] = []

	EvaluateCues(context, config, pieces, adLibPieces, actions, partDefinition.cues, partDefinition, {
		isGrafikPart: true
	})
	AddScript(partDefinition, pieces, partTime, SourceLayer.PgmScript)

	part.prerollDuration = config.studio.PilotPrerollDuration
	part.transitionKeepaliveDuration = config.studio.PilotKeepaliveDuration
		? Number(config.studio.PilotKeepaliveDuration)
		: 60000

	if (pieces.length === 0) {
		part.invalid = true
	}

	return {
		part,
		adLibPieces,
		pieces,
		actions
	}
}
