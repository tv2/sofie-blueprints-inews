import { IBlueprintConfig, ICommonContext } from 'blueprints-integration'
import {
	ProcessedStudioConfig,
	TableConfigItemDSK,
	TableConfigItemSourceMapping,
	TableConfigItemSourceMappingWithSisyfos,
	TV2StudioConfigBase
} from 'tv2-common'
import { DskRole } from 'tv2-constants'
import { parseMediaPlayers, parseSources } from './sources'

export interface GalleryStudioConfig extends ProcessedStudioConfig {
	studio: StudioConfig
}

export interface StudioConfig extends TV2StudioConfigBase {
	// Injected by core
	SofieHostURL: string

	SourcesReplay: TableConfigItemSourceMappingWithSisyfos[]
	ABMediaPlayers: TableConfigItemSourceMapping[]
	ABPlaybackDebugLogging: boolean
	StudioMics: string[]
	SwitcherSource: {
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

export function preprocessConfig(_context: ICommonContext, rawConfig: IBlueprintConfig): any {
	const studioConfig = rawConfig as unknown as StudioConfig
	const config: GalleryStudioConfig = {
		studio: studioConfig,
		sources: parseSources(studioConfig),
		mediaPlayers: parseMediaPlayers(studioConfig),
		dsk: studioConfig.SwitcherSource.DSK
	}

	return config
}

export const defaultDSKConfig: TableConfigItemDSK[] = [
	{
		Number: 0,
		Key: 34,
		Fill: 21,
		Toggle: true,
		DefaultOn: true,
		Roles: [DskRole.FULLGFX, DskRole.OVERLAYGFX],
		Clip: 50,
		Gain: 12.5
	},
	{ Number: 1, Key: 31, Fill: 29, Toggle: true, DefaultOn: false, Roles: [DskRole.JINGLE], Clip: 50, Gain: 12.5 }
]
