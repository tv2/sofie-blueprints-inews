import { SisyfosLLAyer } from './layers'

export interface SisyfosChannel {
	isPgm: 0 | 1 | 2
	label: string
	visibleInStudioA?: boolean
	visibleInStudioB?: boolean
}

export const sisyfosChannels: { [key in SisyfosLLAyer]?: SisyfosChannel } = {
	[SisyfosLLAyer.SisyfosSourceHost_1_ST_A]: {
		isPgm: 0,
		label: 'VÆRT 1',
		visibleInStudioA: true
	},
	[SisyfosLLAyer.SisyfosSourceHost_2_ST_A]: {
		isPgm: 0,
		label: 'VÆRT 2',
		visibleInStudioA: true
	},
	[SisyfosLLAyer.SisyfosSourceGuest_1_ST_A]: {
		isPgm: 0,
		label: 'GÆST 1',
		visibleInStudioA: true
	},
	[SisyfosLLAyer.SisyfosSourceGuest_2_ST_A]: {
		isPgm: 0,
		label: 'GÆST 2',
		visibleInStudioA: true
	},
	[SisyfosLLAyer.SisyfosSourceGuest_3_ST_A]: {
		isPgm: 0,
		label: 'GÆST 3',
		visibleInStudioA: true
	},
	[SisyfosLLAyer.SisyfosSourceGuest_4_ST_A]: {
		isPgm: 0,
		label: 'GÆST 4',
		visibleInStudioA: true
	},
	[SisyfosLLAyer.SisyfosSourceHost_1_ST_B]: {
		isPgm: 0,
		label: 'B-VÆRT 1',
		visibleInStudioB: true
	},
	[SisyfosLLAyer.SisyfosSourceHost_2_ST_B]: {
		isPgm: 0,
		label: 'B-VÆRT 2',
		visibleInStudioB: true
	},
	[SisyfosLLAyer.SisyfosSourceGuest_1_ST_B]: {
		isPgm: 0,
		label: 'B-GÆST 1',
		visibleInStudioB: true
	},
	[SisyfosLLAyer.SisyfosSourceGuest_2_ST_B]: {
		isPgm: 0,
		label: 'B-GÆST 2',
		visibleInStudioB: true
	},
	[SisyfosLLAyer.SisyfosSourceGuest_3_ST_B]: {
		isPgm: 0,
		label: 'B-GÆST 3',
		visibleInStudioB: true
	},
	[SisyfosLLAyer.SisyfosSourceGuest_4_ST_B]: {
		isPgm: 0,
		label: 'B-GÆST 4',
		visibleInStudioB: true
	},
	[SisyfosLLAyer.SisyfosSourceLive_1]: {
		isPgm: 0,
		label: 'LIVE 1',
		visibleInStudioA: true
	},
	[SisyfosLLAyer.SisyfosSourceLive_2]: {
		isPgm: 0,
		label: 'LIVE 2',
		visibleInStudioA: true
	},
	[SisyfosLLAyer.SisyfosSourceLive_3]: {
		isPgm: 0,
		label: 'LIVE 3',
		visibleInStudioA: true
	},
	[SisyfosLLAyer.SisyfosSourceLive_4]: {
		isPgm: 0,
		label: 'LIVE 4',
		visibleInStudioA: true
	},
	[SisyfosLLAyer.SisyfosSourceLive_5]: {
		isPgm: 0,
		label: 'LIVE 5',
		visibleInStudioA: true
	},
	[SisyfosLLAyer.SisyfosSourceLive_6]: {
		isPgm: 0,
		label: 'LIVE 6',
		visibleInStudioA: true
	},
	[SisyfosLLAyer.SisyfosSourceLive_7]: {
		isPgm: 0,
		label: 'LIVE 7',
		visibleInStudioA: true
	},
	[SisyfosLLAyer.SisyfosSourceLive_8]: {
		isPgm: 0,
		label: 'LIVE 8',
		visibleInStudioA: true
	},
	[SisyfosLLAyer.SisyfosSourceLive_9]: {
		isPgm: 0,
		label: 'LIVE 9',
		visibleInStudioA: true
	},
	[SisyfosLLAyer.SisyfosSourceLive_10]: {
		isPgm: 0,
		label: 'LIVE 10',
		visibleInStudioA: true
	},
	[SisyfosLLAyer.SisyfosSourceServerA]: {
		isPgm: 0,
		label: 'Server A',
		visibleInStudioA: true
	},
	[SisyfosLLAyer.SisyfosSourceServerB]: {
		isPgm: 0,
		label: 'Server B',
		visibleInStudioA: true
	},
	// [SisyfosLLAyer.SisyfosSourceServerC]: {
	// 	isPgm: 0,
	// 	label: 'Server C',
	// 	visibleInStudioA: false // for future applications
	// },
	[SisyfosLLAyer.SisyfosSourceEVS_1]: {
		isPgm: 0,
		label: 'EVS 1',
		visibleInStudioA: true
	},
	[SisyfosLLAyer.SisyfosSourceEVS_2]: {
		isPgm: 0,
		label: 'EVS 2',
		visibleInStudioA: true
	},
	[SisyfosLLAyer.SisyfosSourceJingle]: {
		isPgm: 0,
		label: 'JINGLE',
		visibleInStudioA: true
	},
	[SisyfosLLAyer.SisyfosSourceAudiobed]: {
		isPgm: 0,
		label: 'BED',
		visibleInStudioA: true
	},
	[SisyfosLLAyer.SisyfosSourceTLF]: {
		isPgm: 0,
		label: 'TLF',
		visibleInStudioA: true
	}
}
