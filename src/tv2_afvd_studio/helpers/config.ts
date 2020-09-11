import { IBlueprintConfig } from 'tv-automation-sofie-blueprints-integration'
import {
	getLiveAudioLayers,
	getStickyLayers,
	MediaPlayerConfig,
	SourceInfo,
	TableConfigItemSourceMapping,
	TableConfigItemSourceMappingWithSisyfos,
	TV2StudioConfigBase
} from 'tv2-common'
import * as _ from 'underscore'
import { ShowStyleConfig } from '../../tv2_afvd_showstyle/helpers/config'
import { parseMediaPlayers, parseSources } from './sources'

export interface BlueprintConfig {
	studio: StudioConfig
	sources: SourceInfo[]
	showStyle: ShowStyleConfig
	mediaPlayers: MediaPlayerConfig // Atem Input Ids
	liveAudio: string[]
	stickyLayers: string[]
}

export interface StudioConfig extends TV2StudioConfigBase {
	// Injected by core
	SofieHostURL: string

	// Must override

	// Intended overrides
	MediaFlowId: string
	ClipFileExtension: string
	NetworkBasePath: string // @ todo: hacky way of passing info, should be implied by media manager or something
	JingleBasePath: string
	ClipBasePath: string
	SourcesDelayedPlayback: TableConfigItemSourceMappingWithSisyfos[]
	ABMediaPlayers: TableConfigItemSourceMapping[]
	ABPlaybackDebugLogging: boolean
	StudioMics: string[]
	AtemSource: {
		DSK1F: number
		DSK1K: number
		ServerC: number // Studio
		JingleFill: number
		JingleKey: number
		SplitArtF: number // Atem MP1 Fill
		SplitArtK: number // Atem MP1 Key
		FullFrameGrafikBackground: number

		Default: number
		MixMinusDefault: number
		Continuity: number
	}

	AtemSettings: {
		VizClip: number
		VizGain: number
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
	PilotPrerollDuration: number
	PilotKeepaliveDuration: number
	PilotCutToMediaPlayer: number
	PilotOutTransitionDuration: number
	PreventOverlayWithFull: boolean
	ATEMDelay: number
}

/*
export function defaultStudioConfig(context: NotesContext): BlueprintConfig {
	const config: BlueprintConfig = {
		studio: {} as any,
		showStyle: {} as any,
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

export function parseConfig(rawConfig: IBlueprintConfig): any {
	const config: BlueprintConfig = {
		studio: rawConfig as any,
		showStyle: {} as any,
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
