import { GraphicsContent, IBlueprintPiece, PieceLifespan, TSR, WithTimeline } from 'blueprints-integration'
import {
	calculateTime,
	CueDefinitionGraphicSchema,
	getHtmlTemplateName,
	literal,
	ShowStyleContext,
	TV2ShowStyleConfig
} from 'tv2-common'
import { SharedGraphicLLayer, SharedOutputLayer, SharedSourceLayer } from 'tv2-constants'

export function EvaluateCueGraphicSchema(
	context: ShowStyleContext,
	pieces: IBlueprintPiece[],
	partId: string,
	parsedCue: CueDefinitionGraphicSchema
) {
	if (!parsedCue.schema) {
		context.core.notifyUserWarning(`No valid Schema found for ${parsedCue.schema}`)
		return
	}

	const start = (parsedCue.start ? calculateTime(parsedCue.start) : 0) ?? 0
	pieces.push({
		externalId: partId,
		name: parsedCue.schema,
		enable: {
			start
		},
		outputLayerId: SharedOutputLayer.SEC,
		sourceLayerId: SharedSourceLayer.PgmSchema,
		lifespan: PieceLifespan.OutOnShowStyleEnd,
		content: literal<WithTimeline<GraphicsContent>>({
			fileName: parsedCue.schema,
			path: parsedCue.schema,
			ignoreMediaObjectStatus: true,
			timelineObjects: createTimelineObjects(context, parsedCue)
		})
	})
}

function createTimelineObjects(context: ShowStyleContext, cue: CueDefinitionGraphicSchema): TSR.TSRTimelineObjBase[] {
	switch (context.config.studio.GraphicsType) {
		case 'VIZ': {
			return createVizTimelineObjects(context.config, cue)
		}
		case 'HTML': {
			return createCasparCgTimelineObjects(context, cue)
		}
		default: {
			return []
		}
	}
}

function createVizTimelineObjects(
	config: TV2ShowStyleConfig,
	cue: CueDefinitionGraphicSchema
): TSR.TimelineObjVIZMSEElementInternal[] {
	return [
		literal<TSR.TimelineObjVIZMSEElementInternal>({
			id: '',
			enable: { start: 0 },
			priority: 100,
			layer: SharedGraphicLLayer.GraphicLLayerSchema,
			content: {
				deviceType: TSR.DeviceType.VIZMSE,
				type: TSR.TimelineContentTypeVizMSE.ELEMENT_INTERNAL,
				templateName: cue.schema,
				templateData: [],
				showName: config.selectedGfxSetup.OvlShowName ?? ''
			}
		})
	]
}

function createCasparCgTimelineObjects(
	context: ShowStyleContext,
	cue: CueDefinitionGraphicSchema
): TSR.TimelineObjCasparCGBase[] {
	return [
		literal<TSR.TimelineObjCCGTemplate>({
			id: '',
			enable: { start: 0 },
			priority: 100,
			layer: SharedGraphicLLayer.GraphicLLayerSchema,
			content: {
				deviceType: TSR.DeviceType.CASPARCG,
				type: TSR.TimelineContentTypeCasparCg.TEMPLATE,
				templateType: 'html',
				name: getHtmlTemplateName(context.config),
				data: createCasparCgHtmlSchemaData(context, cue),
				useStopCommand: false
			}
		})
	]
}

function createCasparCgHtmlSchemaData(context: ShowStyleContext, cue: CueDefinitionGraphicSchema): any {
	if (!cue.CasparCgDesignValues || cue.CasparCgDesignValues.length === 0) {
		context.core.notifyUserError(
			`Unable to find Schema Design combination for "${cue.schema}". Design values will not be sent to CasparCG!`
		)
		return {}
	}
	return {
		designs: cue.CasparCgDesignValues,
		partialUpdate: true
	}
}
