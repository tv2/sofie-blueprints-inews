export * from './slotMappings'

import { GraphicsContent, IBlueprintPiece, TSR, WithTimeline } from 'blueprints-integration'
import {
	CueDefinitionGraphic,
	GetEnableForGraphic,
	GetTimelineLayerForGraphic,
	GraphicInternal,
	joinAssetToFolder,
	joinAssetToNetworkPath,
	literal,
	PilotGraphicProps,
	TimelineBlueprintExt,
	TV2BlueprintConfig
} from 'tv2-common'
import { GraphicEngine, SharedGraphicLLayer } from 'tv2-constants'
import { EnableDSK } from '../../dsk'
import { PilotGraphicGenerator } from '../pilot'
import { IsTargetingFull } from '../target'
import { layerToHTMLGraphicSlot, Slots } from './slotMappings'

export interface CasparPilotGeneratorSettings {
	createFullPilotTimelineForStudio(config: TV2BlueprintConfig): Array<TSR.TSRTimelineObj<TSR.TSRTimelineContent>>
}

export function GetInternalGraphicContentCaspar(
	config: TV2BlueprintConfig,
	engine: GraphicEngine,
	parsedCue: CueDefinitionGraphic<GraphicInternal>,
	mappedTemplate: string
): IBlueprintPiece['content'] {
	return {
		timelineObjects: CasparOverlayTimeline(config, engine, parsedCue, mappedTemplate)
	}
}

export class HtmlPilotGraphicGenerator extends PilotGraphicGenerator {
	private readonly layerMappingName

	constructor(graphicProps: PilotGraphicProps) {
		super(graphicProps)
		this.layerMappingName = this.getLayerMappingName()
	}
	public getContent(): WithTimeline<GraphicsContent> {
		const graphicFolder = this.config.studio.GraphicFolder ? `${this.config.studio.GraphicFolder}\\` : ''
		const sceneName = this.getSceneName()
		const fileName = joinAssetToFolder(this.config.studio.GraphicFolder, sceneName)
		const absoluteFilePath = `${this.config.studio.HTMLGraphics.GraphicURL}\\${fileName}${this.config.studio.GraphicFileExtension}`
		const payloadType = IsTargetingFull(this.engine) ? 'still' : 'overlay'
		const templateData = {
			display: 'program',
			slots: {
				[layerToHTMLGraphicSlot[this.layerMappingName]]: {
					payload: {
						type: payloadType,
						url: encodeURI(
							absoluteFilePath

								.replace(/\//g, '\\') // Replace forward slash with backward slash
								.replace(/\\/g, '\\\\') // Replace every \ with \\ and encodURI. Double backslash means the HTML template will be able to parse the string correctly. encodeURI so Caspar doesn't mangle the data.
						),
						noAnimation: false
					},
					display: 'program'
				}
			},
			partialUpdate: !IsTargetingFull(this.engine)
		}
		return {
			fileName,
			path: joinAssetToNetworkPath(
				this.config.studio.GraphicNetworkBasePath,
				graphicFolder,
				sceneName,
				this.config.studio.GraphicFileExtension
			),
			mediaFlowIds: [this.config.studio.GraphicMediaFlowId],
			ignoreMediaObjectStatus: this.config.studio.GraphicIgnoreStatus,
			ignoreBlackFrames: true,
			ignoreFreezeFrame: true,
			timelineObjects: [
				literal<TSR.TSRTimelineObj<TSR.TimelineContentCCGTemplate> & TimelineBlueprintExt>({
					id: '',
					enable: {
						while: '1'
					},
					priority: 100,
					layer: this.layerMappingName,
					metaData: { templateData, fileName },
					content: {
						deviceType: TSR.DeviceType.CASPARCG,
						type: TSR.TimelineContentTypeCasparCg.TEMPLATE,
						templateType: 'html',
						name: getHtmlTemplateName(this.config),
						data: templateData,
						useStopCommand: false,
						mixer: {
							opacity: 100
						}
					}
				}),
				...(IsTargetingFull(this.engine)
					? this.settings.caspar.createFullPilotTimelineForStudio(this.config)
					: EnableDSK(this.config, 'OVL'))
			]
		}
	}

	private getSceneName() {
		const nameChunks = this.parsedCue.graphic.name.split('/')
		return nameChunks[nameChunks.length - 1]
	}
}

function CasparOverlayTimeline(
	config: TV2BlueprintConfig,
	engine: GraphicEngine,
	parsedCue: CueDefinitionGraphic<GraphicInternal>,
	mappedTemplate: string
): Array<TSR.TSRTimelineObj<TSR.TSRTimelineContent>> {
	return [
		literal<TSR.TSRTimelineObj<TSR.TimelineContentCCGTemplate>>({
			id: '',
			enable: GetEnableForGraphic(config, engine, parsedCue),
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
): TSR.TimelineContentCCGTemplate {
	return {
		deviceType: TSR.DeviceType.CASPARCG,
		type: TSR.TimelineContentTypeCasparCg.TEMPLATE,
		templateType: 'html',
		name: getHtmlTemplateName(config),
		data: {
			display: 'program',
			slots: getHtmlTemplateContent(config, mappedTemplate, data),
			partialUpdate: true
		},
		useStopCommand: false,
		mixer: {
			opacity: 100
		}
	}
}

function getHtmlTemplateContent(config: TV2BlueprintConfig, graphicTemplate: string, data: object): Partial<Slots> {
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

export function getHtmlGraphicBaseline(config: TV2BlueprintConfig) {
	const templateName = getHtmlTemplateName(config)
	const partiallyUpdatableLayerMappings = [
		SharedGraphicLLayer.GraphicLLayerOverlayIdent,
		SharedGraphicLLayer.GraphicLLayerOverlayLower,
		SharedGraphicLLayer.GraphicLLayerOverlayTema,
		SharedGraphicLLayer.GraphicLLayerOverlayTopt,
		SharedGraphicLLayer.GraphicLLayerOverlayPilot,
		SharedGraphicLLayer.GraphicLLayerLocators
	]
	return [
		...getSlotBaselineTimelineObjects(templateName, partiallyUpdatableLayerMappings),
		getCompoundSlotBaselineTimelineObject(templateName, partiallyUpdatableLayerMappings),
		getDesignBaselineTimelineObject(templateName),
		getFullPilotBaselineTimelineObject(templateName)
	]
}

function getSlotBaselineTimelineObjects(
	templateName: string,
	layerMappings: SharedGraphicLLayer[]
): Array<TSR.TSRTimelineObj<TSR.TSRTimelineContent>> {
	return layerMappings
		.filter(layer => layerToHTMLGraphicSlot[layer])
		.map<TSR.TSRTimelineObj<TSR.TimelineContentCCGTemplate>>(layer => ({
			id: '',
			enable: {
				while: '1'
			},
			priority: 0,
			layer,
			content: {
				deviceType: TSR.DeviceType.CASPARCG,
				type: TSR.TimelineContentTypeCasparCg.TEMPLATE,
				templateType: 'html',
				name: templateName,
				data: {
					display: 'program',
					slots: {
						[layerToHTMLGraphicSlot[layer]]: {
							payload: {},
							display: 'hidden'
						}
					},
					partialUpdate: true
				},
				useStopCommand: false
			}
		}))
}

function getCompoundSlotBaselineTimelineObject(
	templateName: string,
	layerMappings: SharedGraphicLLayer[]
): TSR.TSRTimelineObj<TSR.TimelineContentCCGTemplate> {
	const slots = layerMappings.reduce((obj: Record<string, any>, layer) => {
		if (layerToHTMLGraphicSlot[layer]) {
			obj[layerToHTMLGraphicSlot[layer]] = {
				payload: {},
				display: 'hidden'
			}
		}
		return obj
	}, {})
	return {
		id: '',
		enable: {
			while: '1'
		},
		priority: 0,
		layer: SharedGraphicLLayer.GraphicLLayerOverlay,
		content: {
			deviceType: TSR.DeviceType.CASPARCG,
			type: TSR.TimelineContentTypeCasparCg.TEMPLATE,
			templateType: 'html',
			name: templateName,
			data: {
				display: 'program',
				slots,
				partialUpdate: true
			},
			useStopCommand: false
		}
	}
}

function getDesignBaselineTimelineObject(templateName: string): TSR.TSRTimelineObj<TSR.TimelineContentCCGTemplate> {
	return {
		id: '',
		enable: {
			while: '1'
		},
		priority: 0,
		layer: SharedGraphicLLayer.GraphicLLayerDesign,
		content: {
			deviceType: TSR.DeviceType.CASPARCG,
			type: TSR.TimelineContentTypeCasparCg.TEMPLATE,
			templateType: 'html',
			name: templateName,
			data: {
				display: 'program',
				design: '',
				partialUpdate: true
			},
			useStopCommand: false
		}
	}
}

function getFullPilotBaselineTimelineObject(templateName: string): TSR.TSRTimelineObj<TSR.TimelineContentCCGTemplate> {
	return {
		id: '',
		enable: {
			while: '1'
		},
		priority: 0,
		layer: SharedGraphicLLayer.GraphicLLayerPilot,
		content: {
			deviceType: TSR.DeviceType.CASPARCG,
			type: TSR.TimelineContentTypeCasparCg.TEMPLATE,
			templateType: 'html',
			name: templateName,
			data: {
				display: 'program',
				slots: {
					[layerToHTMLGraphicSlot[SharedGraphicLLayer.GraphicLLayerPilot]]: {
						payload: {},
						display: 'hidden'
					}
				}
			},
			useStopCommand: false
		}
	}
}

export function getHtmlTemplateName(config: TV2BlueprintConfig) {
	return joinAssetToFolder(config.selectedGraphicsSetup.HtmlPackageFolder, 'index')
}
