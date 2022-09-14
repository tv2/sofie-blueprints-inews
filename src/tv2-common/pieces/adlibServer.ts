import { IBlueprintActionManifest, IShowStyleUserContext } from '@tv2media/blueprints-integration'
import {
	ActionSelectServerClip,
	getSourceDuration,
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

export async function CreateAdlibServer<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	context: IShowStyleUserContext,
	config: ShowStyleConfig,
	rank: number,
	partDefinition: PartDefinition,
	file: string,
	voLayer: boolean,
	voLevels: boolean,
	sourceLayers: ServerPartLayers,
	tagAsAdlib: boolean
): Promise<IBlueprintActionManifest> {
	const mediaObjectDurationSec = await context.hackGetMediaObjectDuration(file)
	const mediaObjectDuration = mediaObjectDurationSec && mediaObjectDurationSec * 1000
	const sourceDuration = getSourceDuration(mediaObjectDuration, config.studio.ServerPostrollDuration)

	return {
		externalId: partDefinition.externalId + '-adLib-server',
		actionId: AdlibActionType.SELECT_SERVER_CLIP,
		userData: literal<ActionSelectServerClip>({
			type: AdlibActionType.SELECT_SERVER_CLIP,
			file,
			partDefinition,
			duration: sourceDuration ?? 0,
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
			content: GetVTContentProperties(config, {
				file,
				clipDuration: mediaObjectDuration,
				sourceDuration
			}),
			tags: [
				tagAsAdlib || voLayer ? AdlibTags.OFFTUBE_ADLIB_SERVER : AdlibTags.OFFTUBE_100pc_SERVER,
				AdlibTags.ADLIB_KOMMENTATOR,
				AdlibTags.ADLIB_FLOW_PRODUCER
			],
			currentPieceTags: [GetTagForServer(partDefinition.segmentExternalId, file, !!voLayer)],
			nextPieceTags: [GetTagForServerNext(partDefinition.segmentExternalId, file, !!voLayer)],
			uniquenessId: `${voLayer ? 'vo' : 'server'}_${partDefinition.storyName}_${file}`
		}
		// triggerModes: getServerAdLibTriggerModes() /** @todo: uncomment for Server Resume */
	}
}
