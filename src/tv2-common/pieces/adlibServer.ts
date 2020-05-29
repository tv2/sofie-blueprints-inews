import { IBlueprintAdLibPiece, PieceLifespan, PieceMetaData } from 'tv-automation-sofie-blueprints-integration'
import { literal, PartDefinition, TV2BlueprintConfigBase, TV2StudioConfigBase } from 'tv2-common'
import { AdlibTags, Enablers, MEDIA_PLAYER_AUTO } from 'tv2-constants'
import { MakeContentServer, MakeContentServerSourceLayers } from '../content/server'

export interface AdlibServerOfftubeOptions {
	/** By passing in this object, you're creating a server according to the OFFTUBE showstyle. */
	isOfftube: true
	tagAsAdlib: boolean
	enabler: Enablers
	serverEnable: string
}

export interface CreateAdlibServerSourceLayers extends MakeContentServerSourceLayers {
	PgmServer: string
	PgmVoiceOver: string
}

export function CreateAdlibServer<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	config: ShowStyleConfig,
	rank: number,
	externalId: string,
	mediaPlayerSession: string,
	partDefinition: PartDefinition,
	file: string,
	vo: boolean,
	sourceLayers: CreateAdlibServerSourceLayers,
	offtubeOptions?: AdlibServerOfftubeOptions
): IBlueprintAdLibPiece {
	return literal<IBlueprintAdLibPiece>({
		_rank: rank,
		externalId,
		...(offtubeOptions?.isOfftube ? { tags: offtubeOptions.tagAsAdlib ? [AdlibTags.OFFTUBE_ADLIB_SERVER] : [] } : {}),
		name: `${partDefinition.storyName} Server: ${file}`,
		sourceLayerId: vo ? sourceLayers.PgmVoiceOver : sourceLayers.PgmServer,
		outputLayerId: 'pgm',
		infiniteMode: offtubeOptions?.isOfftube ? PieceLifespan.OutOnNextSegment : PieceLifespan.OutOnNextPart,
		toBeQueued: !offtubeOptions?.isOfftube,
		metaData: literal<PieceMetaData>({
			mediaPlayerSessions: offtubeOptions?.isOfftube ? [MEDIA_PLAYER_AUTO] : [mediaPlayerSession]
		}),
		content: MakeContentServer(
			file,
			offtubeOptions?.isOfftube ? MEDIA_PLAYER_AUTO : mediaPlayerSession,
			partDefinition,
			config,
			sourceLayers,
			true,
			offtubeOptions
		),
		adlibPreroll: config.studio.CasparPrerollDuration
	})
}
