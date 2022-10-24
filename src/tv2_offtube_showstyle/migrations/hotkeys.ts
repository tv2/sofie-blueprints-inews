import { ConfigManifestEntryTable, MigrationContextShowStyle, TableConfigItemValue } from 'blueprints-integration'
import { GlobalHotkeySources } from 'tv2-common'
import {
	manifestOfftubeSourcesCam,
	manifestOfftubeSourcesFeed,
	manifestOfftubeSourcesRM
} from '../../tv2_offtube_studio/config-manifests'
import { dveStylesManifest } from '../config-manifests'

export function GetDefaultStudioSourcesForOfftube(context: MigrationContextShowStyle): GlobalHotkeySources {
	const dveLayoutConfig = context.getBaseConfig('DVEStyles') as TableConfigItemValue | undefined
	let dveLayouts: string[] = []
	if (dveLayoutConfig?.length) {
		dveLayouts = dveLayoutConfig.map(dve => dve.DVEName).filter(name => name !== undefined) as string[]
	} else {
		dveLayouts = (dveStylesManifest as ConfigManifestEntryTable).defaultVal
			.map(dve => dve.DVEName)
			.filter(name => name !== undefined) as string[]
	}

	const camera = manifestOfftubeSourcesCam.defaultVal.map(source => source.SourceName) as string[]
	const remote = manifestOfftubeSourcesRM.defaultVal.map(source => source.SourceName) as string[]
	const feed = manifestOfftubeSourcesFeed.defaultVal.map(source => `F${source.SourceName}`)
	const local: string[] = []

	return {
		camera,
		remote,
		feed,
		local,
		dveLayouts
	}
}
