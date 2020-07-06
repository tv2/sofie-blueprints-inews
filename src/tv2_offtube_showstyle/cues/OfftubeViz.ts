import {
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPiece
} from 'tv-automation-sofie-blueprints-integration'
import { CueDefinitionVIZ, EvaluateVIZBase, PartContext2 } from 'tv2-common'
import * as _ from 'underscore'
import { OfftubeCasparLLayer } from '../../tv2_offtube_studio/layers'
import { OfftubeShowstyleBlueprintConfig } from '../helpers/config'
import { OfftubeSourceLayer } from '../layers'

export function OfftubeEvaluateVIZ(
	context: PartContext2,
	config: OfftubeShowstyleBlueprintConfig,
	pieces: IBlueprintPiece[],
	adlibPieces: IBlueprintAdLibPiece[],
	_actions: IBlueprintActionManifest[],
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
			SourceLayerDVEBackground: OfftubeSourceLayer.PgmDVEBackground,
			CasparLLayerDVELoop: OfftubeCasparLLayer.CasparCGDVELoop
		},
		adlib,
		rank
	)
}
