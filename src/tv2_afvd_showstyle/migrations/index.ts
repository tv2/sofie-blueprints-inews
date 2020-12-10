import { MigrationStepShowStyle } from 'tv-automation-sofie-blueprints-integration'
import {
	literal,
	SetShortcutListMigrationStep,
	SetShowstyleTransitionMigrationStep,
	UpsertValuesIntoTransitionTable
} from 'tv2-common'
import * as _ from 'underscore'
import { remapVizDOvl, remapVizLLayer } from '../../tv2_offtube_showstyle/migrations'
import { remapTableColumnValues } from '../../tv2_offtube_showstyle/migrations/util'
import { SourceLayer } from '../layers'
import {
	forceSourceLayerToDefaults,
	getOutputLayerDefaultsMigrationSteps,
	getSourceLayerDefaultsMigrationSteps
} from './util'
import { getCreateVariantMigrationSteps } from './variants-defaults'

declare const VERSION: string // Injected by webpack

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
	...SetShortcutListMigrationStep('1.3.1', SourceLayer.PgmJingle, 'NumpadDivide,NumpadSubtract,NumpadAdd'),
	SetShowstyleTransitionMigrationStep('1.3.1', '/ NBA WIPE'),
	...UpsertValuesIntoTransitionTable('1.3.1', [{ Transition: 'MIX8' }, { Transition: 'MIX25' }]),

	/**
	 * 1.3.3
	 * - Shortcuts for DVE Box 1
	 */
	...SetShortcutListMigrationStep(
		'1.3.3',
		SourceLayer.PgmDVEBox1,
		'shift+f1,shift+f2,shift+f3,shift+f4,shift+f5,shift+1,shift+2,shift+3,shift+4,shift+5,shift+6,shift+7,shift+8,shift+9,shift+0,shift+e,shift+d,shift+i,shift+u,shift+t'
	),

	// 1.3.7 - Unhide wall layer
	forceSourceLayerToDefaults('1.3.7', SourceLayer.WallGraphics),

	// 1.3.8 - Change delayed layer type to local
	forceSourceLayerToDefaults('1.3.8', SourceLayer.PgmDelayed),
	forceSourceLayerToDefaults('1.3.8', SourceLayer.PgmDVE),

	// Fill in any layers that did not exist before
	// Note: These should only be run as the very final step of all migrations. otherwise they will add items too early, and confuse old migrations
	...getSourceLayerDefaultsMigrationSteps(VERSION),
	...getOutputLayerDefaultsMigrationSteps(VERSION)
])
