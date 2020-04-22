import {
	BlueprintResultPart,
	IBlueprintAdLibPiece,
	IBlueprintPart,
	IBlueprintPiece
} from 'tv-automation-sofie-blueprints-integration'
import { literal, PartContext2, PartDefinitionDVE } from 'tv2-common'
import { CueType } from 'tv2-constants'
import { OffTubeShowstyleBlueprintConfig } from '../helpers/config'
import { OfftubeEvaluateCues } from '../helpers/EvaluateCues'

export function OfftubeCreatePartDVE(
	context: PartContext2,
	config: OffTubeShowstyleBlueprintConfig,
	partDefinition: PartDefinitionDVE,
	_totalWords: number
): BlueprintResultPart {
	const part = literal<IBlueprintPart>({
		externalId: partDefinition.externalId,
		title: `DVE`,
		typeVariant: ''
	})
	const pieces: IBlueprintPiece[] = []
	const adLibPieces: IBlueprintAdLibPiece[] = []
	OfftubeEvaluateCues(context, config, pieces, adLibPieces, partDefinition.cues, partDefinition, { adlib: true })

	if (partDefinition.cues.filter(cue => cue.type === CueType.DVE).length) {
		part.prerollDuration = config.studio.CasparPrerollDuration
	}

	if (pieces.length === 0) {
		part.invalid = true
	}

	return {
		part,
		pieces,
		adLibPieces
	}
}
