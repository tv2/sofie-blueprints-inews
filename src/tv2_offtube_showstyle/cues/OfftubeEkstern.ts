import { IBlueprintAdLibPiece, IBlueprintPiece, PartContext } from 'tv-automation-sofie-blueprints-integration'
import { CueDefinitionEkstern, EvaluateEksternBase, PartDefinition } from 'tv2-common'
import { OfftubeAtemLLayer } from '../../tv2_offtube_studio/layers'
import { OffTubeShowstyleBlueprintConfig } from '../helpers/config'
import { OffTubeSourceLayer } from '../layers'

export function OfftubeEvaluateEkstern(
	context: PartContext,
	config: OffTubeShowstyleBlueprintConfig,
	pieces: IBlueprintPiece[],
	_adlibPieces: IBlueprintAdLibPiece[],
	partId: string,
	parsedCue: CueDefinitionEkstern,
	partDefinition: PartDefinition,
	adlib?: boolean,
	rank?: number
) {
	EvaluateEksternBase(
		context,
		config,
		pieces,
		[],
		partId,
		parsedCue,
		partDefinition,
		{
			SourceLayer: {
				PgmLive: OffTubeSourceLayer.PgmLive
			},
			ATEM: {
				MEProgram: OfftubeAtemLLayer.AtemMEClean
			}
		},
		adlib,
		rank
	)
}
