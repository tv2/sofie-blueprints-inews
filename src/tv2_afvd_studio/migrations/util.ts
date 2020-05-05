import {
	BlueprintMapping,
	ConfigItemValue,
	MigrationContextStudio,
	MigrationStepInput,
	MigrationStepInputFilteredResult,
	MigrationStepStudio
} from 'tv-automation-sofie-blueprints-integration'
import { literal } from 'tv2-common'
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
		id: `studioConfig.${configName}`,
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
		id: `studioConfig.${oldConfigName}`,
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
		id: `studioMapping.${oldMappingName}`,
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
		id: `studioMapping.${oldMappingName}`,
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
	const res = _.compact(
		_.map(MappingsDefaults, (defaultVal: BlueprintMapping, id: string): MigrationStepStudio | null => {
			return literal<MigrationStepStudio>({
				id: `mappings.defaults.${id}`,
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
			})
		})
	)

	return res
}

export function GetSisyfosLayersForTableMigrationAFVD(configName: string, val: string): string[] {
	switch (configName) {
		case 'SourcesCam':
			return []
		case 'SourcesRM':
		case 'SourcesSkype':
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
