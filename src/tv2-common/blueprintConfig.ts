import {
	TableConfigItemSourceMappingWithSisyfos,
	TableConfigItemSourceMappingWithSisyfosAndKeepAudio
} from 'tv2-common'
import { DVEConfigInput } from './helpers'
import { SourceInfo } from './sources'

export type MediaPlayerConfig = Array<{ id: string; val: string }>

export interface TableConfigItemBreakers {
	BreakerName: string
	ClipName: string
	Duration: number
	StartAlpha: number
	EndAlpha: number
	Autonext: boolean
	LoadFirstFrame: boolean
}

export interface TV2StudioConfigBase {
	MaximumPartDuration: number
	DefaultPartDuration: number
	CasparPrerollDuration: number
	ClipSourcePath: string
	JingleSourcePath: string
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
	StudioMics: string[]
	SourcesRM: TableConfigItemSourceMappingWithSisyfosAndKeepAudio[]
	SourcesSkype: TableConfigItemSourceMappingWithSisyfos[]
	SourcesCam: TableConfigItemSourceMappingWithSisyfos[]
}

export interface TV2StudioBlueprintConfigBase<StudioConfig extends TV2StudioConfigBase> {
	studio: StudioConfig
	sources: SourceInfo[]
	mediaPlayers: MediaPlayerConfig // Atem Input Ids
	liveAudio: string[]
	stickyLayers: string[]
}

export interface TV2ShowstyleBlueprintConfigBase {
	DefaultTemplateDuration: number
	CasparCGLoadingClip: string
	BreakerConfig: TableConfigItemBreakers[]
	DVEStyles: DVEConfigInput[]
}

export interface TV2BlueprintConfigBase<StudioConfig extends TV2StudioConfigBase>
	extends TV2StudioBlueprintConfigBase<StudioConfig> {
	showStyle: TV2ShowstyleBlueprintConfigBase
}
