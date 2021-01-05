import { IBlueprintActionManifest } from 'tv-automation-sofie-blueprints-integration'
import { PartDefinition, TV2BlueprintConfigBase, TV2StudioConfigBase } from 'tv2-common'
import { MakeActionServer, MakeContentServerSourceLayers } from '../content/server'

export interface AdlibServerOfftubeOptions {
	/** By passing in this object, you're creating a server according to the OFFTUBE showstyle. */
	isOfftube: true
	tagAsAdlib: boolean
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
	mediaPlayerSession: string,
	partDefinition: PartDefinition,
	file: string,
	vo: boolean,
	sourceLayers: CreateAdlibServerSourceLayers,
	duration: number,
	offtubeOptions?: AdlibServerOfftubeOptions
): IBlueprintActionManifest {
	return MakeActionServer(
		rank,
		file,
		mediaPlayerSession,
		partDefinition,
		config,
		sourceLayers,
		vo,
		duration,
		true,
		offtubeOptions
	)
}
