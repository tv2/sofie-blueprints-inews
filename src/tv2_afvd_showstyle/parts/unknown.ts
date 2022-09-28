import {
	HackPartMediaObjectSubscription,
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPart,
	IBlueprintPiece,
	ISegmentUserContext
} from '@tv2media/blueprints-integration'
import {
	AddScript,
	ApplyFullGraphicPropertiesToPart,
	GetJinglePartProperties,
	GraphicIsPilot,
	PartDefinition,
	PartTime
} from 'tv2-common'
import { CueType } from 'tv2-constants'
import { BlueprintConfig } from '../helpers/config'
import { EvaluateCues } from '../helpers/pieces/evaluateCues'
import { SourceLayer } from '../layers'
import { CreateEffektForpart } from './effekt'

export async function CreatePartUnknown(
	context: ISegmentUserContext,
	config: BlueprintConfig,
	partDefinition: PartDefinition,
	totalWords: number,
	asAdlibs?: boolean
) {
	const partTime = PartTime(config, partDefinition, totalWords, false)

	let part: IBlueprintPart = {
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

	part = { ...part, ...CreateEffektForpart(context, config, partDefinition, pieces) }
	part = { ...part, ...GetJinglePartProperties(context, config, partDefinition) }

	if (
		partDefinition.cues.some(cue => cue.type === CueType.Graphic && GraphicIsPilot(cue) && cue.target === 'FULL') &&
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
		partDefinition.cues,
		partDefinition,
		{
			adlib: asAdlibs
		}
	)
	if (!asAdlibs) {
		AddScript(partDefinition, pieces, partTime, SourceLayer.PgmScript)
	}

	if (pieces.length === 0) {
		part.invalid = true
	}

	part.hackListenToMediaObjectUpdates = mediaSubscriptions

	return {
		part,
		adLibPieces,
		pieces,
		actions
	}
}
