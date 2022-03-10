import { TableConfigItemValue } from '@tv2media/blueprints-integration'
import { TableConfigItemDSK, TableConfigItemSourceMappingWithSisyfos } from 'tv2-common'
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
	/* AudioBed */
	AudioBedFileExtension: string
	AudioBedMediaFlowId: string
	AudioBedNetworkBasePath: string
	AudioBedFolder?: string
	AudioBedIgnoreStatus: boolean
	/* DVE */
	DVEFileExtension: string
	DVEMediaFlowId: string
	DVENetworkBasePath: string
	DVEFolder?: string
	DVEIgnoreStatus: boolean

	ABPlaybackDebugLogging: boolean
	AtemSource: {
		Default: number
		SplitArtF: number
		SplitArtK: number
		DSK: TableConfigItemDSK[]
	}
	AtemSettings: {}
	StudioMics: string[]
	SourcesRM: TableConfigItemSourceMappingWithSisyfos[]
	SourcesFeed: TableConfigItemSourceMappingWithSisyfos[]
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
		FullGraphicBackground: number
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
	dsk: TableConfigItemDSK[]
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
