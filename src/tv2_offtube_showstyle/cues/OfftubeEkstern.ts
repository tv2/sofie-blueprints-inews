import {
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPart,
	IBlueprintPiece,
	ISegmentUserContext
} from 'blueprints-integration'
import { CueDefinitionEkstern, EvaluateEksternBase, PartDefinition, PieceMetaData } from 'tv2-common'
import { OfftubeAtemLLayer } from '../../tv2_offtube_studio/layers'
import { OfftubeShowstyleBlueprintConfig } from '../helpers/config'
import { OfftubeSourceLayer } from '../layers'

export function OfftubeEvaluateEkstern(
	context: ISegmentUserContext,
	config: OfftubeShowstyleBlueprintConfig,
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
		config,
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
