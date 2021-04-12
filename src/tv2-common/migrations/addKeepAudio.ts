import {
	MigrationContextStudio,
	MigrationStepStudio,
	TableConfigItemValue
} from '@sofie-automation/blueprints-integration'
import * as _ from 'underscore'
import { literal } from '../util'

export function AddKeepAudio(versionStr: string, configName: string): MigrationStepStudio {
	const res = literal<MigrationStepStudio>({
		id: `${versionStr}.studioConfig.addKeepAudio.${configName}`,
		version: versionStr,
		canBeRunAutomatically: true,
		validate: (context: MigrationContextStudio) => {
			const configVal = context.getConfig(configName)
			if (
				configVal === undefined ||
				(Array.isArray(configVal) &&
					configVal.length &&
					typeof configVal[0] === 'object' &&
					configVal[0].KeepAudioInStudio === undefined)
			) {
				return `${configName} is missing KeepAudioInStudio or doesn't exist`
			}
			return false
		},
		migrate: (context: MigrationContextStudio) => {
			const configVal = context.getConfig(configName)
			if (Array.isArray(configVal) && configVal.length) {
				_.each(configVal as TableConfigItemValue, source => {
					source.KeepAudioInStudio = source.KeepAudioInStudio !== undefined ? source.KeepAudioInStudio : true
				})
				context.setConfig(configName, configVal)
			}
		}
	})

	return res
}
