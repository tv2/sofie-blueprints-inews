import {
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	NotesContext,
	SegmentContext,
	TSR
} from '@sofie-automation/blueprints-integration'
import {
	CreateInternalGraphic,
	CreatePilotGraphic,
	CueDefinitionGraphic,
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
	context: SegmentContext,
	pieces: IBlueprintPiece[],
	adlibPieces: IBlueprintAdLibPiece[],
	actions: IBlueprintActionManifest[],
	partId: string,
	parsedCue: CueDefinitionGraphic<GraphicInternalOrPilot>,
	adlib: boolean,
	partDefinition: PartDefinition,
	rank?: number
) {
	if (GraphicIsPilot(parsedCue)) {
		CreatePilotGraphic(
			config,
			context,
			pieces,
			adlibPieces,
			actions,
			partId,
			parsedCue,
			pilotGeneratorSettingsOfftube,
			adlib,
			rank ?? 0,
			partDefinition.segmentExternalId
		)
	} else if (GraphicIsInternal(parsedCue)) {
		CreateInternalGraphic(config, context, pieces, adlibPieces, actions, partId, parsedCue, adlib, partDefinition, rank)
	}
}

function createPilotTimeline(config: OfftubeShowstyleBlueprintConfig, context: NotesContext): TSR.TSRTimelineObj[] {
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
					input: config.studio.AtemSource.GFXFull,
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
