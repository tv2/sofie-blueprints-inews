import { IBlueprintPiece, PieceLifespan } from 'tv-automation-sofie-blueprints-integration'
import { literal } from '../../../common/util'
import { CueDefinitionClearGrafiks } from '../../../tv2_afvd_showstyle/inewsConversion/converters/ParseCue'
import { SourceLayer } from '../../../tv2_afvd_showstyle/layers'
import { CreateTimingEnable } from './evaluateCues'

export function EvaluateClearGrafiks(pieces: IBlueprintPiece[], partId: string, parsedCue: CueDefinitionClearGrafiks) {
	;[
		SourceLayer.PgmGraphicsIdent,
		SourceLayer.PgmGraphicsTop,
		SourceLayer.PgmGraphicsLower,
		SourceLayer.PgmGraphicsHeadline,
		SourceLayer.PgmGraphicsTema,
		SourceLayer.PgmGraphicsTLF
	].forEach(layer => {
		pieces.push(
			literal<IBlueprintPiece>({
				_id: '',
				externalId: partId,
				name: 'CLEAR',
				...CreateTimingEnable(parsedCue),
				outputLayerId: 'overlay',
				sourceLayerId: layer,
				infiniteMode: PieceLifespan.Normal,
				virtual: true
			})
		)
	})
}
