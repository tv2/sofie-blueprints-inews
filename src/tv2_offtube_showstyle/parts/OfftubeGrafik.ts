import {
	HackPartMediaObjectSubscription,
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPart,
	IBlueprintPiece
} from 'blueprints-integration'
import { AddScript, applyFullGraphicPropertiesToPart, PartDefinition, PartTime, SegmentContext } from 'tv2-common'
import { OfftubeBlueprintConfig } from '../helpers/config'
import { OfftubeEvaluateCues } from '../helpers/EvaluateCues'
import { OfftubeSourceLayer } from '../layers'

export async function OfftubeCreatePartGrafik(
	context: SegmentContext<OfftubeBlueprintConfig>,
	partDefinition: PartDefinition,
	partIndex: number,
	totalWords: number,
	asAdlibs?: boolean
) {
	const partTime = PartTime(context.config, partDefinition, totalWords)

	const part: IBlueprintPart = {
		externalId: partDefinition.externalId,
		title: partDefinition.title || partDefinition.type + ' - ' + partDefinition.rawType,
		metaData: {},
		autoNext: false,
		expectedDuration: partTime
	}

	const adLibPieces: IBlueprintAdLibPiece[] = []
	const pieces: IBlueprintPiece[] = []
	const actions: IBlueprintActionManifest[] = []
	const mediaSubscriptions: HackPartMediaObjectSubscription[] = []

	applyFullGraphicPropertiesToPart(context.config, part)

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
			adlib: asAdlibs
		}
	)
	AddScript(partDefinition, pieces, partTime, OfftubeSourceLayer.PgmScript)

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
