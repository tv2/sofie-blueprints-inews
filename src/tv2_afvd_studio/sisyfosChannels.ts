import { SisyfosLLAyer } from './layers'

export interface SisyfosChannel {
	isPgm: 0 | 1 | 2
	hideInStudioA?: boolean
	hideInStudioB?: boolean
}

export const sisyfosChannels: { [key in SisyfosLLAyer]?: SisyfosChannel } = {
	[SisyfosLLAyer.SisyfosSourceHost_1_ST_A]: {
		isPgm: 0
	},
	[SisyfosLLAyer.SisyfosSourceHost_2_ST_A]: {
		isPgm: 0
	},
	[SisyfosLLAyer.SisyfosSourceGuest_1_ST_A]: {
		isPgm: 0
	},
	[SisyfosLLAyer.SisyfosSourceGuest_2_ST_A]: {
		isPgm: 0
	},
	[SisyfosLLAyer.SisyfosSourceGuest_3_ST_A]: {
		isPgm: 0
	},
	[SisyfosLLAyer.SisyfosSourceGuest_4_ST_A]: {
		isPgm: 0
	},
	[SisyfosLLAyer.SisyfosSourceHost_1_ST_B]: {
		isPgm: 0,
		hideInStudioA: true
	},
	[SisyfosLLAyer.SisyfosSourceHost_2_ST_B]: {
		isPgm: 0,
		hideInStudioA: true
	},
	[SisyfosLLAyer.SisyfosSourceGuest_1_ST_B]: {
		isPgm: 0,
		hideInStudioA: true
	},
	[SisyfosLLAyer.SisyfosSourceGuest_2_ST_B]: {
		isPgm: 0,
		hideInStudioA: true
	},
	[SisyfosLLAyer.SisyfosSourceGuest_3_ST_B]: {
		isPgm: 0,
		hideInStudioA: true
	},
	[SisyfosLLAyer.SisyfosSourceGuest_4_ST_B]: {
		isPgm: 0,
		hideInStudioA: true
	},
	[SisyfosLLAyer.SisyfosSourceLive_1]: {
		isPgm: 0
	},
	[SisyfosLLAyer.SisyfosSourceLive_2]: {
		isPgm: 0
	},
	[SisyfosLLAyer.SisyfosSourceLive_3]: {
		isPgm: 0
	},
	[SisyfosLLAyer.SisyfosSourceLive_4]: {
		isPgm: 0
	},
	[SisyfosLLAyer.SisyfosSourceLive_5]: {
		isPgm: 0
	},
	[SisyfosLLAyer.SisyfosSourceLive_6]: {
		isPgm: 0
	},
	[SisyfosLLAyer.SisyfosSourceLive_7]: {
		isPgm: 0
	},
	[SisyfosLLAyer.SisyfosSourceLive_8]: {
		isPgm: 0
	},
	[SisyfosLLAyer.SisyfosSourceLive_9]: {
		isPgm: 0
	},
	[SisyfosLLAyer.SisyfosSourceLive_10]: {
		isPgm: 0
	},
	[SisyfosLLAyer.SisyfosSourceServerA]: {
		isPgm: 0
	},
	[SisyfosLLAyer.SisyfosSourceServerB]: {
		isPgm: 0
	},
	[SisyfosLLAyer.SisyfosSourceEVS_1]: {
		isPgm: 0
	},
	[SisyfosLLAyer.SisyfosSourceEVS_2]: {
		isPgm: 0
	},
	[SisyfosLLAyer.SisyfosSourceJingle]: {
		isPgm: 0
	},
	[SisyfosLLAyer.SisyfosSourceAudiobed]: {
		isPgm: 0
	},
	[SisyfosLLAyer.SisyfosSourceTLF]: {
		isPgm: 0
	},
	[SisyfosLLAyer.SisyfosSourceEpsio]: {
		isPgm: 0
	}
}
