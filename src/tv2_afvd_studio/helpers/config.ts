import { IBlueprintConfig, ICommonContext, IStudioContext } from '@tv2media/blueprints-integration'
import {
	MediaPlayerConfig,
	SourceMapping,
	TableConfigItemDSK,
	TableConfigItemSourceMapping,
	TableConfigItemSourceMappingWithSisyfos,
	TV2StudioConfigBase
} from 'tv2-common'
import { DSKRoles } from 'tv2-constants'
import * as _ from 'underscore'
import { ShowStyleConfig } from '../../tv2_afvd_showstyle/helpers/config'
import { parseMediaPlayers, parseSources } from './sources'

export interface BlueprintConfig {
	studio: StudioConfig
	sources: SourceMapping
	showStyle: ShowStyleConfig
	mediaPlayers: MediaPlayerConfig // Atem Input Ids
	dsk: TableConfigItemDSK[]
}

export interface StudioConfig extends TV2StudioConfigBase {
	// Injected by core
	SofieHostURL: string

	SourcesReplay: TableConfigItemSourceMappingWithSisyfos[]
	ABMediaPlayers: TableConfigItemSourceMapping[]
	ABPlaybackDebugLogging: boolean
	StudioMics: string[]
	AtemSource: {
		SplitArtF: number // Atem MP1 Fill
		SplitArtK: number // Atem MP1 Key
		DSK: TableConfigItemDSK[]

		Default: number
		MixMinusDefault: number
		Continuity: number
		Dip: number
	}

	AtemSettings: {
		MP1Baseline: {
			Clip: number
			Loop: boolean
			Playing: boolean
		}
	}
}

export function parseConfig(_context: ICommonContext, rawConfig: IBlueprintConfig): any {
	const studioConfig = (rawConfig as unknown) as StudioConfig
	const config: BlueprintConfig = {
		studio: studioConfig,
		showStyle: {} as any,
		sources: parseSources(studioConfig),
		mediaPlayers: parseMediaPlayers(studioConfig),
		dsk: studioConfig.AtemSource.DSK
	}

	return config
}

export function getStudioConfig(context: IStudioContext): BlueprintConfig {
	return context.getStudioConfig() as BlueprintConfig
}

export const defaultDSKConfig: TableConfigItemDSK[] = [
	{
		Number: 0,
		Key: 34,
		Fill: 21,
		Toggle: true,
		DefaultOn: true,
		Roles: [DSKRoles.FULLGFX, DSKRoles.OVERLAYGFX],
		Clip: '50',
		Gain: '12.5'
	},
	{ Number: 1, Key: 31, Fill: 29, Toggle: true, DefaultOn: false, Roles: [DSKRoles.JINGLE], Clip: '50', Gain: '12.5' }
]
