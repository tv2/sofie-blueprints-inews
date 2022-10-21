/**
 * TODO: This is a placeholder.
 * This will go to the graphics package and become a dependency of the blueprints.
 */

import { SharedGraphicLLayer } from 'tv2-constants'

export const layerToHTMLGraphicSlot: { [slot: string]: string } = {
	[SharedGraphicLLayer.GraphicLLayerOverlay]: '',
	[SharedGraphicLLayer.GraphicLLayerOverlayIdent]: '650_ident',
	[SharedGraphicLLayer.GraphicLLayerOverlayLower]: '450_lowerThird',
	[SharedGraphicLLayer.GraphicLLayerOverlayTema]: '',
	[SharedGraphicLLayer.GraphicLLayerOverlayTopt]: '660_topt',
	[SharedGraphicLLayer.GraphicLLayerPilot]: '250_full',
	[SharedGraphicLLayer.GraphicLLayerOverlayPilot]: '260_overlay',
	[SharedGraphicLLayer.GraphicLLayerLocators]: '850_dve'
}

export interface Slots {
	[index: string]: Graphic<GraphicBase>
}

interface Graphic<T extends GraphicBase> {
	display?: 'program' | 'preview' | 'hidden'
	/** Set payload to null to reset values / clear */
	payload?: T | null
	style?: object
}

interface GraphicBase {
	[index: number]: string
	type: string
}
