import { TSR } from 'blueprints-integration'
import {
	getCasparCgBaselineDesignTimelineObject,
	getTimelineLayerForGraphic,
	joinAssetToFolder,
	layerToHTMLGraphicSlot,
	Slots,
	TV2ShowStyleConfig
} from 'tv2-common'
import { SharedGraphicLLayer } from 'tv2-constants'

export function CreateHTMLRendererContent(
	config: TV2ShowStyleConfig,
	mappedTemplate: string,
	data: object
): TSR.TimelineObjCCGTemplate['content'] {
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

export function getHtmlTemplateContent(
	config: TV2ShowStyleConfig,
	graphicTemplate: string,
	data: object
): Partial<Slots> {
	const layer = getTimelineLayerForGraphic(config, graphicTemplate)

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

export function getHtmlGraphicBaseline(config: TV2ShowStyleConfig): TSR.TSRTimelineObj[] {
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
		getCasparCgBaselineDesignTimelineObject(config, templateName),
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
