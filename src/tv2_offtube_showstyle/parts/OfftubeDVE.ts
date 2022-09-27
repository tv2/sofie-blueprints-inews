import {
	BlueprintResultPart,
	HackPartMediaObjectSubscription,
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPart,
	IBlueprintPiece,
	ISegmentUserContext
} from 'blueprints-integration'
import { AddScript, PartDefinitionDVE, PartTime } from 'tv2-common'
import { OfftubeShowstyleBlueprintConfig } from '../helpers/config'
import { OfftubeEvaluateCues } from '../helpers/EvaluateCues'
import { OfftubeSourceLayer } from '../layers'

export async function OfftubeCreatePartDVE(
	context: ISegmentUserContext,
	config: OfftubeShowstyleBlueprintConfig,
	partDefinition: PartDefinitionDVE,
	totalWords: number
): Promise<BlueprintResultPart> {
	const partTime = PartTime(config, partDefinition, totalWords, false)

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
		config,
		part,
		pieces,
		adLibPieces,
		actions,
		mediaSubscriptions,
		partDefinition.cues,
		partDefinition,
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
