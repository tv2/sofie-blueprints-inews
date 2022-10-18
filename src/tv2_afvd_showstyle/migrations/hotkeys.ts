import { ConfigManifestEntryTable, MigrationContextShowStyle, TableConfigItemValue } from 'blueprints-integration'
import { GlobalHotkeySources } from 'tv2-common'
import {
	manifestAFVDSourcesCam,
	manifestAFVDSourcesFeed,
	manifestAFVDSourcesReplay,
	manifestAFVDSourcesRM
} from '../../tv2_afvd_studio/config-manifests'
import { dveStylesManifest } from '../config-manifests'

export function GetDefaultStudioSourcesForAFVD(context: MigrationContextShowStyle): GlobalHotkeySources {
	const dveLayoutConfig = context.getBaseConfig('DVEStyles') as TableConfigItemValue | undefined
	let dveLayouts: string[] = []
	if (dveLayoutConfig?.length) {
		dveLayouts = dveLayoutConfig.map(dve => dve.DVEName).filter(name => name !== undefined) as string[]
	} else {
		dveLayouts = (dveStylesManifest as ConfigManifestEntryTable).defaultVal
			.map(dve => dve.DVEName)
			.filter(name => name !== undefined) as string[]
	}

	const camera = manifestAFVDSourcesCam.defaultVal.map(source => source.SourceName) as string[]
	const remote = manifestAFVDSourcesRM.defaultVal.map(source => source.SourceName) as string[]
	const feed = manifestAFVDSourcesFeed.defaultVal.map(source => source.SourceName) as string[]
	const replay = manifestAFVDSourcesReplay.defaultVal.map(source => source.SourceName) as string[]

	return {
		camera,
		remote,
		feed,
		local: replay,
		dveLayouts
	}
}
