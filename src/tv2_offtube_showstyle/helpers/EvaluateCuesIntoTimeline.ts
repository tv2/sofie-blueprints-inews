import { PartContext, TSR } from 'tv-automation-sofie-blueprints-integration'
import { CueDefinition, PartDefinition, SkipCue } from 'tv2-common'
import { CueType } from 'tv2-constants'
import { GetCasparOverlayTimeline } from '../cues/OfftubeGrafikCaspar'
import { OfftubeShowstyleBlueprintConfig } from './config'

export function EvaluateCuesIntoTimeline(
	_context: PartContext,
	config: OfftubeShowstyleBlueprintConfig,
	cues: CueDefinition[],
	partDefinition: PartDefinition,
	timelineObjStartId: string,
	/** Passing this arguments sets the types of cues to evaluate. */
	selectedCueTypes?: CueType[] | undefined,
	/** Don't evaluate adlibs */
	excludeAdlibs?: boolean
): TSR.TSRTimelineObj[] {
	const timeline: TSR.TSRTimelineObj[] = []

	for (const cue of cues) {
		if (cue && !SkipCue(cue, selectedCueTypes, excludeAdlibs)) {
			switch (cue.type) {
				case CueType.Grafik:
					timeline.push(
						...GetCasparOverlayTimeline(
							config,
							'FULL',
							cue,
							!!cue.template.match(/direkte/i),
							partDefinition,
							timelineObjStartId,
							true
						)
					)
					break
				default:
					break
			}
		}
	}

	return timeline
}
