import {
	BlueprintResultTimeline,
	IBlueprintResolvedPieceInstance,
	OnGenerateTimelineObj,
	PartEndState,
	TimelineEventContext,
	TimelinePersistentState
} from '@sofie-automation/blueprints-integration'
import { onTimelineGenerate } from 'tv2-common'
import * as _ from 'underscore'
import { getConfig } from '../tv2_afvd_showstyle/helpers/config'
import { AtemLLayer, CasparLLayer, SisyfosLLAyer } from './layers'

export function onTimelineGenerateAFVD(
	context: TimelineEventContext,
	timeline: OnGenerateTimelineObj[],
	previousPersistentState: TimelinePersistentState | undefined,
	previousPartEndState: PartEndState | undefined,
	resolvedPieces: IBlueprintResolvedPieceInstance[]
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
