import { IBlueprintActionManifest, IBlueprintAdLibPiece, IBlueprintPart, IBlueprintPiece } from 'blueprints-integration'
import {
	CueDefinitionEkstern,
	EvaluateEksternBase,
	ExtendedShowStyleContext,
	PartDefinition,
	PieceMetaData,
	TV2ShowStyleConfig
} from 'tv2-common'
import { AtemLLayer } from '../../../tv2_afvd_studio/layers'
import { SourceLayer } from '../../layers'

export function EvaluateEkstern(
	context: ExtendedShowStyleContext<TV2ShowStyleConfig>,
	part: IBlueprintPart,
	pieces: Array<IBlueprintPiece<PieceMetaData>>,
	adlibPieces: Array<IBlueprintAdLibPiece<PieceMetaData>>,
	_actions: IBlueprintActionManifest[],
	partId: string,
	parsedCue: CueDefinitionEkstern,
	partDefinition: PartDefinition,
	adlib?: boolean,
	rank?: number
) {
	EvaluateEksternBase(
		context,
		part,
		pieces,
		adlibPieces,
		partId,
		parsedCue,
		partDefinition,
		{
			SourceLayer: {
				PgmLive: SourceLayer.PgmLive
			},
			ATEM: {
				MEProgram: AtemLLayer.AtemMEProgram
			}
		},
		adlib,
		rank
	)
}
