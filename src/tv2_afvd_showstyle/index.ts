import { BlueprintManifestType, ShowStyleBlueprintManifest } from '@tv2media/blueprints-integration'
import { getShowStyleVariantId } from '../tv2-common/getShowStyleVariantId'
import { showStyleConfigManifest } from './config-manifests'
import { showStyleMigrations } from './migrations'

import { GetShowStyleManifestWithMixins, ShowStyleManifestMixinINews } from 'inews-mixins'
import { getEndStateForPart, shouldRemoveOrphanedPartInstance } from 'tv2-common'
import { onTimelineGenerateAFVD } from '../tv2_afvd_studio/onTimelineGenerate'
import { executeActionAFVD } from './actions'
import { getRundown } from './getRundown'
import { getSegment } from './getSegment'
import { parseConfig } from './helpers/config'
import { syncIngestUpdateToPartInstance } from './syncIngestUpdateToPartInstance'

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

		onTimelineGenerate: onTimelineGenerateAFVD,
		getEndStateForPart,
		executeAction: executeActionAFVD,
		syncIngestUpdateToPartInstance,
		shouldRemoveOrphanedPartInstance,

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
