import { TV2ShowStyleConfig } from 'tv2-common'
import { SharedGraphicLLayer } from 'tv2-constants'

export function getTimelineLayerForGraphic(config: TV2ShowStyleConfig, name: string) {
	const conf = config.showStyle.GfxTemplates.find(gfx => gfx.VizTemplate.toString() === name)

	if (!conf) {
		return SharedGraphicLLayer.GraphicLLayerOverlay
	}

	switch (conf.LayerMapping) {
		// TODO: When adding more output layers
		case SharedGraphicLLayer.GraphicLLayerOverlayIdent:
			return SharedGraphicLLayer.GraphicLLayerOverlayIdent
		case SharedGraphicLLayer.GraphicLLayerOverlayTopt:
			return SharedGraphicLLayer.GraphicLLayerOverlayTopt
		case SharedGraphicLLayer.GraphicLLayerOverlayLower:
			return SharedGraphicLLayer.GraphicLLayerOverlayLower
		case SharedGraphicLLayer.GraphicLLayerOverlayHeadline:
			if (config.studio.GraphicsType === 'HTML') {
				return SharedGraphicLLayer.GraphicLLayerOverlayLower
			}
			return SharedGraphicLLayer.GraphicLLayerOverlayHeadline
		case SharedGraphicLLayer.GraphicLLayerOverlayTema:
			return SharedGraphicLLayer.GraphicLLayerOverlayTema
		case SharedGraphicLLayer.GraphicLLayerWall:
			return SharedGraphicLLayer.GraphicLLayerWall
		case SharedGraphicLLayer.GraphicLLayerLocators:
			return SharedGraphicLLayer.GraphicLLayerLocators
		default:
			return SharedGraphicLLayer.GraphicLLayerOverlay
	}
}
