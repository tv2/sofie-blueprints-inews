import { ISourceLayer, MigrationContextShowStyle, MigrationStepShowStyle } from '@tv2media/blueprints-integration'
import { literal } from 'tv2-common'

export function SetShortcutListMigrationStep(
	versionStr: string,
	sourceLayerId: string,
	newValue: string
): MigrationStepShowStyle {
	return literal<MigrationStepShowStyle>({
		id: `${versionStr}.remapShortcuts.${sourceLayerId}`,
		version: versionStr,
		canBeRunAutomatically: true,
		validate: (context: MigrationContextShowStyle) => {
			const sourceLayer = context.getSourceLayer(sourceLayerId)

			if (!sourceLayer) {
				return `Sourcelayer ${sourceLayerId} does not exists`
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
	})
}

export function SetSourceLayerNameMigrationStep(
	versionStr: string,
	sourceLayerId: string,
	newValue: string
): MigrationStepShowStyle {
	return literal<MigrationStepShowStyle>({
		id: `${versionStr}.remapSourceLayerName.${sourceLayerId}`,
		version: versionStr,
		canBeRunAutomatically: true,
		validate: (context: MigrationContextShowStyle) => {
			const sourceLayer = context.getSourceLayer(sourceLayerId)

			if (!sourceLayer) {
				return `Sourcelayer ${sourceLayerId} does not exists`
			}

			return sourceLayer.name !== newValue
		},
		migrate: (context: MigrationContextShowStyle) => {
			const sourceLayer = context.getSourceLayer(sourceLayerId) as ISourceLayer

			sourceLayer.name = newValue

			context.updateSourceLayer(sourceLayerId, sourceLayer)
		}
	})
}

export function SetClearShortcutListTransitionStep(
	versionStr: string,
	sourceLayerId: string,
	newValue: string
): MigrationStepShowStyle[] {
	return [
		literal<MigrationStepShowStyle>({
			id: `${versionStr}.remapClearShortcuts.${sourceLayerId}`,
			version: versionStr,
			canBeRunAutomatically: true,
			validate: (context: MigrationContextShowStyle) => {
				const sourceLayer = context.getSourceLayer(sourceLayerId)

				if (!sourceLayer) {
					return `Sourcelayer ${sourceLayerId} does not exists`
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
		})
	]
}
