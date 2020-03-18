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
	enabler?: Enablers,
	offtube?: boolean
): IBlueprintAdLibPiece {
	return literal<IBlueprintAdLibPiece>({
		_rank: rank,
		externalId,
		...(offtube ? { tags: tagAsAdlib ? [AdlibTags.OFFTUBE_ADLIB_SERVER] : [] } : {}),
		name: `${partDefinition.storyName} Server: ${file}`,
		sourceLayerId: vo ? SourceLayer.PgmVoiceOver : SourceLayer.PgmServer,
		outputLayerId: 'pgm',
		infiniteMode: offtube ? PieceLifespan.OutOnNextSegment : PieceLifespan.OutOnNextPart,
		toBeQueued: !offtube,
		metaData: literal<PieceMetaData>({
			mediaPlayerSessions: offtube ? [MEDIA_PLAYER_AUTO] : [mediaPlayerSession]
		}),
		content: MakeContentServer(
			file,
			offtube ? MEDIA_PLAYER_AUTO : mediaPlayerSession,
			partDefinition,
			config,
			true,
			true,
			enabler ?? Enablers.OFFTUBE_ENABLE_SERVER
		),
		adlibPreroll: config.studio.CasparPrerollDuration
	})
}
