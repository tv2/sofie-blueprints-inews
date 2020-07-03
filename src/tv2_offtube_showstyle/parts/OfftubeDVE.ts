import {
	BlueprintResultPart,
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPart,
	IBlueprintPiece
} from 'tv-automation-sofie-blueprints-integration'
import { AddScript, literal, PartContext2, PartDefinitionDVE, PartTime } from 'tv2-common'
import { CueType } from 'tv2-constants'
import { OfftubeShowstyleBlueprintConfig } from '../helpers/config'
import { OfftubeEvaluateCues } from '../helpers/EvaluateCues'
import { OfftubeSourceLayer } from '../layers'

export function OfftubeCreatePartDVE(
	context: PartContext2,
	config: OfftubeShowstyleBlueprintConfig,
	partDefinition: PartDefinitionDVE,
	totalWords: number
): BlueprintResultPart {
	const partTime = PartTime(config, partDefinition, totalWords, false)

	const part = literal<IBlueprintPart>({
		externalId: partDefinition.externalId,
		title: `DVE`,
		autoNext: false,
		expectedDuration: partTime
	})
	const pieces: IBlueprintPiece[] = []
	const adLibPieces: IBlueprintAdLibPiece[] = []
	const actions: IBlueprintActionManifest[] = []
	OfftubeEvaluateCues(context, config, pieces, adLibPieces, actions, partDefinition.cues, partDefinition, {
		adlib: true
	})

	if (partDefinition.cues.filter(cue => cue.type === CueType.DVE).length) {
		part.prerollDuration = config.studio.CasparPrerollDuration
	}

	if (pieces.length === 0) {
		part.invalid = true
	}

	AddScript(partDefinition, pieces, partTime, OfftubeSourceLayer.PgmScript)

	return {
		part,
		pieces,
		adLibPieces,
		actions
	}
}
