import {
	HackPartMediaObjectSubscription,
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPart,
	IBlueprintPiece,
	SegmentContext
} from '@sofie-automation/blueprints-integration'
import {
	AddScript,
	ApplyFullGraphicPropertiesToPart,
	CueDefinition,
	GetJinglePartProperties,
	GraphicIsPilot,
	literal,
	PartDefinition,
	PartTime
} from 'tv2-common'
import { CueType } from 'tv2-constants'
import { BlueprintConfig } from '../helpers/config'
import { EvaluateCues } from '../helpers/pieces/evaluateCues'
import { SourceLayer } from '../layers'

export function CreatePartCueOnly(
	context: SegmentContext,
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
	const mediaSubscriptions: HackPartMediaObjectSubscription[] = []

	EvaluateCues(context, config, part, pieces, adLibPieces, actions, mediaSubscriptions, [cue], partDefinitionWithID, {})
	AddScript(partDefinitionWithID, pieces, partTime, SourceLayer.PgmScript)
	part = { ...part, ...GetJinglePartProperties(context, config, partDefinitionWithID) }

	if (makeAdlibs) {
		EvaluateCues(context, config, part, pieces, adLibPieces, actions, mediaSubscriptions, [cue], partDefinitionWithID, {
			adlib: true
		})
	}

	part.hackListenToMediaObjectUpdates = mediaSubscriptions

	if (
		partDefinition.cues.filter(c => c.type === CueType.Graphic && GraphicIsPilot(c) && c.target === 'FULL').length &&
		!partDefinition.cues.filter(c => c.type === CueType.Jingle).length
	) {
		ApplyFullGraphicPropertiesToPart(config, part)
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
