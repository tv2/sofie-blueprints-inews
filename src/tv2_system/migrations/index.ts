import { MigrationStepSystem } from '@tv2media/blueprints-integration'
import { RemoveDefaultCoreShortcuts } from './hotkeys'

declare const VERSION: string // Injected by webpack

export const systemMigrations: MigrationStepSystem[] = [RemoveDefaultCoreShortcuts(VERSION)]
