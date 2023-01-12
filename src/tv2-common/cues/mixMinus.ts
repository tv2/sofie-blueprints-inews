import {
	BaseContent,
	IBlueprintPiece,
	IShowStyleUserContext,
	PieceLifespan,
	TimelineObjectCoreExt,
	TSR,
	WithTimeline
} from 'blueprints-integration'
import { CueDefinitionMixMinus, findSourceInfo, literal, PartDefinition } from 'tv2-common'
import { ControlClasses, SharedATEMLLayer, SharedOutputLayers, SharedSourceLayers } from 'tv2-constants'
import { TV2BlueprintConfig } from '../blueprintConfig'

export function EvaluateCueMixMinus(
	context: IShowStyleUserContext,
	config: TV2BlueprintConfig,
	pieces: IBlueprintPiece[],
	part: PartDefinition,
	parsedCue: CueDefinitionMixMinus
) {
	const sourceInfo = findSourceInfo(config.sources, parsedCue.sourceDefinition)

	const name = parsedCue.sourceDefinition.name || parsedCue.sourceDefinition.sourceType

	if (sourceInfo === undefined) {
		context.notifyUserWarning(`${name} does not exist in this studio (MINUSKAM)`)
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
		timelineObjects: literal<Array<TimelineObjectCoreExt<TSR.TSRTimelineContent>>>([
			literal<TSR.TSRTimelineObj<TSR.TimelineContentAtemAny>>({
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
