import { MigrationStepSystem } from 'blueprints-integration'
import { RemoveDefaultCoreShortcuts } from './hotkeys'

declare const VERSION: string // Injected by webpack

export const systemMigrations: MigrationStepSystem[] = [RemoveDefaultCoreShortcuts(VERSION)]
