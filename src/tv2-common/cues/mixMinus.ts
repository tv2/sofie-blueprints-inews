import { IBlueprintPiece, PieceLifespan, TSR } from 'blueprints-integration'
import { CueDefinitionMixMinus, ExtendedShowStyleContext, findSourceInfo, PartDefinition } from 'tv2-common'
import { ControlClasses, SharedOutputLayers, SharedSourceLayers, SwitcherAuxLLayer } from 'tv2-constants'

export function EvaluateCueMixMinus(
	context: ExtendedShowStyleContext,
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
		sourceLayerId: SharedSourceLayers.AuxMixMinus,
		outputLayerId: SharedOutputLayers.AUX,
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
	context: ExtendedShowStyleContext,
	switcherInput: number,
	priority: MixMinusPriority
): TSR.TSRTimelineObj {
	return context.videoSwitcher.getAuxTimelineObject({
		content: {
			input: switcherInput
		},
		enable: {
			while: `.${ControlClasses.OVERRIDEN_ON_MIX_MINUS}`
		},
		layer: SwitcherAuxLLayer.AuxVideoMixMinus,
		priority
	})
}
