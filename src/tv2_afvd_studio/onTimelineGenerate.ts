import {
	BlueprintResultTimeline,
	IBlueprintResolvedPieceInstance,
	ITimelineEventContext,
	OnGenerateTimelineObj,
	PartEndState,
	TimelinePersistentState
} from 'blueprints-integration'
import { onTimelineGenerate, PieceMetaData, TimelineContext } from 'tv2-common'
import { CasparLLayer, SisyfosLLAyer } from './layers'
import { GALLERY_UNIFORM_CONFIG } from './uniformConfig'

export function onTimelineGenerateAFVD(
	coreContext: ITimelineEventContext,
	timeline: OnGenerateTimelineObj[],
	previousPersistentState: TimelinePersistentState | undefined,
	previousPartEndState: PartEndState | undefined,
	resolvedPieces: Array<IBlueprintResolvedPieceInstance<PieceMetaData>>
): Promise<BlueprintResultTimeline> {
	const context = new TimelineContext(coreContext, GALLERY_UNIFORM_CONFIG)
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
