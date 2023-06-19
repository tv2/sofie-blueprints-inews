import { PieceLifespan, TSR } from '@sofie-automation/blueprints-integration'
import { EvaluateCueDesign } from 'src/tv2_afvd_showstyle/helpers/pieces/design'
import { EvaluateCueGraphicSchema } from 'src/tv2_afvd_showstyle/helpers/pieces/evaluate-cue-graphic-schema'
import { CueDefinitionVariant, EvaluateCueResult, ShowStyleContext, calculateTime, literal } from 'tv2-common'
import { CueType } from 'tv2-constants'

export function EvaluateCueVariant(context: ShowStyleContext, partId: string, variantCue: CueDefinitionVariant) {
	const result = new EvaluateCueResult()
	const start = (variantCue.start ? calculateTime(variantCue.start) : 0) ?? 0

	result.pieces.push({
		name: variantCue.variant,
		lifespan: PieceLifespan.OutOnRundownChange,
		externalId: partId,
		enable: {
			start
		},
		outputLayerId: 'vrt', //SharedOutputLayer.SEC,
		sourceLayerId: 'studio0_variant',
		metaData: {
			variant: variantCue.variant
		},
		tags: [variantCue.variant],
		content: {
			timelineObjects: [
				literal<TSR.TimelineObjVIZMSEInitializeShow>({
					id: '',
					enable: { while: '1' },
					priority: 1,
					layer: 'vizshow1',
					content: {
						deviceType: TSR.DeviceType.VIZMSE,
						type: TSR.TimelineContentTypeVizMSE.INITIALIZE_SHOW,
						showName: variantCue.variant === 'VAR_A' ? 'overlay_show' : 'overlay_show2'
					}
				})
			]
		}
	})

	result.push(
		EvaluateCueDesign(context, partId, {
			type: CueType.GraphicDesign,
			design: '', // todo: defaults
			iNewsCommand: '',
			start: variantCue.start
		})
	)
	result.push(
		EvaluateCueGraphicSchema(context, partId, {
			type: CueType.GraphicSchema,
			schema: '', // todo: defaults
			iNewsCommand: '',
			start: variantCue.start
		})
	)
	return result
}
