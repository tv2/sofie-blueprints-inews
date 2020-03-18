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
	[OfftubeSisyfosLLayer.SisyfosSourceGuest_1_ST_A]: {
		isPgm: 0,
		label: 'GST 1'
	},
	[OfftubeSisyfosLLayer.SisyfosSourceGuest_2_ST_A]: {
		isPgm: 0,
		label: 'GST 2'
	},
	[OfftubeSisyfosLLayer.SisyfosSourceGuest_3_ST_A]: {
		isPgm: 0,
		label: 'GST 3'
	},
	[OfftubeSisyfosLLayer.SisyfosSourceGuest_4_ST_A]: {
		isPgm: 0,
		label: 'GST 4'
	},
	[OfftubeSisyfosLLayer.SisyfosSourceLive_1]: {
		isPgm: 0,
		label: 'LIVE 1'
	},
	[OfftubeSisyfosLLayer.SisyfosSourceLive_2]: {
		isPgm: 0,
		label: 'LIVE 2'
	},
	[OfftubeSisyfosLLayer.SisyfosSourceLive_3]: {
		isPgm: 0,
		label: 'LIVE 3'
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
