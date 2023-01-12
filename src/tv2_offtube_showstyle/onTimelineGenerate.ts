import {
	BlueprintResultTimeline,
	IBlueprintResolvedPieceInstance,
	ITimelineEventContext,
	OnGenerateTimelineObj,
	PartEndState,
	TimelinePersistentState,
	TSR
} from 'blueprints-integration'
import {
	disablePilotWipeAfterJingle,
	onTimelineGenerate,
	PartEndStateExt,
	PieceMetaData,
	TimelineBlueprintExt
} from 'tv2-common'
import { SharedGraphicLLayer, TallyTags } from 'tv2-constants'
import { OfftubeAtemLLayer, OfftubeCasparLLayer, OfftubeSisyfosLLayer } from '../tv2_offtube_studio/layers'
import { getConfig } from './helpers/config'

export function onTimelineGenerateOfftube(
	context: ITimelineEventContext,
	timeline: Array<OnGenerateTimelineObj<TSR.TSRTimelineContent>>,
	previousPersistentState: TimelinePersistentState | undefined,
	previousPartEndState: PartEndState | undefined,
	resolvedPieces: Array<IBlueprintResolvedPieceInstance<PieceMetaData>>
): Promise<BlueprintResultTimeline> {
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
				ClipPending: OfftubeCasparLLayer.CasparPlayerClipPending
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
	_context: ITimelineEventContext,
	timeline: Array<OnGenerateTimelineObj<TSR.TSRTimelineContent>>,
	previousPartEndState: PartEndStateExt | undefined,
	resolvedPieces: IBlueprintResolvedPieceInstance[]
) {
	const isFull = resolvedPieces.find(p => p.piece.tags?.includes(TallyTags.FULL_IS_LIVE))
	for (const obj of timeline) {
		if (
			obj.layer === SharedGraphicLLayer.GraphicLLayerPilot &&
			obj.content.deviceType === TSR.DeviceType.CASPARCG &&
			(obj.isLookahead ||
				(isFull && !previousPartEndState?.fullFileName) ||
				(previousPartEndState?.fullFileName &&
					previousPartEndState?.fullFileName === (obj as TimelineBlueprintExt).metaData?.fileName))
		) {
			const obj2 = obj as TSR.TSRTimelineObj<TSR.TimelineContentCasparCGAny> & TimelineBlueprintExt
			// TODO: this needs types
			const payload = obj2.metaData?.templateData?.slots && obj2.metaData?.templateData?.slots['250_full']?.payload
			if (obj2.content.type === TSR.TimelineContentTypeCasparCg.TEMPLATE && payload) {
				payload.noAnimation = true
				obj2.content.data = obj2.metaData!.templateData
			}
		}
	}
}
