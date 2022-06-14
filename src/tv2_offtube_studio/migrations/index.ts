import {
	MigrationContextStudio,
	MigrationStepStudio,
	TableConfigItemValue,
	TSR
} from '@tv2media/blueprints-integration'
import {
	AddKeepAudio,
	literal,
	MoveClipSourcePath,
	MoveSourcesToTable,
	RemoveConfig,
	RenameStudioConfig,
	SetConfigTo,
	SetLayerNamesToDefaults
} from 'tv2-common'
import { GraphicLLayer } from 'tv2-constants'
import * as _ from 'underscore'
import { EnsureSisyfosMappingHasType } from '../../tv2_afvd_studio/migrations/util'
import {
	manifestOfftubeDownstreamKeyers,
	manifestOfftubeSourcesABMediaPlayers,
	manifestOfftubeSourcesCam,
	manifestOfftubeSourcesRM,
	manifestOfftubeStudioMics
} from '../config-manifests'
import { OfftubeCasparLLayer, OfftubeSisyfosLLayer } from '../layers'
import { deviceMigrations } from './devices'
import MappingsDefaults from './mappings-defaults'
import {
	ensureStudioConfig,
	GetMappingDefaultMigrationStepForLayer,
	getMappingsDefaultsMigrationSteps,
	GetSisyfosLayersForTableMigrationOfftube,
	removeMapping,
	renameMapping
} from './util'

declare const VERSION: string // Injected by webpack

function renameAudioSources(versionStr: string, renaming: Map<string, string>): MigrationStepStudio[] {
	const steps: MigrationStepStudio[] = []
	for (const layer in renaming) {
		if (layer in renaming) {
			const res = literal<MigrationStepStudio>({
				id: `${versionStr}.studioConfig.renameAudioSources.${layer}`,
				version: versionStr,
				canBeRunAutomatically: true,
				validate: (context: MigrationContextStudio) => {
					const existingLayer = context.getMapping(layer)
					if (existingLayer !== undefined) {
						return `${layer} needs to be renamed to ${renaming.get(layer)}`
					}
					return false
				},
				migrate: (context: MigrationContextStudio) => {
					const existingLayer = context.getMapping(layer)
					const newName = renaming.get(layer) as string
					const renamedLayer = context.getMapping(newName)

					if (existingLayer !== undefined) {
						context.removeMapping(layer)
						if (!renamedLayer) {
							context.insertMapping(newName, existingLayer)
						}
					}
				}
			})

			steps.push(res)
		}
	}

	return steps
}

function ensureMappingDeleted(versionStr: string, mapping: string): MigrationStepStudio {
	const res = literal<MigrationStepStudio>({
		id: `${versionStr}.studioConfig.ensureMappingDeleted.${mapping}`,
		version: versionStr,
		canBeRunAutomatically: true,
		validate: (context: MigrationContextStudio) => {
			const existingLayer = context.getMapping(mapping)
			if (existingLayer !== undefined) {
				return `${mapping} needs to be deleted`
			}
			return false
		},
		migrate: (context: MigrationContextStudio) => {
			const existingLayer = context.getMapping(mapping)

			if (existingLayer !== undefined) {
				context.removeMapping(mapping)
			}
		}
	})

	return res
}

function remapTableColumnValuesInner(
	table: TableConfigItemValue,
	columnId: string,
	/** Map values [from, to] */
	remapping: Map<string, string>
): { changed: number; table: TableConfigItemValue } {
	let changed = 0

	table.map(row => {
		const val = row[columnId]

		if (val) {
			if (_.isArray(val)) {
				_.each(val, (v, i) => {
					const remap = remapping.get(v)
					if (remap) {
						val[i] = remap
						changed++
					}
				})
				row[columnId] = val
			} else {
				const remap = remapping.get(val.toString())

				if (remap) {
					row[columnId] = remap
					changed++
				}
			}
		}

		return row
	})

	return { changed, table }
}

function remapTableColumnValues(
	versionStr: string,
	tableId: string,
	columnId: string,
	/** Map values [from, to] */
	remapping: Map<string, string>
): MigrationStepStudio[] {
	return [
		literal<MigrationStepStudio>({
			id: `${versionStr}.remapTableColumnValue.${tableId}.${columnId}`,
			version: versionStr,
			canBeRunAutomatically: true,
			validate: (context: MigrationContextStudio) => {
				const table = context.getConfig(tableId) as TableConfigItemValue | undefined

				if (!table) {
					return `Table "${tableId}" does not exist`
				}

				if (!table.length) {
					// No values, nothing to remap
					return false
				}

				const first = table[0]

				if (!Object.keys(first).includes(columnId)) {
					return `Column "${columnId}" does not exist in table "${tableId}"`
				}

				const ret = remapTableColumnValuesInner(table, columnId, remapping)

				if (typeof ret === 'string' || typeof ret === 'boolean') {
					return ret
				}

				return ret.changed !== 0
			},
			migrate: (context: MigrationContextStudio) => {
				const table = context.getConfig(tableId) as TableConfigItemValue

				const ret = remapTableColumnValuesInner(table, columnId, remapping)

				context.setConfig(tableId, ret.table)
			}
		})
	]
}

const audioSourceRenaming: Map<string, string> = new Map([
	['sisyfos_source_live_1', OfftubeSisyfosLLayer.SisyfosSourceLive_1_Stereo],
	['sisyfos_source_live_2', OfftubeSisyfosLLayer.SisyfosSourceLive_1_Surround],
	['sisyfos_source_world_feed_stereo', OfftubeSisyfosLLayer.SisyfosSourceLive_2_Stereo],
	['sisyfos_source_world_feed_surround', OfftubeSisyfosLLayer.SisyfosSourceLive_3]
])

export const studioMigrations: MigrationStepStudio[] = literal<MigrationStepStudio[]>([
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

	ensureStudioConfig(
		'0.1.0',
		'StudioMics',
		manifestOfftubeStudioMics.defaultVal,
		'text',
		'Studio config: Studio Mics',
		'Select the Sisyfos layers for Studio Mics',
		manifestOfftubeStudioMics.defaultVal
	),

	...deviceMigrations,
	MoveSourcesToTable('0.1.0', 'SourcesCam', true, GetSisyfosLayersForTableMigrationOfftube, true),
	MoveSourcesToTable('0.1.0', 'SourcesRM', true, GetSisyfosLayersForTableMigrationOfftube, false),
	MoveSourcesToTable('0.1.0', 'ABMediaPlayers', false, GetSisyfosLayersForTableMigrationOfftube, false),
	AddKeepAudio('0.1.0', 'SourcesRM'),
	...renameAudioSources('0.2.0', audioSourceRenaming),
	...remapTableColumnValues('0.2.0', 'SourcesCam', 'SisyfosLayers', audioSourceRenaming),
	...remapTableColumnValues('0.2.0', 'SourcesRM', 'SisyfosLayers', audioSourceRenaming),
	ensureMappingDeleted('0.2.0', 'sisyfos_source_live_1'),
	ensureMappingDeleted('0.2.0', 'sisyfos_source_live_2'),
	ensureMappingDeleted('0.2.0', 'sisyfos_source_world_feed_stereo'),
	ensureMappingDeleted('0.2.0', 'sisyfos_source_world_feed_surround'),
	MoveClipSourcePath('0.2.0', 'Offtube_Q2'),
	...[
		'sisyfos_source_jingle',
		'sisyfos_source_Host_1_st_a',
		'sisyfos_source_Host_2_st_a',
		'sisyfos_source_Host_3_st_a',
		'sisyfos_source_live_1_stereo',
		'sisyfos_source_live_1_surround',
		'sisyfos_source_live_2_stereo',
		'sisyfos_source_live_3',
		'sisyfos_source_server_a',
		'sisyfos_source_server_b'
	].map(layer => EnsureSisyfosMappingHasType('1.3.0', layer, TSR.MappingSisyfosType.CHANNEL)),
	GetMappingDefaultMigrationStepForLayer('1.3.0', OfftubeSisyfosLLayer.SisyfosConfig),
	GetMappingDefaultMigrationStepForLayer('1.3.0', OfftubeSisyfosLLayer.SisyfosGroupStudioMics),
	GetMappingDefaultMigrationStepForLayer('1.4.0', OfftubeCasparLLayer.CasparPlayerClipPending, true),
	GetMappingDefaultMigrationStepForLayer('1.4.5', OfftubeCasparLLayer.CasparPlayerClipPending, true),

	RenameStudioConfig('1.4.6', 'Offtube', 'MediaFlowId', 'ClipMediaFlowId'),
	RenameStudioConfig('1.4.6', 'Offtube', 'NetworkBasePath', 'NetworkBasePathClip'),
	RenameStudioConfig('1.4.6', 'Offtube', 'JingleBasePath', 'NetworkBasePathJingle'),
	RenameStudioConfig('1.4.6', 'Offtube', 'GraphicBasePath', 'NetworkBasePathGraphic'),
	RenameStudioConfig('1.4.6', 'Offtube', 'GraphicFlowId', 'GraphicMediaFlowId'),

	GetMappingDefaultMigrationStepForLayer('1.4.8', 'casparcg_player_jingle_looakhead', true),

	RenameStudioConfig('1.5.0', 'Offtube', 'NetworkBasePathJingle', 'JingleNetworkBasePath'),
	RenameStudioConfig('1.5.0', 'Offtube', 'NetworkBasePathClip', 'ClipNetworkBasePath'),
	RenameStudioConfig('1.5.0', 'Offtube', 'NetworkBasePathGraphic', 'GraphicNetworkBasePath'),
	RenameStudioConfig('1.5.0', 'Offtube', 'FullGraphicURL', 'HTMLGraphics.GraphicURL'),
	RenameStudioConfig('1.5.0', 'Offtube', 'FullKeepAliveDuration', 'HTMLGraphics.KeepAliveDuration'),
	RenameStudioConfig(
		'1.5.0',
		'Offtube',
		'FullTransitionSettings.borderSoftness',
		'HTMLGraphics.TransitionSettings.borderSoftness'
	),
	RenameStudioConfig(
		'1.5.0',
		'Offtube',
		'FullTransitionSettings.loopOutTransitionDuration',
		'HTMLGraphics.TransitionSettings.loopOutTransitionDuration'
	),
	RenameStudioConfig('1.5.0', 'Offtube', 'FullTransitionSettings.wipeRate', 'HTMLGraphics.TransitionSettings.wipeRate'),
	removeMapping('1.5.0', 'casparcg_studio_screen_loop'),
	removeMapping('1.5.0', 'casparcg_graphics_overlay'),

	GetMappingDefaultMigrationStepForLayer('1.5.1', GraphicLLayer.GraphicLLayerAdLibs, true),
	GetMappingDefaultMigrationStepForLayer('1.5.3', GraphicLLayer.GraphicLLayerWall, true),
	GetMappingDefaultMigrationStepForLayer('1.5.3', GraphicLLayer.GraphicLLayerPilot, true),
	GetMappingDefaultMigrationStepForLayer('1.5.3', GraphicLLayer.GraphicLLayerPilotOverlay, true),
	GetMappingDefaultMigrationStepForLayer('1.5.3', GraphicLLayer.GraphicLLayerFullLoop, true),
	SetConfigTo('1.5.3', 'Offtube', 'AtemSource.GFXFull', 12),

	renameMapping('1.5.4', 'casparcg_cg_dve_template', GraphicLLayer.GraphicLLayerLocators),

	...SetLayerNamesToDefaults('1.5.5', 'AFVD', MappingsDefaults),

	GetMappingDefaultMigrationStepForLayer('1.6.0', GraphicLLayer.GraphicLLayerPilot, true),

	/**
	 * 1.6.1
	 * - Split RM config into FEED and RM configs
	 * - Add concept of roles to DSK config table (and cleanup configs replaced by table)
	 */
	SetConfigTo('1.6.1', 'Offtube', 'SourcesRM', manifestOfftubeSourcesRM.defaultVal),
	SetConfigTo('1.6.1', 'Offtube', 'AtemSource.DSK', manifestOfftubeDownstreamKeyers.defaultVal),
	RemoveConfig('1.6.1', 'Offtube', 'AtemSource.JingleFill'),
	RemoveConfig('1.6.1', 'Offtube', 'AtemSource.JingleKey'),
	RemoveConfig('1.6.1', 'Offtube', 'AtemSource.CCGClip'),
	RemoveConfig('1.6.1', 'Offtube', 'AtemSource.CCGGain'),
	removeMapping('1.6.1', 'atem_dsk_graphics'),
	GetMappingDefaultMigrationStepForLayer('1.6.1', OfftubeCasparLLayer.CasparPlayerJingle, true),

	/**
	 * 1.6.2
	 * - Set headline layer to abstract (for potential Viz route set compatibility)
	 */
	GetMappingDefaultMigrationStepForLayer('1.6.2', GraphicLLayer.GraphicLLayerOverlayHeadline, true),

	/**
	 * 1.6.10
	 * - Force soundbed caspar layer to defaults (channel 3, layer 101)
	 */
	GetMappingDefaultMigrationStepForLayer('1.6.10', OfftubeCasparLLayer.CasparCGLYD, true),

	/**
	 * 1.7.3
	 * - Rename the CasparPlayerJingleLookahead layer
	 * - Disable previewWhenNotOnAir on CasparPlayerJingle layer
	 */
	renameMapping('1.7.3', 'casparcg_player_jingle_looakhead', OfftubeCasparLLayer.CasparPlayerJinglePreload),
	GetMappingDefaultMigrationStepForLayer('1.7.3', OfftubeCasparLLayer.CasparPlayerJinglePreload, true),
	GetMappingDefaultMigrationStepForLayer('1.7.3', OfftubeCasparLLayer.CasparPlayerJingle, true),

	// Fill in any mappings that did not exist before
	// Note: These should only be run as the very final step of all migrations. otherwise they will add items too early, and confuse old migrations
	...getMappingsDefaultsMigrationSteps(VERSION)
])
