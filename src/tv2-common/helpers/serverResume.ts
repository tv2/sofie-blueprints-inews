import {
	IActionExecutionContext,
	IBlueprintActionTriggerMode,
	IBlueprintPartInstance,
	IBlueprintResolvedPieceInstance,
	ICommonContext,
	VTContent
} from '@tv2media/blueprints-integration'
import { PartEndStateExt, t } from 'tv2-common'
import { SharedSourceLayers } from 'tv2-constants'
import _ = require('underscore')
import { DVEPieceMetaData } from '../content'

/** If the seek position is closer to the end of the file than this value, it will be reset to 0. */
const REMAINING_DURATION_BEFORE_RESET = 2 * 1000

export interface ServerPosition {
	fileName: string
	lastEnd: number
	isPlaying: boolean
	fromPartInstanceId: string
}

export enum ServerSelectMode {
	RESUME = 'resume',
	RESET = 'reset'
}

export function getServerSeek(
	lastServerPosition: ServerPosition | undefined,
	fileName: string,
	mediaObjectDuration?: number,
	triggerMode?: string
): number {
	if (triggerMode === ServerSelectMode.RESET) {
		return 0
	}
	if (lastServerPosition?.fileName === fileName && !lastServerPosition.isPlaying) {
		if (!mediaObjectDuration) {
			return lastServerPosition.lastEnd
		}
		const seek = lastServerPosition.lastEnd % mediaObjectDuration
		const remainingDuration = mediaObjectDuration - seek
		if (remainingDuration > REMAINING_DURATION_BEFORE_RESET) {
			return seek
		}
	}
	return 0
}

export async function getServerPosition(
	context: IActionExecutionContext,
	replacingCurrentPieceWithOffset?: number
): Promise<ServerPosition | undefined> {
	const partInstance = await context.getPartInstance('current')
	if (!partInstance) {
		throw new Error('Missing current PartInstance while calculating serverOffsets')
	}

	const pieceEnd =
		replacingCurrentPieceWithOffset !== undefined
			? context.getCurrentTime() + replacingCurrentPieceWithOffset
			: undefined

	return getServerPositionForPartInstance(
		context,
		partInstance,
		await context.getResolvedPieceInstances('current'),
		pieceEnd
	)
}

/**
 * Calculate the offsets for clips based on the pieceinstances that have already been played.
 */
export function getServerPositionForPartInstance(
	_context: ICommonContext,
	partInstance: IBlueprintPartInstance,
	pieceInstances: IBlueprintResolvedPieceInstance[],
	setCurrentPieceToNow0?: number
): ServerPosition | undefined {
	const setCurrentPieceToNow =
		setCurrentPieceToNow0 !== undefined && partInstance.timings?.startedPlayback
			? setCurrentPieceToNow0 - partInstance.timings.startedPlayback
			: undefined

	const previousPartEndState = partInstance.previousPartEndState as Partial<PartEndStateExt> | undefined
	const previousServerPosition = previousPartEndState?.serverPosition

	const currentPiecesWithServer = _.sortBy(pieceInstances.filter(shouldPreservePosition), p => p.resolvedStart)

	let currentServerPosition =
		previousPartEndState?.segmentId === partInstance.segmentId ? previousServerPosition : undefined

	for (const pieceInstance of currentPiecesWithServer) {
		const pieceDuration =
			pieceInstance.resolvedDuration ||
			(setCurrentPieceToNow !== undefined ? setCurrentPieceToNow - pieceInstance.resolvedStart : undefined)

		const content = pieceInstance.piece.content as VTContent | undefined
		if (pieceInstance.piece.sourceLayerId === SharedSourceLayers.PgmServer && content) {
			const pieceSeek = content.seek ?? 0
			const pieceClipEnd = pieceSeek + (pieceDuration ?? 0)
			const isPlaying =
				(previousServerPosition?.fileName === content.fileName && previousServerPosition?.isPlaying) || !pieceDuration
			currentServerPosition = {
				fileName: content.fileName,
				lastEnd: pieceClipEnd,
				isPlaying,
				fromPartInstanceId: partInstance._id
			}
		} else if (pieceInstance.piece.sourceLayerId === SharedSourceLayers.PgmDVEAdLib) {
			const serverPlaybackTiming = (pieceInstance.piece.metaData as DVEPieceMetaData | undefined)?.serverPlaybackTiming
			if (serverPlaybackTiming) {
				for (const timing of serverPlaybackTiming) {
					const start = timing.start ?? pieceInstance.resolvedStart
					const end = timing.end ?? (pieceDuration ? pieceInstance.resolvedStart + pieceDuration : undefined)
					if (currentServerPosition && end) {
						currentServerPosition.lastEnd += end - start
						currentServerPosition.fromPartInstanceId = partInstance._id
					}
				}
			}
		}
	}

	const inTransitionDuration = partInstance.part.inTransition?.previousPartKeepaliveDuration
	if (
		currentServerPosition &&
		!currentPiecesWithServer.length &&
		inTransitionDuration &&
		currentServerPosition?.fromPartInstanceId === previousPartEndState?.partInstanceId
	) {
		currentServerPosition.lastEnd += inTransitionDuration
	}

	return currentServerPosition
}

export function shouldPreservePosition(pieceInstance: IBlueprintResolvedPieceInstance): boolean {
	return (
		!!pieceInstance.dynamicallyInserted &&
		(pieceInstance.piece.sourceLayerId === SharedSourceLayers.PgmServer ||
			(pieceInstance.piece.sourceLayerId === SharedSourceLayers.PgmDVEAdLib &&
				!!(pieceInstance.piece.metaData as DVEPieceMetaData | undefined)?.serverPlaybackTiming))
	)
}

export function hasTransition(pieceInstance: IBlueprintResolvedPieceInstance): boolean {
	return pieceInstance.piece.sourceLayerId === SharedSourceLayers.PgmJingle
}

export function getServerAdLibTriggerModes(): IBlueprintActionTriggerMode[] {
	return [
		{
			data: ServerSelectMode.RESUME,
			display: {
				_rank: 0,
				label: t('Resume')
			}
		},
		{
			data: ServerSelectMode.RESET,
			display: {
				_rank: 1,
				label: t('From Start')
			}
		}
	]
}
