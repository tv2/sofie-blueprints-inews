import { TableConfigItemValue } from 'blueprints-integration'
import {
	DVEConfigInput,
	SourceInfo,
	SwitcherType,
	TableConfigItemDSK,
	TableConfigItemSourceMappingWithSisyfos
} from 'tv2-common'

export type MediaPlayerConfig = Array<{ id: string; val: string }>

export interface TableConfigItemBreaker {
	BreakerName: string
	ClipName: string
	Duration: number
	StartAlpha: number
	EndAlpha: number
	Autonext: boolean
	LoadFirstFrame: boolean
}

export interface TableConfigItemGfxTemplate {
	/** Name of the Viz Template. For HTML graphics it's the Graphic name. */
	VizTemplate: string
	SourceLayer: string
	LayerMapping: string
	INewsCode: string
	INewsName: string
	VizDestination: string
	OutType: string
}

export interface TableConfigItemGfxDesignTemplate {
	INewsName: string
	INewsStyleColumn: string
	/** Name of the Viz template trigering design change. For HTML graphics it coresponds to a CSS class. */
	VizTemplate: string
}

export interface TableConfigItemGfxShowMapping {
	Design: string
	GraphicsSetup: string[]
	Schema: string[]
}

export interface TableConfigItemAdLibTransitions {
	Transition: string
}

export interface TableConfigGfxSchema {
	SchemaName: string
	INewsSkemaColumn: string
	VizTemplate: string
}

export interface TableConfigGfxSetup {
	Name: string
	HtmlPackageFolder: string
	OvlShowName?: string
	FullShowName?: string
}

export interface ProcessedStudioConfig {
	sources: SourceMapping
	mediaPlayers: MediaPlayerConfig // Atem Input Ids
	dsk: TableConfigItemDSK[]
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
	SwitcherType: SwitcherType
	SwitcherSource: {
		Default: number
		SplitArtFill: number
		SplitArtKey: number
		DSK: TableConfigItemDSK[]
		Dip: number
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
		CleanFeedPrerollDuration: number
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

export interface SourceMapping {
	cameras: SourceInfo[]
	lives: SourceInfo[]
	feeds: SourceInfo[]
	replays: SourceInfo[]
}

export interface TV2StudioBlueprintConfigBase<StudioConfig extends TV2StudioConfigBase> {
	studio: StudioConfig
	sources: SourceMapping
	mediaPlayers: MediaPlayerConfig // Atem Input Ids
	dsk: TableConfigItemDSK[]
}

export interface TV2ShowstyleBlueprintConfigBase {
	DefaultTemplateDuration: number
	CasparCGLoadingClip: string
	BreakerConfig: TableConfigItemBreaker[]
	DVEStyles: DVEConfigInput[]
	GfxTemplates: TableConfigItemGfxTemplate[]
	GfxDesignTemplates: TableConfigItemGfxDesignTemplate[]
	Transitions: TableConfigItemAdLibTransitions[]
	ShowstyleTransition: string
	MakeAdlibsForFulls: boolean
	LYDConfig: TableConfigItemValue
	GfxSchemaTemplates: TableConfigGfxSchema[]
	GfxSetups: TableConfigGfxSetup[]
	SelectedGfxSetupName: string
}

export interface TV2BlueprintConfigBase<StudioConfig extends TV2StudioConfigBase>
	extends TV2StudioBlueprintConfigBase<StudioConfig> {
	showStyle: TV2ShowstyleBlueprintConfigBase
	selectedGfxSetup: TableConfigGfxSetup
}

export type TV2StudioConfig = TV2StudioBlueprintConfigBase<TV2StudioConfigBase>

export type TV2ShowStyleConfig = TV2BlueprintConfigBase<TV2StudioConfigBase>
