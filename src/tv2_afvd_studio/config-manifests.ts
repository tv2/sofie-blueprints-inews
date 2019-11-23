import { ConfigManifestEntry, ConfigManifestEntryType } from 'tv-automation-sofie-blueprints-integration'
import * as _ from 'underscore'
import { AtemSourceIndex } from '../types/atem'

export const CORE_INJECTED_KEYS = ['SofieHostURL']

export enum MediaPlayerType {
	CasparWithNext = 'CasparWithNext',
	CasparAB = 'CasparAB'
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
		id: 'SourcesCam',
		name: 'Camera Mapping',
		description: 'Camera number to ATEM input (eg 1:1,9:2)',
		type: ConfigManifestEntryType.STRING,
		required: true,
		defaultVal: '1:11,2:12,3:13,4:14,5:15,1S:16,2S:17,3S:18,4S:19,5S:20'
	},
	{
		id: 'SourcesRM',
		name: 'RM Mapping',
		description: 'RM number to ATEM input (eg 1:6,2:7)',
		type: ConfigManifestEntryType.STRING,
		required: false,
		defaultVal: '1:1,2:2,3:3,4:4,5:5,6:6,7:7,8:8,9:9,10:10'
	},
	{
		id: 'SourcesSkype',
		name: 'Skype Mapping',
		description: 'Skype number to ATEM input (eg 1:6,2:7)',
		type: ConfigManifestEntryType.STRING,
		required: false,
		defaultVal: '1:1,2:2,3:3,4:4,5:5,6:6,7:7,8:8,9:9,10:10'
	},
	{
		id: 'MediaPlayerType',
		name: 'Media player type',
		description: 'Type of media player to use',
		type: ConfigManifestEntryType.ENUM,
		options: _.values(MediaPlayerType),
		required: true,
		defaultVal: MediaPlayerType.CasparAB
	},
	{
		id: 'ABMediaPlayers',
		name: 'Media Players inputs',
		description: 'ATEM inputs for A/B media players',
		type: ConfigManifestEntryType.STRING,
		required: false,
		defaultVal: '1:26,2:27'
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
		id: 'CasparOutputDelay',
		name: 'CasparCG Output latency',
		description: 'Delay between playback and output on SDI (ms)',
		type: ConfigManifestEntryType.NUMBER,
		required: false,
		defaultVal: 320 // 8 frames (5 in decklinks + casparcg)
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
	}
]
