import {
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPart,
	IBlueprintPiece,
	ISegmentUserContext
} from '@tv2media/blueprints-integration'
import { CueDefinitionEkstern, EvaluateEksternBase, PartDefinition } from 'tv2-common'
import { BlueprintConfig } from '../../../tv2_afvd_studio/helpers/config'
import { AtemLLayer, SisyfosLLAyer } from '../../../tv2_afvd_studio/layers'
import { SourceLayer } from '../../layers'

export function EvaluateEkstern(
	context: ISegmentUserContext,
	config: BlueprintConfig,
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
			},
			Sisyfos: {
				StudioMics: SisyfosLLAyer.SisyfosGroupStudioMics
			}
		},
		adlib,
		rank
	)
}
