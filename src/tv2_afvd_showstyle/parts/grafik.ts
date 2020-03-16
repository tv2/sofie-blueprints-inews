import {
	BlueprintResultPart,
	IBlueprintAdLibPiece,
	IBlueprintPart,
	IBlueprintPiece,
	PartContext
} from 'tv-automation-sofie-blueprints-integration'
import { literal, PartDefinition } from 'tv2-common'
import { BlueprintConfig } from '../helpers/config'
import { EvaluateCues } from '../helpers/pieces/evaluateCues'
import { AddScript } from '../helpers/pieces/script'
import { PartTime } from './time/partTime'

export function CreatePartGrafik(
	context: PartContext,
	config: BlueprintConfig,
	partDefinition: PartDefinition,
	totalWords: number
): BlueprintResultPart {
	const partTime = PartTime(config, partDefinition, totalWords)
	const part = literal<IBlueprintPart>({
		externalId: partDefinition.externalId,
		title: partDefinition.type + ' - ' + partDefinition.rawType,
		metaData: {},
		typeVariant: ''
	})

	const adLibPieces: IBlueprintAdLibPiece[] = []
	const pieces: IBlueprintPiece[] = []

	EvaluateCues(context, config, pieces, adLibPieces, partDefinition.cues, partDefinition, false, true)
	AddScript(partDefinition, pieces, partTime)

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
		pieces
	}
}
