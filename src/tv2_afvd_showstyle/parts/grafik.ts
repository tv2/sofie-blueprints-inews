import {
	BlueprintResultPart,
	HackPartMediaObjectSubscription,
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPart,
	IBlueprintPiece,
	ISegmentUserContext
} from 'blueprints-integration'
import { AddScript, ApplyFullGraphicPropertiesToPart, GraphicIsPilot, PartDefinition, PartTime } from 'tv2-common'
import { CueType } from 'tv2-constants'
import { BlueprintConfig } from '../helpers/config'
import { EvaluateCues } from '../helpers/pieces/evaluateCues'
import { SourceLayer } from '../layers'

export async function CreatePartGrafik(
	context: ISegmentUserContext,
	config: BlueprintConfig,
	partDefinition: PartDefinition,
	totalWords: number
): Promise<BlueprintResultPart> {
	const partTime = PartTime(config, partDefinition, totalWords, false)
	const part: IBlueprintPart = {
		externalId: partDefinition.externalId,
		title: partDefinition.type + ' - ' + partDefinition.rawType,
		metaData: {}
	}

	const adLibPieces: IBlueprintAdLibPiece[] = []
	const pieces: IBlueprintPiece[] = []
	const actions: IBlueprintActionManifest[] = []
	const mediaSubscriptions: HackPartMediaObjectSubscription[] = []

	if (partDefinition.cues.filter(c => c.type === CueType.Graphic && GraphicIsPilot(c) && c.target === 'FULL').length) {
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
		partDefinition.cues,
		partDefinition,
		{
			isGrafikPart: true
		}
	)
	AddScript(partDefinition, pieces, partTime, SourceLayer.PgmScript)

	part.hackListenToMediaObjectUpdates = mediaSubscriptions

	if (pieces.length === 0) {
		part.invalid = true
	}

	return {
		part,
		adLibPieces,
		pieces,
		actions
	}
}
