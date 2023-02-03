import { CameraContent, IBlueprintPiece, PieceLifespan, TSR, WithTimeline } from 'blueprints-integration'
import { CalculateTime, CueDefinitionRouting, ExtendedShowStyleContext, findSourceInfo, literal } from 'tv2-common'
import { SharedOutputLayers, SwitcherAuxLLayer } from 'tv2-constants'
import _ = require('underscore')
import { AtemLLayer } from '../../../tv2_afvd_studio/layers'
import { SourceLayer } from '../../layers'

export function EvaluateCueRouting(
	context: ExtendedShowStyleContext,
	pieces: IBlueprintPiece[],
	partId: string,
	parsedCue: CueDefinitionRouting
) {
	const time = (parsedCue.start ? CalculateTime(parsedCue.start) : 0) ?? 0
	const sourceDefinition = parsedCue.INP1 ?? parsedCue.INP
	if (!sourceDefinition) {
		context.core.notifyUserWarning(`No input provided for viz engine aux`)
		return
	}

	const sourceInfo = findSourceInfo(context.config.sources, sourceDefinition)
	const name = sourceDefinition.name || sourceDefinition.sourceType
	if (!sourceInfo) {
		context.core.notifyUserWarning(`Could not find source ${name}`)
		return
	}

	pieces.push({
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
						deviceType: TSR.DeviceType.ATEM,
						type: TSR.TimelineContentTypeAtem.AUX,
						aux: {
							input: sourceInfo.port
						}
					}
				})
			])
		})
	})
}
