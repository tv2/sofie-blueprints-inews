import {
	MigrationContextStudio,
	MigrationStepStudio,
	TableConfigItemValue
} from 'tv-automation-sofie-blueprints-integration'
import { AddKeepAudio, literal, MoveClipSourcePath, MoveSourcesToTable } from 'tv2-common'
import * as _ from 'underscore'
import {
	manifestOfftubeSourcesABMediaPlayers,
	manifestOfftubeSourcesCam,
	manifestOfftubeSourcesRM,
	manifestOfftubeStudioMics
} from '../config-manifests'
import { OfftubeSisyfosLLayer } from '../layers'
import { deviceMigrations } from './devices'
import { ensureStudioConfig, getMappingsDefaultsMigrationSteps, GetSisyfosLayersForTableMigrationOfftube } from './util'

declare const VERSION: string // Injected by webpack

function renameAudioSources(versionStr: string, renaming: Map<string, string>): MigrationStepStudio[] {
	const steps: MigrationStepStudio[] = []
	for (const layer in renaming) {
		if (layer in renaming) {
			const res = literal<MigrationStepStudio>({
				id: `studioConfig.renameAudioSources.${layer}`,
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
		id: `studioConfig.ensureMappingDeleted.${mapping}`,
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
			id: `remapTableColumnValue.${tableId}.${columnId}`,
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
	// Fill in any mappings that did not exist before
	// Note: These should only be run as the very final step of all migrations. otherwise they will add items too early, and confuse old migrations
	...getMappingsDefaultsMigrationSteps(VERSION),
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
	MoveClipSourcePath('0.2.0', 'Offtube_Q2')
])
