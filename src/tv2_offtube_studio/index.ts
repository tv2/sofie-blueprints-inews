import { BlueprintManifestType, StudioBlueprintManifest } from 'tv-automation-sofie-blueprints-integration'
import * as _ from 'underscore'
import { studioConfigManifest } from '../tv2_afvd_studio/config-manifests'
import { getBaseline } from '../tv2_afvd_studio/getBaseline'
import { studioMigrations } from '../tv2_afvd_studio/migrations'
import { getShowStyleId } from './getShowStyleId'

declare const VERSION: string // Injected by webpack
declare const VERSION_TSR: string // Injected by webpack
declare const VERSION_INTEGRATION: string // Injected by webpack

const manifest: StudioBlueprintManifest = {
	blueprintType: BlueprintManifestType.STUDIO,

	blueprintVersion: VERSION,
	integrationVersion: VERSION_INTEGRATION,
	TSRVersion: VERSION_TSR,

	minimumCoreVersion: '1.2.0',

	studioConfigManifest,
	studioMigrations,

	getBaseline,
	getShowStyleId
}

export default manifest
