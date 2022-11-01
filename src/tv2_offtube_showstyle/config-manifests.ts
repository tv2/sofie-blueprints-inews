import { ConfigManifestEntry, ConfigManifestEntryType, TSR } from 'blueprints-integration'
import { DEFAULT_GRAPHICS, getGraphicsSetupsEntries } from 'tv2-common'

export const dveStylesManifest: ConfigManifestEntry = {
	id: 'DVEStyles',
	name: 'DVE Layouts',
	description: '',
	type: ConfigManifestEntryType.TABLE,
	required: false,
	defaultVal: [
		{
			_id: '',
			DVEName: 'sommerfugl',
			DVEInputs: '1:INP1;2:INP2',
			DVEJSON:
				'{"boxes":{"0":{"enabled":true,"source":11,"x":-800,"y":60,"size":500,"cropped":true,"cropTop":0,"cropBottom":0,"cropLeft":0,"cropRight":0},"1":{"enabled":true,"source":1,"x":800,"y":60,"size":500,"cropped":true,"cropTop":0,"cropBottom":0,"cropLeft":0,"cropRight":0},"2":{"enabled":false,"source":2001,"x":0,"y":0,"size":1000,"cropped":false,"cropTop":0,"cropBottom":0,"cropLeft":0,"cropRight":0},"3":{"enabled":false,"source":2001,"x":0,"y":0,"size":1000,"cropped":false,"cropTop":0,"cropBottom":0,"cropLeft":0,"cropRight":0}},"index":0,"properties":{"artFillSource":30,"artCutSource":32,"artOption":1,"artPreMultiplied":false,"artClip":50,"artGain":12.5,"artInvertKey":false},"border":{"borderEnabled":false,"borderBevel":0,"borderOuterWidth":0,"borderInnerWidth":0,"borderOuterSoftness":0,"borderInnerSoftness":0,"borderBevelSoftness":0,"borderBevelPosition":0,"borderHue":0,"borderSaturation":0,"borderLuma":0,"borderLightSourceDirection":0,"borderLightSourceAltitude":10}}',
			DVEGraphicsTemplateJSON:
				'{ "common": { "font-family": "Alright Sans LT", "font-weight": "bold", "color": "#000000", "font-size": "30px", "background": "#FFFFFF", "height": "35px", "line-height": "35px", "width": "963px", "text-transform": "uppercase", "overflow": "hidden", "top": "764px" }, "locator1": { "left": "960px", "padding-left": "50px", "padding-right": "120px", "text-align": "right" }, "locator2": { "left": "0px", "padding-left": "120px", "padding-right": "50px" } }',
			DVEGraphicsKey: 'dve/sommerfuglK',
			DVEGraphicsFrame: 'dve/sommerfugl'
		},
		{
			_id: '',
			DVEName: 'morbarn',
			DVEInputs: '3:INP1;2:INP2',
			DVEJSON:
				'{"boxes":{"0":{"enabled":false,"source":12,"x":-500,"y":140,"size":760,"cropped":true,"cropTop":0,"cropBottom":0,"cropLeft":0,"cropRight":1000},"1":{"enabled":true,"source":2001,"x":1080,"y":-240,"size":320,"cropped":true,"cropTop":0,"cropBottom":0,"cropLeft":0,"cropRight":0},"2":{"enabled":true,"source":2,"x":-460,"y":100,"size":720,"cropped":true,"cropTop":0,"cropBottom":0,"cropLeft":0,"cropRight":0},"3":{"enabled":false,"source":2001,"x":0,"y":0,"size":1000,"cropped":true,"cropTop":0,"cropBottom":119,"cropLeft":0,"cropRight":0}},"index":0,"properties":{"artFillSource":30,"artCutSource":32,"artOption":1,"artPreMultiplied":false,"artClip":50,"artGain":12.5,"artInvertKey":false},"border":{"borderEnabled":false,"borderBevel":0,"borderOuterWidth":0,"borderInnerWidth":0,"borderOuterSoftness":0,"borderInnerSoftness":0,"borderBevelSoftness":0,"borderBevelPosition":0,"borderHue":0,"borderSaturation":0,"borderLuma":0,"borderLightSourceDirection":0,"borderLightSourceAltitude":10}}',
			DVEGraphicsTemplateJSON:
				'{ "common": { "font-family": "Alright Sans LT", "font-weight": "bold", "color": "#000000", "font-size": "30px", "background": "#FFFFFF", "height": "35px", "line-height": "35px", "text-transform": "uppercase", "top": "848px", "overflow": "hidden" }, "locator1": { "left": "1300px", "padding-left": "50px", "padding-right": "120px", "text-align": "right", "width": "624px" }, "locator2": { "left": "0px", "padding-left": "120px", "padding-right": "50px", "width": "1300px" } }',
			DVEGraphicsKey: 'dve/morbarnK',
			DVEGraphicsFrame: 'dve/morbarn'
		},
		{
			_id: '',
			DVEName: 'barnmor',
			DVEInputs: '2:INP2;1:INP1',
			DVEJSON:
				'{"boxes":{"0":{"enabled":true,"source":13,"x":-1080,"y":-240,"size":320,"cropped":true,"cropTop":0,"cropBottom":0,"cropLeft":0,"cropRight":0},"1":{"enabled":true,"source":3,"x":460,"y":100,"size":720,"cropped":true,"cropTop":0,"cropBottom":0,"cropLeft":0,"cropRight":0},"2":{"enabled":false,"source":2001,"x":-460,"y":130,"size":760,"cropped":true,"cropTop":0,"cropBottom":0,"cropLeft":0,"cropRight":1230},"3":{"enabled":false,"source":2001,"x":0,"y":0,"size":1000,"cropped":false,"cropTop":0,"cropBottom":0,"cropLeft":0,"cropRight":0}},"index":0,"properties":{"artFillSource":30,"artCutSource":32,"artOption":1,"artPreMultiplied":false,"artClip":50,"artGain":12.5,"artInvertKey":false},"border":{"borderEnabled":false,"borderBevel":0,"borderOuterWidth":0,"borderInnerWidth":0,"borderOuterSoftness":0,"borderInnerSoftness":0,"borderBevelSoftness":0,"borderBevelPosition":0,"borderHue":0,"borderSaturation":0,"borderLuma":0,"borderLightSourceDirection":0,"borderLightSourceAltitude":10}}',
			DVEGraphicsTemplateJSON:
				'{ "common": { "font-family": "Alright Sans LT", "font-weight": "bold", "color": "#000000", "font-size": "30px", "background": "#FFFFFF", "height": "35px", "line-height": "35px", "text-transform": "uppercase", "top": "848px", "overflow": "hidden" }, "locator1": { "left": "624px", "padding-left": "50px", "padding-right": "120px", "text-align": "right", "width": "1300px" }, "locator2": { "left": "0px", "padding-left": "120px", "padding-right": "50px", "width": "624px" } }',
			DVEGraphicsKey: 'dve/barnmorK',
			DVEGraphicsFrame: 'dve/barnmor'
		},
		{
			_id: '',
			DVEName: 'barnMorIpad',
			DVEInputs: '1:INP1;2:INP2',
			DVEJSON:
				'{"boxes":{"0":{"enabled":true,"source":11,"x":-850,"y":-250,"size":350,"cropped":true,"cropTop":240,"cropBottom":530,"cropLeft":550,"cropRight":2580},"1":{"enabled":true,"source":10,"x":507,"y":130,"size":800,"cropped":true,"cropTop":250,"cropBottom":0,"cropLeft":4380,"cropRight":4170},"2":{"enabled":false,"source":2001,"x":-460,"y":130,"size":760,"cropped":true,"cropTop":0,"cropBottom":0,"cropLeft":0,"cropRight":1230},"3":{"enabled":false,"source":2001,"x":0,"y":0,"size":1000,"cropped":false,"cropTop":0,"cropBottom":0,"cropLeft":0,"cropRight":0}},"index":0,"properties":{"artFillSource":30,"artCutSource":32,"artOption":1,"artPreMultiplied":false,"artClip":50,"artGain":12.5,"artInvertKey":false},"border":{"borderEnabled":false,"borderBevel":0,"borderOuterWidth":0,"borderInnerWidth":0,"borderOuterSoftness":0,"borderInnerSoftness":0,"borderBevelSoftness":0,"borderBevelPosition":0,"borderHue":0,"borderSaturation":0,"borderLuma":0,"borderLightSourceDirection":0,"borderLightSourceAltitude":10}}',
			DVEGraphicsTemplateJSON:
				'{ "common": { "font-family": "Alright Sans LT", "font-weight": "bold", "color": "#000000", "font-size": "30px", "background": "#FFFFFF", "height": "35px", "line-height": "35px", "text-transform": "uppercase", "top": "848px", "overflow": "hidden" }, "locator1": { "left": "733px", "padding-left": "50px", "padding-right": "50px", "text-align": "right", "width": "1014px" }, "locator2": { "left": "118px", "padding-left": "50px", "padding-right": "50px", "width": "624px" } }',
			DVEGraphicsKey: 'dve/barnipadK',
			DVEGraphicsFrame: 'dve/barnipad'
		},
		{
			_id: '',
			DVEName: '3split',
			DVEInputs: '1:INP1;2:INP2;3:INP3',
			DVEJSON:
				'{"boxes":{"0":{"enabled":true,"source":2,"x":-1050,"y":100,"size":700,"cropped":true,"cropTop":0,"cropBottom":0,"cropLeft":0,"cropRight":8500},"1":{"enabled":true,"source":3,"x":160,"y":100,"size":700,"cropped":true,"cropTop":0,"cropBottom":0,"cropLeft":6200,"cropRight":10600},"2":{"enabled":true,"source":1000,"x":1080,"y":100,"size":700,"cropped":false,"cropTop":0,"cropBottom":0,"cropLeft":0,"cropRight":0},"3":{"enabled":true,"source":2001,"x":758,"y":-425,"size":417,"cropped":false,"cropTop":0,"cropBottom":0,"cropLeft":0,"cropRight":0}},"index":0,"properties":{"artFillSource":30,"artCutSource":32,"artOption":1,"artPreMultiplied":false,"artClip":50,"artGain":12.5,"artInvertKey":false},"border":{"borderEnabled":false,"borderBevel":0,"borderOuterWidth":0,"borderInnerWidth":0,"borderOuterSoftness":0,"borderInnerSoftness":0,"borderBevelSoftness":0,"borderBevelPosition":0,"borderHue":0,"borderSaturation":0,"borderLuma":0,"borderLightSourceDirection":0,"borderLightSourceAltitude":10}}',
			DVEGraphicsTemplateJSON:
				'{ "common": { "font-family": "Alright Sans LT", "font-weight": "bold", "color": "#000000", "font-size": "30px", "background": "#FFFFFF", "height": "35px", "line-height": "35px", "width": "640px", "text-transform": "uppercase", "top": "848px" }, "locator1": { "left": "1280px", "padding-left": "50px", "padding-right": "120px", "text-align": "right", "overflow": "hidden" }, "locator2": { "left": "0px", "padding-left": "120px", "padding-right": "50px", "overflow": "hidden" } }',
			DVEGraphicsKey: 'dve/3splitK',
			DVEGraphicsFrame: 'dve/3split'
		},
		{
			_id: '',
			DVEName: '3barnMor',
			DVEInputs: '1:INP1;2:INP2;3:INP3;4:INP4',
			DVEJSON:
				'{"boxes":{"0":{"enabled":true,"source":2002,"x":-1055,"y":-390,"size":230,"cropped":true,"cropTop":0,"cropBottom":0,"cropLeft":0,"cropRight":700},"1":{"enabled":true,"source":2,"x":358,"y":0,"size":680,"cropped":true,"cropTop":0,"cropBottom":0,"cropLeft":400,"cropRight":0},"2":{"enabled":true,"source":4,"x":-1055,"y":10,"size":230,"cropped":true,"cropTop":500,"cropBottom":200,"cropLeft":0,"cropRight":700},"3":{"enabled":true,"source":1000,"x":-1055,"y":400,"size":230,"cropped":true,"cropTop":0,"cropBottom":0,"cropLeft":0,"cropRight":700}},"index":0,"properties":{"artFillSource":30,"artCutSource":32,"artOption":1,"artPreMultiplied":false,"artClip":50,"artGain":12.5,"artInvertKey":false},"border":{"borderEnabled":false,"borderBevel":0,"borderOuterWidth":0,"borderInnerWidth":0,"borderOuterSoftness":0,"borderInnerSoftness":0,"borderBevelSoftness":0,"borderBevelPosition":0,"borderHue":0,"borderSaturation":0,"borderLuma":0,"borderLightSourceDirection":0,"borderLightSourceAltitude":10}}',
			DVEGraphicsTemplateJSON: '{}',
			DVEGraphicsKey: 'dve/3barnMorK',
			DVEGraphicsFrame: 'dve/3barnMor'
		},
		{
			_id: '',
			DVEName: '2barnMor',
			DVEInputs: '1:INP1;2:INP2;3:INP3',
			DVEJSON:
				'{"boxes":{"0":{"enabled":true,"source":2,"x":-1050,"y":-200,"size":330,"cropped":true,"cropTop":0,"cropBottom":0,"cropLeft":0,"cropRight":0},"1":{"enabled":true,"source":3,"x":540,"y":100,"size":670,"cropped":true,"cropTop":0,"cropBottom":0,"cropLeft":0,"cropRight":0},"2":{"enabled":true,"source":2,"x":-1050,"y":400,"size":330,"cropped":true,"cropTop":0,"cropBottom":0,"cropLeft":0,"cropRight":0},"3":{"enabled":true,"source":2001,"x":758,"y":-425,"size":417,"cropped":false,"cropTop":0,"cropBottom":0,"cropLeft":0,"cropRight":0}},"index":0,"properties":{"artFillSource":30,"artCutSource":32,"artOption":1,"artPreMultiplied":false,"artClip":50,"artGain":12.5,"artInvertKey":false},"border":{"borderEnabled":false,"borderBevel":0,"borderOuterWidth":0,"borderInnerWidth":0,"borderOuterSoftness":0,"borderInnerSoftness":0,"borderBevelSoftness":0,"borderBevelPosition":0,"borderHue":0,"borderSaturation":0,"borderLuma":0,"borderLightSourceDirection":0,"borderLightSourceAltitude":10}}',
			DVEGraphicsTemplateJSON: '{}',
			DVEGraphicsKey: 'dve/2barnMorK',
			DVEGraphicsFrame: 'dve/2barnMor'
		}
	],
	columns: [
		{
			id: 'DVEName',
			name: 'DVE name',
			description: 'The name as it will appear in iNews',
			type: ConfigManifestEntryType.STRING,
			required: true,
			defaultVal: '',
			rank: 0
		},
		{
			id: 'DVEInputs',
			name: 'Box inputs',
			description: 'I.e.: 1:INP1;2:INP3; as an example to chose which ATEM boxes to assign iNews inputs to',
			type: ConfigManifestEntryType.STRING,
			required: true,
			defaultVal: '1:INP1;2:INP2;3:INP3;4:INP4',
			rank: 1
		},
		{
			id: 'DVEJSON',
			name: 'DVE config',
			description: 'DVE config pulled from ATEM',
			type: ConfigManifestEntryType.JSON,
			required: true,
			defaultVal: '{}',
			rank: 2
		},
		{
			id: 'DVEGraphicsTemplateJSON',
			name: 'CasparCG template config',
			description: 'Position (and style) data for the boxes in the CasparCG template',
			type: ConfigManifestEntryType.JSON,
			required: true,
			defaultVal: '{}',
			rank: 4
		},
		{
			id: 'DVEGraphicsKey',
			name: 'CasparCG key file',
			description: 'Key file for DVE',
			type: ConfigManifestEntryType.STRING,
			required: true,
			defaultVal: '',
			rank: 5
		},
		{
			id: 'DVEGraphicsFrame',
			name: 'CasparCG frame file',
			description: 'Frames file for caspar',
			type: ConfigManifestEntryType.STRING,
			required: true,
			defaultVal: '',
			rank: 6
		}
	]
}

export const gfxDesignTemplates: ConfigManifestEntry[] = [
	{
		id: 'GfxDesignTemplates',
		name: 'GFX Design Templates',
		description: '',
		type: ConfigManifestEntryType.TABLE,
		required: true,
		defaultVal: DEFAULT_GRAPHICS.map(val => ({ _id: '', ...val })).filter(template => template.IsDesign),
		columns: [
			{
				id: 'INewsName',
				name: 'iNews Name',
				description: 'The name of the design',
				type: ConfigManifestEntryType.STRING,
				required: false,
				defaultVal: '',
				rank: 0
			},
			{
				id: 'INewsStyleColumn',
				name: 'iNews Style Column',
				description: 'The selected style',
				type: ConfigManifestEntryType.STRING,
				required: false,
				defaultVal: '',
				rank: 1
			},
			{
				id: 'VizTemplate',
				name: 'GFX Template Name',
				description: 'The name of the design in the HTML package',
				type: ConfigManifestEntryType.STRING,
				required: true,
				defaultVal: '',
				rank: 2
			}
		]
	}
]

export const showStyleConfigManifest: ConfigManifestEntry[] = [
	{
		id: 'MakeAdlibsForFulls',
		name: 'Make Adlibs for FULL graphics',
		description: '',
		type: ConfigManifestEntryType.BOOLEAN,
		defaultVal: true,
		required: false
	},
	{
		id: 'CasparCGLoadingClip',
		name: 'CasparCG Loading Clip',
		description: 'Clip to play when media is loading',
		type: ConfigManifestEntryType.STRING,
		defaultVal: 'LoadingLoop',
		required: true
	},
	dveStylesManifest,
	{
		/*
		Graphic template setup								
		Grafik template (viz)	
		Source layer
		Layer mapping
		inews code	
		inews name	
		destination	default out (default, S, B, O)	
		var 1 name	
		var 2 name 	
		note
		*/
		id: 'GFXTemplates',
		name: 'GFX Templates',
		description:
			'This table can contain info in two ways. Things marked (**) are always required. If you want to do the mapping from iNews-code, then all (*)-elements are also required. GFX Template Name is what the graphic is called in the HTML package. Source layer is the ID of the Sofie Source layer in the UI (i.e. "studio0_graphicsTema"). Layer mapping is the Sofie studio layer mapping (i.e "viz_layer_tema").  iNews command can be something like "KG=", then iNews Name is the thing that follows in iNews i.e. "ident_nyhederne"',
		type: ConfigManifestEntryType.TABLE,
		required: false,
		defaultVal: DEFAULT_GRAPHICS.map(val => ({ _id: '', ...val })).filter(template => !template.IsDesign),
		columns: [
			{
				id: 'INewsCode',
				name: 'iNews Command (*)',
				description: 'The code as it will appear in iNews',
				type: ConfigManifestEntryType.STRING,
				required: false,
				defaultVal: '',
				rank: 0
			},
			{
				id: 'INewsName',
				name: 'iNews Name (*)',
				description: 'The name after the code',
				type: ConfigManifestEntryType.STRING,
				required: false,
				defaultVal: '',
				rank: 1
			},
			{
				id: 'VizTemplate',
				name: 'GFX Template Name (**)',
				description: 'The name of the Graphic in the HTML package',
				type: ConfigManifestEntryType.STRING,
				required: true,
				defaultVal: '',
				rank: 2
			},
			{
				id: 'VizDestination',
				name: 'Viz Destination (*)',
				description: 'The name of the Viz Engine',
				type: ConfigManifestEntryType.STRING,
				required: false,
				defaultVal: '',
				rank: 3
			},
			{
				id: 'OutType',
				name: 'Out type',
				description: 'The type of out, none follow timecode, S stays on to ??, B stays on to ??, O stays on to ??',
				type: ConfigManifestEntryType.STRING,
				required: false,
				defaultVal: '',
				rank: 4
			},
			{
				id: 'SourceLayer',
				name: 'Source layer (**)',
				description: 'The ID of the source layer to place the piece on in Sofie UI',
				type: ConfigManifestEntryType.SOURCE_LAYERS,
				multiple: false,
				required: true,
				defaultVal: '',
				rank: 6
			},
			{
				id: 'LayerMapping',
				name: 'Layer mapping (**)',
				description:
					'The Sofie Layer mapping to use in playback. This will ensure proper graphic transition logic by matching the graphic layers.',
				type: ConfigManifestEntryType.LAYER_MAPPINGS,
				filters: {
					deviceTypes: [TSR.DeviceType.CASPARCG]
				},
				multiple: false,
				required: true,
				defaultVal: '',
				rank: 7
			}
		]
	},
	...gfxDesignTemplates,
	{
		/*
		Wipes Config
		Effekt number
		Clip name
		Alpha at start
		Alpha at end
		*/
		id: 'WipesConfig',
		name: 'Wipes Configuration',
		description: 'Wipes effekts configuration',
		type: ConfigManifestEntryType.TABLE,
		required: false,
		defaultVal: [
			{
				_id: '',
				EffektNumber: 0,
				ClipName: '',
				Duration: 0,
				StartAlpha: 0,
				EndAlpha: 0
			}
		],
		columns: [
			{
				id: 'EffektNumber',
				name: 'Effekt Number',
				description: 'The Effect Number',
				type: ConfigManifestEntryType.INT,
				required: true,
				defaultVal: 0,
				rank: 0
			},
			{
				id: 'ClipName',
				name: 'Clip Name',
				description: 'The name of the wipe clip',
				type: ConfigManifestEntryType.STRING,
				required: true,
				defaultVal: '',
				rank: 1
			},
			{
				id: 'Duration',
				name: 'Effekt Duration',
				description: 'Duration of the effekt',
				type: ConfigManifestEntryType.INT,
				required: true,
				defaultVal: 0,
				rank: 2
			},
			{
				id: 'StartAlpha',
				name: 'Alpha at Start',
				description: 'Number of frames of alpha at start',
				type: ConfigManifestEntryType.INT,
				required: true,
				defaultVal: 0,
				rank: 3
			},
			{
				id: 'EndAlpha',
				name: 'Alpha at End',
				description: 'Number of frames of alpha at end',
				type: ConfigManifestEntryType.INT,
				required: true,
				defaultVal: 0,
				rank: 4
			}
		]
	},
	{
		/*
		Breaker Config
		Effekt number
		Clip name
		Alpha at start
		Alpha at end
		*/
		id: 'BreakerConfig',
		name: 'Breaker Configuration',
		description:
			'Clip name is the clip name without file extension. Duration is the length of the file, including trailing audio. Alpha start is the number of frames from the first frame and until the jingle covers the full frame. The alpha end is how many frames from the alpha starts fading out, until the very end of the file.',
		type: ConfigManifestEntryType.TABLE,
		required: false,
		defaultVal: [
			{
				_id: '',
				BreakerName: '',
				ClipName: '',
				Duration: 0,
				StartAlpha: 0,
				EndAlpha: 0,
				Autonext: true
			}
		],
		columns: [
			{
				id: 'BreakerName',
				name: 'Breaker name',
				description: 'Breaker name as typed in iNews',
				type: ConfigManifestEntryType.STRING,
				required: true,
				defaultVal: '',
				rank: 0
			},
			{
				id: 'ClipName',
				name: 'Clip Name',
				description: 'The name of the breaker clip to play',
				type: ConfigManifestEntryType.STRING,
				required: true,
				defaultVal: '',
				rank: 1
			},
			{
				id: 'Duration',
				name: 'Effekt Duration',
				description: 'Duration of the effekt',
				type: ConfigManifestEntryType.INT,
				required: true,
				defaultVal: 0,
				rank: 2
			},
			{
				id: 'StartAlpha',
				name: 'Alpha at Start',
				description: 'Number of frames of alpha at start',
				type: ConfigManifestEntryType.INT,
				required: true,
				defaultVal: 0,
				rank: 3
			},
			{
				id: 'EndAlpha',
				name: 'Alpha at End',
				description: 'Number of frames of alpha at end',
				type: ConfigManifestEntryType.INT,
				required: true,
				defaultVal: 0,
				rank: 4
			},
			{
				id: 'Autonext',
				name: 'Autonext',
				description: '',
				type: ConfigManifestEntryType.BOOLEAN,
				required: true,
				defaultVal: true,
				rank: 5
			},
			{
				id: 'LoadFirstFrame',
				name: 'Load First Frame',
				description: '',
				type: ConfigManifestEntryType.BOOLEAN,
				required: true,
				defaultVal: true,
				rank: 6
			}
		]
	},
	{
		id: 'DefaultTemplateDuration',
		name: 'Default Template Duration',
		description: 'Default Template Duration',
		type: ConfigManifestEntryType.INT,
		required: true,
		defaultVal: 4
	},
	{
		/*
		LYD Mappings
		iNews Name
		File Name
		*/
		id: 'LYDConfig',
		name: 'LYD Config',
		description: 'Map LYD iNews names to file names',
		type: ConfigManifestEntryType.TABLE,
		required: false,
		defaultVal: [
			{
				_id: '',
				INewsName: '',
				FileName: ''
			}
		],
		columns: [
			{
				id: 'INewsName',
				name: 'iNews Name',
				description: 'Name of LYD as in iNews',
				type: ConfigManifestEntryType.STRING,
				required: true,
				defaultVal: '',
				rank: 0
			},
			{
				id: 'FileName',
				name: 'File Name',
				description: 'The name of the LYD file',
				type: ConfigManifestEntryType.STRING,
				required: true,
				defaultVal: '',
				rank: 1
			},
			{
				id: 'FadeIn',
				name: 'Fade In',
				description: 'ms duration to fade in file',
				type: ConfigManifestEntryType.INT,
				required: true,
				defaultVal: 1000,
				rank: 2
			},
			{
				id: 'FadeOut',
				name: 'Fade Out',
				description: 'ms duration to fade out file',
				type: ConfigManifestEntryType.INT,
				required: true,
				defaultVal: 1000,
				rank: 3
			}
		]
	},
	{
		id: 'ShowstyleTransition',
		name: 'Showstyle Transition',
		description: 'Transition to place on default transition shortcut (first transition shortcut)',
		type: ConfigManifestEntryType.STRING,
		required: false,
		defaultVal: '/ NBA WIPE'
	},
	{
		id: 'Transitions',
		name: 'Transitions',
		description:
			'Transitions available as take shortcuts in static buttons (assigned to shortcuts in the order they appear in this list)',
		type: ConfigManifestEntryType.TABLE,
		required: true,
		defaultVal: [],
		columns: [
			{
				id: 'Transition',
				name: 'Transition',
				description: 'Name of Transition',
				type: ConfigManifestEntryType.STRING,
				required: true,
				defaultVal: '',
				rank: 0
			}
		]
	},
	{
		id: 'SchemaConfig',
		name: 'Skema',
		description: 'The values for the Skema and Design combinations',
		type: ConfigManifestEntryType.TABLE,
		required: false,
		defaultVal: [],
		columns: [
			{
				id: 'schemaName',
				name: 'Skema',
				description: 'The name of the Skema',
				rank: 0,
				required: true,
				defaultVal: '',
				type: ConfigManifestEntryType.STRING
			},
			{
				id: 'designIdentifier',
				name: 'Design',
				description: 'The identifier of the Design',
				rank: 1,
				required: true,
				defaultVal: '',
				type: ConfigManifestEntryType.STRING
			},
			{
				id: 'vizTemplateName',
				name: 'Viz Template Name',
				description: 'The name of the Viz template',
				rank: 2,
				required: true,
				defaultVal: '',
				type: ConfigManifestEntryType.STRING
			},
			{
				id: 'casparCgDveBgScene',
				name: 'CasparCG DVE Bg Scene',
				description: 'The dveBgScene',
				defaultVal: '',
				rank: 3,
				required: true,
				type: ConfigManifestEntryType.STRING
			}
		]
	},
	...getGraphicsSetupsEntries([])
]
