import {
	GraphicsContent,
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	IShowStyleUserContext,
	PieceLifespan,
	TSR,
	WithTimeline
} from 'blueprints-integration'
import { CalculateTime, CueDefinitionGraphicDesign, literal, TV2BlueprintConfig } from 'tv2-common'
import { SharedGraphicLLayer, SharedOutputLayers, SharedSourceLayers } from 'tv2-constants'

export function EvaluateDesignBase(
	config: TV2BlueprintConfig,
	context: IShowStyleUserContext,
	pieces: IBlueprintPiece[],
	adlibPieces: IBlueprintAdLibPiece[],
	_actions: IBlueprintActionManifest[],
	partId: string,
	parsedCue: CueDefinitionGraphicDesign,
	adlib?: boolean,
	rank?: number
) {
	const start = (parsedCue.start ? CalculateTime(parsedCue.start) : 0) ?? 0
	if (!parsedCue.design || !parsedCue.design.length) {
		context.notifyUserWarning(`No valid design found for ${parsedCue.design}`)
		return
	}

	if (adlib) {
		adlibPieces.push({
			_rank: rank || 0,
			externalId: partId,
			name: parsedCue.design,
			outputLayerId: SharedOutputLayers.SEC,
			sourceLayerId: SharedSourceLayers.PgmDesign,
			lifespan: PieceLifespan.OutOnShowStyleEnd,
			content: literal<WithTimeline<GraphicsContent>>({
				fileName: parsedCue.design,
				path: parsedCue.design,
				ignoreMediaObjectStatus: true,
				timelineObjects: designTimeline(config, parsedCue)
			})
		})
	} else {
		pieces.push({
			externalId: partId,
			name: parsedCue.design,
			enable: {
				start
			},
			outputLayerId: SharedOutputLayers.SEC,
			sourceLayerId: SharedSourceLayers.PgmDesign,
			lifespan: PieceLifespan.OutOnShowStyleEnd,
			content: literal<WithTimeline<GraphicsContent>>({
				fileName: parsedCue.design,
				path: parsedCue.design,
				ignoreMediaObjectStatus: true,
				timelineObjects: designTimeline(config, parsedCue)
			})
		})
	}
}

function designTimeline(config: TV2BlueprintConfig, parsedCue: CueDefinitionGraphicDesign): TSR.TSRTimelineObj[] {
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
						name: 'sport-overlay/index',
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
						showId: config.selectedGraphicsSetup.OvlShowName
					}
				})
			]
		default:
			return []
	}
}
