import {
	BlueprintResultPart,
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
	literal,
	PartContext2,
	PartDefinitionEVS,
	PartTime,
	SourceInfo,
	TimelineBlueprintExt,
	TransitionFromString,
	TransitionSettings
} from 'tv2-common'
import { AtemLLayer, SisyfosEVSSource } from '../../tv2_afvd_studio/layers'
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
			_id: '',
			externalId: partDefinition.externalId,
			name: part.title,
			enable: { start: 0 },
			outputLayerId: 'pgm',
			sourceLayerId: SourceLayer.PgmLive,
			infiniteMode: PieceLifespan.OutOnNextPart,
			content: makeContentEVS(context, config, atemInput, partDefinition, sourceInfoDelayedPlayback)
		})
	)

	EvaluateCues(context, config, pieces, adLibPieces, partDefinition.cues, partDefinition, {})
	AddScript(partDefinition, pieces, partTime, SourceLayer.PgmScript)

	if (pieces.length === 0) {
		part.invalid = true
	}

	return {
		part,
		adLibPieces,
		pieces
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
			literal<TSR.TimelineObjSisyfosChannel>({
				id: '',
				enable: {
					start: 0
				},
				priority: 1,
				layer: SisyfosEVSSource(sourceInfoDelayedPlayback.id.replace(/^DP/i, '')),
				content: {
					deviceType: TSR.DeviceType.SISYFOS,
					type: TSR.TimelineContentTypeSisyfos.CHANNEL,
					isPgm: partDefinition.variant.isVO ? 2 : 1
				}
			}),
			...(partDefinition.variant.isVO
				? [...GetSisyfosTimelineObjForCamera(context, config, 'evs')]
				: [
						...config.liveAudio.map<TSR.TimelineObjSisyfosChannel & TimelineBlueprintExt>(layer => {
							return literal<TSR.TimelineObjSisyfosChannel & TimelineBlueprintExt>({
								id: '',
								enable: {
									start: 0
								},
								priority: 1,
								layer,
								content: {
									deviceType: TSR.DeviceType.SISYFOS,
									type: TSR.TimelineContentTypeSisyfos.CHANNEL,
									isPgm: 0
								},
								metaData: {
									sisyfosPersistLevel: true
								}
							})
						})
				  ])
		])
	}
}
