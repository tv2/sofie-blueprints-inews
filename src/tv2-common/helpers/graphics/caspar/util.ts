import { TSR } from 'blueprints-integration'
import {
	getCasparCgBaselineDesignTimelineObjects,
	getTimelineLayerForGraphic,
	joinAssetToFolder,
	layerToHTMLGraphicSlot,
	ShowStyleContext,
	Slots,
	TV2ShowStyleConfig
} from 'tv2-common'
import { SharedGraphicLLayer } from 'tv2-constants'

export function CreateHTMLRendererContent(
	config: TV2ShowStyleConfig,
	graphicTemplateName: string,
	data: object
): TSR.TimelineObjCCGTemplate['content'] {
	return {
		deviceType: TSR.DeviceType.CASPARCG,
		type: TSR.TimelineContentTypeCasparCg.TEMPLATE,
		templateType: 'html',
		name: getHtmlTemplateName(config),
		data: {
			display: 'program',
			slots: getHtmlTemplateContent(config, graphicTemplateName, data),
			partialUpdate: true
		},
		useStopCommand: false,
		mixer: {
			opacity: 1
		}
	}
}

function getMappedGraphicsTemplateName(templateName: string): string {
	switch (templateName) {
		case 'locators-afvb':
			return 'locators'
		default:
			return templateName
	}
}

function getHtmlTemplateContent(config: TV2ShowStyleConfig, graphicTemplateName: string, data: object): Partial<Slots> {
	const mappedGraphicTemplateName = getMappedGraphicsTemplateName(graphicTemplateName)
	const layer = getTimelineLayerForGraphic(config, mappedGraphicTemplateName)

	const slot = layerToHTMLGraphicSlot[layer]

	if (!slot) {
		return {}
	}

	return {
		[slot]: {
			display: 'program',
			payload: {
				type: graphicTemplateName,
				...data
			}
		}
	}
}

export function getHtmlGraphicBaseline(context: ShowStyleContext): TSR.TSRTimelineObj[] {
	const templateName = getHtmlTemplateName(context.config)
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
		...getCasparCgBaselineDesignTimelineObjects(context, templateName),
		getFullPilotBaselineTimelineObject(templateName)
	]
}

function getSlotBaselineTimelineObjects(
	templateName: string,
	layerMappings: SharedGraphicLLayer[]
): TSR.TSRTimelineObj[] {
	return layerMappings
		.filter((layer) => layerToHTMLGraphicSlot[layer])
		.map<TSR.TimelineObjCCGTemplate>((layer) => ({
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
): TSR.TimelineObjCCGTemplate {
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

function getFullPilotBaselineTimelineObject(templateName: string): TSR.TimelineObjCCGTemplate {
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

export function getHtmlTemplateName(config: TV2ShowStyleConfig) {
	return joinAssetToFolder(config.selectedGfxSetup.HtmlPackageFolder, 'index')
}
