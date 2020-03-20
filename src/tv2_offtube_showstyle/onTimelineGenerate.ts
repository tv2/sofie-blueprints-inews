import {
	BlueprintResultTimeline,
	IBlueprintPieceDB,
	OnGenerateTimelineObj,
	PartEndState,
	PartEventContext,
	TimelinePersistentState
} from 'tv-automation-sofie-blueprints-integration'
import { onTimelineGenerate } from 'tv2-common'
import { CasparPlayerClip, OfftubeCasparLLayer, OfftubeSisyfosLLayer } from '../tv2_offtube_studio/layers'
import { parseConfig } from './helpers/config'

export function onTimelineGenerateOfftube(
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
				ClipPending: OfftubeCasparLLayer.CasparPlayerClipPending,
				PlayerClip: CasparPlayerClip
			},
			Sisyfos: {
				ClipPending: OfftubeSisyfosLLayer.SisyfosSourceClipPending,
				PlayerA: OfftubeSisyfosLLayer.SisyfosSourceServerA,
				PlayerB: OfftubeSisyfosLLayer.SisyfosSourceServerB
			}
		}
	)
}
