import * as _ from 'underscore'

import { NotesContext, SourceLayerType } from 'tv-automation-sofie-blueprints-integration'
import { parseMapStr, SourceInfo } from 'tv2-common'
import { OfftubeStudioConfig } from './config'

export function parseMediaPlayers(
	context: NotesContext | undefined,
	studioConfig: OfftubeStudioConfig
): Array<{ id: string; val: string }> {
	return parseMapStr(context, studioConfig.ABMediaPlayers, false)
}

export function parseSources(context: NotesContext | undefined, studioConfig: OfftubeStudioConfig): SourceInfo[] {
	const rmInputMap: Array<{ id: string; val: number }> = parseMapStr(context, studioConfig.SourcesRM, true)
	const kamInputMap: Array<{ id: string; val: number }> = parseMapStr(context, studioConfig.SourcesCam, true)

	const res: SourceInfo[] = []

	_.each(rmInputMap, rm => {
		res.push({
			type: SourceLayerType.REMOTE,
			id: rm.id,
			port: rm.val
		})
	})

	_.each(kamInputMap, kam => {
		res.push({
			type: SourceLayerType.CAMERA,
			id: kam.id,
			port: kam.val
		})
	})

	return res
}
