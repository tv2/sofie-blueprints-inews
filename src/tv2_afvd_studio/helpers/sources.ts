import * as _ from 'underscore'

import { SourceLayerType } from 'tv-automation-sofie-blueprints-integration'
import { SourceInfo } from 'tv2-common'
import { StudioConfig } from './config'

export function parseMediaPlayers(studioConfig: StudioConfig): Array<{ id: string; val: string }> {
	return studioConfig.ABMediaPlayers.map(player => ({ id: player.SourceName, val: player.AtemSource.toString() }))
}

export function parseSources(studioConfig: StudioConfig): SourceInfo[] {
	const res: SourceInfo[] = []

	for (const rm of studioConfig.SourcesRM) {
		res.push({
			type: SourceLayerType.REMOTE,
			id: rm.SourceName,
			port: rm.AtemSource,
			sisyfosLayers: rm.SisyfosLayers,
			useStudioMics: rm.StudioMics
		})
	}

	for (const kam of studioConfig.SourcesCam) {
		res.push({
			type: SourceLayerType.CAMERA,
			id: kam.SourceName,
			port: kam.AtemSource,
			sisyfosLayers: kam.SisyfosLayers,
			useStudioMics: kam.StudioMics
		})
	}

	for (const sk of studioConfig.SourcesSkype) {
		res.push({
			type: SourceLayerType.REMOTE,
			id: `S${sk.SourceName}`,
			port: sk.AtemSource,
			sisyfosLayers: sk.SisyfosLayers,
			useStudioMics: sk.StudioMics
		})
	}

	for (const dp of studioConfig.SourcesDelayedPlayback) {
		res.push({
			type: SourceLayerType.REMOTE,
			id: `DP${dp.SourceName}`,
			port: dp.AtemSource,
			sisyfosLayers: dp.SisyfosLayers,
			useStudioMics: dp.StudioMics
		})
	}

	return res
}
