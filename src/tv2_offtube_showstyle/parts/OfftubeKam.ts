import {
	BlueprintResultPart,
	HackPartMediaObjectSubscription,
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	ISegmentUserContext,
	PieceLifespan,
	SourceLayerType,
	TimelineObjectCoreExt,
	TSR,
	VTContent,
	WithTimeline
} from '@tv2media/blueprints-integration'
import {
	AddParentClass,
	AddScript,
	CameraParentClass,
	CreatePartInvalid,
	CreatePartKamBase,
	FindDSKJingle,
	FindSourceInfoStrict,
	GetCameraMetaData,
	GetLayersForCamera,
	GetSisyfosTimelineObjForCamera,
	GetTagForKam,
	literal,
	PartDefinitionKam,
	TransitionFromString,
	TransitionSettings
} from 'tv2-common'
import { SharedOutputLayers, TallyTags } from 'tv2-constants'
import { OfftubeAtemLLayer, OfftubeSisyfosLLayer } from '../../tv2_offtube_studio/layers'
import { OfftubeShowstyleBlueprintConfig } from '../helpers/config'
import { OfftubeEvaluateCues } from '../helpers/EvaluateCues'
import { OfftubeSourceLayer } from '../layers'
import { CreateEffektForpart } from './OfftubeEffekt'

export function OfftubeCreatePartKam(
	context: ISegmentUserContext,
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
	const mediaSubscriptions: HackPartMediaObjectSubscription[] = []

	const jingleDSK = FindDSKJingle(config)

	if (partDefinition.rawType.match(/kam cs ?3/i)) {
		pieces.push(
			literal<IBlueprintPiece>({
				externalId: partDefinition.externalId,
				name: 'CS 3 (JINGLE)',
				enable: { start: 0 },
				outputLayerId: SharedOutputLayers.PGM,
				sourceLayerId: OfftubeSourceLayer.PgmJingle,
				lifespan: PieceLifespan.WithinPart,
				tags: [GetTagForKam('JINGLE'), TallyTags.JINGLE_IS_LIVE],
				content: literal<WithTimeline<VTContent>>({
					ignoreMediaObjectStatus: true,
					fileName: '',
					path: '',
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
									input: jingleDSK.Fill,
									transition: partDefinition.transition
										? TransitionFromString(partDefinition.transition.style)
										: TSR.AtemTransitionStyle.CUT,
									transitionSettings: TransitionSettings(partDefinition)
								}
							}
						})
					])
				})
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
				externalId: partDefinition.externalId,
				name: part.title,
				enable: { start: 0 },
				outputLayerId: SharedOutputLayers.PGM,
				sourceLayerId: OfftubeSourceLayer.PgmCam,
				lifespan: PieceLifespan.WithinPart,
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
							...(AddParentClass(config, partDefinition)
								? { classes: [CameraParentClass('studio0', partDefinition.variant.name)] }
								: {})
						}),

						GetSisyfosTimelineObjForCamera(
							context,
							config,
							partDefinition.rawType,
							OfftubeSisyfosLLayer.SisyfosGroupStudioMics
						)
					])
				}
			})
		)
	}

	OfftubeEvaluateCues(
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

	AddScript(partDefinition, pieces, partTime, OfftubeSourceLayer.PgmScript)

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
