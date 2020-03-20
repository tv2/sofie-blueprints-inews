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
import { TV2BlueprintConfigBase, TV2StudioConfigBase } from './blueprintConfig'
import { ABSourceLayers, assignMediaPlayers } from './helpers'

export interface PartEndStateExt extends PartEndState {
	stickySisyfosLevels: { [key: string]: number | undefined }
}

export interface MediaPlayerClaim {
	sessionId: string
	playerId: number
	lookahead: boolean
}

export interface TimelinePersistentStateExt extends TimelinePersistentState {
	activeMediaPlayers: { [player: string]: MediaPlayerClaim[] | undefined }
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

export function onTimelineGenerate<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	context: PartEventContext,
	timeline: OnGenerateTimelineObj[],
	previousPersistentState: TimelinePersistentState | undefined,
	previousPartEndState: PartEndState | undefined,
	resolvedPieces: IBlueprintPieceDB[],
	parseConfig: (context: PartEventContext) => ShowStyleConfig,
	sourceLayers: ABSourceLayers
): Promise<BlueprintResultTimeline> {
	const previousPartEndState2 = previousPartEndState as PartEndStateExt | undefined
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

	const config = parseConfig(context)

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

export function getEndStateForPart(
	_context: RundownContext,
	_previousPersistentState: TimelinePersistentState | undefined,
	previousPartEndState: PartEndState | undefined,
	resolvedPieces: IBlueprintPieceDB[],
	time: number
): PartEndState {
	const endState: PartEndStateExt = {
		stickySisyfosLevels: {}
	}

	const previousPartEndState2 = previousPartEndState as Partial<PartEndStateExt> | undefined

	const activePieces = _.filter(
		resolvedPieces,
		p => p.enable && (p.enable.start as number) <= time && (!p.enable.end || (p.enable.end as number) >= time)
	)

	_.each(activePieces, piece => {
		preservePieceSisfosLevel(endState, previousPartEndState2, piece)
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
