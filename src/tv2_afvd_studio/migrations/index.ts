import { MigrationStepStudio } from 'tv-automation-sofie-blueprints-integration'
import { literal } from 'tv2-common'
import * as _ from 'underscore'
import { deviceMigrations } from './devices'
import { getMappingsDefaultsMigrationSteps, moveSourcesToTable, renameMapping } from './util'

declare const VERSION: string // Injected by webpack

/**
 * Versions:
 * 0.1.0: Core 0.24.0
 */

export const studioMigrations: MigrationStepStudio[] = literal<MigrationStepStudio[]>([
	moveSourcesToTable('0.1.0', 'SourcesCam'),
	moveSourcesToTable('0.1.0', 'SourcesRM'),
	moveSourcesToTable('0.1.0', 'SourcesDelayedPlayback'),
	moveSourcesToTable('0.1.0', 'SourcesSkype'),
	moveSourcesToTable('0.1.0', 'ABMediaPlayers'),

	// ensureStudioConfig(
	// 	'0.1.0',
	// 	'SourcesCam',
	// 	null,
	// 	'text',
	// 	'Studio config: Camera mappings',
	// 	'Enter the Camera input mapping (example: "1:1,2:2,3:3,4:4"'
	// ),
	// ensureStudioConfig(
	// 	'0.1.0',
	// 	'ABMediaPlayers',
	// 	null,
	// 	'text',
	// 	'Studio config: Media player inputs',
	// 	'Enter the Media player inputs (example: "1:17,2:18,3:19")'
	// ),

	...deviceMigrations,
	// Fill in any mappings that did not exist before
	// Note: These should only be run as the very final step of all migrations. otherwise they will add items too early, and confuse old migrations
	...getMappingsDefaultsMigrationSteps(VERSION),
	...[
		'viz_layer_adlibs',
		'viz_layer_design',
		'viz_layer_overlay',
		'viz_layer_overlay_headline',
		'viz_layer_overlay_ident',
		'viz_layer_overlay_lower',
		'viz_layer_overlay_tema',
		'viz_layer_overlay_topt',
		'viz_layer_pilot',
		'viz_layer_pilot_overlay',
		'viz_layer_wall'
	].map(layer => renameMapping('2.0.0', layer, layer.replace(/^viz_layer_/, 'graphic_')))
])
