import { BlueprintMapping, BlueprintMappings, LookaheadMode, TSR } from '@tv2media/blueprints-integration'
import {
	AbstractLLayerServerEnable,
	CasparPlayerClip,
	CasparPlayerClipLoadingLoop,
	GetDSKMappings,
	literal,
	SisyfosPlayerClip
} from 'tv2-common'
import { AbstractLLayer, GraphicLLayer } from 'tv2-constants'
import { DeviceType } from '../../../../tv-automation-state-timeline-resolver/packages/timeline-state-resolver-types'
import { ATEMModel } from '../../types/atem'
import { BlueprintConfig } from '../helpers/config'
import { AtemLLayer, CasparLLayer, SisyfosLLAyer } from '../layers'

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
		layerName: 'VRT 1',
		channel: 0,
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingSisyfosType.CHANNEL,
		setLabelToLayerName: true
	}),
	[SisyfosLLAyer.SisyfosSourceHost_2_ST_A]: literal<TSR.MappingSisyfos & BlueprintMapping>({
		device: TSR.DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		layerName: 'VRT 2',
		channel: 1,
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingSisyfosType.CHANNEL,
		setLabelToLayerName: true
	}),
	[SisyfosLLAyer.SisyfosSourceGuest_1_ST_A]: literal<TSR.MappingSisyfos & BlueprintMapping>({
		device: TSR.DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		layerName: 'GST 1',
		channel: 2,
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingSisyfosType.CHANNEL,
		setLabelToLayerName: true
	}),
	[SisyfosLLAyer.SisyfosSourceGuest_2_ST_A]: literal<TSR.MappingSisyfos & BlueprintMapping>({
		device: TSR.DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		layerName: 'GST 2',
		channel: 3,
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingSisyfosType.CHANNEL,
		setLabelToLayerName: true
	}),
	[SisyfosLLAyer.SisyfosSourceGuest_3_ST_A]: literal<TSR.MappingSisyfos & BlueprintMapping>({
		device: TSR.DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		layerName: 'GST 3',
		channel: 4,
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingSisyfosType.CHANNEL,
		setLabelToLayerName: true
	}),
	[SisyfosLLAyer.SisyfosSourceGuest_4_ST_A]: literal<TSR.MappingSisyfos & BlueprintMapping>({
		device: TSR.DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		layerName: 'GST 4',
		channel: 5,
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingSisyfosType.CHANNEL,
		setLabelToLayerName: true
	}),
	[SisyfosLLAyer.SisyfosSourceHost_1_ST_B]: literal<TSR.MappingSisyfos & BlueprintMapping>({
		device: TSR.DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		layerName: 'B-VRT 1',
		channel: 6,
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingSisyfosType.CHANNEL,
		setLabelToLayerName: true
	}),
	[SisyfosLLAyer.SisyfosSourceHost_2_ST_B]: literal<TSR.MappingSisyfos & BlueprintMapping>({
		device: TSR.DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		layerName: 'B-VRT 2',
		channel: 7,
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingSisyfosType.CHANNEL,
		setLabelToLayerName: true
	}),
	[SisyfosLLAyer.SisyfosSourceGuest_1_ST_B]: literal<TSR.MappingSisyfos & BlueprintMapping>({
		device: TSR.DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		layerName: 'B-GST 1',
		channel: 8,
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingSisyfosType.CHANNEL,
		setLabelToLayerName: true
	}),
	[SisyfosLLAyer.SisyfosSourceGuest_2_ST_B]: literal<TSR.MappingSisyfos & BlueprintMapping>({
		device: TSR.DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		layerName: 'B-GST 2',
		channel: 9,
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingSisyfosType.CHANNEL,
		setLabelToLayerName: true
	}),
	[SisyfosLLAyer.SisyfosSourceGuest_3_ST_B]: literal<TSR.MappingSisyfos & BlueprintMapping>({
		device: TSR.DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		layerName: 'B-GST 3',
		channel: 10,
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingSisyfosType.CHANNEL,
		setLabelToLayerName: true
	}),
	[SisyfosLLAyer.SisyfosSourceGuest_4_ST_B]: literal<TSR.MappingSisyfos & BlueprintMapping>({
		device: TSR.DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		layerName: 'B-GST 4',
		channel: 11,
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingSisyfosType.CHANNEL,
		setLabelToLayerName: true
	}),
	[SisyfosLLAyer.SisyfosSourceLive_1]: literal<TSR.MappingSisyfos & BlueprintMapping>({
		device: TSR.DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		layerName: 'LIVE 1',
		channel: 12,
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingSisyfosType.CHANNEL,
		setLabelToLayerName: true
	}),
	[SisyfosLLAyer.SisyfosSourceLive_2]: literal<TSR.MappingSisyfos & BlueprintMapping>({
		device: TSR.DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		layerName: 'LIVE 2',
		channel: 13,
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingSisyfosType.CHANNEL,
		setLabelToLayerName: true
	}),
	[SisyfosLLAyer.SisyfosSourceLive_3]: literal<TSR.MappingSisyfos & BlueprintMapping>({
		device: TSR.DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		layerName: 'LIVE 3',
		channel: 14,
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingSisyfosType.CHANNEL,
		setLabelToLayerName: true
	}),
	[SisyfosLLAyer.SisyfosSourceLive_4]: literal<TSR.MappingSisyfos & BlueprintMapping>({
		device: TSR.DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		layerName: 'LIVE 4',
		channel: 15,
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingSisyfosType.CHANNEL,
		setLabelToLayerName: true
	}),
	[SisyfosLLAyer.SisyfosSourceLive_5]: literal<TSR.MappingSisyfos & BlueprintMapping>({
		device: TSR.DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		layerName: 'LIVE 5',
		channel: 16,
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingSisyfosType.CHANNEL,
		setLabelToLayerName: true
	}),
	[SisyfosLLAyer.SisyfosSourceLive_6]: literal<TSR.MappingSisyfos & BlueprintMapping>({
		device: TSR.DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		layerName: 'LIVE 6',
		channel: 17,
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingSisyfosType.CHANNEL,
		setLabelToLayerName: true
	}),
	[SisyfosLLAyer.SisyfosSourceLive_7]: literal<TSR.MappingSisyfos & BlueprintMapping>({
		device: TSR.DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		layerName: 'LIVE 7',
		channel: 18,
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingSisyfosType.CHANNEL,
		setLabelToLayerName: true
	}),
	[SisyfosLLAyer.SisyfosSourceLive_8]: literal<TSR.MappingSisyfos & BlueprintMapping>({
		device: TSR.DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		layerName: 'LIVE 8',
		channel: 19,
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingSisyfosType.CHANNEL,
		setLabelToLayerName: true
	}),
	[SisyfosLLAyer.SisyfosSourceLive_9]: literal<TSR.MappingSisyfos & BlueprintMapping>({
		device: TSR.DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		layerName: 'LIVE 9',
		channel: 20,
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingSisyfosType.CHANNEL,
		setLabelToLayerName: true
	}),
	[SisyfosLLAyer.SisyfosSourceLive_10]: literal<TSR.MappingSisyfos & BlueprintMapping>({
		device: TSR.DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		layerName: 'LIVE 10',
		channel: 21,
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingSisyfosType.CHANNEL,
		setLabelToLayerName: true
	}),
	[SisyfosLLAyer.SisyfosSourceServerA]: literal<TSR.MappingSisyfos & BlueprintMapping>({
		device: TSR.DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		layerName: 'Server A',
		channel: 22,
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingSisyfosType.CHANNEL,
		setLabelToLayerName: true
	}),
	[SisyfosLLAyer.SisyfosSourceServerB]: literal<TSR.MappingSisyfos & BlueprintMapping>({
		device: TSR.DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		layerName: 'Server B',
		channel: 23,
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingSisyfosType.CHANNEL,
		setLabelToLayerName: true
	}),
	[SisyfosLLAyer.SisyfosSourceEVS_1]: literal<TSR.MappingSisyfos & BlueprintMapping>({
		device: TSR.DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		layerName: 'EVS 1',
		channel: 24,
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingSisyfosType.CHANNEL,
		setLabelToLayerName: true
	}),
	[SisyfosLLAyer.SisyfosSourceEVS_2]: literal<TSR.MappingSisyfos & BlueprintMapping>({
		device: TSR.DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		layerName: 'EVS 2',
		channel: 25,
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingSisyfosType.CHANNEL,
		setLabelToLayerName: true
	}),
	[SisyfosLLAyer.SisyfosSourceJingle]: literal<TSR.MappingSisyfos & BlueprintMapping>({
		device: TSR.DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		layerName: 'JINGLE',
		channel: 26,
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingSisyfosType.CHANNEL,
		setLabelToLayerName: true
	}),
	[SisyfosLLAyer.SisyfosSourceAudiobed]: literal<TSR.MappingSisyfos & BlueprintMapping>({
		device: TSR.DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		layerName: 'BED',
		channel: 27,
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingSisyfosType.CHANNEL,
		setLabelToLayerName: true
	}),
	[SisyfosLLAyer.SisyfosSourceTLF]: literal<TSR.MappingSisyfos & BlueprintMapping>({
		device: TSR.DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		layerName: 'TLF',
		channel: 28,
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingSisyfosType.CHANNEL,
		setLabelToLayerName: true
	}),
	[SisyfosLLAyer.SisyfosResync]: literal<TSR.MappingSisyfos & BlueprintMapping>({
		device: TSR.DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		channel: -1,
		lookahead: LookaheadMode.NONE,
		mappingType: TSR.MappingSisyfosType.CHANNEL,
		setLabelToLayerName: false
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
		layerName: 'Server A',
		lookahead: LookaheadMode.NONE,
		channel: 1,
		layer: 110,
		previewWhenNotOnAir: true
	}),
	[CasparPlayerClip(2)]: literal<TSR.MappingCasparCG & BlueprintMapping>({
		device: TSR.DeviceType.CASPARCG,
		deviceId: 'caspar01',
		layerName: 'Server B',
		lookahead: LookaheadMode.NONE,
		channel: 2,
		layer: 110,
		previewWhenNotOnAir: true
	}),
	[CasparPlayerClipLoadingLoop(1)]: literal<TSR.MappingCasparCG & BlueprintMapping>({
		device: TSR.DeviceType.CASPARCG,
		deviceId: 'caspar01',
		layerName: 'Server A Loading Loop',
		lookahead: LookaheadMode.NONE,
		channel: 1,
		layer: 109
	}),
	[CasparPlayerClipLoadingLoop(2)]: literal<TSR.MappingCasparCG & BlueprintMapping>({
		device: TSR.DeviceType.CASPARCG,
		deviceId: 'caspar01',
		layerName: 'Server B Loading Loop',
		lookahead: LookaheadMode.NONE,
		channel: 2,
		layer: 109
	}),
	[CasparLLayer.CasparCGDVELoop]: literal<TSR.MappingCasparCG & BlueprintMapping>({
		device: TSR.DeviceType.CASPARCG,
		deviceId: 'caspar02',
		layerName: 'DVE Loop',
		lookahead: LookaheadMode.WHEN_CLEAR,
		previewWhenNotOnAir: true,
		channel: 2,
		layer: 110
	}),
	[CasparLLayer.CasparCGFullBg]: literal<TSR.MappingCasparCG & BlueprintMapping>({
		device: TSR.DeviceType.CASPARCG,
		deviceId: 'caspar02',
		layerName: 'Full Background Loop',
		lookahead: LookaheadMode.NONE,
		channel: 4,
		layer: 110
	}),
	[GraphicLLayer.GraphicLLayerLocators]: literal<TSR.MappingCasparCG & BlueprintMapping>({
		device: TSR.DeviceType.CASPARCG,
		deviceId: 'caspar02',
		layerName: 'GFX Locators',
		lookahead: LookaheadMode.WHEN_CLEAR,
		previewWhenNotOnAir: true,
		channel: 2,
		layer: 120
	}),
	[CasparLLayer.CasparCGDVEKey]: literal<TSR.MappingCasparCG & BlueprintMapping>({
		device: TSR.DeviceType.CASPARCG,
		deviceId: 'caspar02',
		layerName: 'DVE Key',
		lookahead: LookaheadMode.WHEN_CLEAR,
		previewWhenNotOnAir: true,
		channel: 2,
		layer: 109
	}),
	[CasparLLayer.CasparCGDVEKeyedLoop]: literal<TSR.MappingCasparCG & BlueprintMapping>({
		device: TSR.DeviceType.CASPARCG,
		deviceId: 'caspar01',
		layerName: 'DVE Loop (keyed)',
		lookahead: LookaheadMode.WHEN_CLEAR,
		previewWhenNotOnAir: true,
		channel: 2,
		layer: 110
	}),
	[CasparLLayer.CasparCGDVEFrame]: literal<TSR.MappingCasparCG & BlueprintMapping>({
		device: TSR.DeviceType.CASPARCG,
		deviceId: 'caspar02',
		layerName: 'DVE Frame',
		lookahead: LookaheadMode.WHEN_CLEAR,
		previewWhenNotOnAir: true,
		channel: 2,
		layer: 111
	}),
	[CasparLLayer.CasparPlayerJingle]: literal<TSR.MappingCasparCG & BlueprintMapping>({
		device: TSR.DeviceType.CASPARCG,
		deviceId: 'caspar02',
		layerName: 'Jingle',
		lookahead: LookaheadMode.PRELOAD,
		channel: 1,
		layer: 120,
		previewWhenNotOnAir: true
	}),
	[CasparLLayer.CasparCountdown]: literal<TSR.MappingCasparCG & BlueprintMapping>({
		device: TSR.DeviceType.CASPARCG,
		deviceId: 'caspar02',
		layerName: 'Countdown',
		lookahead: LookaheadMode.NONE,
		previewWhenNotOnAir: true,
		channel: 3,
		layer: 120
	}),
	[CasparLLayer.CasparCGLYD]: literal<TSR.MappingCasparCG & BlueprintMapping>({
		device: TSR.DeviceType.CASPARCG,
		deviceId: 'caspar02',
		layerName: 'Audio Beds',
		lookahead: LookaheadMode.NONE,
		channel: 1,
		layer: 101
	})
}

export const MAPPINGS_GRAPHICS: BlueprintMappings = {
	[GraphicLLayer.GraphicLLayerOverlay]: literal<TSR.MappingVizMSE & BlueprintMapping>({
		device: TSR.DeviceType.VIZMSE,
		deviceId: 'viz0',
		layerName: 'GFX Overlay',
		lookahead: LookaheadMode.NONE
	}),
	[GraphicLLayer.GraphicLLayerOverlayIdent]: literal<TSR.MappingVizMSE & BlueprintMapping>({
		device: TSR.DeviceType.VIZMSE,
		deviceId: 'viz0',
		layerName: 'GFX Ident',
		lookahead: LookaheadMode.NONE
	}),
	[GraphicLLayer.GraphicLLayerOverlayTopt]: literal<TSR.MappingVizMSE & BlueprintMapping>({
		device: TSR.DeviceType.VIZMSE,
		deviceId: 'viz0',
		layerName: 'GFX Topt',
		lookahead: LookaheadMode.NONE
	}),
	[GraphicLLayer.GraphicLLayerOverlayLower]: literal<TSR.MappingVizMSE & BlueprintMapping>({
		device: TSR.DeviceType.VIZMSE,
		deviceId: 'viz0',
		layerName: 'GFX Bund',
		lookahead: LookaheadMode.NONE
	}),
	[GraphicLLayer.GraphicLLayerOverlayHeadline]: literal<TSR.MappingVizMSE & BlueprintMapping>({
		device: TSR.DeviceType.VIZMSE,
		deviceId: 'viz0',
		layerName: 'GFX Headline',
		lookahead: LookaheadMode.NONE
	}),
	[GraphicLLayer.GraphicLLayerOverlayTema]: literal<TSR.MappingVizMSE & BlueprintMapping>({
		device: TSR.DeviceType.VIZMSE,
		deviceId: 'viz0',
		layerName: 'GFX Tema',
		lookahead: LookaheadMode.NONE
	}),
	[GraphicLLayer.GraphicLLayerPilot]: literal<TSR.MappingVizMSE & BlueprintMapping>({
		device: TSR.DeviceType.VIZMSE,
		deviceId: 'viz0',
		layerName: 'GFX Pilot (Full)',
		lookahead: LookaheadMode.NONE
	}),
	[GraphicLLayer.GraphicLLayerPilotOverlay]: literal<TSR.MappingVizMSE & BlueprintMapping>({
		device: TSR.DeviceType.VIZMSE,
		deviceId: 'viz0',
		layerName: 'GFX Pilot (Overlay)',
		lookahead: LookaheadMode.NONE
	}),
	[GraphicLLayer.GraphicLLayerDesign]: literal<TSR.MappingVizMSE & BlueprintMapping>({
		device: TSR.DeviceType.VIZMSE,
		deviceId: 'viz0',
		layerName: 'GFX Design',
		lookahead: LookaheadMode.NONE
	}),
	[GraphicLLayer.GraphicLLayerAdLibs]: literal<TSR.MappingVizMSE & BlueprintMapping>({
		device: TSR.DeviceType.VIZMSE,
		deviceId: 'viz0',
		layerName: 'GFX AdLibs',
		lookahead: LookaheadMode.NONE
	}),
	[GraphicLLayer.GraphicLLayerWall]: literal<TSR.MappingVizMSE & BlueprintMapping>({
		device: TSR.DeviceType.VIZMSE,
		deviceId: 'viz0',
		layerName: 'GFX Wall',
		lookahead: LookaheadMode.NONE
	}),
	[GraphicLLayer.GraphicLLayerFullLoop]: literal<TSR.MappingVizMSE & BlueprintMapping>({
		device: TSR.DeviceType.VIZMSE,
		deviceId: 'viz0',
		layerName: 'GFX Full Loop',
		lookahead: LookaheadMode.NONE
	}),
	[GraphicLLayer.GraphicLLayerConcept]: literal<TSR.MappingVizMSE & BlueprintMapping>({
		device: DeviceType.VIZMSE,
		deviceId: 'viz0',
		layerName: 'Override Concept',
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
	...GetDSKMappings(ATEMModel.CONSTELLATION_8K_UHD_MODE),
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
		res[CasparPlayerClip(mp.id)] = literal<TSR.MappingCasparCG & BlueprintMapping>({
			device: TSR.DeviceType.CASPARCG,
			deviceId: 'caspar01',
			lookahead: LookaheadMode.NONE,
			channel: 0, // TODO?
			layer: 110
		})
		res[SisyfosPlayerClip(mp.id)] = literal<TSR.MappingSisyfos & BlueprintMapping>({
			device: TSR.DeviceType.SISYFOS,
			deviceId: 'sisyfos0',
			lookahead: LookaheadMode.NONE,
			channel: Number(mp.id) || 0,
			mappingType: TSR.MappingSisyfosType.CHANNEL,
			layerName: `Server ${mp.id === '1' ? 'A' : 'B'}`,
			setLabelToLayerName: true
		})
	}

	return res
}
