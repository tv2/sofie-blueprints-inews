import {
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	SegmentContext,
	TSR
} from '@sofie-automation/blueprints-integration'
import {
	CueDefinitionTelefon,
	GetSisyfosTimelineObjForCamera,
	GraphicDisplayName,
	literal,
	PartDefinition
} from 'tv2-common'
import { SisyfosLLAyer } from '../../../tv2_afvd_studio/layers'
import { BlueprintConfig } from '../config'
import { EvaluateCueGraphic } from './graphic'

export function EvaluateTelefon(
	config: BlueprintConfig,
	context: SegmentContext,
	pieces: IBlueprintPiece[],
	adlibPieces: IBlueprintAdLibPiece[],
	actions: IBlueprintActionManifest[],
	partId: string,
	partDefinition: PartDefinition,
	parsedCue: CueDefinitionTelefon,
	adlib?: boolean,
	rank?: number
) {
	if (parsedCue.graphic) {
		EvaluateCueGraphic(
			config,
			context,
			pieces,
			adlibPieces,
			actions,
			partId,
			parsedCue.graphic,
			!!adlib,
			partDefinition,
			rank
		)

		if ((!adlib && pieces.length) || (adlib && adlibPieces.length)) {
			if (adlib) {
				// TODO: This find feels redundant
				const graphicPieceIndex = adlibPieces.findIndex(p => p.name === GraphicDisplayName(config, parsedCue.graphic!))
				const graphicPiece = adlibPieces[graphicPieceIndex]
				if (graphicPiece && graphicPiece.content && graphicPiece.content.timelineObjects) {
					graphicPiece.content.timelineObjects.push(
						literal<TSR.TimelineObjSisyfosChannel>({
							id: '',
							enable: {
								start: 0
							},
							priority: 1,
							layer: SisyfosLLAyer.SisyfosSourceTLF,
							content: {
								deviceType: TSR.DeviceType.SISYFOS,
								type: TSR.TimelineContentTypeSisyfos.CHANNEL,
								isPgm: 1
							}
						}),

						GetSisyfosTimelineObjForCamera(context, config, 'telefon', SisyfosLLAyer.SisyfosGroupStudioMics)
					)
					graphicPiece.name = `${parsedCue.source}`
					graphicPiece.adlibPreroll = config.studio.PilotPrerollDuration
					adlibPieces[graphicPieceIndex] = graphicPiece
				}
			} else {
				const graphicPieceIndex = pieces.findIndex(p => p.name === GraphicDisplayName(config, parsedCue.graphic!))
				const graphicPiece = pieces[graphicPieceIndex]
				if (graphicPiece && graphicPiece.content && graphicPiece.content.timelineObjects) {
					graphicPiece.content.timelineObjects.push(
						literal<TSR.TimelineObjSisyfosChannel>({
							id: '',
							enable: {
								start: 0
							},
							priority: 1,
							layer: SisyfosLLAyer.SisyfosSourceTLF,
							content: {
								deviceType: TSR.DeviceType.SISYFOS,
								type: TSR.TimelineContentTypeSisyfos.CHANNEL,
								isPgm: 1
							}
						}),

						GetSisyfosTimelineObjForCamera(context, config, 'telefon', SisyfosLLAyer.SisyfosGroupStudioMics)
					)
					graphicPiece.name = `${parsedCue.source}`
					graphicPiece.adlibPreroll = config.studio.PilotPrerollDuration
					pieces[graphicPieceIndex] = graphicPiece
				}
			}
		}
	}
}
