import { BlueprintManifestType, ShowStyleBlueprintManifest } from 'blueprints-integration'
import { getEndStateForPart, getShowStyleVariantId, onSetNext } from 'tv2-common'
import { showStyleConfigManifest } from './config-manifests'
import { showStyleMigrations } from './migrations'

import { GetShowStyleManifestWithMixins, ShowStyleManifestMixinINews } from 'inews-mixins'
import { onTimelineGenerateAFVD } from '../tv2_afvd_studio/onTimelineGenerate'
import { executeActionAFVD } from './actions'
import { getRundown } from './getRundown'
import { getSegment } from './getSegment'
import { preprocessConfig } from './helpers/config'
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
		preprocessConfig,

		getShowStyleVariantId,
		getRundown,
		getSegment,

		onTimelineGenerate: onTimelineGenerateAFVD,
		getEndStateForPart,
		executeAction: executeActionAFVD,
		syncIngestUpdateToPartInstance,
		onSetNext,

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
