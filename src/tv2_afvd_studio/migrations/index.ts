import { MigrationStepStudio, TSR } from '@tv2media/blueprints-integration'
import {
	AddKeepAudio,
	addSourceToSourcesConfig,
	MoveClipSourcePath,
	MoveSourcesToTable,
	PrefixEvsWithEvs,
	RemoveConfig,
	RenameStudioConfig,
	SetConfigTo,
	SetLayerNamesToDefaults
} from 'tv2-common'
import { SharedGraphicLLayer } from 'tv2-constants'
import {
	manifestAFVDDownstreamKeyers,
	manifestAFVDSourcesABMediaPlayers,
	manifestAFVDSourcesCam,
	manifestAFVDSourcesReplay,
	manifestAFVDSourcesRM,
	manifestAFVDStudioMics
} from '../config-manifests'
import { CasparLLayer, SisyfosLLAyer } from '../layers'
import { deviceMigrations } from './devices'
import MappingsDefaults from './mappings-defaults'
import {
	EnsureSisyfosMappingHasType,
	ensureStudioConfig,
	GetMappingDefaultMigrationStepForLayer,
	getMappingsDefaultsMigrationSteps,
	GetSisyfosLayersForTableMigrationAFVD,
	removeMapping,
	renameMapping
} from './util'

declare const VERSION: string // Injected by webpack

/**
 * Versions:
 * 0.1.0: Core 0.24.0
 */

export const studioMigrations: MigrationStepStudio[] = [
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
		manifestAFVDSourcesReplay.defaultVal,
		'text',
		'Studio config: Delayed Playback mappings',
		'Enter the delayed playback input mapping',
		manifestAFVDSourcesReplay.defaultVal
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

	RenameStudioConfig('1.5.0', 'AFVD', 'NetworkBasePathJingle', 'JingleNetworkBasePath'),
	RenameStudioConfig('1.5.0', 'AFVD', 'NetworkBasePathClip', 'ClipNetworkBasePath'),
	RenameStudioConfig('1.5.0', 'AFVD', 'NetworkBasePathGraphic', 'GraphicNetworkBasePath'),
	RenameStudioConfig('1.5.0', 'AFVD', 'PilotCutToMediaPlayer', 'VizPilotGraphics.CutToMediaPlayer'),
	RenameStudioConfig('1.5.0', 'AFVD', 'PilotKeepaliveDuration', 'VizPilotGraphics.KeepAliveDuration'),
	RenameStudioConfig('1.5.0', 'AFVD', 'PilotOutTransitionDuration', 'VizPilotGraphics.OutTransitionDuration'),
	RenameStudioConfig('1.5.0', 'AFVD', 'PilotPrerollDuration', 'VizPilotGraphics.PrerollDuration'),
	RenameStudioConfig('1.5.0', 'AFVD', 'FullFrameGrafikBackground', 'VizPilotGraphics.FullGraphicBackground'),

	renameMapping('1.5.1', 'studio0_adlib_viz_cmd', 'studio0_adlib_graphic_cmd'),

	renameMapping('1.5.4', 'casparcg_cg_dve_template', SharedGraphicLLayer.GraphicLLayerLocators),

	...SetLayerNamesToDefaults('1.5.5', 'AFVD', MappingsDefaults),

	/**
	 * 1.6.1
	 * - Add concept of roles to DSK config table (and cleanup configs replaced by table)
	 */
	SetConfigTo('1.6.1', 'AFVD', 'AtemSource.DSK', manifestAFVDDownstreamKeyers.defaultVal),
	RemoveConfig('1.6.1', 'AFVD', 'AtemSource.ServerC'),
	RemoveConfig('1.6.1', 'AFVD', 'AtemSource.JingleFill'),
	RemoveConfig('1.6.1', 'AFVD', 'AtemSource.JingleKey'),
	RemoveConfig('1.6.1', 'AFVD', 'AtemSource.VizClip'),
	RemoveConfig('1.6.1', 'AFVD', 'AtemSource.VizGain'),
	RemoveConfig('1.6.1', 'AFVD', 'AtemSource.CCGClip'),
	RemoveConfig('1.6.1', 'AFVD', 'AtemSource.CCGGain'),
	removeMapping('1.6.1', 'atem_dsk_graphics'),
	removeMapping('1.6.1', 'atem_dsk_efect'),

	RenameStudioConfig('1.6.2', 'AFVD', 'SourcesRM.KeepAudioInStudio', 'SourcesRM.WantsToPersistAudio'),
	RemoveConfig('1.6.2', 'AFVD', 'SourcesSkype'),

	RenameStudioConfig('1.7.4', 'AFVD', 'SourcesDelayedPlayback', 'SourcesReplay'),
	addSourceToSourcesConfig('1.7.4', 'AFVD', 'SourcesReplay', {
		SourceName: 'EPSIO',
		AtemSource: 25,
		SisyfosLayers: [SisyfosLLAyer.SisyfosSourceEpsio],
		StudioMics: true
	}),

	PrefixEvsWithEvs('1.7.4', 'AFVD', 'SourcesReplay', '1'),
	PrefixEvsWithEvs('1.7.4', 'AFVD', 'SourcesReplay', '2'),

	// Fill in any mappings that did not exist before
	// Note: These should only be run as the very final step of all migrations. otherwise they will add items too early, and confuse old migrations
	...getMappingsDefaultsMigrationSteps(VERSION)
]
