import { MigrationContextStudio, MigrationStepStudio, TableConfigItemValue } from 'blueprints-integration'
import { parseMapStr, TableConfigItemSourceMapping, TableConfigItemSourceMappingWithSisyfos } from 'tv2-common'
import * as _ from 'underscore'
import { literal } from '../util'

export function MoveSourcesToTable(
	versionStr: string,
	configName: string,
	withSisyfos: boolean,
	getSisyfosLayersForMigration: (configName: string, val: string) => string[],
	studioMics?: boolean
): MigrationStepStudio {
	return {
		id: `${versionStr}.studioConfig.moveToTable.${configName}`,
		version: versionStr,
		canBeRunAutomatically: true,
		validate: (context: MigrationContextStudio) => {
			const configVal = context.getConfig(configName)
			if (configVal === undefined || typeof configVal === 'string') {
				return `${configName} has old format or doesn't exist`
			}
			return false
		},
		migrate: (context: MigrationContextStudio) => {
			const configVal = context.getConfig(configName)
			const table: TableConfigItemValue = []
			if (configVal === undefined) {
				context.setConfig(configName, table)
			} else if (typeof configVal === 'string') {
				const oldConfig = parseMapStr(undefined, configVal, true)
				_.each(oldConfig, (source, i) => {
					if (withSisyfos) {
						table.push(
							literal<TableConfigItemSourceMappingWithSisyfos & TableConfigItemValue[0]>({
								_id: i.toString(),
								SourceName: source.id,
								SwitcherSource: source.val,
								SisyfosLayers: getSisyfosLayersForMigration(configName, source.id.toString().toUpperCase()),
								StudioMics: !!studioMics
							})
						)
					} else {
						table.push(
							literal<TableConfigItemSourceMapping & TableConfigItemValue[0]>({
								_id: i.toString(),
								SourceName: source.id,
								SwitcherSource: source.val
							})
						)
					}
				})
				context.setConfig(configName, table)
			}
		}
	}
}

export function MoveClipSourcePath(versionStr: string, studio: string): MigrationStepStudio {
	return {
		id: `${versionStr}.studioConfig.moveClipSourcePath.${studio}`,
		version: versionStr,
		canBeRunAutomatically: true,
		validate: (context: MigrationContextStudio) => {
			const configVal = context.getConfig('ClipSourcePath')
			if (configVal !== undefined) {
				return `ClipSourcePath needs updating`
			}
			return false
		},
		migrate: (context: MigrationContextStudio) => {
			const configVal = context.getConfig('ClipSourcePath')
			if (configVal !== undefined) {
				context.setConfig('NetworkBasePath', configVal.toString())
				context.removeConfig('ClipSourcePath')
			}
		}
	}
}
