export * from './slotMappings'

import {
	GraphicsContent,
	IBlueprintPiece,
	IShowStyleUserContext,
	TSR,
	WithTimeline
} from '@tv2media/blueprints-integration'
import {
	CueDefinitionGraphic,
	GraphicInternal,
	GraphicPilot,
	JoinAssetToFolder,
	JoinAssetToNetworkPath,
	literal,
	PartDefinition,
	TimelineBlueprintExt,
	TV2BlueprintConfig
} from 'tv2-common'
import { GraphicEngine, SharedGraphicLLayer } from 'tv2-constants'
import { GetEnableForGraphic, GetTimelineLayerForGraphic } from '..'
import { EnableDSK } from '../../dsk'
import { IsTargetingFull, IsTargetingWall } from '../target'
import { layerToHTMLGraphicSlot, Slots } from './slotMappings'

export interface CasparPilotGeneratorSettings {
	createPilotTimelineForStudio(config: TV2BlueprintConfig, context: IShowStyleUserContext): TSR.TSRTimelineObj[]
}

export function GetInternalGraphicContentCaspar(
	config: TV2BlueprintConfig,
	engine: GraphicEngine,
	parsedCue: CueDefinitionGraphic<GraphicInternal>,
	isIdentGraphic: boolean,
	partDefinition: PartDefinition | undefined,
	mappedTemplate: string,
	adlib: boolean
): IBlueprintPiece['content'] {
	return {
		timelineObjects: CasparOverlayTimeline(
			config,
			engine,
			parsedCue,
			isIdentGraphic,
			partDefinition,
			mappedTemplate,
			adlib
		)
	}
}

export function GetPilotGraphicContentCaspar(
	config: TV2BlueprintConfig,
	context: IShowStyleUserContext,
	parsedCue: CueDefinitionGraphic<GraphicPilot>,
	settings: CasparPilotGeneratorSettings,
	engine: GraphicEngine
) {
	const graphicFolder = config.studio.GraphicFolder ? `${config.studio.GraphicFolder}\\` : ''
	const fileName = JoinAssetToFolder(config.studio.GraphicFolder, parsedCue.graphic.name)
	const templateData = {
		display: 'program',
		slots: {
			'250_full': {
				payload: {
					type: 'still',
					url: encodeURI(
						`${config.studio.HTMLGraphics.GraphicURL}\\${fileName}${config.studio.GraphicFileExtension}`
							.replace(/\//g, '\\') // Replace forward slash with backward slash
							.replace(/\\/g, '\\\\') // Replace every \ with \\ and encodURI. Double backslash means the HTML template will be able to parse the string correctly. encodeURI so Caspar doesn't mangle the data.
					)
				}
			}
		}
	}
	return literal<WithTimeline<GraphicsContent>>({
		fileName,
		path: JoinAssetToNetworkPath(
			config.studio.GraphicNetworkBasePath,
			graphicFolder,
			parsedCue.graphic.name,
			config.studio.GraphicFileExtension
		),
		mediaFlowIds: [config.studio.GraphicMediaFlowId],
		ignoreMediaObjectStatus: config.studio.GraphicIgnoreStatus,
		ignoreBlackFrames: true,
		ignoreFreezeFrame: true,
		timelineObjects: [
			literal<TSR.TimelineObjCCGTemplate & TimelineBlueprintExt>({
				id: '',
				enable: {
					while: '1'
				},
				priority: 100,
				layer: IsTargetingWall(engine) ? SharedGraphicLLayer.GraphicLLayerWall : SharedGraphicLLayer.GraphicLLayerPilot,
				metaData: { templateData, fileName },
				content: {
					deviceType: TSR.DeviceType.CASPARCG,
					type: TSR.TimelineContentTypeCasparCg.TEMPLATE,
					templateType: 'html',
					name: 'sport-overlay/index',
					data: templateData,
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
	partDefinition: PartDefinition | undefined,
	mappedTemplate: string,
	adlib: boolean
): TSR.TSRTimelineObj[] {
	return [
		literal<TSR.TimelineObjCCGTemplate>({
			id: '',
			enable: GetEnableForGraphic(config, engine, parsedCue, isIdentGrafik, partDefinition, adlib),
			priority: 1,
			layer: GetTimelineLayerForGraphic(config, mappedTemplate),
			content: CreateHTMLRendererContent(config, mappedTemplate, { ...parsedCue.graphic.textFields })
		}),
		// Assume DSK is off by default (config table)
		...EnableDSK(config, 'OVL')
	]
}

export function CreateHTMLRendererContent(
	config: TV2BlueprintConfig,
	mappedTemplate: string,
	data: object
): TSR.TimelineObjCCGTemplate['content'] {
	return {
		deviceType: TSR.DeviceType.CASPARCG,
		type: TSR.TimelineContentTypeCasparCg.TEMPLATE,
		templateType: 'html',
		name: 'sport-overlay/index',
		data: {
			display: 'program',
			slots: HTMLTemplateContent(config, mappedTemplate, data),
			partialUpdate: true
		},
		useStopCommand: false,
		mixer: {
			opacity: 100
		}
	}
}

function HTMLTemplateContent(config: TV2BlueprintConfig, graphicTemplate: string, data: object): Partial<Slots> {
	const layer = GetTimelineLayerForGraphic(config, graphicTemplate)

	const slot = layerToHTMLGraphicSlot[layer]

	if (!slot) {
		return {}
	}

	return {
		[slot]: {
			display: 'program',
			payload: {
				type: graphicTemplate,
				...data
			}
		}
	}
}
