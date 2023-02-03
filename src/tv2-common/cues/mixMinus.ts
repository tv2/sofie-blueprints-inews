import {
	BaseContent,
	IBlueprintPiece,
	PieceLifespan,
	TimelineObjectCoreExt,
	WithTimeline
} from 'blueprints-integration'
import { CueDefinitionMixMinus, ExtendedShowStyleContext, findSourceInfo, literal, PartDefinition } from 'tv2-common'
import { ControlClasses, SharedOutputLayers, SharedSourceLayers, SwitcherAuxLLayer } from 'tv2-constants'

export function EvaluateCueMixMinus(
	context: ExtendedShowStyleContext,
	pieces: IBlueprintPiece[],
	part: PartDefinition,
	parsedCue: CueDefinitionMixMinus
) {
	const sourceInfo = findSourceInfo(context.config.sources, parsedCue.sourceDefinition)

	const name = parsedCue.sourceDefinition.name || parsedCue.sourceDefinition.sourceType

	if (sourceInfo === undefined) {
		context.core.notifyUserWarning(`${name} does not exist in this studio (MINUSKAM)`)
		return
	}
	const switcherInput = sourceInfo.port

	pieces.push({
		externalId: part.externalId,
		name: `MixMinus: ${name}`,
		enable: {
			start: 0
		},
		lifespan: PieceLifespan.OutOnShowStyleEnd,
		sourceLayerId: SharedSourceLayers.AuxMixMinus,
		outputLayerId: SharedOutputLayers.AUX,
		content: MixMinusContent(context, switcherInput)
	})
}

function MixMinusContent(context: ExtendedShowStyleContext, switcherInput: number): WithTimeline<BaseContent> {
	return {
		timelineObjects: literal<TimelineObjectCoreExt[]>([
			context.videoSwitcher.getAuxTimelineObject({
				content: {
					input: switcherInput
				},
				enable: {
					while: `.${ControlClasses.LiveSourceOnAir}`
				},
				layer: SwitcherAuxLLayer.AuxVideoMixMinus,
				priority: 1
			})
		])
	}
}
