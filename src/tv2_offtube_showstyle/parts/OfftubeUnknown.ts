import {
	HackPartMediaObjectSubscription,
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPart,
	IBlueprintPiece,
	SegmentContext
} from '@sofie-automation/blueprints-integration'
import { AddScript, GetJinglePartProperties, literal, PartDefinition, PartTime } from 'tv2-common'
import { CueType } from 'tv2-constants'
import { OfftubeShowstyleBlueprintConfig } from '../helpers/config'
import { OfftubeEvaluateCues } from '../helpers/EvaluateCues'
import { OfftubeSourceLayer } from '../layers'

export function CreatePartUnknown(
	context: SegmentContext,
	config: OfftubeShowstyleBlueprintConfig,
	partDefinition: PartDefinition,
	totalWords: number,
	asAdlibs?: boolean
) {
	const partTime = PartTime(config, partDefinition, totalWords)

	let part = literal<IBlueprintPart>({
		externalId: partDefinition.externalId,
		title: partDefinition.type + ' - ' + partDefinition.rawType,
		metaData: {},
		autoNext: false,
		expectedDuration: partTime
	})

	const adLibPieces: IBlueprintAdLibPiece[] = []
	const pieces: IBlueprintPiece[] = []
	const actions: IBlueprintActionManifest[] = []
	const mediaSubscriptions: HackPartMediaObjectSubscription[] = []

	OfftubeEvaluateCues(
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
	part = { ...part, ...GetJinglePartProperties(context, config, partDefinition) }

	if (partDefinition.cues.filter(cue => cue.type === CueType.DVE).length) {
		part.prerollDuration = config.studio.CasparPrerollDuration
	}

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
