import { BlueprintManifestType, SystemBlueprintManifest } from 'blueprints-integration'
import * as _ from 'underscore'
import { systemMigrations } from './migrations'

declare const VERSION: string // Injected by webpack
declare const VERSION_TSR: string // Injected by webpack
declare const VERSION_INTEGRATION: string // Injected by webpack

const manifest: SystemBlueprintManifest = {
	blueprintType: BlueprintManifestType.SYSTEM,

	blueprintVersion: VERSION,
	integrationVersion: VERSION_INTEGRATION,
	TSRVersion: VERSION_TSR,
	coreMigrations: systemMigrations
}

export default manifest
