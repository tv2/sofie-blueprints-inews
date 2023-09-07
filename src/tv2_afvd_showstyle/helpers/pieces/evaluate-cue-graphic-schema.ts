import { GraphicsContent, PieceLifespan, WithTimeline } from '@sofie-automation/blueprints-integration'
import { TSR } from 'blueprints-integration'
import {
	calculateTime,
	CueDefinitionGfxSchema,
	EvaluateCueResult,
	literal,
	OVL_SHOW_PLACEHOLDER,
	ShowStyleContext,
	TV2ShowStyleConfig
} from 'tv2-common'
import { SharedOutputLayer } from 'tv2-constants'
import { GraphicLLayer } from '../../../tv2_afvd_studio/layers'
import { SourceLayer } from '../../layers'

export function EvaluateCueGraphicSchema(context: ShowStyleContext, partId: string, parsedCue: CueDefinitionGfxSchema) {
	const result = new EvaluateCueResult()
	if (!parsedCue.schema) {
		context.core.notifyUserWarning(`No valid Schema found for ${parsedCue.schema}`)
		return result
	}

	const start = (parsedCue.start ? calculateTime(parsedCue.start) : 0) ?? 0
	result.pieces.push({
		externalId: partId,
		name: parsedCue.schema,
		enable: {
			start
		},
		outputLayerId: SharedOutputLayer.SEC,
		sourceLayerId: SourceLayer.PgmSchema,
		lifespan: PieceLifespan.OutOnShowStyleEnd,
		content: literal<WithTimeline<GraphicsContent>>({
			fileName: parsedCue.schema,
			path: parsedCue.schema,
			ignoreMediaObjectStatus: true,
			timelineObjects: createTimeline(context.config, parsedCue)
		})
	})

	return result
}

function createTimeline(
	config: TV2ShowStyleConfig,
	cue: CueDefinitionGfxSchema
): TSR.TimelineObjVIZMSEElementInternal[] {
	if (config.studio.GraphicsType !== 'VIZ') {
		return []
	}
	return [
		literal<TSR.TimelineObjVIZMSEElementInternal>({
			id: '',
			enable: { start: 0 },
			priority: 100,
			layer: GraphicLLayer.GraphicLLayerSchema,
			content: {
				deviceType: TSR.DeviceType.VIZMSE,
				type: TSR.TimelineContentTypeVizMSE.ELEMENT_INTERNAL,
				templateName: cue.schema,
				templateData: [],
				showName: OVL_SHOW_PLACEHOLDER
			},
			keyframes: config.vizShowKeyframes.overlay
		})
	]
}
