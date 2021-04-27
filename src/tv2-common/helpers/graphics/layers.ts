import { TV2BlueprintConfig } from 'tv2-common'
import { GraphicLLayer, SharedSourceLayers } from 'tv2-constants'

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
		return GraphicLLayer.GraphicLLayerOverlay
	}

	switch (conf.LayerMapping) {
		// TODO: When adding more output layers
		case GraphicLLayer.GraphicLLayerOverlayIdent:
			return GraphicLLayer.GraphicLLayerOverlayIdent
		case GraphicLLayer.GraphicLLayerOverlayTopt:
			return GraphicLLayer.GraphicLLayerOverlayTopt
		case GraphicLLayer.GraphicLLayerOverlayLower:
			return GraphicLLayer.GraphicLLayerOverlayLower
		case GraphicLLayer.GraphicLLayerOverlayHeadline:
			if (config.studio.GraphicsType === 'HTML') {
				return GraphicLLayer.GraphicLLayerOverlayLower
			}
			return GraphicLLayer.GraphicLLayerOverlayHeadline
		case GraphicLLayer.GraphicLLayerOverlayTema:
			return GraphicLLayer.GraphicLLayerOverlayTema
		case GraphicLLayer.GraphicLLayerWall:
			return GraphicLLayer.GraphicLLayerWall
		default:
			return GraphicLLayer.GraphicLLayerOverlay
	}
}
