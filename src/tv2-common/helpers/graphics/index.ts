import { IBlueprintPart, TSR } from '@sofie-automation/blueprints-integration'
import { layerToHTMLGraphicSlot, literal, TV2BlueprintConfig } from 'tv2-common'
import { GraphicLLayer } from 'tv2-constants'

export * from './name'
export * from './timing'
export * from './target'
export * from './layers'
export * from './internal'
export * from './pilot'
export * from './caspar'
export * from './viz'

export function ApplyFullGraphicPropertiesToPart(config: TV2BlueprintConfig, part: IBlueprintPart) {
	part.prerollDuration =
		config.studio.GraphicsType === 'HTML'
			? config.studio.CasparPrerollDuration
			: config.studio.VizPilotGraphics.PrerollDuration
	part.transitionKeepaliveDuration =
		config.studio.GraphicsType === 'HTML'
			? config.studio.HTMLGraphics.KeepAliveDuration
			: config.studio.VizPilotGraphics.KeepAliveDuration
}

export function CreateGraphicBaseline(config: TV2BlueprintConfig): TSR.TSRTimelineObj[] {
	if (config.studio.GraphicsType === 'VIZ') {
		return []
	} else {
		return [
			...[
				GraphicLLayer.GraphicLLayerOverlayHeadline,
				GraphicLLayer.GraphicLLayerOverlayIdent,
				GraphicLLayer.GraphicLLayerOverlayLower,
				GraphicLLayer.GraphicLLayerOverlayTema,
				GraphicLLayer.GraphicLLayerOverlayTopt,
				GraphicLLayer.GraphicLLayerLocators
			].map(layer => {
				return literal<TSR.TimelineObjCCGTemplate>({
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
						name: 'sport-overlay/index',
						data: `<templateData>${encodeURI(
							JSON.stringify({
								display: 'program',
								slots: {
									[layerToHTMLGraphicSlot[layer]]: {
										payload: {},
										display: 'hidden'
									}
								},
								partialUpdate: true
							})
						)}</templateData>`,
						useStopCommand: false
					}
				})
			}),
			literal<TSR.TimelineObjCCGTemplate>({
				id: '',
				enable: {
					while: '1'
				},
				priority: 0,
				layer: GraphicLLayer.GraphicLLayerOverlay,
				content: {
					deviceType: TSR.DeviceType.CASPARCG,
					type: TSR.TimelineContentTypeCasparCg.TEMPLATE,
					templateType: 'html',
					name: 'sport-overlay/index',
					data: `<templateData>${encodeURI(
						JSON.stringify({
							display: 'program',
							slots: {
								...[
									GraphicLLayer.GraphicLLayerOverlayHeadline,
									GraphicLLayer.GraphicLLayerOverlayIdent,
									GraphicLLayer.GraphicLLayerOverlayLower,
									GraphicLLayer.GraphicLLayerOverlayTema,
									GraphicLLayer.GraphicLLayerOverlayTopt
								].map(layer => {
									return {
										[layerToHTMLGraphicSlot[layer]]: {
											payload: {},
											display: 'hidden'
										}
									}
								})
							},
							partialUpdate: true
						})
					)}</templateData>`,
					useStopCommand: false
				}
			}),
			literal<TSR.TimelineObjCCGTemplate>({
				id: '',
				enable: {
					while: '1'
				},
				priority: 0,
				layer: GraphicLLayer.GraphicLLayerDesign,
				content: {
					deviceType: TSR.DeviceType.CASPARCG,
					type: TSR.TimelineContentTypeCasparCg.TEMPLATE,
					templateType: 'html',
					name: 'sport-overlay/index',
					data: `<templateData>${encodeURI(
						JSON.stringify({
							display: 'program',
							design: '',
							partialUpdate: true
						})
					)}</templateData>`,
					useStopCommand: false
				}
			}),
			literal<TSR.TimelineObjCCGTemplate>({
				id: '',
				enable: {
					while: '1'
				},
				priority: 0,
				layer: GraphicLLayer.GraphicLLayerPilot,
				content: {
					deviceType: TSR.DeviceType.CASPARCG,
					type: TSR.TimelineContentTypeCasparCg.TEMPLATE,
					templateType: 'html',
					name: 'sport-overlay/index',
					data: `<templateData>${encodeURI(
						JSON.stringify({
							display: 'program',
							slots: {}
						})
					)}</templateData>`,
					useStopCommand: false
				}
			})
		]
	}
}
