import { OfftubeSisyfosLLayer } from './layers'

export interface SisyfosChannel {
	isPgm: 0 | 1 | 2
	label: string
}

export const sisyfosChannels: { [key in OfftubeSisyfosLLayer]?: SisyfosChannel } = {
	[OfftubeSisyfosLLayer.SisyfosSourceHost_1_ST_A]: {
		isPgm: 0,
		label: 'VRT 1'
	},
	[OfftubeSisyfosLLayer.SisyfosSourceHost_2_ST_A]: {
		isPgm: 0,
		label: 'VRT 2'
	},
	[OfftubeSisyfosLLayer.SisyfosSourceHost_3_ST_A]: {
		isPgm: 0,
		label: 'VRT 3'
	},
	[OfftubeSisyfosLLayer.SisyfosSourceLive_1]: {
		isPgm: 0,
		label: 'LIVE 1 Stereo'
	},
	[OfftubeSisyfosLLayer.SisyfosSourceLive_2]: {
		isPgm: 0,
		label: 'LIVE 1 5.1'
	},
	[OfftubeSisyfosLLayer.SisyfosSourceWorldFeed_Stereo]: {
		isPgm: 0,
		label: 'Live 2 Stereo'
	},
	[OfftubeSisyfosLLayer.SisyfosSourceWorldFeed_Surround]: {
		isPgm: 0,
		label: 'Live 3 Reporter'
	},
	[OfftubeSisyfosLLayer.SisyfosSourceServerA]: {
		isPgm: 0,
		label: 'Server A'
	},
	[OfftubeSisyfosLLayer.SisyfosSourceServerB]: {
		isPgm: 0,
		label: 'Server B'
	},
	[OfftubeSisyfosLLayer.SisyfosSourceJingle]: {
		isPgm: 0,
		label: 'JINGLE'
	}
}
