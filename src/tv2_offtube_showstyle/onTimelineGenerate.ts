import {
	BlueprintResultTimeline,
	IBlueprintResolvedPieceInstance,
	OnGenerateTimelineObj,
	PartEndState,
	TimelineEventContext,
	TimelinePersistentState,
	TSR
} from '@sofie-automation/blueprints-integration'
import { disablePilotWipeAfterJingle, onTimelineGenerate, PartEndStateExt, TimelineBlueprintExt } from 'tv2-common'
import { GraphicLLayer, TallyTags } from 'tv2-constants'
import {
	CasparPlayerClip,
	OfftubeAtemLLayer,
	OfftubeCasparLLayer,
	OfftubeSisyfosLLayer
} from '../tv2_offtube_studio/layers'
import { getConfig } from './helpers/config'

export function onTimelineGenerateOfftube(
	context: TimelineEventContext,
	timeline: OnGenerateTimelineObj[],
	previousPersistentState: TimelinePersistentState | undefined,
	previousPartEndState: PartEndState | undefined,
	resolvedPieces: IBlueprintResolvedPieceInstance[]
): Promise<BlueprintResultTimeline> {
	// If we are not in a server, then disable the server adlib piece
	/*const currentPartId = context.part._id
	const currentPieces: { [id: string]: IBlueprintResolvedPieceInstance } = {}
	for (const piece of resolvedPieces) {
		if (piece.piece.partId === currentPartId) {
			currentPieces[piece._id] = piece
		}
	}
	const currentServerOnAir = Object.values(currentPieces).find(
		p => p.piece.sourceLayerId === OfftubeSourceLayer.PgmServer
	)
	if (!currentServerOnAir) {
		const currentAdlibServerPieceGroup = timeline.find(
			obj =>
				obj.isGroup &&
				(obj.layer === OfftubeSourceLayer.SelectedAdLibServer ||
					obj.layer === OfftubeSourceLayer.SelectedAdLibVoiceOver) &&
				obj.pieceInstanceId &&
				currentPieces[obj.pieceInstanceId]
		)
		if (currentAdlibServerPieceGroup) {
			const enableObj = timeline.find(
				obj =>
					(obj as any).inGroup === currentAdlibServerPieceGroup.id &&
					obj.layer === OfftubeAbstractLLayer.OfftubeAbstractLLayerServerEnable
			)
			if (enableObj) {
				// This is the master object that looks for the class coming from OfftubeSourceLayer.PgmServer to say it is on air. We know that doesnt exist here, so ignore it
				enableObj.enable = { while: '0' }
			}
		}
	}*/

	const previousPartEndState2 = previousPartEndState as PartEndStateExt | undefined
	disablePilotWipeAfterJingle(timeline, previousPartEndState2, resolvedPieces)
	disableFirstPilotGFXAnimation(context, timeline, previousPartEndState2, resolvedPieces)

	return onTimelineGenerate(
		context,
		timeline,
		previousPersistentState,
		previousPartEndState,
		resolvedPieces,
		getConfig,
		{
			Caspar: {
				ClipPending: OfftubeCasparLLayer.CasparPlayerClipPending,
				PlayerClip: CasparPlayerClip
			},
			Sisyfos: {
				ClipPending: OfftubeSisyfosLLayer.SisyfosSourceClipPending,
				PlayerA: OfftubeSisyfosLLayer.SisyfosSourceServerA,
				PlayerB: OfftubeSisyfosLLayer.SisyfosSourceServerB
			}
		},
		OfftubeCasparLLayer.CasparPlayerClipPending,
		OfftubeAtemLLayer.AtemMENext
	)
}

export function disableFirstPilotGFXAnimation(
	_context: TimelineEventContext,
	timeline: OnGenerateTimelineObj[],
	previousPartEndState: PartEndStateExt | undefined,
	resolvedPieces: IBlueprintResolvedPieceInstance[]
) {
	const isFull = resolvedPieces.find(p => p.piece.tags?.includes(TallyTags.FULL_IS_LIVE))
	for (const obj of timeline) {
		if (
			obj.layer === GraphicLLayer.GraphicLLayerPilot &&
			obj.content.deviceType === TSR.DeviceType.CASPARCG &&
			(obj.isLookahead ||
				(isFull && !previousPartEndState?.fullFileName) ||
				(previousPartEndState?.fullFileName &&
					previousPartEndState?.fullFileName === (obj as TimelineBlueprintExt).metaData?.fileName))
		) {
			const obj2 = obj as TSR.TimelineObjCasparCGAny & TimelineBlueprintExt
			// TODO: this needs types
			const payload = obj2.metaData?.templateData?.slots && obj2.metaData?.templateData?.slots['250_full']?.payload
			if (obj2.content.type === TSR.TimelineContentTypeCasparCg.TEMPLATE && payload) {
				payload.noAnimation = true
				obj2.content.data = `<templateData>${encodeURI(JSON.stringify(obj2.metaData?.templateData))}</templateData>`
			}
		}
	}
}
