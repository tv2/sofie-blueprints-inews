import { IBlueprintAdLibPiece, IBlueprintPiece, PartContext } from 'tv-automation-sofie-blueprints-integration'
import { CueDefinitionGrafik, PartDefinition } from 'tv2-common'
import { Enablers } from 'tv2-constants'
import { BlueprintConfig } from '../../../tv2_afvd_showstyle/helpers/config'
import { SourceLayer } from '../../../tv2_afvd_showstyle/layers'
import { MEDIA_PLAYER_AUTO } from '../../../types/constants'
import { CreateAdlibServer } from './adlibServer'

export function EvaluateGrafikCaspar(
	config: BlueprintConfig,
	_context: PartContext,
	_pieces: IBlueprintPiece[],
	adlibPieces: IBlueprintAdLibPiece[],
	parsedCue: CueDefinitionGrafik,
	partDefinition: PartDefinition,
	adlib: boolean
) {
	if (adlib) {
		const piece = CreateAdlibServer(
			config,
			0,
			partDefinition.externalId,
			MEDIA_PLAYER_AUTO,
			partDefinition,
			parsedCue.template,
			false,
			false,
			Enablers.OFFTUBE_ENABLE_FULL
		)
		piece.sourceLayerId = SourceLayer.PgmPilotOverlay
		adlibPieces.push(piece)
	}
}
