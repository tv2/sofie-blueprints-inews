import { IBlueprintActionManifest, IBlueprintAdLibPiece, IBlueprintPart, IBlueprintPiece } from 'blueprints-integration'
import {
	CueDefinitionEkstern,
	EvaluateEksternBase,
	ExtendedSegmentContext,
	PartDefinition,
	PieceMetaData
} from 'tv2-common'
import { OfftubeAtemLLayer } from '../../tv2_offtube_studio/layers'
import { OfftubeBlueprintConfig } from '../helpers/config'
import { OfftubeSourceLayer } from '../layers'

export function OfftubeEvaluateEkstern(
	context: ExtendedSegmentContext<OfftubeBlueprintConfig>,
	part: IBlueprintPart,
	pieces: Array<IBlueprintPiece<PieceMetaData>>,
	_adlibPieces: Array<IBlueprintAdLibPiece<PieceMetaData>>,
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
		[],
		partId,
		parsedCue,
		partDefinition,
		{
			SourceLayer: {
				PgmLive: OfftubeSourceLayer.PgmLive
			},
			ATEM: {
				MEProgram: OfftubeAtemLLayer.AtemMEClean
			}
		},
		adlib,
		rank
	)
}
