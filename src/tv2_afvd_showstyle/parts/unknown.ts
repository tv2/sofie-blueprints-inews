import {
	HackPartMediaObjectSubscription,
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPiece
} from 'blueprints-integration'
import {
	AddScript,
	applyFullGraphicPropertiesToPart,
	GetJinglePartProperties,
	GraphicIsPilot,
	Part,
	PartDefinition,
	PartTime,
	ShowStyleContext
} from 'tv2-common'
import { CueType } from 'tv2-constants'
import { GalleryBlueprintConfig } from '../helpers/config'
import { EvaluateCues } from '../helpers/pieces/evaluateCues'
import { SourceLayer } from '../layers'
import { CreateEffektForpart } from './effekt'

export async function CreatePartUnknown(
	context: ShowStyleContext<GalleryBlueprintConfig>,
	partDefinition: PartDefinition,
	partIndex: number,
	totalWords: number,
	asAdlibs?: boolean
) {
	const partTime = PartTime(context.config, partDefinition, totalWords, false)

	let part: Part = {
		externalId: partDefinition.externalId,
		title: partDefinition.type + ' - ' + partDefinition.rawType,
		metaData: {},
		autoNext: false,
		expectedDuration: partTime
	}

	const adLibPieces: IBlueprintAdLibPiece[] = []
	const pieces: IBlueprintPiece[] = []
	const actions: IBlueprintActionManifest[] = []
	const mediaSubscriptions: HackPartMediaObjectSubscription[] = []

	part = {
		...part,
		...CreateEffektForpart(context, partDefinition, pieces),
		...GetJinglePartProperties(context, partDefinition)
	}

	if (
		partDefinition.cues.some((cue) => cue.type === CueType.Graphic && GraphicIsPilot(cue) && cue.target === 'FULL') &&
		!partDefinition.cues.filter((c) => c.type === CueType.Jingle).length
	) {
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
		partIndex,
		{
			adlib: asAdlibs
		}
	)
	if (!asAdlibs) {
		AddScript(partDefinition, pieces, partTime, SourceLayer.PgmScript)
	}

	if (pieces.length === 0) {
		part.invalid = true
		part.invalidity = { reason: 'The part has no pieces.' }
	}

	part.hackListenToMediaObjectUpdates = mediaSubscriptions

	return {
		part,
		adLibPieces,
		pieces,
		actions
	}
}
