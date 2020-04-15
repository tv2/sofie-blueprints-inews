import * as _ from 'underscore'

import { NotesContext, SourceLayerType } from 'tv-automation-sofie-blueprints-integration'
import { literal } from 'tv2-common'

export function parseMapStr(
	context: NotesContext | undefined,
	str: string,
	canBeStrings: boolean
): Array<{ id: string; val: any }> {
	str = str.trim()

	const res: Array<{ id: string; val: number | string }> = []

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

				if (!canBeStrings && !isNaN(val)) {
					res.push({ id: ind, val: parseInt(p[1], 10) })
					return
				} else if (canBeStrings && p[1] !== undefined) {
					res.push({ id: ind, val: p[1] })
					return
				}
			}
		} catch (e) {
			// Ignore?
		}
		if (context) {
			context.warning('Invalid input map chunk: ' + i)
		}
	})

	return res
}

export type SourceInfoType =
	| SourceLayerType.CAMERA
	| SourceLayerType.REMOTE
	| SourceLayerType.AUDIO
	| SourceLayerType.VT
	| SourceLayerType.GRAPHICS
export interface SourceInfo {
	type: SourceInfoType
	id: string
	port: number
	ptzDevice?: string
	sisyfosLayers?: string[]
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
			const remoteName = id.match(/^(?:LIVE|SKYPE|EVS) ?(.+).*$/i)
			if (!remoteName) {
				return undefined
			}
			if (id.match(/^LIVE/i)) {
				return _.find(sources, s => s.type === type && s.id === remoteName[1])
			} else if (id.match(/^EVS/i)) {
				return _.find(sources, s => s.type === SourceLayerType.REMOTE && s.id === `DP${remoteName[1]}`)
			} else {
				// Skype
				return _.find(sources, s => s.type === type && s.id === `S${remoteName[1]}`)
			}
		default:
			return undefined
	}
}

export function FindSourceInfoStrict(
	context: NotesContext,
	sources: SourceInfo[],
	type: SourceInfoType,
	id: string
): SourceInfo | undefined {
	const source = FindSourceInfo(sources, type, id)
	if (!source) {
		context.warning(`Invalid source "${id}" of type "${type}"`)
	}
	return source
}

export function FindSourceByName(context: NotesContext, sources: SourceInfo[], name: string): SourceInfo | undefined {
	name = (name + '').toLowerCase()

	if (name.indexOf('k') === 0 || name.indexOf('c') === 0) {
		return FindSourceInfoStrict(context, sources, SourceLayerType.CAMERA, name)
	}

	// TODO: This will be different for TV 2
	if (name.indexOf('r') === 0) {
		return FindSourceInfoStrict(context, sources, SourceLayerType.REMOTE, name)
	}

	context.warning(`Invalid source name "${name}"`)
	return undefined
}

export function GetInputValue(context: NotesContext, sources: SourceInfo[], name: string): number {
	let input = 1000
	const source = FindSourceByName(context, sources, name)

	if (source !== undefined) {
		input = literal<SourceInfo>(source).port
	}

	return input
}
