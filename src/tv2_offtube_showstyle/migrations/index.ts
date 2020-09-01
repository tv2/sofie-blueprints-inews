import { MigrationStepShowStyle } from 'tv-automation-sofie-blueprints-integration'
import { GraphicLLayer, literal } from 'tv2-common'
import * as _ from 'underscore'
import {
	getOutputLayerDefaultsMigrationSteps,
	getSourceLayerDefaultsMigrationSteps,
	remapTableColumnValues
} from './util'
import { getCreateVariantMigrationSteps } from './variants-defaults'

declare const VERSION: string // Injected by webpack

/**
 * Old layers, used here for reference. Should not be used anywhere else.
 */
enum VizLLayer {
	VizLLayerOverlay = 'viz_layer_overlay',
	VizLLayerOverlayIdent = 'viz_layer_overlay_ident',
	VizLLayerOverlayTopt = 'viz_layer_overlay_topt',
	VizLLayerOverlayLower = 'viz_layer_overlay_lower',
	VizLLayerOverlayHeadline = 'viz_layer_overlay_headline',
	VizLLayerOverlayTema = 'viz_layer_overlay_tema',
	VizLLayerPilot = 'viz_layer_pilot',
	VizLLayerPilotOverlay = 'viz_layer_pilot_overlay',
	VizLLayerDesign = 'viz_layer_design',
	VizLLayerAdLibs = 'viz_layer_adlibs',
	VizLLayerWall = 'viz_layer_wall'
}

export const remapVizLLayer: Map<string, string> = new Map([
	[VizLLayer.VizLLayerOverlay, GraphicLLayer.GraphicLLayerOverlay],
	[VizLLayer.VizLLayerOverlayIdent, GraphicLLayer.GraphicLLayerOverlayIdent],
	[VizLLayer.VizLLayerOverlayTopt, GraphicLLayer.GraphicLLayerOverlayIdent],
	[VizLLayer.VizLLayerOverlayLower, GraphicLLayer.GraphicLLayerOverlayLower],
	[VizLLayer.VizLLayerOverlayHeadline, GraphicLLayer.GraphicLLayerOverlayHeadline],
	[VizLLayer.VizLLayerOverlayTema, GraphicLLayer.GraphicLLayerOverlayTema],
	[VizLLayer.VizLLayerPilot, GraphicLLayer.GraphicLLayerPilot],
	[VizLLayer.VizLLayerPilotOverlay, GraphicLLayer.GraphicLLayerPilotOverlay],
	[VizLLayer.VizLLayerDesign, GraphicLLayer.GraphicLLayerDesign],
	[VizLLayer.VizLLayerAdLibs, GraphicLLayer.GraphicLLayerAdLibs],
	[VizLLayer.VizLLayerWall, GraphicLLayer.GraphicLLayerWall]
])

export const remapVizDOvl: Map<string, string> = new Map([['viz-d-ovl', 'OVL1']])

/**
 * Versions:
 * 0.1.0: Core 0.24.0
 */

export const showStyleMigrations: MigrationStepShowStyle[] = literal<MigrationStepShowStyle[]>([
	// Fill in any layers that did not exist before
	// Note: These should only be run as the very final step of all migrations. otherwise they will add items too early, and confuse old migrations
	...getCreateVariantMigrationSteps(),
	...getSourceLayerDefaultsMigrationSteps(VERSION),
	...getOutputLayerDefaultsMigrationSteps(VERSION),
	...remapTableColumnValues('0.1.0', 'GFXTemplates', 'LayerMapping', remapVizLLayer)
])
