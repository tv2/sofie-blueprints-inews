import { MigrationContextStudio, MigrationStepStudio } from '@sofie-automation/blueprints-integration'
import { literal } from '../util'

export * from './moveSourcesToTable'
export * from './addKeepAudio'
export * from './shortcuts'
export * from './transitions'
export * from './graphic-defaults'
export * from './manifestWithMediaFlow'

export function RenameStudioConfig(versionStr: string, studio: string, from: string, to: string): MigrationStepStudio {
	return literal<MigrationStepStudio>({
		id: `studioConfig.rename.${from}.${studio}`,
		version: versionStr,
		canBeRunAutomatically: true,
		validate: (context: MigrationContextStudio) => {
			const configVal = context.getConfig(from)
			if (configVal !== undefined) {
				return `${from} needs updating`
			}
			return false
		},
		migrate: (context: MigrationContextStudio) => {
			const configVal = context.getConfig(from)
			if (configVal !== undefined) {
				context.setConfig(to, configVal)
				context.removeConfig(from)
			}
		}
	})
}
