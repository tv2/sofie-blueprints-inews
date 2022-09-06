import { MigrationStepShowStyle, SourceLayerType } from '@tv2media/blueprints-integration'
import {
	AddGraphicToGFXTable,
	changeGFXTemplate,
	GetDefaultAdLibTriggers,
	GetDSKSourceLayerNames,
	RemoveOldShortcuts,
	removeSourceLayer,
	SetShowstyleTransitionMigrationStep,
	SetSourceLayerName,
	SetSourceLayerProperties,
	StripFolderFromAudioBedConfig,
	StripFolderFromDVEConfig,
	UpsertValuesIntoTransitionTable
} from 'tv2-common'
import { SharedGraphicLLayer } from 'tv2-constants'
import { remapVizDOvl, remapVizLLayer } from '../../tv2_offtube_showstyle/migrations'
import { remapTableColumnValues } from '../../tv2_offtube_showstyle/migrations/util'
import { ATEMModel } from '../../types/atem'
import { SourceLayer } from '../layers'
import { GetDefaultStudioSourcesForAFVD } from './hotkeys'
import sourcelayerDefaults from './sourcelayer-defaults'
import {
	forceSourceLayerToDefaults,
	getOutputLayerDefaultsMigrationSteps,
	getSourceLayerDefaultsMigrationSteps
} from './util'
import { getCreateVariantMigrationSteps } from './variants-defaults'

declare const VERSION: string // Injected by webpack

const SHOW_STYLE_ID = 'tv2_afvd_showstyle'

/**
 * Versions:
 * 0.1.0: Core 0.24.0
 */

export const showStyleMigrations: MigrationStepShowStyle[] = [
	...getCreateVariantMigrationSteps(),
	...remapTableColumnValues('0.1.0', 'GFXTemplates', 'LayerMapping', remapVizLLayer),
	// Rename "viz-d-ovl" to "OVL1"
	...remapTableColumnValues('0.1.0', 'GFXTemplates', 'VizDestination', remapVizDOvl),
	// Update all defaults for 1.3.0
	...getSourceLayerDefaultsMigrationSteps('1.3.0', true),

	/**
	 * 1.3.1
	 * - Set default transition
	 * - Populate transition table
	 */
	SetShowstyleTransitionMigrationStep('1.3.1', '/ NBA WIPE'),
	...UpsertValuesIntoTransitionTable('1.3.1', [{ Transition: 'MIX8' }, { Transition: 'MIX25' }]),

	// 1.3.7 - Unhide wall layer
	forceSourceLayerToDefaults('1.3.7', SourceLayer.WallGraphics),

	// 1.3.8 - Change delayed layer type to local
	forceSourceLayerToDefaults('1.3.8', SourceLayer.PgmLocal),

	// 1.3.10 - Change local layer name to EVS
	forceSourceLayerToDefaults('1.3.10', SourceLayer.PgmLocal),

	/**
	 * 1.4.6
	 * - Live shortcuts (recall last live)
	 */
	forceSourceLayerToDefaults('1.4.6', SourceLayer.PgmLive),

	/**
	 * 1.4.8
	 * - DVE shortcuts (recall last DVE)
	 */
	forceSourceLayerToDefaults('1.4.8', SourceLayer.PgmDVE),

	/***
	 * 1.5.2
	 * - Remove PgmJingle shortcuts, moved to JingleAdlib layer
	 */
	forceSourceLayerToDefaults('1.5.2', SourceLayer.PgmJingle),

	AddGraphicToGFXTable('1.5.4', 'AFVD', {
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
	forceSourceLayerToDefaults('1.6.2', SourceLayer.PgmDVE),
	forceSourceLayerToDefaults('1.6.2', SourceLayer.PgmDVEAdLib),

	/**
	 * 1.6.3
	 * - Hide DSK toggle layers
	 */
	...GetDSKSourceLayerNames(ATEMModel.CONSTELLATION_8K_UHD_MODE).map(layerName =>
		forceSourceLayerToDefaults('1.6.3', layerName)
	),

	/**
	 * 1.6.9
	 * - Set new source layer names
	 */
	// OVERLAY group
	SetSourceLayerName('1.6.9', SourceLayer.PgmGraphicsIdent, 'GFX Ident'),
	SetSourceLayerName('1.6.9', 'studio0_graphicsIdent_persistent', 'GFX Ident Persistent (hidden)'),
	SetSourceLayerName('1.6.9', SourceLayer.PgmGraphicsTop, 'GFX Top'),
	SetSourceLayerName('1.6.9', SourceLayer.PgmGraphicsLower, 'GFX Lowerthirds'),
	SetSourceLayerName('1.6.9', SourceLayer.PgmGraphicsHeadline, 'GFX Headline'),
	SetSourceLayerName('1.6.9', SourceLayer.PgmGraphicsOverlay, 'GFX Overlay (fallback)'),
	SetSourceLayerName('1.6.9', SourceLayer.PgmGraphicsTLF, 'GFX Telefon'),
	SetSourceLayerName('1.6.9', SourceLayer.PgmGraphicsTema, 'GFX Tema'),
	SetSourceLayerName('1.6.9', SourceLayer.WallGraphics, 'GFX Wall'),
	SetSourceLayerName('1.6.9', SourceLayer.PgmPilotOverlay, 'GFX Overlay (VCP)'),
	// PGM group
	SetSourceLayerName('1.6.9', SourceLayer.PgmCam, 'Camera'),
	SetSourceLayerName('1.6.9', SourceLayer.PgmDVEAdLib, 'DVE (adlib)'),
	SetSourceLayerName('1.6.9', SourceLayer.PgmVoiceOver, 'VO'),
	SetSourceLayerName('1.6.9', SourceLayer.PgmPilot, 'GFX FULL (VCP)'),
	SetSourceLayerName('1.6.9', SourceLayer.PgmContinuity, 'Continuity'),
	// MUSIK group
	SetSourceLayerName('1.6.9', SourceLayer.PgmAudioBed, 'Audiobed (shared)'),
	// SEC group
	SetSourceLayerName('1.6.9', SourceLayer.PgmAdlibGraphicCmd, 'GFX Cmd (adlib)'),
	SetSourceLayerName('1.6.9', SourceLayer.PgmSisyfosAdlibs, 'Sisyfos (adlib)'),
	SetSourceLayerName('1.6.9', SourceLayer.PgmAdlibJingle, 'Effect (adlib)'),
	SetSourceLayerName('1.6.9', SourceLayer.PgmFullBackground, 'GFX FULL Background'),
	// SELECTED_ADLIB group
	SetSourceLayerName('1.6.9', SourceLayer.SelectedServer, 'Server (selected)'),
	SetSourceLayerName('1.6.9', SourceLayer.SelectedVoiceOver, 'VO (selected)'),
	SetSourceLayerName('1.6.9', SourceLayer.SelectedAdlibGraphicsFull, 'GFX Full (selected)'),
	// AUX group
	SetSourceLayerName('1.6.9', SourceLayer.VizFullIn1, 'Full Inp 1'),
	SetSourceLayerName('1.6.9', SourceLayer.AuxStudioScreen, 'AUX studio screen'),

	/**
	 * 1.6.10
	 * - Remove 'audio/' from soundbed configs
	 * - Remove 'dve/' from DVE frame/key configs
	 * - Add PgmJingle to presenter screen
	 */
	StripFolderFromAudioBedConfig('1.6.10', 'AFVD'),
	StripFolderFromDVEConfig('1.6.10', 'AFVD'),
	forceSourceLayerToDefaults('1.6.10', SourceLayer.PgmJingle),

	/**
	 * 1.7.0
	 * - Remove DVE box layers (no longer needed due to triggers)
	 * - Remove old shortcuts
	 * - Migrate shortcuts to Action Triggers
	 */
	removeSourceLayer('1.7.0', 'AFVD', 'studio0_dve_box1'),
	removeSourceLayer('1.7.0', 'AFVD', 'studio0_dve_box2'),
	removeSourceLayer('1.7.0', 'AFVD', 'studio0_dve_box3'),
	removeSourceLayer('1.7.0', 'AFVD', 'studio0_dve_box4'),
	RemoveOldShortcuts('1.7.0', SHOW_STYLE_ID, sourcelayerDefaults),
	GetDefaultAdLibTriggers(
		'1.7.0',
		SHOW_STYLE_ID,
		{ local: SourceLayer.PgmLocal },
		GetDefaultStudioSourcesForAFVD,
		true
	),

	/**
	 * 1.7.1
	 * - Change source layer type for graphics that don't have previews
	 */
	SetSourceLayerProperties('1.7.1', SourceLayer.PgmGraphicsIdent, { type: SourceLayerType.LOWER_THIRD }),
	SetSourceLayerProperties('1.7.1', 'studio0_graphicsIdent_persistent', { type: SourceLayerType.LOWER_THIRD }),
	SetSourceLayerProperties('1.7.1', SourceLayer.PgmGraphicsTop, { type: SourceLayerType.LOWER_THIRD }),
	SetSourceLayerProperties('1.7.1', SourceLayer.PgmGraphicsLower, { type: SourceLayerType.LOWER_THIRD }),
	SetSourceLayerProperties('1.7.1', SourceLayer.PgmGraphicsHeadline, { type: SourceLayerType.LOWER_THIRD }),

	/**
	 * 1.7.2
	 * - Fix bundright configuration
	 */
	changeGFXTemplate(
		'1.7.2',
		'AFVD',
		{
			INewsCode: 'KG=',
			INewsName: 'bundright',
			VizTemplate: 'bund_right',
			VizDestination: 'OVL1',
			OutType: 'S'
		},
		{ OutType: '' }
	),
	changeGFXTemplate(
		'1.7.2',
		'AFVD',
		{
			INewsCode: 'KG=',
			INewsName: 'bundright',
			VizTemplate: 'bund_right',
			VizDestination: 'OVL1',
			SourceLayer: 'studio0_graphicsTema'
		},
		{ SourceLayer: 'studio0_graphicsLower' }
	),
	changeGFXTemplate(
		'1.7.2',
		'AFVD',
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

	// Fill in any layers that did not exist before
	// Note: These should only be run as the very final step of all migrations. otherwise they will add items too early, and confuse old migrations
	...getSourceLayerDefaultsMigrationSteps(VERSION),
	...getOutputLayerDefaultsMigrationSteps(VERSION),
	GetDefaultAdLibTriggers(
		VERSION,
		SHOW_STYLE_ID,
		{ local: SourceLayer.PgmLocal },
		GetDefaultStudioSourcesForAFVD,
		false
	)
]
