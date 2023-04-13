import { literal, parseMapStr, SwitcherType } from 'tv2-common'
import { defaultDSKConfig, StudioConfig } from '../../tv2_afvd_studio/helpers/config'
import { GalleryShowStyleConfig, GalleryTableConfigGfxSetup } from '../helpers/config'
import { DefaultBreakerConfig } from './breakerConfigDefault'
import { DefaultGrafikConfig } from './grafikConfigDefault'

function getSisyfosLayers(configName: string, id: string): string[] {
	switch (configName) {
		case 'SourcesCam':
			return []
		case 'SourcesRM':
		case 'SourcesFeed':
			return ['sisyfos_source_live_' + id]
		case 'SourcesDelayedPlayback':
			return ['sisyfos_source_' + id.toLowerCase().replace(' ', '_')]
	}

	return []
}

// TODO: Broken
function prepareConfig(
	conf: string,
	configName: string,
	studioMics: boolean,
	wantsToPersistAudio?: boolean
): Array<{
	SourceName: string
	SwitcherSource: number
	SisyfosLayers: string[]
	StudioMics: boolean
	wantsToPersistAudio: boolean
}> {
	return parseMapStr(undefined, conf, true).map((c) => {
		return {
			SourceName: c.id,
			SwitcherSource: c.val,
			SisyfosLayers: getSisyfosLayers(configName, c.id),
			StudioMics: studioMics,
			wantsToPersistAudio: wantsToPersistAudio ?? false
		}
	})
}

export const OVL_SHOW_NAME = 'ovl-show-id'
export const FULL_SHOW_NAME = 'full-show-id'
export const DEFAULT_GFX_SETUP: GalleryTableConfigGfxSetup = {
	_id: 'SomeId',
	Name: 'SomeProfile',
	VcpConcept: 'SomeConcept',
	OvlShowName: OVL_SHOW_NAME,
	FullShowName: FULL_SHOW_NAME,
	HtmlPackageFolder: 'html-package-folder'
}

// in here will be some mock configs that can be referenced paired with ro's for the tests
export const defaultStudioConfig: StudioConfig = {
	SwitcherType: SwitcherType.ATEM,
	ClipMediaFlowId: '',
	GraphicMediaFlowId: '',
	JingleMediaFlowId: '',
	AudioBedMediaFlowId: '',
	DVEMediaFlowId: '',
	JingleFileExtension: '',
	ClipFileExtension: 'mxf',
	GraphicFileExtension: '.png',
	AudioBedFileExtension: '.wav',
	DVEFileExtension: '.png',
	ClipNetworkBasePath: '/',
	GraphicNetworkBasePath: 'networkshare/somefolder',
	JingleNetworkBasePath: '/',
	AudioBedNetworkBasePath: '/',
	DVENetworkBasePath: '/',
	ClipFolder: '',
	GraphicFolder: 'pilot-images',
	JingleFolder: '',
	AudioBedFolder: '',
	DVEFolder: '',
	GraphicIgnoreStatus: false,
	JingleIgnoreStatus: false,
	ClipIgnoreStatus: false,
	AudioBedIgnoreStatus: false,
	DVEIgnoreStatus: false,
	MaximumPartDuration: 10000,
	DefaultPartDuration: 4000,
	ServerPostrollDuration: 3000,
	PreventOverlayWithFull: true,
	SourcesCam: prepareConfig(
		'1:1,2:2,3:3,4:4,5:5,1S:6,2S:7,3S:8,4S:9,5S:10,X8:13,HVID:14,AR:16,CS1:17,CS2:18,CS3:19,CS4:20,CS5:21,CS 1:17,CS 2:18,CS 3:19,CS 4:20,CS 5:21,SORT:22,11:11,12:12,13:13,14:14,15:15',
		'SourcesCam',
		true
	),
	// TODO: prepareConfig is legacy code, refactor when refactoring FindSourceInfo
	SourcesRM: prepareConfig('1:1,2:2,3:3,4:4,5:5,6:6,7:7,8:8,9:9,10:10', 'SourcesRM', false, true),
	SourcesFeed: prepareConfig('1:1,2:2,3:3,4:4,5:5,6:6,7:7,8:8,9:9,10:10', 'SourcesFeed', false, true),
	SourcesReplay: prepareConfig('EVS 1:5,EVS 2:5,EPSIO:5', 'SourcesDelayedPlayback', false),
	StudioMics: [
		{ value: 'sisyfos_source_Host_1_st_a', label: 'Host1' },
		{ value: 'sisyfos_source_Host_2_st_a', label: 'Host2' },
		{ value: 'sisyfos_source_Guest_1_st_a', label: 'Guest1' },
		{ value: 'sisyfos_source_Guest_2_st_a', label: 'Guest2' },
		{ value: 'sisyfos_source_Guest_3_st_a', label: 'Guest3' },
		{ value: 'sisyfos_source_Guest_4_st_a', label: 'Guest4' }
	],
	SwitcherSource: {
		MixMinusDefault: 2,
		DSK: defaultDSKConfig,
		SplitArtFill: 30,
		SplitArtKey: 32,
		Default: 2001,
		Continuity: 2002,
		Dip: 2002
	},
	SofieHostURL: '',
	ABMediaPlayers: [
		{ SourceName: '1', SwitcherSource: 1 },
		{ SourceName: '2', SwitcherSource: 2 }
	],
	ABPlaybackDebugLogging: false,
	AtemSettings: {
		MP1Baseline: {
			Clip: 0,
			Loop: true,
			Playing: true
		}
	},
	AudioBedSettings: {
		fadeIn: 1000,
		fadeOut: 1000,
		volume: 80
	},
	CasparPrerollDuration: 280,
	GraphicsType: 'VIZ',
	VizPilotGraphics: {
		KeepAliveDuration: 700,
		PrerollDuration: 2000,
		OutTransitionDuration: 280,
		CutToMediaPlayer: 1500,
		FullGraphicBackground: 36,
		CleanFeedPrerollDuration: 320
	},
	HTMLGraphics: {
		GraphicURL: 'E:/somepath',
		KeepAliveDuration: 1000,
		TransitionSettings: {
			wipeRate: 20,
			borderSoftness: 7500,
			loopOutTransitionDuration: 120
		}
	}
}

export const defaultShowStyleConfig: GalleryShowStyleConfig = {
	...defaultStudioConfig,
	DefaultTemplateDuration: 4,
	CasparCGLoadingClip: 'LoadingLoop',
	DVEStyles: [
		{
			DVEName: 'sommerfugl',
			DVEInputs: '1:INP1;2:INP2',
			DVEJSON:
				'{"boxes":{"0":{"enabled":true,"source":11,"x":-800,"y":25,"size":550,"cropped":true,"cropTop":0,"cropBottom":150,"cropLeft":0,"cropRight":1500},"1":{"enabled":true,"source":1,"x":800,"y":25,"size":550,"cropped":true,"cropTop":160,"cropBottom":150,"cropLeft":0,"cropRight":0},"2":{"enabled":false,"source":2001,"x":0,"y":0,"size":1000,"cropped":false,"cropTop":0,"cropBottom":0,"cropLeft":0,"cropRight":0},"3":{"enabled":false,"source":2001,"x":0,"y":0,"size":1000,"cropped":false,"cropTop":0,"cropBottom":0,"cropLeft":0,"cropRight":0}},"index":0,"properties":{"artFillSource":30,"artCutSource":32,"artOption":1,"artPreMultiplied":true,"artClip":0,"artGain":0,"artInvertKey":false},"border":{"borderEnabled":false,"borderBevel":0,"borderOuterWidth":0,"borderInnerWidth":0,"borderOuterSoftness":0,"borderInnerSoftness":0,"borderBevelSoftness":0,"borderBevelPosition":0,"borderHue":0,"borderSaturation":0,"borderLuma":0,"borderLightSourceDirection":0,"borderLightSourceAltitude":10}}',
			DVEGraphicsTemplateJSON:
				'{"common":{"font-family":"Alright Sans LT","font-weight":"bold","font-variant":"italic","color":"#ffffff","font-size":"35px","background":"rgba(0, 0, 0, 0.5)","height":"45px","line-height":"48px","padding-left":"13px","padding-right":"13px"},"locator1":{"left":"120px","top":"825px"},"locator2":{"right":"100px","top":"825px"}}',
			DVEGraphicsKey: 'dve/sommerfuglK',
			DVEGraphicsFrame: 'dve/sommerfugl'
		},
		{
			DVEName: 'morbarn',
			DVEInputs: '3:INP1;2:INP2',
			DVEJSON:
				'{"boxes":{"0":{"enabled":false,"source":12,"x":-500,"y":140,"size":760,"cropped":true,"cropTop":0,"cropBottom":0,"cropLeft":0,"cropRight":1000},"1":{"enabled":true,"source":2001,"x":1100,"y":-245,"size":350,"cropped":true,"cropTop":500,"cropBottom":0,"cropLeft":1600,"cropRight":0},"2":{"enabled":true,"source":2,"x":-460,"y":130,"size":760,"cropped":true,"cropTop":0,"cropBottom":0,"cropLeft":0,"cropRight":1230},"3":{"enabled":false,"source":2001,"x":0,"y":0,"size":1000,"cropped":true,"cropTop":0,"cropBottom":119,"cropLeft":0,"cropRight":0}},"index":0,"properties":{"artFillSource":30,"artCutSource":32,"artOption":1,"artPreMultiplied":true,"artClip":0,"artGain":0,"artInvertKey":false},"border":{"borderEnabled":false,"borderBevel":0,"borderOuterWidth":0,"borderInnerWidth":0,"borderOuterSoftness":0,"borderInnerSoftness":0,"borderBevelSoftness":0,"borderBevelPosition":0,"borderHue":0,"borderSaturation":0,"borderLuma":0,"borderLightSourceDirection":0,"borderLightSourceAltitude":10}}',
			DVEGraphicsTemplateJSON:
				'{"common":{"font-family":"Alright Sans LT","font-weight":"bold","font-variant":"italic","color":"#ffffff","font-size":"35px","background":"rgba(0, 0, 0, 0.5)","height":"45px","line-height":"48px","padding-left":"13px","padding-right":"13px"},"locator1":{"left":"120px","top":"880px"},"locator2":{"left":"1800px","top":"880px"}}',
			DVEGraphicsKey: 'dve/morbarnK',
			DVEGraphicsFrame: 'dve/morbarn'
		},
		{
			DVEName: 'barnmor',
			DVEInputs: '2:INP2;1:INP1',
			DVEJSON:
				'{"boxes":{"0":{"enabled":true,"source":13,"x":-1100,"y":-250,"size":350,"cropped":true,"cropTop":0,"cropBottom":530,"cropLeft":0,"cropRight":1700},"1":{"enabled":true,"source":3,"x":500,"y":130,"size":760,"cropped":true,"cropTop":70,"cropBottom":0,"cropLeft":770,"cropRight":0},"2":{"enabled":false,"source":2001,"x":-460,"y":130,"size":760,"cropped":true,"cropTop":0,"cropBottom":0,"cropLeft":0,"cropRight":1230},"3":{"enabled":false,"source":2001,"x":0,"y":0,"size":1000,"cropped":false,"cropTop":0,"cropBottom":0,"cropLeft":0,"cropRight":0}},"index":0,"properties":{"artFillSource":30,"artCutSource":32,"artOption":1,"artPreMultiplied":true,"artClip":0,"artGain":0,"artInvertKey":false},"border":{"borderEnabled":false,"borderBevel":0,"borderOuterWidth":0,"borderInnerWidth":0,"borderOuterSoftness":0,"borderInnerSoftness":0,"borderBevelSoftness":0,"borderBevelPosition":0,"borderHue":0,"borderSaturation":0,"borderLuma":0,"borderLightSourceDirection":0,"borderLightSourceAltitude":10}}',
			DVEGraphicsTemplateJSON:
				'{"common":{"font-family":"Alright Sans LT","font-weight":"bold","font-variant":"italic","color":"#ffffff","font-size":"35px","background":"rgba(0, 0, 0, 0.5)","height":"45px","line-height":"48px","padding-left":"13px","padding-right":"13px"},"locator1":{"left":"120px","top":"880px"},"locator2":{"left":"1800px","top":"880px"}}',
			DVEGraphicsKey: 'dve/barnmorK',
			DVEGraphicsFrame: 'dve/barnmor'
		}
	],
	WipesConfig: [],
	BreakerConfig: DefaultBreakerConfig(),
	MakeAdlibsForFulls: true,
	GfxTemplates: [
		...DefaultGrafikConfig(),
		...literal<GalleryShowStyleConfig['GfxTemplates']>([
			{
				INewsCode: 'GRAFIK',
				INewsName: 'wall',
				VizTemplate: 'VCP',
				VizDestination: 'WALL1',
				OutType: 'O',
				SourceLayer: 'studio0_wall_graphics',
				LayerMapping: 'graphic_wall'
			},
			{
				INewsCode: 'GRAFIK',
				INewsName: 'OVL',
				VizTemplate: 'VCP',
				VizDestination: 'OVL1',
				OutType: 'O',
				SourceLayer: 'studio0_overlay',
				LayerMapping: 'graphic_overlay'
			},
			{
				INewsCode: '#kg',
				INewsName: 'MERGE',
				VizTemplate: 'VCP',
				VizDestination: 'OVL1',
				OutType: 'O',
				SourceLayer: 'studio0_overlay',
				LayerMapping: 'graphic_overlay'
			},
			{
				INewsCode: 'kg',
				INewsName: 'tlftoptlive',
				VizTemplate: 'tlftoptlive',
				VizDestination: 'OVL1',
				OutType: 'S',
				SourceLayer: 'studio0_graphicsTop',
				LayerMapping: 'graphic_overlay_topt'
			}
		])
	],
	GfxDesignTemplates: [
		{
			INewsName: 'DESIGN_FODBOLD_22',
			INewsStyleColumn: '',
			VizTemplate: 'DESIGN_FODBOLD_22'
		}
	],
	LYDConfig: [
		{
			_id: '',
			iNewsName: 'SN_intro',
			FileName: 'louder',
			INewsName: 'SN_Intro',
			FadeIn: 25,
			FadeOut: 25
		},
		{
			_id: '97Sa66cJbLWCDtKb2',
			iNewsName: 'SN_soundbed_1',
			FileName: 'SN Soundbed 1',
			FadeIn: 0,
			FadeOut: 15,
			INewsName: 'SN_SOUNDBED_INTRO'
		},
		{
			_id: '2gGAj3K6hqKjDxu4R',
			iNewsName: 'SN_SOUNDBED_INTRO',
			FileName: 'SN Soundbed Intro',
			FadeIn: 0,
			FadeOut: 50,
			INewsName: 'SN_soundbed_1'
		},
		{
			_id: 'bzt2SLic6QgCXbabM',
			INewsName: 'ATP_soundbed',
			FileName: 'ATP Soundbed',
			FadeIn: 0,
			FadeOut: 0
		}
	],
	GfxSetups: [DEFAULT_GFX_SETUP],
	Transitions: [{ Transition: '1' }, { Transition: '2' }],
	ShowstyleTransition: 'CUT',
	GfxSchemaTemplates: [],
	GfxShowMapping: [],
	GfxDefaults: [
		{
			DefaultSetupName: { value: 'SomeId', label: 'SomeProfile' },
			DefaultDesign: '',
			DefaultSchema: ''
		}
	]
}
