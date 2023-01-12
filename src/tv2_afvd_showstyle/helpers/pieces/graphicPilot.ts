import {
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	IShowStyleUserContext,
	TSR
} from 'blueprints-integration'
import {
	Adlib,
	CreatePilotGraphic,
	CueDefinitionGraphic,
	EnableDSK,
	FindDSKFullGFX,
	GetSisyfosTimelineObjForFull,
	GraphicPilot,
	literal,
	PilotGeneratorSettings,
	TV2BlueprintConfig
} from 'tv2-common'
import { AtemLLayer } from '../../../tv2_afvd_studio/layers'
import { BlueprintConfig } from '../config'

export const pilotGeneratorSettingsAFVD: PilotGeneratorSettings = {
	caspar: { createFullPilotTimelineForStudio: makeStudioTimelineCaspar },
	viz: { createFullPilotTimelineForStudio: makeStudioTimelineViz }
}

export function EvaluateCueGraphicPilot(
	config: TV2BlueprintConfig,
	context: IShowStyleUserContext,
	pieces: IBlueprintPiece[],
	adlibPieces: IBlueprintAdLibPiece[],
	actions: IBlueprintActionManifest[],
	partId: string,
	parsedCue: CueDefinitionGraphic<GraphicPilot>,
	segmentExternalId: string,
	adlib?: Adlib
) {
	CreatePilotGraphic(pieces, adlibPieces, actions, {
		config,
		context,
		partId,
		parsedCue,
		settings: pilotGeneratorSettingsAFVD,
		adlib,
		segmentExternalId
	})
}

function makeStudioTimelineViz(config: BlueprintConfig): Array<TSR.TSRTimelineObj<TSR.TSRTimelineContent>> {
	const fullDSK = FindDSKFullGFX(config)

	return [
		literal<TSR.TSRTimelineObj<TSR.TimelineContentAtemME>>({
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
			}
		}),
		literal<TSR.TSRTimelineObj<TSR.TimelineContentAtemAUX>>({
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
		...GetSisyfosTimelineObjForFull(config)
	]
}

function makeStudioTimelineCaspar(config: BlueprintConfig) {
	const fullDSK = FindDSKFullGFX(config)
	return [
		literal<TSR.TSRTimelineObj<TSR.TimelineContentAtemME>>({
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
		...GetSisyfosTimelineObjForFull(config)
	]
}
