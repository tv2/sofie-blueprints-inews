import {
	ISourceLayer,
	MigrationContextShowStyle,
	MigrationStepShowStyle
} from '@sofie-automation/blueprints-integration'

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

			return sourceLayer.activateKeyboardHotkeys !== newValue
		},
		migrate: (context: MigrationContextShowStyle) => {
			const sourceLayer = context.getSourceLayer(sourceLayerId) as ISourceLayer

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

				return sourceLayer.clearKeyboardHotkey !== newValue
			},
			migrate: (context: MigrationContextShowStyle) => {
				const sourceLayer = context.getSourceLayer(sourceLayerId) as ISourceLayer

				sourceLayer.clearKeyboardHotkey = newValue

				context.updateSourceLayer(sourceLayerId, sourceLayer)
			}
		}
	]
}
