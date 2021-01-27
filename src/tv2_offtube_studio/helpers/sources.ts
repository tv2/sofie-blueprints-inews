import * as _ from 'underscore'

import { SourceLayerType } from '@sofie-automation/blueprints-integration'
import { ParseMappingTable, SourceInfo } from 'tv2-common'
import { OfftubeStudioConfig } from './config'

export function parseMediaPlayers(studioConfig: OfftubeStudioConfig): Array<{ id: string; val: string }> {
	return studioConfig.ABMediaPlayers.map(player => ({ id: player.SourceName, val: player.AtemSource.toString() }))
}

export function parseSources(studioConfig: OfftubeStudioConfig): SourceInfo[] {
	const rmInputMap: SourceInfo[] = ParseMappingTable(studioConfig.SourcesRM, SourceLayerType.REMOTE)
	const kamInputMap: SourceInfo[] = ParseMappingTable(studioConfig.SourcesCam, SourceLayerType.CAMERA)

	return rmInputMap.concat(kamInputMap)
}
