import {
	BlueprintResultPart,
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPart,
	IBlueprintPiece,
	PieceLifespan,
	SourceLayerType,
	TimelineObjectCoreExt,
	TSR
} from 'tv-automation-sofie-blueprints-integration'
import {
	AddScript,
	CreatePartInvalid,
	EVSParentClass,
	FindSourceInfoStrict,
	GetSisyfosTimelineObjForCamera,
	GetSisyfosTimelineObjForEVS,
	literal,
	PartContext2,
	PartDefinitionEVS,
	PartTime,
	SourceInfo,
	TimelineBlueprintExt,
	TransitionFromString,
	TransitionSettings
} from 'tv2-common'
import { AtemLLayer, SisyfosLLAyer } from '../../tv2_afvd_studio/layers'
import { BlueprintConfig } from '../helpers/config'
import { EvaluateCues } from '../helpers/pieces/evaluateCues'
import { SourceLayer } from '../layers'
import { CreateEffektForpart } from './effekt'

export function CreatePartEVS(
	context: PartContext2,
	config: BlueprintConfig,
	partDefinition: PartDefinitionEVS,
	totalWords: number
): BlueprintResultPart {
	const partTime = PartTime(config, partDefinition, totalWords, false)

	let part = literal<IBlueprintPart>({
		externalId: partDefinition.externalId,
		title: partDefinition.rawType,
		metaData: {},
		expectedDuration: partTime > 0 ? partTime : 0
	})

	const adLibPieces: IBlueprintAdLibPiece[] = []
	const pieces: IBlueprintPiece[] = []
	const actions: IBlueprintActionManifest[] = []

	part = { ...part, ...CreateEffektForpart(context, config, partDefinition, pieces) }

	const sourceInfoDelayedPlayback = FindSourceInfoStrict(
		context,
		config.sources,
		SourceLayerType.REMOTE,
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
			outputLayerId: 'pgm',
			sourceLayerId: SourceLayer.PgmLive,
			lifespan: PieceLifespan.WithinPart,
			content: makeContentEVS(context, config, atemInput, partDefinition, sourceInfoDelayedPlayback)
		})
	)

	EvaluateCues(context, config, pieces, adLibPieces, actions, partDefinition.cues, partDefinition, {})
	AddScript(partDefinition, pieces, partTime, SourceLayer.PgmScript)

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
	context: PartContext2,
	config: BlueprintConfig,
	atemInput: number,
	partDefinition: PartDefinitionEVS,
	sourceInfoDelayedPlayback: SourceInfo
): IBlueprintPiece['content'] {
	return {
		studioLabel: '',
		switcherInput: atemInput,
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
			GetSisyfosTimelineObjForEVS(sourceInfoDelayedPlayback, partDefinition.variant.isVO),
			...(partDefinition.variant.isVO
				? [GetSisyfosTimelineObjForCamera(context, config, 'evs', SisyfosLLAyer.SisyfosGroupStudioMics)]
				: [
						literal<TSR.TimelineObjSisyfosChannels & TimelineBlueprintExt>({
							id: '',
							enable: {
								start: 0
							},
							priority: 1,
							layer: SisyfosLLAyer.SisyfosPersistedLevels,
							content: {
								deviceType: TSR.DeviceType.SISYFOS,
								type: TSR.TimelineContentTypeSisyfos.CHANNELS,
								overridePriority: 1,
								channels: config.liveAudio.map(layer => {
									return literal<TSR.TimelineObjSisyfosChannels['content']['channels'][0]>({
										mappedLayer: layer,
										isPgm: 0
									})
								})
							},
							metaData: {
								sisyfosPersistLevel: true
							}
						})
				  ])
		])
	}
}
