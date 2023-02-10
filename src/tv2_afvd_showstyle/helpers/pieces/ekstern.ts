import { IBlueprintActionManifest, IBlueprintAdLibPiece, IBlueprintPart, IBlueprintPiece } from 'blueprints-integration'
import {
	CueDefinitionEkstern,
	EvaluateEksternBase,
	ExtendedShowStyleContext,
	PartDefinition,
	PieceMetaData,
	TV2ShowStyleConfig
} from 'tv2-common'
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
			}
		},
		adlib,
		rank
	)
}
