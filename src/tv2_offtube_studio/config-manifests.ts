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
import { OfftubeSisyfosLLayer } from './layers'

export const CORE_INJECTED_KEYS = ['SofieHostURL']

const DEFAULT_STUDIO_MICS_LAYERS = [
	OfftubeSisyfosLLayer.SisyfosSourceHost_1_ST_A,
	OfftubeSisyfosLLayer.SisyfosSourceHost_2_ST_A,
	OfftubeSisyfosLLayer.SisyfosSourceHost_3_ST_A
]

export const manifestOfftubeSourcesCam = MakeConfigForSources('Cam', 'Cameras', false, [
	{
		_id: '',
		SourceName: '1',
		AtemSource: 4,
		SisyfosLayers: [],
		StudioMics: true
	}
])

export const manifestOfftubeSourcesRM = MakeConfigForSources('RM', 'Live', true, [
	{
		_id: '',
		SourceName: '1',
		AtemSource: 3,
		SisyfosLayers: [OfftubeSisyfosLLayer.SisyfosSourceLive_3],
		StudioMics: true,
		KeepAudioInStudio: true
	}
])

export const manifestOfftubeSourcesFeed = MakeConfigForSources('Feed', 'Feed', true, [
	{
		_id: '',
		SourceName: '1',
		AtemSource: 1,
		SisyfosLayers: [OfftubeSisyfosLLayer.SisyfosSourceLive_1_Stereo, OfftubeSisyfosLLayer.SisyfosSourceLive_1_Surround],
		StudioMics: true,
		KeepAudioInStudio: true
	},
	{
		_id: '',
		SourceName: '2',
		AtemSource: 2,
		SisyfosLayers: [OfftubeSisyfosLLayer.SisyfosSourceLive_2_Stereo],
		StudioMics: true,
		KeepAudioInStudio: true
	}
])

export const manifestOfftubeSourcesSkype = MakeConfigForSources('Skype', 'Skype', false, [])

export const manifestOfftubeSourcesABMediaPlayers: ConfigManifestEntryTable = {
	id: 'ABMediaPlayers',
	name: 'Media Players inputs',
	description: 'ATEM inputs for A/B media players',
	type: ConfigManifestEntryType.TABLE,
	required: false,
	defaultVal: literal<Array<TableConfigItemSourceMapping & TableConfigItemValue[0]>>([
		{
			_id: '',
			SourceName: '1',
			AtemSource: 5
		},
		{
			_id: '',
			SourceName: '2',
			AtemSource: 6
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

export const manifestOfftubeStudioMics: ConfigManifestEntry = {
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

export const manifestOfftubeDownstreamKeyers: ConfigManifestEntryTable = DSKConfigManifest(defaultDSKConfig)

export const studioConfigManifest: ConfigManifestEntry[] = [
	...MakeConfigWithMediaFlow('Clip', '', 'flow0', '.mxf', '', false),
	...MakeConfigWithMediaFlow('Jingle', '', 'flow1', '.mov', 'jingler', false),
	...MakeConfigWithMediaFlow('Graphic', '', 'flow2', '.png', '', false),
	manifestOfftubeSourcesCam,
	manifestOfftubeSourcesRM,
	manifestOfftubeSourcesFeed,
	manifestOfftubeSourcesSkype,
	manifestOfftubeSourcesABMediaPlayers,
	manifestOfftubeStudioMics,
	manifestOfftubeDownstreamKeyers,
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
		defaultVal: 10
	},
	{
		id: 'AtemSource.SplitArtK',
		name: 'ATEM Split Screen Art Key',
		description: 'ATEM vision mixer input for Split Screen Art Key',
		type: ConfigManifestEntryType.NUMBER,
		required: true,
		defaultVal: 9
	},
	{
		id: 'AtemSource.SplitBackground',
		name: 'ATEM split screen background loop source',
		description: 'ATEM source for mos full-frame grafik background source',
		type: ConfigManifestEntryType.NUMBER,
		required: false,
		defaultVal: 11
	},
	{
		id: 'AtemSource.Loop',
		name: 'Studio screen loop graphics source',
		description: 'ATEM source for loop for studio screen',
		type: ConfigManifestEntryType.NUMBER,
		required: false,
		defaultVal: 12
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
		id: 'AtemSource.Continuity',
		name: 'ATEM continuity source',
		description: 'ATEM input for continuity',
		type: ConfigManifestEntryType.NUMBER,
		required: true,
		defaultVal: AtemSourceIndex.Col2
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
		id: 'IdleSource',
		name: 'Idle Source',
		description: 'Source to display when studio is off-air',
		type: ConfigManifestEntryType.NUMBER,
		required: true,
		defaultVal: 1
	},
	{
		id: 'IdleSisyfosLayers',
		name: 'Idle Sisyfos Layers',
		description: 'Sisyfos Layers active (fader on PGM level) when studio is off-air',
		type: ConfigManifestEntryType.LAYER_MAPPINGS,
		filters: {
			deviceTypes: [TSR.DeviceType.SISYFOS]
		},
		multiple: true,
		defaultVal: [OfftubeSisyfosLLayer.SisyfosSourceLive_1_Stereo, OfftubeSisyfosLLayer.SisyfosSourceLive_1_Surround],
		required: true
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
		defaultVal: 'HTML',
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
		id: 'VizPilotGraphics.FullGraphicBackground',
		name: 'Full frame grafik background source',
		description: 'ATEM source for mos full-frame grafik background source',
		type: ConfigManifestEntryType.NUMBER,
		required: false,
		defaultVal: 0
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
