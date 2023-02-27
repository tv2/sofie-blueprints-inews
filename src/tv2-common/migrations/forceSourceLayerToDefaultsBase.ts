import { ISourceLayer, MigrationContextShowStyle, MigrationStepShowStyle } from 'blueprints-integration'
import _ = require('underscore')

export function forceSourceLayerToDefaultsBase(
	sourcelayerDefaults: ISourceLayer[],
	versionStr: string,
	showStyleId: string,
	layer: string,
	overrideSteps?: string[]
): MigrationStepShowStyle {
	return {
		id: `${versionStr}.${showStyleId}.sourcelayer.defaults.${layer}.forced`,
		version: versionStr,
		canBeRunAutomatically: true,
		overrideSteps,
		validate: (context: MigrationContextShowStyle) => {
			const existing = context.getSourceLayer(layer)
			if (!existing) {
				return `SourceLayer "${layer}" doesn't exist on ShowBaseStyle`
			}

			const defaultVal = sourcelayerDefaults.find((l) => l._id === layer)

			if (!defaultVal) {
				return false
			}

			return !_.isEqual(existing, defaultVal)
		},
		migrate: (context: MigrationContextShowStyle) => {
			if (context.getSourceLayer(layer)) {
				context.removeSourceLayer(layer)
			}

			const defaultVal = sourcelayerDefaults.find((l) => l._id === layer)

			if (!defaultVal) {
				return
			}

			if (!context.getSourceLayer(layer)) {
				context.insertSourceLayer(layer, defaultVal)
			}
		}
	}
}
