import { AbstractLLayer, SharedCasparLLayer, SharedGraphicLLayer, SharedSisyfosLLayer } from 'tv2-constants'
import * as _ from 'underscore'

/** Get all the Real LLayers (map to devices). Note: Does not include some which are dynamically generated */
export function RealLLayers(): string[] {
	return (
		_.values(OfftubeSisyfosLLayer)
			// @ts-ignore
			.concat(_.values(OfftubeCasparLLayer))
			// @ts-ignore
			.concat(_.values(AbstractLLayer))
			// @ts-ignore
			.concat(_.values(SharedGraphicLLayer))
	)
}

enum SisyfosLLayer {
	SisyfosConfig = 'sisyfos_config',
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

enum CasparLLayer {
	/** Maps to the same Caspar layer as CasparPlayerJingle but its lookahead preloads the first frame */
	CasparPlayerJinglePreload = 'casparcg_player_jingle_preload',
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

// tslint:disable-next-line: variable-name
export const OfftubeGraphicLLayer = {
	...SharedGraphicLLayer
}
export type OfftubeGraphicLLayer = SharedGraphicLLayer
