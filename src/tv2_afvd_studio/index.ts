import { BlueprintManifestType, StudioBlueprintManifest } from 'blueprints-integration'
import { GetStudioManifestWithMixins, StudioManifestMixinINews } from 'inews-mixins'
import { studioConfigManifest } from './config-manifests'
import { galleryDStudioConfigPresets } from './configPreset/configPresets'
import { getBaseline } from './getBaseline'
import { getShowStyleId } from './getShowStyleId'
import { parseConfig } from './helpers/config'
import { studioMigrations } from './migrations'

declare const VERSION: string // Injected by webpack
declare const VERSION_TSR: string // Injected by webpack
declare const VERSION_INTEGRATION: string // Injected by webpack

const manifest: StudioBlueprintManifest = GetStudioManifestWithMixins(
	{
		blueprintType: BlueprintManifestType.STUDIO,

		blueprintVersion: VERSION,
		integrationVersion: VERSION_INTEGRATION,
		TSRVersion: VERSION_TSR,

		preprocessConfig: parseConfig,

		studioConfigManifest,
		studioMigrations,

		getBaseline,
		getShowStyleId,
		configPresets: galleryDStudioConfigPresets
	},
	[StudioManifestMixinINews.INewsPlaylist]
)

export default manifest
