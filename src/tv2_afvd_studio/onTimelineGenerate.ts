import {
	BlueprintResultTimeline,
	IBlueprintResolvedPieceInstance,
	ITimelineEventContext,
	OnGenerateTimelineObj,
	PartEndState,
	TimelinePersistentState
} from 'blueprints-integration'
import { ExtendedTimelineContext, onTimelineGenerate, PieceMetaData } from 'tv2-common'
import { CasparLLayer, SisyfosLLAyer } from './layers'

export function onTimelineGenerateAFVD(
	coreContext: ITimelineEventContext,
	timeline: OnGenerateTimelineObj[],
	previousPersistentState: TimelinePersistentState | undefined,
	previousPartEndState: PartEndState | undefined,
	resolvedPieces: Array<IBlueprintResolvedPieceInstance<PieceMetaData>>
): Promise<BlueprintResultTimeline> {
	const context = new ExtendedTimelineContext(coreContext)
	return onTimelineGenerate(context, timeline, previousPersistentState, previousPartEndState, resolvedPieces, {
		Caspar: {
			ClipPending: CasparLLayer.CasparPlayerClipPending
		},
		Sisyfos: {
			ClipPending: SisyfosLLAyer.SisyfosSourceClipPending,
			PlayerA: SisyfosLLAyer.SisyfosSourceServerA,
			PlayerB: SisyfosLLAyer.SisyfosSourceServerB
		}
	})
}
