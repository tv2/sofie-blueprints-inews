import {
	BaseContent,
	IBlueprintPiece,
	IShowStyleUserContext,
	PieceLifespan,
	TimelineObjectCoreExt,
	TSR,
	WithTimeline
} from '@tv2media/blueprints-integration'
import { CueDefinitionMixMinus, FindSourceByName, literal, PartDefinition } from 'tv2-common'
import { ControlClasses, SharedATEMLLayer, SharedOutputLayers, SharedSourceLayers } from 'tv2-constants'
import { TV2BlueprintConfig } from '../blueprintConfig'

export function EvaluateCueMixMinus(
	context: IShowStyleUserContext,
	config: TV2BlueprintConfig,
	pieces: IBlueprintPiece[],
	part: PartDefinition,
	parsedCue: CueDefinitionMixMinus
) {
	const sourceInfoMixMinus = FindSourceByName(context, config.sources, parsedCue.source)
	if (sourceInfoMixMinus === undefined) {
		context.notifyUserWarning(`${parsedCue.source} does not exist in this studio (MINUSKAM)`)
		return
	}
	const atemInput = sourceInfoMixMinus.port

	pieces.push(
		literal<IBlueprintPiece>({
			externalId: part.externalId,
			name: `MixMinus: ${parsedCue.source}`,
			enable: {
				start: 0
			},
			lifespan: PieceLifespan.OutOnShowStyleEnd,
			sourceLayerId: SharedSourceLayers.AuxMixMinus,
			outputLayerId: SharedOutputLayers.AUX,
			content: MixMinusContent(atemInput)
		})
	)
}

function MixMinusContent(atemInput: number): WithTimeline<BaseContent> {
	return literal<WithTimeline<BaseContent>>({
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
	})
}
