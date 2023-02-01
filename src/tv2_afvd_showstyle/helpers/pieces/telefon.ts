import { IBlueprintActionManifest, IBlueprintAdLibPiece, IBlueprintPiece } from 'blueprints-integration'
import {
	Adlib,
	CueDefinitionTelefon,
	ExtendedShowStyleContext,
	GetSisyfosTimelineObjForTelefon,
	GraphicDisplayName,
	PartDefinition
} from 'tv2-common'
import { SisyfosLLAyer } from '../../../tv2_afvd_studio/layers'
import { GalleryBlueprintConfig } from '../config'
import { EvaluateCueGraphic } from './graphic'

export function EvaluateTelefon(
	context: ExtendedShowStyleContext<GalleryBlueprintConfig>,
	pieces: IBlueprintPiece[],
	adlibPieces: IBlueprintAdLibPiece[],
	actions: IBlueprintActionManifest[],
	partId: string,
	partDefinition: PartDefinition,
	parsedCue: CueDefinitionTelefon,
	adlib?: Adlib
) {
	if (parsedCue.graphic) {
		EvaluateCueGraphic(context, pieces, adlibPieces, actions, partId, parsedCue.graphic, partDefinition, adlib)

		if ((!adlib && pieces.length) || (adlib && adlibPieces.length)) {
			if (!adlib) {
				const graphicPiece = pieces.find(p => p.name === GraphicDisplayName(context.config, parsedCue.graphic!))
				if (graphicPiece && graphicPiece.content && graphicPiece.content.timelineObjects) {
					graphicPiece.content.timelineObjects.push(
						...GetSisyfosTimelineObjForTelefon(context.config, SisyfosLLAyer.SisyfosSourceTLF)
					)
					graphicPiece.name = `${parsedCue.source}`
				}
			}
		}
	}
}
