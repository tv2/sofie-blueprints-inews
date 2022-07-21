import {
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	ISegmentUserContext,
	TSR
} from '@tv2media/blueprints-integration'
import {
	Adlib,
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
	context: ISegmentUserContext,
	pieces: IBlueprintPiece[],
	adlibPieces: IBlueprintAdLibPiece[],
	actions: IBlueprintActionManifest[],
	partId: string,
	partDefinition: PartDefinition,
	parsedCue: CueDefinitionTelefon,
	adlib?: Adlib
) {
	if (parsedCue.graphic) {
		EvaluateCueGraphic(config, context, pieces, adlibPieces, actions, partId, parsedCue.graphic, partDefinition, adlib)

		if ((!adlib && pieces.length) || (adlib && adlibPieces.length)) {
			if (!adlib) {
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
					pieces[graphicPieceIndex] = graphicPiece
				}
			}
		}
	}
}
