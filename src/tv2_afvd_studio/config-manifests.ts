import {
	ConfigManifestEntry,
	ConfigManifestEntryTable,
	ConfigManifestEntryType,
	TableConfigItemValue,
	TSR
} from 'tv-automation-sofie-blueprints-integration'
import { literal, TableConfigItemSourceMapping, TableConfigItemSourceMappingWithSisyfos } from 'tv2-common'
import * as _ from 'underscore'
import { AtemSourceIndex } from '../types/atem'
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

export const manifestAFVDSourcesCam: ConfigManifestEntryTable = {
	id: 'SourcesCam',
	name: 'Camera Mapping',
	description: 'Camera number to ATEM input and Sisyfos layer',
	type: ConfigManifestEntryType.TABLE,
	required: true,
	defaultVal: literal<Array<TableConfigItemSourceMappingWithSisyfos & TableConfigItemValue[0]>>([
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
	]),
	columns: [
		{
			id: 'SourceName',
			name: 'Camera name',
			description: 'Camera name as typed in iNews',
			type: ConfigManifestEntryType.STRING,
			required: true,
			defaultVal: '',
			rank: 0
		},
		{
			id: 'AtemSource',
			name: 'ATEM input',
			description: 'ATEM vision mixer input for Camera',
			type: ConfigManifestEntryType.NUMBER,
			required: true,
			defaultVal: 0,
			rank: 1
		},
		{
			id: 'SisyfosLayers',
			name: 'Sisyfos layers',
			description: 'Sisyfos layers for Camera',
			type: ConfigManifestEntryType.LAYER_MAPPINGS,
			filters: {
				deviceTypes: [TSR.DeviceType.SISYFOS]
			},
			required: true,
			multiple: true,
			defaultVal: [],
			rank: 2
		},
		{
			id: 'StudioMics',
			name: 'Use Studio Mics',
			description: 'Add Sisyfos layers for Studio Mics',
			type: ConfigManifestEntryType.BOOLEAN,
			required: true,
			defaultVal: true,
			rank: 3
		}
	]
}

export const manifestAFVDSourcesRM: ConfigManifestEntryTable = {
	id: 'SourcesRM',
	name: 'RM Mapping',
	description: 'RM number to ATEM input',
	type: ConfigManifestEntryType.TABLE,
	required: false,
	defaultVal: literal<Array<TableConfigItemSourceMappingWithSisyfos & TableConfigItemValue[0]>>([
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
	]),
	columns: [
		{
			id: 'SourceName',
			name: 'RM number',
			description: 'RM number as typed in iNews',
			type: ConfigManifestEntryType.STRING,
			required: true,
			defaultVal: '',
			rank: 0
		},
		{
			id: 'AtemSource',
			name: 'ATEM input',
			description: 'ATEM vision mixer input for RM input',
			type: ConfigManifestEntryType.NUMBER,
			required: true,
			defaultVal: 0,
			rank: 1
		},
		{
			id: 'SisyfosLayers',
			name: 'Sisyfos layers',
			description: 'Sisyfos layers for RM input',
			type: ConfigManifestEntryType.LAYER_MAPPINGS,
			filters: {
				deviceTypes: [TSR.DeviceType.SISYFOS]
			},
			required: true,
			multiple: true,
			defaultVal: [],
			rank: 2
		},
		{
			id: 'StudioMics',
			name: 'Use Studio Mics',
			description: 'Add Sisyfos layers for Studio Mics',
			type: ConfigManifestEntryType.BOOLEAN,
			required: true,
			defaultVal: false,
			rank: 3
		},
		{
			id: 'KeepAudioInStudio',
			name: 'Keep audio in Studio',
			description: 'Keep audio in Studio',
			type: ConfigManifestEntryType.BOOLEAN,
			required: true,
			defaultVal: true,
			rank: 4
		}
	]
}

export const manifestAFVDSourcesDelayedPlayback: ConfigManifestEntryTable = {
	id: 'SourcesDelayedPlayback',
	name: 'EVS Mapping',
	description: 'EVS number to ATEM input',
	type: ConfigManifestEntryType.TABLE,
	required: false,
	defaultVal: literal<Array<TableConfigItemSourceMappingWithSisyfos & TableConfigItemValue[0]>>([
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
	]),
	columns: [
		{
			id: 'SourceName',
			name: 'EVS number',
			description: 'EVS number as typed in iNews',
			type: ConfigManifestEntryType.STRING,
			required: true,
			defaultVal: '',
			rank: 0
		},
		{
			id: 'AtemSource',
			name: 'ATEM input',
			description: 'ATEM vision mixer input for RM input',
			type: ConfigManifestEntryType.NUMBER,
			required: true,
			defaultVal: 0,
			rank: 1
		},
		{
			id: 'SisyfosLayers',
			name: 'Sisyfos layers',
			description: 'Sisyfos layers for EVS input',
			type: ConfigManifestEntryType.LAYER_MAPPINGS,
			filters: {
				deviceTypes: [TSR.DeviceType.SISYFOS]
			},
			required: true,
			multiple: true,
			defaultVal: [],
			rank: 2
		},
		{
			id: 'StudioMics',
			name: 'Use Studio Mics',
			description: 'Add Sisyfos layers for Studio Mics',
			type: ConfigManifestEntryType.BOOLEAN,
			required: true,
			defaultVal: true,
			rank: 3
		}
	]
}

export const manifestAFVDSourcesSkype: ConfigManifestEntryTable = {
	/*

	*/
	id: 'SourcesSkype',
	name: 'Skype Mapping',
	description: 'Skype number to ATEM input',
	type: ConfigManifestEntryType.TABLE,
	required: false,
	defaultVal: literal<Array<TableConfigItemSourceMappingWithSisyfos & TableConfigItemValue[0]>>([
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
	]),
	columns: [
		{
			id: 'SourceName',
			name: 'Skype number',
			description: 'Skype number as typed in iNews',
			type: ConfigManifestEntryType.STRING,
			required: true,
			defaultVal: '',
			rank: 0
		},
		{
			id: 'AtemSource',
			name: 'ATEM input',
			description: 'ATEM vision mixer input for Skype input',
			type: ConfigManifestEntryType.NUMBER,
			required: true,
			defaultVal: 0,
			rank: 1
		},
		{
			id: 'SisyfosLayers',
			name: 'Sisyfos layers',
			description: 'Sisyfos layers for Skype input',
			type: ConfigManifestEntryType.LAYER_MAPPINGS,
			filters: {
				deviceTypes: [TSR.DeviceType.SISYFOS]
			},
			required: true,
			multiple: true,
			defaultVal: [],
			rank: 2
		},
		{
			id: 'StudioMics',
			name: 'Use Studio Mics',
			description: 'Add Sisyfos layers for Studio Mics',
			type: ConfigManifestEntryType.BOOLEAN,
			required: true,
			defaultVal: false,
			rank: 3
		}
	]
}

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

export const studioConfigManifest: ConfigManifestEntry[] = [
	{
		id: 'MediaFlowId',
		name: 'Media Flow Id',
		description: '',
		type: ConfigManifestEntryType.STRING,
		required: false,
		defaultVal: 'flow0'
	},
	{
		id: 'ClipFileExtension',
		name: 'Clip files extension',
		description: 'Default file extension to clips to fetch from Omneon and play at CasparCG',
		type: ConfigManifestEntryType.STRING,
		required: true,
		defaultVal: '.mxf'
	},
	{
		id: 'ClipSourcePath',
		name: 'Network base path',
		description:
			'The base path for the Omneon network share. Needs to match the base path of the source in Media manager', // @todo: stupid dependency
		type: ConfigManifestEntryType.STRING,
		required: true,
		defaultVal: ''
	},
	manifestAFVDSourcesCam,
	manifestAFVDSourcesRM,
	manifestAFVDSourcesDelayedPlayback,
	manifestAFVDSourcesSkype,
	manifestAFVDSourcesABMediaPlayers,
	manifestAFVDStudioMics,
	{
		id: 'ABPlaybackDebugLogging',
		name: 'Media players selection debug logging',
		description: 'Enable debug logging for A/B media player selection',
		type: ConfigManifestEntryType.BOOLEAN,
		required: false,
		defaultVal: false
	},
	{
		id: 'AtemSource.DSK1F',
		name: 'ATEM DSK1 Fill',
		description: 'ATEM vision mixer input for DSK1 Fill',
		type: ConfigManifestEntryType.NUMBER,
		required: false,
		defaultVal: 21
	},
	{
		id: 'AtemSource.DSK1K',
		name: 'ATEM DSK1 Key',
		description: 'ATEM vision mixer input for DSK1 Key',
		type: ConfigManifestEntryType.NUMBER,
		required: false,
		defaultVal: 34
	},
	{
		id: 'AtemSource.ServerC',
		name: 'CasparCG Server C',
		description: 'ATEM vision mixer input for ServerC',
		type: ConfigManifestEntryType.NUMBER,
		required: false,
		defaultVal: 28
	},
	{
		id: 'AtemSource.JingleFill',
		name: 'Jingle Fill Source',
		description: 'ATEM vision mixer input for Jingle Fill',
		type: ConfigManifestEntryType.NUMBER,
		required: false,
		defaultVal: 29
	},
	{
		id: 'AtemSource.JingleKey',
		name: 'Jingle Key Source',
		description: 'ATEM vision mixer input for Jingle Source',
		type: ConfigManifestEntryType.NUMBER,
		required: false,
		defaultVal: 31
	},
	{
		id: 'AtemSettings.VizClip',
		name: 'Viz keyer clip',
		description: 'Viz keyer clip',
		type: ConfigManifestEntryType.NUMBER,
		required: false,
		defaultVal: 50.0
	},
	{
		id: 'AtemSettings.VizGain',
		name: 'Viz keyer gain',
		description: 'Viz keyer gain',
		type: ConfigManifestEntryType.NUMBER,
		required: false,
		defaultVal: 12.5
	},
	{
		id: 'AtemSettings.CCGClip',
		name: 'CasparCG keyer clip',
		description: 'CasparCG keyer clip',
		type: ConfigManifestEntryType.NUMBER,
		required: false,
		defaultVal: 50.0
	},
	{
		id: 'AtemSettings.CCGGain',
		name: 'CasparCG keyer gain',
		description: 'CasparCG keyer gain',
		type: ConfigManifestEntryType.NUMBER,
		required: false,
		defaultVal: 12.5
	},
	{
		id: 'AtemSource.SplitArtF',
		name: 'ATEM Split Screen Art Fill',
		description: 'ATEM vision mixer input for Split Screen Art Fill',
		type: ConfigManifestEntryType.NUMBER,
		required: false,
		defaultVal: 30
	},
	{
		id: 'AtemSource.SplitArtK',
		name: 'ATEM Split Screen Art Key',
		description: 'ATEM vision mixer input for Split Screen Art Key',
		type: ConfigManifestEntryType.NUMBER,
		required: false,
		defaultVal: 32
	},
	{
		id: 'AtemSource.FullFrameGrafikBackground',
		name: 'Full frame grafik background source',
		description: 'ATEM source for mos full-frame grafik background source',
		type: ConfigManifestEntryType.NUMBER,
		required: false,
		defaultVal: 36
	},
	{
		id: 'AtemSource.Default',
		name: 'ATEM Default source',
		description: 'ATEM vision mixer default source',
		type: ConfigManifestEntryType.NUMBER,
		required: false,
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
		required: false,
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
		required: false,
		defaultVal: 200 // 5 frames
	},
	{
		id: 'PilotPrerollDuration',
		name: 'Pilot Preroll Duration',
		description: 'ms of preroll before switching to Pilot elements',
		type: ConfigManifestEntryType.NUMBER,
		required: false,
		defaultVal: 2000
	},
	{
		id: 'PilotKeepaliveDuration',
		name: 'Pilot Keepalive Duration',
		description: 'ms to keep old part alive before switching to Pilot elements',
		type: ConfigManifestEntryType.NUMBER,
		required: false,
		defaultVal: 2000
	},
	{
		id: 'PilotOutTransitionDuration',
		name: 'Pilot Out Transition Duration',
		description: 'ms to keep pilot elements alive before transition to next part',
		type: ConfigManifestEntryType.NUMBER,
		required: false,
		defaultVal: 1000
	},
	{
		id: 'PilotCutToMediaPlayer',
		name: 'Pilot media Player Cut Point',
		description: 'ms from start of grafik before switching to background source',
		type: ConfigManifestEntryType.NUMBER,
		required: false,
		defaultVal: 500
	},
	{
		id: 'ATEMDelay',
		name: 'ATEM Delay',
		description: 'Frames of latency in ATEM',
		type: ConfigManifestEntryType.NUMBER,
		required: false,
		defaultVal: 1
	},
	{
		id: 'MaximumPartDuration',
		name: 'Maximum Part Duration',
		description: 'Maximum duration (ms) to give parts in UI',
		type: ConfigManifestEntryType.NUMBER,
		required: false,
		defaultVal: 10000
	},
	{
		id: 'DefaultPartDuration',
		name: 'Default Part Duration',
		description: 'Duration to give parts by default',
		type: ConfigManifestEntryType.NUMBER,
		required: false,
		defaultVal: 4000
	}
]
