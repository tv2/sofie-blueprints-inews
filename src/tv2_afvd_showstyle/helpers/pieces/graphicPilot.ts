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
	FindDSKFullGFX,
	GetSisyfosTimelineObjForCamera,
	GraphicPilot,
	literal,
	PilotGeneratorSettings,
	SisyfosEVSSource,
	SourceInfo
} from 'tv2-common'
import { AtemLLayer, SisyfosLLAyer } from '../../../tv2_afvd_studio/layers'
import { BlueprintConfig } from '../config'

export const pilotGeneratorSettingsAFVD: PilotGeneratorSettings = {
	caspar: { createPilotTimelineForStudio: () => [] },
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
	const fullsDSK = FindDSKFullGFX(config)

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
					input: config.studio.AtemSource.FullFrameGrafikBackground,
					transition: TSR.AtemTransitionStyle.CUT
				}
			},
			...(adlib ? { classes: ['adlib_deparent'] } : {})
		}),
		literal<TSR.TimelineObjAtemDSK>({
			id: '',
			enable: {
				start: config.studio.VizPilotGraphics.CutToMediaPlayer
			},
			priority: 1,
			layer: AtemLLayer.AtemAuxPGM,
			content: {
				deviceType: TSR.DeviceType.ATEM,
				type: TSR.TimelineContentTypeAtem.DSK,
				dsk: {
					onAir: true,
					sources: {
						fillSource: fullsDSK.Fill,
						cutSource: fullsDSK.Key
					}
				}
			},
			classes: ['MIX_MINUS_OVERRIDE_DSK', 'PLACEHOLDER_OBJECT_REMOVEME']
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
