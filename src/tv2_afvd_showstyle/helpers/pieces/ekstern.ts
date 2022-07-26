import {
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPart,
	IBlueprintPiece,
	ISegmentUserContext
} from '@tv2media/blueprints-integration'
import { CueDefinitionEkstern, EvaluateEksternBase, PartDefinition, TV2BlueprintConfig } from 'tv2-common'
import { AtemLLayer } from '../../../tv2_afvd_studio/layers'
import { SourceLayer } from '../../layers'

export function EvaluateEkstern(
	context: ISegmentUserContext,
	config: TV2BlueprintConfig,
	part: IBlueprintPart,
	pieces: IBlueprintPiece[],
	adlibPieces: IBlueprintAdLibPiece[],
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
