import {
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	IShowStyleUserContext,
	TSR
} from 'blueprints-integration'
import {
	Adlib,
	CreateInternalGraphic,
	CreatePilotGraphic,
	CueDefinitionGraphic,
	FindDSKFullGFX,
	GetSisyfosTimelineObjForFull,
	GraphicInternalOrPilot,
	GraphicIsInternal,
	GraphicIsPilot,
	literal,
	PartDefinition,
	PilotGeneratorSettings
} from 'tv2-common'
import { OfftubeAtemLLayer } from '../../tv2_offtube_studio/layers'
import { OfftubeShowstyleBlueprintConfig } from '../helpers/config'

export const pilotGeneratorSettingsOfftube: PilotGeneratorSettings = {
	caspar: {
		createFullPilotTimelineForStudio: createPilotTimeline
	},
	viz: {
		createFullPilotTimelineForStudio: () => []
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
	partDefinition: PartDefinition,
	adlib?: Adlib
) {
	if (GraphicIsPilot(parsedCue)) {
		CreatePilotGraphic(pieces, adlibPieces, actions, {
			config,
			context,
			partId,
			parsedCue,
			settings: pilotGeneratorSettingsOfftube,
			adlib,
			segmentExternalId: partDefinition.segmentExternalId
		})
	} else if (GraphicIsInternal(parsedCue)) {
		CreateInternalGraphic(config, context, pieces, adlibPieces, partId, parsedCue, partDefinition, adlib)
	}
}

function createPilotTimeline(config: OfftubeShowstyleBlueprintConfig): TSR.TSRTimelineObj[] {
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
		...GetSisyfosTimelineObjForFull(config)
	]
}
