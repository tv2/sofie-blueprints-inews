import { IBlueprintAdLibPiece, IBlueprintPiece, PartContext } from 'tv-automation-sofie-blueprints-integration'
import { CueDefinitionVIZ, EvaluateVIZBase, GraphicLLayer } from 'tv2-common'
import * as _ from 'underscore'
import { BlueprintConfig } from '../../../tv2_afvd_showstyle/helpers/config'
import { SourceLayer } from '../../../tv2_afvd_showstyle/layers'
import { AtemLLayer, CasparLLayer } from '../../../tv2_afvd_studio/layers'

export function EvaluateVIZ(
	context: PartContext,
	config: BlueprintConfig,
	pieces: IBlueprintPiece[],
	adlibPieces: IBlueprintAdLibPiece[],
	partId: string,
	parsedCue: CueDefinitionVIZ,
	adlib?: boolean,
	rank?: number
) {
	EvaluateVIZBase(
		context,
		config,
		pieces,
		adlibPieces,
		partId,
		parsedCue,
		true,
		{
			SourceLayerDVEBackground: SourceLayer.PgmDVEBackground,
			CasparLLayerDVELoop: CasparLLayer.CasparCGDVELoop,
			SourceLayerVizFullIn1: SourceLayer.VizFullIn1,
			AtemLLayerAtemAuxVizOvlIn1: AtemLLayer.AtemAuxVizOvlIn1,
			SourceLayerDesign: SourceLayer.PgmDesign,
			GraphicLLayerGraphicLLayerDesign: GraphicLLayer.GraphicLLayerDesign
		},
		adlib,
		rank
	)
}
