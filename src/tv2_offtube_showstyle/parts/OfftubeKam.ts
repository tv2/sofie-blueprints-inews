import {
	BlueprintResultPart,
	IBlueprintAdLibPiece,
	IBlueprintPart,
	IBlueprintPiece,
	PartContext,
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
	FindSourceInfoStrict,
	GetCameraMetaData,
	GetLayersForCamera,
	GetSisyfosTimelineObjForCamera,
	literal,
	PartDefinitionKam,
	PartTime,
	TransitionFromString,
	TransitionSettings
} from 'tv2-common'
import { OfftubeAtemLLayer } from '../../tv2_offtube_studio/layers'
import { OffTubeShowstyleBlueprintConfig } from '../helpers/config'
import { OfftubeEvaluateCues } from '../helpers/EvaluateCues'
import { OffTubeSourceLayer } from '../layers'

export function OfftubeCreatePartKam(
	context: PartContext,
	config: OffTubeShowstyleBlueprintConfig,
	partDefinition: PartDefinitionKam,
	totalWords: number
): BlueprintResultPart {
	const partTime = PartTime(config, partDefinition, totalWords, false)

	const part = literal<IBlueprintPart>({
		externalId: partDefinition.externalId,
		title: partDefinition.rawType,
		metaData: {},
		typeVariant: '',
		expectedDuration: partTime > 0 ? partTime : undefined
	})

	const adLibPieces: IBlueprintAdLibPiece[] = []
	const pieces: IBlueprintPiece[] = []

	if (partDefinition.rawType.match(/kam cs 3/i)) {
		pieces.push(
			literal<IBlueprintPiece>({
				_id: '',
				externalId: partDefinition.externalId,
				name: 'CS 3 (JINGLE)',
				enable: { start: 0 },
				outputLayerId: 'pgm',
				sourceLayerId: OffTubeSourceLayer.PgmJingle,
				infiniteMode: PieceLifespan.OutOnNextPart,
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

		// part = { ...part, ...CreateEffektForpart(context, config, partDefinition, pieces) }
		// TODO: EFFEKT

		pieces.push(
			literal<IBlueprintPiece>({
				_id: '',
				externalId: partDefinition.externalId,
				name: part.title,
				enable: { start: 0 },
				outputLayerId: 'pgm',
				sourceLayerId: OffTubeSourceLayer.PgmCam,
				infiniteMode: PieceLifespan.OutOnNextPart,
				metaData: GetCameraMetaData(config, GetLayersForCamera(config, sourceInfoCam)),
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
							layer: OfftubeAtemLLayer.AtemMEProgram,
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

	OfftubeEvaluateCues(context, config, pieces, adLibPieces, partDefinition.cues, partDefinition, {})

	AddScript(partDefinition, pieces, partTime, OffTubeSourceLayer.PgmScript)

	if (pieces.length === 0) {
		part.invalid = true
	}

	return {
		part,
		adLibPieces,
		pieces
	}
}
