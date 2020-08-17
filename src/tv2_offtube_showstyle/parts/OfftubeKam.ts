import {
	BlueprintResultPart,
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	PieceLifespan,
	SourceLayerType,
	TimelineObjectCoreExt,
	TSR
} from 'tv-automation-sofie-blueprints-integration'
import {
	AddParentClass,
	AddScript,
	CameraParentClass,
	CreatePartInvalid,
	CreatePartKamBase,
	FindSourceInfoStrict,
	GetCameraMetaData,
	GetLayersForCamera,
	GetSisyfosTimelineObjForCamera,
	GetTagForKam,
	literal,
	PartContext2,
	PartDefinitionKam,
	TransitionFromString,
	TransitionSettings
} from 'tv2-common'
import { TallyTags } from 'tv2-constants'
import { OfftubeAtemLLayer } from '../../tv2_offtube_studio/layers'
import { OfftubeShowstyleBlueprintConfig } from '../helpers/config'
import { OfftubeEvaluateCues } from '../helpers/EvaluateCues'
import { OfftubeSourceLayer } from '../layers'
import { CreateEffektForpart } from './OfftubeEffekt'

export function OfftubeCreatePartKam(
	context: PartContext2,
	config: OfftubeShowstyleBlueprintConfig,
	partDefinition: PartDefinitionKam,
	totalWords: number
): BlueprintResultPart {
	const partKamBase = CreatePartKamBase(context, config, partDefinition, totalWords)

	let part = partKamBase.part.part
	const partTime = partKamBase.duration

	const adLibPieces: IBlueprintAdLibPiece[] = []
	const pieces: IBlueprintPiece[] = []
	const actions: IBlueprintActionManifest[] = []

	if (partDefinition.rawType.match(/kam cs 3/i)) {
		pieces.push(
			literal<IBlueprintPiece>({
				_id: '',
				externalId: partDefinition.externalId,
				name: 'CS 3 (JINGLE)',
				enable: { start: 0 },
				outputLayerId: 'pgm',
				sourceLayerId: OfftubeSourceLayer.PgmJingle,
				infiniteMode: PieceLifespan.OutOnNextPart,
				tags: [GetTagForKam('JINGLE'), TallyTags.JINGLE_IS_LIVE],
				content: {
					studioLabel: '',
					switcherInput: config.studio.AtemSource.DSK1F,
					timelineObjects: literal<TimelineObjectCoreExt[]>([
						literal<TSR.TimelineObjAtemME>({
							id: ``,
							enable: {
								start: 0
							},
							priority: 1,
							layer: OfftubeAtemLLayer.AtemMEClean,
							content: {
								deviceType: TSR.DeviceType.ATEM,
								type: TSR.TimelineContentTypeAtem.ME,
								me: {
									input: config.studio.AtemSource.DSK1F,
									transition: partDefinition.transition
										? TransitionFromString(partDefinition.transition.style)
										: TSR.AtemTransitionStyle.CUT,
									transitionSettings: TransitionSettings(partDefinition)
								}
							}
						})
					])
				}
			})
		)
	} else {
		const sourceInfoCam = FindSourceInfoStrict(context, config.sources, SourceLayerType.CAMERA, partDefinition.rawType)
		if (sourceInfoCam === undefined) {
			return CreatePartInvalid(partDefinition)
		}
		const atemInput = sourceInfoCam.port

		part = { ...part, ...CreateEffektForpart(context, config, partDefinition, pieces) }

		pieces.push(
			literal<IBlueprintPiece>({
				_id: '',
				externalId: partDefinition.externalId,
				name: part.title,
				enable: { start: 0 },
				outputLayerId: 'pgm',
				sourceLayerId: OfftubeSourceLayer.PgmCam,
				infiniteMode: PieceLifespan.OutOnNextPart,
				metaData: GetCameraMetaData(config, GetLayersForCamera(config, sourceInfoCam)),
				tags: [GetTagForKam(sourceInfoCam.id)],
				content: {
					studioLabel: '',
					switcherInput: atemInput,
					timelineObjects: literal<TimelineObjectCoreExt[]>([
						literal<TSR.TimelineObjAtemME>({
							id: ``,
							enable: {
								start: 0
							},
							priority: 1,
							layer: OfftubeAtemLLayer.AtemMEClean,
							content: {
								deviceType: TSR.DeviceType.ATEM,
								type: TSR.TimelineContentTypeAtem.ME,
								me: {
									input: Number(atemInput),
									transition: partDefinition.transition
										? TransitionFromString(partDefinition.transition.style)
										: TSR.AtemTransitionStyle.CUT,
									transitionSettings: TransitionSettings(partDefinition)
								}
							},
							...(AddParentClass(partDefinition)
								? { classes: [CameraParentClass('studio0', partDefinition.variant.name)] }
								: {})
						}),

						...GetSisyfosTimelineObjForCamera(context, config, partDefinition.rawType)
					])
				}
			})
		)
	}

	OfftubeEvaluateCues(context, config, pieces, adLibPieces, actions, partDefinition.cues, partDefinition, {})

	AddScript(partDefinition, pieces, partTime, OfftubeSourceLayer.PgmScript)

	if (pieces.length === 0) {
		part.invalid = true
	}

	return {
		part,
		adLibPieces,
		pieces
	}
}
