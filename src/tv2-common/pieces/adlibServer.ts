import { IBlueprintAdLibPiece, PieceLifespan, PieceMetaData } from 'tv-automation-sofie-blueprints-integration'
import { GetTagForServer, literal, PartDefinition, TV2BlueprintConfigBase, TV2StudioConfigBase } from 'tv2-common'
import { AdlibTags, TallyTags } from 'tv2-constants'
import { MakeContentServer, MakeContentServerSourceLayers } from '../content/server'
import { GetTagForServerNext } from './tags'

export interface AdlibServerOfftubeOptions {
	/** By passing in this object, you're creating a server according to the OFFTUBE showstyle. */
	isOfftube: true
	tagAsAdlib: boolean
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
	duration: number,
	offtubeOptions?: AdlibServerOfftubeOptions
): IBlueprintAdLibPiece {
	return literal<IBlueprintAdLibPiece>({
		_rank: rank,
		externalId,
		...(offtubeOptions?.isOfftube ? { tags: offtubeOptions.tagAsAdlib ? [AdlibTags.OFFTUBE_ADLIB_SERVER] : [] } : {}),
		name: offtubeOptions?.isOfftube ? partDefinition.storyName : `${partDefinition.storyName} Server: ${file}`,
		sourceLayerId: vo ? sourceLayers.PgmVoiceOver : sourceLayers.PgmServer,
		outputLayerId: offtubeOptions?.isOfftube ? 'selectedAdlib' : 'pgm',
		lifespan: offtubeOptions?.isOfftube ? PieceLifespan.OutOnSegmentEnd : PieceLifespan.WithinPart,
		toBeQueued: !offtubeOptions?.isOfftube,
		metaData: literal<PieceMetaData>({
			mediaPlayerSessions: [mediaPlayerSession]
		}),
		content: MakeContentServer(
			file,
			mediaPlayerSession,
			partDefinition,
			config,
			sourceLayers,
			duration,
			true,
			offtubeOptions
		),
		adlibPreroll: config.studio.CasparPrerollDuration,
		tags: [GetTagForServer(partDefinition.segmentExternalId, file, vo), TallyTags.SERVER_IS_LIVE],
		onAirTags: [GetTagForServer(partDefinition.segmentExternalId, file, vo)],
		setNextTags: [GetTagForServerNext(partDefinition.segmentExternalId, file, vo)]
	})
}
