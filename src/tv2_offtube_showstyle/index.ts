import { BlueprintManifestType, ShowStyleBlueprintManifest } from '@tv2media/blueprints-integration'
import { showStyleConfigManifest } from './config-manifests'
import { showStyleMigrations } from './migrations'

import { GetShowStyleManifestWithMixins, ShowStyleManifestMixinINews } from 'inews-mixins'
import { getEndStateForPart } from 'tv2-common'
import { onTimelineGenerateOfftube } from '../tv2_offtube_showstyle/onTimelineGenerate'
import { executeActionOfftube } from './actions'
import { getRundown, getShowStyleVariantId } from './getRundown'
import { getSegment } from './getSegment'
import { parseConfig } from './helpers/config'
import { syncIngestUpdateToPartInstance } from './syncIngestUpdateToPartInstances'

declare const VERSION: string // Injected by webpack
declare const VERSION_TSR: string // Injected by webpack
declare const VERSION_INTEGRATION: string // Injected by webpack

const manifest: ShowStyleBlueprintManifest = GetShowStyleManifestWithMixins(
	{
		blueprintType: BlueprintManifestType.SHOWSTYLE,

		blueprintVersion: VERSION,
		integrationVersion: VERSION_INTEGRATION,
		TSRVersion: VERSION_TSR,

		preprocessConfig: parseConfig,

		getShowStyleVariantId,
		getRundown,
		getSegment,

		onTimelineGenerate: onTimelineGenerateOfftube,
		getEndStateForPart,
		executeAction: executeActionOfftube,
		syncIngestUpdateToPartInstance,

		showStyleConfigManifest,
		showStyleMigrations
	},
	[
		ShowStyleManifestMixinINews.INewsPlaylist,
		ShowStyleManifestMixinINews.BackTime,
		ShowStyleManifestMixinINews.BreakBackTime
	]
)

export default manifest
