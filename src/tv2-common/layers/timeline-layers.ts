/**
 * Layers shared across showstyles, to maintain compatibility with config tables.
 */

export enum GraphicLLayer {
	GraphicLLayerOverlay = 'graphic_overlay', // <= viz_layer_overlay
	GraphicLLayerOverlayIdent = 'graphic_overlay_ident', // <= viz_layer_overlay_ident
	GraphicLLayerOverlayTopt = 'graphic_overlay_topt', // <= viz_layer_overlay_topt
	GraphicLLayerOverlayLower = 'graphic_overlay_lower', // <= viz_layer_overlay_lower
	GraphicLLayerOverlayHeadline = 'graphic_overlay_headline', // <= viz_layer_overlay_headline
	GraphicLLayerOverlayTema = 'graphic_overlay_tema', // <= viz_layer_overlay_tema
	GraphicLLayerPilot = 'graphic_pilot', // <= viz_layer_pilot
	GraphicLLayerPilotOverlay = 'graphic_pilot_overlay', // <= viz_layer_pilot_overlay
	GraphicLLayerDesign = 'graphic_design', // <= viz_layer_design
	GraphicLLayerAdLibs = 'graphic_adlibs', // <= viz_layer_adlibs
	GraphicLLayerWall = 'graphic_wall' // <= viz_layer_wall
}
