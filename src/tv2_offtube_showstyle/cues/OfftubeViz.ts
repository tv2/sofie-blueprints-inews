import { IBlueprintAdLibPiece, IBlueprintPiece } from 'tv-automation-sofie-blueprints-integration'
import { CueDefinitionVIZ, EvaluateVIZBase, PartContext2 } from 'tv2-common'
import * as _ from 'underscore'
import { OfftubeCasparLLayer } from '../../tv2_offtube_studio/layers'
import { OffTubeShowstyleBlueprintConfig } from '../helpers/config'
import { OffTubeSourceLayer } from '../layers'

export function OfftubeEvaluateVIZ(
	context: PartContext2,
	config: OffTubeShowstyleBlueprintConfig,
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
		false,
		{
			SourceLayerDVEBackground: OffTubeSourceLayer.PgmDVEBackground,
			CasparLLayerDVELoop: OfftubeCasparLLayer.CasparCGDVELoop
		},
		adlib,
		rank
	)
}
