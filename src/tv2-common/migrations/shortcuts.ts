import { ISourceLayer, MigrationContextShowStyle, MigrationStepShowStyle } from '@tv2media/blueprints-integration'
import { literal } from 'tv2-common'

export function SetShortcutListMigrationStep(
	versionStr: string,
	sourceLayerId: string,
	newValue: string
): MigrationStepShowStyle {
	return {
		id: `${versionStr}.remapShortcuts.${sourceLayerId}`,
		version: versionStr,
		canBeRunAutomatically: true,
		validate: (context: MigrationContextShowStyle) => {
			const sourceLayer = context.getSourceLayer(sourceLayerId)

			if (!sourceLayer) {
				// nothing to migrate
				// getSourceLayerDefaultsMigrationSteps should create this layer later
				return false
			}

			// @ts-ignore: old property
			return sourceLayer.activateKeyboardHotkeys !== newValue
		},
		migrate: (context: MigrationContextShowStyle) => {
			const sourceLayer = context.getSourceLayer(sourceLayerId) as ISourceLayer

			// @ts-ignore: old property
			sourceLayer.activateKeyboardHotkeys = newValue

			context.updateSourceLayer(sourceLayerId, sourceLayer)
		}
	}
}

export function SetClearShortcutListTransitionStep(
	versionStr: string,
	sourceLayerId: string,
	newValue: string
): MigrationStepShowStyle[] {
	return [
		{
			id: `${versionStr}.remapClearShortcuts.${sourceLayerId}`,
			version: versionStr,
			canBeRunAutomatically: true,
			validate: (context: MigrationContextShowStyle) => {
				const sourceLayer = context.getSourceLayer(sourceLayerId)

				if (!sourceLayer) {
					// nothing to migrate
					// getSourceLayerDefaultsMigrationSteps should create this layer later
					return false
				}

				// @ts-ignore: old property
				return sourceLayer.clearKeyboardHotkey !== newValue
			},
			migrate: (context: MigrationContextShowStyle) => {
				const sourceLayer = context.getSourceLayer(sourceLayerId) as ISourceLayer

				// @ts-ignore: old property
				sourceLayer.clearKeyboardHotkey = newValue

				context.updateSourceLayer(sourceLayerId, sourceLayer)
			}
		}
	]
}
