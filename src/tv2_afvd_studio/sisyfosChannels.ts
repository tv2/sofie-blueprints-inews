import { SisyfosEVSSource, SisyfosLLAyer } from './layers'

export interface SisyfosChannel {
	isPgm: 0 | 1 | 2
	label: string
	hideInStudioA?: boolean
	hideInStudioB?: boolean
}

export const sisyfosChannels: { [key in SisyfosLLAyer]?: SisyfosChannel } = {
	[SisyfosLLAyer.SisyfosSourceHost_1_ST_A]: {
		isPgm: 0,
		label: 'VRT 1'
	},
	[SisyfosLLAyer.SisyfosSourceHost_2_ST_A]: {
		isPgm: 0,
		label: 'VRT 2'
	},
	[SisyfosLLAyer.SisyfosSourceGuest_1_ST_A]: {
		isPgm: 0,
		label: 'GST 1'
	},
	[SisyfosLLAyer.SisyfosSourceGuest_2_ST_A]: {
		isPgm: 0,
		label: 'GST 2'
	},
	[SisyfosLLAyer.SisyfosSourceGuest_3_ST_A]: {
		isPgm: 0,
		label: 'GST 3'
	},
	[SisyfosLLAyer.SisyfosSourceGuest_4_ST_A]: {
		isPgm: 0,
		label: 'GST 4'
	},
	[SisyfosLLAyer.SisyfosSourceHost_1_ST_B]: {
		isPgm: 0,
		label: 'B-VRT 1',
		hideInStudioA: true
	},
	[SisyfosLLAyer.SisyfosSourceHost_2_ST_B]: {
		isPgm: 0,
		label: 'B-VRT 2',
		hideInStudioA: true
	},
	[SisyfosLLAyer.SisyfosSourceGuest_1_ST_B]: {
		isPgm: 0,
		label: 'B-GST 1',
		hideInStudioA: true
	},
	[SisyfosLLAyer.SisyfosSourceGuest_2_ST_B]: {
		isPgm: 0,
		label: 'B-GST 2',
		hideInStudioA: true
	},
	[SisyfosLLAyer.SisyfosSourceGuest_3_ST_B]: {
		isPgm: 0,
		label: 'B-GST 3',
		hideInStudioA: true
	},
	[SisyfosLLAyer.SisyfosSourceGuest_4_ST_B]: {
		isPgm: 0,
		label: 'B-GST 4',
		hideInStudioA: true
	},
	[SisyfosLLAyer.SisyfosSourceLive_1]: {
		isPgm: 0,
		label: 'LIVE 1'
	},
	[SisyfosLLAyer.SisyfosSourceLive_2]: {
		isPgm: 0,
		label: 'LIVE 2'
	},
	[SisyfosLLAyer.SisyfosSourceLive_3]: {
		isPgm: 0,
		label: 'LIVE 3'
	},
	[SisyfosLLAyer.SisyfosSourceLive_4]: {
		isPgm: 0,
		label: 'LIVE 4'
	},
	[SisyfosLLAyer.SisyfosSourceLive_5]: {
		isPgm: 0,
		label: 'LIVE 5'
	},
	[SisyfosLLAyer.SisyfosSourceLive_6]: {
		isPgm: 0,
		label: 'LIVE 6'
	},
	[SisyfosLLAyer.SisyfosSourceLive_7]: {
		isPgm: 0,
		label: 'LIVE 7'
	},
	[SisyfosLLAyer.SisyfosSourceLive_8]: {
		isPgm: 0,
		label: 'LIVE 8'
	},
	[SisyfosLLAyer.SisyfosSourceLive_9]: {
		isPgm: 0,
		label: 'LIVE 9'
	},
	[SisyfosLLAyer.SisyfosSourceLive_10]: {
		isPgm: 0,
		label: 'LIVE 10'
	},
	[SisyfosLLAyer.SisyfosSourceServerA]: {
		isPgm: 0,
		label: 'Server A'
	},
	[SisyfosLLAyer.SisyfosSourceServerB]: {
		isPgm: 0,
		label: 'Server B'
	},
	// [SisyfosLLAyer.SisyfosSourceServerC]: {
	// 	isPgm: 0,
	// 	label: 'Server C',
	// 	hideInStudioA: false // for future applications
	// },
	[SisyfosEVSSource('1')]: {
		isPgm: 0,
		label: 'EVS 1'
	},
	[SisyfosEVSSource('2')]: {
		isPgm: 0,
		label: 'EVS 2'
	},
	[SisyfosLLAyer.SisyfosSourceJingle]: {
		isPgm: 0,
		label: 'JINGLE'
	},
	[SisyfosLLAyer.SisyfosSourceAudiobed]: {
		isPgm: 0,
		label: 'BED'
	},
	[SisyfosLLAyer.SisyfosSourceTLF]: {
		isPgm: 0,
		label: 'TLF'
	}
}
