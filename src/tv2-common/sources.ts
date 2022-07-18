import * as _ from 'underscore'

import { IStudioContext, SourceLayerType } from '@tv2media/blueprints-integration'
import { SourceType } from 'tv2-constants'
import { SourceMapping } from './blueprintConfig'
import { SourceDefinition, SourceDefinitionEkstern, SourceDefinitionEVS, SourceDefinitionKam } from './inewsConversion'
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

export function FindSourceInfo(sources: SourceMapping, type: SourceInfoType, id: string): SourceInfo | undefined {
	id = id.replace(/\s+/i, ' ').trim()
	switch (type) {
		case SourceInfoType.KAM:
			return _.find(sources.cameras, s => s.id === id.replace(/minus mic/i, '').trim())
		case SourceInfoType.LIVE:
		case SourceInfoType.FEED:
			const remoteName = id
				.replace(/VO/i, '')
				.replace(/\s/g, '')
				.match(/^(?:LIVE|FEED) *(.+).*$/i)
			if (!remoteName) {
				return undefined
			}
			if (/^LIVE/i.test(id)) {
				return _.find(sources.lives, s => s.id === remoteName[1])
			} else {
				return _.find(sources.feeds, s => s.id === remoteName[1])
			}
		case SourceInfoType.REPLAY:
			return _.find(sources.replays, s => s.id === id)
		default:
			return undefined
	}
}

export function isMinusMic(inputName: string): boolean {
	return /minus mic/i.test(inputName)
}

export function FindSourceInfoByName(sources: SourceMapping, name: string): SourceInfo | undefined {
	name = name.toLowerCase()

	let sourceType: SourceInfoType | undefined
	if (name.match(/live/i)) {
		sourceType = SourceInfoType.LIVE
	} else if (name.match(/feed/i)) {
		sourceType = SourceInfoType.FEED
	} else if (name.match(/[k|c]am/i)) {
		sourceType = SourceInfoType.KAM
	} else if (name.match(/evs/i)) {
		sourceType = SourceInfoType.REPLAY
	}
	if (sourceType === undefined) {
		return undefined
	}

	return FindSourceInfo(sources, sourceType, name)
}

export function FindSourceInfoByDefinition(
	sources: SourceMapping,
	sourceDefinition: SourceDefinition
): SourceInfo | undefined {
	let arrayToSearchIn: SourceInfo[]
	switch (sourceDefinition.sourceType) {
		case SourceType.Kam:
			arrayToSearchIn = sources.cameras
			break
		case SourceType.REMOTE:
			arrayToSearchIn = sourceDefinition.variant === 'LIVE' ? sources.lives : sources.feeds
			break
		case SourceType.EVS:
			arrayToSearchIn = sources.replays
			break
		default:
			return undefined
	}
	return _.find(arrayToSearchIn, s => s.id === sourceDefinition.id)
}

export function SourceInfoToSourceDefinition(
	sourceInfo: SourceInfo
): SourceDefinitionKam | SourceDefinitionEkstern | SourceDefinitionEVS {
	switch (sourceInfo.type) {
		case SourceInfoType.KAM: {
			const name = `KAM ${sourceInfo.id}`
			return {
				sourceType: SourceType.Kam,
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
				variant: 'LIVE',
				id: sourceInfo.id,
				raw: name,
				name
			}
		}
		case SourceInfoType.FEED: {
			const name = `FEED ${sourceInfo.id}`
			return {
				sourceType: SourceType.REMOTE,
				variant: 'FEED',
				id: sourceInfo.id,
				raw: name,
				name
			}
		}
		case SourceInfoType.REPLAY:
			return {
				sourceType: SourceType.EVS,
				id: sourceInfo.id,
				raw: sourceInfo.id,
				name: sourceInfo.id,
				vo: false
			}
		default:
			assertUnreachable(sourceInfo.type)
	}
}
