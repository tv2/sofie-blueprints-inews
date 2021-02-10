import {
	ConfigManifestEntry,
	ConfigManifestEntryTable,
	ConfigManifestEntryType,
	TableConfigItemValue,
	TSR
} from '@sofie-automation/blueprints-integration'
import { literal, TableConfigItemSourceMapping, TableConfigItemSourceMappingWithSisyfos } from 'tv2-common'
import * as _ from 'underscore'
import { AtemSourceIndex } from '../types/atem'
import { OfftubeSisyfosLLayer } from './layers'

export const CORE_INJECTED_KEYS = ['SofieHostURL']

const DEFAULT_STUDIO_MICS_LAYERS = [
	OfftubeSisyfosLLayer.SisyfosSourceHost_1_ST_A,
	OfftubeSisyfosLLayer.SisyfosSourceHost_2_ST_A,
	OfftubeSisyfosLLayer.SisyfosSourceHost_3_ST_A
]

export const manifestOfftubeSourcesCam: ConfigManifestEntryTable = {
	id: 'SourcesCam',
	name: 'Camera Mapping',
	description: 'Camera number to ATEM input and Sisyfos layer',
	type: ConfigManifestEntryType.TABLE,
	required: true,
	defaultVal: literal<Array<TableConfigItemSourceMappingWithSisyfos & TableConfigItemValue[0]>>([
		{
			_id: '',
			SourceName: '1',
			AtemSource: 4,
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

export const manifestOfftubeSourcesRM: ConfigManifestEntryTable = {
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
			SisyfosLayers: [
				OfftubeSisyfosLLayer.SisyfosSourceLive_1_Stereo,
				OfftubeSisyfosLLayer.SisyfosSourceLive_1_Surround
			],
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
		},
		{
			_id: '',
			SourceName: '3',
			AtemSource: 3,
			SisyfosLayers: [OfftubeSisyfosLLayer.SisyfosSourceLive_3],
			StudioMics: true,
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
			defaultVal: true,
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

export const manifestOfftubeSourcesSkype: ConfigManifestEntryTable = {
	id: 'SourcesSkype',
	name: 'Skype Mapping',
	description: 'Skype number to ATEM input',
	type: ConfigManifestEntryType.TABLE,
	required: false,
	defaultVal: literal<Array<TableConfigItemSourceMappingWithSisyfos & TableConfigItemValue[0]>>([]),
	columns: [
		{
			id: 'SourceName',
			name: 'Name',
			description: 'Source name as typed in iNews',
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
			defaultVal: true,
			rank: 3
		}
	]
}

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
		id: 'GraphicFlowId',
		name: 'Graphic Flow Id',
		description: '',
		type: ConfigManifestEntryType.STRING,
		required: false,
		defaultVal: 'flow1'
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
		id: 'NetworkBasePath',
		name: 'Network base path',
		description:
			'The base path for the Omneon network share. Needs to match the base path of the source in Media manager', // @todo: stupid dependency
		type: ConfigManifestEntryType.STRING,
		required: true,
		defaultVal: ''
	},
	{
		id: 'GraphicBasePath',
		name: 'Graphic Network base path',
		description: '',
		type: ConfigManifestEntryType.STRING,
		required: true,
		defaultVal: ''
	},
	{
		id: 'JingleBasePath',
		name: 'Jingle base path',
		description: 'The base path for jingle clips',
		type: ConfigManifestEntryType.STRING,
		required: true,
		defaultVal: 'jingler'
	},
	{
		id: 'ClipBasePath',
		name: 'Clip base path',
		description: 'The base path for server clips',
		type: ConfigManifestEntryType.STRING,
		required: true,
		defaultVal: 'clips'
	},
	manifestOfftubeSourcesCam,
	manifestOfftubeSourcesRM,
	manifestOfftubeSourcesSkype,
	manifestOfftubeSourcesABMediaPlayers,
	manifestOfftubeStudioMics,
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
		defaultVal: 7
	},
	{
		id: 'AtemSource.DSK1K',
		name: 'ATEM DSK1 Key',
		description: 'ATEM vision mixer input for DSK1 Key',
		type: ConfigManifestEntryType.NUMBER,
		required: false,
		defaultVal: 8
	},
	{
		id: 'AtemSource.JingleFill',
		name: 'Jingle Fill Source',
		description: 'ATEM vision mixer input for Jingle Fill',
		type: ConfigManifestEntryType.NUMBER,
		required: false,
		defaultVal: 7
	},
	{
		id: 'AtemSource.JingleKey',
		name: 'Jingle Key Source',
		description: 'ATEM vision mixer input for Jingle Source',
		type: ConfigManifestEntryType.NUMBER,
		required: false,
		defaultVal: 8
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
		defaultVal: 10
	},
	{
		id: 'AtemSource.SplitArtK',
		name: 'ATEM Split Screen Art Key',
		description: 'ATEM vision mixer input for Split Screen Art Key',
		type: ConfigManifestEntryType.NUMBER,
		required: false,
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
		id: 'AtemSource.GFXFull',
		name: 'Full graphics source',
		description: 'ATEM source for full graphics',
		type: ConfigManifestEntryType.NUMBER,
		required: false,
		defaultVal: 7
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
		required: false,
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
	},
	{
		id: 'IdleSource',
		name: 'Idle Source',
		description: 'Source to display when studio is off-air',
		type: ConfigManifestEntryType.NUMBER,
		required: false,
		defaultVal: 1
	},
	{
		id: 'FullKeepAliveDuration',
		name: 'Full Keep Alive Duration',
		description: 'How long to keep the old part alive when going to a full',
		type: ConfigManifestEntryType.NUMBER,
		required: false,
		defaultVal: 1000
	},
	{
		id: 'FullGraphicURL',
		name: 'Full Graphic URL',
		description: 'URL to serve full graphics from',
		type: ConfigManifestEntryType.STRING,
		required: false,
		defaultVal: 'localhost'
	},
	{
		id: 'ServerPostrollDuration',
		name: 'Server Postroll Duration',
		description: 'ms of postroll at the end of Server and VO clips',
		type: ConfigManifestEntryType.NUMBER,
		required: false,
		defaultVal: 0
	},
	{
		id: 'FullTransitionSettings.wipeRate',
		name: 'Full graphic background loop wipe duration',
		description: 'Frames (max 250) over which to wipe background loop behind Full',
		type: ConfigManifestEntryType.NUMBER,
		required: true,
		defaultVal: 20
	}
]
