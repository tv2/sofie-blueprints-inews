import { MigrationStepShowStyle } from '@tv2media/blueprints-integration'
import {
	AddGraphicToGFXTable,
	GetDefaultAdLibTriggers,
	GetDSKSourceLayerNames,
	literal,
	RemoveOldShortcuts,
	removeSourceLayer,
	SetShortcutListMigrationStep,
	SetShowstyleTransitionMigrationStep,
	SetSourceLayerNameMigrationStep,
	StripFolderFromAudioBedConfig,
	StripFolderFromDVEConfig,
	UpsertValuesIntoTransitionTable
} from 'tv2-common'
import { GraphicLLayer } from 'tv2-constants'
import * as _ from 'underscore'
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

/** Migrations overriden later */
// 1.3.1
const jingle131 = SetShortcutListMigrationStep('1.3.1', SourceLayer.PgmJingle, 'NumpadDivide,NumpadSubtract,NumpadAdd')

const SHOW_STYLE_ID = 'tv2_afvd_showstyle'

/**
 * Versions:
 * 0.1.0: Core 0.24.0
 */

export const showStyleMigrations: MigrationStepShowStyle[] = literal<MigrationStepShowStyle[]>([
	...getCreateVariantMigrationSteps(),
	...remapTableColumnValues('0.1.0', 'GFXTemplates', 'LayerMapping', remapVizLLayer),
	// Rename "viz-d-ovl" to "OVL1"
	...remapTableColumnValues('0.1.0', 'GFXTemplates', 'VizDestination', remapVizDOvl),
	// Update all defaults for 1.3.0
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
	SetShortcutListMigrationStep(
		'1.3.3',
		'studio0_dve_box1',
		'shift+f1,shift+f2,shift+f3,shift+f4,shift+f5,shift+1,shift+2,shift+3,shift+4,shift+5,shift+6,shift+7,shift+8,shift+9,shift+0,shift+e,shift+d,shift+i,shift+u,shift+t'
	),

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
	forceSourceLayerToDefaults('1.5.2', SourceLayer.PgmJingle, [jingle131.id]),

	AddGraphicToGFXTable('1.5.4', 'AFVD', {
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
	SetSourceLayerNameMigrationStep('1.6.9', SourceLayer.PgmGraphicsIdent, 'GFX Ident'),
	SetSourceLayerNameMigrationStep('1.6.9', SourceLayer.PgmGraphicsIdentPersistent, 'GFX Ident Persistent (hidden)'),
	SetSourceLayerNameMigrationStep('1.6.9', SourceLayer.PgmGraphicsTop, 'GFX Top'),
	SetSourceLayerNameMigrationStep('1.6.9', SourceLayer.PgmGraphicsLower, 'GFX Lowerthirds'),
	SetSourceLayerNameMigrationStep('1.6.9', SourceLayer.PgmGraphicsHeadline, 'GFX Headline'),
	SetSourceLayerNameMigrationStep('1.6.9', SourceLayer.PgmGraphicsOverlay, 'GFX Overlay (fallback)'),
	SetSourceLayerNameMigrationStep('1.6.9', SourceLayer.PgmGraphicsTLF, 'GFX Telefon'),
	SetSourceLayerNameMigrationStep('1.6.9', SourceLayer.PgmGraphicsTema, 'GFX Tema'),
	SetSourceLayerNameMigrationStep('1.6.9', SourceLayer.WallGraphics, 'GFX Wall'),
	SetSourceLayerNameMigrationStep('1.6.9', SourceLayer.PgmPilotOverlay, 'GFX Overlay (VCP)'),
	// PGM group
	SetSourceLayerNameMigrationStep('1.6.9', SourceLayer.PgmCam, 'Camera'),
	SetSourceLayerNameMigrationStep('1.6.9', SourceLayer.PgmDVEAdLib, 'DVE (adlib)'),
	SetSourceLayerNameMigrationStep('1.6.9', SourceLayer.PgmVoiceOver, 'VO'),
	SetSourceLayerNameMigrationStep('1.6.9', SourceLayer.PgmPilot, 'GFX FULL (VCP)'),
	SetSourceLayerNameMigrationStep('1.6.9', SourceLayer.PgmContinuity, 'Continuity'),
	SetSourceLayerNameMigrationStep('1.6.9', 'studio0_dve_box1', 'DVE Inp 1'),
	SetSourceLayerNameMigrationStep('1.6.9', 'studio0_dve_box2', 'DVE Inp 2'),
	SetSourceLayerNameMigrationStep('1.6.9', 'studio0_dve_box3', 'DVE Inp 3'),
	SetSourceLayerNameMigrationStep('1.6.9', 'studio0_dve_box4', 'DVE Inp 4'),
	// MUSIK group
	SetSourceLayerNameMigrationStep('1.6.9', SourceLayer.PgmAudioBed, 'Audiobed (shared)'),
	// SEC group
	SetSourceLayerNameMigrationStep('1.6.9', SourceLayer.PgmAdlibGraphicCmd, 'GFX Cmd (adlib)'),
	SetSourceLayerNameMigrationStep('1.6.9', SourceLayer.PgmSisyfosAdlibs, 'Sisyfos (adlib)'),
	SetSourceLayerNameMigrationStep('1.6.9', SourceLayer.PgmAdlibJingle, 'Effect (adlib)'),
	SetSourceLayerNameMigrationStep('1.6.9', SourceLayer.PgmFullBackground, 'GFX FULL Background'),
	// SELECTED_ADLIB group
	SetSourceLayerNameMigrationStep('1.6.9', SourceLayer.SelectedServer, 'Server (selected)'),
	SetSourceLayerNameMigrationStep('1.6.9', SourceLayer.SelectedVoiceOver, 'VO (selected)'),
	SetSourceLayerNameMigrationStep('1.6.9', SourceLayer.SelectedAdlibGraphicsFull, 'GFX Full (selected)'),
	// AUX group
	SetSourceLayerNameMigrationStep('1.6.9', SourceLayer.VizFullIn1, 'Full Inp 1'),
	SetSourceLayerNameMigrationStep('1.6.9', SourceLayer.AuxStudioScreen, 'AUX studio screen'),

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
])
