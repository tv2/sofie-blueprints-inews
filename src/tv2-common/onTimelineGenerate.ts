import {
	BlueprintResultTimeline,
	IBlueprintResolvedPieceInstance,
	OnGenerateTimelineObj,
	PartEndState,
	PartEventContext,
	PieceMetaData as PieceMetaDataBase,
	RundownContext,
	TimelineObjectCoreExt,
	TimelinePersistentState,
	TSR
} from 'tv-automation-sofie-blueprints-integration'
import * as _ from 'underscore'
import { TV2BlueprintConfigBase, TV2StudioConfigBase } from './blueprintConfig'
import { ABSourceLayers, assignMediaPlayers } from './helpers'

export interface PartEndStateExt extends PartEndState {
	stickySisyfosLevels: { [key: string]: 0 | 1 | 2 | undefined }
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
		/** Use for when onTimelineGenerate should assign based on some conditions */
		mediaPlayerSessionToAssign?: string
		dveAdlibEnabler?: string // Used to restore the original while rule after lookahead
	}
}

export interface PieceMetaData extends PieceMetaDataBase {
	stickySisyfosLevels?: { [key: string]: { value: number; followsPrevious: boolean } }
	mediaPlayerSessions?: string[]
	mediaPlayerOptional?: boolean
}

export interface PartMetaData {
	segmentExternalId: string
}

export function onTimelineGenerate<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	context: PartEventContext,
	timeline: OnGenerateTimelineObj[],
	previousPersistentState: TimelinePersistentState | undefined,
	previousPartEndState: PartEndState | undefined,
	resolvedPieces: IBlueprintResolvedPieceInstance[],
	getConfig: (context: PartEventContext) => ShowStyleConfig,
	sourceLayers: ABSourceLayers,
	_casparLayerClipPending: string,
	_atemLayerNext: string
): Promise<BlueprintResultTimeline> {
	const previousPartEndState2 = previousPartEndState as PartEndStateExt | undefined
	// const replacedSessions: { [from: string]: string } = {} // TODO: Replace with map

	const config = getConfig(context)

	// Find server in pgm
	/*const activeServerObj = timeline.find(o => o.layer.toString() === casparLayerClipPending && !o.isLookahead)
	const activeMediaPlayerSession = (activeServerObj?.metaData as TimelineBlueprintExt['metaData'])?.mediaPlayerSession

	const lookaheadServerObjIndex = timeline.findIndex(
		o =>
			o.layer.toString() === OfftubeAbstractLLayer.OfftubeAbstractLLayerAbstractLookahead &&
			o.isLookahead &&
			o.metaData?.mediaPlayerSessionToAssign !== undefined &&
			o.priority &&
			o.priority > 0 &&
			!!o.id.match(/future/)
	)
	const lookaheadServerObj = lookaheadServerObjIndex > -1 ? timeline[lookaheadServerObjIndex] : undefined
	const lookaheadMediaPlayerSession = (lookaheadServerObj?.metaData as TimelineBlueprintExt['metaData'])
		?.mediaPlayerSessionToAssign
	const lookaheadServerEnableIndex = timeline.findIndex(
		o =>
			o.layer.toString() === atemLayerNext &&
			o.isLookahead &&
			o.classes?.includes(Enablers.OFFTUBE_ENABLE_SERVER_LOOKAHEAD) &&
			o.priority &&
			o.priority > 0 &&
			!!o.id.match(/future/) &&
			!resolvedPieces.some(piece => o.id.includes(piece._id))
	)

	if (lookaheadServerEnableIndex > -1 && lookaheadMediaPlayerSession && lookaheadServerObj) {
		timeline[lookaheadServerEnableIndex].metaData = {
			...lookaheadServerObj.metaData,
			mediaPlayerSession: lookaheadMediaPlayerSession
		}
		timeline.splice(lookaheadServerObjIndex, 1)
	} else {
		if (lookaheadServerObjIndex > -1 && lookaheadServerObj) {
			timeline.splice(lookaheadServerObjIndex, 1)
		}

		timeline = timeline.filter(
			o =>
				!(
					o.layer === atemLayerNext &&
					o.metaData &&
					o.metaData.context &&
					// (o.metaData.context.match(/serverProgramEnabler/) || o.metaData.context.match(/dveProgramEnabler/)) &&
					resolvedPieces.some(piece => o.id.includes(piece._id))
				)
		)
	}

	;[
		OfftubeAtemLLayer.AtemSSrcDefault,
		OfftubeCasparLLayer.CasparCGDVEFrame,
		OfftubeCasparLLayer.CasparCGDVEKey,
		OfftubeCasparLLayer.CasparCGDVETemplate
	].forEach(layer => {
		const dveSetAsNextIncurrentPartIndex = timeline.findIndex(
			o =>
				o.layer.toString() === OfftubeAbstractLLayer.OfftubeAbstractLLayerPgmEnabler &&
				o.classes?.includes('offtube_enable_dve') && // TODO: This has gone away now
				!o.isLookahead &&
				resolvedPieces.some(piece => piece._id === o.pieceInstanceId) &&
				!o.id.match(/previous/)
		)
		const dveLayoutInCurrentPartIndex = timeline.findIndex(
			o =>
				o.layer.toString() === layer &&
				!o.isLookahead &&
				!o.id.match(/previous/) &&
				!o.id.match(/future/) &&
				o.classes?.includes(ControlClasses.NOLookahead)
		)
		const dveLayoutInFuturePartIndex = timeline.findIndex(
			o =>
				o.layer.toString() === layer &&
				o.isLookahead &&
				!o.id.match(/previous/) &&
				!!o.id.match(/future/) &&
				o.classes?.includes(ControlClasses.NOLookahead)
		)

		if (dveLayoutInFuturePartIndex > -1 && dveSetAsNextIncurrentPartIndex === -1 && dveLayoutInCurrentPartIndex > -1) {
			const current = timeline[dveLayoutInCurrentPartIndex]
			timeline = timeline.filter(
				o =>
					!(
						o.layer.toString() === layer &&
						!o.id.match(/previous/) &&
						!o.id.match(/future/) &&
						o.classes?.includes(ControlClasses.NOLookahead) &&
						o.pieceInstanceId &&
						current.pieceInstanceId &&
						!!o.pieceInstanceId.match(current.pieceInstanceId)
					)
			)
		}
	})

	let extraObjs: OnGenerateTimelineObj[] = []

	_.each(timeline, obj => {
		if (obj.metaData && obj.metaData.mediaPlayerSessionToAssign) {
			if (!obj.isLookahead) {
				obj.metaData = {
					...obj.metaData,
					mediaPlayerSession: obj.metaData.mediaPlayerSessionToAssign
				}
			}

			if (obj.layer === atemLayerNext || obj.layer === OfftubeAtemLLayer.AtemMEClean) {
				// tslint:disable-next-line: no-object-literal-type-assertion
				extraObjs.push({
					...obj,
					_id: `${(obj as any)._id}_server_aux`,
					id: `${obj.id}_server_aux`,
					layer: OfftubeAtemLLayer.AtemAuxServerLookahead,
					content: {
						deviceType: TSR.DeviceType.ATEM,
						type: TSR.TimelineContentTypeAtem.AUX,
						aux: {}
					},
					metaData: {
						...obj.metaData,
						originalLayer: obj.layer
					}
				} as OnGenerateTimelineObj)
			}
		}
	})

	// Get rid of anything in PGM if there's a lookahead available
	if (extraObjs.some(o => o.metaData && o.metaData.originalLayer === atemLayerNext)) {
		extraObjs = extraObjs.filter(o => o.metaData && o.metaData.originalLayer === atemLayerNext)
	}

	timeline = [...timeline, ...extraObjs]

	// Find any placeholders to replace
	const objsToReplace = timeline.filter(
		o => o.classes?.includes(ControlClasses.DVEPlaceholder) && !o.id.match(/^previous/i)
	)

	// Replace contents of placeholder objects
	// TOD: Replace this with an adlib action
	objsToReplace.forEach(objToReplace => {
		const index = timeline.indexOf(objToReplace)
		if (objToReplace && activeServerObj) {
			objToReplace.content = activeServerObj.content
			let replaceMeta = objToReplace.metaData as TimelineBlueprintExt['metaData'] | undefined

			if (activeMediaPlayerSession && replaceMeta && replaceMeta.mediaPlayerSession) {
				replacedSessions[replaceMeta.mediaPlayerSession] = activeMediaPlayerSession
				replaceMeta = {
					...replaceMeta,
					mediaPlayerSession: activeMediaPlayerSession
				}
			}

			objToReplace.metaData = replaceMeta
		}

		timeline[index] = objToReplace
	})

	// Replace all sessions that have been overwritten
	_.each(timeline, o => {
		const meta = o.metaData as TimelineBlueprintExt['metaData'] | undefined
		if (meta && meta.mediaPlayerSession) {
			if (Object.keys(replacedSessions).includes(meta.mediaPlayerSession)) {
				meta.mediaPlayerSession = replacedSessions[meta.mediaPlayerSession]
				o.metaData = meta
			}
		}
	})

	// Do the same for pieces
	_.each(resolvedPieces, piece => {
		if (piece.piece.metaData) {
			const meta = piece.piece.metaData as PieceMetaData
			if (meta.mediaPlayerSessions) {
				piece.piece.metaData.mediaPlayerSessions = meta.mediaPlayerSessions.map(session => {
					if (Object.keys(replacedSessions).includes(session)) {
						return replacedSessions[session]
					}

					return session
				})
			}
		} else if (lookaheadMediaPlayerSession && piece.piece.content && piece.piece.content.timelineObjects) {
			const objToCopyMediaPlayerSessionToIndex = (piece.piece.content
				.timelineObjects as TimelineBlueprintExt[]).findIndex(obj =>
				obj.classes?.includes(ControlClasses.CopyMediaPlayerSession)
			)

			if (objToCopyMediaPlayerSessionToIndex > -1) {
				piece.piece.content.metadata = {
					mediaPlayerSessions: [lookaheadMediaPlayerSession]
				}
				;(piece.piece.content.timelineObjects[objToCopyMediaPlayerSessionToIndex] as TimelineBlueprintExt).metaData = {
					...(piece.piece.content.timelineObjects[objToCopyMediaPlayerSessionToIndex] as TimelineBlueprintExt).metaData,
					mediaPlayerSession: lookaheadMediaPlayerSession
				}
			}
		}
	})*/

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
			p.piece.enable &&
			(p.piece.enable.start as number) <= time &&
			(!p.piece.enable.end || (p.piece.enable.end as number) >= time)
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
			// obj2.enable &&
			// (obj2.enable.while === '1' || obj2.enable.while === 1)
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
						? previousPartEndState.stickySisfosLevels[key]
						: values.value
			}
		}
	}
}

function isSisyfosSource(obj: Partial<TSR.TimelineObjSisyfosChannel & TimelineObjectCoreExt>) {
	return (
		obj.content &&
		obj.content.deviceType === TSR.DeviceType.SISYFOS &&
		obj.content.type === TSR.TimelineContentTypeSisyfos.CHANNEL
	)
}

export function copyPreviousSisyfosLevels(
	_context: RundownContext,
	timelineObjs: OnGenerateTimelineObj[],
	previousLevels: PartEndStateExt['stickySisyfosLevels'],
	resolvedPieces: IBlueprintResolvedPieceInstance[]
) {
	// This needs to look at previous pieces within the part, to make it work for adlibs
	const sisyfosObjs = (timelineObjs as Array<
		TSR.TimelineObjSisyfosChannel & TimelineBlueprintExt & OnGenerateTimelineObj
	>).filter(isSisyfosSource)

	// Pieces should be ordered, we shall assume that
	const groupedPieces = _.groupBy(resolvedPieces, p => p.piece.enable.start)
	const sisyfosObjectsByPiece = _.groupBy(sisyfosObjs, o => o.pieceInstanceId)
	for (const k of Object.keys(groupedPieces)) {
		const pieces = groupedPieces[k]
		const pieceIds = _.pluck(pieces, '_id') // getPieceGroupId(p._id))
		// Find all the objs that start here
		const objs = _.flatten(Object.values(_.pick(sisyfosObjectsByPiece, pieceIds)))
		// Stop if no objects
		if (objs.length === 0 || !pieces[0].piece.enable) {
			return
		}

		// Find the active pieces before this time
		const time = pieces[0].piece.enable.start as number

		// Start of part
		if (time !== 0) {
			// Calculate the previous 'state'
			const activePieces = resolvedPieces.filter(p => {
				if (!p.piece.enable) {
					return false
				}

				const start = p.piece.enable.start as number // Core should be always setting this to a number
				const duration = p.piece.playoutDuration

				// Piece must start before target, and end at or after target starts
				return start < time && (duration === undefined || start + duration >= time)
			})

			const newPreviousLevels: PartEndStateExt['stickySisyfosLevels'] = {}
			for (const piece of activePieces) {
				const metadata = piece.piece.metaData as PieceMetaData | undefined
				if (metadata && metadata.stickySisyfosLevels) {
					for (const id of Object.keys(metadata.stickySisyfosLevels)) {
						// context.warning(
						// 	`New level from ${piece._id} for ${id} of ${JSON.stringify(val)} (last was ${previousLevels[id]})`
						// )
						if (newPreviousLevels[id]) {
							// context.warning('duplicate level, going with the first!' + id)
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

		// Apply newly calculated levels
		for (const sisyfosObj of objs) {
			const contentObj = sisyfosObj.content
			const previousVal = previousLevels[sisyfosObj.layer + '']
			if (contentObj && previousVal !== undefined && sisyfosObj.metaData && sisyfosObj.metaData.sisyfosPersistLevel) {
				contentObj.isPgm = previousVal
			}
		}
	}
}
