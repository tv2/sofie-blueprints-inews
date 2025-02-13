import {
	BlueprintResultPart,
	HackPartMediaObjectSubscription,
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPart,
	IBlueprintPiece
} from 'blueprints-integration'
import { AddScript, PartDefinitionDVE, PartTime, SegmentContext } from 'tv2-common'
import { OfftubeBlueprintConfig } from '../helpers/config'
import { OfftubeEvaluateCues } from '../helpers/EvaluateCues'
import { OfftubeSourceLayer } from '../layers'

export async function OfftubeCreatePartDVE(
	context: SegmentContext<OfftubeBlueprintConfig>,
	partDefinition: PartDefinitionDVE,
	partIndex: number,
	totalWords: number
): Promise<BlueprintResultPart> {
	const partTime = PartTime(context.config, partDefinition, totalWords, false)

	const part: IBlueprintPart = {
		externalId: partDefinition.externalId,
		title: partDefinition.title || `DVE`,
		autoNext: false,
		expectedDuration: partTime
	}
	const pieces: IBlueprintPiece[] = []
	const adLibPieces: IBlueprintAdLibPiece[] = []
	const actions: IBlueprintActionManifest[] = []
	const mediaSubscriptions: HackPartMediaObjectSubscription[] = []

	await OfftubeEvaluateCues(
		context,
		part,
		pieces,
		adLibPieces,
		actions,
		mediaSubscriptions,
		partDefinition.cues,
		partDefinition,
		partIndex,
		{
			adlib: true
		}
	)

	if (pieces.length === 0) {
		part.invalid = true
	}

	AddScript(partDefinition, pieces, partTime, OfftubeSourceLayer.PgmScript)

	part.hackListenToMediaObjectUpdates = mediaSubscriptions

	return {
		part,
		pieces,
		adLibPieces,
		actions
	}
}
