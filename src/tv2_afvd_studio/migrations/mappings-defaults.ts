import {
	DeviceType,
	MappingAbstract,
	MappingAtem,
	MappingAtemType,
	MappingCasparCG,
	MappingSisyfos,
	MappingVizMSE
} from 'timeline-state-resolver-types'
import { BlueprintMapping, BlueprintMappings, LookaheadMode } from 'tv-automation-sofie-blueprints-integration'
import { literal } from 'tv2-common'
import * as _ from 'underscore'
import { BlueprintConfig, StudioConfig } from '../helpers/config'

export default literal<BlueprintMappings>({
	core_abstract: literal<MappingAbstract & BlueprintMapping>({
		device: DeviceType.ABSTRACT,
		deviceId: 'abstract0',
		lookahead: LookaheadMode.NONE
	}),
	casparcg_dve_loop: literal<MappingCasparCG & BlueprintMapping>({
		device: DeviceType.CASPARCG,
		deviceId: 'caspar02',
		lookahead: LookaheadMode.RETAIN,
		previewWhenNotOnAir: true,
		channel: 2,
		layer: 110
	}),
	casparcg_full_bg: literal<MappingCasparCG & BlueprintMapping>({
		device: DeviceType.CASPARCG,
		deviceId: 'caspar02',
		lookahead: LookaheadMode.NONE,
		channel: 4,
		layer: 110
	}),
	casparcg_cg_dve_template: literal<MappingCasparCG & BlueprintMapping>({
		device: DeviceType.CASPARCG,
		deviceId: 'caspar02',
		lookahead: LookaheadMode.RETAIN,
		channel: 2,
		layer: 120
	}),
	casparcg_dve_key: literal<MappingCasparCG & BlueprintMapping>({
		device: DeviceType.CASPARCG,
		deviceId: 'caspar02',
		lookahead: LookaheadMode.RETAIN,
		previewWhenNotOnAir: true,
		channel: 2,
		layer: 109
	}),
	casparcg_dve_frame: literal<MappingCasparCG & BlueprintMapping>({
		device: DeviceType.CASPARCG,
		deviceId: 'caspar02',
		lookahead: LookaheadMode.RETAIN,
		previewWhenNotOnAir: true,
		channel: 2,
		layer: 111
	}),
	casparcg_player_jingle: literal<MappingCasparCG & BlueprintMapping>({
		device: DeviceType.CASPARCG,
		deviceId: 'caspar02',
		lookahead: LookaheadMode.PRELOAD,
		channel: 1,
		layer: 120,
		previewWhenNotOnAir: true
	}),
	casparcg_countdown: literal<MappingCasparCG & BlueprintMapping>({
		device: DeviceType.CASPARCG,
		deviceId: 'caspar02',
		lookahead: LookaheadMode.NONE,
		previewWhenNotOnAir: true,
		channel: 3,
		layer: 120
	}),
	casparcg_audio_lyd: literal<MappingCasparCG & BlueprintMapping>({
		device: DeviceType.CASPARCG,
		deviceId: 'caspar02',
		lookahead: LookaheadMode.PRELOAD,
		channel: 1,
		layer: 101
	}),
	atem_me_program: literal<MappingAtem & BlueprintMapping>({
		device: DeviceType.ATEM,
		deviceId: 'atem0',
		lookahead: LookaheadMode.NONE,
		mappingType: MappingAtemType.MixEffect,
		index: 0 // 0 = ME1
	}),
	atem_me_clean: literal<MappingAtem & BlueprintMapping>({
		device: DeviceType.ATEM,
		deviceId: 'atem0',
		lookahead: LookaheadMode.NONE,
		mappingType: MappingAtemType.MixEffect,
		index: 3 // 3 = ME4
	}),
	atem_clean_usk_effect: literal<MappingAtem & BlueprintMapping>({
		device: DeviceType.ATEM,
		deviceId: 'atem0',
		lookahead: LookaheadMode.NONE,
		mappingType: MappingAtemType.MixEffect,
		index: 3 // 3 = ME4
	}),
	atem_aux_pgm: literal<MappingAtem & BlueprintMapping>({
		device: DeviceType.ATEM,
		deviceId: 'atem0',
		lookahead: LookaheadMode.NONE,
		mappingType: MappingAtemType.Auxilliary,
		index: 0 // 0 = out 1
	}),
	atem_aux_clean: literal<MappingAtem & BlueprintMapping>({
		device: DeviceType.ATEM,
		deviceId: 'atem0',
		lookahead: LookaheadMode.NONE,
		mappingType: MappingAtemType.Auxilliary,
		index: 1 // 1 = out 2
	}),
	atem_aux_wall: literal<MappingAtem & BlueprintMapping>({
		device: DeviceType.ATEM,
		deviceId: 'atem0',
		lookahead: LookaheadMode.WHEN_CLEAR,
		mappingType: MappingAtemType.Auxilliary,
		index: 2 // 2 = out 3
	}),
	atem_aux_ar: literal<MappingAtem & BlueprintMapping>({
		device: DeviceType.ATEM,
		deviceId: 'atem0',
		lookahead: LookaheadMode.WHEN_CLEAR,
		mappingType: MappingAtemType.Auxilliary,
		index: 3 // 3 = out 4
	}),
	atem_aux_viz_ovl_in_1: literal<MappingAtem & BlueprintMapping>({
		device: DeviceType.ATEM,
		deviceId: 'atem0',
		lookahead: LookaheadMode.WHEN_CLEAR,
		mappingType: MappingAtemType.Auxilliary,
		index: 4 // 4 = out 5
	}),
	// atem_aux_viz_full_in_1: literal<MappingAtem & BlueprintMapping>({
	// 	device: DeviceType.ATEM,
	// 	deviceId: 'atem0',
	// 	lookahead: LookaheadMode.WHEN_CLEAR,
	// 	mappingType: MappingAtemType.Auxilliary,
	// 	index: 5 // 5 = out 6
	// }),
	atem_aux_video_mix_minus: literal<MappingAtem & BlueprintMapping>({
		device: DeviceType.ATEM,
		deviceId: 'atem0',
		lookahead: LookaheadMode.WHEN_CLEAR,
		mappingType: MappingAtemType.Auxilliary,
		index: 6 // 6 = out 7
	}),
	atem_aux_venue: literal<MappingAtem & BlueprintMapping>({
		device: DeviceType.ATEM,
		deviceId: 'atem0',
		lookahead: LookaheadMode.WHEN_CLEAR,
		mappingType: MappingAtemType.Auxilliary,
		index: 7 // 7 = out 8
	}),
	atem_aux_lookahead: literal<MappingAtem & BlueprintMapping>({
		device: DeviceType.ATEM,
		deviceId: 'atem0',
		lookahead: LookaheadMode.WHEN_CLEAR,
		mappingType: MappingAtemType.Auxilliary,
		index: 10 // 10 = out 11
	}),
	atem_aux_ssrc: literal<MappingAtem & BlueprintMapping>({
		device: DeviceType.ATEM,
		deviceId: 'atem0',
		lookahead: LookaheadMode.WHEN_CLEAR,
		mappingType: MappingAtemType.Auxilliary,
		index: 11 // 11 = out 12
	}),
	atem_dsk_graphics: literal<MappingAtem & BlueprintMapping>({
		device: DeviceType.ATEM,
		deviceId: 'atem0',
		lookahead: LookaheadMode.NONE,
		mappingType: MappingAtemType.DownStreamKeyer,
		index: 0 // 0 = DSK1
	}),
	atem_dsk_effect: literal<MappingAtem & BlueprintMapping>({
		device: DeviceType.ATEM,
		deviceId: 'atem0',
		lookahead: LookaheadMode.NONE,
		mappingType: MappingAtemType.DownStreamKeyer,
		index: 1 // 1 = DSK2
	}),
	atem_supersource_art: literal<MappingAtem & BlueprintMapping>({
		device: DeviceType.ATEM,
		deviceId: 'atem0',
		lookahead: LookaheadMode.NONE,
		mappingType: MappingAtemType.SuperSourceProperties,
		index: 0 // 0 = SS
	}),
	atem_supersource_default: literal<MappingAtem & BlueprintMapping>({
		device: DeviceType.ATEM,
		deviceId: 'atem0',
		lookahead: LookaheadMode.RETAIN, // TODO - verify
		mappingType: MappingAtemType.SuperSourceBox,
		index: 0 // 0 = SS
	}),
	atem_supersource_z_box1: literal<MappingAtem & BlueprintMapping>({
		device: DeviceType.ATEM,
		deviceId: 'atem0',
		lookahead: LookaheadMode.WHEN_CLEAR,
		lookaheadMaxSearchDistance: 1,
		mappingType: MappingAtemType.SuperSourceBox,
		index: 0 // 0 = SS
	}),
	atem_supersource_z_box2: literal<MappingAtem & BlueprintMapping>({
		device: DeviceType.ATEM,
		deviceId: 'atem0',
		lookahead: LookaheadMode.WHEN_CLEAR,
		lookaheadMaxSearchDistance: 1,
		mappingType: MappingAtemType.SuperSourceBox,
		index: 0 // 0 = SS
	}),
	atem_supersource_z_box3: literal<MappingAtem & BlueprintMapping>({
		device: DeviceType.ATEM,
		deviceId: 'atem0',
		lookahead: LookaheadMode.WHEN_CLEAR,
		lookaheadMaxSearchDistance: 1,
		mappingType: MappingAtemType.SuperSourceBox,
		index: 0 // 0 = SS
	}),
	atem_supersource_z_box4: literal<MappingAtem & BlueprintMapping>({
		device: DeviceType.ATEM,
		deviceId: 'atem0',
		lookahead: LookaheadMode.WHEN_CLEAR,
		lookaheadMaxSearchDistance: 1,
		mappingType: MappingAtemType.SuperSourceBox,
		index: 0 // 0 = SS
	}),
	casparcg_player_clip_pending: literal<MappingAbstract & BlueprintMapping>({
		device: DeviceType.ABSTRACT,
		deviceId: 'abstract0',
		lookahead: LookaheadMode.PRELOAD,
		lookaheadDepth: 2
	}),
	casparcg_player_clip_1: literal<MappingCasparCG & BlueprintMapping>({
		device: DeviceType.CASPARCG,
		deviceId: 'caspar01',
		lookahead: LookaheadMode.NONE,
		channel: 1,
		layer: 110,
		previewWhenNotOnAir: true
	}),
	casparcg_player_clip_2: literal<MappingCasparCG & BlueprintMapping>({
		device: DeviceType.CASPARCG,
		deviceId: 'caspar01',
		lookahead: LookaheadMode.NONE,
		channel: 2,
		layer: 110,
		previewWhenNotOnAir: true
	}),
	casparcg_player_clip_1_loading_loop: literal<MappingCasparCG & BlueprintMapping>({
		device: DeviceType.CASPARCG,
		deviceId: 'caspar01',
		lookahead: LookaheadMode.NONE,
		channel: 1,
		layer: 109
	}),
	casparcg_player_clip_2_loading_loop: literal<MappingCasparCG & BlueprintMapping>({
		device: DeviceType.CASPARCG,
		deviceId: 'caspar01',
		lookahead: LookaheadMode.NONE,
		channel: 2,
		layer: 109
	}),
	sisyfos_source_clip_pending: literal<MappingAbstract & BlueprintMapping>({
		device: DeviceType.ABSTRACT,
		deviceId: 'abstract0',
		lookahead: LookaheadMode.NONE
	}),
	sisyfos_source_Host_1_st_a: literal<MappingSisyfos & BlueprintMapping>({
		device: DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		channel: 0,
		lookahead: LookaheadMode.NONE
	}),
	sisyfos_source_Host_2_st_a: literal<MappingSisyfos & BlueprintMapping>({
		device: DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		channel: 1,
		lookahead: LookaheadMode.NONE
	}),
	sisyfos_source_Guest_1_st_a: literal<MappingSisyfos & BlueprintMapping>({
		device: DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		channel: 2,
		lookahead: LookaheadMode.NONE
	}),
	sisyfos_source_Guest_2_st_a: literal<MappingSisyfos & BlueprintMapping>({
		device: DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		channel: 3,
		lookahead: LookaheadMode.NONE
	}),
	sisyfos_source_Guest_3_st_a: literal<MappingSisyfos & BlueprintMapping>({
		device: DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		channel: 4,
		lookahead: LookaheadMode.NONE
	}),
	sisyfos_source_Guest_4_st_a: literal<MappingSisyfos & BlueprintMapping>({
		device: DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		channel: 5,
		lookahead: LookaheadMode.NONE
	}),
	sisyfos_source_Host_1_st_b: literal<MappingSisyfos & BlueprintMapping>({
		device: DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		channel: 6,
		lookahead: LookaheadMode.NONE
	}),
	sisyfos_source_Host_2_st_b: literal<MappingSisyfos & BlueprintMapping>({
		device: DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		channel: 7,
		lookahead: LookaheadMode.NONE
	}),
	sisyfos_source_Guest_1_st_b: literal<MappingSisyfos & BlueprintMapping>({
		device: DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		channel: 8,
		lookahead: LookaheadMode.NONE
	}),
	sisyfos_source_Guest_2_st_b: literal<MappingSisyfos & BlueprintMapping>({
		device: DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		channel: 9,
		lookahead: LookaheadMode.NONE
	}),
	sisyfos_source_Guest_3_st_b: literal<MappingSisyfos & BlueprintMapping>({
		device: DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		channel: 10,
		lookahead: LookaheadMode.NONE
	}),
	sisyfos_source_Guest_4_st_b: literal<MappingSisyfos & BlueprintMapping>({
		device: DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		channel: 11,
		lookahead: LookaheadMode.NONE
	}),
	sisyfos_source_live_1: literal<MappingSisyfos & BlueprintMapping>({
		device: DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		channel: 12,
		lookahead: LookaheadMode.NONE
	}),
	sisyfos_source_live_2: literal<MappingSisyfos & BlueprintMapping>({
		device: DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		channel: 13,
		lookahead: LookaheadMode.NONE
	}),
	sisyfos_source_live_3: literal<MappingSisyfos & BlueprintMapping>({
		device: DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		channel: 14,
		lookahead: LookaheadMode.NONE
	}),
	sisyfos_source_live_4: literal<MappingSisyfos & BlueprintMapping>({
		device: DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		channel: 15,
		lookahead: LookaheadMode.NONE
	}),
	sisyfos_source_live_5: literal<MappingSisyfos & BlueprintMapping>({
		device: DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		channel: 16,
		lookahead: LookaheadMode.NONE
	}),
	sisyfos_source_live_6: literal<MappingSisyfos & BlueprintMapping>({
		device: DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		channel: 17,
		lookahead: LookaheadMode.NONE
	}),
	sisyfos_source_live_7: literal<MappingSisyfos & BlueprintMapping>({
		device: DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		channel: 18,
		lookahead: LookaheadMode.NONE
	}),
	sisyfos_source_live_8: literal<MappingSisyfos & BlueprintMapping>({
		device: DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		channel: 19,
		lookahead: LookaheadMode.NONE
	}),
	sisyfos_source_live_9: literal<MappingSisyfos & BlueprintMapping>({
		device: DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		channel: 20,
		lookahead: LookaheadMode.NONE
	}),
	sisyfos_source_live_10: literal<MappingSisyfos & BlueprintMapping>({
		device: DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		channel: 21,
		lookahead: LookaheadMode.NONE
	}),
	sisyfos_source_server_a: literal<MappingSisyfos & BlueprintMapping>({
		device: DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		channel: 22,
		lookahead: LookaheadMode.NONE
	}),
	sisyfos_source_server_b: literal<MappingSisyfos & BlueprintMapping>({
		device: DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		channel: 23,
		lookahead: LookaheadMode.NONE
	}),
	// sisyfos_source_server_c: literal<MappingSisyfos & BlueprintMapping>({
	// 	device: DeviceType.SISYFOS,
	// 	deviceId: 'sisyfos0',
	// 	channel: 24,
	// 	lookahead: LookaheadMode.NONE
	// }),
	sisyfos_source_evs_1: literal<MappingSisyfos & BlueprintMapping>({
		device: DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		channel: 24,
		lookahead: LookaheadMode.NONE
	}),
	sisyfos_source_evs_2: literal<MappingSisyfos & BlueprintMapping>({
		device: DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		channel: 25,
		lookahead: LookaheadMode.NONE
	}),
	sisyfos_source_jingle: literal<MappingSisyfos & BlueprintMapping>({
		device: DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		channel: 26,
		lookahead: LookaheadMode.NONE
	}),
	sisyfos_source_audiobed: literal<MappingSisyfos & BlueprintMapping>({
		device: DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		channel: 27,
		lookahead: LookaheadMode.NONE
	}),
	sisyfos_source_tlf_hybrid: literal<MappingSisyfos & BlueprintMapping>({
		device: DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		channel: 28,
		lookahead: LookaheadMode.NONE
	}),
	sisyfos_resync: literal<MappingSisyfos & BlueprintMapping>({
		device: DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		channel: -1,
		lookahead: LookaheadMode.NONE
	}),
	viz_layer_overlay: literal<MappingVizMSE & BlueprintMapping>({
		device: DeviceType.VIZMSE,
		deviceId: 'viz0',
		lookahead: LookaheadMode.NONE
	}),
	viz_layer_overlay_ident: literal<MappingVizMSE & BlueprintMapping>({
		device: DeviceType.VIZMSE,
		deviceId: 'viz0',
		lookahead: LookaheadMode.NONE
	}),
	viz_layer_overlay_topt: literal<MappingVizMSE & BlueprintMapping>({
		device: DeviceType.VIZMSE,
		deviceId: 'viz0',
		lookahead: LookaheadMode.NONE
	}),
	viz_layer_overlay_lower: literal<MappingVizMSE & BlueprintMapping>({
		device: DeviceType.VIZMSE,
		deviceId: 'viz0',
		lookahead: LookaheadMode.NONE
	}),
	viz_layer_overlay_headline: literal<MappingVizMSE & BlueprintMapping>({
		device: DeviceType.VIZMSE,
		deviceId: 'viz0',
		lookahead: LookaheadMode.NONE
	}),
	viz_layer_overlay_tema: literal<MappingVizMSE & BlueprintMapping>({
		device: DeviceType.VIZMSE,
		deviceId: 'viz0',
		lookahead: LookaheadMode.NONE
	}),
	viz_layer_pilot: literal<MappingVizMSE & BlueprintMapping>({
		device: DeviceType.VIZMSE,
		deviceId: 'viz0',
		lookahead: LookaheadMode.NONE
	}),
	viz_layer_pilot_overlay: literal<MappingVizMSE & BlueprintMapping>({
		device: DeviceType.VIZMSE,
		deviceId: 'viz0',
		lookahead: LookaheadMode.NONE
	}),
	viz_layer_design: literal<MappingVizMSE & BlueprintMapping>({
		device: DeviceType.VIZMSE,
		deviceId: 'viz0',
		lookahead: LookaheadMode.NONE
	}),
	viz_layer_adlibs: literal<MappingVizMSE & BlueprintMapping>({
		device: DeviceType.VIZMSE,
		deviceId: 'viz0',
		lookahead: LookaheadMode.NONE
	}),
	viz_layer_wall: literal<MappingVizMSE & BlueprintMapping>({
		device: DeviceType.VIZMSE,
		deviceId: 'viz0',
		lookahead: LookaheadMode.NONE
	})
})

export function getCameraSisyfosMappings(cameras: StudioConfig['SourcesCam']) {
	const res: BlueprintMappings = {}
	cameras.forEach(cam => {
		if (cam.SisyfosLayer && typeof cam.SisyfosLayer === 'string') {
			res[cam.SisyfosLayer] = literal<MappingSisyfos & BlueprintMapping>({
				device: DeviceType.SISYFOS,
				deviceId: 'sisyfos0',
				lookahead: LookaheadMode.NONE,
				channel: (cam.AtemSource as number) || 0
			})
		}
	})

	return res
}

export function getRemoteSisyfosMappings(remotes: StudioConfig['SourcesRM']) {
	const res: BlueprintMappings = {}
	remotes.forEach(rmt => {
		if (rmt.SourceName !== undefined && rmt.AtemSource !== undefined) {
			res[`sisyfos_remote_source_${rmt.SourceName}`] = literal<MappingSisyfos & BlueprintMapping>({
				device: DeviceType.SISYFOS,
				deviceId: 'sisyfos0',
				lookahead: LookaheadMode.NONE,
				channel: (rmt.AtemSource as number) || 0
			})

			res[`sisyfos_remote_source_${rmt.SourceName}_spor_2`] = literal<MappingSisyfos & BlueprintMapping>({
				device: DeviceType.SISYFOS,
				deviceId: 'sisyfos0',
				lookahead: LookaheadMode.NONE,
				channel: (rmt.AtemSource as number) || 0
			})

			res[`sisyfos_remote_source_${rmt.SourceName}_stereo`] = literal<MappingSisyfos & BlueprintMapping>({
				device: DeviceType.SISYFOS,
				deviceId: 'sisyfos0',
				lookahead: LookaheadMode.NONE,
				channel: (rmt.AtemSource as number) || 0
			})
		}
	})

	return res
}

export function getSkypeSisyfosMappings(remotes: StudioConfig['SourcesSkype']) {
	const res: BlueprintMappings = {}
	remotes.forEach(rmt => {
		if (rmt.SourceName !== undefined && rmt.AtemSource !== undefined) {
			res[`sisyfos_remote_source_skype_${rmt.SourceName}`] = literal<MappingSisyfos & BlueprintMapping>({
				device: DeviceType.SISYFOS,
				deviceId: 'sisyfos0',
				lookahead: LookaheadMode.NONE,
				channel: (rmt.AtemSource as number) || 0
			})

			res[`sisyfos_remote_source_skype_${rmt.SourceName}_spor_2`] = literal<MappingSisyfos & BlueprintMapping>({
				device: DeviceType.SISYFOS,
				deviceId: 'sisyfos0',
				lookahead: LookaheadMode.NONE,
				channel: (rmt.AtemSource as number) || 0
			})

			res[`sisyfos_remote_source_skype_${rmt.SourceName}_stereo`] = literal<MappingSisyfos & BlueprintMapping>({
				device: DeviceType.SISYFOS,
				deviceId: 'sisyfos0',
				lookahead: LookaheadMode.NONE,
				channel: (rmt.AtemSource as number) || 0
			})
		}
	})

	return res
}

export function getTelefonSisyfosMappings(mappings: string) {
	const res: BlueprintMappings = {}
	const telefons = mappings.split(',')
	telefons.forEach(tlf => {
		const props = tlf.split(':')
		if (props[0] && props[1]) {
			res[`sisyfos_telefon_source_${props[0].replace(' ', '_').trim()}`] = literal<MappingSisyfos & BlueprintMapping>({
				device: DeviceType.SISYFOS,
				deviceId: 'sisyfos0',
				lookahead: LookaheadMode.NONE,
				channel: Number(props[1]) || 0
			})
		}
	})

	return res
}

export function getMediaPlayerMappings(mediaPlayers: BlueprintConfig['mediaPlayers']) {
	const res: BlueprintMappings = {
		casparcg_player_clip_pending: literal<MappingAbstract & BlueprintMapping>({
			device: DeviceType.ABSTRACT,
			deviceId: 'abstract0',
			lookahead: LookaheadMode.PRELOAD,
			lookaheadDepth: mediaPlayers.length // Number of players
		}),
		sisyfos_source_clip_pending: literal<MappingAbstract & BlueprintMapping>({
			device: DeviceType.ABSTRACT,
			deviceId: 'abstract0',
			lookahead: LookaheadMode.NONE
		})
	}

	for (const mp of mediaPlayers) {
		res[`casparcg_player_clip_${mp.id}`] = literal<MappingCasparCG & BlueprintMapping>({
			device: DeviceType.CASPARCG,
			deviceId: 'caspar01',
			lookahead: LookaheadMode.NONE,
			channel: 0, // TODO?
			layer: 110
		})
		res[`sisyfos_player_clip_${mp.id}`] = literal<MappingSisyfos & BlueprintMapping>({
			device: DeviceType.SISYFOS,
			deviceId: 'sisyfos0',
			lookahead: LookaheadMode.NONE,
			channel: Number(mp.id) || 0
		})
	}

	return res
}
