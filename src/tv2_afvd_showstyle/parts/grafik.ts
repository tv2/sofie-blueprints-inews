import {
	BlueprintResultPart,
	HackPartMediaObjectSubscription,
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPart,
	IBlueprintPiece
} from 'blueprints-integration'
import {
	AddScript,
	applyFullGraphicPropertiesToPart,
	GraphicIsPilot,
	PartDefinition,
	PartTime,
	ShowStyleContext
} from 'tv2-common'
import { CueType } from 'tv2-constants'
import { GalleryBlueprintConfig } from '../helpers/config'
import { EvaluateCues } from '../helpers/pieces/evaluateCues'
import { SourceLayer } from '../layers'

export async function CreatePartGrafik(
	context: ShowStyleContext<GalleryBlueprintConfig>,
	partDefinition: PartDefinition,
	totalWords: number
): Promise<BlueprintResultPart> {
	const partTime = PartTime(context.config, partDefinition, totalWords, false)
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
		applyFullGraphicPropertiesToPart(context.config, part)
	}

	await EvaluateCues(
		context,
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
