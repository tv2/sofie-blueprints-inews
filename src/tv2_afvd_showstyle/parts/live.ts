import {
	BlueprintResultPart,
	IBlueprintAdLibPiece,
	IBlueprintPart,
	IBlueprintPiece
} from 'tv-automation-sofie-blueprints-integration'
import { literal, PartContext2, PartDefinition, PartTime } from 'tv2-common'
import { BlueprintConfig } from '../../tv2_afvd_showstyle/helpers/config'
import { EvaluateCues } from '../helpers/pieces/evaluateCues'
import { AddScript } from '../helpers/pieces/script'
import { CreateEffektForpart } from './effekt'

export function CreatePartLive(
	context: PartContext2,
	config: BlueprintConfig,
	partDefinition: PartDefinition,
	totalWords: number
): BlueprintResultPart {
	const partTime = PartTime(config.studio.MaximumKamDisplayDuration, partDefinition, totalWords)
	let part = literal<IBlueprintPart>({
		externalId: partDefinition.externalId,
		title: partDefinition.type + ' - ' + partDefinition.rawType,
		metaData: {},
		typeVariant: ''
	})

	const adLibPieces: IBlueprintAdLibPiece[] = []
	const pieces: IBlueprintPiece[] = []

	part = { ...part, ...CreateEffektForpart(context, config, partDefinition, pieces) }

	EvaluateCues(context, config, pieces, adLibPieces, partDefinition.cues, partDefinition, {})
	AddScript(partDefinition, pieces, partTime)

	if (pieces.length === 0) {
		part.invalid = true
	}

	return {
		part,
		adLibPieces,
		pieces
	}
}
