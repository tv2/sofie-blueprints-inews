import * as _ from 'underscore'

import { IStudioContext, SourceLayerType } from '@tv2media/blueprints-integration'
import { literal } from 'tv2-common'
import { TableConfigItemSourceMappingWithSisyfos } from './types'

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
	idPrefix?: string
): SourceInfo[] {
	return studioConfig.map(conf => ({
		type,
		id: `${idPrefix || ''}${conf.SourceName}`,
		port: conf.AtemSource,
		sisyfosLayers: conf.SisyfosLayers,
		useStudioMics: conf.StudioMics,
		wantsToPersistAudio: conf.WantsToPersistAudio,
		acceptPersistAudio: conf.AcceptPersistAudio
	}))
}

export type SourceInfoType =
	| SourceLayerType.CAMERA
	| SourceLayerType.REMOTE
	| SourceLayerType.AUDIO
	| SourceLayerType.VT
	| SourceLayerType.GRAPHICS
	| SourceLayerType.UNKNOWN
	| SourceLayerType.LOCAL
export interface SourceInfo {
	type: SourceInfoType
	id: string
	port: number
	ptzDevice?: string
	sisyfosLayers?: string[]
	useStudioMics?: boolean
	wantsToPersistAudio?: boolean
	acceptPersistAudio?: boolean
}

export function FindSourceInfo(sources: SourceInfo[], type: SourceInfoType, id: string): SourceInfo | undefined {
	id = id.replace(/\s+/i, ' ').trim()
	switch (type) {
		case SourceLayerType.CAMERA:
			const cameraName = id.match(/^(?:KAM|CAM)(?:ERA)? ?(.+)$/i)
			if (cameraName === undefined || cameraName === null) {
				return undefined
			}

			return _.find(sources, s => s.type === type && s.id === cameraName[1].replace(/minus mic/i, '').trim())
		case SourceLayerType.REMOTE:
			const remoteName = id
				.replace(/VO/i, '')
				.replace(/\s/g, '')
				.match(/^(?:LIVE|FEED) ?(.+).*$/i)
			if (!remoteName) {
				return undefined
			}
			if (id.match(/^LIVE/i)) {
				return _.find(sources, s => s.type === type && s.id === remoteName[1])
			} else {
				return _.find(sources, s => s.type === type && s.id === `F${remoteName[1]}`)
			}
		case SourceLayerType.LOCAL:
			const dpName = id.match(/^(?:EVS)\s*(\d+).*$/i)
			if (!dpName) {
				return undefined
			}
			return _.find(sources, s => s.type === SourceLayerType.LOCAL && s.id === `DP${dpName[1]}`)
		default:
			return undefined
	}
}

export function FindSourceInfoStrict(
	_context: IStudioContext,
	sources: SourceInfo[],
	type: SourceInfoType,
	id: string
): SourceInfo | undefined {
	return FindSourceInfo(sources, type, id)
}

export function FindSourceByName(context: IStudioContext, sources: SourceInfo[], name: string): SourceInfo | undefined {
	name = (name + '').toLowerCase()

	if (name.indexOf('k') === 0 || name.indexOf('c') === 0) {
		return FindSourceInfoStrict(context, sources, SourceLayerType.CAMERA, name)
	}

	// TODO: This will be different for TV 2
	if (name.indexOf('r') === 0) {
		return FindSourceInfoStrict(context, sources, SourceLayerType.REMOTE, name)
	}

	// R35: context.notifyUserWarning(`Invalid source name "${name}"`)
	return undefined
}

export function GetInputValue(context: IStudioContext, sources: SourceInfo[], name: string): number {
	let input = 1000
	const source = FindSourceByName(context, sources, name)

	if (source !== undefined) {
		input = literal<SourceInfo>(source).port
	}

	return input
}
