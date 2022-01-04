import { AbstractLLayer, GraphicLLayer, SharedCasparLLayer, SharedSisyfosLLayer } from 'tv2-constants'
import * as _ from 'underscore'

/** Get all the Real LLayers (map to devices). Note: Does not include some which are dynamically generated */
export function RealLLayers(): string[] {
	return (
		_.values(OfftubeAbstractLLayer)
			// @ts-ignore
			.concat(_.values(OfftubeSisyfosLLayer))
			// @ts-ignore
			.concat(_.values(OfftubeAtemLLayer))
			// @ts-ignore
			.concat(_.values(OfftubeCasparLLayer))
			// @ts-ignore
			.concat(_.values(AbstractLLayer))
			// @ts-ignore
			.concat(_.values(GraphicLLayer))
	)
}

export enum OfftubeAbstractLLayer {
	/** Contains the classes to enable infinites */
	OfftubeAbstractLLayerAbstractLookahead = 'offtube_abstract_layer_abstract_lookahead'
}

enum SisyfosLLayer {
	SisyfosConfig = 'sisyfos_config',
	SisyfosGroupStudioMics = 'sisyfos_group_studio_mics',
	SisyfosGroupServer = 'sisyfos_group_server',
	SisyfosPersistedLevels = 'sisyfos_persisted_levels',
	SisyfosSourceClipPending = 'sisyfos_source_clip_pending',
	SisyfosSourceJingle = 'sisyfos_source_jingle',
	SisyfosSourceHost_1_ST_A = 'sisyfos_source_Host_1_st_a',
	SisyfosSourceHost_2_ST_A = 'sisyfos_source_Host_2_st_a',
	SisyfosSourceHost_3_ST_A = 'sisyfos_source_Host_3_st_a',
	SisyfosSourceLive_1_Stereo = 'sisyfos_source_live_1_stereo',
	SisyfosSourceLive_1_Surround = 'sisyfos_source_live_1_surround',
	SisyfosSourceLive_2_Stereo = 'sisyfos_source_live_2_stereo',
	SisyfosSourceLive_3 = 'sisyfos_source_live_3',
	SisyfosSourceServerA = 'sisyfos_source_server_a',
	SisyfosSourceServerB = 'sisyfos_source_server_b',
	// We don't control this layer, just set the label
	SisyfosN1 = 'sisyfos_source_n1',
	SisyfosSourceDisp1 = 'sisyfos_source_disp_1',
	SisyfosSourceDisp2 = 'sisyfos_source_disp_2'
}

export enum OfftubeAtemLLayer {
	AtemMEClean = 'atem_me_clean',
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

enum CasparLLayer {
	CasparPlayerJingleLookahead = 'casparcg_player_jingle_looakhead',
	CasparGraphicsFullLoop = 'casparcg_graphics_full_loop',
	CasparCGDVELoop = 'casparcg_dve_loop',
	CasparCGDVEKeyedLoop = 'casparcg_dve_keyed_loop',
	CasparCGDVEKey = 'casparcg_dve_key',
	CasparCGDVEFrame = 'casparcg_dve_frame'
}

// tslint:disable-next-line: variable-name
export const OfftubeCasparLLayer = {
	...CasparLLayer,
	...SharedCasparLLayer
}

export type OfftubeCasparLLayer = CasparLLayer | SharedCasparLLayer

// tslint:disable-next-line: variable-name
export const OfftubeSisyfosLLayer = {
	...SharedSisyfosLLayer,
	...SisyfosLLayer
}

export type OfftubeSisyfosLLayer = SharedSisyfosLLayer | SisyfosLLayer
