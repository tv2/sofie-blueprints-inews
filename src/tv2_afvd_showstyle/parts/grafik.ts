import {
	BlueprintResultPart,
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPart,
	IBlueprintPiece,
	ISegmentUserContext
} from '@sofie-automation/blueprints-integration'
import { AddScript, ApplyFullGraphicPropertiesToPart, literal, PartDefinition, PartTime } from 'tv2-common'
import { BlueprintConfig } from '../helpers/config'
import { EvaluateCues } from '../helpers/pieces/evaluateCues'
import { SourceLayer } from '../layers'

export function CreatePartGrafik(
	context: ISegmentUserContext,
	config: BlueprintConfig,
	partDefinition: PartDefinition,
	totalWords: number
): BlueprintResultPart {
	const partTime = PartTime(config, partDefinition, totalWords, false)
	const part = literal<IBlueprintPart>({
		externalId: partDefinition.externalId,
		title: partDefinition.type + ' - ' + partDefinition.rawType,
		metaData: {}
	})

	const adLibPieces: IBlueprintAdLibPiece[] = []
	const pieces: IBlueprintPiece[] = []
	const actions: IBlueprintActionManifest[] = []
	// R35: const mediaSubscriptions: HackPartMediaObjectSubscription[] = []

	EvaluateCues(
		context,
		config,
		part,
		pieces,
		adLibPieces,
		actions,
		// mediaSubscriptions,
		partDefinition.cues,
		partDefinition,
		{
			isGrafikPart: true
		}
	)
	AddScript(partDefinition, pieces, partTime, SourceLayer.PgmScript)

	ApplyFullGraphicPropertiesToPart(config, part)

	// R35: part.hackListenToMediaObjectUpdates = mediaSubscriptions

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
