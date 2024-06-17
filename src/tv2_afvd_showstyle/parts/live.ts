import {
	BlueprintResultPart,
	HackPartMediaObjectSubscription,
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPiece
} from 'blueprints-integration'
import { AddScript, CueDefinition, Part, PartDefinition, PartTime, SegmentContext } from 'tv2-common'
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
	let part: Part = {
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

	part.invalidity = getInvalidityReasonForLivePart(partDefinition, pieces)
	part.invalid = part.invalidity !== undefined

	return {
		part,
		adLibPieces,
		pieces,
		actions
	}
}

function getInvalidityReasonForLivePart(
	partDefinition: PartDefinition,
	pieces: IBlueprintPiece[]
): Part['invalidity'] | undefined {
	if (pieces.length === 0) {
		return { reason: 'The part has no pieces.' }
	}

	const liveCue: CueDefinition | undefined = partDefinition.cues.find((c) => c.type === CueType.Ekstern)
	if (!liveCue) {
		return { reason: 'The part has no cues with a remote source.' }
	}

	const livePiece = pieces.find((p) => p.sourceLayerId === SourceLayer.PgmLive)
	if (!livePiece) {
		return { reason: 'The part has no pieces with a remote source.' }
	}

	return undefined
}
