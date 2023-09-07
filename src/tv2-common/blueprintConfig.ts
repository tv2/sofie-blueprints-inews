import { IBlueprintShowStyleVariant, TableConfigItemValue, TSR } from 'blueprints-integration'
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
	_id: string
	INewsName: string
	INewsStyleColumn: string
	/** Name of the Viz template triggering design change. For HTML graphics it corresponds to a CSS class. */
	VizTemplate: string
}

export interface TableConfigItemGfxShowMapping {
	Design: { value: string; label: string }
	GfxSetup: Array<{ value: string; label: string }>
	Schema: Array<{ value: string; label: string }>
}

export interface TableConfigItemGfxDefaults {
	DefaultSetupName: { value: string; label: string }
	DefaultSchema: { value: string; label: string }
	DefaultDesign: { value: string; label: string }
}

export interface TableConfigItemAdLibTransitions {
	Transition: string
}

export interface TableConfigGfxSchema {
	_id: string
	GfxSchemaTemplatesName: string
	INewsSkemaColumn: string
	VizTemplate: string
	CasparCgDesignValues: string
}

export interface TableConfigGfxSetup {
	_id: string
	Name: string
	HtmlPackageFolder: string
	OvlShowName?: string
	FullShowName?: string
}

export interface CasparCgGfxDesignValues {
	name: string
	properties: Record<string, string>
	backgroundLoop: string
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
		useAudioFilterSyntax?: boolean
	}
}

export interface SourceMapping {
	cameras: SourceInfo[]
	lives: SourceInfo[]
	feeds: SourceInfo[]
	replays: SourceInfo[]
}

export interface VizShowKeyframes {
	overlay: NonNullable<TSR.TimelineObjVIZMSEElementInternal['keyframes']>
	full: NonNullable<TSR.TimelineObjVIZMSEElementInternal['keyframes']>
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
	GfxShowMapping: TableConfigItemGfxShowMapping[]
	GfxDefaults: TableConfigItemGfxDefaults[]
}

export interface TV2BlueprintConfigBase<StudioConfig extends TV2StudioConfigBase>
	extends TV2StudioBlueprintConfigBase<StudioConfig> {
	showStyle: TV2ShowstyleBlueprintConfigBase
	selectedGfxSetup: TableConfigGfxSetup
	vizShowKeyframes: VizShowKeyframes
	variants: TV2ShowStyleVariant[]
}

export type TV2StudioConfig = TV2StudioBlueprintConfigBase<TV2StudioConfigBase>

export type TV2ShowStyleConfig = TV2BlueprintConfigBase<TV2StudioConfigBase>

export interface TV2ShowStyleVariantBlueprintConfig {
	GfxDefaults?: TableConfigItemGfxDefaults[] // @todo: this should remain optional until Core allows making it required
}

export type TV2ShowStyleVariant = Omit<IBlueprintShowStyleVariant, 'blueprintConfig'> & {
	blueprintConfig: TV2ShowStyleVariantBlueprintConfig
}
