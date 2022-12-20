import { BasicConfigItemValue, IBlueprintShowStyleVariant } from '@sofie-automation/blueprints-integration'
import { IOutputLayer, ISourceLayer, MigrationContextShowStyle, MigrationStepShowStyle } from 'blueprints-integration'
import { forceSourceLayerToDefaultsBase, literal } from 'tv2-common'
import * as _ from 'underscore'
import { TableConfigItemValue } from '../../types/blueprints-integration'
import { showStyleConfigManifest } from '../config-manifests'
import OutputlayerDefaults from './outputlayer-defaults'
import SourcelayerDefaults from './sourcelayer-defaults'

export function getSourceLayerDefaultsMigrationSteps(versionStr: string, force?: boolean): MigrationStepShowStyle[] {
	return _.compact(
		_.map(SourcelayerDefaults, (defaultVal: ISourceLayer): MigrationStepShowStyle | null => {
			return {
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
			}
		})
	)
}

export function forceSourceLayerToDefaults(
	versionStr: string,
	layer: string,
	overrideSteps?: string[]
): MigrationStepShowStyle {
	return forceSourceLayerToDefaultsBase(SourcelayerDefaults, versionStr, 'AFVD', layer, overrideSteps)
}

export function forceSettingToDefaults(versionStr: string, setting: string): MigrationStepShowStyle {
	return {
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
	}
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

/**
 * "Renames" the id of a table by copying over all values over into a new table which has the new id - then removes the values from the old table
 */
export function renameTableId(version: string, oldTableId: string, newTableId: string): MigrationStepShowStyle {
	return {
		id: `${version}.rename.table.id.${oldTableId}.to.${newTableId}`,
		version,
		canBeRunAutomatically: true,
		validate: (context: MigrationContextShowStyle) => {
			const oldConfigTable = (context.getBaseConfig(oldTableId) as unknown) as TableConfigItemValue
			if (!oldConfigTable || oldConfigTable.length === 0) {
				return false
			}

			const newConfigTable = (context.getBaseConfig(newTableId) as unknown) as TableConfigItemValue
			return !newConfigTable
		},
		migrate: (context: MigrationContextShowStyle) => {
			const oldConfigTable = (context.getBaseConfig(oldTableId) as unknown) as TableConfigItemValue
			const newConfigTable = ((context.getBaseConfig(newTableId) as unknown) as TableConfigItemValue) ?? []
			oldConfigTable.map(value => newConfigTable.push(value))

			context.setBaseConfig(newTableId, newConfigTable)
			context.setBaseConfig(oldTableId, [])
		}
	}
}

/**
 * "Renames" the id of a column by overriding the value of the old column onto the new column - then removes the value from the old column
 */
export function renameColumnId(version: string, oldColumnId: string, newColumnId: string): MigrationStepShowStyle {
	return {
		id: `${version}.rename.column.id.${oldColumnId}.to.${newColumnId}`,
		version,
		canBeRunAutomatically: true,
		validate: (context: MigrationContextShowStyle) => {
			const oldConfigTable = (context.getBaseConfig(oldColumnId) as unknown) as BasicConfigItemValue
			if (!oldConfigTable || Object.keys(oldConfigTable).length === 0) {
				return false
			}

			const newConfigTable = (context.getBaseConfig(newColumnId) as unknown) as BasicConfigItemValue
			return !newConfigTable
		},
		migrate: (context: MigrationContextShowStyle) => {
			const oldConfigColumn = (context.getBaseConfig(oldColumnId) as unknown) as BasicConfigItemValue

			context.setBaseConfig(newColumnId, oldConfigColumn)
			context.setBaseConfig(oldColumnId, [])
		}
	}
}

/**
 *  For all variants: "Renames" the id of a column by overriding the value of the old column onto the new column - then removes the value from the old column
 */
export function renameColumnIdForAllVariants(
	version: string,
	oldColumnId: string,
	newColumnId: string
): MigrationStepShowStyle {
	return {
		id: `${version}.rename.column.id.${oldColumnId}.to.${newColumnId}.for.all.variants`,
		version,
		canBeRunAutomatically: true,
		validate: (context: MigrationContextShowStyle) => {
			const allVariants: IBlueprintShowStyleVariant[] = context.getAllVariants()

			if (allVariants.length === 0) {
				return false
			}

			const noVariantsHaveValueInOldColumn: boolean = allVariants.every((variant: IBlueprintShowStyleVariant) => {
				const oldColumn = context.getVariantConfig(variant._id, oldColumnId)
				return !oldColumn || Object.keys(oldColumn).length === 0
			})

			return !noVariantsHaveValueInOldColumn
		},
		migrate: (context: MigrationContextShowStyle) => {
			const allVariants: IBlueprintShowStyleVariant[] = context.getAllVariants()
			allVariants.forEach((variant: IBlueprintShowStyleVariant) => {
				const oldColumn = context.getVariantConfig(variant._id, oldColumnId)
				if (!oldColumn || Object.keys(oldColumn).length === 0) {
					return
				}

				context.setVariantConfig(variant._id, newColumnId, oldColumn)
				context.setVariantConfig(variant._id, oldColumnId, {})
			})
		}
	}
}
