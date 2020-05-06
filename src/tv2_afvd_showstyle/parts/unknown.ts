import {
	IBlueprintAdLibPiece,
	IBlueprintPart,
	IBlueprintPiece,
	PartContext
} from 'tv-automation-sofie-blueprints-integration'
import { GetJinglePartProperties, literal, PartDefinition, PartTime } from 'tv2-common'
import { CueType } from 'tv2-constants'
import { BlueprintConfig } from '../helpers/config'
import { EvaluateCues } from '../helpers/pieces/evaluateCues'
import { AddScript } from '../helpers/pieces/script'
import { CreateEffektForpart } from './effekt'

export function CreatePartUnknown(
	context: PartContext,
	config: BlueprintConfig,
	partDefinition: PartDefinition,
	totalWords: number,
	reservedTime: number,
	asAdlibs?: boolean
) {
	const partTime = PartTime(config, partDefinition, totalWords, reservedTime)

	let part = literal<IBlueprintPart>({
		externalId: partDefinition.externalId,
		title: partDefinition.type + ' - ' + partDefinition.rawType,
		metaData: {},
		typeVariant: '',
		autoNext: false,
		expectedDuration: partTime
	})

	const adLibPieces: IBlueprintAdLibPiece[] = []
	const pieces: IBlueprintPiece[] = []

	part = { ...part, ...CreateEffektForpart(context, config, partDefinition, pieces) }

	EvaluateCues(context, config, pieces, adLibPieces, partDefinition.cues, partDefinition, { adlib: asAdlibs })
	if (!asAdlibs) {
		AddScript(partDefinition, pieces, partTime)
	}
	part = { ...part, ...GetJinglePartProperties(context, config, partDefinition) }

	if (
		partDefinition.cues.filter(
			cue => cue.type === CueType.MOS || cue.type === CueType.Telefon || cue.type === CueType.TargetEngine
		).length &&
		!partDefinition.cues.filter(c => c.type === CueType.Jingle).length
	) {
		part.prerollDuration = config.studio.PilotPrerollDuration
		part.transitionKeepaliveDuration = config.studio.PilotKeepaliveDuration
			? Number(config.studio.PilotKeepaliveDuration)
			: 60000
	} else if (partDefinition.cues.filter(cue => cue.type === CueType.DVE).length) {
		part.prerollDuration = config.studio.CasparPrerollDuration
	}

	if (pieces.length === 0) {
		part.invalid = true
	}

	return {
		part,
		adLibPieces,
		pieces
	}
}
