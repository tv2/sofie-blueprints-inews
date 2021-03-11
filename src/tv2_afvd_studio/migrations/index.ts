import { MigrationStepStudio, TSR } from '@sofie-automation/blueprints-integration'
import {
	AddKeepAudio,
	literal,
	MoveClipSourcePath,
	MoveDSKToTable,
	MoveSourcesToTable,
	RenameStudioConfig,
	TableConfigItemDSK
} from 'tv2-common'
import * as _ from 'underscore'
import {
	manifestAFVDDownstreamKeyers,
	manifestAFVDSourcesABMediaPlayers,
	manifestAFVDSourcesCam,
	manifestAFVDSourcesDelayedPlayback,
	manifestAFVDSourcesRM,
	manifestAFVDSourcesSkype,
	manifestAFVDStudioMics
} from '../config-manifests'
import { CasparLLayer, SisyfosLLAyer } from '../layers'
import { deviceMigrations } from './devices'
import {
	EnsureSisyfosMappingHasType,
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
	...[
		'sisyfos_source_jingle',
		'sisyfos_source_audiobed',
		'sisyfos_source_tlf_hybrid',
		'sisyfos_source_Host_1_st_a',
		'sisyfos_source_Host_2_st_a',
		'sisyfos_source_Guest_1_st_a',
		'sisyfos_source_Guest_2_st_a',
		'sisyfos_source_Guest_3_st_a',
		'sisyfos_source_Guest_4_st_a',
		'sisyfos_source_Host_1_st_b',
		'sisyfos_source_Host_2_st_b',
		'sisyfos_source_Guest_1_st_b',
		'sisyfos_source_Guest_2_st_b',
		'sisyfos_source_Guest_3_st_b',
		'sisyfos_source_Guest_4_st_b',
		'sisyfos_source_live_1',
		'sisyfos_source_live_2',
		'sisyfos_source_live_3',
		'sisyfos_source_live_4',
		'sisyfos_source_live_5',
		'sisyfos_source_live_6',
		'sisyfos_source_live_7',
		'sisyfos_source_live_8',
		'sisyfos_source_live_9',
		'sisyfos_source_live_10',
		'sisyfos_source_server_a',
		'sisyfos_source_server_b',
		'sisyfos_source_evs_1',
		'sisyfos_source_evs_2',
		'sisyfos_resync'
	].map(layer => EnsureSisyfosMappingHasType('1.3.0', layer, TSR.MappingSisyfosType.CHANNEL)),
	GetMappingDefaultMigrationStepForLayer('1.3.0', SisyfosLLAyer.SisyfosGroupStudioMics),
	GetMappingDefaultMigrationStepForLayer('1.3.2', CasparLLayer.CasparCGLYD, true),
	GetMappingDefaultMigrationStepForLayer('1.4.0', CasparLLayer.CasparPlayerClipPending, true),
	GetMappingDefaultMigrationStepForLayer('1.4.5', CasparLLayer.CasparPlayerClipPending, true),

	RenameStudioConfig('1.4.6', 'AFVD', 'MediaFlowId', 'ClipMediaFlowId'),
	RenameStudioConfig('1.4.6', 'AFVD', 'NetworkBasePath', 'NetworkBasePathClip'),
	RenameStudioConfig('1.4.6', 'AFVD', 'JingleBasePath', 'NetworkBasePathJingle'),
	MoveDSKToTable('1.4.6', (manifestAFVDDownstreamKeyers.defaultVal as unknown) as TableConfigItemDSK),

	RenameStudioConfig('1.5.0', 'AFVD', 'NetworkBasePathJingle', 'JingleNetworkBasePath'),
	RenameStudioConfig('1.5.0', 'AFVD', 'NetworkBasePathClip', 'ClipNetworkBasePath'),
	RenameStudioConfig('1.5.0', 'AFVD', 'NetworkBasePathGraphic', 'GraphicNetworkBasePath'),
	RenameStudioConfig('1.5.0', 'AFVD', 'PilotCutToMediaPlayer', 'VizPilotGraphics.CutToMediaPlayer'),
	RenameStudioConfig('1.5.0', 'AFVD', 'PilotKeepaliveDuration', 'VizPilotGraphics.KeepAliveDuration'),
	RenameStudioConfig('1.5.0', 'AFVD', 'PilotOutTransitionDuration', 'VizPilotGraphics.OutTransitionDuration'),
	RenameStudioConfig('1.5.0', 'AFVD', 'PilotPrerollDuration', 'VizPilotGraphics.PrerollDuration'),

	// Fill in any mappings that did not exist before
	// Note: These should only be run as the very final step of all migrations. otherwise they will add items too early, and confuse old migrations
	...getMappingsDefaultsMigrationSteps(VERSION)
])
