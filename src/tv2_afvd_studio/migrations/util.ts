import {
	BlueprintMapping,
	ConfigItemValue,
	MigrationContextStudio,
	MigrationStepInput,
	MigrationStepInputFilteredResult,
	MigrationStepStudio,
	TSR
} from 'blueprints-integration'
import * as _ from 'underscore'
import { SisyfosLLAyer } from '../layers'
import MappingsDefaults from './mappings-defaults'

export function ensureStudioConfig(
	version: string,
	configName: string,
	value: any | null, // null if manual
	inputType: 'text' | 'multiline' | 'int' | 'checkbox' | 'dropdown' | 'switch' | undefined, // EditAttribute types
	label: string,
	description: string,
	defaultValue?: any,
	oldConfigName?: string,
	dropdownOptions?: string[]
): MigrationStepStudio {
	return {
		id: `${version}.studioConfig.${configName}`,
		version,
		canBeRunAutomatically: _.isNull(value) ? false : true,
		validate: (context: MigrationContextStudio) => {
			const configVal = context.getConfig(configName)
			const oldConfigVal = oldConfigName && context.getConfig(oldConfigName)
			if (configVal === undefined && oldConfigVal === undefined) {
				return `${configName} is missing`
			}

			return false
		},
		input: (context: MigrationContextStudio) => {
			const inputs: MigrationStepInput[] = []
			const configVal = context.getConfig(configName)

			if (inputType && configVal === undefined) {
				inputs.push({
					label,
					description,
					inputType,
					attribute: 'value',
					defaultValue,
					dropdownOptions
				})
			}
			return inputs
		},
		migrate: (context: MigrationContextStudio, input: MigrationStepInputFilteredResult) => {
			context.setConfig(configName, _.isNull(value) ? input.value : value)
		}
	}
}

export function renameStudioConfig(
	version: string,
	oldConfigName: string,
	newConfigName: string,
	updateValue?: (val: any) => ConfigItemValue
): MigrationStepStudio {
	return {
		id: `${version}.studioConfig.${oldConfigName}`,
		version,
		canBeRunAutomatically: true,
		validate: (context: MigrationContextStudio) => {
			const configVal = context.getConfig(oldConfigName)
			if (configVal !== undefined) {
				return `${oldConfigName} is defined`
			}

			return false
		},
		migrate: (context: MigrationContextStudio) => {
			const configVal = context.getConfig(oldConfigName)
			if (configVal !== undefined) {
				context.setConfig(newConfigName, updateValue ? updateValue(configVal) : configVal)
				context.removeConfig(oldConfigName)
			}
		}
	}
}

export function renameMapping(version: string, oldMappingName: string, newMappingName: string): MigrationStepStudio {
	return {
		id: `${version}.studioMapping.${oldMappingName}`,
		version,
		canBeRunAutomatically: true,
		validate: (context: MigrationContextStudio) => {
			const mapping = context.getMapping(oldMappingName)
			if (mapping !== undefined) {
				return `${oldMappingName} is defined`
			}

			return false
		},
		migrate: (context: MigrationContextStudio) => {
			const mapping = context.getMapping(oldMappingName)
			if (mapping) {
				context.insertMapping(newMappingName, mapping)
				context.removeMapping(oldMappingName)
			}
		}
	}
}

export function removeMapping(version: string, oldMappingName: string): MigrationStepStudio {
	return {
		id: `${version}.studioMapping.${oldMappingName}`,
		version,
		canBeRunAutomatically: true,
		validate: (context: MigrationContextStudio) => {
			const mapping = context.getMapping(oldMappingName)
			if (mapping) {
				return `${oldMappingName} is defined`
			}

			return false
		},
		migrate: (context: MigrationContextStudio) => {
			const mapping = context.getMapping(oldMappingName)
			if (mapping) {
				context.removeMapping(oldMappingName)
			}
		}
	}
}

export function getMappingsDefaultsMigrationSteps(versionStr: string): MigrationStepStudio[] {
	return _.compact(
		_.map(MappingsDefaults, (defaultVal: BlueprintMapping, id: string): MigrationStepStudio | null => {
			return {
				id: `${versionStr}.mappings.defaults.${id}`,
				version: versionStr,
				canBeRunAutomatically: true,
				validate: (context: MigrationContextStudio) => {
					// Optional mappings based on studio settings can be dropped here

					if (!context.getMapping(id)) {
						return `Mapping "${id}" doesn't exist on ShowBaseStyle`
					}
					return false
				},
				migrate: (context: MigrationContextStudio) => {
					if (!context.getMapping(id)) {
						context.insertMapping(id, defaultVal)
					}
				}
			}
		})
	)
}

export function GetMappingDefaultMigrationStepForLayer(
	versionStr: string,
	layer: string,
	force?: boolean
): MigrationStepStudio {
	return {
		id: `${versionStr}.mappings.defaults.manualEnsure${layer}`,
		version: versionStr,
		canBeRunAutomatically: true,
		validate: (context: MigrationContextStudio) => {
			// Optional mappings based on studio settings can be dropped here

			const existing = context.getMapping(layer)
			if (!existing) {
				return `Mapping "${layer}" doesn't exist in style`
			}

			if (force) {
				return !_.isEqual(existing, MappingsDefaults[layer])
			}

			return false
		},
		migrate: (context: MigrationContextStudio) => {
			if (context.getMapping(layer) && force) {
				context.removeMapping(layer)
			}

			if (!context.getMapping(layer)) {
				context.insertMapping(layer, MappingsDefaults[layer])
			}
		}
	}
}

/**
 * Required due to the change in how sisyfos mappings are stored.
 * 	Prior versions did not have the `mappingType` property as there was only one type of mapping.
 * 	This migration makes sure that the `mappingType` property is set to thr required type (usually CHANNEL).
 * 	[INFO]: Added for `v1.3.0` - should not be needed after this version unless mapping types change again.
 * @param versionStr Migration Version
 * @param layer Layer to migrate.
 * @param mappingType Mapping type to add.
 */
export function EnsureSisyfosMappingHasType(
	versionStr: string,
	layer: string,
	mappingType: TSR.MappingSisyfosType.CHANNEL
): MigrationStepStudio {
	return {
		id: `${versionStr}.mutatesisyfosmappings.${layer}`,
		version: versionStr,
		canBeRunAutomatically: true,
		validate: (context: MigrationContextStudio) => {
			const mapping = context.getMapping(layer) as TSR.MappingSisyfos | undefined

			// If the mapping does not exist this is valid, it will be created by defaults with the correct value.
			if (!mapping) {
				return false
			}

			if (mapping.mappingType === mappingType) {
				return false
			}

			return true
		},
		migrate: (context: MigrationContextStudio) => {
			const mapping = context.getMapping(layer) as TSR.MappingSisyfos | undefined

			// Shouldn't happen but check anyway
			if (!mapping) {
				return
			}

			mapping.mappingType = mappingType

			context.updateMapping(layer, mapping)
		}
	}
}

export function GetSisyfosLayersForTableMigrationAFVD(configName: string, val: string): string[] {
	switch (configName) {
		case 'SourcesCam':
			return []
		case 'SourcesRM':
			switch (val) {
				case '1':
					return [SisyfosLLAyer.SisyfosSourceLive_1]
				case '2':
					return [SisyfosLLAyer.SisyfosSourceLive_2]
				case '3':
					return [SisyfosLLAyer.SisyfosSourceLive_3]
				case '4':
					return [SisyfosLLAyer.SisyfosSourceLive_4]
				case '5':
					return [SisyfosLLAyer.SisyfosSourceLive_5]
				case '6':
					return [SisyfosLLAyer.SisyfosSourceLive_6]
				case '7':
					return [SisyfosLLAyer.SisyfosSourceLive_7]
				case '8':
					return [SisyfosLLAyer.SisyfosSourceLive_8]
				case '9':
					return [SisyfosLLAyer.SisyfosSourceLive_9]
				case '10':
					return [SisyfosLLAyer.SisyfosSourceLive_10]
			}
			break
		case 'SourcesDelayedPlayback':
		case '1':
			return [SisyfosLLAyer.SisyfosSourceEVS_1]
		case '2':
			return [SisyfosLLAyer.SisyfosSourceEVS_2]
	}

	return []
}
