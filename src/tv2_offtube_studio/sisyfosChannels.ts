import { OfftubeSisyfosLLayer } from './layers'

export interface SisyfosChannel {
	isPgm: 0 | 1 | 2
}

export const sisyfosChannels: { [key in OfftubeSisyfosLLayer]?: SisyfosChannel } = {
	[OfftubeSisyfosLLayer.SisyfosSourceHost_1_ST_A]: {
		isPgm: 0
	},
	[OfftubeSisyfosLLayer.SisyfosSourceHost_2_ST_A]: {
		isPgm: 0
	},
	[OfftubeSisyfosLLayer.SisyfosSourceHost_3_ST_A]: {
		isPgm: 0
	},
	[OfftubeSisyfosLLayer.SisyfosSourceLive_1_Stereo]: {
		isPgm: 0
	},
	[OfftubeSisyfosLLayer.SisyfosSourceLive_1_Surround]: {
		isPgm: 0
	},
	[OfftubeSisyfosLLayer.SisyfosSourceLive_2_Stereo]: {
		isPgm: 0
	},
	[OfftubeSisyfosLLayer.SisyfosSourceLive_3]: {
		isPgm: 0
	},
	[OfftubeSisyfosLLayer.SisyfosSourceServerA]: {
		isPgm: 0
	},
	[OfftubeSisyfosLLayer.SisyfosSourceServerB]: {
		isPgm: 0
	},
	[OfftubeSisyfosLLayer.SisyfosSourceJingle]: {
		isPgm: 0
	},
	[OfftubeSisyfosLLayer.SisyfosSourceAudiobed]: {
		isPgm: 0
	},
	[OfftubeSisyfosLLayer.SisyfosN1]: {
		isPgm: 0
	},
	[OfftubeSisyfosLLayer.SisyfosSourceDisp1]: {
		isPgm: 0
	},
	[OfftubeSisyfosLLayer.SisyfosSourceDisp1]: {
		isPgm: 0
	}
}
