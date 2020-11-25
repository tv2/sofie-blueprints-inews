import { IBlueprintConfig } from 'tv-automation-sofie-blueprints-integration'
import {
	getLiveAudioLayers,
	getStickyLayers,
	MediaPlayerConfig,
	SourceInfo,
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
}

export interface OfftubeStudioConfig extends TV2StudioConfigBase {
	// Injected by core
	SofieHostURL: string

	// Must override

	// Intended overrides
	MediaFlowId: string
	ClipFileExtension: string
	NetworkBasePath: string // @ todo: hacky way of passing info, should be implied by media manager or something
	JingleBasePath: string
	ClipBasePath: string
	ABMediaPlayers: TableConfigItemSourceMapping[]
	ABPlaybackDebugLogging: boolean
	AtemSource: {
		DSK1F: number
		DSK1K: number
		SplitArtF: number // Atem MP1 Fill
		SplitArtK: number // Atem MP1 Key
		SplitBackground: number
		GFXFull: number
		Loop: number

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

	// Dev overrides

	// Constants
	CasparPrerollDuration: number
	FullKeepAliveDuration: number
	IdleSource: number
	FullGraphicURL: string
}

/*
export function defaultStudioConfig(context: NotesContext): OfftubeStudioBlueprintConfig {
	const config: OfftubeStudioBlueprintConfig = {
		studio: {} as any,
		// showStyle: {} as any,
		sources: [],
		mediaPlayers: [],
		liveAudio: [],
		stickyLayers: []
	}

	// Load values injected by core, not via manifest
	for (const id of CORE_INJECTED_KEYS) {
		// Use the key as the value. Good enough for now
		objectPath.set(config.studio, id, id)
	}

	// Load the config
	applyToConfig(context, config.studio, studioConfigManifest, 'Studio', {})
	// applyToConfig(context, config.showStyle, showStyleConfigManifest, 'ShowStyle', {})

	config.sources = parseSources(config.studio)
	config.mediaPlayers = parseMediaPlayers(config.studio)
	config.liveAudio = getLiveAudioLayers(config.studio)
	config.stickyLayers = getStickyLayers(config.studio, config.liveAudio)

	return config
}
*/

export function parseConfig(rawConfig: IBlueprintConfig): OfftubeStudioBlueprintConfig {
	const config: OfftubeStudioBlueprintConfig = {
		studio: rawConfig as any,
		// showStyle: {} as any,
		sources: [],
		mediaPlayers: [],
		liveAudio: [],
		stickyLayers: []
	}
	config.sources = parseSources(config.studio)
	config.mediaPlayers = parseMediaPlayers(config.studio)
	config.liveAudio = getLiveAudioLayers(config.studio)
	config.stickyLayers = getStickyLayers(config.studio, config.liveAudio)

	return config
}
