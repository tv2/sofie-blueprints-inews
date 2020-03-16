import { IBlueprintAdLibPiece, PieceLifespan, PieceMetaData } from 'tv-automation-sofie-blueprints-integration'
import { literal, PartDefinition } from 'tv2-common'
import { SourceLayer } from '../../../tv2_afvd_showstyle/layers'
import { BlueprintConfig } from '../../helpers/config'
import { MakeContentServer } from '../content/server'

export function CreateAdlibServer(
	config: BlueprintConfig,
	rank: number,
	externalId: string,
	mediaPlayerSession: string,
	partDefinition: PartDefinition,
	file: string,
	vo: boolean
): IBlueprintAdLibPiece {
	return literal<IBlueprintAdLibPiece>({
		_rank: rank,
		externalId,
		name: `${partDefinition.storyName} Server: ${file}`,
		sourceLayerId: vo ? SourceLayer.PgmVoiceOver : SourceLayer.PgmServer, // TODO: OFFTUBE: Different for offtubes
		outputLayerId: 'pgm',
		infiniteMode: PieceLifespan.OutOnNextPart,
		toBeQueued: true,
		metaData: literal<PieceMetaData>({
			mediaPlayerSessions: [mediaPlayerSession]
		}),
		content: MakeContentServer(file, mediaPlayerSession, partDefinition, config, true, true),
		adlibPreroll: config.studio.CasparPrerollDuration
	})
}
