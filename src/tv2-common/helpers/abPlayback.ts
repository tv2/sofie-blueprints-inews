import {
	IBlueprintResolvedPieceInstance,
	ITimelineEventContext,
	OnGenerateTimelineObj,
	TSR
} from 'blueprints-integration'
import { AbstractLLayer, MEDIA_PLAYER_AUTO, MediaPlayerClaimType } from 'tv2-constants'
import * as _ from 'underscore'
import { TV2BlueprintConfigBase, TV2StudioConfigBase } from '../blueprintConfig'
import { AbstractLLayerServerEnable, CasparPlayerClip } from '../layers'
import {
	MediaPlayerClaim,
	PieceMetaData,
	TimelineBlueprintExt,
	TimelinePersistentStateExt
} from '../onTimelineGenerate'

export interface SessionToPlayerMap {
	[sessionId: string]: MediaPlayerClaim | undefined
}

export interface ABSourceLayers {
	Caspar: {
		ClipPending: string
	}
	Sisyfos: {
		ClipPending: string
		PlayerA: string // TODO: Same approach as caspar
		PlayerB: string
	}
}

function reversePreviousAssignment(
	previousAssignment: TimelinePersistentStateExt['activeMediaPlayers'],
	timeline: OnGenerateTimelineObj[]
): SessionToPlayerMap {
	const previousAssignmentRev: { [sessionId: string]: MediaPlayerClaim | undefined } = {}
	for (const key of _.keys(previousAssignment)) {
		for (const v2 of previousAssignment[key] || []) {
			if (timeline.some(obj => obj.metaData && (obj.metaData as any).mediaPlayerSession === v2.sessionId)) {
				previousAssignmentRev[v2.sessionId] = v2
			}
		}
	}
	return previousAssignmentRev
}

export interface ActiveRequest {
	id: string
	start: number
	end: number | undefined
	type: MediaPlayerClaimType
	player?: string
	optional?: boolean
}

function maxUndefined(a: number | undefined, b: number | undefined): number | undefined {
	if (a === undefined) {
		return b
	}
	if (b === undefined) {
		return a
	}
	return Math.max(a, b)
}

interface SessionTime {
	start: number
	end: number | undefined
	optional: boolean
	duration: number | undefined
}
function calculateSessionTimeRanges(
	_context: ITimelineEventContext,
	resolvedPieces: Array<IBlueprintResolvedPieceInstance<PieceMetaData>>
) {
	const piecesWantingMediaPlayers = _.filter(resolvedPieces, p => {
		if (!p.piece.metaData) {
			return false
		}
		return (p.piece.metaData.mediaPlayerSessions || []).length > 0
	})

	const sessionRequests: { [sessionId: string]: SessionTime | undefined } = {}
	_.each(piecesWantingMediaPlayers, p => {
		const metadata = p.piece.metaData!
		const start = p.resolvedStart
		const duration = p.resolvedDuration
		const end = duration !== undefined ? start + duration : undefined

		// Track the range of each session
		_.each(metadata.mediaPlayerSessions || [], sessionId => {
			// TODO - will fixed ids ever be wanted? Is it reasonable to want to have the same session across multiple pieces?
			// Infinites are the exception here, but anything else?
			// Perhaps the id given should be prefixed with the piece(instance) id? And sharing sessions can be figured out when it becomes needed

			if (sessionId === '' || sessionId === MEDIA_PLAYER_AUTO) {
				sessionId = `${p.piece.continuesRefId || p._id}`
			}
			// Note: multiple generated sessionIds for a single piece will not work as there will not be enough info to assign objects to different players
			const val = sessionRequests[sessionId] || undefined
			if (val) {
				sessionRequests[sessionId] = {
					start: Math.min(val.start, start),
					end: maxUndefined(val.end, end),
					optional: val.optional && (metadata.mediaPlayerOptional || false),
					duration: p.resolvedDuration
				}
			} else {
				sessionRequests[sessionId] = {
					start,
					end,
					optional: metadata.mediaPlayerOptional || false,
					duration: p.resolvedDuration
				}
			}
		})
	})
	return sessionRequests
}
function findNextAvailablePlayer<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(config: ShowStyleConfig, inUse: ActiveRequest[], req: ActiveRequest) {
	const pickFirstNotInUse = (inUseRequests: ActiveRequest[]) => {
		const inUseIds = _.compact(_.map(inUseRequests, r => r.player))
		for (const mp of config.mediaPlayers) {
			if (inUseIds.indexOf(mp.id) === -1) {
				return mp.id
			}
		}

		return undefined
	}

	const tryForInUse = (filteredInUse: ActiveRequest[]) => {
		// Try finding something which is free
		let mpId = pickFirstNotInUse(inUse)
		if (mpId !== undefined) {
			return mpId
		}

		// Try reclaiming any lookahead
		const allActiveUses = _.filter(filteredInUse, r => r.type !== MediaPlayerClaimType.Preloaded)
		mpId = pickFirstNotInUse(allActiveUses)
		if (mpId !== undefined) {
			return mpId
		}

		// Is there something ending at the same time this starts?
		const activeUsesNotEndingNow = _.filter(filteredInUse, r => r.end === undefined || r.end > req.start)
		mpId = pickFirstNotInUse(activeUsesNotEndingNow)
		if (mpId !== undefined) {
			return mpId
		}

		// TODO - more strategies?

		return undefined
	}

	// Try with all players in use
	let res = tryForInUse(inUse)
	if (res !== undefined) {
		return res
	}

	// Try again with optional ones ignored
	res = tryForInUse(_.filter(inUse, r => !r.optional))
	if (res !== undefined) {
		return res
	}

	// TODO - more strategies?

	// Nothing was free
	return undefined
}

export function doesRequestOverlap(thisReq: ActiveRequest, other: ActiveRequest) {
	if (thisReq.id === other.id) {
		return false
	}

	if (other.player === undefined) {
		return false
	}

	if (thisReq.start >= other.start && thisReq.start < (other.end || Infinity)) {
		return true
	}

	if (other.start >= thisReq.start && other.start < (thisReq.end || Infinity)) {
		return true
	}

	return false
}

export function resolveMediaPlayerAssignments<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	context: ITimelineEventContext,
	config: ShowStyleConfig,
	previousAssignmentRev: SessionToPlayerMap,
	resolvedPieces: Array<IBlueprintResolvedPieceInstance<PieceMetaData>>
) {
	const debugLog = config.studio.ABPlaybackDebugLogging
	const sessionRequests = calculateSessionTimeRanges(context, resolvedPieces)

	// In future this may want a better fit algorithm than this. This only applies if being done for multiple clips playing simultaneously, and more players

	// Convert requests into a sorted array
	const activeRequests: ActiveRequest[] = []
	for (const sessionId of Object.keys(sessionRequests)) {
		const r = sessionRequests[sessionId]
		if (r) {
			const prev = previousAssignmentRev[sessionId]
			activeRequests.push({
				id: sessionId,
				start: r.start,
				end: r.end,
				player: prev ? prev.playerId.toString() : undefined, // Persist previous assignments
				type: prev && prev.lookahead ? MediaPlayerClaimType.Preloaded : MediaPlayerClaimType.Active,
				optional: r.optional
			})
		}
	}
	_.sortBy(activeRequests, r => r.start)

	// Go through and assign players
	if (debugLog) {
		context.logWarning('all reqs' + JSON.stringify(activeRequests, undefined, 4))
	}

	for (const req of activeRequests) {
		if (req.player !== undefined) {
			// Keep existing assignment
			if (debugLog) {
				context.logWarning('Retained mp' + req.player + ' for ' + req.id)
			}
			continue
		}

		const otherActive = _.filter(activeRequests, r => doesRequestOverlap(req, r))

		if (debugLog) {
			context.logWarning(`for ${JSON.stringify(req)} there is: ${JSON.stringify(otherActive, undefined, 4)}`)
		}

		// TODO - what about playing the same piece back-to-back?

		const nextPlayerId = findNextAvailablePlayer(config, otherActive, req)
		if (nextPlayerId === undefined) {
			context.logWarning('All the mediaplayers are in use (' + req.id + ')!')
		} else {
			for (const o of otherActive) {
				if (o.player === nextPlayerId) {
					if (debugLog) {
						context.logWarning('Stole mp from ' + o.id)
					}
					o.player = undefined
				}
			}
			req.player = nextPlayerId
			if (debugLog) {
				context.logWarning('Assigned mp' + req.player + ' to ' + req.id + '_' + JSON.stringify(req))
			}
		}
	}
	if (debugLog) {
		context.logWarning('result' + JSON.stringify(activeRequests))
	}

	return activeRequests
}

function updateObjectsToMediaPlayer<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	context: ITimelineEventContext,
	config: ShowStyleConfig,
	playerId: number,
	objs: OnGenerateTimelineObj[],
	sourceLayers: ABSourceLayers
) {
	for (const obj of objs) {
		// Mutate each object to the correct player
		if (obj.content.deviceType === TSR.DeviceType.CASPARCG) {
			if (obj.layer === sourceLayers.Caspar.ClipPending) {
				obj.layer = CasparPlayerClip(playerId)
			} else if (obj.lookaheadForLayer === sourceLayers.Caspar.ClipPending) {
				// This works on the assumption that layer will contain lookaheadForLayer, but not the exact syntax.
				// Hopefully this will be durable to any potential future core changes
				obj.layer = (obj.layer + '').replace(obj.lookaheadForLayer.toString(), CasparPlayerClip(playerId))
				obj.lookaheadForLayer = CasparPlayerClip(playerId)
			} else {
				context.logWarning(`Moving object to mediaPlayer that probably shouldnt be? (from layer: ${obj.layer})`)
				// context.notifyUserWarning(obj)
			}
		} else if (obj.content.deviceType === TSR.DeviceType.ATEM) {
			let atemInput = _.find(config.mediaPlayers, mp => mp.id === playerId.toString())
			if (!atemInput) {
				context.logWarning(`Trying to find atem input for unknown mediaPlayer: #${playerId}`)
				atemInput = { id: playerId.toString(), val: config.studio.AtemSource.Default.toString() }
			}

			const atemObj = obj as TSR.TimelineObjAtemAny
			if (atemObj.content.type === TSR.TimelineContentTypeAtem.ME) {
				const atemObj2 = atemObj as TSR.TimelineObjAtemME
				if (atemObj2.classes?.includes('ab_on_preview')) {
					atemObj2.content.me.previewInput = Number(atemInput.val) || 0
				} else {
					atemObj2.content.me.input = Number(atemInput.val) || 0
				}
			} else if (atemObj.content.type === TSR.TimelineContentTypeAtem.AUX) {
				const atemObj2 = atemObj as TSR.TimelineObjAtemAUX
				atemObj2.content.aux.input = Number(atemInput.val) || 0
			} else if (atemObj.content.type === TSR.TimelineContentTypeAtem.SSRC) {
				const atemObj2 = atemObj as TSR.TimelineObjAtemSsrc
				// Find box with no source
				const input = Number(atemInput.val) || 0
				atemObj2.content.ssrc.boxes.forEach((box, i) => {
					if (box.source === -1) {
						atemObj2.content.ssrc.boxes[i].source = input // Pgm box
					}
				})
			} else {
				context.logWarning(
					`Trying to move ATEM object of unknown type (${atemObj.content.type}) for media player assignment`
				)
			}
		} else if (obj.content.deviceType === TSR.DeviceType.SISYFOS) {
			if (obj.layer === sourceLayers.Sisyfos.ClipPending) {
				// TODO: Change when adding more servers
				obj.layer = playerId === 1 ? sourceLayers.Sisyfos.PlayerA : sourceLayers.Sisyfos.PlayerB
			} else if (obj.lookaheadForLayer === sourceLayers.Sisyfos.ClipPending) {
				// This works on the assumption that layer will contain lookaheadForLayer, but not the exact syntax.
				// Hopefully this will be durable to any potential future core changes

				const targetPlayer = playerId === 1 ? sourceLayers.Sisyfos.PlayerA : sourceLayers.Sisyfos.PlayerB

				// TODO: Change when adding more servers
				obj.layer = (obj.layer + '').replace(obj.lookaheadForLayer.toString(), targetPlayer)
				obj.lookaheadForLayer = targetPlayer
			} else {
				context.logWarning(`Moving object to mediaPlayer that probably shouldnt be? (from layer: ${obj.layer})`)
				// context.notifyUserWarning(obj)
			}
		} else if (obj.content.deviceType === TSR.DeviceType.ABSTRACT) {
			if (obj.layer === AbstractLLayer.ServerEnablePending) {
				obj.layer = AbstractLLayerServerEnable(playerId)
			}
		} else {
			context.logWarning(
				`Trying to move object of unknown type (${obj.content.deviceType}) for media player assignment`
			)
		}
	}
}

export function assignMediaPlayers<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	context: ITimelineEventContext,
	config: ShowStyleConfig,
	timelineObjs: OnGenerateTimelineObj[],
	previousAssignment: TimelinePersistentStateExt['activeMediaPlayers'],
	resolvedPieces: Array<IBlueprintResolvedPieceInstance<PieceMetaData>>,
	sourceLayers: ABSourceLayers
): TimelinePersistentStateExt['activeMediaPlayers'] {
	const previousAssignmentRev = reversePreviousAssignment(previousAssignment, timelineObjs)
	const activeRequests = resolveMediaPlayerAssignments(context, config, previousAssignmentRev, resolvedPieces)

	return applyMediaPlayersAssignments(
		context,
		config,
		timelineObjs,
		previousAssignmentRev,
		activeRequests,
		sourceLayers,
		resolvedPieces
	)
}
export function applyMediaPlayersAssignments<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	context: ITimelineEventContext,
	config: ShowStyleConfig,
	timelineObjs: OnGenerateTimelineObj[],
	previousAssignmentRev: SessionToPlayerMap,
	activeRequests: ActiveRequest[],
	sourceLayers: ABSourceLayers,
	resolvedPieces: IBlueprintResolvedPieceInstance[]
): TimelinePersistentStateExt['activeMediaPlayers'] {
	const debugLog = config.studio.ABPlaybackDebugLogging
	const newAssignments: TimelinePersistentStateExt['activeMediaPlayers'] = {}
	const persistAssignment = (sessionId: string, playerId: number, lookahead: boolean) => {
		let ls = newAssignments[playerId]
		if (!ls) {
			newAssignments[playerId] = ls = []
		}
		ls.push({ sessionId, playerId, lookahead })
	}

	// collect objects by their sessionId
	const labelledObjs = (timelineObjs as Array<TimelineBlueprintExt & OnGenerateTimelineObj>).filter(
		o => o.metaData && o.metaData.mediaPlayerSession
	)
	const groupedObjs = _.groupBy(labelledObjs, o => {
		const sessionId = (o.metaData || {}).mediaPlayerSession
		if (sessionId === undefined || sessionId === '' || sessionId === MEDIA_PLAYER_AUTO) {
			const piece = resolvedPieces.find(p => p._id === o.pieceInstanceId)
			return piece?.infinite?.infinitePieceId || o.pieceInstanceId || MEDIA_PLAYER_AUTO
		} else {
			return sessionId
		}
	})

	// Apply the known assignments
	const remainingGroups: Array<{ id: string; objs: Array<TimelineBlueprintExt & OnGenerateTimelineObj> }> = []
	for (const groupId of Object.keys(groupedObjs)) {
		const group = groupedObjs[groupId]
		const request = _.find(activeRequests, req => req.id === groupId)
		if (request) {
			if (request.player) {
				// TODO - what if player is undefined?
				updateObjectsToMediaPlayer(context, config, Number(request.player) || 0, group, sourceLayers)
				persistAssignment(groupId, Number(request.player) || 0, false)
			}
		} else {
			remainingGroups.push({ id: groupId, objs: group })
		}
	}

	// Find the groups needing more work
	// Not matching a request means this is either a rogue object in a mislabeled piece, or lookahead for a future part.
	const unknownGroups: Array<{ id: string; objs: Array<TimelineBlueprintExt & OnGenerateTimelineObj> }> = []
	const lookaheadGroups: Array<{ id: string; objs: Array<TimelineBlueprintExt & OnGenerateTimelineObj> }> = []

	for (const grp of remainingGroups) {
		// If this is lookahead for a future part (no end set on the object)
		const isFuturePartLookahead = _.some(
			grp.objs,
			o =>
				!!o.isLookahead /*|| (o as any).wasLookahead*/ &&
				(o.enable as TSR.Timeline.TimelineEnable).duration === undefined &&
				(o.enable as TSR.Timeline.TimelineEnable).end === undefined
		)
		if (isFuturePartLookahead) {
			lookaheadGroups.push(grp)
		} else {
			unknownGroups.push(grp)
		}
	}

	// These are the groups that shouldn't exist, so are likely a bug. There isnt a lot we can do beyond warn about the potential bug
	for (const grp of unknownGroups) {
		const objIds = _.map(grp.objs, o => o.id)
		const prev = previousAssignmentRev[grp.id]
		if (prev) {
			updateObjectsToMediaPlayer(context, config, prev.playerId, grp.objs, sourceLayers)
			persistAssignment(grp.id, prev.playerId, false)
			context.logWarning(
				`Found unexpected session remaining on the timeline: "${grp.id}" belonging to ${objIds}. This may cause playback glitches`
			)
		} else {
			context.logWarning(
				`Found unexpected unknown session on the timeline: "${grp.id}" belonging to ${objIds}. This could result in black playback`
			)
		}
	}

	interface MediaPlayerUsageEnd {
		playerId: number
		end: number
	}

	let mediaPlayerUsageEnd: MediaPlayerUsageEnd[] = []
	for (const mp of config.mediaPlayers) {
		// Block players with an 'infinite' clip from being used for lookahead
		const endTimes = _.map(
			_.filter(activeRequests, s => s.player === mp.id),
			s => s.end
		)
		const realEndTimes = _.filter(endTimes, e => e !== undefined) as number[]
		if (endTimes.length === realEndTimes.length) {
			// No infinite(undefined) ones, so find the highest end
			mediaPlayerUsageEnd.push({
				playerId: Number(mp.id) || 0,
				end: realEndTimes.length === 0 ? 0 : _.max(realEndTimes)
			})
		}
	}
	// Sort by the end time
	mediaPlayerUsageEnd = _.sortBy(mediaPlayerUsageEnd, u => u.end).reverse()

	// Finish up with allocating lookahead based on what is left. If there is no space left that is not a problem until playback is closer
	for (const grp of lookaheadGroups) {
		if (debugLog) {
			context.logWarning(`Attempting assignment for future lookahead ${grp.id}`)
		}
		const prev = previousAssignmentRev[grp.id]
		let nextPlayer: MediaPlayerUsageEnd | undefined

		if (debugLog) {
			context.logWarning('Players are available at:' + JSON.stringify(mediaPlayerUsageEnd))
		}

		const prevAssignment = prev ? _.find(mediaPlayerUsageEnd, mp => mp.playerId === prev.playerId) : undefined
		if (prevAssignment && (prevAssignment.end === 0 || false)) {
			// TODO - decide if the previous assignment is still suitable
			if (debugLog) {
				context.logWarning('lookahead can retain existing player')
			}
			nextPlayer = prevAssignment
			mediaPlayerUsageEnd = _.without(mediaPlayerUsageEnd, prevAssignment)
		} else {
			// Take the next from the queue, as it is the next freed
			nextPlayer = mediaPlayerUsageEnd.pop()
		}

		if (nextPlayer === undefined) {
			if (debugLog) {
				context.logWarning('no player available for lookahead. This likely means one is in use by a playing clip')
			}
		} else {
			if (debugLog) {
				context.logWarning(`lookahead chose: ${nextPlayer.playerId} (Free after: ${nextPlayer.end})`)
			}

			// Record the assignment, so that the next update can try and reuse it
			persistAssignment(grp.id, nextPlayer.playerId, true)

			updateObjectsToMediaPlayer(context, config, nextPlayer.playerId, grp.objs, sourceLayers)
		}
	}

	if (debugLog) {
		context.logWarning('new assignments:' + JSON.stringify(newAssignments))
	}
	return newAssignments
}
