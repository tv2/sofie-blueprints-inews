import { IBlueprintPart, TSR } from '@tv2media/blueprints-integration'
import { layerToHTMLGraphicSlot, literal, TV2BlueprintConfig } from 'tv2-common'
import { GraphicEngine, GraphicLLayer } from 'tv2-constants'

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
		const slotBaselineObjects: TSR.TSRTimelineObj[] = []
		;[
			GraphicLLayer.GraphicLLayerOverlayIdent,
			GraphicLLayer.GraphicLLayerOverlayLower,
			GraphicLLayer.GraphicLLayerOverlayTema,
			GraphicLLayer.GraphicLLayerOverlayTopt,
			GraphicLLayer.GraphicLLayerLocators
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
				layer: GraphicLLayer.GraphicLLayerOverlay,
				content: {
					deviceType: TSR.DeviceType.CASPARCG,
					type: TSR.TimelineContentTypeCasparCg.TEMPLATE,
					templateType: 'html',
					name: 'sport-overlay/index',
					data: {
						display: 'program',
						slots: [
							GraphicLLayer.GraphicLLayerOverlayIdent,
							GraphicLLayer.GraphicLLayerOverlayLower,
							GraphicLLayer.GraphicLLayerOverlayTema,
							GraphicLLayer.GraphicLLayerOverlayTopt,
							GraphicLLayer.GraphicLLayerLocators
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
				layer: GraphicLLayer.GraphicLLayerDesign,
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
				layer: GraphicLLayer.GraphicLLayerPilot,
				content: {
					deviceType: TSR.DeviceType.CASPARCG,
					type: TSR.TimelineContentTypeCasparCg.TEMPLATE,
					templateType: 'html',
					name: 'sport-overlay/index',
					data: {
						display: 'program',
						slots: {
							[layerToHTMLGraphicSlot[GraphicLLayer.GraphicLLayerPilot]]: {
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

export function findShowId(config: TV2BlueprintConfig, engine: GraphicEngine): string {
	const graphicsSetup = config.selectedGraphicsSetup
	switch (engine) {
		case 'FULL':
		case 'WALL':
			return graphicsSetup.FullShowId
		case 'TLF':
		case 'OVL':
			return graphicsSetup.OvlShowId
	}
}
