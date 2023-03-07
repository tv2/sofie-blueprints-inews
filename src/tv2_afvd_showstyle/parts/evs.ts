import {
	BlueprintResultPart,
	HackPartMediaObjectSubscription,
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPart,
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
	PartDefinitionEVS,
	PartTime,
	PieceMetaData,
	SegmentContext,
	ShowStyleContext,
	SourceInfo,
	TransitionStyle
} from 'tv2-common'
import { SharedOutputLayer } from 'tv2-constants'
import { GalleryBlueprintConfig } from '../helpers/config'
import { EvaluateCues } from '../helpers/pieces/evaluateCues'
import { SourceLayer } from '../layers'
import { CreateEffektForpart } from './effekt'

export async function CreatePartEVS(
	context: SegmentContext<GalleryBlueprintConfig>,
	partDefinition: PartDefinitionEVS,
	totalWords: number
): Promise<BlueprintResultPart> {
	const partTime = PartTime(context.config, partDefinition, totalWords, false)
	const title = partDefinition.sourceDefinition.name

	let part: IBlueprintPart = {
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
		return CreatePartInvalid(partDefinition)
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
		{}
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
			...context.videoSwitcher.getOnAirTimelineObjects({
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
