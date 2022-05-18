import {
	BlueprintResultPart,
	HackPartMediaObjectSubscription,
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPart,
	IBlueprintPiece,
	ISegmentUserContext,
	PieceLifespan,
	SourceLayerType,
	TimelineObjectCoreExt,
	TSR
} from '@tv2media/blueprints-integration'
import {
	AddScript,
	CreatePartInvalid,
	EVSParentClass,
	FindSourceInfoStrict,
	GetSisyfosTimelineObjForCamera,
	GetSisyfosTimelineObjForEVS,
	literal,
	PartDefinitionEVS,
	PartTime,
	PieceMetaData,
	SourceInfo,
	TransitionFromString,
	TransitionSettings
} from 'tv2-common'
import { SharedOutputLayers } from 'tv2-constants'
import { AtemLLayer, SisyfosLLAyer } from '../../tv2_afvd_studio/layers'
import { BlueprintConfig } from '../helpers/config'
import { EvaluateCues } from '../helpers/pieces/evaluateCues'
import { SourceLayer } from '../layers'
import { CreateEffektForpart } from './effekt'

export function CreatePartEVS(
	context: ISegmentUserContext,
	config: BlueprintConfig,
	partDefinition: PartDefinitionEVS,
	totalWords: number
): BlueprintResultPart {
	const partTime = PartTime(config, partDefinition, totalWords, false)

	let part = literal<IBlueprintPart>({
		externalId: partDefinition.externalId,
		title: `EVS ${partDefinition.variant.evs} ${partDefinition.variant.vo ?? ''}`,
		metaData: {},
		expectedDuration: partTime > 0 ? partTime : 0
	})

	const adLibPieces: IBlueprintAdLibPiece[] = []
	const pieces: IBlueprintPiece[] = []
	const actions: IBlueprintActionManifest[] = []
	const mediaSubscriptions: HackPartMediaObjectSubscription[] = []

	part = { ...part, ...CreateEffektForpart(context, config, partDefinition, pieces) }

	const sourceInfoDelayedPlayback = FindSourceInfoStrict(
		context,
		config.sources,
		SourceLayerType.LOCAL,
		partDefinition.rawType.replace(/ ?VO/i, '')
	)
	if (sourceInfoDelayedPlayback === undefined) {
		return CreatePartInvalid(partDefinition)
	}
	const atemInput = sourceInfoDelayedPlayback.port

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
			content: makeContentEVS(context, config, atemInput, partDefinition, sourceInfoDelayedPlayback)
		})
	)

	EvaluateCues(
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
	context: ISegmentUserContext,
	config: BlueprintConfig,
	atemInput: number,
	partDefinition: PartDefinitionEVS,
	sourceInfoDelayedPlayback: SourceInfo
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
						transition: partDefinition.transition
							? TransitionFromString(partDefinition.transition.style)
							: TSR.AtemTransitionStyle.CUT,
						transitionSettings: TransitionSettings(partDefinition)
					}
				},
				classes: [EVSParentClass('studio0', partDefinition.variant.evs)]
			}),
			GetSisyfosTimelineObjForEVS(sourceInfoDelayedPlayback, !!partDefinition.variant.vo),
			...(partDefinition.variant.vo
				? [GetSisyfosTimelineObjForCamera(context, config, 'evs', SisyfosLLAyer.SisyfosGroupStudioMics)]
				: [])
		])
	}
}
