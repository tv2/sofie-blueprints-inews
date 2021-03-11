import { TableConfigItemValue } from '@sofie-automation/blueprints-integration'
import {
	TableConfigItemDSK,
	TableConfigItemSourceMappingWithSisyfos,
	TableConfigItemSourceMappingWithSisyfosAndKeepAudio
} from 'tv2-common'
import { DVEConfigInput } from './helpers'
import { SourceInfo } from './sources'

export type MediaPlayerConfig = Array<{ id: string; val: string }>
export type DSKConfig = { 1: TableConfigItemDSK } & { [num: number]: TableConfigItemDSK }

export interface TableConfigItemBreakers {
	BreakerName: string
	ClipName: string
	Duration: number
	StartAlpha: number
	EndAlpha: number
	Autonext: boolean
	LoadFirstFrame: boolean
}

export interface TableConfigItemGFXTemplates {
	VizTemplate: string
	SourceLayer: string
	LayerMapping: string
	INewsCode: string
	INewsName: string
	VizDestination: string
	OutType: string
	IsDesign: boolean
}

export interface TableConfigItemAdLibTransitions {
	Transition: string
}

export interface TV2StudioConfigBase {
	MaximumPartDuration: number
	DefaultPartDuration: number
	CasparPrerollDuration: number

	/** MEDIA WORKFLOWS */
	/* Clip */
	ClipNetworkBasePath: string
	ClipMediaFlowId: string
	ClipFileExtension: string
	ClipFolder?: string
	ClipIgnoreStatus: boolean
	/* Jingle */
	JingleNetworkBasePath: string
	JingleMediaFlowId: string
	JingleFileExtension: string
	JingleFolder?: string
	JingleIgnoreStatus: boolean
	/* Graphic */
	GraphicFileExtension: string
	GraphicMediaFlowId: string
	GraphicNetworkBasePath: string
	GraphicFolder?: string
	GraphicIgnoreStatus: boolean

	ABPlaybackDebugLogging: boolean
	AtemSource: {
		Default: number
		SplitArtF: number
		SplitArtK: number
		JingleFill: number
		JingleKey: number
		DSK: TableConfigItemDSK[]
	}
	AtemSettings: {
		CCGClip: number
		CCGGain: number
	}
	StudioMics: string[]
	SourcesRM: TableConfigItemSourceMappingWithSisyfosAndKeepAudio[]
	SourcesSkype: TableConfigItemSourceMappingWithSisyfos[]
	SourcesCam: TableConfigItemSourceMappingWithSisyfos[]
	PreventOverlayWithFull?: boolean
	ServerPostrollDuration: number
	GraphicsType: 'HTML' | 'VIZ'
	HTMLGraphics: {
		GraphicURL: string
		TransitionSettings: {
			wipeRate: number
			borderSoftness: number
			loopOutTransitionDuration: number
		}
		KeepAliveDuration: number
	}
	VizPilotGraphics: {
		KeepAliveDuration: number
		PrerollDuration: number
		OutTransitionDuration: number
		CutToMediaPlayer: number
	}

	AudioBedSettings: {
		fadeIn: number
		fadeOut: number
		volume: number
	}
}

export interface TV2StudioBlueprintConfigBase<StudioConfig extends TV2StudioConfigBase> {
	studio: StudioConfig
	sources: SourceInfo[]
	mediaPlayers: MediaPlayerConfig // Atem Input Ids
	liveAudio: string[]
	stickyLayers: string[]
	dsk: DSKConfig
}

export interface TV2ShowstyleBlueprintConfigBase {
	DefaultTemplateDuration: number
	CasparCGLoadingClip: string
	BreakerConfig: TableConfigItemBreakers[]
	DVEStyles: DVEConfigInput[]
	GFXTemplates: TableConfigItemGFXTemplates[]
	Transitions: TableConfigItemAdLibTransitions[]
	ShowstyleTransition: string
	MakeAdlibsForFulls: boolean
	LYDConfig: TableConfigItemValue
}

export interface TV2BlueprintConfigBase<StudioConfig extends TV2StudioConfigBase>
	extends TV2StudioBlueprintConfigBase<StudioConfig> {
	showStyle: TV2ShowstyleBlueprintConfigBase
}

export type TV2BlueprintConfig = TV2BlueprintConfigBase<TV2StudioConfigBase>
