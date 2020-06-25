import { MigrationStepStudio } from 'tv-automation-sofie-blueprints-integration'
import { AddKeepAudio, literal, MoveClipSourcePath, MoveSourcesToTable } from 'tv2-common'
import * as _ from 'underscore'
import {
	manifestAFVDSourcesABMediaPlayers,
	manifestAFVDSourcesCam,
	manifestAFVDSourcesDelayedPlayback,
	manifestAFVDSourcesRM,
	manifestAFVDSourcesSkype,
	manifestAFVDStudioMics
} from '../config-manifests'
import { SisyfosLLAyer } from '../layers'
import { deviceMigrations } from './devices'
import {
	ensureStudioConfig,
	GetMappingDefaultMigrationStepForLayer,
	getMappingsDefaultsMigrationSteps,
	GetSisyfosLayersForTableMigrationAFVD,
	renameMapping
} from './util'

declare const VERSION: string // Injected by webpack

/**
 * Versions:
 * 0.1.0: Core 0.24.0
 */

export const studioMigrations: MigrationStepStudio[] = literal<MigrationStepStudio[]>([
	ensureStudioConfig(
		'0.1.0',
		'SourcesCam',
		manifestAFVDSourcesCam.defaultVal,
		'text',
		'Studio config: Camera mappings',
		'Enter the camera input mapping',
		manifestAFVDSourcesCam.defaultVal
	),

	ensureStudioConfig(
		'0.1.0',
		'SourcesRM',
		manifestAFVDSourcesRM.defaultVal,
		'text',
		'Studio config: Remote mappings',
		'Enter the remote input mapping',
		manifestAFVDSourcesRM.defaultVal
	),

	ensureStudioConfig(
		'0.1.0',
		'SourcesDelayedPlayback',
		manifestAFVDSourcesDelayedPlayback.defaultVal,
		'text',
		'Studio config: Delayed Playback mappings',
		'Enter the delayed playback input mapping',
		manifestAFVDSourcesDelayedPlayback.defaultVal
	),

	ensureStudioConfig(
		'0.1.0',
		'SourcesSkype',
		manifestAFVDSourcesSkype.defaultVal,
		'text',
		'Studio config: Skype mappings',
		'Enter the Skype input mapping',
		manifestAFVDSourcesSkype.defaultVal
	),

	ensureStudioConfig(
		'0.1.0',
		'ABMediaPlayers',
		manifestAFVDSourcesABMediaPlayers.defaultVal,
		'text',
		'Studio config: AB Media Players mappings',
		'Enter the AB Media Players input mapping',
		manifestAFVDSourcesABMediaPlayers.defaultVal
	),

	ensureStudioConfig(
		'0.1.0',
		'StudioMics',
		manifestAFVDStudioMics.defaultVal,
		'text',
		'Studio config: Studio Mics',
		'Select the Sisyfos layers for Studio Mics',
		manifestAFVDStudioMics.defaultVal
	),

	...deviceMigrations,
	// Fill in any mappings that did not exist before
	// Note: These should only be run as the very final step of all migrations. otherwise they will add items too early, and confuse old migrations
	...getMappingsDefaultsMigrationSteps(VERSION),
	MoveSourcesToTable('0.1.0', 'SourcesCam', true, GetSisyfosLayersForTableMigrationAFVD, true),
	MoveSourcesToTable('0.1.0', 'SourcesRM', true, GetSisyfosLayersForTableMigrationAFVD, false),
	MoveSourcesToTable('0.1.0', 'SourcesDelayedPlayback', true, GetSisyfosLayersForTableMigrationAFVD, true),
	MoveSourcesToTable('0.1.0', 'SourcesSkype', true, GetSisyfosLayersForTableMigrationAFVD, false),
	MoveSourcesToTable('0.1.0', 'ABMediaPlayers', true, GetSisyfosLayersForTableMigrationAFVD),
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
	].map(layer => renameMapping('0.2.0', layer, layer.replace(/^viz_layer_/, 'graphic_'))),
	AddKeepAudio('0.2.0', 'SourcesRM'),
	MoveClipSourcePath('0.2.0', 'AFVD'),
	GetMappingDefaultMigrationStepForLayer('0.3.0', SisyfosLLAyer.SisyfosGroupStudioMics)
])
