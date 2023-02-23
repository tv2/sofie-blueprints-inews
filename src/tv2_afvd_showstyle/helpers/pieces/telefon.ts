import {
	Adlib,
	CueDefinitionTelefon,
	EvaluateCueResult,
	ExtendedShowStyleContext,
	GetSisyfosTimelineObjForTelefon,
	PartDefinition
} from 'tv2-common'
import { SharedOutputLayers } from 'tv2-constants'
import { SisyfosLLAyer } from '../../../tv2_afvd_studio/layers'
import { GalleryBlueprintConfig } from '../config'
import { EvaluateCueGraphic } from './graphic'

export function EvaluateTelefon(
	context: ExtendedShowStyleContext<GalleryBlueprintConfig>,
	partId: string,
	partDefinition: PartDefinition,
	parsedCue: CueDefinitionTelefon,
	adlib?: Adlib
): EvaluateCueResult {
	if (!parsedCue.graphic) {
		return new EvaluateCueResult()
	}

	const result = EvaluateCueGraphic(context, partId, parsedCue.graphic, partDefinition, adlib)

	if (!adlib && result.pieces.length) {
		const graphicPiece = findTelefonPiece(result)
		if (graphicPiece && graphicPiece.content && graphicPiece.content.timelineObjects) {
			graphicPiece.content.timelineObjects.push(
				...GetSisyfosTimelineObjForTelefon(context.config, SisyfosLLAyer.SisyfosSourceTLF)
			)
			graphicPiece.name = `${parsedCue.source}`
		}
	}
	return result
}

function findTelefonPiece(result: EvaluateCueResult) {
	return result.pieces.find(
		(p) =>
			p.outputLayerId === SharedOutputLayers.OVERLAY ||
			p.outputLayerId === SharedOutputLayers.PGM ||
			p.outputLayerId === SharedOutputLayers.SEC
	)
}
