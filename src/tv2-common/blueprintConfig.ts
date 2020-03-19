import { SourceInfo } from './sources'

export type MediaPlayerConfig = Array<{ id: string; val: string }>

export interface TV2StudioConfigBase {
	MaximumKamDisplayDuration: number
}

export interface TV2StudioBlueprintConfigBase<StudioConfig extends TV2StudioConfigBase> {
	studio: StudioConfig
	sources: SourceInfo[]
	mediaPlayers: MediaPlayerConfig // Atem Input Ids
}

export interface TV2ShowstyleBlueprintConfigBase {
	CasparCGLoadingClip: string
}

export interface TV2BlueprintConfigBase<StudioConfig extends TV2StudioConfigBase>
	extends TV2StudioBlueprintConfigBase<StudioConfig> {
	showStyle: TV2ShowstyleBlueprintConfigBase
}
