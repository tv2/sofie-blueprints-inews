import { ConfigItemValue } from 'tv-automation-sofie-blueprints-integration'
import { DefaultBreakerConfig } from './breakerConfigDefault'
import { DefaultGrafikConfig } from './grafikConfigDefault'

export interface ConfigMap {
	[key: string]: ConfigItemValue | ConfigMap | any[]
}

// in here will be some mock configs that can be referenced paired with ro's for the tests
export const defaultStudioConfig: ConfigMap = {
	SourcesCam:
		'1:1,2:2,3:3,4:4,5:5,1S:6,2S:7,3S:8,4S:9,5S:10,X8:13,HVID:14,AR:16,CS1:17,CS2:18,CS3:19,CS4:20,CS5:21,CS 1:17,CS 2:18,CS 3:19,CS 4:20,CS 5:21,SORT:22,11:11,12:12,13:13,14:14,15:15',
	SourcesSkype: '1:1,2:2,3:3,4:4,5:5,6:6,7:7',
	SourcesRM: '1:1,2:2,3:3,4:4,5:5,6:6,7:7,8:8,9:9,10:10',
	'AtemSource.MixMinusDefault': 2,
	'AtemSource.DSK1F': 21,
	'AtemSource.DSK1K': 34,
	'AtemSource.ServerC': 28,
	'AtemSource.JingleFill': 6,
	'AtemSource.JingleKey': 31,
	'AtemSource.SplitArtF': 30,
	'AtemSource.SplitArtK': 32,
	'AtemSource.FullFrameGrafikBackground': 36,
	'AtemSource.Default': 2001,
	'AtemSource.Continuity': 2002,
	ClipSourcePath: '/media',
	ClipFileExtension: '.mxf',
	SofieHostURL: '',
	MediaFlowId: 'testflow0',
	SourcesDelayedPlayback: '1:5,2:5',
	ABMediaPlayers: '1:1,2:2',
	ABPlaybackDebugLogging: false,
	'AtemSettings.VizClip': 50,
	'AtemSettings.VizGain': 12.5,
	'AtemSettings.CCGClip': 50,
	'AtemSettings.CCGGain': 12.5,
	'AudioBedSettings.fadeIn': 1000,
	'AudioBedSettings.fadeOut': 1000,
	'AudioBedSettings.volume': 80,
	CasparPrerollDuration: 280,
	PilotPrerollDuration: 2000,
	PilotKeepaliveDuration: 700,
	PilotCutToMediaPlayer: 1500,
	PilotOutTransitionDuration: 280,
	ATEMDelay: 1,
	MaximumKamDisplayDuration: 10000
}

export const defaultShowStyleConfig: ConfigMap = {
	...defaultStudioConfig,
	DefaultTemplateDuration: 4,
	CasparCGLoadingClip: 'LoadingLoop',
	DVEStyles: [
		{
			DVEName: 'sommerfugl',
			DVEInputs: '1:INP1;2:INP2',
			DVEJSON:
				'{"boxes":{"0":{"enabled":true,"source":11,"x":-800,"y":25,"size":550,"cropped":true,"cropTop":0,"cropBottom":150,"cropLeft":0,"cropRight":1500},"1":{"enabled":true,"source":1,"x":800,"y":25,"size":550,"cropped":true,"cropTop":160,"cropBottom":150,"cropLeft":0,"cropRight":0},"2":{"enabled":false,"source":2001,"x":0,"y":0,"size":1000,"cropped":false,"cropTop":0,"cropBottom":0,"cropLeft":0,"cropRight":0},"3":{"enabled":false,"source":2001,"x":0,"y":0,"size":1000,"cropped":false,"cropTop":0,"cropBottom":0,"cropLeft":0,"cropRight":0}},"index":0,"properties":{"artFillSource":30,"artCutSource":32,"artOption":1,"artPreMultiplied":true,"artClip":0,"artGain":0,"artInvertKey":false},"border":{"borderEnabled":false,"borderBevel":0,"borderOuterWidth":0,"borderInnerWidth":0,"borderOuterSoftness":0,"borderInnerSoftness":0,"borderBevelSoftness":0,"borderBevelPosition":0,"borderHue":0,"borderSaturation":0,"borderLuma":0,"borderLightSourceDirection":0,"borderLightSourceAltitude":10}}',
			DVEGraphicsTemplate: 'dve/locators',
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
			DVEGraphicsTemplate: 'dve/locators',
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
			DVEGraphicsTemplate: 'dve/locators',
			DVEGraphicsTemplateJSON:
				'{"common":{"font-family":"Alright Sans LT","font-weight":"bold","font-variant":"italic","color":"#ffffff","font-size":"35px","background":"rgba(0, 0, 0, 0.5)","height":"45px","line-height":"48px","padding-left":"13px","padding-right":"13px"},"locator1":{"left":"120px","top":"880px"},"locator2":{"left":"1800px","top":"880px"}}',
			DVEGraphicsKey: 'dve/barnmorK',
			DVEGraphicsFrame: 'dve/barnmor'
		}
	],
	WipesConfig: [],
	BreakerConfig: DefaultBreakerConfig(),
	MakeAdlibsForFulls: true,
	GFXTemplates: DefaultGrafikConfig(),
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
	]
}
