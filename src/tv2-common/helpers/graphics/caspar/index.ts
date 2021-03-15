export * from './slotMappings'

import { GraphicsContent, IBlueprintPiece, NotesContext, TSR } from '@sofie-automation/blueprints-integration'
import {
	CueDefinitionGraphic,
	GraphicInternal,
	GraphicPilot,
	literal,
	PartDefinition,
	TimelineBlueprintExt,
	TV2BlueprintConfig
} from 'tv2-common'
import { GraphicEngine, GraphicLLayer } from 'tv2-constants'
import { GetEnableForGraphic, GetTimelineLayerForGraphic } from '..'
import { IsTargetingFull, IsTargetingWall } from '../target'
import { layerToHTMLGraphicSlot, Slots } from './slotMappings'

export interface CasparPilotGeneratorSettings {
	createPilotTimelineForStudio(config: TV2BlueprintConfig, context: NotesContext): TSR.TSRTimelineObj[]
}

export function GetInternalGraphicContentCaspar(
	config: TV2BlueprintConfig,
	engine: GraphicEngine,
	parsedCue: CueDefinitionGraphic<GraphicInternal>,
	isIdentGraphic: boolean,
	partDefinition: PartDefinition,
	mappedTemplate: string
): IBlueprintPiece['content'] {
	return {
		timelineObjects: CasparOverlayTimeline(config, engine, parsedCue, isIdentGraphic, partDefinition, mappedTemplate)
	}
}

export function GetPilotGraphicContentCaspar(
	config: TV2BlueprintConfig,
	context: NotesContext,
	parsedCue: CueDefinitionGraphic<GraphicPilot>,
	settings: CasparPilotGeneratorSettings,
	engine: GraphicEngine
) {
	const graphicFolder = config.studio.GraphicFolder ? `${config.studio.GraphicFolder}\\` : ''
	const templateData = {
		display: 'program',
		slots: {
			'250_full': {
				payload: {
					type: 'still',
					url: `${config.studio.HTMLGraphics.GraphicURL}/${parsedCue.graphic.name}${config.studio.GraphicFileExtension}`
				}
			}
		}
	}
	return literal<GraphicsContent>({
		fileName: `${config.studio.GraphicFolder ? `${config.studio.GraphicFolder}/` : ''}${parsedCue.graphic.name}`,
		path: `${config.studio.GraphicNetworkBasePath}\\${graphicFolder}${parsedCue.graphic.name}${config.studio.GraphicFileExtension}`,
		mediaFlowIds: [config.studio.GraphicMediaFlowId],
		ignoreMediaStatus: config.studio.GraphicIgnoreStatus,
		ignoreBlackFrames: true,
		ignoreFreezeFrame: true,
		timelineObjects: [
			literal<TSR.TimelineObjCCGTemplate & TimelineBlueprintExt>({
				id: '',
				enable: {
					while: '1'
				},
				priority: 100,
				layer: IsTargetingWall(engine) ? GraphicLLayer.GraphicLLayerWall : GraphicLLayer.GraphicLLayerPilot,
				metaData: { templateData },
				content: {
					deviceType: TSR.DeviceType.CASPARCG,
					type: TSR.TimelineContentTypeCasparCg.TEMPLATE,
					templateType: 'html',
					name: 'sport-overlay/index',
					data: `<templateData>${encodeURI(JSON.stringify(templateData))}</templateData>`,
					useStopCommand: false,
					mixer: {
						opacity: 100
					}
				}
			}),
			...(IsTargetingFull(engine) ? settings.createPilotTimelineForStudio(config, context) : [])
		]
	})
}

function CasparOverlayTimeline(
	config: TV2BlueprintConfig,
	engine: GraphicEngine,
	parsedCue: CueDefinitionGraphic<GraphicInternal>,
	isIdentGrafik: boolean,
	partDefinition: PartDefinition,
	mappedTemplate: string
): TSR.TSRTimelineObj[] {
	return [
		literal<TSR.TimelineObjCCGTemplate>({
			id: '',
			enable: GetEnableForGraphic(config, engine, parsedCue, isIdentGrafik, partDefinition),
			priority: 1,
			layer: GetTimelineLayerForGraphic(config, mappedTemplate),
			content: {
				deviceType: TSR.DeviceType.CASPARCG,
				type: TSR.TimelineContentTypeCasparCg.TEMPLATE,
				templateType: 'html',
				name: 'sport-overlay/index',
				data: `<templateData>${encodeURI(
					JSON.stringify({
						display: 'program',
						slots: HTMLTemplateContent(config, mappedTemplate, parsedCue),
						partialUpdate: true
					})
				)}</templateData>`,
				useStopCommand: false
			}
		})
	]
}

function HTMLTemplateContent(
	config: TV2BlueprintConfig,
	graphicTemplate: string,
	parsedCue: CueDefinitionGraphic<GraphicInternal>
): Partial<Slots> {
	const conf = config.showStyle.GFXTemplates.find(g => g.VizTemplate.toLowerCase() === graphicTemplate.toLowerCase())

	if (!conf) {
		return {}
	}

	const layer = conf.LayerMapping

	const slot = layerToHTMLGraphicSlot[layer]

	if (!slot) {
		return {}
	}

	return {
		[slot]: {
			display: 'program',
			payload: {
				type: graphicTemplate,
				...parsedCue.graphic.textFields
			}
		}
	}
}
