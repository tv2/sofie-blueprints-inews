/**
 * Layers shared across showstyles, to maintain compatibility with config tables.
 */

export enum GraphicLLayer {
	GraphicLLayerOverlay = 'graphic_layer_overlay', // <= viz_layer_overlay
	GraphicLLayerOverlayIdent = 'graphic_layer_overlay_ident', // <= viz_layer_overlay_ident
	GraphicLLayerOverlayTopt = 'graphic_layer_overlay_topt', // <= viz_layer_overlay_topt
	GraphicLLayerOverlayLower = 'graphic_layer_overlay_lower', // <= viz_layer_overlay_lower
	GraphicLLayerOverlayHeadline = 'graphic_layer_overlay_headline', // <= viz_layer_overlay_headline
	GraphicLLayerOverlayTema = 'graphic_layer_overlay_tema', // <= viz_layer_overlay_tema
	GraphicLLayerPilot = 'graphic_layer_pilot', // <= viz_layer_pilot
	GraphicLLayerPilotOverlay = 'graphic_layer_pilot_overlay', // <= viz_layer_pilot_overlay
	GraphicLLayerDesign = 'graphic_layer_design', // <= viz_layer_design
	GraphicLLayerAdLibs = 'graphic_layer_adlibs', // <= viz_layer_adlibs
	GraphicLLayerWall = 'graphic_layer_wall' // <= viz_layer_wall
}
