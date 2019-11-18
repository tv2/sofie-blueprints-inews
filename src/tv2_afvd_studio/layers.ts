import * as _ from 'underscore'

export type LLayer = VirtualAbstractLLayer | AtemLLayer | CasparLLayer | SisyfosLLAyer

/** Get all the Real LLayers (map to devices). Note: Does not include some which are dynamically generated */
export function RealLLayers() {
	return (
		_.values(AtemLLayer)
			// @ts-ignore
			.concat(_.values(CasparLLayer))
			.concat(_.values(SisyfosLLAyer))
			.concat(_.values(VizLLayer))
	)
}
export function VirtualLLayers() {
	return _.values(VirtualAbstractLLayer)
}

export enum VirtualAbstractLLayer {}

export enum AtemLLayer {
	AtemMEProgram = 'atem_me_program',
	AtemMEClean = 'atem_me_clean',
	AtemDSKGraphics = 'atem_dsk_graphics',
	AtemDSKEffect = 'atem_dsk_effect',
	AtemCleanUSKEffect = 'atem_clean_usk_effect',
	AtemSSrcArt = 'atem_supersource_art',
	AtemSSrcDefault = 'atem_supersource_default',

	AtemAuxPGM = 'atem_aux_pgm',
	AtemAuxClean = 'atem_aux_clean',
	AtemAuxWall = 'atem_aux_wall',
	AtemAuxAR = 'atem_aux_ar',
	AtemAuxVizOvlIn1 = 'atem_aux_viz_ovl_in_1',
	AtemAuxVizFullIn1 = 'atem_aux_viz_full_in_1',
	AtemAuxVideoMixMinus = 'atem_aux_video_mix_minus',
	AtemAuxVenue = 'atem_aux_venue',
	AtemAuxLookahead = 'atem_aux_lookahead',
	AtemAuxSSrc = 'atem_aux_ssrc'
}

export enum CasparLLayer {
	CasparPlayerClipPending = 'casparcg_player_clip_pending',
	CasparPlayerJingle = 'casparcg_player_jingle',
	CasparCGDVELoop = 'casparcg_dve_loop',
	CasparCGLYD = 'casparcg_audio_lyd',
	CasparCGDVETemplate = 'casparcg_cg_dve_template',
	CasparCGDVEKey = 'casparcg_dve_key',
	CasparCGDVEFrame = 'casparcg_dve_frame'
}

export enum SisyfosLLAyer {
	SisyfosSourceClipPending = 'sisyfos_source_clip_pending',
	SisyfosSourceJingle = 'sisyfos_source_jingle',
	SisyfosSourceAudio = 'sisyfos_source_audio',
	SisyfosSourceLiveSpeak = 'sisyfos_source_live_speak',
	SisyfosSourceTLF = 'sisyfos_source_tlf_hybrid',
	SisyfosSourceVært_1_ST_A = 'sisyfos_source_vært_1_st_a',
	SisyfosSourceVært_2_ST_A = 'sisyfos_source_vært_2_st_a',
	SisyfosSourceGst_1_ST_A = 'sisyfos_source_gst_1_st_a',
	SisyfosSourceGst_2_ST_A = 'sisyfos_source_gst_2_st_a',
	SisyfosSourceGst_3_ST_A = 'sisyfos_source_gst_3_st_a',
	SisyfosSourceGst_4_ST_A = 'sisyfos_source_gst_4_st_a',
	SisyfosSourceVært_1_ST_B = 'sisyfos_source_vært_1_st_b',
	SisyfosSourceVært_2_ST_B = 'sisyfos_source_vært_2_st_b',
	SisyfosSourceGst_1_ST_B = 'sisyfos_source_gst_1_st_b',
	SisyfosSourceGst_2_ST_B = 'sisyfos_source_gst_2_st_b',
	SisyfosSourceGst_3_ST_B = 'sisyfos_source_gst_3_st_b',
	SisyfosSourceGst_4_ST_B = 'sisyfos_source_gst_4_st_b',
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
	SisyfosSourceEVS_1 = 'sisyfos_source_evs_1',
	SisyfosSourceEVS_2 = 'sisyfos_source_evs_2'
}

export enum VizLLayer {
	VizLLayerOverlay = 'viz_layer_overlay',
	VizLLayerPilot = 'viz_layer_pilot',
	VizLLayerDesign = 'viz_layer_design',
	VizLLayerContinue = 'viz_layer_continue'
}

export function CasparPlayerClip(i: number) {
	return `casparcg_player_clip_${i}`
}

export function SisyfosSourceClip(i: number | string) {
	return `sisyfos_player_clip_${i}`
}
