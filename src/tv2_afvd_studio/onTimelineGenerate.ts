import {
	BlueprintResultTimeline,
	IBlueprintPieceDB,
	OnGenerateTimelineObj,
	PartEndState,
	PartEventContext,
	TimelinePersistentState
} from 'tv-automation-sofie-blueprints-integration'
import { onTimelineGenerate } from 'tv2-common'
import * as _ from 'underscore'
import { parseConfig } from '../tv2_afvd_showstyle/helpers/config'
import { AtemLLayer, CasparLLayer, CasparPlayerClip, SisyfosLLAyer } from './layers'

export function onTimelineGenerateAFVD(
	context: PartEventContext,
	timeline: OnGenerateTimelineObj[],
	previousPersistentState: TimelinePersistentState | undefined,
	previousPartEndState: PartEndState | undefined,
	resolvedPieces: IBlueprintPieceDB[]
): Promise<BlueprintResultTimeline> {
	return onTimelineGenerate(
		context,
		timeline,
		previousPersistentState,
		previousPartEndState,
		resolvedPieces,
		parseConfig,
		{
			Caspar: {
				ClipPending: CasparLLayer.CasparPlayerClipPending,
				PlayerClip: CasparPlayerClip
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
