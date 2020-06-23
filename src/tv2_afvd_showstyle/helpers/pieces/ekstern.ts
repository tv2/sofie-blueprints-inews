import { IBlueprintAdLibPiece, IBlueprintPiece } from 'tv-automation-sofie-blueprints-integration'
import { CueDefinitionEkstern, EvaluateEksternBase, GetDefaultOut, PartContext2, PartDefinition } from 'tv2-common'
import { BlueprintConfig } from '../../../tv2_afvd_studio/helpers/config'
import { AtemLLayer } from '../../../tv2_afvd_studio/layers'
import { SourceLayer } from '../../layers'

export function EvaluateEkstern(
	context: PartContext2,
	config: BlueprintConfig,
	pieces: IBlueprintPiece[],
	adlibPieces: IBlueprintAdLibPiece[],
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
		GetDefaultOut,
		adlib,
		rank
	)
}
