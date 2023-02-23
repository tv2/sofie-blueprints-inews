import { ISegmentUserContext } from 'blueprints-integration'
import {
	ExtendedShowStyleContext,
	ExtendedShowStyleContextImpl,
	TV2ShowStyleConfig,
	UniformConfig,
	VideoSwitcher
} from 'tv2-common'

export interface ExtendedSegmentContext<BlueprintConfig extends TV2ShowStyleConfig>
	extends ExtendedShowStyleContext<BlueprintConfig> {
	readonly core: ISegmentUserContext
	readonly config: BlueprintConfig
	readonly videoSwitcher: VideoSwitcher
}

export class ExtendedSegmentContextImpl<BlueprintConfig extends TV2ShowStyleConfig>
	extends ExtendedShowStyleContextImpl<BlueprintConfig>
	implements ExtendedSegmentContext<BlueprintConfig>
{
	constructor(readonly core: ISegmentUserContext, readonly uniformConfig: UniformConfig) {
		super(core, uniformConfig)
	}
}
