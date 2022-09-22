import {
	BlueprintMapping,
	ConfigItemValue,
	MigrationContextStudio,
	MigrationStepInput,
	MigrationStepInputFilteredResult,
	MigrationStepStudio
} from 'blueprints-integration'
import * as _ from 'underscore'
import { OfftubeSisyfosLLayer } from '../layers'
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
		id: `${version}.${oldConfigName}`,
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

export function GetSisyfosLayersForTableMigrationOfftube(configName: string, val: string): string[] {
	switch (configName) {
		case 'SourcesCam':
			return []
		case 'SourcesRM':
			switch (val) {
				case '1':
					return [OfftubeSisyfosLLayer.SisyfosSourceLive_1_Stereo]
				case '2':
					return [OfftubeSisyfosLLayer.SisyfosSourceLive_1_Surround]
				case 'WF':
				case '3':
					return [OfftubeSisyfosLLayer.SisyfosSourceLive_2_Stereo, OfftubeSisyfosLLayer.SisyfosSourceLive_3]
			}
			break
	}

	return []
}
