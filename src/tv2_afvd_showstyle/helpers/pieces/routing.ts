import { CameraContent, PieceLifespan, TSR, WithTimeline } from 'blueprints-integration'
import {
	calculateTime,
	CueDefinitionRouting,
	EvaluateCueResult,
	ExtendedShowStyleContext,
	findSourceInfo,
	literal
} from 'tv2-common'
import { SharedOutputLayers, SwitcherAuxLLayer } from 'tv2-constants'
import _ = require('underscore')
import { SourceLayer } from '../../layers'

export function EvaluateCueRouting(
	context: ExtendedShowStyleContext,
	partId: string,
	parsedCue: CueDefinitionRouting
): EvaluateCueResult {
	const result = new EvaluateCueResult()
	const time = (parsedCue.start ? calculateTime(parsedCue.start) : 0) ?? 0
	const sourceDefinition = parsedCue.INP1 ?? parsedCue.INP
	if (!sourceDefinition) {
		context.core.notifyUserWarning(`No input provided for viz engine aux`)
		return result
	}

	const sourceInfo = findSourceInfo(context.config.sources, sourceDefinition)
	const name = sourceDefinition.name || sourceDefinition.sourceType
	if (!sourceInfo) {
		context.core.notifyUserWarning(`Could not find source ${name}`)
		return result
	}

	result.pieces.push({
		externalId: partId,
		enable: {
			start: time
		},
		name,
		outputLayerId: SharedOutputLayers.AUX,
		sourceLayerId: SourceLayer.VizFullIn1,
		lifespan: PieceLifespan.WithinPart,
		content: literal<WithTimeline<CameraContent>>({
			studioLabel: '',
			switcherInput: sourceInfo.port,
			timelineObjects: _.compact<TSR.TSRTimelineObj[]>([
				context.videoSwitcher.getAuxTimelineObject({
					priority: 100,
					layer: SwitcherAuxLLayer.AuxVizOvlIn1,
					content: {
						input: sourceInfo.port
					}
				})
			])
		})
	})
	return result
}
