import { IOutputLayer, ISourceLayer, MigrationContextShowStyle, MigrationStepShowStyle } from 'blueprints-integration'
import { forceSourceLayerToDefaultsBase, literal } from 'tv2-common'
import * as _ from 'underscore'
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
