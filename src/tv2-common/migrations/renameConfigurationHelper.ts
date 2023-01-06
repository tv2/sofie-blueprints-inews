import { BasicConfigItemValue, IBlueprintShowStyleVariant } from '@sofie-automation/blueprints-integration'
import {
	MigrationContextShowStyle,
	MigrationStepShowStyle,
	TableConfigItemValue
} from '../../types/blueprints-integration'

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
			context.removeBaseConfig(oldTableId)
		}
	}
}

/**
 * "Renames" the name of a Blueprint configuration by overriding the value of the old configuration onto the new configuration - then removes the old configuration
 */
export function renameBlueprintConfiguration(
	version: string,
	oldConfigurationName: string,
	newConfigurationName: string
): MigrationStepShowStyle {
	return {
		id: `${version}.rename.blueprint.configuration.${oldConfigurationName}.to.${newConfigurationName}`,
		version,
		canBeRunAutomatically: true,
		validate: (context: MigrationContextShowStyle) => {
			const oldConfig = (context.getBaseConfig(oldConfigurationName) as unknown) as BasicConfigItemValue
			return oldConfig !== undefined
		},
		migrate: (context: MigrationContextShowStyle) => {
			const oldConfig = (context.getBaseConfig(oldConfigurationName) as unknown) as BasicConfigItemValue

			context.setBaseConfig(newConfigurationName, oldConfig)
			context.removeBaseConfig(oldConfigurationName)
		}
	}
}

/**
 *  For all variants: "Renames" the blueprint configuration by overriding the value of the old configuration onto the new configuration - then removes the old configuration
 */
export function renameBlueprintsConfigurationForAllVariants(
	version: string,
	oldConfigName: string,
	newConfigName: string
): MigrationStepShowStyle {
	return {
		id: `${version}.rename.blueprint.configuration.${oldConfigName}.to.${newConfigName}.for.all.variants`,
		version,
		canBeRunAutomatically: true,
		validate: (context: MigrationContextShowStyle) => {
			const allVariants: IBlueprintShowStyleVariant[] = context.getAllVariants()

			if (allVariants.length === 0) {
				return false
			}

			return allVariants.some((variant: IBlueprintShowStyleVariant) => {
				const oldConfig = context.getVariantConfig(variant._id, oldConfigName)
				return oldConfig !== undefined
			})
		},
		migrate: (context: MigrationContextShowStyle) => {
			const allVariants: IBlueprintShowStyleVariant[] = context.getAllVariants()
			allVariants.forEach((variant: IBlueprintShowStyleVariant) => {
				const oldConfig = context.getVariantConfig(variant._id, oldConfigName)
				if (oldConfig === undefined) {
					return
				}

				context.setVariantConfig(variant._id, newConfigName, oldConfig)
				context.removeVariantConfig(variant._id, oldConfigName)
			})
		}
	}
}
