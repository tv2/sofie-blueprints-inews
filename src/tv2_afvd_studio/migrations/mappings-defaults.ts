import { BlueprintMapping, BlueprintMappings, LookaheadMode, TSR } from '@sofie-automation/blueprints-integration'
import { AbstractLLayerServerEnable, literal } from 'tv2-common'
import { AbstractLLayer, GraphicLLayer } from 'tv2-constants'
import * as _ from 'underscore'
import { BlueprintConfig, StudioConfig } from '../helpers/config'
import { AtemLLayer, CasparLLayer, CasparPlayerClip, CasparPlayerClipLoadingLoop, SisyfosLLAyer } from '../layers'

export const MAPPINGS_ABSTRACT: BlueprintMappings = {
	core_abstract: literal<TSR.MappingAbstract & BlueprintMapping>({
		device: TSR.DeviceType.ABSTRACT,
		deviceId: 'abstract0',
		lookahead: LookaheadMode.NONE
	}),
	[AbstractLLayer.ServerEnablePending]: literal<TSR.MappingAbstract & BlueprintMapping>({
		device: TSR.DeviceType.ABSTRACT,
		deviceId: 'abstract0',
		lookahead: LookaheadMode.NONE
	}),
	[AbstractLLayerServerEnable(1)]: literal<TSR.MappingAbstract & BlueprintMapping>({
		device: TSR.DeviceType.ABSTRACT,
		deviceId: 'abstract0',
		lookahead: LookaheadMode.NONE
	}),
	[AbstractLLayerServerEnable(2)]: literal<TSR.MappingAbstract & BlueprintMapping>({
		device: TSR.DeviceType.ABSTRACT,
		deviceId: 'abstract0',
		lookahead: LookaheadMode.NONE
	}),
	[AbstractLLayer.IdentMarker]: literal<TSR.MappingAbstract & BlueprintMapping>({
		device: TSR.DeviceType.ABSTRACT,
		deviceId: 'abstract0',
		lookahead: LookaheadMode.NONE
	}),
	[AbstractLLayer.AudioBedBaseline]: literal<TSR.MappingAbstract & BlueprintMapping>({
		device: TSR.DeviceType.ABSTRACT,
		deviceId: 'abstract0',
		lookahead: LookaheadMode.NONE
	})
}

export const MAPPINGS_SISYFOS: BlueprintMappings = {
	[SisyfosLLAyer.SisyfosConfig]: literal<TSR.MappingSisyfosChannels & BlueprintMapping>({
		device: TSR.DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingSisyfosType.CHANNELS
	}),
	[SisyfosLLAyer.SisyfosGroupStudioMics]: literal<TSR.MappingSisyfos & BlueprintMapping>({
		device: TSR.DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingSisyfosType.CHANNELS
	}),
	[SisyfosLLAyer.SisyfosPersistedLevels]: literal<TSR.MappingSisyfos & BlueprintMapping>({
		device: TSR.DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingSisyfosType.CHANNELS
	}),
	[SisyfosLLAyer.SisyfosSourceClipPending]: literal<TSR.MappingAbstract & BlueprintMapping>({
		device: TSR.DeviceType.ABSTRACT,
		deviceId: 'abstract0',
		lookahead: LookaheadMode.NONE
	}),
	[SisyfosLLAyer.SisyfosSourceHost_1_ST_A]: literal<TSR.MappingSisyfos & BlueprintMapping>({
		device: TSR.DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		channel: 0,
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingSisyfosType.CHANNEL
	}),
	[SisyfosLLAyer.SisyfosSourceHost_2_ST_A]: literal<TSR.MappingSisyfos & BlueprintMapping>({
		device: TSR.DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		channel: 1,
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingSisyfosType.CHANNEL
	}),
	[SisyfosLLAyer.SisyfosSourceGuest_1_ST_A]: literal<TSR.MappingSisyfos & BlueprintMapping>({
		device: TSR.DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		channel: 2,
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingSisyfosType.CHANNEL
	}),
	[SisyfosLLAyer.SisyfosSourceGuest_2_ST_A]: literal<TSR.MappingSisyfos & BlueprintMapping>({
		device: TSR.DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		channel: 3,
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingSisyfosType.CHANNEL
	}),
	[SisyfosLLAyer.SisyfosSourceGuest_3_ST_A]: literal<TSR.MappingSisyfos & BlueprintMapping>({
		device: TSR.DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		channel: 4,
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingSisyfosType.CHANNEL
	}),
	[SisyfosLLAyer.SisyfosSourceGuest_4_ST_A]: literal<TSR.MappingSisyfos & BlueprintMapping>({
		device: TSR.DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		channel: 5,
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingSisyfosType.CHANNEL
	}),
	[SisyfosLLAyer.SisyfosSourceHost_1_ST_B]: literal<TSR.MappingSisyfos & BlueprintMapping>({
		device: TSR.DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		channel: 6,
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingSisyfosType.CHANNEL
	}),
	[SisyfosLLAyer.SisyfosSourceHost_2_ST_B]: literal<TSR.MappingSisyfos & BlueprintMapping>({
		device: TSR.DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		channel: 7,
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingSisyfosType.CHANNEL
	}),
	[SisyfosLLAyer.SisyfosSourceGuest_1_ST_B]: literal<TSR.MappingSisyfos & BlueprintMapping>({
		device: TSR.DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		channel: 8,
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingSisyfosType.CHANNEL
	}),
	[SisyfosLLAyer.SisyfosSourceGuest_2_ST_B]: literal<TSR.MappingSisyfos & BlueprintMapping>({
		device: TSR.DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		channel: 9,
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingSisyfosType.CHANNEL
	}),
	[SisyfosLLAyer.SisyfosSourceGuest_3_ST_B]: literal<TSR.MappingSisyfos & BlueprintMapping>({
		device: TSR.DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		channel: 10,
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingSisyfosType.CHANNEL
	}),
	[SisyfosLLAyer.SisyfosSourceGuest_4_ST_B]: literal<TSR.MappingSisyfos & BlueprintMapping>({
		device: TSR.DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		channel: 11,
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingSisyfosType.CHANNEL
	}),
	[SisyfosLLAyer.SisyfosSourceLive_1]: literal<TSR.MappingSisyfos & BlueprintMapping>({
		device: TSR.DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		channel: 12,
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingSisyfosType.CHANNEL
	}),
	[SisyfosLLAyer.SisyfosSourceLive_2]: literal<TSR.MappingSisyfos & BlueprintMapping>({
		device: TSR.DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		channel: 13,
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingSisyfosType.CHANNEL
	}),
	[SisyfosLLAyer.SisyfosSourceLive_3]: literal<TSR.MappingSisyfos & BlueprintMapping>({
		device: TSR.DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		channel: 14,
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingSisyfosType.CHANNEL
	}),
	[SisyfosLLAyer.SisyfosSourceLive_4]: literal<TSR.MappingSisyfos & BlueprintMapping>({
		device: TSR.DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		channel: 15,
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingSisyfosType.CHANNEL
	}),
	[SisyfosLLAyer.SisyfosSourceLive_5]: literal<TSR.MappingSisyfos & BlueprintMapping>({
		device: TSR.DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		channel: 16,
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingSisyfosType.CHANNEL
	}),
	[SisyfosLLAyer.SisyfosSourceLive_6]: literal<TSR.MappingSisyfos & BlueprintMapping>({
		device: TSR.DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		channel: 17,
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingSisyfosType.CHANNEL
	}),
	[SisyfosLLAyer.SisyfosSourceLive_7]: literal<TSR.MappingSisyfos & BlueprintMapping>({
		device: TSR.DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		channel: 18,
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingSisyfosType.CHANNEL
	}),
	[SisyfosLLAyer.SisyfosSourceLive_8]: literal<TSR.MappingSisyfos & BlueprintMapping>({
		device: TSR.DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		channel: 19,
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingSisyfosType.CHANNEL
	}),
	[SisyfosLLAyer.SisyfosSourceLive_9]: literal<TSR.MappingSisyfos & BlueprintMapping>({
		device: TSR.DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		channel: 20,
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingSisyfosType.CHANNEL
	}),
	[SisyfosLLAyer.SisyfosSourceLive_10]: literal<TSR.MappingSisyfos & BlueprintMapping>({
		device: TSR.DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		channel: 21,
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingSisyfosType.CHANNEL
	}),
	[SisyfosLLAyer.SisyfosSourceServerA]: literal<TSR.MappingSisyfos & BlueprintMapping>({
		device: TSR.DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		channel: 22,
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingSisyfosType.CHANNEL
	}),
	[SisyfosLLAyer.SisyfosSourceServerB]: literal<TSR.MappingSisyfos & BlueprintMapping>({
		device: TSR.DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		channel: 23,
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingSisyfosType.CHANNEL
	}),
	[SisyfosLLAyer.SisyfosSourceEVS_1]: literal<TSR.MappingSisyfos & BlueprintMapping>({
		device: TSR.DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		channel: 24,
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingSisyfosType.CHANNEL
	}),
	[SisyfosLLAyer.SisyfosSourceEVS_2]: literal<TSR.MappingSisyfos & BlueprintMapping>({
		device: TSR.DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		channel: 25,
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingSisyfosType.CHANNEL
	}),
	[SisyfosLLAyer.SisyfosSourceJingle]: literal<TSR.MappingSisyfos & BlueprintMapping>({
		device: TSR.DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		channel: 26,
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingSisyfosType.CHANNEL
	}),
	[SisyfosLLAyer.SisyfosSourceAudiobed]: literal<TSR.MappingSisyfos & BlueprintMapping>({
		device: TSR.DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		channel: 27,
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingSisyfosType.CHANNEL
	}),
	[SisyfosLLAyer.SisyfosSourceTLF]: literal<TSR.MappingSisyfos & BlueprintMapping>({
		device: TSR.DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		channel: 28,
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingSisyfosType.CHANNEL
	}),
	[SisyfosLLAyer.SisyfosResync]: literal<TSR.MappingSisyfos & BlueprintMapping>({
		device: TSR.DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		channel: -1,
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingSisyfosType.CHANNEL
	})
}

export const MAPPINGS_CASPAR: BlueprintMappings = {
	[CasparLLayer.CasparPlayerClipPending]: literal<TSR.MappingAbstract & BlueprintMapping>({
		device: TSR.DeviceType.ABSTRACT,
		deviceId: 'abstract0',
		lookahead: LookaheadMode.PRELOAD,
		lookaheadDepth: 1,
		lookaheadMaxSearchDistance: -1
	}),
	[CasparPlayerClip(1)]: literal<TSR.MappingCasparCG & BlueprintMapping>({
		device: TSR.DeviceType.CASPARCG,
		deviceId: 'caspar01',
		lookahead: LookaheadMode.NONE,
		channel: 1,
		layer: 110,
		previewWhenNotOnAir: true
	}),
	[CasparPlayerClip(2)]: literal<TSR.MappingCasparCG & BlueprintMapping>({
		device: TSR.DeviceType.CASPARCG,
		deviceId: 'caspar01',
		lookahead: LookaheadMode.NONE,
		channel: 2,
		layer: 110,
		previewWhenNotOnAir: true
	}),
	[CasparPlayerClipLoadingLoop(1)]: literal<TSR.MappingCasparCG & BlueprintMapping>({
		device: TSR.DeviceType.CASPARCG,
		deviceId: 'caspar01',
		lookahead: LookaheadMode.NONE,
		channel: 1,
		layer: 109
	}),
	[CasparPlayerClipLoadingLoop(2)]: literal<TSR.MappingCasparCG & BlueprintMapping>({
		device: TSR.DeviceType.CASPARCG,
		deviceId: 'caspar01',
		lookahead: LookaheadMode.NONE,
		channel: 2,
		layer: 109
	}),
	[CasparLLayer.CasparCGDVELoop]: literal<TSR.MappingCasparCG & BlueprintMapping>({
		device: TSR.DeviceType.CASPARCG,
		deviceId: 'caspar02',
		lookahead: LookaheadMode.WHEN_CLEAR,
		previewWhenNotOnAir: true,
		channel: 2,
		layer: 110
	}),
	[CasparLLayer.CasparCGFullBg]: literal<TSR.MappingCasparCG & BlueprintMapping>({
		device: TSR.DeviceType.CASPARCG,
		deviceId: 'caspar02',
		lookahead: LookaheadMode.NONE,
		channel: 4,
		layer: 110
	}),
	[CasparLLayer.CasparCGDVETemplate]: literal<TSR.MappingCasparCG & BlueprintMapping>({
		device: TSR.DeviceType.CASPARCG,
		deviceId: 'caspar02',
		lookahead: LookaheadMode.WHEN_CLEAR,
		channel: 2,
		layer: 120
	}),
	[CasparLLayer.CasparCGDVEKey]: literal<TSR.MappingCasparCG & BlueprintMapping>({
		device: TSR.DeviceType.CASPARCG,
		deviceId: 'caspar02',
		lookahead: LookaheadMode.WHEN_CLEAR,
		previewWhenNotOnAir: true,
		channel: 2,
		layer: 109
	}),
	[CasparLLayer.CasparCGDVEFrame]: literal<TSR.MappingCasparCG & BlueprintMapping>({
		device: TSR.DeviceType.CASPARCG,
		deviceId: 'caspar02',
		lookahead: LookaheadMode.WHEN_CLEAR,
		previewWhenNotOnAir: true,
		channel: 2,
		layer: 111
	}),
	[CasparLLayer.CasparPlayerJingle]: literal<TSR.MappingCasparCG & BlueprintMapping>({
		device: TSR.DeviceType.CASPARCG,
		deviceId: 'caspar02',
		lookahead: LookaheadMode.PRELOAD,
		channel: 1,
		layer: 120,
		previewWhenNotOnAir: true
	}),
	[CasparLLayer.CasparCountdown]: literal<TSR.MappingCasparCG & BlueprintMapping>({
		device: TSR.DeviceType.CASPARCG,
		deviceId: 'caspar02',
		lookahead: LookaheadMode.NONE,
		previewWhenNotOnAir: true,
		channel: 3,
		layer: 120
	}),
	[CasparLLayer.CasparCGLYD]: literal<TSR.MappingCasparCG & BlueprintMapping>({
		device: TSR.DeviceType.CASPARCG,
		deviceId: 'caspar02',
		lookahead: LookaheadMode.NONE,
		channel: 1,
		layer: 101
	})
}

export const MAPPINGS_GRAPHICS: BlueprintMappings = {
	[GraphicLLayer.GraphicLLayerOverlay]: literal<TSR.MappingVizMSE & BlueprintMapping>({
		device: TSR.DeviceType.VIZMSE,
		deviceId: 'viz0',
		lookahead: LookaheadMode.NONE
	}),
	[GraphicLLayer.GraphicLLayerOverlayIdent]: literal<TSR.MappingVizMSE & BlueprintMapping>({
		device: TSR.DeviceType.VIZMSE,
		deviceId: 'viz0',
		lookahead: LookaheadMode.NONE
	}),
	[GraphicLLayer.GraphicLLayerOverlayTopt]: literal<TSR.MappingVizMSE & BlueprintMapping>({
		device: TSR.DeviceType.VIZMSE,
		deviceId: 'viz0',
		lookahead: LookaheadMode.NONE
	}),
	[GraphicLLayer.GraphicLLayerOverlayLower]: literal<TSR.MappingVizMSE & BlueprintMapping>({
		device: TSR.DeviceType.VIZMSE,
		deviceId: 'viz0',
		lookahead: LookaheadMode.NONE
	}),
	[GraphicLLayer.GraphicLLayerOverlayHeadline]: literal<TSR.MappingVizMSE & BlueprintMapping>({
		device: TSR.DeviceType.VIZMSE,
		deviceId: 'viz0',
		lookahead: LookaheadMode.NONE
	}),
	[GraphicLLayer.GraphicLLayerOverlayTema]: literal<TSR.MappingVizMSE & BlueprintMapping>({
		device: TSR.DeviceType.VIZMSE,
		deviceId: 'viz0',
		lookahead: LookaheadMode.NONE
	}),
	[GraphicLLayer.GraphicLLayerPilot]: literal<TSR.MappingVizMSE & BlueprintMapping>({
		device: TSR.DeviceType.VIZMSE,
		deviceId: 'viz0',
		lookahead: LookaheadMode.NONE
	}),
	[GraphicLLayer.GraphicLLayerPilotOverlay]: literal<TSR.MappingVizMSE & BlueprintMapping>({
		device: TSR.DeviceType.VIZMSE,
		deviceId: 'viz0',
		lookahead: LookaheadMode.NONE
	}),
	[GraphicLLayer.GraphicLLayerDesign]: literal<TSR.MappingVizMSE & BlueprintMapping>({
		device: TSR.DeviceType.VIZMSE,
		deviceId: 'viz0',
		lookahead: LookaheadMode.NONE
	}),
	[GraphicLLayer.GraphicLLayerAdLibs]: literal<TSR.MappingVizMSE & BlueprintMapping>({
		device: TSR.DeviceType.VIZMSE,
		deviceId: 'viz0',
		lookahead: LookaheadMode.NONE
	}),
	[GraphicLLayer.GraphicLLayerWall]: literal<TSR.MappingVizMSE & BlueprintMapping>({
		device: TSR.DeviceType.VIZMSE,
		deviceId: 'viz0',
		lookahead: LookaheadMode.NONE
	}),
	[GraphicLLayer.GraphicLLayerFullLoop]: literal<TSR.MappingVizMSE & BlueprintMapping>({
		device: TSR.DeviceType.VIZMSE,
		deviceId: 'viz0',
		lookahead: LookaheadMode.NONE
	})
}

export const MAPPINGS_ATEM: BlueprintMappings = {
	[AtemLLayer.AtemMEProgram]: literal<TSR.MappingAtem & BlueprintMapping>({
		device: TSR.DeviceType.ATEM,
		deviceId: 'atem0',
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingAtemType.MixEffect,
		index: 0 // 0 = ME1
	}),
	[AtemLLayer.AtemMEClean]: literal<TSR.MappingAtem & BlueprintMapping>({
		device: TSR.DeviceType.ATEM,
		deviceId: 'atem0',
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingAtemType.MixEffect,
		index: 3 // 3 = ME4
	}),
	[AtemLLayer.AtemCleanUSKEffect]: literal<TSR.MappingAtem & BlueprintMapping>({
		device: TSR.DeviceType.ATEM,
		deviceId: 'atem0',
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingAtemType.MixEffect,
		index: 3 // 3 = ME4
	}),
	[AtemLLayer.AtemAuxPGM]: literal<TSR.MappingAtem & BlueprintMapping>({
		device: TSR.DeviceType.ATEM,
		deviceId: 'atem0',
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingAtemType.Auxilliary,
		index: 0 // 0 = out 1
	}),
	[AtemLLayer.AtemAuxClean]: literal<TSR.MappingAtem & BlueprintMapping>({
		device: TSR.DeviceType.ATEM,
		deviceId: 'atem0',
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingAtemType.Auxilliary,
		index: 1 // 1 = out 2
	}),
	[AtemLLayer.AtemAuxWall]: literal<TSR.MappingAtem & BlueprintMapping>({
		device: TSR.DeviceType.ATEM,
		deviceId: 'atem0',
		lookahead: LookaheadMode.WHEN_CLEAR,
		mappingType: TSR.MappingAtemType.Auxilliary,
		index: 2 // 2 = out 3
	}),
	[AtemLLayer.AtemAuxAR]: literal<TSR.MappingAtem & BlueprintMapping>({
		device: TSR.DeviceType.ATEM,
		deviceId: 'atem0',
		lookahead: LookaheadMode.WHEN_CLEAR,
		mappingType: TSR.MappingAtemType.Auxilliary,
		index: 3 // 3 = out 4
	}),
	[AtemLLayer.AtemAuxVizOvlIn1]: literal<TSR.MappingAtem & BlueprintMapping>({
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
	[AtemLLayer.AtemAuxVideoMixMinus]: literal<TSR.MappingAtem & BlueprintMapping>({
		device: TSR.DeviceType.ATEM,
		deviceId: 'atem0',
		lookahead: LookaheadMode.WHEN_CLEAR,
		mappingType: TSR.MappingAtemType.Auxilliary,
		index: 6 // 6 = out 7
	}),
	[AtemLLayer.AtemAuxVenue]: literal<TSR.MappingAtem & BlueprintMapping>({
		device: TSR.DeviceType.ATEM,
		deviceId: 'atem0',
		lookahead: LookaheadMode.WHEN_CLEAR,
		mappingType: TSR.MappingAtemType.Auxilliary,
		index: 7 // 7 = out 8
	}),
	[AtemLLayer.AtemAuxLookahead]: literal<TSR.MappingAtem & BlueprintMapping>({
		device: TSR.DeviceType.ATEM,
		deviceId: 'atem0',
		lookahead: LookaheadMode.WHEN_CLEAR,
		mappingType: TSR.MappingAtemType.Auxilliary,
		index: 10 // 10 = out 11
	}),
	[AtemLLayer.AtemAuxSSrc]: literal<TSR.MappingAtem & BlueprintMapping>({
		device: TSR.DeviceType.ATEM,
		deviceId: 'atem0',
		lookahead: LookaheadMode.WHEN_CLEAR,
		mappingType: TSR.MappingAtemType.Auxilliary,
		index: 11 // 11 = out 12
	}),
	[AtemLLayer.AtemDSKGraphics]: literal<TSR.MappingAtem & BlueprintMapping>({
		device: TSR.DeviceType.ATEM,
		deviceId: 'atem0',
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingAtemType.DownStreamKeyer,
		index: 0 // 0 = DSK1
	}),
	[AtemLLayer.AtemDSKEffect]: literal<TSR.MappingAtem & BlueprintMapping>({
		device: TSR.DeviceType.ATEM,
		deviceId: 'atem0',
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingAtemType.DownStreamKeyer,
		index: 1 // 1 = DSK2
	}),
	[AtemLLayer.AtemDSK3]: literal<TSR.MappingAtem & BlueprintMapping>({
		device: TSR.DeviceType.ATEM,
		deviceId: 'atem0',
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingAtemType.DownStreamKeyer,
		index: 2 // 2 = DSK3
	}),
	[AtemLLayer.AtemDSK4]: literal<TSR.MappingAtem & BlueprintMapping>({
		device: TSR.DeviceType.ATEM,
		deviceId: 'atem0',
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingAtemType.DownStreamKeyer,
		index: 3 // 3 = DSK4
	}),
	[AtemLLayer.AtemSSrcArt]: literal<TSR.MappingAtem & BlueprintMapping>({
		device: TSR.DeviceType.ATEM,
		deviceId: 'atem0',
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingAtemType.SuperSourceProperties,
		index: 0 // 0 = SS
	}),
	[AtemLLayer.AtemSSrcDefault]: literal<TSR.MappingAtem & BlueprintMapping>({
		device: TSR.DeviceType.ATEM,
		deviceId: 'atem0',
		lookahead: LookaheadMode.WHEN_CLEAR, // TODO - verify
		mappingType: TSR.MappingAtemType.SuperSourceBox,
		index: 0 // 0 = SS
	}),
	[AtemLLayer.AtemSSrcBox1]: literal<TSR.MappingAtem & BlueprintMapping>({
		device: TSR.DeviceType.ATEM,
		deviceId: 'atem0',
		lookahead: LookaheadMode.WHEN_CLEAR,
		lookaheadMaxSearchDistance: 1,
		mappingType: TSR.MappingAtemType.SuperSourceBox,
		index: 0 // 0 = SS
	}),
	[AtemLLayer.AtemSSrcBox2]: literal<TSR.MappingAtem & BlueprintMapping>({
		device: TSR.DeviceType.ATEM,
		deviceId: 'atem0',
		lookahead: LookaheadMode.WHEN_CLEAR,
		lookaheadMaxSearchDistance: 1,
		mappingType: TSR.MappingAtemType.SuperSourceBox,
		index: 0 // 0 = SS
	}),
	[AtemLLayer.AtemSSrcBox3]: literal<TSR.MappingAtem & BlueprintMapping>({
		device: TSR.DeviceType.ATEM,
		deviceId: 'atem0',
		lookahead: LookaheadMode.WHEN_CLEAR,
		lookaheadMaxSearchDistance: 1,
		mappingType: TSR.MappingAtemType.SuperSourceBox,
		index: 0 // 0 = SS
	}),
	[AtemLLayer.AtemSSrcBox4]: literal<TSR.MappingAtem & BlueprintMapping>({
		device: TSR.DeviceType.ATEM,
		deviceId: 'atem0',
		lookahead: LookaheadMode.WHEN_CLEAR,
		lookaheadMaxSearchDistance: 1,
		mappingType: TSR.MappingAtemType.SuperSourceBox,
		index: 0 // 0 = SS
	}),
	[AtemLLayer.AtemMP1]: literal<TSR.MappingAtem & BlueprintMapping>({
		device: TSR.DeviceType.ATEM,
		deviceId: 'atem0',
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingAtemType.MediaPlayer,
		index: 0
	})
}

export default literal<BlueprintMappings>({
	...MAPPINGS_ABSTRACT,
	...MAPPINGS_SISYFOS,
	...MAPPINGS_CASPAR,
	...MAPPINGS_GRAPHICS,
	...MAPPINGS_ATEM
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
