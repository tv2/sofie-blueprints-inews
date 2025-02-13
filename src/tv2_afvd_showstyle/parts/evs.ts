import {
	BlueprintResultPart,
	HackPartMediaObjectSubscription,
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	PieceLifespan,
	TimelineObjectCoreExt
} from 'blueprints-integration'
import {
	AddScript,
	CreatePartInvalid,
	findSourceInfo,
	GetSisyfosTimelineObjForReplay,
	literal,
	Part,
	PartDefinitionEVS,
	PartTime,
	PieceMetaData,
	SegmentContext,
	ShowStyleContext,
	SourceInfo,
	TransitionStyle
} from 'tv2-common'
import { SharedOutputLayer } from 'tv2-constants'
import { Tv2AudioMode } from '../../tv2-constants/tv2-audio.mode'
import { Tv2OutputLayer } from '../../tv2-constants/tv2-output-layer'
import { Tv2PieceType } from '../../tv2-constants/tv2-piece-type'
import { GalleryBlueprintConfig } from '../helpers/config'
import { EvaluateCues } from '../helpers/pieces/evaluateCues'
import { SourceLayer } from '../layers'
import { CreateEffektForpart } from './effekt'

export async function CreatePartEVS(
	context: SegmentContext<GalleryBlueprintConfig>,
	partDefinition: PartDefinitionEVS,
	partIndex: number,
	totalWords: number
): Promise<BlueprintResultPart> {
	const partTime = PartTime(context.config, partDefinition, totalWords, false)
	const title = partDefinition.sourceDefinition.name

	let part: Part = {
		externalId: partDefinition.externalId,
		title,
		metaData: {},
		expectedDuration: partTime > 0 ? partTime : 0
	}

	const adLibPieces: IBlueprintAdLibPiece[] = []
	const pieces: Array<IBlueprintPiece<PieceMetaData>> = []
	const actions: IBlueprintActionManifest[] = []
	const mediaSubscriptions: HackPartMediaObjectSubscription[] = []

	part = { ...part, ...CreateEffektForpart(context, partDefinition, pieces) }

	const sourceInfoReplay = findSourceInfo(context.config.sources, partDefinition.sourceDefinition)
	if (sourceInfoReplay === undefined) {
		return CreatePartInvalid(partDefinition, {
			reason: `No configuration found for the replay source '${partDefinition.sourceDefinition.name}'.`
		})
	}
	const switcherInput = sourceInfoReplay.port

	pieces.push({
		externalId: partDefinition.externalId,
		name: part.title,
		enable: { start: 0 },
		outputLayerId: SharedOutputLayer.PGM,
		sourceLayerId: SourceLayer.PgmLocal,
		lifespan: PieceLifespan.WithinPart,
		metaData: {
			type: Tv2PieceType.REPLAY,
			outputLayer: Tv2OutputLayer.PROGRAM,
			audioMode: partDefinition.sourceDefinition.vo ? Tv2AudioMode.VOICE_OVER : Tv2AudioMode.FULL,
			sisyfosPersistMetaData: {
				sisyfosLayers: []
			}
		},
		content: makeContentEVS(context, switcherInput, partDefinition, sourceInfoReplay)
	})

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
		{}
	)
	AddScript(partDefinition, pieces, partTime, SourceLayer.PgmScript)

	part.hackListenToMediaObjectUpdates = mediaSubscriptions

	if (pieces.length === 0) {
		part.invalid = true
		part.invalidity = { reason: 'The part has no pieces.' }
	}

	return {
		part,
		adLibPieces,
		pieces,
		actions
	}
}

function makeContentEVS(
	context: ShowStyleContext<GalleryBlueprintConfig>,
	switcherInput: number,
	partDefinition: PartDefinitionEVS,
	sourceInfoReplay: SourceInfo
): IBlueprintPiece['content'] {
	return {
		studioLabel: '',
		switcherInput,
		ignoreMediaObjectStatus: true,
		timelineObjects: literal<TimelineObjectCoreExt[]>([
			...context.videoSwitcher.getOnAirTimelineObjectsWithLookahead({
				priority: 1,
				content: {
					input: switcherInput,
					transition: partDefinition.transition?.style ?? TransitionStyle.CUT,
					transitionDuration: partDefinition.transition?.duration
				}
			}),
			...GetSisyfosTimelineObjForReplay(context.config, sourceInfoReplay, partDefinition.sourceDefinition.vo)
		])
	}
}
