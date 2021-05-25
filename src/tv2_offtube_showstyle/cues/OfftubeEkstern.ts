import {
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPart,
	IBlueprintPiece,
	ISegmentUserContext
} from '@sofie-automation/blueprints-integration'
import { CueDefinitionEkstern, EvaluateEksternBase, PartDefinition } from 'tv2-common'
import { OfftubeAtemLLayer, OfftubeSisyfosLLayer } from '../../tv2_offtube_studio/layers'
import { OfftubeShowstyleBlueprintConfig } from '../helpers/config'
import { OfftubeSourceLayer } from '../layers'

export function OfftubeEvaluateEkstern(
	context: ISegmentUserContext,
	config: OfftubeShowstyleBlueprintConfig,
	part: IBlueprintPart,
	pieces: IBlueprintPiece[],
	_adlibPieces: IBlueprintAdLibPiece[],
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
			},
			Sisyfos: {
				StudioMics: OfftubeSisyfosLLayer.SisyfosGroupStudioMics
			}
		},
		adlib,
		rank
	)
}
