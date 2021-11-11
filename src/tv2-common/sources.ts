import * as _ from 'underscore'

import { IStudioContext, SourceLayerType } from '@sofie-automation/blueprints-integration'
import { SourceDefinition, SourceVariant } from 'tv2-common'
import { EksternVariant } from 'tv2-constants'
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
	idPrefix?: string,
	variant?: SourceVariant
): SourceInfo[] {
	return studioConfig.map(conf => ({
		type,
		id: `${idPrefix || ''}${conf.SourceName}`,
		variant,
		name: conf.SourceName,
		port: conf.AtemSource,
		sisyfosLayers: conf.SisyfosLayers,
		useStudioMics: conf.StudioMics
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
export interface SourceInfoBase {
	type: SourceInfoType
	variant?: SourceVariant
	/**
	 * Id with prefixes
	 * @todo: deprecate in favor of input
	 */
	id: string
	/** Source name without prefixes */
	name: string
	/** Physical connection on the ATEM */
	port: number
	ptzDevice?: string
	sisyfosLayers?: string[]
	useStudioMics?: boolean
}

export interface SourceInfoEkstern extends SourceInfoBase {
	type: SourceLayerType.REMOTE
	variant: EksternVariant
}
export interface SourceInfoOther extends SourceInfoBase {
	variant: undefined
}

export type SourceInfo = SourceInfoEkstern | SourceInfoBase

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
				.match(/^(?:LIVE|SKYPE|FEED) ?(.+).*$/i)
			if (!remoteName) {
				return undefined
			}
			if (id.match(/^LIVE/i)) {
				return _.find(sources, s => s.type === type && s.id === remoteName[1])
			} else if (id.match(/^FEED/i)) {
				return _.find(sources, s => s.type === type && s.id === `F${remoteName[1]}`)
			} else {
				// Skype
				return _.find(sources, s => s.type === type && s.id === `S${remoteName[1]}`)
			}
		case SourceLayerType.LOCAL:
			const dpName = id
				.replace(/VO/i, '')
				.replace(/\s/g, '')
				.match(/^(?:EVS) ?(.+).*$/i)
			if (!dpName) {
				return undefined
			}
			return _.find(sources, s => s.type === SourceLayerType.LOCAL && s.id === `DP${dpName[1]}`)
		default:
			return undefined
	}
}

const searchParamsByVariant: {
	[variant in SourceVariant]: (source: SourceDefinition) => [SourceLayerType, string]
} = {
	['KAM']: s => [SourceLayerType.CAMERA, s.name],
	['EVS']: s => [SourceLayerType.CAMERA, `DP${s.name}`],
	[EksternVariant.LIVE]: s => [SourceLayerType.REMOTE, s.name],
	[EksternVariant.FEED]: s => [SourceLayerType.REMOTE, `F${s.name}`],
	[EksternVariant.SKYPE]: s => [SourceLayerType.REMOTE, `S${s.name}`]
}

export function FindSourceInfoByDefinition(sources: SourceInfo[], source: SourceDefinition): SourceInfo | undefined {
	const searchParams = searchParamsByVariant[source.variant](source)
	return _.find(sources, s => s.type === searchParams[0] && s.id === searchParams[1])
}

export function FindSourceInfoStrict(
	_context: IStudioContext,
	sources: SourceInfo[],
	type: SourceInfoType,
	id: string
): SourceInfo | undefined {
	return FindSourceInfo(sources, type, id)
}
