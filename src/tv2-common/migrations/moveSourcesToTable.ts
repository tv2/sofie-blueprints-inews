import {
	MigrationContextStudio,
	MigrationStepStudio,
	TableConfigItemValue
} from '@sofie-automation/blueprints-integration'
import { parseMapStr, TableConfigItemSourceMapping, TableConfigItemSourceMappingWithSisyfos } from 'tv2-common'
import * as _ from 'underscore'
import { TableConfigItemDSK } from '../types'
import { literal } from '../util'

export function MoveSourcesToTable(
	versionStr: string,
	configName: string,
	withSisyfos: boolean,
	getSisyfosLayersForMigration: (configName: string, val: string) => string[],
	studioMics?: boolean
): MigrationStepStudio {
	const res = literal<MigrationStepStudio>({
		id: `studioConfig.moveToTable.${configName}`,
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
								AtemSource: source.val,
								SisyfosLayers: getSisyfosLayersForMigration(configName, source.id.toString().toUpperCase()),
								StudioMics: !!studioMics
							})
						)
					} else {
						table.push(
							literal<TableConfigItemSourceMapping & TableConfigItemValue[0]>({
								_id: i.toString(),
								SourceName: source.id,
								AtemSource: source.val
							})
						)
					}
				})
				context.setConfig(configName, table)
			}
		}
	})

	return res
}

export function MoveClipSourcePath(versionStr: string, studio: string): MigrationStepStudio {
	const res = literal<MigrationStepStudio>({
		id: `studioConfig.moveClipSourcePath.${studio}`,
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
	})

	return res
}

export function MoveDSKToTable(versionStr: string, defaultVal: TableConfigItemDSK): MigrationStepStudio {
	const configName = 'AtemSource.DSK'
	const res = literal<MigrationStepStudio>({
		id: `studioConfig.moveDSKToTable`,
		version: versionStr,
		canBeRunAutomatically: true,
		validate: (context: MigrationContextStudio) => {
			const configVal = context.getConfig(configName)
			if (configVal === undefined) {
				return `${configName} doesn't exist`
			}
			return false
		},
		migrate: (context: MigrationContextStudio) => {
			const oldDSK1Fill = context.getConfig('AtemSource.DSK1F') as number | undefined
			const oldDSK1Key = context.getConfig('AtemSource.DSK1K') as number | undefined
			const configVal = context.getConfig(configName)
			const table: TableConfigItemValue = []
			if (configVal === undefined) {
				table.push(
					literal<TableConfigItemDSK & TableConfigItemValue[0]>({
						_id: '0',
						Number: 1,
						Fill: oldDSK1Fill === undefined ? defaultVal.Fill : oldDSK1Fill,
						Key: oldDSK1Key === undefined ? defaultVal.Key : oldDSK1Key,
						Toggle: defaultVal.Toggle,
						DefaultOn: defaultVal.DefaultOn
					})
				)
				context.setConfig(configName, table)
				context.removeConfig('AtemSource.DSK1F')
				context.removeConfig('AtemSource.DSK1K')
			}
		}
	})

	return res
}
