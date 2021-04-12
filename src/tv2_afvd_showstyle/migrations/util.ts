import {
	IOutputLayer,
	ISourceLayer,
	MigrationContextShowStyle,
	MigrationStepShowStyle
} from '@sofie-automation/blueprints-integration'
import { literal } from 'tv2-common'
import * as _ from 'underscore'
import { showStyleConfigManifest } from '../config-manifests'
import OutputlayerDefaults from './outputlayer-defaults'
import SourcelayerDefaults from './sourcelayer-defaults'

export function getSourceLayerDefaultsMigrationSteps(versionStr: string, force?: boolean): MigrationStepShowStyle[] {
	return _.compact(
		_.map(SourcelayerDefaults, (defaultVal: ISourceLayer): MigrationStepShowStyle | null => {
			return literal<MigrationStepShowStyle>({
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
			})
		})
	)
}

export function forceSourceLayerToDefaults(versionStr: string, layer: string): MigrationStepShowStyle {
	return literal<MigrationStepShowStyle>({
		id: `${versionStr}.sourcelayer.defaults.${layer}.forced`,
		version: versionStr,
		canBeRunAutomatically: true,
		validate: (context: MigrationContextShowStyle) => {
			const existing = context.getSourceLayer(layer)
			if (!existing) {
				return `SourceLayer "${layer}" doesn't exist on ShowBaseStyle`
			}

			const defaultVal = SourcelayerDefaults.find(l => l._id === layer)

			if (!defaultVal) {
				return false
			}

			return !_.isEqual(existing, defaultVal)
		},
		migrate: (context: MigrationContextShowStyle) => {
			if (context.getSourceLayer(layer)) {
				context.removeSourceLayer(layer)
			}

			const defaultVal = SourcelayerDefaults.find(l => l._id === layer)

			if (!defaultVal) {
				return
			}

			if (!context.getSourceLayer(layer)) {
				context.insertSourceLayer(layer, defaultVal)
			}
		}
	})
}

export function forceSettingToDefaults(versionStr: string, setting: string): MigrationStepShowStyle {
	return literal<MigrationStepShowStyle>({
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
	})
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
