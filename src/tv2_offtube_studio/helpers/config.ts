import { IBlueprintConfig, ICommonContext } from '@sofie-automation/blueprints-integration'
import {
	getLiveAudioLayers,
	getStickyLayers,
	MediaPlayerConfig,
	SourceInfo,
	TableConfigItemDSK,
	TableConfigItemSourceMapping,
	TV2StudioConfigBase
} from 'tv2-common'
import { DSKRoles } from 'tv2-constants'
import * as _ from 'underscore'
import { parseMediaPlayers, parseSources } from './sources'

export interface OfftubeStudioBlueprintConfig {
	studio: OfftubeStudioConfig
	sources: SourceInfo[]
	mediaPlayers: MediaPlayerConfig // Atem Input Ids
	liveAudio: string[]
	stickyLayers: string[]
	dsk: TableConfigItemDSK[]
}

export interface OfftubeStudioConfig extends TV2StudioConfigBase {
	// Injected by core
	SofieHostURL: string

	ABMediaPlayers: TableConfigItemSourceMapping[]
	ABPlaybackDebugLogging: boolean
	AtemSource: {
		SplitArtF: number // Atem MP1 Fill
		SplitArtK: number // Atem MP1 Key
		SplitBackground: number
		Loop: number
		DSK: TableConfigItemDSK[]

		Default: number
		Continuity: number
	}

	AtemSettings: {}

	AudioBedSettings: {
		fadeIn: number
		fadeOut: number
		volume: number
	}

	CasparPrerollDuration: number
	IdleSource: number
	IdleSisyfosLayers: string[]
}

export function parseConfig(_context: ICommonContext, rawConfig: IBlueprintConfig): OfftubeStudioBlueprintConfig {
	const studioConfig = (rawConfig as unknown) as OfftubeStudioConfig
	const config: OfftubeStudioBlueprintConfig = {
		studio: rawConfig as any,
		// showStyle: {} as any,
		sources: [],
		mediaPlayers: [],
		liveAudio: [],
		stickyLayers: [],
		dsk: studioConfig.AtemSource.DSK
	}
	config.sources = parseSources(studioConfig)
	config.mediaPlayers = parseMediaPlayers(studioConfig)
	config.liveAudio = getLiveAudioLayers(studioConfig)
	config.stickyLayers = getStickyLayers(studioConfig, config.liveAudio)

	return config
}

export const defaultDSKConfig: TableConfigItemDSK[] = [
	{
		Number: 0,
		Key: 8,
		Fill: 7,
		Toggle: true,
		DefaultOn: true,
		Roles: [DSKRoles.JINGLE, DSKRoles.OVERLAYGFX],
		Clip: '50.0',
		Gain: '12.5'
	},
	// Offtube doesn't use DSK for fulls, but this prevents duplicate studio configs + easy switchover to Viz engine
	{
		Number: 1,
		Key: 0,
		Fill: 12,
		Toggle: false,
		DefaultOn: false,
		Roles: [DSKRoles.FULLGFX],
		Clip: '50.0',
		Gain: '12.5'
	}
]
