import {
	BlueprintResultPart,
	HackPartMediaObjectSubscription,
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPart,
	IBlueprintPiece,
	ISegmentUserContext,
	PieceLifespan,
	TimelineObjectCoreExt,
	TSR
} from '@tv2media/blueprints-integration'
import {
	AddScript,
	CreatePartInvalid,
	EVSParentClass,
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
import { BlueprintConfig } from '../helpers/config'
import { EvaluateCues } from '../helpers/pieces/evaluateCues'
import { SourceLayer } from '../layers'
import { CreateEffektForpart } from './effekt'

export async function CreatePartEVS(
	context: ISegmentUserContext,
	config: BlueprintConfig,
	partDefinition: PartDefinitionEVS,
	totalWords: number
): Promise<BlueprintResultPart> {
	const partTime = PartTime(config, partDefinition, totalWords, false)
	const title = partDefinition.sourceDefinition.name

	let part = literal<IBlueprintPart>({
		externalId: partDefinition.externalId,
		title,
		metaData: {},
		expectedDuration: partTime > 0 ? partTime : 0
	})

	const adLibPieces: IBlueprintAdLibPiece[] = []
	const pieces: IBlueprintPiece[] = []
	const actions: IBlueprintActionManifest[] = []
	const mediaSubscriptions: HackPartMediaObjectSubscription[] = []

	part = { ...part, ...CreateEffektForpart(context, config, partDefinition, pieces) }

	const sourceInfoReplay = findSourceInfo(config.sources, partDefinition.sourceDefinition)
	if (sourceInfoReplay === undefined) {
		return CreatePartInvalid(partDefinition)
	}
	const atemInput = sourceInfoReplay.port

	pieces.push(
		literal<IBlueprintPiece>({
			externalId: partDefinition.externalId,
			name: part.title,
			enable: { start: 0 },
			outputLayerId: SharedOutputLayers.PGM,
			sourceLayerId: SourceLayer.PgmLocal,
			lifespan: PieceLifespan.WithinPart,
			metaData: literal<PieceMetaData>({
				sisyfosPersistMetaData: {
					sisyfosLayers: []
				}
			}),
			content: makeContentEVS(config, atemInput, partDefinition, sourceInfoReplay)
		})
	)

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
	config: BlueprintConfig,
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
						transitionSettings: TransitionSettings(config, partDefinition)
					}
				},
				classes: [EVSParentClass('studio0', partDefinition.sourceDefinition.id)]
			}),
			...GetSisyfosTimelineObjForReplay(config, sourceInfoReplay, partDefinition.sourceDefinition.vo)
		])
	}
}
