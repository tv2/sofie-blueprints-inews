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
	const start = (parsedCue.start ? calculateTime(parsedCue.start) : 0) ?? 0
	if (!parsedCue.design || !parsedCue.design.length) {
		context.core.notifyUserWarning(`No valid design found for ${parsedCue.design}`)
		return
	}

	if (adlib) {
		adlibPieces.push({
			_rank: rank || 0,
			externalId: partId,
			name: parsedCue.design,
			outputLayerId: SharedOutputLayer.SEC,
			sourceLayerId: SharedSourceLayer.PgmDesign,
			lifespan: PieceLifespan.OutOnShowStyleEnd,
			content: literal<WithTimeline<GraphicsContent>>({
				fileName: parsedCue.design,
				path: parsedCue.design,
				ignoreMediaObjectStatus: true,
				timelineObjects: designTimeline(context.config, parsedCue)
			})
		})
	} else {
		pieces.push({
			externalId: partId,
			name: parsedCue.design,
			enable: {
				start
			},
			outputLayerId: SharedOutputLayer.SEC,
			sourceLayerId: SharedSourceLayer.PgmDesign,
			lifespan: PieceLifespan.OutOnShowStyleEnd,
			content: literal<WithTimeline<GraphicsContent>>({
				fileName: parsedCue.design,
				path: parsedCue.design,
				ignoreMediaObjectStatus: true,
				timelineObjects: designTimeline(context.config, parsedCue)
			})
		})
	}
}

function designTimeline(config: TV2ShowStyleConfig, parsedCue: CueDefinitionGraphicDesign): TSR.TSRTimelineObj[] {
	switch (config.studio.GraphicsType) {
		case 'HTML':
			return [
				literal<TSR.TimelineObjCCGTemplate>({
					id: '',
					enable: {
						start: 0
					},
					priority: 1,
					layer: SharedGraphicLLayer.GraphicLLayerDesign,
					content: {
						deviceType: TSR.DeviceType.CASPARCG,
						type: TSR.TimelineContentTypeCasparCg.TEMPLATE,
						templateType: 'html',
						name: getHtmlTemplateName(config),
						data: {
							display: 'program',
							design: parsedCue.design,
							partialUpdate: true
						},
						useStopCommand: false
					}
				})
			]
		case 'VIZ':
			return [
				literal<TSR.TimelineObjVIZMSEElementInternal>({
					id: '',
					enable: { start: 0 },
					priority: 100,
					layer: SharedGraphicLLayer.GraphicLLayerDesign,
					content: {
						deviceType: TSR.DeviceType.VIZMSE,
						type: TSR.TimelineContentTypeVizMSE.ELEMENT_INTERNAL,
						templateName: parsedCue.design,
						templateData: [],
						showName: config.selectedGfxSetup.OvlShowName ?? '' // @todo: improve types at the junction of HTML and Viz
					}
				})
			]
		default:
			return []
	}
}
