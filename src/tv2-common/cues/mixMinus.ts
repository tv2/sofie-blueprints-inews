import { IBlueprintPiece, PieceLifespan, TSR } from 'blueprints-integration'
import { CueDefinitionMixMinus, findSourceInfo, PartDefinition, ShowStyleContext, TemporalPriority } from 'tv2-common'
import { ControlClasses, SharedOutputLayer, SharedSourceLayer, SwitcherAuxLLayer } from 'tv2-constants'

export function EvaluateCueMixMinus(
	context: ShowStyleContext,
	pieces: IBlueprintPiece[],
	part: PartDefinition,
	parsedCue: CueDefinitionMixMinus
) {
	if (!context.uniformConfig.switcherLLayers.mixMinusAux) {
		context.core.notifyUserWarning(`Mix-Minus out not available in this studio (MINUSKAM)`)
		return
	}
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
		sourceLayerId: SharedSourceLayer.AuxMixMinus,
		outputLayerId: SharedOutputLayer.AUX,
		content: {
			timelineObjects: [getMixMinusTimelineObject(context, switcherInput, MixMinusPriority.MINUSKAM_CUE)]
		}
	})
}

export enum MixMinusPriority {
	STUDIO_CONFIG = 1,
	MINUSKAM_CUE = 2,
	CUSTOM_INPUT = 3
}

export function getMixMinusTimelineObject(
	context: ShowStyleContext,
	switcherInput: number,
	priority: MixMinusPriority
): TSR.TSRTimelineObj {
	return context.videoSwitcher.getAuxTimelineObject({
		content: {
			input: switcherInput
		},
		enable: {
			while: `.${ControlClasses.OVERRIDDEN_ON_MIX_MINUS}`
		},
		layer: SwitcherAuxLLayer.AuxVideoMixMinus,
		priority,
		temporalPriority: TemporalPriority.AUX_MIX_MINUS_OVERRIDE
	})
}
