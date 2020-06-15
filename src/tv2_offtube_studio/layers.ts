import { GraphicLLayer } from 'tv2-common'
import * as _ from 'underscore'

/** Get all the Real LLayers (map to devices). Note: Does not include some which are dynamically generated */
export function RealLLayers() {
	return (
		_.values(OfftubeAbstractLLayer)
			// @ts-ignore
			.concat(_.values(OfftubeSisyfosLLayer))
			.concat(_.values(OfftubeAtemLLayer))
			.concat(_.values(OfftubeCasparLLayer))
			.concat(_.values(GraphicLLayer))
	)
}

export enum OfftubeAbstractLLayer {
	/** Contains the classes to enable infinites */
	OfftubeAbstractLLayerPgmEnabler = 'offtube_abstract_pgm_enabler',
	OfftubeAbstractLLayerServerEnable = 'offtube_abstract_server_enable',
	OfftubeAbstractLLayerAbstractLookahead = 'offtube_abstract_layer_abstract_lookahead'
}

export enum OfftubeSisyfosLLayer {
	SisyfosSourceClipPending = 'sisyfos_source_clip_pending',
	SisyfosSourceJingle = 'sisyfos_source_jingle',
	SisyfosSourceHost_1_ST_A = 'sisyfos_source_Host_1_st_a',
	SisyfosSourceHost_2_ST_A = 'sisyfos_source_Host_2_st_a',
	SisyfosSourceHost_3_ST_A = 'sisyfos_source_Host_3_st_a',
	SisyfosSourceLive_1 = 'sisyfos_source_live_1',
	SisyfosSourceLive_2 = 'sisyfos_source_live_2',
	SisyfosSourceWorldFeed_Stereo = 'sisyfos_source_world_feed_stereo',
	SisyfosSourceWorldFeed_Surround = 'sisyfos_source_world_feed_surround',
	SisyfosSourceServerA = 'sisyfos_source_server_a',
	SisyfosSourceServerB = 'sisyfos_source_server_b'
}

export enum OfftubeAtemLLayer {
	AtemMEClean = 'atem_me_clean',
	AtemDSKGraphics = 'atem_dsk_graphics',
	AtemMEProgram = 'atem_me_program',
	AtemMENext = 'atem_me_next',
	AtemMENextJingle = 'atem_me_next_jingle',
	AtemSSrcArt = 'atem_supersource_art',
	AtemSSrcDefault = 'atem_supersource_default',
	AtemAuxClean = 'atem_aux_clean',
	AtemAuxScreen = 'atem_aux_screen',
	AtemAuxServerLookahead = 'atem_aux_server_lookahead',
	AtemSSrcBox1 = 'atem_supersource_z_box1',
	AtemSSrcBox2 = 'atem_supersource_z_box2',
	AtemSSrcBox3 = 'atem_supersource_z_box3',
	AtemSSrcBox4 = 'atem_supersource_z_box4'
}

export enum OfftubeCasparLLayer {
	CasparPlayerClipPending = 'casparcg_player_clip_pending', // TODO: This is a shared layer
	CasparGraphicsOverlay = 'casparcg_graphics_overlay',
	CasparPlayerJingle = 'casparcg_player_jingle',
	CasparGraphicsFull = 'casparcg_graphics_full',
	CasparCGDVELoop = 'casparcg_dve_loop',
	CasparCGDVEKeyedLoop = 'casparcg_dve_keyed_loop',
	CasparCGDVETemplate = 'casparcg_cg_dve_template',
	CasparCGDVEKey = 'casparcg_dve_key',
	CasparCGDVEFrame = 'casparcg_dve_frame',
	CasparStudioScreenLoop = 'casparcg_studio_screen_loop'
}

export function CasparPlayerClip(i: number | string) {
	return `casparcg_player_clip_${i}`
}

export function CasparPlayerClipLoadingLoop(i: number | string) {
	return `casparcg_player_clip_${i}_loading_loop`
}
