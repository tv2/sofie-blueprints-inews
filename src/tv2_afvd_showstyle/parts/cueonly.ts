import {
	IBlueprintAdLibPiece,
	IBlueprintPart,
	IBlueprintPiece,
	PartContext
} from 'tv-automation-sofie-blueprints-integration'
import { CueDefinition, GetJinglePartProperties, literal, PartDefinition, PartTime } from 'tv2-common'
import { CueType } from 'tv2-constants'
import { BlueprintConfig } from '../helpers/config'
import { EvaluateCues } from '../helpers/pieces/evaluateCues'
import { AddScript } from '../helpers/pieces/script'

export function CreatePartCueOnly(
	context: PartContext,
	config: BlueprintConfig,
	partDefinition: PartDefinition,
	id: string,
	title: string,
	cue: CueDefinition,
	totalWords: number,
	makeAdlibs?: boolean
) {
	const partDefinitionWithID = { ...partDefinition, ...{ externalId: id } }
	const partTime = PartTime(config, partDefinitionWithID, totalWords, false)

	let part = literal<IBlueprintPart>({
		externalId: id,
		title,
		metaData: {},
		typeVariant: ''
	})

	const adLibPieces: IBlueprintAdLibPiece[] = []
	const pieces: IBlueprintPiece[] = []

	EvaluateCues(context, config, pieces, adLibPieces, [cue], partDefinitionWithID, {})
	AddScript(partDefinitionWithID, pieces, partTime)
	part = { ...part, ...GetJinglePartProperties(context, config, partDefinitionWithID) }

	if (makeAdlibs) {
		EvaluateCues(context, config, pieces, adLibPieces, [cue], partDefinitionWithID, { adlib: true })
	}

	if (
		partDefinition.cues.filter(
			c => c.type === CueType.MOS || c.type === CueType.Telefon || c.type === CueType.TargetEngine
		).length &&
		!partDefinition.cues.filter(c => c.type === CueType.Jingle).length
	) {
		part.prerollDuration = config.studio.PilotPrerollDuration
		part.transitionKeepaliveDuration = config.studio.PilotKeepaliveDuration
			? Number(config.studio.PilotKeepaliveDuration)
			: 60000
	} else if (partDefinition.cues.filter(c => c.type === CueType.DVE).length) {
		part.prerollDuration = config.studio.CasparPrerollDuration
	}

	if (pieces.length === 0 && adLibPieces.length === 0) {
		part.invalid = true
	}

	return {
		part,
		adLibPieces,
		pieces
	}
}
