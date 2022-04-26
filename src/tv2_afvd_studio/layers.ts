import {
	AbstractLLayer,
	SharedATEMLLayer,
	SharedCasparLLayer,
	SharedGraphicLLayer,
	SharedSisyfosLLayer
} from 'tv2-constants'
import * as _ from 'underscore'

export type LLayer = VirtualAbstractLLayer | AtemLLayer | CasparLLayer | SisyfosLLAyer

/** Get all the Real LLayers (map to devices). Note: Does not include some which are dynamically generated */
export function RealLLayers(): string[] {
	return (
		_.values(AtemLLayer)
			// @ts-ignore
			.concat(_.values(CasparLLayer))
			// @ts-ignore
			.concat(_.values(SisyfosLLAyer))
			// @ts-ignore
			.concat(_.values(AbstractLLayer))
			// @ts-ignore
			.concat(_.values(GraphicLLayer))
			// @ts-ignore
			.concat(_.values(VirtualAbstractLLayer))
	)
}

export enum VirtualAbstractLLayer {}

export enum AFVDAtemLLayer {
	AtemMEProgram = 'atem_me_program',
	AtemMEClean = 'atem_me_clean',
	AtemCleanUSKEffect = 'atem_clean_usk_effect',
	AtemSSrcArt = 'atem_supersource_art',
	AtemSSrcDefault = 'atem_supersource_default',
	AtemSSrcBox1 = 'atem_supersource_z_box1',
	AtemSSrcBox2 = 'atem_supersource_z_box2',
	AtemSSrcBox3 = 'atem_supersource_z_box3',
	AtemSSrcBox4 = 'atem_supersource_z_box4',
	AtemMP1 = 'atem_mp_1',

	AtemAuxPGM = 'atem_aux_pgm',
	AtemAuxClean = 'atem_aux_clean',
	AtemAuxWall = 'atem_aux_wall',
	AtemAuxAR = 'atem_aux_ar',
	AtemAuxVizOvlIn1 = 'atem_aux_viz_ovl_in_1',
	// AtemAuxVizFullIn1 = 'atem_aux_viz_full_in_1',
	AtemAuxVenue = 'atem_aux_venue',
	AtemAuxLookahead = 'atem_aux_lookahead',
	AtemAuxSSrc = 'atem_aux_ssrc'
}

// tslint:disable-next-line: variable-name
export const AtemLLayer = {
	...AFVDAtemLLayer,
	...SharedATEMLLayer
}

export type AtemLLayer = AFVDAtemLLayer | SharedATEMLLayer

enum AFVDCasparLLayer {
	CasparCGDVELoop = 'casparcg_dve_loop',
	CasparCGFullBg = 'casparcg_full_bg',
	CasparCGDVEKey = 'casparcg_dve_key',
	CasparCGDVEFrame = 'casparcg_dve_frame',
	CasparCountdown = 'casparcg_countdown',
	CasparCGDVEKeyedLoop = 'casparcg_dve_keyed_loop'
}

// tslint:disable-next-line: variable-name
export const CasparLLayer = {
	...AFVDCasparLLayer,
	...SharedCasparLLayer
}

export type CasparLLayer = AFVDCasparLLayer | SharedCasparLLayer

enum AFVDGraphicLLayer {
	GraphicLLayerInitialize = 'graphic_initialize',
	GraphicLLayerCleanup = 'graphic_cleanup'
}

// tslint:disable-next-line: variable-name
export const GraphicLLayer = {
	...AFVDGraphicLLayer,
	...SharedGraphicLLayer
}

export type GraphicLLayer = AFVDGraphicLLayer | SharedGraphicLLayer

enum AFVDSisyfosLLAyer {
	SisyfosConfig = 'sisyfos_config',
	SisyfosGroupStudioMics = 'sisyfos_group_studio_mics',
	SisyfosPersistedLevels = 'sisyfos_persisted_levels',
	SisyfosSourceClipPending = 'sisyfos_source_clip_pending',
	SisyfosSourceJingle = 'sisyfos_source_jingle',
	SisyfosSourceTLF = 'sisyfos_source_tlf_hybrid',
	SisyfosSourceHost_1_ST_A = 'sisyfos_source_Host_1_st_a',
	SisyfosSourceHost_2_ST_A = 'sisyfos_source_Host_2_st_a',
	SisyfosSourceGuest_1_ST_A = 'sisyfos_source_Guest_1_st_a',
	SisyfosSourceGuest_2_ST_A = 'sisyfos_source_Guest_2_st_a',
	SisyfosSourceGuest_3_ST_A = 'sisyfos_source_Guest_3_st_a',
	SisyfosSourceGuest_4_ST_A = 'sisyfos_source_Guest_4_st_a',
	SisyfosSourceHost_1_ST_B = 'sisyfos_source_Host_1_st_b',
	SisyfosSourceHost_2_ST_B = 'sisyfos_source_Host_2_st_b',
	SisyfosSourceGuest_1_ST_B = 'sisyfos_source_Guest_1_st_b',
	SisyfosSourceGuest_2_ST_B = 'sisyfos_source_Guest_2_st_b',
	SisyfosSourceGuest_3_ST_B = 'sisyfos_source_Guest_3_st_b',
	SisyfosSourceGuest_4_ST_B = 'sisyfos_source_Guest_4_st_b',
	SisyfosSourceLive_1 = 'sisyfos_source_live_1',
	SisyfosSourceLive_2 = 'sisyfos_source_live_2',
	SisyfosSourceLive_3 = 'sisyfos_source_live_3',
	SisyfosSourceLive_4 = 'sisyfos_source_live_4',
	SisyfosSourceLive_5 = 'sisyfos_source_live_5',
	SisyfosSourceLive_6 = 'sisyfos_source_live_6',
	SisyfosSourceLive_7 = 'sisyfos_source_live_7',
	SisyfosSourceLive_8 = 'sisyfos_source_live_8',
	SisyfosSourceLive_9 = 'sisyfos_source_live_9',
	SisyfosSourceLive_10 = 'sisyfos_source_live_10',
	SisyfosSourceServerA = 'sisyfos_source_server_a',
	SisyfosSourceServerB = 'sisyfos_source_server_b',
	// SisyfosSourceServerC = 'sisyfos_source_server_c',
	SisyfosSourceEVS_1 = 'sisyfos_source_evs_1',
	SisyfosSourceEVS_2 = 'sisyfos_source_evs_2'
}

// tslint:disable-next-line: variable-name
export const SisyfosLLAyer = {
	...SharedSisyfosLLayer,
	...AFVDSisyfosLLAyer
}

export type SisyfosLLAyer = SharedSisyfosLLayer | AFVDSisyfosLLAyer
