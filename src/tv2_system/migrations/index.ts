import { MigrationStepSystem } from '@tv2media/blueprints-integration'
import { literal } from 'tv2-common'
import { RemoveDefaultCoreShortcuts } from './hotkeys'

declare const VERSION: string // Injected by webpack

export const systemMigrations: MigrationStepSystem[] = literal<MigrationStepSystem[]>([
	RemoveDefaultCoreShortcuts(VERSION)
])
