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
import { GetVTContentProperties } from '../content'
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

export function CreatePartServerBase<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	context: IShowStyleUserContext,
	config: ShowStyleConfig,
	partDefinition: PartDefinition,
	props: ServerPartProps,
	layers: ServerPartLayers
): { part: BlueprintResultPart; file: string; duration: number; invalid?: true } {
	if (isVideoIdMissing(partDefinition)) {
		context.notifyUserWarning('Video ID not set!')
		return { part: CreatePartInvalid(partDefinition), file: '', duration: 0, invalid: true }
	}

	const file = getVideoId(partDefinition)
	const mediaObjectDuration = context.hackGetMediaObjectDuration(file)
	const sourceDuration = getSourceDuration(mediaObjectDuration, config.studio.ServerPostrollDuration)
	const duration = getDuration(mediaObjectDuration, sourceDuration, props)
	const sanitisedScript = getScriptWithoutLineBreaks(partDefinition)
	const actualDuration = getActualDuration(duration, sanitisedScript, props)

	const displayTitle = getDisplayTitle(partDefinition)
	const basePart = getBasePart(partDefinition, displayTitle, actualDuration, file)
	const mediaPlayerSession = SanitizeString(`segment_${props.session ?? partDefinition.segmentExternalId}_${file}`)

	const pieces: IBlueprintPiece[] = []

	const serverSelectionBlueprintPiece = getServerSelectionBlueprintPiece(
		partDefinition,
		file,
		actualDuration,
		props,
		layers,
		sourceDuration,
		mediaPlayerSession,
		context,
		config,
		config.studio.CasparPrerollDuration
	)

	const pgmBlueprintPiece = getPgmBlueprintPiece(
		partDefinition,
		file,
		props,
		layers,
		sourceDuration,
		mediaPlayerSession,
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

function getSourceDuration(
	mediaObjectDuration: number | undefined,
	serverPostrollDuration: number
): number | undefined {
	return mediaObjectDuration !== undefined ? mediaObjectDuration * 1000 - serverPostrollDuration : undefined
}

function getDuration(
	mediaObjectDuration: number | undefined,
	sourceDuration: number | undefined,
	props: ServerPartProps
): number {
	return (
		(mediaObjectDuration !== undefined &&
			((props.voLayer && props.totalWords <= 0) || !props.voLayer) &&
			sourceDuration) ||
		props.tapeTime * 1000 ||
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
	props: ServerPartProps
): ActionSelectServerClip {
	return {
		type: AdlibActionType.SELECT_SERVER_CLIP,
		file,
		partDefinition,
		duration: actualDuration,
		voLayer: props.voLayer,
		voLevels: props.voLevels,
		adLibPix: props.adLibPix
	}
}

function getContentServerElement<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	partDefinition: PartDefinition,
	file: string,
	props: ServerPartProps,
	layers: ServerPartLayers,
	sourceDuration: number | undefined,
	mediaPlayerSession: string,
	context: IShowStyleUserContext,
	config: ShowStyleConfig
): WithTimeline<VTContent> {
	return MakeContentServer(
		context,
		file,
		mediaPlayerSession,
		partDefinition,
		config,
		{
			Caspar: {
				ClipPending: layers.Caspar.ClipPending
			},
			Sisyfos: {
				ClipPending: layers.Sisyfos.ClipPending,
				StudioMicsGroup: layers.Sisyfos.StudioMicsGroup
			},
			ATEM: {
				ServerLookaheadAux: layers.ATEM.ServerLookaheadAux
			}
		},
		props.adLibPix,
		props.voLevels,
		sourceDuration
	)
}

function getServerSelectionBlueprintPiece<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	partDefinition: PartDefinition,
	file: string,
	actualDuration: number,
	props: ServerPartProps,
	layers: ServerPartLayers,
	sourceDuration: number | undefined,
	mediaPlayerSession: string,
	context: IShowStyleUserContext,
	config: ShowStyleConfig,
	prerollDuration: number
): IBlueprintPiece {
	const userDataElement = getUserData(partDefinition, file, actualDuration, props)
	const contentServerElement = getContentServerElement(
		partDefinition,
		file,
		props,
		layers,
		sourceDuration,
		mediaPlayerSession,
		context,
		config
	)

	return literal<IBlueprintPiece>({
		externalId: partDefinition.externalId,
		name: file,
		enable: { start: 0 },
		outputLayerId: SharedOutputLayers.SEC,
		sourceLayerId: layers.SourceLayer.SelectedServer,
		lifespan: PieceLifespan.OutOnSegmentEnd,
		metaData: literal<PieceMetaData & PieceMetaDataServer>({
			mediaPlayerSessions: [mediaPlayerSession],
			userData: userDataElement,
			sisyfosPersistMetaData: literal<SisyfosPersistMetaData>({
				sisyfosLayers: [],
				acceptPersistAudio: props.adLibPix && props.voLayer
			})
		}),
		content: contentServerElement,
		tags: [GetTagForServerNext(partDefinition.segmentExternalId, file, props.voLayer)],
		prerollDuration
	})
}

function getPgmBlueprintPiece<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	partDefinition: PartDefinition,
	file: string,
	props: ServerPartProps,
	layers: ServerPartLayers,
	sourceDuration: number | undefined,
	mediaPlayerSession: string,
	config: ShowStyleConfig,
	prerollDuration: number
): IBlueprintPiece {
	return literal<IBlueprintPiece>({
		externalId: partDefinition.externalId,
		name: file,
		enable: { start: 0 },
		outputLayerId: SharedOutputLayers.PGM,
		sourceLayerId: layers.SourceLayer.PgmServer,
		lifespan: PieceLifespan.WithinPart,
		metaData: literal<PieceMetaData>({
			mediaPlayerSessions: [mediaPlayerSession]
		}),
		content: {
			...GetVTContentProperties(config, file, sourceDuration),
			timelineObjects: CutToServer(mediaPlayerSession, partDefinition, config, layers.AtemLLayer.MEPgm)
		},
		tags: [GetTagForServer(partDefinition.segmentExternalId, file, props.voLayer), TallyTags.SERVER_IS_LIVE],
		prerollDuration
	})
}
