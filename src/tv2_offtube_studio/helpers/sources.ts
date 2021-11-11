import * as _ from 'underscore'

import { SourceLayerType } from '@sofie-automation/blueprints-integration'
import { ParseMappingTable, SourceInfo } from 'tv2-common'
import { EksternVariant } from 'tv2-constants'
import { OfftubeStudioConfig } from './config'

export function parseMediaPlayers(studioConfig: OfftubeStudioConfig): Array<{ id: string; val: string }> {
	return studioConfig.ABMediaPlayers.map(player => ({ id: player.SourceName, val: player.AtemSource.toString() }))
}

export function parseSources(studioConfig: OfftubeStudioConfig): SourceInfo[] {
	return [
		...ParseMappingTable(studioConfig.SourcesFeed, SourceLayerType.REMOTE, 'F', EksternVariant.FEED),
		...ParseMappingTable(studioConfig.SourcesRM, SourceLayerType.REMOTE, undefined, EksternVariant.LIVE),
		...ParseMappingTable(studioConfig.SourcesCam, SourceLayerType.CAMERA)
	]
}
