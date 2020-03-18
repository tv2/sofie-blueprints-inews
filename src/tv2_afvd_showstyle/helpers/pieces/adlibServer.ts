import { IBlueprintAdLibPiece, PieceLifespan, PieceMetaData } from 'tv-automation-sofie-blueprints-integration'
import { literal, PartDefinition } from 'tv2-common'
import { AdlibTags, Enablers } from 'tv2-constants'
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
	vo: boolean,
	tagAsAdlib: boolean,
	enabler?: Enablers
): IBlueprintAdLibPiece {
	return literal<IBlueprintAdLibPiece>({
		_rank: rank,
		externalId,
		...(config.showStyle.IsOfftube ? { tags: tagAsAdlib ? [AdlibTags.OFFTUBE_ADLIB_SERVER] : [] } : {}),
		name: `${partDefinition.storyName} Server: ${file}`,
		sourceLayerId: vo ? SourceLayer.PgmVoiceOver : SourceLayer.PgmServer,
		outputLayerId: 'pgm',
		infiniteMode: config.showStyle.IsOfftube ? PieceLifespan.OutOnNextSegment : PieceLifespan.OutOnNextPart,
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
			true,
			enabler ?? Enablers.OFFTUBE_ENABLE_SERVER
		),
		adlibPreroll: config.studio.CasparPrerollDuration
	})
}
