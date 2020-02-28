import {
	DeviceType,
	TimelineContentTypeAtem,
	TimelineContentTypeSisyfos,
	TimelineObjAtemSsrc,
	TimelineObjSisyfosAny
} from 'timeline-state-resolver-types'
import {
	BlueprintResultTimeline,
	IBlueprintPieceDB,
	OnGenerateTimelineObj,
	PartEndState,
	PartEventContext,
	PieceMetaData as PieceMetaDataBase,
	RundownContext,
	TimelineObjectCoreExt,
	TimelinePersistentState
} from 'tv-automation-sofie-blueprints-integration'
import * as _ from 'underscore'
import { parseConfig } from '../tv2_afvd_showstyle/helpers/config'
import { assignMediaPlayers } from './helpers/abPlayback'
import { MEDIA_PLAYER_AUTO } from '../types/constants'
// import { SourceLayer } from '../tv2_afvd_showstyle/layers'

/*const ALLOWED_MEDIA_PLAYER_SESSION_OVERLAPS: { [from: string]: string } = {
	[SourceLayer.PgmServer]: SourceLayer.PgmVoiceOver,
	[SourceLayer.PgmVoiceOver]: SourceLayer.PgmServer
}*/

export interface PartEndStateExt extends PartEndState {
	stickySisyfosLevels: { [key: string]: number | undefined },
	mediaPlayerSessions: { [layer: string]: string[] }
}

export interface MediaPlayerClaim {
	sessionId: string
	playerId: number
	lookahead: boolean
}

export interface TimelinePersistentStateExt extends TimelinePersistentState {
	activeMediaPlayers: { [player: string]: MediaPlayerClaim[] | undefined }
	segmentSession: string
}

export interface TimelineBlueprintExt extends TimelineObjectCoreExt {
	/** Metadata for use by the OnTimelineGenerate or other callbacks */
	metaData?: {
		context?: string
		sisyfosPersistLevel?: boolean
		mediaPlayerSession?: string
		dveAdlibEnabler?: string // Used to restore the original while rule after lookahead
	}
}

export interface PieceMetaData extends PieceMetaDataBase {
	stickySisyfosLevels?: { [key: string]: { value: number; followsPrevious: boolean } }
	mediaPlayerSessions?: string[]
	mediaPlayerOptional?: boolean
}

export function onTimelineGenerate(
	context: PartEventContext,
	timeline: OnGenerateTimelineObj[],
	previousPersistentState: TimelinePersistentState | undefined,
	previousPartEndState: PartEndState | undefined,
	resolvedPieces: IBlueprintPieceDB[]
): Promise<BlueprintResultTimeline> {
	const previousPartEndState2 = previousPartEndState as PartEndStateExt | undefined

	const previousSegmentSession = previousPersistentState?.segmentSession
	const availablePlayers = previousPartEndState2?.mediaPlayerSessions
	const replacedSessions: { [from: string]: string } = { }
	if (
		previousSegmentSession === context.part.segmentId &&
		availablePlayers &&
		Object.keys(availablePlayers).length
	) {
		_.each(timeline, obj => {
			if (obj.classes && obj.classes.includes('add_server_segment_session') && !obj.classes.some((cls) => cls.includes('server_segment_session_id'))) {
				obj.classes.push(`server_segment_session_id_${context.part.segmentId}`)
			}
	
			if (obj.classes && obj.classes.includes('can_continue_server') && obj.classes.some((cls) => cls.includes('server_segment_session_id')) && !obj.isLookahead) {
				const meta = obj.metaData as TimelineBlueprintExt['metaData']
				console.log(`Can continue server on ${obj.id} with segment session ${obj.classes.find((cls) => cls.includes('server_segment_session_id'))}`)
				if (meta && meta.mediaPlayerSession) {
					console.log(`Replacing media session ${meta.mediaPlayerSession} with ${availablePlayers[Object.keys(availablePlayers)[0]][0]}`)
					replacedSessions[meta.mediaPlayerSession] = availablePlayers[Object.keys(availablePlayers)[0]][0]
					obj.metaData!.mediaPlayerSession = availablePlayers[Object.keys(availablePlayers)[0]][0]
				}
			}
		})
	} else {
		_.each(timeline, obj => {
			if (obj.classes && obj.classes.includes('add_server_segment_session') && !obj.classes.some((cls) => cls.includes('server_segment_session_id'))) {
				obj.classes.push(`server_segment_session_id_${context.part.segmentId}`)
			}

			if (obj.classes && obj.classes.includes('can_continue_server') && obj.classes.some((cls) => cls.includes('server_segment_session_id')) && !obj.isLookahead) {
				const meta = obj.metaData as TimelineBlueprintExt['metaData']
				if (meta && meta.mediaPlayerSession) {
					if (meta.mediaPlayerSession === MEDIA_PLAYER_AUTO) {
						console.log(`Replacing media session ${meta.mediaPlayerSession} with ${context.part.segmentId}`)
						replacedSessions[MEDIA_PLAYER_AUTO] = context.part.segmentId
						obj.metaData!.mediaPlayerSession = context.part.segmentId
					}
				}
			}
		})
	}

	_.each(resolvedPieces, piece => {
		if (piece.metaData) {
			const meta = piece.metaData as PieceMetaData
			if (meta.mediaPlayerSessions) {
				piece.metaData.mediaPlayerSessions = meta.mediaPlayerSessions.map((session) => {
					if (Object.keys(replacedSessions).includes(session)) {
						return replacedSessions[session]
					}

					return session
				})
			}
		}
	})


	_.each(resolvedPieces, piece => {
		if (piece.metaData) {
			const meta = piece.metaData as PieceMetaData
			if (meta.mediaPlayerSessions) {
				console.log(`Sessions: ${meta.mediaPlayerSessions}`)
			}
		}
	})

	copyPreviousSisyfosLevels(
		context,
		timeline,
		previousPartEndState2 ? previousPartEndState2.stickySisyfosLevels : {},
		resolvedPieces
	)

	const persistentState: TimelinePersistentStateExt = {
		activeMediaPlayers: {},
		segmentSession: context.part.segmentId
	}
	const previousPersistentState2 = previousPersistentState as TimelinePersistentStateExt | undefined

	const config = parseConfig(context)

	persistentState.activeMediaPlayers = assignMediaPlayers(
		context,
		config,
		timeline,
		previousPersistentState2 ? previousPersistentState2.activeMediaPlayers : {},
		resolvedPieces
	)

	dveBoxLookaheadUseOriginalEnable(timeline)

	return Promise.resolve({
		timeline,
		persistentState
	})
}

export function getEndStateForPart(
	_context: RundownContext,
	_previousPersistentState: TimelinePersistentState | undefined,
	previousPartEndState: PartEndState | undefined,
	resolvedPieces: IBlueprintPieceDB[],
	time: number
): PartEndState {
	const endState: PartEndStateExt = {
		stickySisyfosLevels: {},
		mediaPlayerSessions: {}
	}

	const previousPartEndState2 = previousPartEndState as Partial<PartEndStateExt> | undefined

	const activePieces = _.filter(
		resolvedPieces,
		p => p.enable && (p.enable.start as number) <= time && (!p.enable.end || (p.enable.end as number) >= time)
	)

	_.each(activePieces, piece => {
		preservePieceSisfosLevel(endState, previousPartEndState2, piece)
	})

	_.each(activePieces, piece => {
		if (piece.metaData) {
			const meta = (piece.metaData as PieceMetaData).mediaPlayerSessions
			if (meta && meta.length) {
				endState.mediaPlayerSessions[piece.sourceLayerId] = meta
			}
		}
	})

	return endState
}

/**
 * DVE box lookahead uses classes to select the correct object.
 * Lookahead is replacing this selector rule with a '1' which causes every box to show the same.
 * This simply restores the original enable, which gets put into metaData for this purpose.
 */
function dveBoxLookaheadUseOriginalEnable(timeline: OnGenerateTimelineObj[]) {
	// DVE_box lookahead class
	_.each(timeline, obj => {
		const obj2 = obj as TimelineObjAtemSsrc & TimelineBlueprintExt
		if (
			obj2.isLookahead &&
			obj2.content.deviceType === DeviceType.ATEM &&
			obj2.content.type === TimelineContentTypeAtem.SSRC
			// obj2.enable &&
			// (obj2.enable.while === '1' || obj2.enable.while === 1)
		) {
			const origClass = obj2.metaData ? obj2.metaData.dveAdlibEnabler : undefined
			if (origClass) {
				// Restore the original enable rule
				obj2.enable = { while: origClass }
			}
		}
	})
}

export function preservePieceSisfosLevel(
	endState: PartEndStateExt,
	previousPartEndState: Partial<PartEndStateExt> | undefined,
	piece: IBlueprintPieceDB
) {
	const metaData = piece.metaData as PieceMetaData | undefined
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
						? previousPartEndState.stickySisfosLevels[key]
						: values.value
			}
		}
	}
}

function isSisyfosSource(obj: Partial<TimelineObjSisyfosAny & TimelineObjectCoreExt>) {
	return (
		obj.content &&
		obj.content.deviceType === DeviceType.SISYFOS &&
		obj.content.type === TimelineContentTypeSisyfos.SISYFOS
	)
}

export function copyPreviousSisyfosLevels(
	context: RundownContext,
	timelineObjs: OnGenerateTimelineObj[],
	previousLevels: PartEndStateExt['stickySisyfosLevels'],
	resolvedPieces: IBlueprintPieceDB[]
) {
	// This needs to look at previous pieces within the part, to make it work for adlibs
	const sisyfosObjs = (timelineObjs as Array<
		TimelineObjSisyfosAny & TimelineBlueprintExt & OnGenerateTimelineObj
	>).filter(isSisyfosSource)

	// Pieces should be ordered, we shall assume that
	const groupedPieces = _.groupBy(resolvedPieces, p => p.enable.start)
	_.each(groupedPieces, pieces => {
		const pieceIds = _.pluck(pieces, '_id') // getPieceGroupId(p._id))
		// Find all the objs that start here
		const objs = sisyfosObjs.filter(o => {
			const groupId = o.pieceId
			return groupId && pieceIds.indexOf(groupId) !== -1
		})
		// Stop if no objects
		if (objs.length === 0 || !pieces[0].enable) {
			return
		}

		// Find the active pieces before this time
		const time = pieces[0].enable.start as number

		// Start of part
		if (time !== 0) {
			// Calculate the previous 'state'
			const activePieces = _.filter(resolvedPieces, p => {
				if (!p.enable) {
					return false
				}

				const start = p.enable.start as number // Core should be always setting this to a number
				const duration = p.playoutDuration

				// Piece must start before target, and end at or after target starts
				return start < time && (duration === undefined || start + duration >= time)
			})

			const newPreviousLevels: PartEndStateExt['stickySisyfosLevels'] = {}
			_.each(activePieces, piece => {
				const metadata = piece.metaData as PieceMetaData | undefined
				if (metadata && metadata.stickySisyfosLevels) {
					_.each(metadata.stickySisyfosLevels, (val, id) => {
						// context.warning(
						// 	`New level from ${piece._id} for ${id} of ${JSON.stringify(val)} (last was ${previousLevels[id]})`
						// )
						if (newPreviousLevels[id]) {
							context.warning('duplicate level, going with the first!')
						} else {
							if (val.followsPrevious && previousLevels[id] !== undefined) {
								newPreviousLevels[id] = previousLevels[id]
							} else {
								newPreviousLevels[id] = val.value
							}
						}
					})
				}
			})

			// Apply newly calculated levels
			previousLevels = newPreviousLevels
		}

		// Apply newly calculated levels
		_.each(objs, sisyfosObj => {
			const contentObj = sisyfosObj.content
			const previousVal = previousLevels[sisyfosObj.layer + '']
			if (contentObj && previousVal !== undefined && sisyfosObj.metaData && sisyfosObj.metaData.sisyfosPersistLevel) {
				contentObj.isPgm = previousVal
			}
		})
	})
}
