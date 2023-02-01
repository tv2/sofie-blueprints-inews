import {
	BlueprintResultPart,
	HackPartMediaObjectSubscription,
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	PieceLifespan,
	TimelineObjectCoreExt,
	TSR,
	VTContent,
	WithTimeline
} from 'blueprints-integration'
import {
	AddScript,
	CreatePartInvalid,
	CreatePartKamBase,
	ExtendedSegmentContext,
	FindDSKJingle,
	findSourceInfo,
	GetSisyfosTimelineObjForCamera,
	GetTagForKam,
	literal,
	PartDefinitionKam,
	PieceMetaData,
	TransitionSettings
} from 'tv2-common'
import { SharedOutputLayers, TallyTags } from 'tv2-constants'
import { OfftubeAtemLLayer } from '../../tv2_offtube_studio/layers'
import { OfftubeBlueprintConfig } from '../helpers/config'
import { OfftubeEvaluateCues } from '../helpers/EvaluateCues'
import { OfftubeSourceLayer } from '../layers'
import { CreateEffektForpart } from './OfftubeEffekt'

export async function OfftubeCreatePartKam(
	context: ExtendedSegmentContext<OfftubeBlueprintConfig>,
	partDefinition: PartDefinitionKam,
	totalWords: number
): Promise<BlueprintResultPart> {
	const partKamBase = CreatePartKamBase(context, partDefinition, totalWords)

	let part = partKamBase.part.part
	const partTime = partKamBase.duration

	const adLibPieces: IBlueprintAdLibPiece[] = []
	const pieces: Array<IBlueprintPiece<PieceMetaData>> = []
	const actions: IBlueprintActionManifest[] = []
	const mediaSubscriptions: HackPartMediaObjectSubscription[] = []

	const jingleDSK = FindDSKJingle(context.config)

	if (/\bcs *\d*/i.test(partDefinition.sourceDefinition.id)) {
		pieces.push({
			externalId: partDefinition.externalId,
			name: 'CS 3 (JINGLE)',
			enable: { start: 0 },
			outputLayerId: SharedOutputLayers.PGM,
			sourceLayerId: OfftubeSourceLayer.PgmJingle,
			lifespan: PieceLifespan.WithinPart,
			tags: [GetTagForKam(partDefinition.sourceDefinition), TallyTags.JINGLE_IS_LIVE],
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
								transition: partDefinition.transition ? partDefinition.transition.style : TSR.AtemTransitionStyle.CUT,
								transitionSettings: TransitionSettings(context.config, partDefinition)
							}
						}
					})
				])
			})
		})
	} else {
		const sourceInfoCam = findSourceInfo(context.config.sources, partDefinition.sourceDefinition)
		if (sourceInfoCam === undefined) {
			return CreatePartInvalid(partDefinition)
		}
		const atemInput = sourceInfoCam.port

		part = { ...part, ...CreateEffektForpart(context, partDefinition, pieces) }

		pieces.push({
			externalId: partDefinition.externalId,
			name: part.title,
			enable: { start: 0 },
			outputLayerId: SharedOutputLayers.PGM,
			sourceLayerId: OfftubeSourceLayer.PgmCam,
			lifespan: PieceLifespan.WithinPart,
			metaData: {
				sisyfosPersistMetaData: {
					sisyfosLayers: sourceInfoCam.sisyfosLayers ?? [],
					acceptPersistAudio: sourceInfoCam.acceptPersistAudio
				}
			},
			tags: [GetTagForKam(partDefinition.sourceDefinition)],
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
								transition: partDefinition.transition ? partDefinition.transition.style : TSR.AtemTransitionStyle.CUT,
								transitionSettings: TransitionSettings(context.config, partDefinition)
							}
						}
					}),

					...GetSisyfosTimelineObjForCamera(context.config, sourceInfoCam, partDefinition.sourceDefinition.minusMic)
				])
			}
		})
	}

	await OfftubeEvaluateCues(
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
