import { IBlueprintAdLibPiece, IBlueprintPart, IBlueprintPiece } from 'tv-automation-sofie-blueprints-integration'
import { AddScript, GetJinglePartProperties, literal, PartContext2, PartDefinition, PartTime } from 'tv2-common'
import { CueType } from 'tv2-constants'
import { OfftubeShowstyleBlueprintConfig } from '../helpers/config'
import { OfftubeEvaluateCues } from '../helpers/EvaluateCues'
import { OfftubeSourceLayer } from '../layers'

export function CreatePartUnknown(
	context: PartContext2,
	config: OfftubeShowstyleBlueprintConfig,
	partDefinition: PartDefinition,
	totalWords: number,
	asAdlibs?: boolean
) {
	const partTime = PartTime(config, partDefinition, totalWords)

	let part = literal<IBlueprintPart>({
		externalId: partDefinition.externalId,
		title: partDefinition.type + ' - ' + partDefinition.rawType,
		metaData: {},
		autoNext: false,
		expectedDuration: partTime
	})

	const adLibPieces: IBlueprintAdLibPiece[] = []
	const pieces: IBlueprintPiece[] = []

	OfftubeEvaluateCues(context, config, pieces, adLibPieces, partDefinition.cues, partDefinition, { adlib: asAdlibs })
	part = { ...part, ...GetJinglePartProperties(context, config, partDefinition) }

	if (partDefinition.cues.filter(cue => cue.type === CueType.DVE).length) {
		part.prerollDuration = config.studio.CasparPrerollDuration
	}

	AddScript(partDefinition, pieces, partTime, OfftubeSourceLayer.PgmScript)

	if (pieces.length === 0) {
		part.invalid = true
	}

	return {
		part,
		adLibPieces,
		pieces
	}
}
