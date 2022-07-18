import {
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	IShowStyleUserContext,
	IStudioUserContext,
	TSR
} from '@tv2media/blueprints-integration'
import {
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
import { AtemLLayer, SisyfosLLAyer } from '../../../tv2_afvd_studio/layers'
import { BlueprintConfig } from '../config'

export const pilotGeneratorSettingsAFVD: PilotGeneratorSettings = {
	caspar: { createPilotTimelineForStudio: makeStudioTimelineCaspar },
	viz: { createPilotTimelineForStudio: makeStudioTimelineViz }
}

export function EvaluateCueGraphicPilot(
	config: TV2BlueprintConfig,
	context: IShowStyleUserContext,
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

function makeStudioTimelineViz(
	config: BlueprintConfig,
	_context: IStudioUserContext,
	adlib: boolean
): TSR.TSRTimelineObj[] {
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
		...GetSisyfosTimelineObjForFull(config, SisyfosLLAyer.SisyfosGroupStudioMics)
	]
}

function makeStudioTimelineCaspar(config: BlueprintConfig, _context: IStudioUserContext) {
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
		...GetSisyfosTimelineObjForFull(config, SisyfosLLAyer.SisyfosGroupStudioMics)
	]
}
