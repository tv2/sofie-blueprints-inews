import {
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	NotesContext,
	SegmentContext,
	SourceLayerType,
	TSR
} from '@sofie-automation/blueprints-integration'
import {
	CreatePilotGraphic,
	CueDefinitionGraphic,
	EnableDSK,
	FindDSKFullGFX,
	GetSisyfosTimelineObjForCamera,
	GraphicPilot,
	literal,
	PilotGeneratorSettings,
	SisyfosEVSSource,
	SourceInfo
} from 'tv2-common'
import { GraphicLLayer } from 'tv2-constants'
import { AtemLLayer, CasparLLayer, SisyfosLLAyer } from '../../../tv2_afvd_studio/layers'
import { BlueprintConfig } from '../config'

export const pilotGeneratorSettingsAFVD: PilotGeneratorSettings = {
	caspar: { createPilotTimelineForStudio: makeStudioTimelineCaspar },
	viz: { createPilotTimelineForStudio: makeStudioTimelineViz }
}

export function EvaluateCueGraphicPilot(
	config: BlueprintConfig,
	context: SegmentContext,
	pieces: IBlueprintPiece[],
	adlibPieces: IBlueprintAdLibPiece[],
	actions: IBlueprintActionManifest[],
	partId: string,
	parsedCue: CueDefinitionGraphic<GraphicPilot>,
	adlib: boolean,
	segmentExternalId: string,
	rank?: number
) {
	CreatePilotGraphic(
		config,
		context,
		pieces,
		adlibPieces,
		actions,
		partId,
		parsedCue,
		pilotGeneratorSettingsAFVD,
		adlib,
		rank ?? 0,
		segmentExternalId
	)
}

function makeStudioTimelineViz(config: BlueprintConfig, context: NotesContext, adlib: boolean): TSR.TSRTimelineObj[] {
	const fullDSK = FindDSKFullGFX(config)

	return [
		literal<TSR.TimelineObjAtemME>({
			id: '',
			enable: {
				start: config.studio.VizPilotGraphics.CutToMediaPlayer
			},
			priority: 1,
			layer: AtemLLayer.AtemMEProgram,
			content: {
				deviceType: TSR.DeviceType.ATEM,
				type: TSR.TimelineContentTypeAtem.ME,
				me: {
					input: config.studio.VizPilotGraphics.FullGraphicBackground,
					transition: TSR.AtemTransitionStyle.CUT
				}
			},
			...(adlib ? { classes: ['adlib_deparent'] } : {})
		}),
		literal<TSR.TimelineObjAtemAUX>({
			id: '',
			enable: {
				start: config.studio.VizPilotGraphics.CutToMediaPlayer
			},
			priority: 1,
			layer: AtemLLayer.AtemAuxPGM,
			content: {
				deviceType: TSR.DeviceType.ATEM,
				type: TSR.TimelineContentTypeAtem.AUX,
				aux: {
					input: fullDSK.Fill
				}
			},
			classes: ['MIX_MINUS_OVERRIDE_DSK', 'PLACEHOLDER_OBJECT_REMOVEME']
		}),
		// Assume DSK is off by default (config table)
		...EnableDSK(config, 'FULL'),
		GetSisyfosTimelineObjForCamera(context, config, 'full', SisyfosLLAyer.SisyfosGroupStudioMics),
		...muteSisyfosChannels(config.sources)
	]
}

function makeStudioTimelineCaspar(config: BlueprintConfig, context: NotesContext) {
	const fullDSK = FindDSKFullGFX(config)
	return [
		literal<TSR.TimelineObjAtemME>({
			id: '',
			enable: {
				start: Number(config.studio.CasparPrerollDuration)
			},
			priority: 1,
			layer: AtemLLayer.AtemMEProgram,
			content: {
				deviceType: TSR.DeviceType.ATEM,
				type: TSR.TimelineContentTypeAtem.ME,
				me: {
					input: fullDSK.Fill,
					transition: TSR.AtemTransitionStyle.WIPE,
					transitionSettings: {
						wipe: {
							rate: Number(config.studio.HTMLGraphics.TransitionSettings.wipeRate),
							pattern: 1,
							reverseDirection: true,
							borderSoftness: config.studio.HTMLGraphics.TransitionSettings.borderSoftness
						}
					}
				}
			}
		}),
		literal<TSR.TimelineObjCasparCGAny>({
			id: '',
			enable: { start: 0 },
			priority: 2, // Take priority over anything trying to set the template on the Viz version of this layer
			layer: GraphicLLayer.GraphicLLayerFullLoop,
			content: {
				deviceType: TSR.DeviceType.CASPARCG,
				type: TSR.TimelineContentTypeCasparCg.ROUTE,
				mappedLayer: CasparLLayer.CasparCGDVELoop
			}
		}),
		GetSisyfosTimelineObjForCamera(context, config, 'full', SisyfosLLAyer.SisyfosGroupStudioMics),
		...muteSisyfosChannels(config.sources)
	]
}

function muteSisyfosChannels(sources: SourceInfo[]): TSR.TimelineObjSisyfosChannel[] {
	return [
		SisyfosLLAyer.SisyfosSourceServerA,
		SisyfosLLAyer.SisyfosSourceServerB,
		SisyfosLLAyer.SisyfosSourceLive_1,
		SisyfosLLAyer.SisyfosSourceLive_2,
		SisyfosLLAyer.SisyfosSourceLive_3,
		SisyfosLLAyer.SisyfosSourceLive_4,
		SisyfosLLAyer.SisyfosSourceLive_5,
		SisyfosLLAyer.SisyfosSourceLive_6,
		SisyfosLLAyer.SisyfosSourceLive_7,
		SisyfosLLAyer.SisyfosSourceLive_8,
		SisyfosLLAyer.SisyfosSourceLive_9,
		SisyfosLLAyer.SisyfosSourceLive_10,
		SisyfosLLAyer.SisyfosSourceTLF,
		...[
			...(sources
				.filter(s => s.type === SourceLayerType.LOCAL)
				.map(s => SisyfosEVSSource(s.id.replace(/^DP/i, '') as SisyfosLLAyer)) as SisyfosLLAyer[])
		]
	].map<TSR.TimelineObjSisyfosChannel>(layer => {
		return literal<TSR.TimelineObjSisyfosChannel>({
			id: '',
			enable: {
				start: 0
			},
			priority: 2,
			layer,
			content: {
				deviceType: TSR.DeviceType.SISYFOS,
				type: TSR.TimelineContentTypeSisyfos.CHANNEL,
				isPgm: 0
			}
		})
	})
}
