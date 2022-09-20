import { GraphicsContent, IShowStyleUserContext, TSR, WithTimeline } from '@tv2media/blueprints-integration'
import {
	Adlib,
	CueDefinitionGraphic,
	findShowId,
	GetEnableForGraphic,
	GetFullGraphicTemplateNameFromCue,
	GetTimelineLayerForGraphic,
	GraphicInternal,
	GraphicPilot,
	IsTargetingFull,
	IsTargetingOVL,
	IsTargetingWall,
	literal,
	PartDefinition,
	TV2BlueprintConfig
} from 'tv2-common'
import { GraphicEngine, SharedGraphicLLayer } from 'tv2-constants'
import { EnableDSK } from '../../dsk'

export interface VizPilotGeneratorSettings {
	createPilotTimelineForStudio(
		config: TV2BlueprintConfig,
		context: IShowStyleUserContext,
		adlib: boolean
	): TSR.TSRTimelineObj[]
}

export function GetInternalGraphicContentVIZ(
	config: TV2BlueprintConfig,
	engine: GraphicEngine,
	parsedCue: CueDefinitionGraphic<GraphicInternal>,
	partDefinition: PartDefinition | undefined,
	mappedTemplate: string,
	adlib: boolean
): WithTimeline<GraphicsContent> {
	return {
		fileName: parsedCue.graphic.template,
		path: parsedCue.graphic.template,
		ignoreMediaObjectStatus: true,
		timelineObjects: literal<TSR.TSRTimelineObj[]>([
			literal<TSR.TimelineObjVIZMSEElementInternal>({
				id: '',
				enable: GetEnableForGraphic(config, engine, parsedCue, partDefinition, adlib),
				priority: 1,
				layer: GetTimelineLayerForGraphic(config, GetFullGraphicTemplateNameFromCue(config, parsedCue)),
				content: {
					deviceType: TSR.DeviceType.VIZMSE,
					type: TSR.TimelineContentTypeVizMSE.ELEMENT_INTERNAL,
					templateName: mappedTemplate,
					templateData: parsedCue.graphic.textFields,
					channelName: engine === 'WALL' ? 'WALL1' : 'OVL1', // TODO: TranslateEngine
					showId: findShowId(config, engine)
				}
			}),
			// Assume DSK is off by default (config table)
			...EnableDSK(config, 'OVL')
		])
	}
}

export function GetPilotGraphicContentViz(
	config: TV2BlueprintConfig,
	context: IShowStyleUserContext,
	settings: VizPilotGeneratorSettings,
	parsedCue: CueDefinitionGraphic<GraphicPilot>,
	engine: GraphicEngine,
	adlib?: Adlib
): WithTimeline<GraphicsContent> {
	return {
		fileName: 'PILOT_' + parsedCue.graphic.vcpid.toString(),
		path: parsedCue.graphic.vcpid.toString(),
		timelineObjects: [
			literal<TSR.TimelineObjVIZMSEElementPilot>({
				id: '',
				enable:
					IsTargetingOVL(engine) || IsTargetingWall(engine)
						? GetEnableForGraphic(config, engine, parsedCue, undefined, !!adlib)
						: {
								start: 0
						  },
				priority: 1,
				layer: IsTargetingWall(engine)
					? SharedGraphicLLayer.GraphicLLayerWall
					: IsTargetingOVL(engine)
					? SharedGraphicLLayer.GraphicLLayerPilotOverlay
					: SharedGraphicLLayer.GraphicLLayerPilot,
				content: {
					deviceType: TSR.DeviceType.VIZMSE,
					type: TSR.TimelineContentTypeVizMSE.ELEMENT_PILOT,
					templateVcpId: parsedCue.graphic.vcpid,
					continueStep: parsedCue.graphic.continueCount,
					noAutoPreloading: false,
					channelName: engine === 'WALL' ? 'WALL1' : engine === 'OVL' ? 'OVL1' : 'FULL1', // TODO: TranslateEngine
					...(IsTargetingWall(engine) || !config.studio.PreventOverlayWithFull
						? {}
						: {
								delayTakeAfterOutTransition: true,
								outTransition: {
									type: TSR.VIZMSETransitionType.DELAY,
									delay: config.studio.VizPilotGraphics.OutTransitionDuration
								}
						  })
				},
				...(IsTargetingFull(engine) ? { classes: ['full'] } : {})
			}),
			...(IsTargetingFull(engine) ? settings.createPilotTimelineForStudio(config, context, !!adlib) : [])
		]
	}
}
