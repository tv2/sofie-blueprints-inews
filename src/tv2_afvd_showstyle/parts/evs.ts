import {
	BlueprintResultPart,
	HackPartMediaObjectSubscription,
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPart,
	IBlueprintPiece,
	PieceLifespan,
	TimelineObjectCoreExt,
	TSR
} from 'blueprints-integration'
import {
	AddScript,
	CreatePartInvalid,
	ExtendedSegmentContext,
	ExtendedShowStyleContext,
	findSourceInfo,
	GetSisyfosTimelineObjForReplay,
	literal,
	PartDefinitionEVS,
	PartTime,
	PieceMetaData,
	SourceInfo,
	TransitionSettings
} from 'tv2-common'
import { SharedOutputLayers } from 'tv2-constants'
import { AtemLLayer } from '../../tv2_afvd_studio/layers'
import { GalleryBlueprintConfig } from '../helpers/config'
import { EvaluateCues } from '../helpers/pieces/evaluateCues'
import { SourceLayer } from '../layers'
import { CreateEffektForpart } from './effekt'

export async function CreatePartEVS(
	context: ExtendedSegmentContext<GalleryBlueprintConfig>,
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
	const atemInput = sourceInfoReplay.port

	pieces.push({
		externalId: partDefinition.externalId,
		name: part.title,
		enable: { start: 0 },
		outputLayerId: SharedOutputLayers.PGM,
		sourceLayerId: SourceLayer.PgmLocal,
		lifespan: PieceLifespan.WithinPart,
		metaData: {
			sisyfosPersistMetaData: {
				sisyfosLayers: []
			}
		},
		content: makeContentEVS(context, atemInput, partDefinition, sourceInfoReplay)
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
	context: ExtendedShowStyleContext<GalleryBlueprintConfig>,
	atemInput: number,
	partDefinition: PartDefinitionEVS,
	sourceInfoReplay: SourceInfo
): IBlueprintPiece['content'] {
	return {
		studioLabel: '',
		switcherInput: atemInput,
		ignoreMediaObjectStatus: true,
		timelineObjects: literal<TimelineObjectCoreExt[]>([
			literal<TSR.TimelineObjAtemME>({
				id: ``,
				enable: {
					start: 0
				},
				priority: 1,
				layer: AtemLLayer.AtemMEProgram,
				content: {
					deviceType: TSR.DeviceType.ATEM,
					type: TSR.TimelineContentTypeAtem.ME,
					me: {
						input: atemInput,
						transition: partDefinition.transition ? partDefinition.transition.style : TSR.AtemTransitionStyle.CUT,
						transitionSettings: TransitionSettings(context.config, partDefinition)
					}
				}
			}),
			...GetSisyfosTimelineObjForReplay(context.config, sourceInfoReplay, partDefinition.sourceDefinition.vo)
		])
	}
}
