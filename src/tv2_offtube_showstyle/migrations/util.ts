import {
	IOutputLayer,
	ISourceLayer,
	MigrationContextShowStyle,
	MigrationStepShowStyle,
	TableConfigItemValue
} from '@sofie-automation/blueprints-integration'
import { forceSourceLayerToDefaultsBase, literal } from 'tv2-common'
import * as _ from 'underscore'
import { showStyleConfigManifest } from '../config-manifests'
import OutputlayerDefaults from './outputlayer-defaults'
import SourcelayerDefaults from './sourcelayer-defaults'

export function getSourceLayerDefaultsMigrationSteps(versionStr: string, force?: boolean): MigrationStepShowStyle[] {
	return _.compact(
		_.map(SourcelayerDefaults, (defaultVal: ISourceLayer): MigrationStepShowStyle | null => {
			return literal<MigrationStepShowStyle>({
				id: `${versionStr}.sourcelayer.defaults${force ? '.forced' : ''}.${defaultVal._id}`,
				version: versionStr,
				canBeRunAutomatically: true,
				validate: (context: MigrationContextShowStyle) => {
					const existing = context.getSourceLayer(defaultVal._id)
					if (!existing) {
						return `SourceLayer "${defaultVal._id}" doesn't exist on ShowBaseStyle`
					}

					if (force) {
						return !_.isEqual(existing, defaultVal)
					}

					return false
				},
				migrate: (context: MigrationContextShowStyle) => {
					if (context.getSourceLayer(defaultVal._id) && force) {
						context.removeSourceLayer(defaultVal._id)
					}

					if (!context.getSourceLayer(defaultVal._id)) {
						context.insertSourceLayer(defaultVal._id, defaultVal)
					}
				}
			})
		})
	)
}

export function forceSettingToDefaults(versionStr: string, setting: string): MigrationStepShowStyle {
	return literal<MigrationStepShowStyle>({
		id: `${versionStr}.sourcelayer.defaults.${setting}.forced`,
		version: versionStr,
		canBeRunAutomatically: true,
		validate: (context: MigrationContextShowStyle) => {
			const existing = context.getBaseConfig(setting)
			if (!existing) {
				return `Setting "${setting}" doesn't exist on ShowBaseStyle`
			}

			const defaultVal = showStyleConfigManifest.find(l => l.id === setting)

			if (!defaultVal) {
				return false
			}

			return !_.isEqual(existing, defaultVal.defaultVal)
		},
		migrate: (context: MigrationContextShowStyle) => {
			if (context.getBaseConfig(setting)) {
				context.removeBaseConfig(setting)
			}

			const defaultVal = showStyleConfigManifest.find(l => l.id === setting)

			if (!defaultVal) {
				return
			}

			if (!context.getBaseConfig(setting)) {
				context.setBaseConfig(setting, defaultVal.defaultVal)
			}
		}
	})
}

export function getOutputLayerDefaultsMigrationSteps(versionStr: string): MigrationStepShowStyle[] {
	return _.compact(
		_.map(OutputlayerDefaults, (defaultVal: IOutputLayer): MigrationStepShowStyle | null => {
			return literal<MigrationStepShowStyle>({
				id: `${versionStr}.outputlayer.defaults.${defaultVal._id}`,
				version: versionStr,
				canBeRunAutomatically: true,
				validate: (context: MigrationContextShowStyle) => {
					if (!context.getOutputLayer(defaultVal._id)) {
						return `OutputLayer "${defaultVal._id}" doesn't exist on ShowBaseStyle`
					}
					return false
				},
				migrate: (context: MigrationContextShowStyle) => {
					if (!context.getOutputLayer(defaultVal._id)) {
						context.insertOutputLayer(defaultVal._id, defaultVal)
					}
				}
			})
		})
	)
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
			const remap = remapping.get(val.toString())

			if (remap) {
				row[columnId] = remap
				changed++
			}
		}

		return row
	})

	return { changed, table }
}

export function forceSourceLayerToDefaults(
	versionStr: string,
	layer: string,
	overrideSteps?: string[]
): MigrationStepShowStyle {
	return forceSourceLayerToDefaultsBase(SourcelayerDefaults, versionStr, layer, overrideSteps)
}

export function remapTableColumnValues(
	versionStr: string,
	tableId: string,
	columnId: string,
	/** Map values [from, to] */
	remapping: Map<string, string>
): MigrationStepShowStyle[] {
	return [
		literal<MigrationStepShowStyle>({
			id: `${versionStr}.remapTableColumnValue.${tableId}.${columnId}`,
			version: versionStr,
			canBeRunAutomatically: true,
			validate: (context: MigrationContextShowStyle) => {
				const table = context.getBaseConfig(tableId) as TableConfigItemValue | undefined

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
			migrate: (context: MigrationContextShowStyle) => {
				const table = context.getBaseConfig(tableId) as TableConfigItemValue

				const ret = remapTableColumnValuesInner(table, columnId, remapping)

				context.setBaseConfig(tableId, ret.table)
			}
		})
	]
}
