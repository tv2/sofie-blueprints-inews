/**
 * TODO: This is a placeholder.
 * This will go to the graphics package and become a dependency of the blueprints.
 */

import { GraphicLLayer } from 'tv2-constants'

export const layerToHTMLGraphicSlot: { [slot: string]: string } = {
	[GraphicLLayer.GraphicLLayerOverlay]: '',
	[GraphicLLayer.GraphicLLayerOverlayHeadline]: '450_lowerThird',
	[GraphicLLayer.GraphicLLayerOverlayIdent]: '650_ident',
	[GraphicLLayer.GraphicLLayerOverlayLower]: '450_lowerThird',
	[GraphicLLayer.GraphicLLayerOverlayTema]: '',
	[GraphicLLayer.GraphicLLayerOverlayTopt]: '660_topt',
	[GraphicLLayer.GraphicLLayerPilot]: '250_full',
	[GraphicLLayer.GraphicLLayerPilotOverlay]: '250_full'
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
