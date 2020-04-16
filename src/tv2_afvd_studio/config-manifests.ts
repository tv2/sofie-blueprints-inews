import { DeviceType } from 'timeline-state-resolver-types'
import { ConfigManifestEntry, ConfigManifestEntryType } from 'tv-automation-sofie-blueprints-integration'
import * as _ from 'underscore'
import { AtemSourceIndex } from '../types/atem'

export const CORE_INJECTED_KEYS = ['SofieHostURL']

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
	{
		id: 'SourcesCam',
		name: 'Camera Mapping',
		description: 'Camera number to ATEM input and Sisyfos layer',
		type: ConfigManifestEntryType.TABLE,
		required: true,
		defaultVal: [
			{
				_id: '',
				SourceName: '',
				AtemSource: 0,
				SisyfosLayer: ''
			}
		],
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
					deviceTypes: [DeviceType.SISYFOS]
				},
				required: true,
				multiple: true,
				defaultVal: [],
				rank: 2
			}
		]
	},
	{
		id: 'SourcesRM',
		name: 'RM Mapping',
		description: 'RM number to ATEM input',
		type: ConfigManifestEntryType.TABLE,
		required: false,
		defaultVal: [
			{
				_id: '',
				SourceName: '',
				AtemSource: 0,
				SisyfosLayer: ''
			}
		],
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
					deviceTypes: [DeviceType.SISYFOS]
				},
				required: true,
				multiple: true,
				defaultVal: [],
				rank: 2
			}
		]
	},
	{
		id: 'SourcesDelayedPlayback',
		name: 'EVS Mapping',
		description: 'EVS number to ATEM input',
		type: ConfigManifestEntryType.TABLE,
		required: false,
		defaultVal: [
			{
				_id: '',
				SourceName: '',
				AtemSource: 0,
				SisyfosLayer: ''
			}
		],
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
					deviceTypes: [DeviceType.SISYFOS]
				},
				required: true,
				multiple: true,
				defaultVal: [],
				rank: 2
			}
		]
	},
	{
		/*

		*/
		id: 'SourcesSkype',
		name: 'Skype Mapping',
		description: 'Skype number to ATEM input',
		type: ConfigManifestEntryType.TABLE,
		required: false,
		defaultVal: [
			{
				_id: '',
				SourceName: '',
				AtemSource: 0,
				SisyfosLayer: ''
			}
		],
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
					deviceTypes: [DeviceType.SISYFOS]
				},
				required: true,
				multiple: true,
				defaultVal: [],
				rank: 2
			}
		]
	},
	{
		id: 'ABMediaPlayers',
		name: 'Media Players inputs',
		description: 'ATEM inputs for A/B media players',
		type: ConfigManifestEntryType.TABLE,
		required: false,
		defaultVal: [
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
		],
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
	},
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
		id: 'MaximumKamDisplayDuration',
		name: 'Maximum Kam Display Duration',
		description: 'Maximum duration (ms) to give Kam parts in UI',
		type: ConfigManifestEntryType.NUMBER,
		required: false,
		defaultVal: 10000
	}
]
