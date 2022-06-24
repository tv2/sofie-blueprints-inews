import {
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	IShowStyleUserContext,
	TSR
} from '@tv2media/blueprints-integration'
import {
	CreateInternalGraphic,
	CreatePilotGraphic,
	CueDefinitionGraphic,
	FindDSKFullGFX,
	GetSisyfosTimelineObjForCamera,
	GraphicInternalOrPilot,
	GraphicIsInternal,
	GraphicIsPilot,
	literal,
	PartDefinition,
	PilotGeneratorSettings
} from 'tv2-common'
import { OfftubeAtemLLayer, OfftubeSisyfosLLayer } from '../../tv2_offtube_studio/layers'
import { OfftubeShowstyleBlueprintConfig } from '../helpers/config'

export const pilotGeneratorSettingsOfftube: PilotGeneratorSettings = {
	caspar: {
		createPilotTimelineForStudio: createPilotTimeline
	},
	viz: {
		createPilotTimelineForStudio: () => []
	}
}

export function OfftubeEvaluateGrafikCaspar(
	config: OfftubeShowstyleBlueprintConfig,
	context: IShowStyleUserContext,
	pieces: IBlueprintPiece[],
	adlibPieces: IBlueprintAdLibPiece[],
	actions: IBlueprintActionManifest[],
	partId: string,
	parsedCue: CueDefinitionGraphic<GraphicInternalOrPilot>,
	adlib: boolean,
	partDefinition: PartDefinition,
	adlibRank?: number
) {
	if (GraphicIsPilot(parsedCue)) {
		CreatePilotGraphic(pieces, adlibPieces, actions, {
			engine: parsedCue.target,
			config,
			context,
			partId,
			parsedCue,
			settings: pilotGeneratorSettingsOfftube,
			adlib,
			adlibRank,
			segmentExternalId: partDefinition.segmentExternalId
		})
	} else if (GraphicIsInternal(parsedCue)) {
		CreateInternalGraphic(
			config,
			context,
			pieces,
			adlibPieces,
			actions,
			partId,
			parsedCue,
			adlib,
			partDefinition,
			adlibRank
		)
	}
}

function createPilotTimeline(
	config: OfftubeShowstyleBlueprintConfig,
	context: IShowStyleUserContext
): TSR.TSRTimelineObj[] {
	const fullDSK = FindDSKFullGFX(config)
	return [
		literal<TSR.TimelineObjAtemME>({
			id: '',
			enable: {
				start: Number(config.studio.CasparPrerollDuration)
			},
			priority: 1,
			layer: OfftubeAtemLLayer.AtemMEClean,
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
		GetSisyfosTimelineObjForCamera(context, config, 'full', OfftubeSisyfosLLayer.SisyfosGroupStudioMics)
	]
}
