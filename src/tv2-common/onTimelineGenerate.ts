import {
	BlueprintResultTimeline,
	GraphicsContent,
	IBlueprintPartInstance,
	IBlueprintResolvedPieceInstance,
	IRundownContext,
	OnGenerateTimelineObj,
	PartEndState,
	TimelinePersistentState,
	TSR
} from 'blueprints-integration'
import {
	ABSourceLayers,
	ActionSelectFullGrafik,
	ActionSelectJingle,
	ActionSelectServerClip,
	assignMediaPlayers,
	CasparPlayerClip,
	getServerPositionForPartInstance,
	ServerPosition,
	TimelineContext
} from 'tv2-common'
import { AbstractLLayer, PartType, SharedSisyfosLLayer, TallyTags } from 'tv2-constants'
import * as _ from 'underscore'
import { TV2BlueprintConfigBase, TV2StudioConfigBase } from './blueprintConfig'

export interface PartEndStateExt {
	sisyfosPersistenceMetaData: SisyfosPersistenceMetaData
	mediaPlayerSessions: { [layer: string]: string[] }
	isJingle?: boolean
	fullFileName?: string
	serverPosition?: ServerPosition
	segmentId: string
	partInstanceId: string
}

export interface MediaPlayerClaim {
	sessionId: string
	playerId: number
	lookahead: boolean
}

export interface TimelinePersistentStateExt {
	activeMediaPlayers: { [player: string]: MediaPlayerClaim[] | undefined }
	isNewSegment?: boolean
}

/** Metadata for use by the OnTimelineGenerate or other callbacks */
export interface TimelineObjectMetaData {
	context?: string
	mediaPlayerSession?: string
	templateData?: any
	fileName?: string
}

export type TimelineBlueprintExt = TSR.TSRTimelineObjBase & {
	metaData?: TimelineObjectMetaData
}

export interface PieceMetaData {
	sisyfosPersistMetaData?: SisyfosPersistenceMetaData
	mediaPlayerSessions?: string[]
	modifiedByAction?: boolean
}

export interface GraphicPieceMetaData extends PieceMetaData {
	partType?: PartType
	pieceExternalId?: string
}

export interface JinglePieceMetaData extends PieceMetaData {
	userData: ActionSelectJingle
}

export interface FullPieceMetaData extends PieceMetaData {
	userData: ActionSelectFullGrafik
}

export interface ServerPieceMetaData extends PieceMetaData {
	userData: ActionSelectServerClip
}

export interface SisyfosPersistenceMetaData {
	/**
	 * The layers this piece wants to persist into the next part
	 */
	sisyfosLayers: string[]
	/**
	 * The layers this piece gathered from previous pieces and wants to persist into the next part
	 */
	previousSisyfosLayers?: string[]
	/**
	 * Whether `sisyfosLayers` and `previousSisyfosLayers` may be persisted into the next part if accepted
	 */
	wantsToPersistAudio?: boolean
	/**
	 * Whether `sisyfosLayers` and `previousSisyfosLayers` from the previous part may be persisted
	 */
	acceptsPersistedAudio?: boolean
	/**
	 * Whether the piece was inserted/updated by fast Camera/Live cutting within a part or fading down persisted levels
	 */
	isModifiedOrInsertedByAction?: boolean
}

export interface PartMetaData {
	segmentExternalId: string
	/** If set, part has been modified by an action */
	dirty?: true
}

export function onTimelineGenerate<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	context: TimelineContext<ShowStyleConfig>,
	timeline: OnGenerateTimelineObj[],
	previousPersistentState: TimelinePersistentState | undefined,
	previousPartEndState: PartEndState | undefined,
	resolvedPieces: Array<IBlueprintResolvedPieceInstance<PieceMetaData>>,
	sourceLayers: ABSourceLayers
): Promise<BlueprintResultTimeline> {
	const previousPartEndState2 = previousPartEndState as PartEndStateExt | undefined
	const persistentState: TimelinePersistentStateExt = {
		activeMediaPlayers: {},
		isNewSegment: context.core.previousPartInstance?.segmentId !== context.core.currentPartInstance?.segmentId
	}

	if (
		(!persistentState.isNewSegment || isAnyPieceInjectedIntoPart(context, resolvedPieces)) &&
		context.core.currentPartInstance
	) {
		const sisyfosPersistedLevelsTimelineObject = createSisyfosPersistedLevelsTimelineObject(
			context.core.currentPartInstance._id,
			resolvedPieces,
			previousPartEndState2 && !persistentState.isNewSegment
				? previousPartEndState2.sisyfosPersistenceMetaData.sisyfosLayers
				: []
		)
		timeline.push(sisyfosPersistedLevelsTimelineObject)
	}

	const previousPersistentState2 = previousPersistentState as TimelinePersistentStateExt | undefined

	timeline = processServerLookaheads(context, timeline, resolvedPieces, sourceLayers)

	persistentState.activeMediaPlayers = assignMediaPlayers(
		context,
		timeline,
		previousPersistentState2 ? previousPersistentState2.activeMediaPlayers : {},
		resolvedPieces,
		sourceLayers
	)

	return Promise.resolve({
		timeline,
		persistentState
	})
}

function processServerLookaheads(
	context: TimelineContext,
	timeline: OnGenerateTimelineObj[],
	resolvedPieces: IBlueprintResolvedPieceInstance[],
	sourceLayers: ABSourceLayers
): OnGenerateTimelineObj[] {
	// Includes any non-active servers present in current part
	const serversInCurrentPart = timeline.filter((obj) => {
		if (_.isArray(obj.enable)) {
			return false
		}
		const layer = obj.layer.toString()
		const enableCondition = obj.enable.while?.toString()

		if (!enableCondition) {
			return false
		}

		return (
			[sourceLayers.Caspar.ClipPending, CasparPlayerClip(1), CasparPlayerClip(2)].includes(layer) &&
			!obj.isLookahead &&
			resolvedPieces.some(
				(p) => p._id === obj.pieceInstanceId && p.partInstanceId === context.core.currentPartInstance?._id
			)
		)
	})

	const sessionsInCurrentPart = serversInCurrentPart.reduce((prev, curr) => {
		const mediaPlayerSession = (curr as TimelineBlueprintExt).metaData?.mediaPlayerSession

		if (mediaPlayerSession) {
			prev.push(mediaPlayerSession)
		}

		return prev
	}, [] as string[])

	// Filter out lookaheads for servers that are currently in PGM.
	// Does not filter out AUX lookaheads. Should it?
	return timeline.filter((obj) => {
		if (_.isArray(obj.enable)) {
			return true
		}

		const layer = obj.layer.toString()

		const mediaPlayerSession = (obj as TimelineBlueprintExt).metaData?.mediaPlayerSession

		if (!mediaPlayerSession) {
			return true
		}

		if (obj.layer === AbstractLLayer.SERVER_ENABLE_PENDING && obj.isLookahead) {
			return false
		}

		return !(
			[sourceLayers.Caspar.ClipPending, CasparPlayerClip(1), CasparPlayerClip(2)]
				.map((l) => `${l}_lookahead`)
				.includes(layer) &&
			obj.isLookahead &&
			sessionsInCurrentPart.includes(mediaPlayerSession)
		)
	})
}

function isAnyPieceInjectedIntoPart(
	context: TimelineContext,
	resolvedPieces: Array<IBlueprintResolvedPieceInstance<PieceMetaData>>
) {
	return resolvedPieces
		.filter((piece) => piece.partInstanceId === context.core.currentPartInstance?._id)
		.some((piece) => {
			return piece.piece.metaData?.sisyfosPersistMetaData?.isModifiedOrInsertedByAction
		})
}

export function getEndStateForPart(
	_context: IRundownContext,
	previousPersistentState: TimelinePersistentState | undefined,
	partInstance: IBlueprintPartInstance,
	resolvedPieces: Array<IBlueprintResolvedPieceInstance<PieceMetaData>>,
	time: number
): PartEndState {
	const endState: PartEndStateExt = {
		sisyfosPersistenceMetaData: {
			sisyfosLayers: []
		},
		mediaPlayerSessions: {},
		segmentId: partInstance.segmentId,
		partInstanceId: partInstance._id
	}

	const activePieces = resolvedPieces.filter(
		(p) =>
			_.isNumber(p.piece.enable.start) &&
			p.piece.enable &&
			p.piece.enable.start <= time &&
			(!p.piece.enable.duration || p.piece.enable.start + p.piece.enable.duration >= time)
	)

	const previousPartEndState = partInstance?.previousPartEndState as Partial<PartEndStateExt>
	const previousPersistentStateExt: TimelinePersistentStateExt = previousPersistentState as TimelinePersistentStateExt
	endState.sisyfosPersistenceMetaData.sisyfosLayers = findLayersToPersistOnPartEnd(
		activePieces,
		!previousPersistentStateExt.isNewSegment && previousPartEndState && previousPartEndState.sisyfosPersistenceMetaData
			? previousPartEndState.sisyfosPersistenceMetaData.sisyfosLayers
			: []
	)

	for (const piece of activePieces) {
		if (piece.piece.metaData) {
			const meta = piece.piece.metaData.mediaPlayerSessions
			if (meta && meta.length) {
				endState.mediaPlayerSessions[piece.piece.sourceLayerId] = meta
			}
		}

		// TODO: make a proper last part type detection
		if (piece.piece.tags?.includes(TallyTags.JINGLE_IS_LIVE)) {
			endState.isJingle = true
		}
		if (piece.piece.tags?.includes(TallyTags.FULL_IS_LIVE)) {
			endState.fullFileName = (piece.piece.content as GraphicsContent).fileName
		}
	}

	endState.serverPosition = getServerPositionForPartInstance(partInstance, resolvedPieces, time)

	return endState
}

export function createSisyfosPersistedLevelsTimelineObject(
	currentPartInstanceId: string,
	resolvedPieces: Array<IBlueprintResolvedPieceInstance<PieceMetaData>>,
	layersWantingToPersistFromPreviousPart: string[]
): TSR.TimelineObjSisyfosChannels {
	const layersToPersist = findPersistedLayers(
		currentPartInstanceId,
		resolvedPieces,
		layersWantingToPersistFromPreviousPart
	)
	return {
		id: 'sisyfosPersistenceObject',
		enable: {
			start: 0
		},
		layer: SharedSisyfosLLayer.SisyfosPersistedLevels,
		content: {
			deviceType: TSR.DeviceType.SISYFOS,
			type: TSR.TimelineContentTypeSisyfos.CHANNELS,
			overridePriority: 1,
			channels: layersToPersist.map((layer) => {
				return {
					mappedLayer: layer,
					isPgm: 1
				}
			})
		}
	}
}

function findLayersToPersistOnPartEnd(
	pieceInstances: Array<IBlueprintResolvedPieceInstance<PieceMetaData>>,
	layersWantingToPersistFromPreviousPart: string[] = []
): string[] {
	const latestPieceInstance = findLastPlayingPieceInstance(
		pieceInstances,
		(pieceInstance) => !!pieceInstance.piece.metaData?.sisyfosPersistMetaData
	)
	const latestPieceMetaData = latestPieceInstance?.piece.metaData?.sisyfosPersistMetaData

	if (!latestPieceMetaData?.wantsToPersistAudio) {
		return []
	}

	if (!latestPieceMetaData.acceptsPersistedAudio) {
		return latestPieceMetaData.wantsToPersistAudio ? latestPieceMetaData.sisyfosLayers : []
	}

	const layersToPersist: string[] = []
	if (!latestPieceMetaData?.isModifiedOrInsertedByAction) {
		layersToPersist.push(...layersWantingToPersistFromPreviousPart)
	} else if (latestPieceMetaData.previousSisyfosLayers) {
		layersToPersist.push(...latestPieceMetaData.previousSisyfosLayers)
	}
	layersToPersist.push(...latestPieceMetaData.sisyfosLayers)

	return Array.from(new Set(layersToPersist))
}

function findPersistedLayers(
	currentPartInstanceId: string,
	pieceInstances: Array<IBlueprintResolvedPieceInstance<PieceMetaData>>,
	layersWantingToPersistFromPreviousPart: string[]
): string[] {
	const latestPieceInstance = findLastPlayingPieceInstance(
		pieceInstances,
		(pieceInstance) =>
			!!pieceInstance.piece.metaData?.sisyfosPersistMetaData && pieceInstance.partInstanceId === currentPartInstanceId
	)

	const latestPieceMetaData = latestPieceInstance?.piece.metaData
	if (!latestPieceMetaData?.sisyfosPersistMetaData!.acceptsPersistedAudio) {
		return []
	}

	const layersToPersist: string[] = []
	if (!latestPieceMetaData.sisyfosPersistMetaData?.isModifiedOrInsertedByAction) {
		layersToPersist.push(...layersWantingToPersistFromPreviousPart)
	} else if (latestPieceMetaData.sisyfosPersistMetaData.previousSisyfosLayers) {
		layersToPersist.push(...latestPieceMetaData.sisyfosPersistMetaData.previousSisyfosLayers)
	}

	return Array.from(new Set(layersToPersist))
}

export function findLastPlayingPieceInstance(
	currentPieceInstances: Array<IBlueprintResolvedPieceInstance<PieceMetaData>>,
	predicate?: (pieceInstance: IBlueprintResolvedPieceInstance<PieceMetaData>) => boolean
): IBlueprintResolvedPieceInstance<PieceMetaData> | undefined {
	const playingPieces = currentPieceInstances.filter((p) => !p.stoppedPlayback && (predicate ? predicate(p) : true))
	if (playingPieces.length <= 1) {
		return playingPieces[0]
	}
	return playingPieces.reduce((prev, current) => {
		return prev.resolvedStart > current.resolvedStart ? prev : current
	})
}

export function disablePilotWipeAfterJingle(
	timeline: OnGenerateTimelineObj[],
	previousPartEndState: PartEndStateExt | undefined,
	resolvedPieces: IBlueprintResolvedPieceInstance[]
) {
	if (previousPartEndState?.isJingle && resolvedPieces.find((p) => p.piece.tags?.includes(TallyTags.FULL_IS_LIVE))) {
		for (const obj of timeline) {
			if (obj.content.deviceType === TSR.DeviceType.ATEM && !obj.isLookahead) {
				const obj2 = obj as TSR.TimelineObjAtemAny
				if (obj2.content.type === TSR.TimelineContentTypeAtem.ME) {
					obj2.content.me.transition = TSR.AtemTransitionStyle.CUT
					delete obj2.content.me.transitionSettings
				}
			}
		}
	}
}
