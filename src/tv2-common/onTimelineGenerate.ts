import {
	BlueprintResultTimeline,
	GraphicsContent,
	IBlueprintPartInstance,
	IBlueprintResolvedPieceInstance,
	IRundownContext,
	IShowStyleContext,
	ITimelineEventContext,
	OnGenerateTimelineObj,
	PartEndState,
	TimelineObjectCoreExt,
	TimelinePersistentState,
	TSR
} from '@tv2media/blueprints-integration'
import { CasparPlayerClip, literal } from 'tv2-common'
import { AbstractLLayer, TallyTags } from 'tv2-constants'
import * as _ from 'underscore'
import { SisyfosLLAyer } from '../tv2_afvd_studio/layers'
import { TV2BlueprintConfigBase, TV2StudioConfigBase } from './blueprintConfig'
import { ABSourceLayers, assignMediaPlayers, getServerPositionForPartInstance, ServerPosition } from './helpers'

export interface PartEndStateExt {
	sisyfosPersistMetaData: SisyfosPersistMetaData
	mediaPlayerSessions: { [layer: string]: string[] }
	isJingle?: boolean
	fullFileName?: string
	serverPosition?: ServerPosition
	segmentId?: string
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

export interface TimelineBlueprintExt extends TimelineObjectCoreExt {
	/** Metadata for use by the OnTimelineGenerate or other callbacks */
	metaData?: {
		context?: string
		mediaPlayerSession?: string
		dveAdlibEnabler?: string // Used to restore the original while rule after lookahead
		templateData?: any
		fileName?: string
	}
}

export interface PieceMetaData {
	sisyfosPersistMetaData?: SisyfosPersistMetaData
	mediaPlayerSessions?: string[]
	mediaPlayerOptional?: boolean
	modifiedByAction?: boolean
}

export interface SisyfosPersistMetaData {
	sisyfosLayers: string[]
	wantsToPersistAudio?: boolean
	acceptPersistAudio?: boolean
	previousPersistMetaDataForCurrentPiece?: SisyfosPersistMetaData
	isPieceInjectedInPart?: boolean
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
	context: ITimelineEventContext,
	timeline: OnGenerateTimelineObj[],
	previousPersistentState: TimelinePersistentState | undefined,
	previousPartEndState: PartEndState | undefined,
	resolvedPieces: IBlueprintResolvedPieceInstance[],
	getConfig: (context: IShowStyleContext) => ShowStyleConfig,
	sourceLayers: ABSourceLayers,
	_casparLayerClipPending: string,
	_atemLayerNext: string
): Promise<BlueprintResultTimeline> {
	const previousPartEndState2 = previousPartEndState as PartEndStateExt | undefined
	const persistentState: TimelinePersistentStateExt = {
		activeMediaPlayers: {},
		isNewSegment: context.previousPartInstance?.segmentId !== context.currentPartInstance?.segmentId
	}

	const config = getConfig(context)

	if (!persistentState.isNewSegment || isAnyPieceInjectedIntoPart(resolvedPieces, context)) {
		const sisyfosPersistedLevelsTimelineObject = createSisyfosPersistedLevelsTimelineObject(
			resolvedPieces,
			previousPartEndState2 ? previousPartEndState2.sisyfosPersistMetaData.sisyfosLayers : []
		)
		timeline.push(sisyfosPersistedLevelsTimelineObject)
	}

	const previousPersistentState2 = previousPersistentState as TimelinePersistentStateExt | undefined

	timeline = processServerLookaheads(context, timeline, resolvedPieces, sourceLayers)

	persistentState.activeMediaPlayers = assignMediaPlayers(
		context,
		config,
		timeline,
		previousPersistentState2 ? previousPersistentState2.activeMediaPlayers : {},
		resolvedPieces,
		sourceLayers
	)

	dveBoxLookaheadUseOriginalEnable(timeline)

	return Promise.resolve({
		timeline,
		persistentState
	})
}

function processServerLookaheads(
	context: ITimelineEventContext,
	timeline: OnGenerateTimelineObj[],
	resolvedPieces: IBlueprintResolvedPieceInstance[],
	sourceLayers: ABSourceLayers
): OnGenerateTimelineObj[] {
	// Includes any non-active servers present in current part
	const serversInCurrentPart = timeline.filter(obj => {
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
				p => p._id === obj.pieceInstanceId && (p as any).partInstanceId === context.currentPartInstance?._id
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
	return timeline.filter(obj => {
		if (_.isArray(obj.enable)) {
			return true
		}

		const layer = obj.layer.toString()

		const mediaPlayerSession = (obj as TimelineBlueprintExt).metaData?.mediaPlayerSession

		if (!mediaPlayerSession) {
			return true
		}

		if (obj.layer === AbstractLLayer.ServerEnablePending && obj.isLookahead) {
			return false
		}

		return !(
			[sourceLayers.Caspar.ClipPending, CasparPlayerClip(1), CasparPlayerClip(2)]
				.map(l => `${l}_lookahead`)
				.includes(layer) &&
			obj.isLookahead &&
			sessionsInCurrentPart.includes(mediaPlayerSession)
		)
	})
}

function isAnyPieceInjectedIntoPart(resolvedPieces: IBlueprintResolvedPieceInstance[], context: ITimelineEventContext) {
	return resolvedPieces
		.filter(piece => piece.partInstanceId === context.currentPartInstance?._id)
		.some(piece => {
			const metaData = piece.piece.metaData as PieceMetaData | undefined
			return metaData?.sisyfosPersistMetaData?.isPieceInjectedInPart
		})
}

export function getEndStateForPart(
	context: IRundownContext,
	_previousPersistentState: TimelinePersistentState | undefined,
	partInstance: IBlueprintPartInstance,
	resolvedPieces: IBlueprintResolvedPieceInstance[],
	time: number
): PartEndState {
	const endState: PartEndStateExt = {
		sisyfosPersistMetaData: {
			sisyfosLayers: []
		},
		mediaPlayerSessions: {},
		segmentId: partInstance.segmentId,
		partInstanceId: partInstance._id
	}
	const previousPartEndState = partInstance?.previousPartEndState as Partial<PartEndStateExt>

	const activePieces = resolvedPieces.filter(
		p =>
			_.isNumber(p.piece.enable.start) &&
			p.piece.enable &&
			(p.piece.enable.start as number) <= time &&
			(!p.piece.enable.duration || p.piece.enable.start + (p.piece.enable.duration as number) >= time)
	)

	const previousPersistentState: TimelinePersistentStateExt = _previousPersistentState as TimelinePersistentStateExt
	endState.sisyfosPersistMetaData.sisyfosLayers = findLayersToPersist(
		activePieces,
		!previousPersistentState.isNewSegment && previousPartEndState && previousPartEndState.sisyfosPersistMetaData
			? previousPartEndState.sisyfosPersistMetaData.sisyfosLayers
			: []
	)

	for (const piece of activePieces) {
		if (piece.piece.metaData) {
			const meta = (piece.piece.metaData as PieceMetaData).mediaPlayerSessions
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

	endState.serverPosition = getServerPositionForPartInstance(context, partInstance, resolvedPieces, time)

	return endState
}

/**
 * DVE box lookahead uses classes to select the correct object.
 * Lookahead is replacing this selector rule with a '1' which causes every box to show the same.
 * This simply restores the original enable, which gets put into metaData for this purpose.
 */
function dveBoxLookaheadUseOriginalEnable(timeline: OnGenerateTimelineObj[]) {
	// DVE_box lookahead class
	for (const obj of timeline) {
		const obj2 = obj as TSR.TimelineObjAtemSsrc & TimelineBlueprintExt
		if (
			obj2.isLookahead &&
			obj2.content.deviceType === TSR.DeviceType.ATEM &&
			obj2.content.type === TSR.TimelineContentTypeAtem.SSRC
		) {
			const origClass = obj2.metaData ? obj2.metaData.dveAdlibEnabler : undefined
			if (origClass) {
				// Restore the original enable rule
				obj2.enable = { while: origClass }
			}
		}
	}
}

export function createSisyfosPersistedLevelsTimelineObject(
	resolvedPieces: IBlueprintResolvedPieceInstance[],
	previousSisyfosLayersThatWantsToBePersisted: SisyfosPersistMetaData['sisyfosLayers']
): TSR.TimelineObjSisyfosChannels {
	const layersToPersist = findLayersToPersist(resolvedPieces, previousSisyfosLayersThatWantsToBePersisted)
	return literal<TSR.TimelineObjSisyfosChannels>({
		id: 'sisyfosPersistenceObject',
		enable: {
			start: 0
		},
		layer: SisyfosLLAyer.SisyfosPersistedLevels,
		content: {
			deviceType: TSR.DeviceType.SISYFOS,
			type: TSR.TimelineContentTypeSisyfos.CHANNELS,
			overridePriority: 1,
			channels: layersToPersist.map(layer => {
				return {
					mappedLayer: layer,
					isPgm: 1
				}
			})
		}
	})
}

function findLayersToPersist(
	pieces: IBlueprintResolvedPieceInstance[],
	sisyfosLayersThatWantsToBePersisted: string[]
): string[] {
	const sortedPieces = pieces
		.filter(piece => {
			const metaData = piece.piece.metaData as PieceMetaData | undefined
			return metaData?.sisyfosPersistMetaData
		})
		.sort((a, b) => b.resolvedStart - a.resolvedStart)

	if (sortedPieces.length === 0) {
		return []
	}

	const firstPieceMetaData = sortedPieces[0].piece.metaData as PieceMetaData
	if (!firstPieceMetaData.sisyfosPersistMetaData!.acceptPersistAudio) {
		return firstPieceMetaData.sisyfosPersistMetaData!.wantsToPersistAudio
			? firstPieceMetaData.sisyfosPersistMetaData!.sisyfosLayers
			: []
	}

	const layersToPersist: string[] = []
	for (let i = 0; i < sortedPieces.length; i++) {
		const pieceMetaData = sortedPieces[i].piece.metaData as PieceMetaData
		const sisyfosPersistMetaData: SisyfosPersistMetaData = pieceMetaData!.sisyfosPersistMetaData!
		if (sisyfosPersistMetaData.wantsToPersistAudio) {
			layersToPersist.push(...sisyfosPersistMetaData.sisyfosLayers)
		}

		if (doesMetaDataNotAcceptPersistAudioDeep(sisyfosPersistMetaData)) {
			break
		}

		if (i === sortedPieces.length - 1) {
			layersToPersist.push(...sisyfosLayersThatWantsToBePersisted)
		}
	}

	return Array.from(new Set(layersToPersist))
}

function doesMetaDataNotAcceptPersistAudioDeep(metaData: SisyfosPersistMetaData): boolean {
	if (!metaData.acceptPersistAudio) {
		return true
	}
	if (metaData.previousPersistMetaDataForCurrentPiece) {
		return doesMetaDataNotAcceptPersistAudioDeep(metaData.previousPersistMetaDataForCurrentPiece)
	}
	return false
}

export function disablePilotWipeAfterJingle(
	timeline: OnGenerateTimelineObj[],
	previousPartEndState: PartEndStateExt | undefined,
	resolvedPieces: IBlueprintResolvedPieceInstance[]
) {
	if (previousPartEndState?.isJingle && resolvedPieces.find(p => p.piece.tags?.includes(TallyTags.FULL_IS_LIVE))) {
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
