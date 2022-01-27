import {
	BlueprintResultTimeline,
	GraphicsContent,
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
import { CasparPlayerClip } from 'tv2-common'
import { AbstractLLayer, TallyTags } from 'tv2-constants'
import * as _ from 'underscore'
import { SisyfosLLAyer } from '../tv2_afvd_studio/layers'
import { OfftubeSisyfosLLayer } from '../tv2_offtube_studio/layers' // TODO: REMOVE
import { TV2BlueprintConfigBase, TV2StudioConfigBase } from './blueprintConfig'
import { ABSourceLayers, assignMediaPlayers } from './helpers'

export interface PartEndStateExt {
	stickySisyfosLevels: { [key: string]: 0 | 1 | 2 | undefined }
	mediaPlayerSessions: { [layer: string]: string[] }
	isJingle?: boolean
	fullFileName?: string
}

export interface MediaPlayerClaim {
	sessionId: string
	playerId: number
	lookahead: boolean
}

export interface TimelinePersistentStateExt {
	activeMediaPlayers: { [player: string]: MediaPlayerClaim[] | undefined }
}

export interface TimelineBlueprintExt extends TimelineObjectCoreExt {
	/** Metadata for use by the OnTimelineGenerate or other callbacks */
	metaData?: {
		context?: string
		sisyfosPersistLevel?: boolean
		mediaPlayerSession?: string
		dveAdlibEnabler?: string // Used to restore the original while rule after lookahead
		templateData?: any
		fileName?: string
	}
}

export interface PieceMetaData {
	transition?: {
		isEffekt?: boolean
		isMix?: boolean
		isJingle?: boolean
	}
	stickySisyfosLevels?: { [key: string]: { value: number; followsPrevious: boolean } }
	mediaPlayerSessions?: string[]
	mediaPlayerOptional?: boolean
	modifiedByAction?: boolean
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

	const config = getConfig(context)

	copyPreviousSisyfosLevels(
		context,
		timeline,
		previousPartEndState2 ? previousPartEndState2.stickySisyfosLevels : {},
		resolvedPieces
	)

	const persistentState: TimelinePersistentStateExt = {
		activeMediaPlayers: {}
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

export function getEndStateForPart(
	_context: IRundownContext,
	_previousPersistentState: TimelinePersistentState | undefined,
	previousPartEndState: PartEndState | undefined,
	resolvedPieces: IBlueprintResolvedPieceInstance[],
	time: number
): PartEndState {
	const endState: PartEndStateExt = {
		stickySisyfosLevels: {},
		mediaPlayerSessions: {}
	}

	const previousPartEndState2 = previousPartEndState as Partial<PartEndStateExt> | undefined

	const activePieces = resolvedPieces.filter(
		p =>
			_.isNumber(p.piece.enable.start) &&
			p.piece.enable &&
			(p.piece.enable.start as number) <= time &&
			(!p.piece.enable.duration || p.piece.enable.start + (p.piece.enable.duration as number) >= time)
	)

	for (const piece of activePieces) {
		preservePieceSisfosLevel(endState, previousPartEndState2, piece)
	}

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

export function preservePieceSisfosLevel(
	endState: PartEndStateExt,
	previousPartEndState: Partial<PartEndStateExt> | undefined,
	piece: IBlueprintResolvedPieceInstance
) {
	const metaData = piece.piece.metaData as PieceMetaData | undefined
	if (metaData) {
		// Loop through rm level persistance
		if (metaData.stickySisyfosLevels) {
			for (const key of Object.keys(metaData.stickySisyfosLevels)) {
				const values = metaData.stickySisyfosLevels[key]

				// Follow the previous state, if specified, or start with this exposed value
				endState.stickySisyfosLevels[key] =
					values.followsPrevious &&
					previousPartEndState &&
					previousPartEndState.stickySisyfosLevels &&
					previousPartEndState.stickySisyfosLevels[key]
						? previousPartEndState.stickySisyfosLevels[key]
						: (values.value as 0 | 1 | 2 | undefined)
			}
		}
	}
}

function isSisyfosPersistObject(obj: TSR.TimelineObjSisyfosChannels & TimelineBlueprintExt) {
	return (
		(obj.layer === OfftubeSisyfosLLayer.SisyfosPersistedLevels || obj.layer === SisyfosLLAyer.SisyfosPersistedLevels) &&
		obj.content.deviceType === TSR.DeviceType.SISYFOS &&
		obj.content.type === TSR.TimelineContentTypeSisyfos.CHANNELS &&
		obj.metaData?.sisyfosPersistLevel &&
		!obj.id.match(/previous/i) &&
		!obj.id.match(/future/)
	)
}

export function copyPreviousSisyfosLevels(
	_context: IRundownContext,
	timelineObjs: OnGenerateTimelineObj[],
	previousLevels: PartEndStateExt['stickySisyfosLevels'],
	resolvedPieces: IBlueprintResolvedPieceInstance[]
) {
	const objectsLookingToPersistLevels: Array<TSR.TimelineObjSisyfosChannels &
		TimelineBlueprintExt &
		OnGenerateTimelineObj> = (timelineObjs as Array<
		TSR.TimelineObjSisyfosChannels & TimelineBlueprintExt & OnGenerateTimelineObj
	>).filter(isSisyfosPersistObject)

	// This needs to look at previous pieces within the part, to make it work for adlibs
	// Pieces should be ordered, we shall assume that
	const groupedPieces = _.groupBy(resolvedPieces, p => p.resolvedStart)
	const sisyfosObjectsByPiece = _.groupBy(objectsLookingToPersistLevels, o => o.pieceInstanceId)

	for (const k of Object.keys(groupedPieces)) {
		const pieces = groupedPieces[k]
		const pieceIds = _.pluck(pieces, '_id') // getPieceGroupId(p._id))
		// Find all the objs that start here
		const objs = _.flatten(Object.values(_.pick(sisyfosObjectsByPiece, pieceIds)))
		// Stop if no objects
		if (objs.length === 0) {
			continue
		}

		// Find the active pieces before this time
		const time = pieces[0].resolvedStart

		// Start of part
		if (time !== 0) {
			// Calculate the previous 'state'
			const activePieces = resolvedPieces.filter(p => {
				const start = p.resolvedStart // Core should be always setting this to a number
				const duration = p.resolvedDuration

				// Piece must start before target, and end at or after target starts
				return start < time && (duration === undefined || start + duration >= time)
			})

			const newPreviousLevels: PartEndStateExt['stickySisyfosLevels'] = {}
			for (const piece of activePieces) {
				const metadata = piece.piece.metaData as PieceMetaData | undefined
				if (metadata && metadata.stickySisyfosLevels) {
					for (const id of Object.keys(metadata.stickySisyfosLevels)) {
						// context.notifyUserWarning(
						// 	`New level from ${piece._id} for ${id} of ${JSON.stringify(val)} (last was ${previousLevels[id]})`
						// )
						if (newPreviousLevels[id]) {
							// context.notifyUserWarning('duplicate level, going with the first!' + id)
						} else {
							const val = metadata.stickySisyfosLevels[id]
							newPreviousLevels[id] =
								val.followsPrevious && previousLevels[id] !== undefined
									? previousLevels[id]
									: (val.value as 0 | 1 | 2 | undefined)
						}
					}
				}
			}

			// Apply newly calculated levels
			previousLevels = newPreviousLevels
		}

		const allChannels = []
		// Apply newly calculated levels
		for (const sisyfosObj of objs) {
			const contentObj = sisyfosObj.content
			for (const channel of contentObj.channels) {
				const previousVal = previousLevels[channel.mappedLayer]
				if (previousVal !== undefined) {
					channel.isPgm = previousVal
					allChannels.push(channel)
				}
			}
		}
		// Apply all persisted levels to all objects in case there's more than one object
		for (const sisyfosObj of objs) {
			sisyfosObj.content.channels = allChannels
		}
	}
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
