import {
	BlueprintResultPart,
	IBlueprintPart,
	IBlueprintPiece,
	PieceLifespan,
	VTContent,
	WithTimeline
} from 'blueprints-integration'
import {
	CutToServer,
	GetTagForServer,
	GetTagForServerNext,
	MakeContentServer,
	MakeContentServerSourceLayers,
	PieceMetaData,
	ServerPieceMetaData,
	ShowStyleContext
} from 'tv2-common'
import { AdlibActionType, PartType, SharedOutputLayer, SharedSourceLayer, TallyTags } from 'tv2-constants'
import { Tv2AudioMode } from '../../tv2-constants/tv2-audio.mode'
import { Tv2OutputLayer } from '../../tv2-constants/tv2-output-layer'
import { Tv2PieceType } from '../../tv2-constants/tv2-piece-type'
import { PlayoutContentType } from '../../tv2-constants/tv2-playout-content'
import { ActionSelectServerClip } from '../actions'
import { TV2BlueprintConfigBase, TV2StudioConfigBase } from '../blueprintConfig'
import { getSourceDuration, GetVTContentProperties } from '../content'
import { getServerSeek, ServerPosition, ServerSelectMode } from '../helpers'
import { PartDefinition } from '../inewsConversion'
import { SanitizeString } from '../util'
import { CreatePartInvalid } from './invalid'

export interface ServerPartProps {
	voLayer: boolean
	voLevels: boolean
	totalWords: number
	totalTime: number
	tapeTime: number
	adLibPix: boolean
	session?: string
	actionTriggerMode?: ServerSelectMode
	lastServerPosition?: ServerPosition
}

export interface ServerContentProps {
	seek?: number
	/** Clip duration from mediaObject or tapeTime */
	clipDuration: number | undefined
	/** Clip duration as in `clipDuration` but with postroll subtracted */
	sourceDuration: number | undefined
	mediaPlayerSession: string
	file: string
}

export type ServerPartLayers = {
	SourceLayer: {
		PgmServer: string
		SelectedServer: string
	}
} & MakeContentServerSourceLayers

export async function CreatePartServerBase<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	context: ShowStyleContext<ShowStyleConfig>,
	partDefinition: PartDefinition,
	partProps: ServerPartProps,
	layers: ServerPartLayers
): Promise<{ part: BlueprintResultPart; file: string; duration: number; invalid?: true }> {
	if (isVideoIdMissing(partDefinition)) {
		context.core.notifyUserWarning('Video ID not set!')
		return {
			part: CreatePartInvalid(partDefinition, {
				reason: `The part is missing a video id.`
			}),
			file: '',
			duration: 0,
			invalid: true
		}
	}

	const file = getVideoId(partDefinition)
	const mediaObjectDurationSec = await context.core.hackGetMediaObjectDuration(file)
	const mediaObjectDuration = mediaObjectDurationSec && mediaObjectDurationSec * 1000
	const sourceDuration = getSourceDuration(mediaObjectDuration, context.config.studio.ServerPostrollDuration)
	const duration = getDuration(mediaObjectDuration, sourceDuration, partProps)
	const sanitisedScript = getScriptWithoutLineBreaks(partDefinition)
	const actualDuration = getActualDuration(duration, sanitisedScript, partProps)

	const contentProps: ServerContentProps = {
		seek: getServerSeek(partProps.lastServerPosition, file, mediaObjectDuration, partProps.actionTriggerMode),
		clipDuration: mediaObjectDuration ?? partProps.tapeTime * 1000,
		mediaPlayerSession: SanitizeString(`segment_${partProps.session ?? partDefinition.segmentExternalId}_${file}`),
		sourceDuration,
		file
	}

	const displayTitle = getDisplayTitle(partDefinition)
	const basePart = getBasePart(partDefinition, displayTitle, actualDuration, file)

	const pieces: Array<IBlueprintPiece<PieceMetaData>> = []

	const serverSelectionBlueprintPiece = getServerSelectionBlueprintPiece(
		context,
		partDefinition,
		actualDuration,
		partProps,
		contentProps,
		layers,
		context.config.studio.CasparPrerollDuration
	)

	const pgmBlueprintPiece = getPgmBlueprintPiece(context, partDefinition, partProps, contentProps, layers)

	pieces.push(serverSelectionBlueprintPiece)
	pieces.push(pgmBlueprintPiece)

	return {
		part: {
			part: basePart,
			adLibPieces: [],
			pieces,
			actions: []
		},
		file,
		duration: actualDuration
	}
}

function isVideoIdMissing(partDefinition: PartDefinition): boolean {
	return partDefinition.fields === undefined || !partDefinition.fields.videoId
}

function getVideoId(partDefinition: PartDefinition): string {
	return partDefinition.fields.videoId ? partDefinition.fields.videoId : ''
}

function getDuration(
	mediaObjectDuration: number | undefined,
	sourceDuration: number | undefined,
	partProps: ServerPartProps
): number {
	return (
		(mediaObjectDuration !== undefined &&
			((partProps.voLayer && partProps.totalWords <= 0) || !partProps.voLayer) &&
			sourceDuration) ||
		partProps.tapeTime * 1000 ||
		0
	)
}

function getActualDuration(duration: number, sanitisedScript: string, props: ServerPartProps): number {
	return props.voLayer && props.totalWords > 0
		? (sanitisedScript.length / props.totalWords) * (props.totalTime * 1000 - duration) + duration
		: duration
}

function getDisplayTitle(partDefinition: PartDefinition): string {
	if (partDefinition.type === PartType.VO || partDefinition.type === PartType.Server) {
		return partDefinition.rawType
	}
	return 'SERVER'
}

function getScriptWithoutLineBreaks(partDefinition: PartDefinition) {
	return partDefinition.script.replace(/\n/g, '').replace(/\r/g, '')
}

function getBasePart(
	partDefinition: PartDefinition,
	displayTitle: string,
	actualDuration: number,
	fileId: string
): IBlueprintPart {
	return {
		externalId: partDefinition.externalId,
		title: displayTitle,
		metaData: {},
		expectedDuration: actualDuration || 1000,
		hackListenToMediaObjectUpdates: [{ mediaId: fileId.toUpperCase() }]
	}
}

function getUserData(
	partDefinition: PartDefinition,
	file: string,
	actualDuration: number,
	partProps: ServerPartProps
): ActionSelectServerClip {
	return {
		type: AdlibActionType.SELECT_SERVER_CLIP,
		file,
		partDefinition,
		duration: actualDuration,
		voLayer: partProps.voLayer,
		voLevels: partProps.voLevels,
		adLibPix: partProps.adLibPix
	}
}

function getContentServerElement(
	context: ShowStyleContext,
	partProps: ServerPartProps,
	contentProps: ServerContentProps,
	layers: ServerPartLayers
): WithTimeline<VTContent> {
	return MakeContentServer(
		context,
		{
			Caspar: {
				ClipPending: layers.Caspar.ClipPending
			},
			Sisyfos: {
				ClipPending: layers.Sisyfos.ClipPending
			}
		},
		partProps,
		contentProps
	)
}

function getServerSelectionBlueprintPiece(
	context: ShowStyleContext,
	partDefinition: PartDefinition,
	actualDuration: number,
	partProps: ServerPartProps,
	contentProps: ServerContentProps,
	layers: ServerPartLayers,
	prerollDuration: number
): IBlueprintPiece<ServerPieceMetaData> {
	const userDataElement = getUserData(partDefinition, contentProps.file, actualDuration, partProps)
	const contentServerElement = getContentServerElement(context, partProps, contentProps, layers)

	return {
		externalId: partDefinition.externalId,
		name: contentProps.file,
		enable: { start: 0 },
		outputLayerId: SharedOutputLayer.SEC,
		sourceLayerId: layers.SourceLayer.SelectedServer,
		lifespan: PieceLifespan.WithinPart,
		metaData: {
			playoutContent: {
				type: PlayoutContentType.UNKNOWN
			},
			type: Tv2PieceType.UNKNOWN,
			sourceName: contentServerElement.fileName,
			audioMode:
				layers.SourceLayer.SelectedServer === SharedSourceLayer.SelectedVoiceOver
					? Tv2AudioMode.VOICE_OVER
					: Tv2AudioMode.FULL,
			mediaPlayerSessions: [contentProps.mediaPlayerSession],
			userData: userDataElement,
			sisyfosPersistMetaData: {
				sisyfosLayers: [],
				acceptsPersistedAudio: partProps.adLibPix && partProps.voLevels
			}
		},
		content: contentServerElement,
		tags: [GetTagForServerNext(partDefinition.segmentExternalId, contentProps.file, partProps.voLayer)],
		prerollDuration
	}
}

function getPgmBlueprintPiece<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	context: ShowStyleContext<ShowStyleConfig>,
	partDefinition: PartDefinition,
	partProps: ServerPartProps,
	contentProps: ServerContentProps,
	layers: ServerPartLayers
): IBlueprintPiece<PieceMetaData> {
	const vtContent = GetVTContentProperties(context.config, contentProps)
	return {
		externalId: partDefinition.externalId,
		name: contentProps.file,
		enable: { start: 0 },
		outputLayerId: SharedOutputLayer.PGM,
		sourceLayerId: layers.SourceLayer.PgmServer,
		lifespan: PieceLifespan.WithinPart,
		metaData: {
			playoutContent: {
				type: PlayoutContentType.VIDEO_CLIP
			},
			type: Tv2PieceType.VIDEO_CLIP,
			outputLayer: Tv2OutputLayer.PROGRAM,
			sourceName: vtContent.fileName,
			audioMode:
				layers.SourceLayer.SelectedServer === SharedSourceLayer.SelectedVoiceOver
					? Tv2AudioMode.VOICE_OVER
					: Tv2AudioMode.FULL,
			mediaPlayerSessions: [contentProps.mediaPlayerSession]
		},
		content: {
			...vtContent,
			timelineObjects: CutToServer(context, contentProps.mediaPlayerSession, partDefinition)
		},
		tags: [
			GetTagForServer(partDefinition.segmentExternalId, contentProps.file, partProps.voLayer),
			TallyTags.SERVER_IS_LIVE
		],
		prerollDuration: context.config.studio.CasparPrerollDuration
	}
}
