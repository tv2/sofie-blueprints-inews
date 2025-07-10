import {
	BlueprintResultPart,
	HackPartMediaObjectSubscription,
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	PieceLifespan
} from 'blueprints-integration'
import {
	AddScript,
	CreatePartInvalid,
	// CreatePartServerBase,
	CreatePartKamBase,
	findCameraSourceForVoss,
	GetSisyfosTimelineObjForCamera,
	Part,
	PartDefinitionVOSS,
	PieceMetaData,
	SegmentContext,
	// ServerPartProps,
	TransitionStyle
} from 'tv2-common'
import { SharedOutputLayer } from 'tv2-constants'
import { Tv2OutputLayer } from '../../tv2-constants/tv2-output-layer'
import { PlayoutContentType } from '../../tv2-constants/tv2-playout-content'
import { GalleryBlueprintConfig } from '../helpers/config'
import { SourceLayer } from '../layers'
import { CreateEffektForpart } from './effekt'
import { EvaluateCues } from '../helpers/pieces/evaluateCues'
// import { CasparLLayer, SisyfosLLAyer } from 'src/tv2_afvd_studio/layers'

export async function CreatePartVOSS(
	context: SegmentContext<GalleryBlueprintConfig>,
	partDefinition: PartDefinitionVOSS,
	partIndex: number,
	totalWords: number,
	// partProps: ServerPartProps
): Promise<BlueprintResultPart> {
	return makePartWithCamera(context, partDefinition, partIndex, totalWords)
	// const vo = await makeVoiceOver(context, partDefinition, partIndex, partProps)

	// return {
	// 	actions: [...cam.actions, ...vo.actions],
	// 	part: cam.part,
	// 	adLibPieces: [...cam.adLibPieces, ...vo.adLibPieces],
	// 	pieces: [...cam.pieces, ...vo.pieces]
	// }
}

async function makePartWithCamera(
	context: SegmentContext<GalleryBlueprintConfig>,
	partDefinition: PartDefinitionVOSS,
	partIndex: number,
	totalWords: number
): Promise<BlueprintResultPart> {
	const partKamBase = CreatePartKamBase(context, partDefinition, totalWords)

	let part: Part = partKamBase.part.part

	const partTime = partKamBase.duration

	const adLibPieces: IBlueprintAdLibPiece[] = []
	const pieces: Array<IBlueprintPiece<PieceMetaData>> = []
	const actions: IBlueprintActionManifest[] = []
	const mediaSubscriptions: HackPartMediaObjectSubscription[] = []

	const sourceInfoCam = findCameraSourceForVoss(context.config.sources, partDefinition.sourceDefinition)
	if (sourceInfoCam === undefined) {
		context.core.notifyUserWarning(`${partDefinition.rawType} does not exist in this studio`)
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
		sourceLayerId: SourceLayer.PgmCam,
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
				...GetSisyfosTimelineObjForCamera(context.config, sourceInfoCam, false)
			]
		}
	})
	await EvaluateCues(
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
	AddScript(partDefinition, pieces, partTime, SourceLayer.PgmScript)

	part.hackListenToMediaObjectUpdates = mediaSubscriptions

	if (pieces.length === 0) {
		part.invalid = true
		part.invalidity = { reason: 'The part has no pieces.' }
	}

	return {
		part,
		adLibPieces,
		pieces,
		actions
	}
}

// async function makeVoiceOver(
// 	context: SegmentContext<GalleryBlueprintConfig>,
// 	partDefinition: PartDefinitionVOSS,
// 	partIndex: number,
// 	partProps: ServerPartProps
// ): Promise<BlueprintResultPart> {
// 	const basePartProps = await CreatePartServerBase(context, partDefinition, partProps, {
// 		SourceLayer: {
// 			PgmServer: partProps.voLayer ? SourceLayer.PgmVoiceOver : SourceLayer.PgmServer, // TODO this actually is shared
// 			SelectedServer: partProps.voLayer ? SourceLayer.SelectedVoiceOver : SourceLayer.SelectedServer
// 		},
// 		Caspar: {
// 			ClipPending: CasparLLayer.CasparPlayerClipPending
// 		},
// 		Sisyfos: {
// 			ClipPending: SisyfosLLAyer.SisyfosSourceClipPending
// 		}
// 	})

// 	if (basePartProps.invalid) {
// 		return basePartProps.part
// 	}

// 	let part: Part = basePartProps.part.part
// 	const pieces = basePartProps.part.pieces
// 	const adLibPieces = basePartProps.part.adLibPieces
// 	const duration = basePartProps.duration
// 	const actions: IBlueprintActionManifest[] = []
// 	const mediaSubscriptions: HackPartMediaObjectSubscription[] = []

// 	part = {
// 		...part,
// 		...CreateEffektForpart(context, partDefinition, pieces)
// 	}
// 	AddScript(partDefinition, pieces, duration, SourceLayer.PgmScript)

// 	await EvaluateCues(
// 		context,
// 		part,
// 		pieces,
// 		adLibPieces,
// 		actions,
// 		mediaSubscriptions,
// 		partDefinition.cues,
// 		partDefinition,
// 		partIndex,
// 		{}
// 	)

// 	part.hackListenToMediaObjectUpdates = (part.hackListenToMediaObjectUpdates || []).concat(mediaSubscriptions)

// 	if (pieces.length === 0) {
// 		part.invalid = true
// 		part.invalidity = { reason: 'The part has no pieces.' }
// 	}

// 	return {
// 		part,
// 		adLibPieces,
// 		pieces,
// 		actions
// 	}
// }
