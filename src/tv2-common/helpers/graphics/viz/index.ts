import {
	GraphicsContent,
	IBlueprintPart,
	IBlueprintPiece,
	NotesContext,
	TSR
} from '@sofie-automation/blueprints-integration'
import {
	CueDefinitionGraphic,
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
import { GraphicEngine, GraphicLLayer } from 'tv2-constants'
import { EnableDSK } from '../../dsk'

export interface VizPilotGeneratorSettings {
	createPilotTimelineForStudio(config: TV2BlueprintConfig, context: NotesContext, adlib: boolean): TSR.TSRTimelineObj[]
}

export function GetInternalGraphicContentVIZ(
	config: TV2BlueprintConfig,
	part: Readonly<IBlueprintPart>,
	engine: GraphicEngine,
	parsedCue: CueDefinitionGraphic<GraphicInternal>,
	isIdentGraphic: boolean,
	partDefinition: PartDefinition,
	mappedTemplate: string,
	adlib: boolean
): IBlueprintPiece['content'] {
	return literal<GraphicsContent>({
		fileName: parsedCue.graphic.template,
		path: parsedCue.graphic.template,
		ignoreMediaObjectStatus: true,
		timelineObjects: literal<TSR.TSRTimelineObj[]>([
			literal<TSR.TimelineObjVIZMSEElementInternal>({
				id: '',
				enable: GetEnableForGraphic(config, part, engine, parsedCue, isIdentGraphic, partDefinition, adlib),
				priority: 1,
				layer: GetTimelineLayerForGraphic(config, GetFullGraphicTemplateNameFromCue(config, parsedCue)),
				content: {
					deviceType: TSR.DeviceType.VIZMSE,
					type: TSR.TimelineContentTypeVizMSE.ELEMENT_INTERNAL,
					templateName: mappedTemplate,
					templateData: parsedCue.graphic.textFields,
					channelName: engine === 'WALL' ? 'WALL1' : 'OVL1' // TODO: TranslateEngine
				}
			}),
			// Assume DSK is off by default (config table)
			...EnableDSK(config, 'OVL')
		])
	})
}

export function GetPilotGraphicContentViz(
	config: TV2BlueprintConfig,
	part: Readonly<IBlueprintPart> | undefined,
	context: NotesContext,
	settings: VizPilotGeneratorSettings,
	parsedCue: CueDefinitionGraphic<GraphicPilot>,
	engine: GraphicEngine,
	adlib: boolean
): GraphicsContent {
	return literal<GraphicsContent>({
		fileName: 'PILOT_' + parsedCue.graphic.vcpid.toString(),
		path: parsedCue.graphic.vcpid.toString(),
		timelineObjects: [
			literal<TSR.TimelineObjVIZMSEElementPilot>({
				id: '',
				enable: IsTargetingOVL(engine)
					? GetEnableForGraphic(config, part, engine, parsedCue, false, undefined, adlib)
					: {
							start: 0
					  },
				priority: 1,
				layer: IsTargetingWall(engine)
					? GraphicLLayer.GraphicLLayerWall
					: IsTargetingOVL(engine)
					? GraphicLLayer.GraphicLLayerPilotOverlay
					: GraphicLLayer.GraphicLLayerPilot,
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
			...(IsTargetingFull(engine) ? settings.createPilotTimelineForStudio(config, context, adlib) : [])
		]
	})
}
