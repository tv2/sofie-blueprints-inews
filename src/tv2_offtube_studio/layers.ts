import * as _ from 'underscore'

/** Get all the Real LLayers (map to devices). Note: Does not include some which are dynamically generated */
export function RealLLayers() {
	return (
		_.values(OfftubeAbstractLLayer)
			// @ts-ignore
			.concat(_.values(OfftubeSisyfosLLayer))
			.concat(_.values(OfftubeAtemLLayer))
	)
}

export enum OfftubeAbstractLLayer {
	/** Contains the classes to enable infinites */
	OfftubeAbstractLLayerPgmEnabler = 'offtube_abstract_pgm_enabler'
}

export enum OfftubeSisyfosLLayer {
	SisyfosSourceClipPending = 'sisyfos_source_clip_pending',
	SisyfosSourceJingle = 'sisyfos_source_jingle',
	SisyfosSourceHost_1_ST_A = 'sisyfos_source_Host_1_st_a',
	SisyfosSourceHost_2_ST_A = 'sisyfos_source_Host_2_st_a',
	SisyfosSourceGuest_1_ST_A = 'sisyfos_source_Guest_1_st_a',
	SisyfosSourceGuest_2_ST_A = 'sisyfos_source_Guest_2_st_a',
	SisyfosSourceGuest_3_ST_A = 'sisyfos_source_Guest_3_st_a',
	SisyfosSourceGuest_4_ST_A = 'sisyfos_source_Guest_4_st_a',
	SisyfosSourceLive_1 = 'sisyfos_source_live_1',
	SisyfosSourceLive_2 = 'sisyfos_source_live_2',
	SisyfosSourceLive_3 = 'sisyfos_source_live_3',
	SisyfosSourceServerA = 'sisyfos_source_server_a',
	SisyfosSourceServerB = 'sisyfos_source_server_b'
}

export enum OfftubeAtemLLayer {
	AtemMEProgram = 'atem_me_program',
	AtemMEClean = 'atem_me_clean',
	AtemDSKGraphics = 'atem_dsk_graphics',
	AtemCleanUSKEffect = 'atem_clean_usk_effect',
	AtemSSrcArt = 'atem_supersource_art',
	AtemSSrcDefault = 'atem_supersource_default',
	AtemAuxClean = 'atem_aux_clean'
}
