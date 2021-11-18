import {
	ConfigManifestEntry,
	ConfigManifestEntryTable,
	ConfigManifestEntryType,
	TableConfigItemValue,
	TSR
} from '@sofie-automation/blueprints-integration'
import {
	DSKConfigManifest,
	literal,
	MakeConfigForSources,
	MakeConfigWithMediaFlow,
	TableConfigItemSourceMapping
} from 'tv2-common'
import * as _ from 'underscore'
import { AtemSourceIndex } from '../types/atem'
import { defaultDSKConfig } from './helpers/config'
import { SisyfosLLAyer } from './layers'

export const CORE_INJECTED_KEYS = ['SofieHostURL']

const DEFAULT_STUDIO_MICS_LAYERS = [
	SisyfosLLAyer.SisyfosSourceHost_1_ST_A,
	SisyfosLLAyer.SisyfosSourceHost_2_ST_A,
	SisyfosLLAyer.SisyfosSourceGuest_1_ST_A,
	SisyfosLLAyer.SisyfosSourceGuest_2_ST_A,
	SisyfosLLAyer.SisyfosSourceGuest_3_ST_A,
	SisyfosLLAyer.SisyfosSourceGuest_4_ST_A
]

export const manifestAFVDSourcesCam = MakeConfigForSources('Cam', 'Camera', false, [
	{
		_id: '',
		SourceName: '1',
		AtemSource: 11,
		SisyfosLayers: [],
		StudioMics: true
	},
	{
		_id: '',
		SourceName: '2',
		AtemSource: 12,
		SisyfosLayers: [],
		StudioMics: true
	},
	{
		_id: '',
		SourceName: '3',
		AtemSource: 13,
		SisyfosLayers: [],
		StudioMics: true
	},
	{
		_id: '',
		SourceName: '4',
		AtemSource: 14,
		SisyfosLayers: [],
		StudioMics: true
	},
	{
		_id: '',
		SourceName: '5',
		AtemSource: 15,
		SisyfosLayers: [],
		StudioMics: true
	},
	{
		_id: '',
		SourceName: '1S',
		AtemSource: 16,
		SisyfosLayers: [],
		StudioMics: true
	},
	{
		_id: '',
		SourceName: '2S',
		AtemSource: 17,
		SisyfosLayers: [],
		StudioMics: true
	},
	{
		_id: '',
		SourceName: '3S',
		AtemSource: 18,
		SisyfosLayers: [],
		StudioMics: true
	},
	{
		_id: '',
		SourceName: '4S',
		AtemSource: 19,
		SisyfosLayers: [],
		StudioMics: true
	},
	{
		_id: '',
		SourceName: '5S',
		AtemSource: 20,
		SisyfosLayers: [],
		StudioMics: true
	}
])

export const manifestAFVDSourcesRM = MakeConfigForSources('RM', 'Live', true, [
	{
		_id: '',
		SourceName: '1',
		AtemSource: 1,
		SisyfosLayers: [SisyfosLLAyer.SisyfosSourceLive_1],
		StudioMics: false,
		KeepAudioInStudio: true
	},
	{
		_id: '',
		SourceName: '2',
		AtemSource: 2,
		SisyfosLayers: [SisyfosLLAyer.SisyfosSourceLive_2],
		StudioMics: false,
		KeepAudioInStudio: true
	},
	{
		_id: '',
		SourceName: '3',
		AtemSource: 3,
		SisyfosLayers: [SisyfosLLAyer.SisyfosSourceLive_3],
		StudioMics: false,
		KeepAudioInStudio: true
	},
	{
		_id: '',
		SourceName: '4',
		AtemSource: 4,
		SisyfosLayers: [SisyfosLLAyer.SisyfosSourceLive_4],
		StudioMics: false,
		KeepAudioInStudio: true
	},
	{
		_id: '',
		SourceName: '5',
		AtemSource: 5,
		SisyfosLayers: [SisyfosLLAyer.SisyfosSourceLive_5],
		StudioMics: false,
		KeepAudioInStudio: true
	},
	{
		_id: '',
		SourceName: '6',
		AtemSource: 6,
		SisyfosLayers: [SisyfosLLAyer.SisyfosSourceLive_6],
		StudioMics: false,
		KeepAudioInStudio: true
	},
	{
		_id: '',
		SourceName: '7',
		AtemSource: 7,
		SisyfosLayers: [SisyfosLLAyer.SisyfosSourceLive_7],
		StudioMics: false,
		KeepAudioInStudio: true
	},
	{
		_id: '',
		SourceName: '8',
		AtemSource: 8,
		SisyfosLayers: [SisyfosLLAyer.SisyfosSourceLive_8],
		StudioMics: false,
		KeepAudioInStudio: true
	},
	{
		_id: '',
		SourceName: '9',
		AtemSource: 9,
		SisyfosLayers: [SisyfosLLAyer.SisyfosSourceLive_9],
		StudioMics: false,
		KeepAudioInStudio: true
	},
	{
		_id: '',
		SourceName: '10',
		AtemSource: 10,
		SisyfosLayers: [SisyfosLLAyer.SisyfosSourceLive_10],
		StudioMics: false,
		KeepAudioInStudio: true
	}
])

export const manifestAFVDSourcesFeed = MakeConfigForSources('Feed', 'Feed', true, [])

export const manifestAFVDSourcesDelayedPlayback = MakeConfigForSources('DelayedPlayback', 'EVS', false, [
	{
		_id: '',
		SourceName: '1',
		AtemSource: 22,
		SisyfosLayers: [SisyfosLLAyer.SisyfosSourceEVS_1],
		StudioMics: true
	},
	{
		_id: '',
		SourceName: '2',
		AtemSource: 23,
		SisyfosLayers: [SisyfosLLAyer.SisyfosSourceEVS_2],
		StudioMics: true
	}
])

export const manifestAFVDSourcesSkype = MakeConfigForSources('Skype', 'Skype', false, [
	{
		_id: '',
		SourceName: '1',
		AtemSource: 1,
		SisyfosLayers: [SisyfosLLAyer.SisyfosSourceLive_1],
		StudioMics: false
	},
	{
		_id: '',
		SourceName: '2',
		AtemSource: 2,
		SisyfosLayers: [SisyfosLLAyer.SisyfosSourceLive_2],
		StudioMics: false
	},
	{
		_id: '',
		SourceName: '3',
		AtemSource: 3,
		SisyfosLayers: [SisyfosLLAyer.SisyfosSourceLive_3],
		StudioMics: false
	},
	{
		_id: '',
		SourceName: '4',
		AtemSource: 4,
		SisyfosLayers: [SisyfosLLAyer.SisyfosSourceLive_4],
		StudioMics: false
	},
	{
		_id: '',
		SourceName: '5',
		AtemSource: 5,
		SisyfosLayers: [SisyfosLLAyer.SisyfosSourceLive_5],
		StudioMics: false
	},
	{
		_id: '',
		SourceName: '6',
		AtemSource: 6,
		SisyfosLayers: [SisyfosLLAyer.SisyfosSourceLive_6],
		StudioMics: false
	},
	{
		_id: '',
		SourceName: '7',
		AtemSource: 7,
		SisyfosLayers: [SisyfosLLAyer.SisyfosSourceLive_7],
		StudioMics: false
	},
	{
		_id: '',
		SourceName: '8',
		AtemSource: 8,
		SisyfosLayers: [SisyfosLLAyer.SisyfosSourceLive_8],
		StudioMics: false
	},
	{
		_id: '',
		SourceName: '9',
		AtemSource: 9,
		SisyfosLayers: [SisyfosLLAyer.SisyfosSourceLive_9],
		StudioMics: false
	},
	{
		_id: '',
		SourceName: '10',
		AtemSource: 10,
		SisyfosLayers: [SisyfosLLAyer.SisyfosSourceLive_10],
		StudioMics: false
	}
])

export const manifestAFVDSourcesABMediaPlayers: ConfigManifestEntryTable = {
	id: 'ABMediaPlayers',
	name: 'Media Players inputs',
	description: 'ATEM inputs for A/B media players',
	type: ConfigManifestEntryType.TABLE,
	required: false,
	defaultVal: literal<Array<TableConfigItemSourceMapping & TableConfigItemValue[0]>>([
		{
			_id: '',
			SourceName: '1',
			AtemSource: 26
		},
		{
			_id: '',
			SourceName: '2',
			AtemSource: 27
		}
	]),
	columns: [
		{
			id: 'SourceName',
			name: 'Media player',
			description: 'Media player name as typed in iNews',
			type: ConfigManifestEntryType.STRING,
			required: true,
			defaultVal: '',
			rank: 0
		},
		{
			id: 'AtemSource',
			name: 'ATEM input',
			description: 'ATEM vision mixer input for Media player',
			type: ConfigManifestEntryType.NUMBER,
			required: true,
			defaultVal: 0,
			rank: 1
		}
	]
}

export const manifestAFVDStudioMics: ConfigManifestEntry = {
	id: 'StudioMics',
	name: 'Studio Mics',
	description: 'Sisyfos layers for Studio Mics',
	type: ConfigManifestEntryType.LAYER_MAPPINGS,
	filters: {
		deviceTypes: [TSR.DeviceType.SISYFOS]
	},
	required: true,
	multiple: true,
	defaultVal: DEFAULT_STUDIO_MICS_LAYERS
}

export const manifestAFVDDownstreamKeyers: ConfigManifestEntryTable = DSKConfigManifest(defaultDSKConfig)

export const studioConfigManifest: ConfigManifestEntry[] = [
	...MakeConfigWithMediaFlow('Clip', '', 'flow0', '.mxf', '', false),
	...MakeConfigWithMediaFlow('Jingle', '', 'flow1', '.mov', '', true),
	...MakeConfigWithMediaFlow('Graphic', '', 'flow2', '.png', '', true),
	...MakeConfigWithMediaFlow('AudioBed', '', 'flow1', '.wav', 'audio', true),
	...MakeConfigWithMediaFlow('DVE', '', 'flow1', '.png', 'dve', true),
	manifestAFVDSourcesCam,
	manifestAFVDSourcesRM,
	manifestAFVDSourcesFeed,
	manifestAFVDSourcesDelayedPlayback,
	manifestAFVDSourcesSkype,
	manifestAFVDSourcesABMediaPlayers,
	manifestAFVDStudioMics,
	manifestAFVDDownstreamKeyers,
	{
		id: 'ABPlaybackDebugLogging',
		name: 'Media players selection debug logging',
		description: 'Enable debug logging for A/B media player selection',
		type: ConfigManifestEntryType.BOOLEAN,
		required: false,
		defaultVal: false
	},
	{
		id: 'AtemSource.SplitArtF',
		name: 'ATEM Split Screen Art Fill',
		description: 'ATEM vision mixer input for Split Screen Art Fill',
		type: ConfigManifestEntryType.NUMBER,
		required: true,
		defaultVal: 30
	},
	{
		id: 'AtemSource.SplitArtK',
		name: 'ATEM Split Screen Art Key',
		description: 'ATEM vision mixer input for Split Screen Art Key',
		type: ConfigManifestEntryType.NUMBER,
		required: true,
		defaultVal: 32
	},
	{
		id: 'AtemSource.Default',
		name: 'ATEM Default source',
		description: 'ATEM vision mixer default source',
		type: ConfigManifestEntryType.NUMBER,
		required: true,
		defaultVal: AtemSourceIndex.Col1
	},
	{
		id: 'AtemSource.MixMinusDefault',
		name: 'ATEM Mix-minus default source',
		description: 'ATEM vision mixer default source for mix-minus',
		type: ConfigManifestEntryType.NUMBER,
		required: true,
		defaultVal: AtemSourceIndex.Col1
	},
	{
		id: 'AtemSource.Continuity',
		name: 'ATEM continuity source',
		description: 'ATEM input for continuity',
		type: ConfigManifestEntryType.NUMBER,
		required: true,
		defaultVal: AtemSourceIndex.Col2
	},
	{
		id: 'AtemSettings.MP1Baseline.Clip',
		name: 'ATEM MP1 baseline clip number',
		description: 'Number of the clip to play on MP1 (counting from 1)',
		type: ConfigManifestEntryType.NUMBER,
		required: false,
		defaultVal: 1
	},
	{
		id: 'AtemSettings.MP1Baseline.Loop',
		name: 'ATEM MP1 baseline clip loop',
		description: 'If the clip on MP1 should loop',
		type: ConfigManifestEntryType.BOOLEAN,
		required: false,
		defaultVal: true
	},
	{
		id: 'AtemSettings.MP1Baseline.Playing',
		name: 'ATEM MP1 baseline clip playing',
		description: 'If the clip on MP1 should play',
		type: ConfigManifestEntryType.BOOLEAN,
		required: false,
		defaultVal: true
	},
	{
		id: 'AudioBedSettings.fadeIn',
		name: 'Bed Fade In',
		description: 'Default fade in duration for audio beds',
		type: ConfigManifestEntryType.NUMBER,
		required: false,
		defaultVal: 25
	},
	{
		id: 'AudioBedSettings.volume',
		name: 'Bed Volume',
		description: 'Volume (0 - 100)',
		type: ConfigManifestEntryType.NUMBER,
		required: false,
		defaultVal: 80
	},
	{
		id: 'AudioBedSettings.fadeOut',
		name: 'Bed Fade Out',
		description: 'Default fade out duration for audio beds',
		type: ConfigManifestEntryType.NUMBER,
		required: false,
		defaultVal: 25
	},
	{
		id: 'CasparPrerollDuration',
		name: 'Caspar preroll duration',
		description: 'ms of preroll before switching to caspar',
		type: ConfigManifestEntryType.NUMBER,
		required: true,
		defaultVal: 200 // 5 frames
	},
	{
		id: 'MaximumPartDuration',
		name: 'Maximum Part Duration',
		description: 'Maximum duration (ms) to give parts in UI',
		type: ConfigManifestEntryType.NUMBER,
		required: true,
		defaultVal: 10000
	},
	{
		id: 'DefaultPartDuration',
		name: 'Default Part Duration',
		description: 'Duration to give parts by default',
		type: ConfigManifestEntryType.NUMBER,
		required: true,
		defaultVal: 4000
	},
	{
		id: 'ServerPostrollDuration',
		name: 'Server Postroll Duration',
		description: 'ms of postroll at the end of Server and VO clips',
		type: ConfigManifestEntryType.NUMBER,
		required: true,
		defaultVal: 0
	},
	/** Graphics */
	{
		id: 'GraphicsType',
		name: 'Graphics Type',
		description: 'Graphics renderer to use',
		type: ConfigManifestEntryType.SELECT,
		required: true,
		defaultVal: 'VIZ',
		options: ['HTML', 'VIZ'],
		multiple: false
	},
	{
		id: 'HTMLGraphics.GraphicURL',
		name: 'Full Graphic URL (HTML)',
		description: 'URL to serve full graphics from',
		type: ConfigManifestEntryType.STRING,
		required: false,
		defaultVal: 'localhost'
	},
	{
		id: 'HTMLGraphics.KeepAliveDuration',
		name: 'Full Keep Alive Duration (HTML)',
		description: 'How long to keep the old part alive when going to a full',
		type: ConfigManifestEntryType.NUMBER,
		required: false,
		defaultVal: 1000
	},
	{
		id: 'HTMLGraphics.TransitionSettings.borderSoftness',
		name: 'Full graphic wipe softness (HTML)',
		description: 'Border softness of full graphic background wipe',
		type: ConfigManifestEntryType.NUMBER,
		required: false,
		defaultVal: 7500
	},
	{
		id: 'HTMLGraphics.TransitionSettings.loopOutTransitionDuration',
		name: 'Full graphic background loop out transition duration',
		description: 'Duration (ms) that the background loop behind a full takes to transition out',
		type: ConfigManifestEntryType.NUMBER,
		required: false,
		defaultVal: 120
	},
	{
		id: 'HTMLGraphics.TransitionSettings.wipeRate',
		name: 'Full graphic background loop wipe duration (HTML)',
		description: 'Frames (max 250) over which to wipe background loop behind Full',
		type: ConfigManifestEntryType.NUMBER,
		required: false,
		defaultVal: 10
	},
	{
		id: 'VizPilotGraphics.CutToMediaPlayer',
		name: 'Pilot media Player Cut Point',
		description: 'ms from start of grafik before switching to background source',
		type: ConfigManifestEntryType.NUMBER,
		required: false,
		defaultVal: 500
	},
	{
		id: 'VizPilotGraphics.FullGraphicBackground',
		name: 'Full frame grafik background source',
		description: 'ATEM source for mos full-frame grafik background source',
		type: ConfigManifestEntryType.NUMBER,
		required: false,
		defaultVal: 36
	},
	{
		id: 'VizPilotGraphics.KeepAliveDuration',
		name: 'Pilot Keepalive Duration',
		description: 'ms to keep old part alive before switching to Pilot elements',
		type: ConfigManifestEntryType.NUMBER,
		required: false,
		defaultVal: 2000
	},
	{
		id: 'VizPilotGraphics.OutTransitionDuration',
		name: 'Pilot Out Transition Duration',
		description: 'ms to keep pilot elements alive before transition to next part',
		type: ConfigManifestEntryType.NUMBER,
		required: false,
		defaultVal: 1000
	},
	{
		id: 'VizPilotGraphics.PrerollDuration',
		name: 'Pilot Preroll Duration',
		description: 'ms of preroll before switching to Pilot elements',
		type: ConfigManifestEntryType.NUMBER,
		required: false,
		defaultVal: 2000
	},
	{
		id: 'PreventOverlayWithFull',
		name: 'Prevent Overlay with Full',
		description: 'Stop overlay elements from showing when a Full graphic is on-air',
		type: ConfigManifestEntryType.BOOLEAN,
		required: false,
		defaultVal: true
	}
]
