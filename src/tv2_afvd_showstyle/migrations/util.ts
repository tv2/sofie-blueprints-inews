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
			if (!oldConfig || Object.keys(oldConfig).length === 0) {
				return false
			}

			const newConfig = (context.getBaseConfig(newConfigurationName) as unknown) as BasicConfigItemValue
			return !newConfig
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

			const noVariantsHaveOldConfig: boolean = allVariants.every((variant: IBlueprintShowStyleVariant) => {
				const oldConfig = context.getVariantConfig(variant._id, oldConfigName)
				return !oldConfig || Object.keys(oldConfig).length === 0
			})

			return !noVariantsHaveOldConfig
		},
		migrate: (context: MigrationContextShowStyle) => {
			const allVariants: IBlueprintShowStyleVariant[] = context.getAllVariants()
			allVariants.forEach((variant: IBlueprintShowStyleVariant) => {
				const oldConfig = context.getVariantConfig(variant._id, oldConfigName)
				if (!oldConfig || Object.keys(oldConfig).length === 0) {
					return
				}

				context.setVariantConfig(variant._id, newConfigName, oldConfig)
				context.removeVariantConfig(variant._id, oldConfigName)
			})
		}
	}
}
