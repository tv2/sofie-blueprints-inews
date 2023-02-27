import { MigrationStepShowStyle, SourceLayerType } from 'blueprints-integration'
import {
	AddGraphicToGfxTable,
	changeGfxTemplate,
	GetDefaultAdLibTriggers,
	GetDSKSourceLayerNames,
	mapGfxTemplateToDesignTemplateAndDeleteOriginals,
	RemoveOldShortcuts,
	removeSourceLayer,
	renameSourceLayer,
	SetShowstyleTransitionMigrationStep,
	SetSourceLayerName,
	SetSourceLayerProperties,
	StripFolderFromAudioBedConfig,
	StripFolderFromDVEConfig,
	UpsertValuesIntoTransitionTable
} from 'tv2-common'
import { SharedGraphicLLayer, SharedSourceLayers } from 'tv2-constants'
import {
	renameBlueprintConfiguration,
	renameBlueprintsConfigurationForAllVariants,
	renameTableId
} from '../../tv2-common/migrations/renameConfigurationHelper'
import { ATEMModel } from '../../types/atem'
import { OfftubeSourceLayer } from '../layers'
import { GetDefaultStudioSourcesForOfftube } from './hotkeys'
import sourcelayerDefaults from './sourcelayer-defaults'
import {
	forceSourceLayerToDefaults,
	getOutputLayerDefaultsMigrationSteps,
	getSourceLayerDefaultsMigrationSteps,
	remapTableColumnValues
} from './util'

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
	[VizLLayer.VizLLayerOverlay, SharedGraphicLLayer.GraphicLLayerOverlay],
	[VizLLayer.VizLLayerOverlayIdent, SharedGraphicLLayer.GraphicLLayerOverlayIdent],
	[VizLLayer.VizLLayerOverlayTopt, SharedGraphicLLayer.GraphicLLayerOverlayIdent],
	[VizLLayer.VizLLayerOverlayLower, SharedGraphicLLayer.GraphicLLayerOverlayLower],
	[VizLLayer.VizLLayerOverlayHeadline, SharedGraphicLLayer.GraphicLLayerOverlayHeadline],
	[VizLLayer.VizLLayerOverlayTema, SharedGraphicLLayer.GraphicLLayerOverlayTema],
	[VizLLayer.VizLLayerPilot, SharedGraphicLLayer.GraphicLLayerPilot],
	[VizLLayer.VizLLayerPilotOverlay, SharedGraphicLLayer.GraphicLLayerOverlayPilot],
	[VizLLayer.VizLLayerDesign, SharedGraphicLLayer.GraphicLLayerDesign],
	[VizLLayer.VizLLayerAdLibs, SharedGraphicLLayer.GraphicLLayerAdLibs],
	[VizLLayer.VizLLayerWall, SharedGraphicLLayer.GraphicLLayerWall]
])

export const remapVizDOvl: Map<string, string> = new Map([['viz-d-ovl', 'OVL1']])

const SHOW_STYLE_ID = 'tv2_offtube_showstyle'

/**
 * Versions:
 * 0.1.0: Core 0.24.0
 */

export const showStyleMigrations: MigrationStepShowStyle[] = [
	// Fill in any layers that did not exist before
	// Note: These should only be run as the very final step of all migrations. otherwise they will add items too early, and confuse old migrations
	remapTableColumnValues('0.1.0', 'GFXTemplates', 'LayerMapping', remapVizLLayer),
	...getSourceLayerDefaultsMigrationSteps('1.3.0', true),

	/**
	 * 1.3.1
	 * - Set default transition
	 * - Populate transition table
	 */
	SetShowstyleTransitionMigrationStep('1.3.1', '/ NBA WIPE'),
	...UpsertValuesIntoTransitionTable('1.3.1', [{ Transition: 'MIX8' }, { Transition: 'MIX25' }]),

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
	forceSourceLayerToDefaults('1.3.9', OfftubeSourceLayer.PgmJingle),

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

	AddGraphicToGfxTable('1.5.4', 'Offtube', {
		VizTemplate: 'locators',
		SourceLayer: '',
		LayerMapping: SharedGraphicLLayer.GraphicLLayerLocators,
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
	...GetDSKSourceLayerNames(ATEMModel.PRODUCTION_STUDIO_4K_2ME).map((layerName) =>
		forceSourceLayerToDefaults('1.6.3', layerName)
	),

	/**
	 * 1.6.9
	 * - Renaming source layers
	 */
	// OVERLAY group
	SetSourceLayerName('1.6.9', OfftubeSourceLayer.PgmGraphicsIdent, 'GFX Ident'),
	SetSourceLayerName('1.6.9', 'studio0_graphicsIdent_persistent', 'GFX Ident Persistent (hidden)'),
	SetSourceLayerName('1.6.9', OfftubeSourceLayer.PgmGraphicsTop, 'GFX Top'),
	SetSourceLayerName('1.6.9', OfftubeSourceLayer.PgmGraphicsLower, 'GFX Lowerthirds'),
	SetSourceLayerName('1.6.9', OfftubeSourceLayer.PgmGraphicsHeadline, 'GFX Headline'),
	SetSourceLayerName('1.6.9', OfftubeSourceLayer.PgmGraphicsOverlay, 'GFX Overlay (fallback)'),
	SetSourceLayerName('1.6.9', OfftubeSourceLayer.PgmGraphicsTLF, 'GFX Telefon'),
	SetSourceLayerName('1.6.9', OfftubeSourceLayer.PgmGraphicsTema, 'GFX Tema'),
	SetSourceLayerName('1.6.9', OfftubeSourceLayer.WallGraphics, 'GFX Wall'),
	SetSourceLayerName('1.6.9', SharedSourceLayers.PgmPilotOverlay, 'GFX overlay (VCP)(shared)'),
	// PGM group
	SetSourceLayerName('1.6.9', OfftubeSourceLayer.PgmCam, 'Camera'),
	SetSourceLayerName('1.6.9', OfftubeSourceLayer.PgmDVEAdLib, 'DVE (adlib)'),
	SetSourceLayerName('1.6.9', OfftubeSourceLayer.PgmVoiceOver, 'VO'),
	SetSourceLayerName('1.6.9', OfftubeSourceLayer.PgmPilot, 'GFX FULL (VCP)'),
	SetSourceLayerName('1.6.9', OfftubeSourceLayer.PgmContinuity, 'Continuity'),
	// MUSIK group
	SetSourceLayerName('1.6.9', SharedSourceLayers.PgmAudioBed, 'Audiobed (shared)'),
	// SEC group
	SetSourceLayerName('1.6.9', OfftubeSourceLayer.PgmAdlibGraphicCmd, 'GFX Cmd (adlib)'),
	SetSourceLayerName('1.6.9', OfftubeSourceLayer.PgmSisyfosAdlibs, 'Sisyfos (adlib)'),
	SetSourceLayerName('1.6.9', OfftubeSourceLayer.PgmAdlibJingle, 'Effect (adlib)'),
	// SELECTED_ADLIB group
	SetSourceLayerName('1.6.9', OfftubeSourceLayer.SelectedAdLibDVE, 'DVE (selected)'),
	SetSourceLayerName('1.6.9', OfftubeSourceLayer.SelectedServer, 'Server (selected)'),
	SetSourceLayerName('1.6.9', OfftubeSourceLayer.SelectedVoiceOver, 'VO (selected)'),
	SetSourceLayerName('1.6.9', OfftubeSourceLayer.SelectedAdlibGraphicsFull, 'GFX Full (selected)'),
	SetSourceLayerName('1.6.9', OfftubeSourceLayer.SelectedAdlibJingle, 'Jingle (selected)'),
	// AUX group
	SetSourceLayerName('1.6.9', OfftubeSourceLayer.AuxStudioScreen, 'AUX studio screen'),

	/**
	 * 1.6.10
	 * - Remove 'audio/' from soundbed configs
	 * - Remove 'dve/' from DVE frame/key configs
	 * - Add PgmJingle to presenter screen
	 */
	StripFolderFromAudioBedConfig('1.6.10', 'AFVD'),
	StripFolderFromDVEConfig('1.6.10', 'AFVD'),
	forceSourceLayerToDefaults('1.6.10', OfftubeSourceLayer.PgmJingle),

	/**
	 * 1.7.0
	 * - Remove DVE box layers (no longer needed due to triggers)
	 * - Remove old shortcuts
	 * - Migrate shortcuts to Action Triggers
	 */
	removeSourceLayer('1.7.0', 'QBOX', 'studio0_dve_box1'),
	removeSourceLayer('1.7.0', 'QBOX', 'studio0_dve_box2'),
	removeSourceLayer('1.7.0', 'QBOX', 'studio0_dve_box3'),
	removeSourceLayer('1.7.0', 'QBOX', 'studio0_dve_box4'),
	RemoveOldShortcuts('1.7.0', SHOW_STYLE_ID, sourcelayerDefaults),
	GetDefaultAdLibTriggers('1.7.0', SHOW_STYLE_ID, {}, GetDefaultStudioSourcesForOfftube, true),

	/**
	 * 1.7.1
	 * - Change source layer type for graphics that don't have previews
	 */
	SetSourceLayerProperties('1.7.1', OfftubeSourceLayer.PgmGraphicsIdent, { type: SourceLayerType.LOWER_THIRD }),
	SetSourceLayerProperties('1.7.1', 'studio0_graphicsIdent_persistent', {
		type: SourceLayerType.LOWER_THIRD
	}),
	SetSourceLayerProperties('1.7.1', OfftubeSourceLayer.PgmGraphicsTop, { type: SourceLayerType.LOWER_THIRD }),
	SetSourceLayerProperties('1.7.1', OfftubeSourceLayer.PgmGraphicsLower, { type: SourceLayerType.LOWER_THIRD }),
	SetSourceLayerProperties('1.7.1', OfftubeSourceLayer.PgmGraphicsHeadline, { type: SourceLayerType.LOWER_THIRD }),
	SetSourceLayerProperties('1.7.1', OfftubeSourceLayer.PgmGraphicsTLF, { type: SourceLayerType.LOWER_THIRD }),

	/**
	 * 1.7.2
	 * - Fix bundright configuration
	 */
	changeGfxTemplate(
		'1.7.2',
		'QBOX',
		{
			INewsCode: 'KG=',
			INewsName: 'bundright',
			VizTemplate: 'bund_right',
			VizDestination: 'OVL1',
			OutType: 'S'
		},
		{ OutType: '' }
	),
	changeGfxTemplate(
		'1.7.2',
		'QBOX',
		{
			INewsCode: 'KG=',
			INewsName: 'bundright',
			VizTemplate: 'bund_right',
			VizDestination: 'OVL1',
			SourceLayer: 'studio0_graphicsTema'
		},
		{ SourceLayer: 'studio0_graphicsLower' }
	),
	changeGfxTemplate(
		'1.7.2',
		'QBOX',
		{
			INewsCode: 'KG=',
			INewsName: 'bundright',
			VizTemplate: 'bund_right',
			VizDestination: 'OVL1',
			LayerMapping: 'graphic_overlay_tema'
		},
		{ LayerMapping: 'graphic_overlay_lower' }
	),

	/**
	 * 1.7.5
	 * - Remove persistent idents
	 */
	removeSourceLayer('1.7.5', 'AFVD', 'studio0_graphicsIdent_persistent'),

	/**
	 * 1.7.6
	 * - Map designs from GFXTemplates to GfxDesignTemplates and delete them from GFXTemplates
	 */
	mapGfxTemplateToDesignTemplateAndDeleteOriginals('1.7.6', 'QBOX', 'GFXTemplates', 'GfxDesignTemplates'),

	/**
	 * 1.7.7
	 * - Update SourceLayerType for Continuity
	 * - Update SourceLayerType for DveBackground
	 */
	forceSourceLayerToDefaults('1.7.7', OfftubeSourceLayer.PgmContinuity),
	forceSourceLayerToDefaults('1.7.7', OfftubeSourceLayer.PgmDVEBackground),

	renameTableId('1.7.9', 'GFXTemplates', 'GfxTemplates'),
	renameTableId('1.7.9', 'GraphicsSetups', 'GfxSetups'),
	renameBlueprintConfiguration('1.7.9', 'SelectedGraphicsSetupName', 'SelectedGfxSetupName'),
	renameBlueprintsConfigurationForAllVariants('1.7.9', 'SelectedGraphicsSetupName', 'SelectedGfxSetupName'),

	...getSourceLayerDefaultsMigrationSteps(VERSION),
	...getOutputLayerDefaultsMigrationSteps(VERSION),
	GetDefaultAdLibTriggers(VERSION, SHOW_STYLE_ID, {}, GetDefaultStudioSourcesForOfftube, false)
]
