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
	const skypeInputMap: Array<{ id: string; val: number }> = parseMapStr(context, studioConfig.SourcesSkype, true)
	const delayedPlaybackInput: Array<{ id: string; val: number }> = parseMapStr(
		context,
		studioConfig.SourcesDelayedPlayback,
		true
	)

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

	_.each(skypeInputMap, sk => {
		res.push({
			type: SourceLayerType.REMOTE,
			id: `S${sk.id}`,
			port: sk.val
		})
	})

	_.each(delayedPlaybackInput, dp => {
		res.push({
			type: SourceLayerType.REMOTE,
			id: `DP${dp.id}`,
			port: dp.val
		})
	})

	return res
}
