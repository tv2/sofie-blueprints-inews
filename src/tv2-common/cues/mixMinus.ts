import {
	BaseContent,
	IBlueprintPiece,
	PieceLifespan,
	TimelineObjectCoreExt,
	TSR,
	WithTimeline
} from 'blueprints-integration'
import { CueDefinitionMixMinus, ExtendedShowStyleContext, findSourceInfo, literal, PartDefinition } from 'tv2-common'
import { ControlClasses, SharedATEMLLayer, SharedOutputLayers, SharedSourceLayers } from 'tv2-constants'

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
	const atemInput = sourceInfo.port

	pieces.push({
		externalId: part.externalId,
		name: `MixMinus: ${name}`,
		enable: {
			start: 0
		},
		lifespan: PieceLifespan.OutOnShowStyleEnd,
		sourceLayerId: SharedSourceLayers.AuxMixMinus,
		outputLayerId: SharedOutputLayers.AUX,
		content: MixMinusContent(atemInput)
	})
}

function MixMinusContent(atemInput: number): WithTimeline<BaseContent> {
	return {
		timelineObjects: literal<TimelineObjectCoreExt[]>([
			literal<TSR.TimelineObjAtemAUX>({
				content: {
					deviceType: TSR.DeviceType.ATEM,
					type: TSR.TimelineContentTypeAtem.AUX,
					aux: {
						input: atemInput
					}
				},
				enable: {
					while: `.${ControlClasses.LiveSourceOnAir}`
				},
				layer: SharedATEMLLayer.AtemAuxVideoMixMinus,
				id: '',
				priority: 1
			})
		])
	}
}
