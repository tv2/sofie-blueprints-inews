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
	PilotGeneratorSettings,
	TimeFromFrames,
	TimelineBlueprintExt
} from 'tv2-common'
import { OfftubeAtemLLayer, OfftubeCasparLLayer, OfftubeSisyfosLLayer } from '../../tv2_offtube_studio/layers'
import { AtemSourceIndex } from '../../types/atem'
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
					input: config.studio.AtemSource.SplitBackground,
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
			enable: {
				start:
					Number(config.studio.CasparPrerollDuration) +
					TimeFromFrames(Number(config.studio.HTMLGraphics.TransitionSettings.wipeRate))
			},
			priority: 1,
			layer: OfftubeCasparLLayer.CasparGraphicsFullLoop,
			content: {
				deviceType: TSR.DeviceType.CASPARCG,
				type: TSR.TimelineContentTypeCasparCg.ROUTE,
				mappedLayer: OfftubeCasparLLayer.CasparCGDVELoop,
				transitions: {
					outTransition: {
						type: TSR.Transition.MIX,
						duration: config.studio.HTMLGraphics.TransitionSettings.loopOutTransitionDuration
					}
				}
			}
		}),
		literal<TSR.TimelineObjAtemME & TimelineBlueprintExt>({
			id: '',
			enable: { start: 0 },
			priority: 0,
			layer: OfftubeAtemLLayer.AtemMENext,
			content: {
				deviceType: TSR.DeviceType.ATEM,
				type: TSR.TimelineContentTypeAtem.ME,
				me: {
					previewInput: AtemSourceIndex.Blk
				}
			},
			metaData: {},
			classes: ['ab_on_preview']
		}),
		GetSisyfosTimelineObjForCamera(context, config, 'full', OfftubeSisyfosLLayer.SisyfosGroupStudioMics)
	]
}
