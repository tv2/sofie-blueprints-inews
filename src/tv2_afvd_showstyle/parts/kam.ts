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
	ExtendedSegmentContext,
	FindDSKJingle,
	findSourceInfo,
	GetSisyfosTimelineObjForCamera,
	literal,
	PartDefinitionKam,
	PieceMetaData,
	TimeFromINewsField,
	TransitionStyle
} from 'tv2-common'
import { SharedOutputLayers } from 'tv2-constants'
import { GalleryBlueprintConfig } from '../helpers/config'
import { EvaluateCues } from '../helpers/pieces/evaluateCues'
import { SourceLayer } from '../layers'
import { CreateEffektForpart } from './effekt'

export async function CreatePartKam(
	context: ExtendedSegmentContext<GalleryBlueprintConfig>,
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
			sourceLayerId: SourceLayer.PgmJingle,
			lifespan: PieceLifespan.WithinPart,
			metaData: {
				sisyfosPersistMetaData: {
					sisyfosLayers: []
				}
			},
			content: literal<WithTimeline<VTContent>>({
				ignoreMediaObjectStatus: true,
				fileName: '',
				path: '',
				timelineObjects: [
					...context.videoSwitcher.getOnAirTimelineObjects({
						priority: 1,
						content: {
							input: jingleDSK.Fill,
							transition: partDefinition.transition?.style ?? TransitionStyle.CUT,
							transitionDuration: partDefinition.transition?.duration
						}
					})
				]
			})
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
			outputLayerId: SharedOutputLayers.PGM,
			sourceLayerId: SourceLayer.PgmCam,
			lifespan: PieceLifespan.WithinPart,
			metaData: {
				sisyfosPersistMetaData: {
					sisyfosLayers: sourceInfoCam.sisyfosLayers ?? [],
					acceptPersistAudio: sourceInfoCam.acceptPersistAudio
				}
			},
			content: {
				studioLabel: '',
				switcherInput,
				timelineObjects: [
					...context.videoSwitcher.getOnAirTimelineObjects({
						priority: 1,
						content: {
							input: Number(switcherInput),
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
