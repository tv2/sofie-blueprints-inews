import * as _ from 'underscore'

import { SourceLayerType } from '@sofie-automation/blueprints-integration'
import { ParseMappingTable, SourceInfo } from 'tv2-common'
import { StudioConfig } from './config'

export function parseMediaPlayers(studioConfig: StudioConfig): Array<{ id: string; val: string }> {
	return studioConfig.ABMediaPlayers.map(player => ({
		id: player.SourceName,
		val: player.AtemSource.toString()
	}))
}

export function parseSources(studioConfig: StudioConfig): SourceInfo[] {
	return [
		...ParseMappingTable(studioConfig.SourcesFeed, SourceLayerType.REMOTE, 'F'),
		...ParseMappingTable(studioConfig.SourcesRM, SourceLayerType.REMOTE),
		...ParseMappingTable(studioConfig.SourcesCam, SourceLayerType.CAMERA),
		...ParseMappingTable(studioConfig.SourcesSkype, SourceLayerType.REMOTE, 'S'),
		...ParseMappingTable(studioConfig.SourcesDelayedPlayback, SourceLayerType.LOCAL, 'DP')
	]
}
