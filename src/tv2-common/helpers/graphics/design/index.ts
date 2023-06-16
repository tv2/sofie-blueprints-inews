import {
	GraphicsContent,
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	PieceLifespan,
	TSR,
	WithTimeline
} from 'blueprints-integration'
import {
	calculateTime,
	CueDefinitionGraphicDesign,
	getHtmlTemplateName,
	literal,
	ShowStyleContext,
	TV2ShowStyleConfig
} from 'tv2-common'
import { SharedGraphicLLayer, SharedOutputLayer, SharedSourceLayer } from 'tv2-constants'

const NON_BASELINE_DESIGN_ID = 'NON_BASELINE_DESIGN_ID'

export function EvaluateDesignBase(
	context: ShowStyleContext,
	pieces: IBlueprintPiece[],
	adlibPieces: IBlueprintAdLibPiece[],
	_actions: IBlueprintActionManifest[],
	partId: string,
	parsedCue: CueDefinitionGraphicDesign,
	adlib?: boolean,
	rank?: number
) {
	if (!parsedCue.design || !parsedCue.design.length) {
		context.core.notifyUserWarning(`No valid design found for ${parsedCue.design}`)
		return
	}
	if (adlib) {
		adlibPieces.push(createDesignAdlibPiece(context, partId, parsedCue, rank))
		return
	}
	pieces.push(createDesignPiece(context, partId, parsedCue))
}

function createDesignAdlibPiece(
	context: ShowStyleContext,
	partId: string,
	cue: CueDefinitionGraphicDesign,
	rank?: number
): IBlueprintAdLibPiece {
	return {
		_rank: rank || 0,
		externalId: partId,
		name: cue.design,
		outputLayerId: SharedOutputLayer.SEC,
		sourceLayerId: SharedSourceLayer.PgmDesign,
		lifespan: PieceLifespan.OutOnShowStyleEnd,
		content: createDesignPieceContent(context, cue)
	}
}

function createDesignPiece(
	context: ShowStyleContext,
	partId: string,
	cue: CueDefinitionGraphicDesign
): IBlueprintPiece {
	const start = (cue.start ? calculateTime(cue.start) : 0) ?? 0
	return {
		externalId: partId,
		name: cue.design,
		enable: {
			start
		},
		outputLayerId: SharedOutputLayer.SEC,
		sourceLayerId: SharedSourceLayer.PgmDesign,
		lifespan: PieceLifespan.OutOnShowStyleEnd,
		content: createDesignPieceContent(context, cue)
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

function getNonBaselineCasparCgDesignTimelineObject(context: ShowStyleContext, parsedCue: CueDefinitionGraphicDesign) {
	return literal<TSR.TimelineObjCCGTemplate>({
		id: '',
		enable: {
			start: 0
		},
		priority: 100,
		classes: [`${parsedCue.design}`, NON_BASELINE_DESIGN_ID],
		layer: SharedGraphicLLayer.GraphicLLayerDesign,
		content: createCasparCgDesignContent(parsedCue.design, getHtmlTemplateName(context.config))
	})
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
	vizDesignTimelineObject.classes!.push(NON_BASELINE_DESIGN_ID)
	return vizDesignTimelineObject
}

function getVizDesignTimelineObject(config: TV2ShowStyleConfig, design: string) {
	return literal<TSR.TimelineObjVIZMSEElementInternal>({
		id: '',
		enable: { start: 0 },
		priority: 100,
		classes: [`${design}`],
		layer: SharedGraphicLLayer.GraphicLLayerDesign,
		content: {
			deviceType: TSR.DeviceType.VIZMSE,
			type: TSR.TimelineContentTypeVizMSE.ELEMENT_INTERNAL,
			templateName: design,
			templateData: [],
			showName: config.selectedGfxSetup.OvlShowName ?? '' // @todo: improve types at the junction of HTML and Viz
		}
	})
}

export function getVizBaselineDesignTimelineObject(config: TV2ShowStyleConfig) {
	const design = config.showStyle.GfxDefaults[0].DefaultDesign.label
	return getVizDesignTimelineObject(config, design)
}

export function getCasparCgBaselineDesignTimelineObject(
	config: TV2ShowStyleConfig,
	templateName: string
): TSR.TimelineObjCCGTemplate {
	const design: string = config.showStyle.GfxDefaults[0].DefaultDesign.label
	return {
		id: '',
		enable: {
			while: `!.${NON_BASELINE_DESIGN_ID}`
		},
		priority: 1,
		classes: [`${design}`],
		layer: SharedGraphicLLayer.GraphicLLayerDesign,
		content: createCasparCgDesignContent(design, templateName)
	}
}
