import {
	HackPartMediaObjectSubscription,
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPart,
	IBlueprintPiece
} from 'blueprints-integration'
import {
	AddScript,
	applyFullGraphicPropertiesToPart,
	GetJinglePartProperties,
	GraphicIsPilot,
	PartDefinition,
	PartTime,
	SegmentContext
} from 'tv2-common'
import { CueType } from 'tv2-constants'
import { OfftubeBlueprintConfig } from '../helpers/config'
import { OfftubeEvaluateCues } from '../helpers/EvaluateCues'
import { OfftubeSourceLayer } from '../layers'

export async function CreatePartUnknown(
	context: SegmentContext<OfftubeBlueprintConfig>,
	partDefinition: PartDefinition,
	totalWords: number,
	asAdlibs?: boolean
) {
	const partTime = PartTime(context.config, partDefinition, totalWords)

	let part: IBlueprintPart = {
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

	part = { ...part, ...GetJinglePartProperties(context, partDefinition) }

	if (
		partDefinition.cues.some(cue => cue.type === CueType.Graphic && GraphicIsPilot(cue) && cue.target === 'FULL') &&
		!partDefinition.cues.filter(c => c.type === CueType.Jingle).length
	) {
		applyFullGraphicPropertiesToPart(context.config, part)
	}

	await OfftubeEvaluateCues(
		context,
		part,
		pieces,
		adLibPieces,
		actions,
		mediaSubscriptions,
		partDefinition.cues,
		partDefinition,
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
