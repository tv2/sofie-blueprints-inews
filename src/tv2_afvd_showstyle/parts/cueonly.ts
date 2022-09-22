import {
	HackPartMediaObjectSubscription,
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPart,
	IBlueprintPiece,
	ISegmentUserContext
} from 'blueprints-integration'
import {
	AddScript,
	ApplyFullGraphicPropertiesToPart,
	CueDefinition,
	GetJinglePartProperties,
	GraphicIsPilot,
	PartDefinition,
	PartTime
} from 'tv2-common'
import { CueType } from 'tv2-constants'
import { BlueprintConfig } from '../helpers/config'
import { EvaluateCues } from '../helpers/pieces/evaluateCues'
import { SourceLayer } from '../layers'

export async function CreatePartCueOnly(
	context: ISegmentUserContext,
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

	let part: IBlueprintPart = {
		externalId: id,
		title,
		metaData: {}
	}

	const adLibPieces: IBlueprintAdLibPiece[] = []
	const pieces: IBlueprintPiece[] = []
	const actions: IBlueprintActionManifest[] = []
	const mediaSubscriptions: HackPartMediaObjectSubscription[] = []

	part = { ...part, ...GetJinglePartProperties(context, config, partDefinitionWithID) }

	if (
		partDefinition.cues.filter(c => c.type === CueType.Graphic && GraphicIsPilot(c) && c.target === 'FULL').length &&
		!partDefinition.cues.filter(c => c.type === CueType.Jingle).length
	) {
		ApplyFullGraphicPropertiesToPart(config, part)
	}

	await EvaluateCues(
		context,
		config,
		part,
		pieces,
		adLibPieces,
		actions,
		mediaSubscriptions,
		[cue],
		partDefinitionWithID,
		{}
	)
	AddScript(partDefinitionWithID, pieces, partTime, SourceLayer.PgmScript)

	if (makeAdlibs) {
		await EvaluateCues(
			context,
			config,
			part,
			pieces,
			adLibPieces,
			actions,
			mediaSubscriptions,
			[cue],
			partDefinitionWithID,
			{
				adlib: true
			}
		)
	}

	part.hackListenToMediaObjectUpdates = mediaSubscriptions

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
