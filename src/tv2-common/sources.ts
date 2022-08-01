import * as _ from 'underscore'

import { IStudioContext, SourceLayerType } from '@tv2media/blueprints-integration'
import { SourceType } from 'tv2-constants'
import { SourceMapping } from './blueprintConfig'
import {
	RemoteType,
	SourceDefinition,
	SourceDefinitionKam,
	SourceDefinitionRemote,
	SourceDefinitionReplay
} from './inewsConversion'
import { TableConfigItemSourceMappingWithSisyfos } from './types'
import { assertUnreachable } from './util'

// TODO: BEGONE!
export function parseMapStr(
	context: IStudioContext | undefined,
	str: string,
	_canBeStrings: boolean
): Array<{ id: string; val: number }> {
	str = str?.trim()

	if (!str) {
		return []
	}

	const res: Array<{ id: string; val: number }> = []

	const inputs = str.split(',')
	inputs.forEach(i => {
		if (i === '') {
			return
		}

		try {
			const p = i.split(':')
			if (p.length === 2) {
				const ind = p[0]
				const val = parseInt(p[1], 10)

				if (!isNaN(val)) {
					res.push({ id: ind, val: parseInt(p[1], 10) })
					return
				}
			}
		} catch (e) {
			// Ignore?
		}
		if (context) {
			// R35: context.notifyUserWarning('Invalid input map chunk: ' + i)
		}
	})

	return res
}

export function ParseMappingTable(
	studioConfig: TableConfigItemSourceMappingWithSisyfos[],
	type: SourceInfoType,
	sourceLayerType: SourceLayerType
): SourceInfo[] {
	return studioConfig.map(conf => ({
		type,
		id: conf.SourceName,
		port: conf.AtemSource,
		sisyfosLayers: conf.SisyfosLayers,
		useStudioMics: conf.StudioMics,
		wantsToPersistAudio: conf.WantsToPersistAudio,
		acceptPersistAudio: conf.AcceptPersistAudio,
		sourceLayerType
	}))
}
/**
 * Types of sources in the mappings
 * Note: these values are used for display purposes as well
 */
export enum SourceInfoType {
	KAM = 'KAM',
	FEED = 'FEED',
	LIVE = 'LIVE',
	REPLAY = 'REPLAY'
}

export interface SourceInfo {
	type: SourceInfoType
	sourceLayerType: SourceLayerType
	id: string
	port: number
	ptzDevice?: string
	sisyfosLayers?: string[]
	useStudioMics?: boolean
	wantsToPersistAudio?: boolean
	acceptPersistAudio?: boolean
}

export function findSourceInfo(sources: SourceMapping, sourceDefinition: SourceDefinition): SourceInfo | undefined {
	let arrayToSearchIn: SourceInfo[]
	switch (sourceDefinition.sourceType) {
		case SourceType.KAM:
			arrayToSearchIn = sources.cameras
			break
		case SourceType.REMOTE:
			arrayToSearchIn = sourceDefinition.remoteType === RemoteType.LIVE ? sources.lives : sources.feeds
			break
		case SourceType.REPLAY:
			arrayToSearchIn = sources.replays
			break
		default:
			return undefined
	}
	return _.find(arrayToSearchIn, s => s.id === sourceDefinition.id)
}

export function SourceInfoToSourceDefinition(
	sourceInfo: SourceInfo
): SourceDefinitionKam | SourceDefinitionRemote | SourceDefinitionReplay {
	switch (sourceInfo.type) {
		case SourceInfoType.KAM: {
			const name = `KAM ${sourceInfo.id}`
			return {
				sourceType: SourceType.KAM,
				id: sourceInfo.id,
				raw: name,
				minusMic: false,
				name
			}
		}
		case SourceInfoType.LIVE: {
			const name = `LIVE ${sourceInfo.id}`
			return {
				sourceType: SourceType.REMOTE,
				remoteType: RemoteType.LIVE,
				id: sourceInfo.id,
				raw: name,
				name
			}
		}
		case SourceInfoType.FEED: {
			const name = `FEED ${sourceInfo.id}`
			return {
				sourceType: SourceType.REMOTE,
				remoteType: RemoteType.FEED,
				id: sourceInfo.id,
				raw: name,
				name
			}
		}
		case SourceInfoType.REPLAY:
			return {
				sourceType: SourceType.REPLAY,
				id: sourceInfo.id,
				raw: sourceInfo.id,
				name: sourceInfo.id,
				vo: false
			}
		default:
			assertUnreachable(sourceInfo.type)
	}
}
