import { MigrationStepStudio } from 'tv-automation-sofie-blueprints-integration'
import { literal, MoveSourcesToTable } from 'tv2-common'
import * as _ from 'underscore'
import { manifestOfftubeSourcesABMediaPlayers, manifestOfftubeSourcesCam, manifestOfftubeSourcesRM } from '../config-manifests'
import { deviceMigrations } from './devices'
import { ensureStudioConfig, getMappingsDefaultsMigrationSteps, GetSisyfosLayersForTableMigrationOfftube } from './util'

declare const VERSION: string // Injected by webpack

/**
 * Versions:
 * 0.1.0: Core 0.24.0
 */

export const studioMigrations: MigrationStepStudio[] = literal<MigrationStepStudio[]>([
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

	ensureStudioConfig(
		'0.1.0',
		'SourcesCam',
		manifestOfftubeSourcesCam.defaultVal,
		'text',
		'Studio config: Camera mappings',
		'Enter the camera input mapping',
		manifestOfftubeSourcesCam.defaultVal
	),

	ensureStudioConfig(
		'0.1.0',
		'SourcesRM',
		manifestOfftubeSourcesRM.defaultVal,
		'text',
		'Studio config: Remote mappings',
		'Enter the remote input mapping',
		manifestOfftubeSourcesRM.defaultVal
	),

	ensureStudioConfig(
		'0.1.0',
		'ABMediaPlayers',
		manifestOfftubeSourcesABMediaPlayers.defaultVal,
		'text',
		'Studio config: AB Media Players mappings',
		'Enter the AB Media Players input mapping',
		manifestOfftubeSourcesABMediaPlayers.defaultVal
	),

	...deviceMigrations,
	// Fill in any mappings that did not exist before
	// Note: These should only be run as the very final step of all migrations. otherwise they will add items too early, and confuse old migrations
	...getMappingsDefaultsMigrationSteps(VERSION),
	MoveSourcesToTable('0.1.0', 'SourcesCam', true, GetSisyfosLayersForTableMigrationOfftube),
	MoveSourcesToTable('0.1.0', 'SourcesRM', true, GetSisyfosLayersForTableMigrationOfftube),
	MoveSourcesToTable('0.1.0', 'ABMediaPlayers', false, GetSisyfosLayersForTableMigrationOfftube)
])
