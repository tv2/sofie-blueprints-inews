import { BlueprintManifestType, ShowStyleBlueprintManifest } from '@sofie-automation/blueprints-integration'
import { showStyleConfigManifest } from './config-manifests'
import { showStyleMigrations } from './migrations'

import { getEndStateForPart } from 'tv2-common'
import { onTimelineGenerateAFVD } from '../tv2_afvd_studio/onTimelineGenerate'
import { executeActionAFVD } from './actions'
import { getRundown, getShowStyleVariantId } from './getRundown'
import { getSegment } from './getSegment'
import { parseConfig } from './helpers/config'
import { syncIngestUpdateToPartInstance } from './syncIngestUpdateToPartInstance'

declare const VERSION: string // Injected by webpack
declare const VERSION_TSR: string // Injected by webpack
declare const VERSION_INTEGRATION: string // Injected by webpack

const manifest: ShowStyleBlueprintManifest = {
	blueprintType: BlueprintManifestType.SHOWSTYLE,

	blueprintVersion: VERSION,
	integrationVersion: VERSION_INTEGRATION,
	TSRVersion: VERSION_TSR,

	preprocessConfig: parseConfig,

	getShowStyleVariantId,
	getRundown,
	getSegment,

	onTimelineGenerate: onTimelineGenerateAFVD,
	getEndStateForPart,
	executeAction: executeActionAFVD,
	syncIngestUpdateToPartInstance,

	showStyleConfigManifest,
	showStyleMigrations
}

export default manifest
