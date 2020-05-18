import {
	DeviceType,
	MappingAbstract,
	MappingAtem,
	MappingAtemType,
	MappingCasparCG,
	MappingSisyfos
} from 'timeline-state-resolver-types'
import { BlueprintMapping, BlueprintMappings, LookaheadMode } from 'tv-automation-sofie-blueprints-integration'
import { literal } from 'tv2-common'
import * as _ from 'underscore'

export default literal<BlueprintMappings>({
	core_abstract: literal<MappingAbstract & BlueprintMapping>({
		device: DeviceType.ABSTRACT,
		deviceId: 'abstract0',
		lookahead: LookaheadMode.NONE
	}),
	offtube_abstract_pgm_enabler: literal<MappingAbstract & BlueprintMapping>({
		device: DeviceType.ABSTRACT,
		deviceId: 'abstract0',
		lookahead: LookaheadMode.NONE
	}),
	atem_me_program: literal<MappingAtem & BlueprintMapping>({
		device: DeviceType.ATEM,
		deviceId: 'atem0',
		lookahead: LookaheadMode.NONE,
		mappingType: MappingAtemType.MixEffect,
		index: 1 // 1 = ME2
	}),
	atem_me_multiview: literal<MappingAtem & BlueprintMapping>({
		device: DeviceType.ATEM,
		deviceId: 'atem0',
		lookahead: LookaheadMode.NONE,
		mappingType: MappingAtemType.MixEffect,
		index: 0 // 0 = ME1
	}),
	atem_dsk_graphics: literal<MappingAtem & BlueprintMapping>({
		device: DeviceType.ATEM,
		deviceId: 'atem0',
		lookahead: LookaheadMode.NONE,
		mappingType: MappingAtemType.DownStreamKeyer,
		index: 0 // 0 = DSK1
	}),
	atem_aux_clean: literal<MappingAtem & BlueprintMapping>({
		device: DeviceType.ATEM,
		deviceId: 'atem0',
		lookahead: LookaheadMode.NONE,
		mappingType: MappingAtemType.Auxilliary,
		index: 0 // 0 = out 1
	}),
	atem_aux_screen: literal<MappingAtem & BlueprintMapping>({
		device: DeviceType.ATEM,
		deviceId: 'atem0',
		lookahead: LookaheadMode.NONE,
		mappingType: MappingAtemType.Auxilliary,
		index: 1 // 1 = out 2
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
	sisyfos_source_Host_3_st_a: literal<MappingSisyfos & BlueprintMapping>({
		device: DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		channel: 2,
		lookahead: LookaheadMode.NONE
	}),
	sisyfos_source_live_1: literal<MappingSisyfos & BlueprintMapping>({
		device: DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		channel: 3,
		lookahead: LookaheadMode.NONE
	}),
	sisyfos_source_live_2: literal<MappingSisyfos & BlueprintMapping>({
		device: DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		channel: 4,
		lookahead: LookaheadMode.NONE
	}),
	sisyfos_source_world_feed_stereo: literal<MappingSisyfos & BlueprintMapping>({
		device: DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		channel: 5,
		lookahead: LookaheadMode.NONE
	}),
	sisyfos_source_world_feed_surround: literal<MappingSisyfos & BlueprintMapping>({
		device: DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		channel: 6,
		lookahead: LookaheadMode.NONE
	}),
	sisyfos_source_server_a: literal<MappingSisyfos & BlueprintMapping>({
		device: DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		channel: 7,
		lookahead: LookaheadMode.NONE
	}),
	sisyfos_source_server_b: literal<MappingSisyfos & BlueprintMapping>({
		device: DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		channel: 8,
		lookahead: LookaheadMode.NONE
	}),
	sisyfos_source_jingle: literal<MappingSisyfos & BlueprintMapping>({
		device: DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		channel: 9,
		lookahead: LookaheadMode.NONE
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
	casparcg_graphics_overlay: literal<MappingCasparCG & BlueprintMapping>({
		device: DeviceType.CASPARCG,
		deviceId: 'caspar01',
		lookahead: LookaheadMode.NONE,
		channel: 3,
		layer: 111,
		previewWhenNotOnAir: true
	}),
	casparcg_player_jingle: literal<MappingCasparCG & BlueprintMapping>({
		device: DeviceType.CASPARCG,
		deviceId: 'caspar01',
		lookahead: LookaheadMode.PRELOAD,
		channel: 3,
		layer: 110,
		previewWhenNotOnAir: true
	}),
	casparcg_graphics_full: literal<MappingCasparCG & BlueprintMapping>({
		device: DeviceType.CASPARCG,
		deviceId: 'caspar01',
		lookahead: LookaheadMode.PRELOAD,
		channel: 3,
		layer: 109,
		previewWhenNotOnAir: true
	}),
	casparcg_cg_dve_template: literal<MappingCasparCG & BlueprintMapping>({
		device: DeviceType.CASPARCG,
		deviceId: 'caspar01',
		lookahead: LookaheadMode.RETAIN,
		channel: 4,
		layer: 120
	}),
	casparcg_dve_key: literal<MappingCasparCG & BlueprintMapping>({
		device: DeviceType.CASPARCG,
		deviceId: 'caspar01',
		lookahead: LookaheadMode.RETAIN,
		previewWhenNotOnAir: true,
		channel: 4,
		layer: 109
	}),
	casparcg_dve_frame: literal<MappingCasparCG & BlueprintMapping>({
		device: DeviceType.CASPARCG,
		deviceId: 'caspar01',
		lookahead: LookaheadMode.RETAIN,
		previewWhenNotOnAir: true,
		channel: 4,
		layer: 111
	}),
	casparcg_dve_loop: literal<MappingCasparCG & BlueprintMapping>({
		device: DeviceType.CASPARCG,
		deviceId: 'caspar01',
		lookahead: LookaheadMode.RETAIN,
		previewWhenNotOnAir: true,
		channel: 5,
		layer: 110
	}),
	casparcg_studio_screen_loop: literal<MappingCasparCG & BlueprintMapping>({
		device: DeviceType.CASPARCG,
		deviceId: 'caspar01',
		lookahead: LookaheadMode.RETAIN,
		previewWhenNotOnAir: true,
		channel: 6,
		layer: 110
	}),
	graphic_adlibs: literal<MappingCasparCG & BlueprintMapping>({
		device: DeviceType.CASPARCG,
		deviceId: 'caspar01',
		lookahead: LookaheadMode.NONE,
		previewWhenNotOnAir: false,
		channel: 3,
		layer: 111
	}),
	graphic_design: literal<MappingCasparCG & BlueprintMapping>({
		device: DeviceType.CASPARCG,
		deviceId: 'caspar01',
		lookahead: LookaheadMode.NONE,
		previewWhenNotOnAir: false,
		channel: 3,
		layer: 111
	}),
	graphic_overlay: literal<MappingCasparCG & BlueprintMapping>({
		device: DeviceType.CASPARCG,
		deviceId: 'caspar01',
		lookahead: LookaheadMode.NONE,
		previewWhenNotOnAir: false,
		channel: 3,
		layer: 111
	}),
	graphic_overlay_headline: literal<MappingCasparCG & BlueprintMapping>({
		device: DeviceType.CASPARCG,
		deviceId: 'caspar01',
		lookahead: LookaheadMode.NONE,
		previewWhenNotOnAir: false,
		channel: 3,
		layer: 111
	}),
	graphic_overlay_ident: literal<MappingCasparCG & BlueprintMapping>({
		device: DeviceType.CASPARCG,
		deviceId: 'caspar01',
		lookahead: LookaheadMode.NONE,
		previewWhenNotOnAir: false,
		channel: 3,
		layer: 111
	}),
	graphic_overlay_lower: literal<MappingCasparCG & BlueprintMapping>({
		device: DeviceType.CASPARCG,
		deviceId: 'caspar01',
		lookahead: LookaheadMode.NONE,
		previewWhenNotOnAir: false,
		channel: 3,
		layer: 111
	}),
	graphic_overlay_tema: literal<MappingCasparCG & BlueprintMapping>({
		device: DeviceType.CASPARCG,
		deviceId: 'caspar01',
		lookahead: LookaheadMode.NONE,
		previewWhenNotOnAir: false,
		channel: 3,
		layer: 111
	}),
	graphic_overlay_topt: literal<MappingCasparCG & BlueprintMapping>({
		device: DeviceType.CASPARCG,
		deviceId: 'caspar01',
		lookahead: LookaheadMode.NONE,
		previewWhenNotOnAir: false,
		channel: 3,
		layer: 111
	}),
	/** TODO: Revisit these */
	graphic_pilot: literal<MappingCasparCG & BlueprintMapping>({
		device: DeviceType.CASPARCG,
		deviceId: 'caspar01',
		lookahead: LookaheadMode.NONE,
		previewWhenNotOnAir: false,
		channel: 3,
		layer: 111
	}),
	graphic_pilot_overlay: literal<MappingCasparCG & BlueprintMapping>({
		device: DeviceType.CASPARCG,
		deviceId: 'caspar01',
		lookahead: LookaheadMode.NONE,
		previewWhenNotOnAir: false,
		channel: 3,
		layer: 111
	}),
	graphic_wall: literal<MappingCasparCG & BlueprintMapping>({
		device: DeviceType.CASPARCG,
		deviceId: 'caspar01',
		lookahead: LookaheadMode.NONE,
		previewWhenNotOnAir: false,
		channel: 3,
		layer: 111
	})
})
