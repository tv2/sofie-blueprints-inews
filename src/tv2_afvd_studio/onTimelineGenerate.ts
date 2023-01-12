import { TSR } from '@sofie-automation/blueprints-integration'
import {
	BlueprintResultTimeline,
	IBlueprintResolvedPieceInstance,
	ITimelineEventContext,
	OnGenerateTimelineObj,
	PartEndState,
	TimelinePersistentState
} from 'blueprints-integration'
import { onTimelineGenerate, PieceMetaData } from 'tv2-common'
import { getConfig } from '../tv2_afvd_showstyle/helpers/config'
import { AtemLLayer, CasparLLayer, SisyfosLLAyer } from './layers'

export function onTimelineGenerateAFVD(
	context: ITimelineEventContext,
	timeline: Array<OnGenerateTimelineObj<TSR.TSRTimelineContent>>,
	previousPersistentState: TimelinePersistentState | undefined,
	previousPartEndState: PartEndState | undefined,
	resolvedPieces: Array<IBlueprintResolvedPieceInstance<PieceMetaData>>
): Promise<BlueprintResultTimeline> {
	return onTimelineGenerate(
		context,
		timeline,
		previousPersistentState,
		previousPartEndState,
		resolvedPieces,
		getConfig,
		{
			Caspar: {
				ClipPending: CasparLLayer.CasparPlayerClipPending
			},
			Sisyfos: {
				ClipPending: SisyfosLLAyer.SisyfosSourceClipPending,
				PlayerA: SisyfosLLAyer.SisyfosSourceServerA,
				PlayerB: SisyfosLLAyer.SisyfosSourceServerB
			}
		},
		CasparLLayer.CasparPlayerClipPending,
		AtemLLayer.AtemMEProgram
	)
}
