import { IBlueprintPart, TSR } from 'blueprints-integration'
import { layerToHTMLGraphicSlot, literal, TV2BlueprintConfig } from 'tv2-common'
import { SharedGraphicLLayer } from 'tv2-constants'

export * from './name'
export * from './timing'
export * from './target'
export * from './layers'
export * from './internal'
export * from './pilot'
export * from './caspar'
export * from './viz'
export * from './design'

export function ApplyFullGraphicPropertiesToPart(config: TV2BlueprintConfig, part: IBlueprintPart) {
	const keepAliveDuration =
		config.studio.GraphicsType === 'HTML'
			? config.studio.HTMLGraphics.KeepAliveDuration
			: config.studio.VizPilotGraphics.KeepAliveDuration
	if (part.inTransition === undefined) {
		part.inTransition = {
			partContentDelayDuration: 0,
			blockTakeDuration: 0,
			previousPartKeepaliveDuration: keepAliveDuration
		}
	} else {
		part.inTransition.previousPartKeepaliveDuration = keepAliveDuration
	}
}

export function CreateGraphicBaseline(config: TV2BlueprintConfig): TSR.TSRTimelineObj[] {
	if (config.studio.GraphicsType === 'VIZ') {
		return []
	} else {
		const slotBaselineObjects: TSR.TSRTimelineObj[] = []
		;[
			SharedGraphicLLayer.GraphicLLayerOverlayIdent,
			SharedGraphicLLayer.GraphicLLayerOverlayLower,
			SharedGraphicLLayer.GraphicLLayerOverlayTema,
			SharedGraphicLLayer.GraphicLLayerOverlayTopt,
			SharedGraphicLLayer.GraphicLLayerLocators
		].forEach(layer => {
			if (layerToHTMLGraphicSlot[layer]) {
				slotBaselineObjects.push(
					literal<TSR.TimelineObjCCGTemplate>({
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
					})
				)
			}
		})

		return [
			...slotBaselineObjects,
			literal<TSR.TimelineObjCCGTemplate>({
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
					name: 'sport-overlay/index',
					data: {
						display: 'program',
						slots: [
							SharedGraphicLLayer.GraphicLLayerOverlayIdent,
							SharedGraphicLLayer.GraphicLLayerOverlayLower,
							SharedGraphicLLayer.GraphicLLayerOverlayTema,
							SharedGraphicLLayer.GraphicLLayerOverlayTopt,
							SharedGraphicLLayer.GraphicLLayerLocators
						].reduce((obj: Record<string, any>, layer) => {
							if (layerToHTMLGraphicSlot[layer]) {
								obj[layerToHTMLGraphicSlot[layer]] = {
									payload: {},
									display: 'hidden'
								}
							}
							return obj
						}, {}),
						partialUpdate: true
					},
					useStopCommand: false
				}
			}),
			literal<TSR.TimelineObjCCGTemplate>({
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
					name: 'sport-overlay/index',
					data: {
						display: 'program',
						design: '',
						partialUpdate: true
					},
					useStopCommand: false
				}
			}),
			literal<TSR.TimelineObjCCGTemplate>({
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
					name: 'sport-overlay/index',
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
			})
		]
	}
}
