import {
	GraphicsContent,
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	PieceLifespan,
	TSR,
	WithTimeline
} from 'blueprints-integration'
import {
	calculateTime,
	CueDefinitionGraphicDesign,
	EvaluateCueResult,
	getHtmlTemplateName,
	PieceMetaData,
	ShowStyleContext,
	TV2ShowStyleConfig
} from 'tv2-common'
import { SharedGraphicLLayer, SharedOutputLayer, SharedSourceLayer } from 'tv2-constants'
import { Tv2PieceType } from '../../../../tv2-constants/tv2-piece-type'

const NON_BASELINE_DESIGN: string = 'NON_BASELINE_DESIGN'
const VALID_EMPTY_DESIGN_VALUE: string = 'N/A'

export function EvaluateDesignBase(
	context: ShowStyleContext,
	partId: string,
	parsedCue: CueDefinitionGraphicDesign,
	adlib?: boolean,
	rank?: number
): EvaluateCueResult {
	const result = new EvaluateCueResult()
	if (!parsedCue.design) {
		context.core.notifyUserWarning(`No valid design found for ${JSON.stringify(parsedCue)}`)
		return result
	}
	if (adlib) {
		result.adlibPieces.push(createDesignAdlibPiece(context, partId, parsedCue, rank))
		return result
	}
	result.pieces.push(createDesignPiece(context, partId, parsedCue))
	return result
}

function createDesignAdlibPiece(
	context: ShowStyleContext,
	partId: string,
	cue: CueDefinitionGraphicDesign,
	rank?: number
): IBlueprintAdLibPiece<PieceMetaData> {
	return {
		_rank: rank ?? 0,
		externalId: partId,
		name: cue.design,
		outputLayerId: SharedOutputLayer.SEC,
		sourceLayerId: SharedSourceLayer.PgmDesign,
		// @ts-ignore
		lifespan: cue.isFromField ? 'rundown-change-segment-lookback' : PieceLifespan.OutOnRundownChange,
		content: createDesignPieceContent(context, cue),
		metaData: {
			type: Tv2PieceType.GRAPHICS
		}
	}
}

function createDesignPiece(
	context: ShowStyleContext,
	partId: string,
	cue: CueDefinitionGraphicDesign
): IBlueprintPiece<PieceMetaData> {
	const start = (cue.start ? calculateTime(cue.start) : 0) ?? 0
	return {
		externalId: partId,
		name: cue.design,
		enable: {
			start
		},
		outputLayerId: SharedOutputLayer.SEC,
		sourceLayerId: SharedSourceLayer.PgmDesign,
		// @ts-ignore
		lifespan: cue.isFromField ? 'rundown-change-segment-lookback' : PieceLifespan.OutOnRundownChange,
		content: createDesignPieceContent(context, cue),
		metaData: {
			type: Tv2PieceType.GRAPHICS
		}
	}
}

function createDesignPieceContent(
	context: ShowStyleContext,
	cue: CueDefinitionGraphicDesign
): WithTimeline<GraphicsContent> {
	return {
		fileName: cue.design,
		path: cue.design,
		ignoreMediaObjectStatus: true,
		timelineObjects: designTimeline(context, cue)
	}
}

function designTimeline(context: ShowStyleContext, parsedCue: CueDefinitionGraphicDesign): TSR.TSRTimelineObj[] {
	switch (context.config.studio.GraphicsType) {
		case 'HTML':
			return [getNonBaselineCasparCgDesignTimelineObject(context, parsedCue)]
		case 'VIZ':
			return [getNonBaselineVizDesignTimelineObject(context.config, parsedCue.design)]
		default:
			return []
	}
}

function getNonBaselineCasparCgDesignTimelineObject(
	context: ShowStyleContext,
	parsedCue: CueDefinitionGraphicDesign
): TSR.TimelineObjCCGTemplate {
	return {
		id: '',
		enable: {
			start: 0
		},
		priority: 100,
		classes: [`${parsedCue.design}`, NON_BASELINE_DESIGN],
		layer: SharedGraphicLLayer.GraphicLLayerDesign,
		content: createCasparCgDesignContent(parsedCue.design, getHtmlTemplateName(context.config))
	}
}

function createCasparCgDesignContent(design: string, templateName: string): TSR.TimelineObjCCGTemplate['content'] {
	return {
		deviceType: TSR.DeviceType.CASPARCG,
		type: TSR.TimelineContentTypeCasparCg.TEMPLATE,
		templateType: 'html',
		name: templateName,
		data: {
			display: 'program',
			design,
			partialUpdate: true
		},
		useStopCommand: false
	}
}

function getNonBaselineVizDesignTimelineObject(config: TV2ShowStyleConfig, design: string) {
	const vizDesignTimelineObject = getVizDesignTimelineObject(config, design)
	vizDesignTimelineObject.classes!.push(NON_BASELINE_DESIGN)
	return vizDesignTimelineObject
}

function getVizDesignTimelineObject(config: TV2ShowStyleConfig, design: string): TSR.TimelineObjVIZMSEElementInternal {
	return {
		id: '',
		enable: { start: 0 },
		priority: 100,
		classes: [design],
		layer: SharedGraphicLLayer.GraphicLLayerDesign,
		content: {
			deviceType: TSR.DeviceType.VIZMSE,
			type: TSR.TimelineContentTypeVizMSE.ELEMENT_INTERNAL,
			templateName: design,
			templateData: [],
			showName: config.selectedGfxSetup.OvlShowName ?? '' // @todo: improve types at the junction of HTML and Viz
		}
	}
}

export function getVizBaselineDesignTimelineObject(context: ShowStyleContext) {
	const designReference = context.config.showStyle.GfxDefaults[0].DefaultDesign
	if (VALID_EMPTY_DESIGN_VALUE === designReference.value) {
		return []
	}
	const design = context.config.showStyle.GfxDesignTemplates.find(
		(designTemplate) => designTemplate._id === designReference.value
	)
	if (!design) {
		context.core.notifyUserWarning(`Design ${designReference.label} not found in GFX Design Templates`)
		return []
	}
	return [getVizDesignTimelineObject(context.config, design.VizTemplate)]
}

export function getCasparCgBaselineDesignTimelineObjects(
	context: ShowStyleContext,
	templateName: string
): TSR.TimelineObjCCGTemplate[] {
	const designReference = context.config.showStyle.GfxDefaults[0].DefaultDesign
	if (VALID_EMPTY_DESIGN_VALUE === designReference.value) {
		return []
	}
	const design = context.config.showStyle.GfxDesignTemplates.find(
		(designTemplate) => designTemplate._id === designReference.value
	)
	if (!design) {
		context.core.notifyUserWarning(`Design ${designReference.label} not found in GFX Design Templates`)
		return []
	}
	return [
		{
			id: '',
			enable: {
				while: `!.${NON_BASELINE_DESIGN}`
			},
			priority: 1,
			classes: [design.VizTemplate],
			layer: SharedGraphicLLayer.GraphicLLayerDesign,
			content: createCasparCgDesignContent(design.VizTemplate, templateName)
		}
	]
}
