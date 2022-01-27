import { IBlueprintActionManifest } from '@tv2media/blueprints-integration'
import {
	ActionSelectServerClip,
	GetTagForServer,
	GetTagForServerNext,
	GetVTContentProperties,
	literal,
	PartDefinition,
	ServerPartLayers,
	TV2BlueprintConfigBase,
	TV2StudioConfigBase
} from 'tv2-common'
import { AdlibActionType, AdlibTags, SharedOutputLayers } from 'tv2-constants'
import { t } from '../helpers'

export interface AdlibServerOfftubeOptions {
	/** By passing in this object, you're creating a server according to the OFFTUBE showstyle. */
	isOfftube: boolean
}

export function CreateAdlibServer<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	config: ShowStyleConfig,
	rank: number,
	partDefinition: PartDefinition,
	file: string,
	voLayer: boolean,
	voLevels: boolean,
	sourceLayers: ServerPartLayers,
	duration: number,
	tagAsAdlib: boolean
): IBlueprintActionManifest {
	return literal<IBlueprintActionManifest>({
		actionId: AdlibActionType.SELECT_SERVER_CLIP,
		userData: literal<ActionSelectServerClip>({
			type: AdlibActionType.SELECT_SERVER_CLIP,
			file,
			partDefinition,
			duration,
			voLayer,
			voLevels,
			adLibPix: tagAsAdlib
		}),
		userDataManifest: {},
		display: {
			_rank: rank,
			label: t(`${partDefinition.storyName}`),
			sourceLayerId: sourceLayers.SourceLayer.PgmServer,
			outputLayerId: SharedOutputLayers.PGM,
			content: GetVTContentProperties(config, file, duration),
			tags: [
				tagAsAdlib || voLayer ? AdlibTags.OFFTUBE_ADLIB_SERVER : AdlibTags.OFFTUBE_100pc_SERVER,
				AdlibTags.ADLIB_KOMMENTATOR,
				AdlibTags.ADLIB_FLOW_PRODUCER
			],
			currentPieceTags: [GetTagForServer(partDefinition.segmentExternalId, file, !!voLayer)],
			nextPieceTags: [GetTagForServerNext(partDefinition.segmentExternalId, file, !!voLayer)],
			uniquenessId: `${voLayer ? 'vo' : 'server'}_${partDefinition.storyName}_${file}`
		}
	})
}
