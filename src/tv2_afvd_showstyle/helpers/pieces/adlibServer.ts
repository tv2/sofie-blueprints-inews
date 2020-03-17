import { IBlueprintAdLibPiece, PieceLifespan, PieceMetaData } from 'tv-automation-sofie-blueprints-integration'
import { literal, PartDefinition } from 'tv2-common'
import { AdlibTags } from 'tv2-constants'
import { SourceLayer } from '../../../tv2_afvd_showstyle/layers'
import { MEDIA_PLAYER_AUTO } from '../../../types/constants' // TODO: Refactor
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
		tags: [AdlibTags.OFFTUBE_ADLIB_SERVER],
		name: `${partDefinition.storyName} Server: ${file}`,
		sourceLayerId: vo ? SourceLayer.PgmVoiceOver : SourceLayer.PgmServer,
		outputLayerId: 'pgm',
		infiniteMode: PieceLifespan.Infinite,
		toBeQueued: !config.showStyle.IsOfftube,
		metaData: literal<PieceMetaData>({
			mediaPlayerSessions: config.showStyle.IsOfftube ? [MEDIA_PLAYER_AUTO] : [mediaPlayerSession]
		}),
		content: MakeContentServer(
			file,
			config.showStyle.IsOfftube ? MEDIA_PLAYER_AUTO : mediaPlayerSession,
			partDefinition,
			config,
			true,
			true
		),
		adlibPreroll: config.studio.CasparPrerollDuration
	})
}
