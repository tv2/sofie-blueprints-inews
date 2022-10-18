import * as _ from 'underscore'

import { SourceLayerType } from 'blueprints-integration'
import { ParseMappingTable, SourceInfoType, SourceMapping } from 'tv2-common'
import { StudioConfig } from './config'

export function parseMediaPlayers(studioConfig: StudioConfig): Array<{ id: string; val: string }> {
	return studioConfig.ABMediaPlayers.map(player => ({
		id: player.SourceName,
		val: player.AtemSource.toString()
	}))
}

export function parseSources(studioConfig: StudioConfig): SourceMapping {
	return {
		cameras: ParseMappingTable(studioConfig.SourcesCam, SourceInfoType.KAM, SourceLayerType.CAMERA),
		feeds: ParseMappingTable(studioConfig.SourcesFeed, SourceInfoType.FEED, SourceLayerType.REMOTE),
		lives: ParseMappingTable(studioConfig.SourcesRM, SourceInfoType.LIVE, SourceLayerType.REMOTE),
		replays: ParseMappingTable(studioConfig.SourcesReplay, SourceInfoType.REPLAY, SourceLayerType.LOCAL)
	}
}
