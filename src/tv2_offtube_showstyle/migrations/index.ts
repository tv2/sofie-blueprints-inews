import { MigrationStepShowStyle } from '@sofie-automation/blueprints-integration'
import {
	AddGraphicToGFXTable,
	GetDSKSourceLayerNames,
	literal,
	removeSourceLayer,
	renameSourceLayer,
	SetShortcutListMigrationStep,
	SetShowstyleTransitionMigrationStep,
	UpsertValuesIntoTransitionTable
} from 'tv2-common'
import { GraphicLLayer, SharedSourceLayers } from 'tv2-constants'
import * as _ from 'underscore'
import { SetSourceLayerNameMigrationStep } from '../../tv2-common/migrations/shortcuts'
import { ATEMModel } from '../../types/atem'
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

/** Migrations overriden later */
// 1.3.1
const jingle131 = SetShortcutListMigrationStep(
	'1.3.1',
	OfftubeSourceLayer.PgmJingle,
	'NumpadDivide,NumpadSubtract,NumpadAdd'
)

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
	jingle131,
	SetShowstyleTransitionMigrationStep('1.3.1', '/ NBA WIPE'),
	...UpsertValuesIntoTransitionTable('1.3.1', [{ Transition: 'MIX8' }, { Transition: 'MIX25' }]),

	/**
	 * 1.3.3
	 * - Shortcuts for DVE Box 1
	 */
	SetShortcutListMigrationStep('1.3.3', OfftubeSourceLayer.PgmDVEBox1, 'shift+f1,shift+1,shift+2,shift+3,shift+t'),

	/**
	 * 1.3.8
	 * - Remove Clear Shortcut from FULL graphic layer
	 */
	forceSourceLayerToDefaults('1.3.8', OfftubeSourceLayer.PgmDVE),

	/**
	 * 1.3.9
	 * - Create Design layer
	 */
	forceSourceLayerToDefaults('1.3.9', OfftubeSourceLayer.PgmDesign),
	forceSourceLayerToDefaults('1.3.9', OfftubeSourceLayer.PgmJingle, [jingle131.id]),

	/**
	 * 1.4.6
	 * - Live shortcuts (recall last live)
	 */
	forceSourceLayerToDefaults('1.4.6', OfftubeSourceLayer.PgmLive),

	renameSourceLayer('1.5.0', 'Offtube', 'studio0_offtube_graphicsFull', SharedSourceLayers.SelectedAdlibGraphicsFull),
	renameSourceLayer('1.5.0', 'Offtube', 'studio0_full', SharedSourceLayers.PgmPilot),
	renameSourceLayer('1.5.0', 'Offtube', 'studio0_offtube_continuity', SharedSourceLayers.PgmContinuity),
	removeSourceLayer('1.5.0', 'Offtube', 'studio0_offtube_pgm_source_select'),
	forceSourceLayerToDefaults('1.5.1', OfftubeSourceLayer.PgmDVE),

	/***
	 * 1.5.2
	 * - Remove PgmJingle shortcuts, moved to JingleAdlib layer
	 */
	forceSourceLayerToDefaults('1.5.2', OfftubeSourceLayer.PgmJingle),

	AddGraphicToGFXTable('1.5.4', 'Offtube', {
		VizTemplate: 'locators',
		SourceLayer: '',
		LayerMapping: GraphicLLayer.GraphicLLayerLocators,
		INewsCode: '',
		INewsName: 'locators',
		VizDestination: '',
		OutType: '',
		IsDesign: false
	}),

	/**
	 * 1.6.1
	 * - Remove studio0_dsk_cmd, will be replaced by studio0_dsk_1_cmd by defaults
	 */
	removeSourceLayer('1.6.1', 'AFVD', 'studio0_dsk_cmd'),

	/**
	 * 1.6.2
	 * - Move Recall Last DVE shortcut to PGMDVEAdLib
	 */
	forceSourceLayerToDefaults('1.6.2', OfftubeSourceLayer.PgmDVE),
	forceSourceLayerToDefaults('1.6.2', OfftubeSourceLayer.PgmDVEAdLib),

	/**
	 * 1.6.3
	 * - Hide DSK toggle layers
	 */
	...GetDSKSourceLayerNames(ATEMModel.PRODUCTION_STUDIO_4K_2ME).map(layerName =>
		forceSourceLayerToDefaults('1.6.3', layerName)
	),

	/**
	 * 1.6.9
	 * - Renaming source layers
	 */
	// OVERLAY gruop
	 SetSourceLayerNameMigrationStep('1.6.9', OfftubeSourceLayer.PgmGraphicsIdent, 'GFX Ident'),
	 SetSourceLayerNameMigrationStep('1.6.9', OfftubeSourceLayer.PgmGraphicsIdentPersistent, 'GFX Ident Persistent (hidden)'),
	 SetSourceLayerNameMigrationStep('1.6.9', OfftubeSourceLayer.PgmGraphicsTop, 'GFX Top'),
	 SetSourceLayerNameMigrationStep('1.6.9', OfftubeSourceLayer.PgmGraphicsLower, 'GFX Lowerthirds'),
	 SetSourceLayerNameMigrationStep('1.6.9', OfftubeSourceLayer.PgmGraphicsHeadline, 'GFX Headline'),
	 SetSourceLayerNameMigrationStep('1.6.9', OfftubeSourceLayer.PgmGraphicsOverlay, 'GFX Overlay (fallback)'),
	 SetSourceLayerNameMigrationStep('1.6.9', OfftubeSourceLayer.PgmGraphicsTLF, 'GFX Telefon'),
	 SetSourceLayerNameMigrationStep('1.6.9', OfftubeSourceLayer.PgmGraphicsTema, 'GFX Tema'),
	 SetSourceLayerNameMigrationStep('1.6.9', OfftubeSourceLayer.WallGraphics, 'GFX Wall'),
	 SetSourceLayerNameMigrationStep('1.6.9', SharedSourceLayers.PgmPilotOverlay, 'GFX overlay (VCP)(Shared)'),
	 SetSourceLayerNameMigrationStep('1.6.9', SharedSourceLayers.PgmPilotOverlay, 'GFX overlay (VCP)(Shared)'),
	// PGM group
	SetSourceLayerNameMigrationStep('1.6.9', OfftubeSourceLayer.PgmCam, 'Camera'),
	SetSourceLayerNameMigrationStep('1.6.9', OfftubeSourceLayer.PgmDVEAdLib, 'DVE (adlib)'),
	SetSourceLayerNameMigrationStep('1.6.9', OfftubeSourceLayer.PgmVoiceOver, 'VO'),
	SetSourceLayerNameMigrationStep('1.6.9', OfftubeSourceLayer.PgmPilot, 'GFX FULL (VCP)'),
	SetSourceLayerNameMigrationStep('1.6.9', OfftubeSourceLayer.PgmContinuity, 'Continuity'),
	SetSourceLayerNameMigrationStep('1.6.9', OfftubeSourceLayer.PgmDVEBox1, 'DVE Inp 1'),
	SetSourceLayerNameMigrationStep('1.6.9', OfftubeSourceLayer.PgmDVEBox2, 'DVE Inp 2'),
	SetSourceLayerNameMigrationStep('1.6.9', OfftubeSourceLayer.PgmDVEBox3, 'DVE Inp 3'),
	SetSourceLayerNameMigrationStep('1.6.9', OfftubeSourceLayer.PgmDVEBox4, 'DVE Inp 4'),
	// MUSIK group
	SetSourceLayerNameMigrationStep('1.6.9', SharedSourceLayers.PgmAudioBed, 'Audiobed (shared)'),
	// SEC group
	SetSourceLayerNameMigrationStep('1.6.9', OfftubeSourceLayer.PgmAdlibGraphicCmd, 'GFX Cmd (adlib)'),
	SetSourceLayerNameMigrationStep('1.6.9', OfftubeSourceLayer.PgmSisyfosAdlibs, 'Sisyfos (adlib)'),
	SetSourceLayerNameMigrationStep('1.6.9', OfftubeSourceLayer.PgmAdlibJingle, 'Effect (adlib)'),
	// SELECTED_ADLIB group
	SetSourceLayerNameMigrationStep('1.6.9', OfftubeSourceLayer.SelectedAdLibDVE, 'DVE (selected)'),
	SetSourceLayerNameMigrationStep('1.6.9', OfftubeSourceLayer.SelectedServer, 'Server (selected)'),
	SetSourceLayerNameMigrationStep('1.6.9', OfftubeSourceLayer.SelectedVoiceOver, 'VO (selected)'),
	SetSourceLayerNameMigrationStep('1.6.9', OfftubeSourceLayer.SelectedAdlibGraphicsFull, 'GFX Full (selected)'),
	SetSourceLayerNameMigrationStep('1.6.9', OfftubeSourceLayer.SelectedAdlibJingle, 'Jingle (selected)'),
	// AUX group
	SetSourceLayerNameMigrationStep('1.6.9', OfftubeSourceLayer.AuxStudioScreen, 'AUX studio screen'),

	...getSourceLayerDefaultsMigrationSteps(VERSION),
	...getOutputLayerDefaultsMigrationSteps(VERSION)
])
