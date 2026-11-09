import { IBlueprintActionManifest } from 'blueprints-integration'
import {
	ActionSelectServerClip,
	getSourceDuration,
	GetTagForServer,
	GetTagForServerNext,
	GetVTContentProperties,
	literal,
	PartDefinition,
	ServerPartLayers,
	ShowStyleContext,
	TV2BlueprintConfigBase,
	TV2StudioConfigBase
} from 'tv2-common'
import { AdlibActionType, AdlibTags, SharedOutputLayer } from 'tv2-constants'
import { getServerAdLibTriggerModes, t } from '../helpers'

export async function CreateAdlibServer<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	context: ShowStyleContext<ShowStyleConfig>,
	rank: number,
	partDefinition: PartDefinition,
	file: string,
	voLayer: boolean,
	voLevels: boolean,
	sourceLayers: ServerPartLayers,
	tagAsAdlib: boolean
): Promise<IBlueprintActionManifest> {
	const mediaObjectDurationSec = await context.core.hackGetMediaObjectDuration(file)
	const mediaObjectDuration = mediaObjectDurationSec && mediaObjectDurationSec * 1000
	const sourceDuration = getSourceDuration(mediaObjectDuration, context.config.studio.ServerPostrollDuration)

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
			outputLayerId: SharedOutputLayer.PGM,
			content: GetVTContentProperties(context.config, {
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
		},
		triggerModes: getServerAdLibTriggerModes()
	}
}
