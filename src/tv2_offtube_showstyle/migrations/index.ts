import { MigrationStepShowStyle } from '@sofie-automation/blueprints-integration'
import {
	GraphicLLayer,
	literal,
	SetShortcutListMigrationStep,
	SetShowstyleTransitionMigrationStep,
	UpsertValuesIntoTransitionTable
} from 'tv2-common'
import * as _ from 'underscore'
import { OfftubeSourceLayer } from '../layers'
import {
	forceSourceLayerToDefaults,
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
	...remapTableColumnValues('0.1.0', 'GFXTemplates', 'LayerMapping', remapVizLLayer),
	...getSourceLayerDefaultsMigrationSteps('1.3.0', true),

	/**
	 * 1.3.1
	 * - Shortcuts for Jingle layer (transition buttons)
	 * - Set default transition
	 * - Populate transition table
	 */
	...SetShortcutListMigrationStep('1.3.1', OfftubeSourceLayer.PgmJingle, 'NumpadDivide,NumpadSubtract,NumpadAdd'),
	SetShowstyleTransitionMigrationStep('1.3.1', '/ NBA WIPE'),
	...UpsertValuesIntoTransitionTable('1.3.1', [{ Transition: 'MIX8' }, { Transition: 'MIX25' }]),

	/**
	 * 1.3.3
	 * - Shortcuts for DVE Box 1
	 */
	...SetShortcutListMigrationStep('1.3.3', OfftubeSourceLayer.PgmDVEBox1, 'shift+f1,shift+1,shift+2,shift+3,shift+t'),

	/**
	 * 1.3.8
	 * - Remove Clear Shortcut from FULL graphic layer
	 */
	forceSourceLayerToDefaults('1.3.8', OfftubeSourceLayer.PgmFull),
	forceSourceLayerToDefaults('1.3.8', OfftubeSourceLayer.PgmDVE),

	/**
	 * 1.3.9
	 * - Create Design layer
	 */
	forceSourceLayerToDefaults('1.3.9', OfftubeSourceLayer.PgmDesign),
	forceSourceLayerToDefaults('1.3.9', OfftubeSourceLayer.PgmJingle),

	/**
	 * 1.4.6
	 * - Live shortcuts (recall last live)
	 */
	forceSourceLayerToDefaults('1.4.6', OfftubeSourceLayer.PgmLive),

	/**
	 * 1.4.8
	 * - DVE shortcuts (recall last DVE)
	 */
	forceSourceLayerToDefaults('1.4.8', OfftubeSourceLayer.PgmDVE),

	...getSourceLayerDefaultsMigrationSteps(VERSION),
	...getOutputLayerDefaultsMigrationSteps(VERSION)
])
