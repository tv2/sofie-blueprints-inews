import { IBlueprintConfig } from '@sofie-automation/blueprints-integration'
import {
	DSKConfig,
	getLiveAudioLayers,
	getStickyLayers,
	MediaPlayerConfig,
	parseDSK,
	SourceInfo,
	TableConfigItemDSK,
	TableConfigItemSourceMapping,
	TV2StudioConfigBase
} from 'tv2-common'
import * as _ from 'underscore'
import { parseMediaPlayers, parseSources } from './sources'

export interface OfftubeStudioBlueprintConfig {
	studio: OfftubeStudioConfig
	sources: SourceInfo[]
	mediaPlayers: MediaPlayerConfig // Atem Input Ids
	liveAudio: string[]
	stickyLayers: string[]
	dsk: DSKConfig
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
		GFXFull: number
		Loop: number
		DSK: TableConfigItemDSK[]

		Default: number
		Continuity: number
		JingleFill: number
		JingleKey: number
	}

	AtemSettings: {
		CCGClip: number
		CCGGain: number
	}

	AudioBedSettings: {
		fadeIn: number
		fadeOut: number
		volume: number
	}

	CasparPrerollDuration: number
	IdleSource: number
	IdleSisyfosLayers: string[]
}

export const defaultDSK: TableConfigItemDSK = {
	Number: 1,
	Fill: 7,
	Key: 8,
	Toggle: true,
	DefaultOn: true,
	FullSource: true
}

export function parseConfig(rawConfig: IBlueprintConfig): OfftubeStudioBlueprintConfig {
	const studioConfig = (rawConfig as unknown) as OfftubeStudioConfig
	const dsk = parseDSK(studioConfig, defaultDSK)
	const config: OfftubeStudioBlueprintConfig = {
		studio: rawConfig as any,
		// showStyle: {} as any,
		sources: [],
		mediaPlayers: [],
		liveAudio: [],
		stickyLayers: [],
		dsk
	}
	config.sources = parseSources(studioConfig)
	config.mediaPlayers = parseMediaPlayers(studioConfig)
	config.liveAudio = getLiveAudioLayers(studioConfig)
	config.stickyLayers = getStickyLayers(studioConfig, config.liveAudio)

	return config
}
