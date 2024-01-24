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
	literal,
	PartDefinitionKam,
	PieceMetaData,
	SegmentContext,
	TimeFromINewsField,
	TransitionStyle
} from 'tv2-common'
import { SharedOutputLayer } from 'tv2-constants'
import { Tv2OutputLayer } from '../../tv2-constants/tv2-output-layer'
import { Tv2PieceType } from '../../tv2-constants/tv2-piece-type'
import { GalleryBlueprintConfig } from '../helpers/config'
import { EvaluateCues } from '../helpers/pieces/evaluateCues'
import { SourceLayer } from '../layers'
import { CreateEffektForpart } from './effekt'

export async function CreatePartKam(
	context: SegmentContext<GalleryBlueprintConfig>,
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

	const jingleDsk = findDskJingle(context.config)

	if (/\bcs *\d*/i.test(partDefinition.sourceDefinition.id)) {
		pieces.push({
			externalId: partDefinition.externalId,
			name: 'CS 3 (JINGLE)',
			enable: { start: 0 },
			outputLayerId: SharedOutputLayer.PGM,
			sourceLayerId: SourceLayer.PgmJingle,
			lifespan: PieceLifespan.WithinPart,
			content: literal<WithTimeline<VTContent>>({
				ignoreMediaObjectStatus: true,
				fileName: '',
				path: '',
				timelineObjects: [
					...context.videoSwitcher.getOnAirTimelineObjectsWithLookahead({
						priority: 1,
						content: {
							input: jingleDsk.Fill,
							transition: partDefinition.transition?.style ?? TransitionStyle.CUT,
							transitionDuration: partDefinition.transition?.duration
						}
					})
				]
			}),
			metaData: {
				type: Tv2PieceType.JINGLE,
				outputLayer: Tv2OutputLayer.PROGRAM
			}
		})
		part.expectedDuration = TimeFromINewsField(partDefinition.fields.totalTime) * 1000
	} else {
		const sourceInfoCam = findSourceInfo(context.config.sources, partDefinition.sourceDefinition)
		if (sourceInfoCam === undefined) {
			context.core.notifyUserWarning(`${partDefinition.rawType} does not exist in this studio`)
			return CreatePartInvalid(partDefinition)
		}
		const switcherInput = sourceInfoCam.port

		part = { ...part, ...CreateEffektForpart(context, partDefinition, pieces) }

		pieces.push({
			externalId: partDefinition.externalId,
			name: part.title,
			enable: { start: 0 },
			outputLayerId: SharedOutputLayer.PGM,
			sourceLayerId: SourceLayer.PgmCam,
			lifespan: PieceLifespan.WithinPart,
			metaData: {
				type: Tv2PieceType.CAMERA,
				outputLayer: Tv2OutputLayer.PROGRAM,
				sisyfosPersistMetaData: {
					sisyfosLayers: sourceInfoCam.sisyfosLayers ?? [],
					acceptsPersistedAudio: sourceInfoCam.acceptPersistAudio
				}
			},
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

	await EvaluateCues(
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
