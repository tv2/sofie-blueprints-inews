import { BlueprintMapping, BlueprintMappings, LookaheadMode, TSR } from 'tv-automation-sofie-blueprints-integration'
import { literal } from 'tv2-common'
import * as _ from 'underscore'
import { BlueprintConfig, StudioConfig } from '../helpers/config'

export default literal<BlueprintMappings>({
	core_abstract: literal<TSR.MappingAbstract & BlueprintMapping>({
		device: TSR.DeviceType.ABSTRACT,
		deviceId: 'abstract0',
		lookahead: LookaheadMode.NONE
	}),
	casparcg_dve_loop: literal<TSR.MappingCasparCG & BlueprintMapping>({
		device: TSR.DeviceType.CASPARCG,
		deviceId: 'caspar02',
		lookahead: LookaheadMode.WHEN_CLEAR,
		previewWhenNotOnAir: true,
		channel: 2,
		layer: 110
	}),
	casparcg_full_bg: literal<TSR.MappingCasparCG & BlueprintMapping>({
		device: TSR.DeviceType.CASPARCG,
		deviceId: 'caspar02',
		lookahead: LookaheadMode.NONE,
		channel: 4,
		layer: 110
	}),
	casparcg_cg_dve_template: literal<TSR.MappingCasparCG & BlueprintMapping>({
		device: TSR.DeviceType.CASPARCG,
		deviceId: 'caspar02',
		lookahead: LookaheadMode.WHEN_CLEAR,
		channel: 2,
		layer: 120
	}),
	casparcg_dve_key: literal<TSR.MappingCasparCG & BlueprintMapping>({
		device: TSR.DeviceType.CASPARCG,
		deviceId: 'caspar02',
		lookahead: LookaheadMode.WHEN_CLEAR,
		previewWhenNotOnAir: true,
		channel: 2,
		layer: 109
	}),
	casparcg_dve_frame: literal<TSR.MappingCasparCG & BlueprintMapping>({
		device: TSR.DeviceType.CASPARCG,
		deviceId: 'caspar02',
		lookahead: LookaheadMode.WHEN_CLEAR,
		previewWhenNotOnAir: true,
		channel: 2,
		layer: 111
	}),
	casparcg_player_jingle: literal<TSR.MappingCasparCG & BlueprintMapping>({
		device: TSR.DeviceType.CASPARCG,
		deviceId: 'caspar02',
		lookahead: LookaheadMode.PRELOAD,
		channel: 1,
		layer: 120,
		previewWhenNotOnAir: true
	}),
	casparcg_countdown: literal<TSR.MappingCasparCG & BlueprintMapping>({
		device: TSR.DeviceType.CASPARCG,
		deviceId: 'caspar02',
		lookahead: LookaheadMode.NONE,
		previewWhenNotOnAir: true,
		channel: 3,
		layer: 120
	}),
	casparcg_audio_lyd: literal<TSR.MappingCasparCG & BlueprintMapping>({
		device: TSR.DeviceType.CASPARCG,
		deviceId: 'caspar02',
		lookahead: LookaheadMode.PRELOAD,
		channel: 1,
		layer: 101
	}),
	atem_me_program: literal<TSR.MappingAtem & BlueprintMapping>({
		device: TSR.DeviceType.ATEM,
		deviceId: 'atem0',
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingAtemType.MixEffect,
		index: 0 // 0 = ME1
	}),
	atem_me_clean: literal<TSR.MappingAtem & BlueprintMapping>({
		device: TSR.DeviceType.ATEM,
		deviceId: 'atem0',
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingAtemType.MixEffect,
		index: 3 // 3 = ME4
	}),
	atem_clean_usk_effect: literal<TSR.MappingAtem & BlueprintMapping>({
		device: TSR.DeviceType.ATEM,
		deviceId: 'atem0',
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingAtemType.MixEffect,
		index: 3 // 3 = ME4
	}),
	atem_aux_pgm: literal<TSR.MappingAtem & BlueprintMapping>({
		device: TSR.DeviceType.ATEM,
		deviceId: 'atem0',
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingAtemType.Auxilliary,
		index: 0 // 0 = out 1
	}),
	atem_aux_clean: literal<TSR.MappingAtem & BlueprintMapping>({
		device: TSR.DeviceType.ATEM,
		deviceId: 'atem0',
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingAtemType.Auxilliary,
		index: 1 // 1 = out 2
	}),
	atem_aux_wall: literal<TSR.MappingAtem & BlueprintMapping>({
		device: TSR.DeviceType.ATEM,
		deviceId: 'atem0',
		lookahead: LookaheadMode.WHEN_CLEAR,
		mappingType: TSR.MappingAtemType.Auxilliary,
		index: 2 // 2 = out 3
	}),
	atem_aux_ar: literal<TSR.MappingAtem & BlueprintMapping>({
		device: TSR.DeviceType.ATEM,
		deviceId: 'atem0',
		lookahead: LookaheadMode.WHEN_CLEAR,
		mappingType: TSR.MappingAtemType.Auxilliary,
		index: 3 // 3 = out 4
	}),
	atem_aux_viz_ovl_in_1: literal<TSR.MappingAtem & BlueprintMapping>({
		device: TSR.DeviceType.ATEM,
		deviceId: 'atem0',
		lookahead: LookaheadMode.WHEN_CLEAR,
		mappingType: TSR.MappingAtemType.Auxilliary,
		index: 4 // 4 = out 5
	}),
	// atem_aux_viz_full_in_1: literal<TSR.MappingAtem & BlueprintMapping>({
	// 	device: TSR.DeviceType.ATEM,
	// 	deviceId: 'atem0',
	// 	lookahead: LookaheadMode.WHEN_CLEAR,
	// 	mappingType: TSR.MappingAtemType.Auxilliary,
	// 	index: 5 // 5 = out 6
	// }),
	atem_aux_video_mix_minus: literal<TSR.MappingAtem & BlueprintMapping>({
		device: TSR.DeviceType.ATEM,
		deviceId: 'atem0',
		lookahead: LookaheadMode.WHEN_CLEAR,
		mappingType: TSR.MappingAtemType.Auxilliary,
		index: 6 // 6 = out 7
	}),
	atem_aux_venue: literal<TSR.MappingAtem & BlueprintMapping>({
		device: TSR.DeviceType.ATEM,
		deviceId: 'atem0',
		lookahead: LookaheadMode.WHEN_CLEAR,
		mappingType: TSR.MappingAtemType.Auxilliary,
		index: 7 // 7 = out 8
	}),
	atem_aux_lookahead: literal<TSR.MappingAtem & BlueprintMapping>({
		device: TSR.DeviceType.ATEM,
		deviceId: 'atem0',
		lookahead: LookaheadMode.WHEN_CLEAR,
		mappingType: TSR.MappingAtemType.Auxilliary,
		index: 10 // 10 = out 11
	}),
	atem_aux_ssrc: literal<TSR.MappingAtem & BlueprintMapping>({
		device: TSR.DeviceType.ATEM,
		deviceId: 'atem0',
		lookahead: LookaheadMode.WHEN_CLEAR,
		mappingType: TSR.MappingAtemType.Auxilliary,
		index: 11 // 11 = out 12
	}),
	atem_dsk_graphics: literal<TSR.MappingAtem & BlueprintMapping>({
		device: TSR.DeviceType.ATEM,
		deviceId: 'atem0',
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingAtemType.DownStreamKeyer,
		index: 0 // 0 = DSK1
	}),
	atem_dsk_effect: literal<TSR.MappingAtem & BlueprintMapping>({
		device: TSR.DeviceType.ATEM,
		deviceId: 'atem0',
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingAtemType.DownStreamKeyer,
		index: 1 // 1 = DSK2
	}),
	atem_supersource_art: literal<TSR.MappingAtem & BlueprintMapping>({
		device: TSR.DeviceType.ATEM,
		deviceId: 'atem0',
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingAtemType.SuperSourceProperties,
		index: 0 // 0 = SS
	}),
	atem_supersource_default: literal<TSR.MappingAtem & BlueprintMapping>({
		device: TSR.DeviceType.ATEM,
		deviceId: 'atem0',
		lookahead: LookaheadMode.WHEN_CLEAR, // TODO - verify
		mappingType: TSR.MappingAtemType.SuperSourceBox,
		index: 0 // 0 = SS
	}),
	atem_supersource_z_box1: literal<TSR.MappingAtem & BlueprintMapping>({
		device: TSR.DeviceType.ATEM,
		deviceId: 'atem0',
		lookahead: LookaheadMode.WHEN_CLEAR,
		lookaheadMaxSearchDistance: 1,
		mappingType: TSR.MappingAtemType.SuperSourceBox,
		index: 0 // 0 = SS
	}),
	atem_supersource_z_box2: literal<TSR.MappingAtem & BlueprintMapping>({
		device: TSR.DeviceType.ATEM,
		deviceId: 'atem0',
		lookahead: LookaheadMode.WHEN_CLEAR,
		lookaheadMaxSearchDistance: 1,
		mappingType: TSR.MappingAtemType.SuperSourceBox,
		index: 0 // 0 = SS
	}),
	atem_supersource_z_box3: literal<TSR.MappingAtem & BlueprintMapping>({
		device: TSR.DeviceType.ATEM,
		deviceId: 'atem0',
		lookahead: LookaheadMode.WHEN_CLEAR,
		lookaheadMaxSearchDistance: 1,
		mappingType: TSR.MappingAtemType.SuperSourceBox,
		index: 0 // 0 = SS
	}),
	atem_supersource_z_box4: literal<TSR.MappingAtem & BlueprintMapping>({
		device: TSR.DeviceType.ATEM,
		deviceId: 'atem0',
		lookahead: LookaheadMode.WHEN_CLEAR,
		lookaheadMaxSearchDistance: 1,
		mappingType: TSR.MappingAtemType.SuperSourceBox,
		index: 0 // 0 = SS
	}),
	atem_mp_1: literal<TSR.MappingAtem & BlueprintMapping>({
		device: TSR.DeviceType.ATEM,
		deviceId: 'atem0',
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingAtemType.MediaPlayer,
		index: 0
	}),
	casparcg_player_clip_pending: literal<TSR.MappingAbstract & BlueprintMapping>({
		device: TSR.DeviceType.ABSTRACT,
		deviceId: 'abstract0',
		lookahead: LookaheadMode.PRELOAD,
		lookaheadDepth: 2
	}),
	casparcg_player_clip_1: literal<TSR.MappingCasparCG & BlueprintMapping>({
		device: TSR.DeviceType.CASPARCG,
		deviceId: 'caspar01',
		lookahead: LookaheadMode.NONE,
		channel: 1,
		layer: 110,
		previewWhenNotOnAir: true
	}),
	casparcg_player_clip_2: literal<TSR.MappingCasparCG & BlueprintMapping>({
		device: TSR.DeviceType.CASPARCG,
		deviceId: 'caspar01',
		lookahead: LookaheadMode.NONE,
		channel: 2,
		layer: 110,
		previewWhenNotOnAir: true
	}),
	casparcg_player_clip_1_loading_loop: literal<TSR.MappingCasparCG & BlueprintMapping>({
		device: TSR.DeviceType.CASPARCG,
		deviceId: 'caspar01',
		lookahead: LookaheadMode.NONE,
		channel: 1,
		layer: 109
	}),
	casparcg_player_clip_2_loading_loop: literal<TSR.MappingCasparCG & BlueprintMapping>({
		device: TSR.DeviceType.CASPARCG,
		deviceId: 'caspar01',
		lookahead: LookaheadMode.NONE,
		channel: 2,
		layer: 109
	}),
	sisyfos_config: literal<TSR.MappingSisyfosChannels & BlueprintMapping>({
		device: TSR.DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingSisyfosType.CHANNELS
	}),
	sisyfos_group_studio_mics: literal<TSR.MappingSisyfos & BlueprintMapping>({
		device: TSR.DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingSisyfosType.CHANNELS
	}),
	sisyfos_persisted_levels: literal<TSR.MappingSisyfos & BlueprintMapping>({
		device: TSR.DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingSisyfosType.CHANNELS
	}),
	sisyfos_source_clip_pending: literal<TSR.MappingAbstract & BlueprintMapping>({
		device: TSR.DeviceType.ABSTRACT,
		deviceId: 'abstract0',
		lookahead: LookaheadMode.NONE
	}),
	sisyfos_source_Host_1_st_a: literal<TSR.MappingSisyfos & BlueprintMapping>({
		device: TSR.DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		channel: 0,
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingSisyfosType.CHANNEL
	}),
	sisyfos_source_Host_2_st_a: literal<TSR.MappingSisyfos & BlueprintMapping>({
		device: TSR.DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		channel: 1,
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingSisyfosType.CHANNEL
	}),
	sisyfos_source_Guest_1_st_a: literal<TSR.MappingSisyfos & BlueprintMapping>({
		device: TSR.DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		channel: 2,
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingSisyfosType.CHANNEL
	}),
	sisyfos_source_Guest_2_st_a: literal<TSR.MappingSisyfos & BlueprintMapping>({
		device: TSR.DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		channel: 3,
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingSisyfosType.CHANNEL
	}),
	sisyfos_source_Guest_3_st_a: literal<TSR.MappingSisyfos & BlueprintMapping>({
		device: TSR.DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		channel: 4,
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingSisyfosType.CHANNEL
	}),
	sisyfos_source_Guest_4_st_a: literal<TSR.MappingSisyfos & BlueprintMapping>({
		device: TSR.DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		channel: 5,
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingSisyfosType.CHANNEL
	}),
	sisyfos_source_Host_1_st_b: literal<TSR.MappingSisyfos & BlueprintMapping>({
		device: TSR.DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		channel: 6,
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingSisyfosType.CHANNEL
	}),
	sisyfos_source_Host_2_st_b: literal<TSR.MappingSisyfos & BlueprintMapping>({
		device: TSR.DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		channel: 7,
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingSisyfosType.CHANNEL
	}),
	sisyfos_source_Guest_1_st_b: literal<TSR.MappingSisyfos & BlueprintMapping>({
		device: TSR.DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		channel: 8,
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingSisyfosType.CHANNEL
	}),
	sisyfos_source_Guest_2_st_b: literal<TSR.MappingSisyfos & BlueprintMapping>({
		device: TSR.DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		channel: 9,
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingSisyfosType.CHANNEL
	}),
	sisyfos_source_Guest_3_st_b: literal<TSR.MappingSisyfos & BlueprintMapping>({
		device: TSR.DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		channel: 10,
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingSisyfosType.CHANNEL
	}),
	sisyfos_source_Guest_4_st_b: literal<TSR.MappingSisyfos & BlueprintMapping>({
		device: TSR.DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		channel: 11,
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingSisyfosType.CHANNEL
	}),
	sisyfos_source_live_1: literal<TSR.MappingSisyfos & BlueprintMapping>({
		device: TSR.DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		channel: 12,
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingSisyfosType.CHANNEL
	}),
	sisyfos_source_live_2: literal<TSR.MappingSisyfos & BlueprintMapping>({
		device: TSR.DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		channel: 13,
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingSisyfosType.CHANNEL
	}),
	sisyfos_source_live_3: literal<TSR.MappingSisyfos & BlueprintMapping>({
		device: TSR.DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		channel: 14,
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingSisyfosType.CHANNEL
	}),
	sisyfos_source_live_4: literal<TSR.MappingSisyfos & BlueprintMapping>({
		device: TSR.DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		channel: 15,
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingSisyfosType.CHANNEL
	}),
	sisyfos_source_live_5: literal<TSR.MappingSisyfos & BlueprintMapping>({
		device: TSR.DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		channel: 16,
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingSisyfosType.CHANNEL
	}),
	sisyfos_source_live_6: literal<TSR.MappingSisyfos & BlueprintMapping>({
		device: TSR.DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		channel: 17,
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingSisyfosType.CHANNEL
	}),
	sisyfos_source_live_7: literal<TSR.MappingSisyfos & BlueprintMapping>({
		device: TSR.DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		channel: 18,
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingSisyfosType.CHANNEL
	}),
	sisyfos_source_live_8: literal<TSR.MappingSisyfos & BlueprintMapping>({
		device: TSR.DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		channel: 19,
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingSisyfosType.CHANNEL
	}),
	sisyfos_source_live_9: literal<TSR.MappingSisyfos & BlueprintMapping>({
		device: TSR.DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		channel: 20,
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingSisyfosType.CHANNEL
	}),
	sisyfos_source_live_10: literal<TSR.MappingSisyfos & BlueprintMapping>({
		device: TSR.DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		channel: 21,
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingSisyfosType.CHANNEL
	}),
	sisyfos_source_server_a: literal<TSR.MappingSisyfos & BlueprintMapping>({
		device: TSR.DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		channel: 22,
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingSisyfosType.CHANNEL
	}),
	sisyfos_source_server_b: literal<TSR.MappingSisyfos & BlueprintMapping>({
		device: TSR.DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		channel: 23,
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingSisyfosType.CHANNEL
	}),
	// sisyfos_source_server_c: literal<TSR.MappingSisyfos & BlueprintMapping>({
	// 	device: TSR.DeviceType.SISYFOS,
	// 	deviceId: 'sisyfos0',
	// 	channel: 24,
	// 	lookahead: LookaheadMode.NONE
	// }),
	sisyfos_source_evs_1: literal<TSR.MappingSisyfos & BlueprintMapping>({
		device: TSR.DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		channel: 24,
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingSisyfosType.CHANNEL
	}),
	sisyfos_source_evs_2: literal<TSR.MappingSisyfos & BlueprintMapping>({
		device: TSR.DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		channel: 25,
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingSisyfosType.CHANNEL
	}),
	sisyfos_source_jingle: literal<TSR.MappingSisyfos & BlueprintMapping>({
		device: TSR.DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		channel: 26,
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingSisyfosType.CHANNEL
	}),
	sisyfos_source_audiobed: literal<TSR.MappingSisyfos & BlueprintMapping>({
		device: TSR.DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		channel: 27,
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingSisyfosType.CHANNEL
	}),
	sisyfos_source_tlf_hybrid: literal<TSR.MappingSisyfos & BlueprintMapping>({
		device: TSR.DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		channel: 28,
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingSisyfosType.CHANNEL
	}),
	sisyfos_resync: literal<TSR.MappingSisyfos & BlueprintMapping>({
		device: TSR.DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		channel: -1,
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingSisyfosType.CHANNEL
	}),
	graphic_overlay: literal<TSR.MappingVizMSE & BlueprintMapping>({
		device: TSR.DeviceType.VIZMSE,
		deviceId: 'viz0',
		lookahead: LookaheadMode.NONE
	}),
	graphic_overlay_ident: literal<TSR.MappingVizMSE & BlueprintMapping>({
		device: TSR.DeviceType.VIZMSE,
		deviceId: 'viz0',
		lookahead: LookaheadMode.NONE
	}),
	graphic_overlay_topt: literal<TSR.MappingVizMSE & BlueprintMapping>({
		device: TSR.DeviceType.VIZMSE,
		deviceId: 'viz0',
		lookahead: LookaheadMode.NONE
	}),
	graphic_overlay_lower: literal<TSR.MappingVizMSE & BlueprintMapping>({
		device: TSR.DeviceType.VIZMSE,
		deviceId: 'viz0',
		lookahead: LookaheadMode.NONE
	}),
	graphic_overlay_headline: literal<TSR.MappingVizMSE & BlueprintMapping>({
		device: TSR.DeviceType.VIZMSE,
		deviceId: 'viz0',
		lookahead: LookaheadMode.NONE
	}),
	graphic_overlay_tema: literal<TSR.MappingVizMSE & BlueprintMapping>({
		device: TSR.DeviceType.VIZMSE,
		deviceId: 'viz0',
		lookahead: LookaheadMode.NONE
	}),
	graphic_pilot: literal<TSR.MappingVizMSE & BlueprintMapping>({
		device: TSR.DeviceType.VIZMSE,
		deviceId: 'viz0',
		lookahead: LookaheadMode.NONE
	}),
	graphic_pilot_overlay: literal<TSR.MappingVizMSE & BlueprintMapping>({
		device: TSR.DeviceType.VIZMSE,
		deviceId: 'viz0',
		lookahead: LookaheadMode.NONE
	}),
	graphic_design: literal<TSR.MappingVizMSE & BlueprintMapping>({
		device: TSR.DeviceType.VIZMSE,
		deviceId: 'viz0',
		lookahead: LookaheadMode.NONE
	}),
	graphic_adlibs: literal<TSR.MappingVizMSE & BlueprintMapping>({
		device: TSR.DeviceType.VIZMSE,
		deviceId: 'viz0',
		lookahead: LookaheadMode.NONE
	}),
	graphic_wall: literal<TSR.MappingVizMSE & BlueprintMapping>({
		device: TSR.DeviceType.VIZMSE,
		deviceId: 'viz0',
		lookahead: LookaheadMode.NONE
	}),
	pilot_overlay_clear_delay: literal<TSR.MappingAbstract & BlueprintMapping>({
		device: TSR.DeviceType.ABSTRACT,
		deviceId: 'abstract0',
		lookahead: LookaheadMode.NONE
	})
})

export function getCameraSisyfosMappings(cameras: StudioConfig['SourcesCam']) {
	const res: BlueprintMappings = {}
	cameras.forEach(cam => {
		if (cam.SourceName !== undefined && cam.AtemSource !== undefined) {
			res[`sisyfos_camera_active_${cam.SourceName}`] = literal<TSR.MappingSisyfos & BlueprintMapping>({
				device: TSR.DeviceType.SISYFOS,
				deviceId: 'sisyfos0',
				lookahead: LookaheadMode.NONE,
				channel: (cam.AtemSource as number) || 0,
				mappingType: TSR.MappingSisyfosType.CHANNEL
			})
		}
	})

	return res
}

export function getRemoteSisyfosMappings(remotes: StudioConfig['SourcesRM']) {
	const res: BlueprintMappings = {}
	remotes.forEach(rmt => {
		if (rmt.SourceName !== undefined && rmt.AtemSource !== undefined) {
			res[`sisyfos_remote_source_${rmt.SourceName}`] = literal<TSR.MappingSisyfos & BlueprintMapping>({
				device: TSR.DeviceType.SISYFOS,
				deviceId: 'sisyfos0',
				lookahead: LookaheadMode.NONE,
				channel: (rmt.AtemSource as number) || 0,
				mappingType: TSR.MappingSisyfosType.CHANNEL
			})

			res[`sisyfos_remote_source_${rmt.SourceName}_spor_2`] = literal<TSR.MappingSisyfos & BlueprintMapping>({
				device: TSR.DeviceType.SISYFOS,
				deviceId: 'sisyfos0',
				lookahead: LookaheadMode.NONE,
				channel: (rmt.AtemSource as number) || 0,
				mappingType: TSR.MappingSisyfosType.CHANNEL
			})

			res[`sisyfos_remote_source_${rmt.SourceName}_stereo`] = literal<TSR.MappingSisyfos & BlueprintMapping>({
				device: TSR.DeviceType.SISYFOS,
				deviceId: 'sisyfos0',
				lookahead: LookaheadMode.NONE,
				channel: (rmt.AtemSource as number) || 0,
				mappingType: TSR.MappingSisyfosType.CHANNEL
			})
		}
	})

	return res
}

export function getSkypeSisyfosMappings(remotes: StudioConfig['SourcesSkype']) {
	const res: BlueprintMappings = {}
	remotes.forEach(rmt => {
		if (rmt.SourceName !== undefined && rmt.AtemSource !== undefined) {
			res[`sisyfos_remote_source_skype_${rmt.SourceName}`] = literal<TSR.MappingSisyfos & BlueprintMapping>({
				device: TSR.DeviceType.SISYFOS,
				deviceId: 'sisyfos0',
				lookahead: LookaheadMode.NONE,
				channel: (rmt.AtemSource as number) || 0,
				mappingType: TSR.MappingSisyfosType.CHANNEL
			})

			res[`sisyfos_remote_source_skype_${rmt.SourceName}_spor_2`] = literal<TSR.MappingSisyfos & BlueprintMapping>({
				device: TSR.DeviceType.SISYFOS,
				deviceId: 'sisyfos0',
				lookahead: LookaheadMode.NONE,
				channel: (rmt.AtemSource as number) || 0,
				mappingType: TSR.MappingSisyfosType.CHANNEL
			})

			res[`sisyfos_remote_source_skype_${rmt.SourceName}_stereo`] = literal<TSR.MappingSisyfos & BlueprintMapping>({
				device: TSR.DeviceType.SISYFOS,
				deviceId: 'sisyfos0',
				lookahead: LookaheadMode.NONE,
				channel: (rmt.AtemSource as number) || 0,
				mappingType: TSR.MappingSisyfosType.CHANNEL
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
			res[`sisyfos_telefon_source_${props[0].replace(' ', '_').trim()}`] = literal<
				TSR.MappingSisyfos & BlueprintMapping
			>({
				device: TSR.DeviceType.SISYFOS,
				deviceId: 'sisyfos0',
				lookahead: LookaheadMode.NONE,
				channel: Number(props[1]) || 0,
				mappingType: TSR.MappingSisyfosType.CHANNEL
			})
		}
	})

	return res
}

export function getMediaPlayerMappings(mediaPlayers: BlueprintConfig['mediaPlayers']) {
	const res: BlueprintMappings = {
		casparcg_player_clip_pending: literal<TSR.MappingAbstract & BlueprintMapping>({
			device: TSR.DeviceType.ABSTRACT,
			deviceId: 'abstract0',
			lookahead: LookaheadMode.PRELOAD,
			lookaheadDepth: mediaPlayers.length // Number of players
		}),
		sisyfos_source_clip_pending: literal<TSR.MappingAbstract & BlueprintMapping>({
			device: TSR.DeviceType.ABSTRACT,
			deviceId: 'abstract0',
			lookahead: LookaheadMode.NONE
		})
	}

	for (const mp of mediaPlayers) {
		res[`casparcg_player_clip_${mp.id}`] = literal<TSR.MappingCasparCG & BlueprintMapping>({
			device: TSR.DeviceType.CASPARCG,
			deviceId: 'caspar01',
			lookahead: LookaheadMode.NONE,
			channel: 0, // TODO?
			layer: 110
		})
		res[`sisyfos_player_clip_${mp.id}`] = literal<TSR.MappingSisyfos & BlueprintMapping>({
			device: TSR.DeviceType.SISYFOS,
			deviceId: 'sisyfos0',
			lookahead: LookaheadMode.NONE,
			channel: Number(mp.id) || 0,
			mappingType: TSR.MappingSisyfosType.CHANNEL
		})
	}

	return res
}
