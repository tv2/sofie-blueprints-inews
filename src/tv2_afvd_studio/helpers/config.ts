import { IBlueprintConfig, IStudioContext } from '@sofie-automation/blueprints-integration'
import {
	DSKConfig,
	getLiveAudioLayers,
	getStickyLayers,
	MediaPlayerConfig,
	parseDSK,
	SourceInfo,
	TableConfigItemDSK,
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
	dsk: DSKConfig
}

export interface StudioConfig extends TV2StudioConfigBase {
	// Injected by core
	SofieHostURL: string

	SourcesDelayedPlayback: TableConfigItemSourceMappingWithSisyfos[]
	ABMediaPlayers: TableConfigItemSourceMapping[]
	ABPlaybackDebugLogging: boolean
	StudioMics: string[]
	AtemSource: {
		ServerC: number // Studio
		JingleFill: number
		JingleKey: number
		SplitArtF: number // Atem MP1 Fill
		SplitArtK: number // Atem MP1 Key
		FullFrameGrafikBackground: number
		DSK: TableConfigItemDSK[]

		Default: number
		MixMinusDefault: number
		Continuity: number
	}

	AtemSettings: {
		VizClip: number
		VizGain: number
		CCGClip: number
		CCGGain: number

		MP1Baseline: {
			Clip: number
			Loop: boolean
			Playing: boolean
		}
	}
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

export const defaultDSK: TableConfigItemDSK = {
	Number: 1,
	Fill: 21,
	Key: 34,
	Toggle: true,
	DefaultOn: true,
	FullSource: true
}

export function parseConfig(rawConfig: IBlueprintConfig): any {
	const studioConfig = (rawConfig as unknown) as StudioConfig
	const dsk = parseDSK(studioConfig, defaultDSK)
	const config: BlueprintConfig = {
		studio: studioConfig,
		showStyle: {} as any,
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

export function getStudioConfig(context: IStudioContext): BlueprintConfig {
	return context.getStudioConfig() as BlueprintConfig
}
