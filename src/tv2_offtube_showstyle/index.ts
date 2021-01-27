import { BlueprintManifestType, ShowStyleBlueprintManifest } from 'tv-automation-sofie-blueprints-integration'
import { showStyleConfigManifest } from './config-manifests'
import { showStyleMigrations } from './migrations'

import { getEndStateForPart } from 'tv2-common'
import { onTimelineGenerateOfftube } from '../tv2_offtube_showstyle/onTimelineGenerate'
import { executeActionOfftube } from './actions'
import { getRundown, getShowStyleVariantId } from './getRundown'
import { getSegment } from './getSegment'
import { parseConfig } from './helpers/config'
import onAsRunEvent from './onAsRunEvent'

declare const VERSION: string // Injected by webpack
declare const VERSION_TSR: string // Injected by webpack
declare const VERSION_INTEGRATION: string // Injected by webpack

const manifest: ShowStyleBlueprintManifest = {
	blueprintType: BlueprintManifestType.SHOWSTYLE,

	blueprintVersion: VERSION,
	integrationVersion: VERSION_INTEGRATION,
	TSRVersion: VERSION_TSR,

	minimumCoreVersion: '1.13.0',

	preprocessConfig: parseConfig,

	getShowStyleVariantId,
	getRundown,
	getSegment,

	onAsRunEvent,
	onTimelineGenerate: onTimelineGenerateOfftube,
	getEndStateForPart,
	executeAction: executeActionOfftube,

	showStyleConfigManifest,
	showStyleMigrations
}

export default manifest
