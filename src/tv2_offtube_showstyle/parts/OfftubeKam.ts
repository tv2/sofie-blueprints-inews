import {
	BlueprintResultPart,
	HackPartMediaObjectSubscription,
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	PieceLifespan,
	VTContent,
	WithTimeline
} from 'blueprints-integration'
import {
	AddScript,
	CreatePartInvalid,
	CreatePartKamBase,
	findDskJingle,
	findSourceInfo,
	GetSisyfosTimelineObjForCamera,
	GetTagForKam,
	literal,
	PartDefinitionKam,
	PieceMetaData,
	SegmentContext,
	TransitionStyle
} from 'tv2-common'
import { SharedOutputLayer, TallyTags } from 'tv2-constants'
import { Tv2OutputLayer } from '../../tv2-constants/tv2-output-layer'
import { PlayoutContentType } from '../../tv2-constants/tv2-playout-content'
import { OfftubeBlueprintConfig } from '../helpers/config'
import { OfftubeEvaluateCues } from '../helpers/EvaluateCues'
import { OfftubeSourceLayer } from '../layers'
import { CreateEffektForpart } from './OfftubeEffekt'

export async function OfftubeCreatePartKam(
	context: SegmentContext<OfftubeBlueprintConfig>,
	partDefinition: PartDefinitionKam,
	partIndex: number,
	totalWords: number
): Promise<BlueprintResultPart> {
	const partKamBase = CreatePartKamBase(context, partDefinition, totalWords)

	let part = partKamBase.part.part
	const partTime = partKamBase.duration

	const adLibPieces: IBlueprintAdLibPiece[] = []
	const pieces: Array<IBlueprintPiece<PieceMetaData>> = []
	const actions: IBlueprintActionManifest[] = []
	const mediaSubscriptions: HackPartMediaObjectSubscription[] = []

	const jingleDsk = findDskJingle(context.config)

	if (/\bcs *\d*/i.test(partDefinition.sourceDefinition.id)) {
		pieces.push({
			externalId: partDefinition.externalId,
			name: 'CS 3 (JINGLE)',
			enable: { start: 0 },
			outputLayerId: SharedOutputLayer.PGM,
			sourceLayerId: OfftubeSourceLayer.PgmJingle,
			lifespan: PieceLifespan.WithinPart,
			tags: [GetTagForKam(partDefinition.sourceDefinition), TallyTags.JINGLE_IS_LIVE],
			content: literal<WithTimeline<VTContent>>({
				ignoreMediaObjectStatus: true,
				fileName: '',
				path: '',
				timelineObjects: context.videoSwitcher.getOnAirTimelineObjectsWithLookahead({
					priority: 1,
					content: {
						input: jingleDsk.Fill,
						transition: partDefinition.transition?.style ?? TransitionStyle.CUT,
						transitionDuration: partDefinition.transition?.duration
					}
				})
			}),
			metaData: {
				playoutContent: {
					type: PlayoutContentType.JINGLE
				},
				outputLayer: Tv2OutputLayer.PROGRAM
			}
		})
	} else {
		const sourceInfoCam = findSourceInfo(context.config.sources, partDefinition.sourceDefinition)
		if (sourceInfoCam === undefined) {
			return CreatePartInvalid(partDefinition, {
				reason: `No configuration found for the camera source '${partDefinition.rawType}'.`
			})
		}
		const switcherInput = sourceInfoCam.port

		part = { ...part, ...CreateEffektForpart(context, partDefinition, pieces) }

		pieces.push({
			externalId: partDefinition.externalId,
			name: part.title,
			enable: { start: 0 },
			outputLayerId: SharedOutputLayer.PGM,
			sourceLayerId: OfftubeSourceLayer.PgmCam,
			lifespan: PieceLifespan.WithinPart,
			metaData: {
				playoutContent: {
					type: PlayoutContentType.CAMERA,
					source: sourceInfoCam.id
				},
				outputLayer: Tv2OutputLayer.PROGRAM,
				sisyfosPersistMetaData: {
					sisyfosLayers: sourceInfoCam.sisyfosLayers ?? [],
					acceptsPersistedAudio: sourceInfoCam.acceptPersistAudio
				}
			},
			tags: [GetTagForKam(partDefinition.sourceDefinition)],
			content: {
				studioLabel: '',
				switcherInput,
				timelineObjects: [
					...context.videoSwitcher.getOnAirTimelineObjectsWithLookahead({
						priority: 1,
						content: {
							input: switcherInput,
							transition: partDefinition.transition?.style ?? TransitionStyle.CUT,
							transitionDuration: partDefinition.transition?.duration
						}
					}),
					...GetSisyfosTimelineObjForCamera(context.config, sourceInfoCam, partDefinition.sourceDefinition.minusMic)
				]
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
		partIndex,
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
