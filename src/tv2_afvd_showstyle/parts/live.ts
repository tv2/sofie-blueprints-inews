import {
	BlueprintResultPart,
	HackPartMediaObjectSubscription,
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPart,
	IBlueprintPiece
} from 'blueprints-integration'
import { AddScript, CueDefinitionEkstern, PartDefinition, PartTime, SegmentContext } from 'tv2-common'
import { CueType } from 'tv2-constants'
import { GalleryBlueprintConfig } from '../../tv2_afvd_showstyle/helpers/config'
import { EvaluateCues } from '../helpers/pieces/evaluateCues'
import { SourceLayer } from '../layers'
import { CreateEffektForpart } from './effekt'

export async function CreatePartLive(
	context: SegmentContext<GalleryBlueprintConfig>,
	partDefinition: PartDefinition,
	totalWords: number
): Promise<BlueprintResultPart> {
	const partTime = PartTime(context.config, partDefinition, totalWords, false)
	let part: IBlueprintPart = {
		externalId: partDefinition.externalId,
		title: partDefinition.title || 'Ekstern',
		metaData: {},
		expectedDuration: partTime > 0 ? partTime : 0
	}

	const adLibPieces: IBlueprintAdLibPiece[] = []
	const pieces: IBlueprintPiece[] = []
	const actions: IBlueprintActionManifest[] = []
	const mediaSubscriptions: HackPartMediaObjectSubscription[] = []

	part = { ...part, ...CreateEffektForpart(context, partDefinition, pieces) }

	await EvaluateCues(
		context,
		part,
		pieces,
		adLibPieces,
		actions,
		mediaSubscriptions,
		partDefinition.cues,
		partDefinition,
		{}
	)
	AddScript(partDefinition, pieces, partTime, SourceLayer.PgmScript)

	part.hackListenToMediaObjectUpdates = mediaSubscriptions

	const liveCue = partDefinition.cues.find(c => c.type === CueType.Ekstern) as CueDefinitionEkstern
	const livePiece = pieces.find(p => p.sourceLayerId === SourceLayer.PgmLive)

	if (pieces.length === 0 || !liveCue || !livePiece) {
		part.invalid = true
	}

	return {
		part,
		adLibPieces,
		pieces,
		actions
	}
}
