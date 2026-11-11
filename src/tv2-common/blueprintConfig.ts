import { TableConfigItemValue } from 'blueprints-integration'
import {
	DVEConfigInput,
	SourceInfo,
	SwitcherInput,
	SwitcherType,
	TableConfigItemDSK,
	TableConfigItemSourceMappingWithSisyfos
} from 'tv2-common'

export type MediaPlayerConfig = Array<{ id: string; val: string }>

export interface TableConfigItemBreakers {
	BreakerName: string
	ClipName: string
	Duration: number
	StartAlpha: number
	EndAlpha: number
	Autonext: boolean
	LoadFirstFrame: boolean
	EnableUnderlyingTransition?: boolean
	UnderlyingTransition?: string | ConfigManifestSelectValue
	UnderlyingTransitionStartFrame?: string | number
	UnderlyingTransitionDuration?: string | number
}

export interface TableConfigItemUnderlyingTransition {
	_id?: string
	Name: string
	Type: 'Mix' | 'Dot wipe'
	BorderWidth?: number
	BorderInput?: number
	Symmetry?: number
	BorderSoftness?: number
	XPosition?: number
	YPosition?: number
	ReverseDirection?: boolean
	FlipFlop?: boolean
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

export interface TableConfigItemOverlayShowMapping {
	Design: string
	GraphicsSetup: string[]
	Schema: string[]
}

export interface TableConfigItemAdLibTransitions {
	Transition: string
	WipeDirection?: string
}

export interface TableConfigSchema {
	schemaName: string
	designIdentifier: string
	vizTemplateName: string
	casparCgDveBgScene: string
}

export interface TableConfigGraphicsSetup {
	_id?: string
	Name: string
	HtmlPackageFolder: string
	OvlShowName?: string
	FullShowName?: string
}

export interface ConfigManifestSelectValue {
	value: string
	label: string
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
		Default: SwitcherInput
		SplitArtFill: SwitcherInput
		SplitArtKey: SwitcherInput
		SplitBackground?: SwitcherInput
		DSK: TableConfigItemDSK[]
		Dip: SwitcherInput
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
		FullGraphicBackground: SwitcherInput
	}

	AudioBedSettings: {
		fadeIn: number
		fadeOut: number
		volume: number
		useAudioFilterSyntax?: boolean
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
	BreakerConfig: TableConfigItemBreakers[]
	UnderlyingTransitions?: TableConfigItemUnderlyingTransition[]
	DVEStyles: DVEConfigInput[]
	GFXTemplates: TableConfigItemGfxTemplate[]
	GfxDesignTemplates: TableConfigItemGfxDesignTemplate[]
	Transitions: TableConfigItemAdLibTransitions[]
	ShowstyleTransition: string
	DefaultWipeDirection?: string
	MakeAdlibsForFulls: boolean
	LYDConfig: TableConfigItemValue
	SchemaConfig: TableConfigSchema[]
	GraphicsSetups: TableConfigGraphicsSetup[]
	SelectedGraphicsSetupName: string | ConfigManifestSelectValue
}

export interface TV2BlueprintConfigBase<StudioConfig extends TV2StudioConfigBase>
	extends TV2StudioBlueprintConfigBase<StudioConfig> {
	showStyle: TV2ShowstyleBlueprintConfigBase
	selectedGraphicsSetup: TableConfigGraphicsSetup
}

export type TV2StudioConfig = TV2StudioBlueprintConfigBase<TV2StudioConfigBase>

export type TV2ShowStyleConfig = TV2BlueprintConfigBase<TV2StudioConfigBase>

export type TV2BlueprintConfig = TV2ShowStyleConfig
