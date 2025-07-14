import { VTContent, WithTimeline } from '@sofie-automation/blueprints-integration'
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
	CreatePartKamBase,
	findCameraSourceForVoss,
	getServerSeek,
	GetSisyfosTimelineObjForCamera,
	getSourceDuration,
	GetTagForServer,
	MakeContentServer,
	MakeContentServerSourceLayers,
	Part,
	PartDefinition,
	PartDefinitionVOSS,
	PieceMetaData,
	SanitizeString,
	SegmentContext,
	ServerContentProps,
	ServerPartLayers,
	ServerPartProps,
	ShowStyleContext,
	SpecialInput,
	TableConfigItemSourceMapping,
	TimelineBlueprintExt,
	TransitionStyle,
	TV2BlueprintConfigBase,
	VideoSwitcher
} from 'tv2-common'
import { SharedOutputLayer, SwitcherAuxLLayer, TallyTags } from 'tv2-constants'
import { Tv2AudioMode } from '../../tv2-constants/tv2-audio.mode'
import { Tv2OutputLayer } from '../../tv2-constants/tv2-output-layer'
import { PlayoutContentType } from '../../tv2-constants/tv2-playout-content'
import { StudioConfig } from '../../tv2_afvd_studio/helpers/config'
import { CasparLLayer, SisyfosLLAyer } from '../../tv2_afvd_studio/layers'
import { GalleryBlueprintConfig } from '../helpers/config'
import { EvaluateCues } from '../helpers/pieces/evaluateCues'
import { SourceLayer } from '../layers'
import { CreateEffektForpart } from './effekt'

export async function CreatePartVOSS(
	context: SegmentContext<GalleryBlueprintConfig>,
	partDefinition: PartDefinitionVOSS,
	partIndex: number,
	totalWords: number,
	serverPartProps: ServerPartProps
): Promise<BlueprintResultPart> {
	const sourceLayers: ServerPartLayers = {
		SourceLayer: {
			PgmServer: serverPartProps.voLayer ? SourceLayer.PgmVoiceOver : SourceLayer.PgmServer, // TODO this actually is shared
			SelectedServer: serverPartProps.voLayer ? SourceLayer.SelectedVoiceOver : SourceLayer.SelectedServer
		},
		Caspar: {
			ClipPending: CasparLLayer.CasparPlayerClipPending
		},
		Sisyfos: {
			ClipPending: SisyfosLLAyer.SisyfosSourceClipPending
		}
	}
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
		name: `KAM ${partDefinition.sourceDefinition.cameraId}`,
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

	const vossVideoClipPiece: IBlueprintPiece<PieceMetaData> | undefined = await createVossVideoClipPiece(
		context,
		partDefinition,
		sourceLayers,
		serverPartProps
	)
	if (vossVideoClipPiece) {
		pieces.push(vossVideoClipPiece)
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

async function createVossVideoClipPiece(
	context: ShowStyleContext<TV2BlueprintConfigBase<StudioConfig>>,
	partDefinition: PartDefinitionVOSS,
	sourceLayers: MakeContentServerSourceLayers,
	partProps: ServerPartProps
): Promise<IBlueprintPiece<PieceMetaData> | undefined> {
	const auxiliaryId: string = partDefinition.sourceDefinition.auxiliaryId
	const auxiliaryMapping: ({ AuxiliaryId: string; LayerId: string } & TableConfigItemSourceMapping) | undefined =
		context.config.studio.SourcesAuxiliary.find((entry) => entry.AuxiliaryId === auxiliaryId)

	if (!auxiliaryMapping) {
		context.core.notifyUserWarning(
			`Failed creating VOSS video clip piece: Unable to find auxiliary mapping for auxiliary id ${auxiliaryId}.`
		)
		context.core.logWarning(
			`Failed creating VOSS video clip piece: Unable to find auxiliary mapping for auxiliary id ${auxiliaryId}.`
		)
		return
	}

	const layerId: string = auxiliaryMapping.LayerId
	const file = getVideoId(partDefinition)
	const mediaObjectDurationSec = await context.core.hackGetMediaObjectDuration(file)
	const mediaObjectDuration = mediaObjectDurationSec && mediaObjectDurationSec * 1000
	const sourceDuration = getSourceDuration(mediaObjectDuration, context.config.studio.ServerPostrollDuration)

	const contentProps: ServerContentProps = {
		seek: getServerSeek(partProps.lastServerPosition, file, mediaObjectDuration, partProps.actionTriggerMode),
		clipDuration: mediaObjectDuration ?? partProps.tapeTime * 1000,
		mediaPlayerSession: SanitizeString(`segment_${partProps.session ?? partDefinition.segmentExternalId}_${file}`),
		sourceDuration,
		file
	}
	const content: WithTimeline<VTContent> = MakeContentServer(context, sourceLayers, partProps, contentProps)
	content.timelineObjects.push(
		...createAuxiliaryRoutingTimelineObjects(context.videoSwitcher, contentProps, layerId as SwitcherAuxLLayer) // TODO: Check if LayerId is a SwitcherAuxLLayer
	)

	return {
		externalId: partDefinition.externalId,
		name: `${contentProps.file} \u2192 AUX${auxiliaryId}`,
		lifespan: PieceLifespan.OutOnSegmentEnd,
		sourceLayerId: auxiliaryMapping.LayerId,
		outputLayerId: SharedOutputLayer.AUX,
		enable: {
			start: 0
		},
		metaData: {
			playoutContent: {
				type: PlayoutContentType.VIDEO_CLIP
			},
			outputLayer: Tv2OutputLayer.AUXILIARY,
			sourceName: contentProps.file,
			audioMode: Tv2AudioMode.VOICE_OVER,
			mediaPlayerSessions: partProps.session ? [partProps.session] : [],
			modifiedByAction: false
		},
		content,
		prerollDuration: context.config.studio.CasparPrerollDuration,
		tags: [GetTagForServer(partDefinition.segmentExternalId, contentProps.file, true), TallyTags.SERVER_IS_LIVE]
	}
}

function getVideoId(partDefinition: PartDefinition): string {
	return partDefinition.fields.videoId ?? ''
}

function createAuxiliaryRoutingTimelineObjects(
	videoSwitcher: VideoSwitcher,
	serverContentProps: ServerContentProps,
	auxiliaryLayerId: SwitcherAuxLLayer
): readonly TimelineBlueprintExt[] {
	return [
		videoSwitcher.getAuxTimelineObject({
			layer: auxiliaryLayerId,
			content: {
				input: SpecialInput.AB_PLACEHOLDER
			},
			metaData: {
				mediaPlayerSession: serverContentProps.mediaPlayerSession
			}
		})
	]
}
