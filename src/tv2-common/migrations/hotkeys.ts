import {
	IBlueprintTriggeredActions,
	ISourceLayer,
	MigrationContextShowStyle,
	MigrationStepShowStyle
} from 'blueprints-integration'
import {
	defaultHotkeys,
	GlobalHotkeySourceLayers,
	GlobalHotkeySources,
	ISourceLayerWithHotKeys,
	literal,
	MakeAllAdLibsTriggers
} from 'tv2-common'
import _ = require('underscore')

function shortcutsAreDifferent(
	defaultShortcut: IBlueprintTriggeredActions,
	existingShortcut: IBlueprintTriggeredActions
) {
	const nameDiffers = existingShortcut.name !== defaultShortcut.name
	const actionsDiffer = !_.isEqual(existingShortcut.actions, defaultShortcut.actions)
	const triggersDiffer = !_.isEqual(existingShortcut.triggers, defaultShortcut.triggers)
	return nameDiffers || actionsDiffer || triggersDiffer
}

export function GetDefaultAdLibTriggers(
	versionStr: string,
	showStyleId: string,
	sourceLayers: GlobalHotkeySourceLayers,
	getGlobalHotkeySources: (context: MigrationContextShowStyle) => GlobalHotkeySources,
	forceToDefaults: boolean
): MigrationStepShowStyle {
	return literal<MigrationStepShowStyle>({
		id: `${versionStr}.migrateShortcutsToAdLibTriggers${forceToDefaults ? '.defaults' : ''}.${showStyleId}`,
		version: versionStr,
		canBeRunAutomatically: true,
		validate: (context: MigrationContextShowStyle) => {
			const shortcutsDefaults = MakeAllAdLibsTriggers(
				showStyleId,
				defaultHotkeys,
				getGlobalHotkeySources(context),
				sourceLayers
			)

			return shortcutsDefaults.some((defaultShortcut) => {
				const existingShortcut = context.getTriggeredAction(defaultShortcut._id)

				if (!existingShortcut) {
					return true
				}

				return forceToDefaults && shortcutsAreDifferent(defaultShortcut, existingShortcut)
			})
		},
		migrate: (context: MigrationContextShowStyle) => {
			const shortcutsDefaults = MakeAllAdLibsTriggers(
				showStyleId,
				defaultHotkeys,
				getGlobalHotkeySources(context),
				sourceLayers
			)

			for (const newShortcut of shortcutsDefaults) {
				const existingShortcut = context.getTriggeredAction(newShortcut._id)
				const needsMigration =
					!existingShortcut || (forceToDefaults && shortcutsAreDifferent(existingShortcut, newShortcut))
				if (needsMigration) {
					context.setTriggeredAction(newShortcut)
				}
			}
		}
	})
}

export function RemoveOldShortcuts(
	versionStr: string,
	showStyleId: string,
	sourceLayerDefaults: ISourceLayer[]
): MigrationStepShowStyle {
	return {
		id: `${versionStr}.migrateShortcutsToAdLibTriggers.${showStyleId}`,
		version: versionStr,
		canBeRunAutomatically: true,
		validate: (context: MigrationContextShowStyle) => {
			const sourceLayers = sourceLayerDefaults.map((sourceLayer) => context.getSourceLayer(sourceLayer._id)) as Array<
				ISourceLayerWithHotKeys | undefined
			>

			return sourceLayers.some(
				(sourceLayer) =>
					!!sourceLayer?.clearKeyboardHotkey ||
					!!sourceLayer?.activateKeyboardHotkeys ||
					!!sourceLayer?.activateStickyKeyboardHotkey ||
					sourceLayer?.assignHotkeysToGlobalAdlibs !== undefined
			)
		},
		migrate: (context: MigrationContextShowStyle) => {
			for (const sourceLayer of sourceLayerDefaults) {
				const coreSourceLayer = context.getSourceLayer(sourceLayer._id) as ISourceLayerWithHotKeys | undefined
				if (!coreSourceLayer) {
					continue
				}

				coreSourceLayer.clearKeyboardHotkey = undefined
				coreSourceLayer.activateKeyboardHotkeys = undefined
				coreSourceLayer.activateStickyKeyboardHotkey = undefined
				coreSourceLayer.assignHotkeysToGlobalAdlibs = undefined

				context.updateSourceLayer(sourceLayer._id, coreSourceLayer)
			}
		}
	}
}
