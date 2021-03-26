import { DSKConfig, literal, parseMapStr } from 'tv2-common'
import { StudioConfig } from '../../tv2_afvd_studio/helpers/config'
import { ShowStyleConfig } from '../helpers/config'
import { DefaultBreakerConfig } from './breakerConfigDefault'
import { DefaultGrafikConfig } from './grafikConfigDefault'

function getSisyfosLayers(configName: string, id: string): string[] {
	switch (configName) {
		case 'SourcesCam':
			return []
		case 'SourcesRM':
		case 'SourcesFeed':
		case 'SourcesSkype':
			return ['sisyfos_source_live_' + id]
		case 'SourcesDelayedPlayback':
			return ['sisyfos_source_evs_' + id]
	}

	return []
}

// TODO: Broken
function prepareConfig(
	conf: string,
	configName: string,
	studioMics: boolean,
	keepAudioInStudio?: boolean
): Array<{
	SourceName: string
	AtemSource: number
	SisyfosLayers: string[]
	StudioMics: boolean
	KeepAudioInStudio: boolean
}> {
	return parseMapStr(undefined, conf, true).map(c => {
		return {
			SourceName: c.id,
			AtemSource: c.val,
			SisyfosLayers: getSisyfosLayers(configName, c.id),
			StudioMics: studioMics,
			KeepAudioInStudio: keepAudioInStudio ?? false
		}
	})
}

// in here will be some mock configs that can be referenced paired with ro's for the tests
export const defaultStudioConfig: StudioConfig = {
	ClipMediaFlowId: '',
	GraphicMediaFlowId: '',
	JingleMediaFlowId: '',
	JingleFileExtension: '',
	ClipFileExtension: 'mxf',
	GraphicFileExtension: '.png',
	ClipNetworkBasePath: '/',
	GraphicNetworkBasePath: '/',
	JingleNetworkBasePath: '/',
	ClipFolder: '',
	GraphicFolder: '',
	JingleFolder: '',
	GraphicIgnoreStatus: false,
	JingleIgnoreStatus: false,
	ClipIgnoreStatus: false,
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
	SourcesSkype: prepareConfig('1:1,2:2,3:3,4:4,5:5,6:6,7:7', 'SourcesSkype', false),
	SourcesRM: prepareConfig('1:1,2:2,3:3,4:4,5:5,6:6,7:7,8:8,9:9,10:10', 'SourcesRM', false, true),
	SourcesFeed: prepareConfig('1:1,2:2,3:3,4:4,5:5,6:6,7:7,8:8,9:9,10:10', 'SourcesFeed', false, true),
	SourcesDelayedPlayback: prepareConfig('1:5,2:5', 'SourcesDelayedPlayback', false),
	StudioMics: [
		'sisyfos_source_Host_1_st_a',
		'sisyfos_source_Host_2_st_a',
		'sisyfos_source_Guest_1_st_a',
		'sisyfos_source_Guest_2_st_a',
		'sisyfos_source_Guest_3_st_a',
		'sisyfos_source_Guest_4_st_a'
	],
	AtemSource: {
		MixMinusDefault: 2,
		DSK: [],
		ServerC: 28,
		JingleFill: 6,
		JingleKey: 31,
		SplitArtF: 30,
		SplitArtK: 32,
		FullFrameGrafikBackground: 36,
		Default: 2001,
		Continuity: 2002
	},
	SofieHostURL: '',
	ABMediaPlayers: [
		{ SourceName: '1', AtemSource: 1 },
		{ SourceName: '2', AtemSource: 2 }
	],
	ABPlaybackDebugLogging: false,
	AtemSettings: {
		VizClip: 50,
		VizGain: 12.5,
		CCGClip: 50,
		CCGGain: 12.5,
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
		CutToMediaPlayer: 1500
	},
	HTMLGraphics: {
		GraphicURL: '',
		KeepAliveDuration: 1000,
		TransitionSettings: {
			wipeRate: 20,
			borderSoftness: 7500,
			loopOutTransitionDuration: 120
		}
	}
}

export const defaultShowStyleConfig: ShowStyleConfig = {
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
	GFXTemplates: [
		...DefaultGrafikConfig(),
		...literal<ShowStyleConfig['GFXTemplates']>([
			{
				INewsCode: 'GRAFIK',
				INewsName: 'wall',
				VizTemplate: 'VCP',
				VizDestination: 'WALL1',
				OutType: 'O',
				IsDesign: false,
				SourceLayer: 'studio0_wall_graphics',
				LayerMapping: 'graphic_wall'
			},
			{
				INewsCode: 'GRAFIK',
				INewsName: 'OVL',
				VizTemplate: 'VCP',
				VizDestination: 'OVL1',
				OutType: 'O',
				IsDesign: false,
				SourceLayer: 'studio0_overlay',
				LayerMapping: 'graphic_overlay'
			},
			{
				INewsCode: '#kg',
				INewsName: 'MERGE',
				VizTemplate: 'VCP',
				VizDestination: 'OVL1',
				OutType: 'O',
				IsDesign: false,
				SourceLayer: 'studio0_overlay',
				LayerMapping: 'graphic_overlay'
			}
		])
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
	Transitions: [{ Transition: '1' }, { Transition: '2' }],
	ShowstyleTransition: 'CUT'
}

export const defaultDSKConfig: DSKConfig = {
	1: { Number: 1, Key: 0, Fill: 0, Toggle: true, DefaultOn: true, FullSource: true }
}
