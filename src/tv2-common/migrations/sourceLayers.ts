import { ISourceLayer, MigrationContextShowStyle, MigrationStepShowStyle } from 'blueprints-integration'
import { WithValuesOfTypes } from 'tv2-common'
import _ = require('underscore')

export type WithPrimitiveValues<T> = WithValuesOfTypes<T, string | boolean | number | null>

export function SetSourceLayerProperties(
	versionStr: string,
	sourceLayerId: string,
	newValues: Omit<Partial<WithPrimitiveValues<ISourceLayer>>, '_id'>
): MigrationStepShowStyle {
	return {
		id: `${versionStr}.setSourceLayerProperties.${Object.keys(newValues).join('_')}.${sourceLayerId}`,
		version: versionStr,
		canBeRunAutomatically: true,
		validate: (context: MigrationContextShowStyle) => {
			const sourceLayer = context.getSourceLayer(sourceLayerId)

			if (!sourceLayer) {
				// nothing to migrate
				// getSourceLayerDefaultsMigrationSteps should create this layer later
				return false
			}

			return !_.isMatch(sourceLayer, newValues)
		},
		migrate: (context: MigrationContextShowStyle) => {
			context.updateSourceLayer(sourceLayerId, newValues)
		}
	}
}

export function SetSourceLayerName(
	versionStr: string,
	sourceLayerId: string,
	newValue: string
): MigrationStepShowStyle {
	return SetSourceLayerProperties(versionStr, sourceLayerId, { name: newValue })
}
