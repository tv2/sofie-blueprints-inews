import {
	BlueprintResultPart,
	IBlueprintPart,
	IBlueprintPiece,
	IShowStyleUserContext,
	PieceLifespan,
	VTContent,
	WithTimeline
} from '@tv2media/blueprints-integration'
import {
	CutToServer,
	GetTagForServer,
	GetTagForServerNext,
	MakeContentServer,
	MakeContentServerSourceLayers,
	PieceMetaData,
	SisyfosPersistMetaData
} from 'tv2-common'
import { AdlibActionType, PartType, SharedOutputLayers, TallyTags } from 'tv2-constants'
import { ActionSelectServerClip } from '../actions'
import { TV2BlueprintConfigBase, TV2StudioConfigBase } from '../blueprintConfig'
import { getSourceDuration, GetVTContentProperties } from '../content'
import { getServerSeek, ServerPosition, ServerSelectMode } from '../helpers'
import { PartDefinition } from '../inewsConversion'
import { literal, SanitizeString } from '../util'
import { CreatePartInvalid } from './invalid'

interface PieceMetaDataServer {
	userData: ActionSelectServerClip
}

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
	AtemLLayer: {
		MEPgm: string
		ServerLookaheadAux?: string
	}
} & MakeContentServerSourceLayers

export async function CreatePartServerBase<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	context: IShowStyleUserContext,
	config: ShowStyleConfig,
	partDefinition: PartDefinition,
	partProps: ServerPartProps,
	layers: ServerPartLayers
): Promise<{ part: BlueprintResultPart; file: string; duration: number; invalid?: true }> {
	if (isVideoIdMissing(partDefinition)) {
		context.notifyUserWarning('Video ID not set!')
		return { part: CreatePartInvalid(partDefinition), file: '', duration: 0, invalid: true }
	}

	const file = getVideoId(partDefinition)
	const mediaObjectDurationSec = await context.hackGetMediaObjectDuration(file)
	const mediaObjectDuration = mediaObjectDurationSec && mediaObjectDurationSec * 1000
	const sourceDuration = getSourceDuration(mediaObjectDuration, config.studio.ServerPostrollDuration)
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

	const pieces: IBlueprintPiece[] = []

	const serverSelectionBlueprintPiece = getServerSelectionBlueprintPiece(
		partDefinition,
		actualDuration,
		partProps,
		contentProps,
		layers,
		context,
		config,
		config.studio.CasparPrerollDuration
	)

	const pgmBlueprintPiece = getPgmBlueprintPiece(
		partDefinition,
		partProps,
		contentProps,
		layers,
		config,
		config.studio.CasparPrerollDuration
	)

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

function getContentServerElement<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	partDefinition: PartDefinition,
	partProps: ServerPartProps,
	contentProps: ServerContentProps,
	layers: ServerPartLayers,
	context: IShowStyleUserContext,
	config: ShowStyleConfig
): WithTimeline<VTContent> {
	return MakeContentServer(
		context,
		partDefinition,
		config,
		{
			Caspar: {
				ClipPending: layers.Caspar.ClipPending
			},
			Sisyfos: {
				ClipPending: layers.Sisyfos.ClipPending
			},
			ATEM: {
				ServerLookaheadAux: layers.ATEM.ServerLookaheadAux
			}
		},
		partProps,
		contentProps
	)
}

function getServerSelectionBlueprintPiece<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	partDefinition: PartDefinition,
	actualDuration: number,
	partProps: ServerPartProps,
	contentProps: ServerContentProps,
	layers: ServerPartLayers,
	context: IShowStyleUserContext,
	config: ShowStyleConfig,
	_prerollDuration: number
): IBlueprintPiece {
	const userDataElement = getUserData(partDefinition, contentProps.file, actualDuration, partProps)
	const contentServerElement = getContentServerElement(partDefinition, partProps, contentProps, layers, context, config)

	return literal<IBlueprintPiece>({
		externalId: partDefinition.externalId,
		name: contentProps.file,
		enable: { start: 0 },
		outputLayerId: SharedOutputLayers.SEC,
		sourceLayerId: layers.SourceLayer.SelectedServer,
		lifespan: PieceLifespan.OutOnSegmentEnd,
		metaData: literal<PieceMetaData & PieceMetaDataServer>({
			mediaPlayerSessions: [contentProps.mediaPlayerSession],
			userData: userDataElement,
			sisyfosPersistMetaData: literal<SisyfosPersistMetaData>({
				sisyfosLayers: [],
				acceptPersistAudio: partProps.adLibPix && partProps.voLevels
			})
		}),
		content: contentServerElement,
		tags: [GetTagForServerNext(partDefinition.segmentExternalId, contentProps.file, partProps.voLayer)]
	})
}

function getPgmBlueprintPiece<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	partDefinition: PartDefinition,
	partProps: ServerPartProps,
	contentProps: ServerContentProps,
	layers: ServerPartLayers,
	config: ShowStyleConfig,
	prerollDuration: number
): IBlueprintPiece {
	return literal<IBlueprintPiece>({
		externalId: partDefinition.externalId,
		name: contentProps.file,
		enable: { start: 0 },
		outputLayerId: SharedOutputLayers.PGM,
		sourceLayerId: layers.SourceLayer.PgmServer,
		lifespan: PieceLifespan.WithinPart,
		metaData: literal<PieceMetaData>({
			mediaPlayerSessions: [contentProps.mediaPlayerSession]
		}),
		content: {
			...GetVTContentProperties(config, contentProps),
			timelineObjects: CutToServer(contentProps.mediaPlayerSession, partDefinition, config, layers.AtemLLayer.MEPgm)
		},
		tags: [
			GetTagForServer(partDefinition.segmentExternalId, contentProps.file, partProps.voLayer),
			TallyTags.SERVER_IS_LIVE
		],
		prerollDuration
	})
}
