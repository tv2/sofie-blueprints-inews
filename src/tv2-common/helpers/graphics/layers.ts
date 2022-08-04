import { TV2BlueprintConfig } from 'tv2-common'
import { SharedGraphicLLayer, SharedSourceLayers } from 'tv2-constants'

export function GetSourceLayerForGraphic(config: TV2BlueprintConfig, name: string, isStickyIdent?: boolean) {
	const conf = config.showStyle.GFXTemplates
		? config.showStyle.GFXTemplates.find(gfk => gfk.VizTemplate.toString() === name)
		: undefined

	if (!conf) {
		return SharedSourceLayers.PgmGraphicsOverlay
	}

	switch (conf.SourceLayer) {
		// TODO: When adding more sourcelayers
		// This is here to guard against bad user input
		case SharedSourceLayers.PgmGraphicsHeadline:
			if (config.studio.GraphicsType === 'HTML') {
				return SharedSourceLayers.PgmGraphicsLower
			}
			return SharedSourceLayers.PgmGraphicsHeadline
		case SharedSourceLayers.PgmGraphicsIdent:
			if (isStickyIdent) {
				return SharedSourceLayers.PgmGraphicsIdentPersistent
			}

			return SharedSourceLayers.PgmGraphicsIdent
		case SharedSourceLayers.PgmGraphicsLower:
			return SharedSourceLayers.PgmGraphicsLower
		case SharedSourceLayers.PgmGraphicsOverlay:
			return SharedSourceLayers.PgmGraphicsOverlay
		case SharedSourceLayers.PgmGraphicsTLF:
			return SharedSourceLayers.PgmGraphicsTLF
		case SharedSourceLayers.PgmGraphicsTema:
			return SharedSourceLayers.PgmGraphicsTema
		case SharedSourceLayers.PgmGraphicsTop:
			return SharedSourceLayers.PgmGraphicsTop
		case SharedSourceLayers.WallGraphics:
			return SharedSourceLayers.WallGraphics
		default:
			return SharedSourceLayers.PgmGraphicsOverlay
	}
}

export function GetTimelineLayerForGraphic(config: TV2BlueprintConfig, name: string) {
	const conf = config.showStyle.GFXTemplates
		? config.showStyle.GFXTemplates.find(gfk => gfk.VizTemplate.toString() === name)
		: undefined

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
