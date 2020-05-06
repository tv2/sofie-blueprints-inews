import {
	AtemTransitionStyle,
	DeviceType,
	TimelineContentTypeAtem,
	TimelineContentTypeSisyfos,
	TimelineObjAtemME,
	TimelineObjSisyfosAny,
	TimelineObjSisyfosMessage
} from 'timeline-state-resolver-types'
import {
	BlueprintResultPart,
	IBlueprintAdLibPiece,
	IBlueprintPart,
	IBlueprintPiece,
	PartContext,
	PieceLifespan,
	SourceLayerType,
	TimelineObjectCoreExt
} from 'tv-automation-sofie-blueprints-integration'
import {
	CreatePartInvalid,
	EVSParentClass,
	FindSourceInfoStrict,
	GetSisyfosTimelineObjForCamera,
	literal,
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
import { AddScript } from '../helpers/pieces/script'
import { SourceLayer } from '../layers'
import { CreateEffektForpart } from './effekt'

export function CreatePartEVS(
	context: PartContext,
	config: BlueprintConfig,
	partDefinition: PartDefinitionEVS,
	totalWords: number,
	reservedTime: number
): BlueprintResultPart {
	const partTime = PartTime(config, partDefinition, totalWords, reservedTime)

	let part = literal<IBlueprintPart>({
		externalId: partDefinition.externalId,
		title: partDefinition.rawType,
		metaData: {},
		typeVariant: '',
		expectedDuration: partTime > 0 ? partTime : undefined
	})

	const adLibPieces: IBlueprintAdLibPiece[] = []
	const pieces: IBlueprintPiece[] = []

	part = { ...part, ...CreateEffektForpart(context, config, partDefinition, pieces) }

	const sourceInfoDelayedPlayback = FindSourceInfoStrict(
		context,
		config.sources,
		SourceLayerType.REMOTE,
		partDefinition.rawType
	)
	if (sourceInfoDelayedPlayback === undefined) {
		return CreatePartInvalid(partDefinition)
	}
	const atemInput = sourceInfoDelayedPlayback.port

	/*config.showStyle.IsOfftube*/
	if ([].length === 999) {
		adLibPieces.push(
			literal<IBlueprintAdLibPiece>({
				_rank: 0,
				externalId: partDefinition.externalId,
				name: part.title,
				outputLayerId: 'pgm',
				sourceLayerId: SourceLayer.PgmLive,
				infiniteMode: PieceLifespan.OutOnNextPart,
				toBeQueued: true,
				content: makeContentEVS(context, config, atemInput, partDefinition, sourceInfoDelayedPlayback)
			})
		)
	} else {
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
	}

	EvaluateCues(context, config, pieces, adLibPieces, partDefinition.cues, partDefinition, {})
	AddScript(partDefinition, pieces, partTime)

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
	context: PartContext,
	config: BlueprintConfig,
	atemInput: number,
	partDefinition: PartDefinitionEVS,
	sourceInfoDelayedPlayback: SourceInfo
): IBlueprintPiece['content'] {
	return {
		studioLabel: '',
		switcherInput: atemInput,
		timelineObjects: literal<TimelineObjectCoreExt[]>([
			literal<TimelineObjAtemME>({
				id: ``,
				enable: {
					start: 0
				},
				priority: 1,
				layer: AtemLLayer.AtemMEProgram,
				content: {
					deviceType: DeviceType.ATEM,
					type: TimelineContentTypeAtem.ME,
					me: {
						input: atemInput,
						transition: partDefinition.transition
							? TransitionFromString(partDefinition.transition.style)
							: AtemTransitionStyle.CUT,
						transitionSettings: TransitionSettings(partDefinition)
					}
				},
				classes: [EVSParentClass('studio0', partDefinition.variant.evs)]
			}),
			literal<TimelineObjSisyfosMessage>({
				id: '',
				enable: {
					start: 0
				},
				priority: 1,
				layer: SisyfosEVSSource(sourceInfoDelayedPlayback.id.replace(/^DP/i, '')),
				content: {
					deviceType: DeviceType.SISYFOS,
					type: TimelineContentTypeSisyfos.SISYFOS,
					isPgm: partDefinition.variant.isVO ? 2 : 1
				}
			}),
			...(partDefinition.variant.isVO
				? [...GetSisyfosTimelineObjForCamera(context, config, 'evs')]
				: [
						...config.liveAudio.map<TimelineObjSisyfosAny & TimelineBlueprintExt>(layer => {
							return literal<TimelineObjSisyfosAny & TimelineBlueprintExt>({
								id: '',
								enable: {
									start: 0
								},
								priority: 1,
								layer,
								content: {
									deviceType: DeviceType.SISYFOS,
									type: TimelineContentTypeSisyfos.SISYFOS,
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
