import {
	IBlueprintRuntimeArgumentsItem,
	IOutputLayer,
	ISourceLayer,
	MigrationContextShowStyle,
	MigrationStepShowStyle,
	TableConfigItemValue
} from 'tv-automation-sofie-blueprints-integration'
import { literal } from 'tv2-common'
import * as _ from 'underscore'
import OutputlayerDefaults from './outputlayer-defaults'
import RuntimeArgumentsDefaults from './runtime-arguments-defaults'
import SourcelayerDefaults from './sourcelayer-defaults'

export function getSourceLayerDefaultsMigrationSteps(versionStr: string): MigrationStepShowStyle[] {
	return _.compact(
		_.map(SourcelayerDefaults, (defaultVal: ISourceLayer): MigrationStepShowStyle | null => {
			return literal<MigrationStepShowStyle>({
				id: `sourcelayer.defaults.${defaultVal._id}`,
				version: versionStr,
				canBeRunAutomatically: true,
				validate: (context: MigrationContextShowStyle) => {
					if (!context.getSourceLayer(defaultVal._id)) {
						return `SourceLayer "${defaultVal._id}" doesn't exist on ShowBaseStyle`
					}
					return false
				},
				migrate: (context: MigrationContextShowStyle) => {
					if (!context.getSourceLayer(defaultVal._id)) {
						context.insertSourceLayer(defaultVal._id, defaultVal)
					}
				}
			})
		})
	)
}

export function getOutputLayerDefaultsMigrationSteps(versionStr: string): MigrationStepShowStyle[] {
	return _.compact(
		_.map(OutputlayerDefaults, (defaultVal: IOutputLayer): MigrationStepShowStyle | null => {
			return literal<MigrationStepShowStyle>({
				id: `outputlayer.defaults.${defaultVal._id}`,
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

export function getRuntimeArgumentsDefaultsMigrationSteps(versionStr: string): MigrationStepShowStyle[] {
	return _.compact(
		_.map(RuntimeArgumentsDefaults, (defaultVal: IBlueprintRuntimeArgumentsItem): MigrationStepShowStyle | null => {
			return literal<MigrationStepShowStyle>({
				id: `runtimeArguments.defaults.${defaultVal._id}`,
				version: versionStr,
				canBeRunAutomatically: true,
				validate: (context: MigrationContextShowStyle) => {
					if (!context.getRuntimeArgument(defaultVal._id)) {
						return `RuntimeArgument "${defaultVal._id}" doesn't exist on ShowBaseStyle`
					}
					return false
				},
				migrate: (context: MigrationContextShowStyle) => {
					if (!context.getRuntimeArgument(defaultVal._id)) {
						context.insertRuntimeArgument(defaultVal._id, defaultVal)
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

export function remapTableColumnValues(
	versionStr: string,
	tableId: string,
	columnId: string,
	/** Map values [from, to] */
	remapping: Map<string, string>
): MigrationStepShowStyle[] {
	return [
		literal<MigrationStepShowStyle>({
			id: `remapTableColumnValue.${tableId}`,
			version: versionStr,
			canBeRunAutomatically: true,
			validate: (context: MigrationContextShowStyle) => {
				const table = context.getBaseConfig(tableId) as TableConfigItemValue | undefined

				if (!table) {
					console.log(`Table does not exist`)
					return `Table "${tableId}" does not exist`
				}

				if (!table.length) {
					console.log(`Tasble does not have values`)
					// No values, nothing to remap
					return false
				}

				const first = table[0]

				if (!Object.keys(first).includes(columnId)) {
					console.log(`Column does not exits`)
					return `Column "${columnId}" does not exist in table "${tableId}"`
				}

				const ret = remapTableColumnValuesInner(table, columnId, remapping)

				if (typeof ret === 'string' || typeof ret === 'boolean') {
					console.log(ret)
					return ret
				}

				console.log(ret.changed)

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
