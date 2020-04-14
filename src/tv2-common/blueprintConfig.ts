import { TableConfigItemValue } from 'tv-automation-sofie-blueprints-integration'
import { DVEConfigInput } from './helpers'
import { SourceInfo } from './sources'

export type MediaPlayerConfig = Array<{ id: string; val: string }>

export interface TV2StudioConfigBase {
	MaximumKamDisplayDuration: number
	CasparPrerollDuration: number
	ClipSourcePath: string
	ClipFileExtension: string
	MediaFlowId: string
	ABPlaybackDebugLogging: boolean
	AtemSource: {
		Default: number
		SplitArtF: number
		SplitArtK: number
		DSK1F: number
		DSK1K: number
		JingleFill: number
		JingleKey: number
	}
	AtemSettings: {
		CCGClip: number
		CCGGain: number
	}
}

export interface TV2StudioBlueprintConfigBase<StudioConfig extends TV2StudioConfigBase> {
	studio: StudioConfig
	sources: SourceInfo[]
	mediaPlayers: MediaPlayerConfig // Atem Input Ids
	liveAudio: string[]
	stickyLayers: string[]
}

export interface TV2ShowstyleBlueprintConfigBase {
	CasparCGLoadingClip: string
	BreakerConfig: TableConfigItemValue
	DVEStyles: DVEConfigInput[]
}

export interface TV2BlueprintConfigBase<StudioConfig extends TV2StudioConfigBase>
	extends TV2StudioBlueprintConfigBase<StudioConfig> {
	showStyle: TV2ShowstyleBlueprintConfigBase
}
