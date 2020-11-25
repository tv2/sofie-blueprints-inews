import {
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPart,
	IBlueprintPiece
} from 'tv-automation-sofie-blueprints-integration'
import {
	AddScript,
	CueDefinition,
	GetJinglePartProperties,
	GraphicIsPilot,
	literal,
	PartContext2,
	PartDefinition,
	PartTime
} from 'tv2-common'
import { CueType } from 'tv2-constants'
import { BlueprintConfig } from '../helpers/config'
import { EvaluateCues } from '../helpers/pieces/evaluateCues'
import { SourceLayer } from '../layers'

export function CreatePartCueOnly(
	context: PartContext2,
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
		metaData: {}
	})

	const adLibPieces: IBlueprintAdLibPiece[] = []
	const pieces: IBlueprintPiece[] = []
	const actions: IBlueprintActionManifest[] = []

	EvaluateCues(context, config, pieces, adLibPieces, actions, [cue], partDefinitionWithID, {})
	AddScript(partDefinitionWithID, pieces, partTime, SourceLayer.PgmScript)
	part = { ...part, ...GetJinglePartProperties(context, config, partDefinitionWithID) }

	if (makeAdlibs) {
		EvaluateCues(context, config, pieces, adLibPieces, actions, [cue], partDefinitionWithID, { adlib: true })
	}

	if (
		partDefinition.cues.filter(c => c.type === CueType.Graphic && GraphicIsPilot(c) && c.target === 'FULL').length &&
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
		pieces,
		actions
	}
}
