import { ISegmentUserContext } from 'blueprints-integration'
import { ShowStyleContext, ShowStyleContextImpl, TV2ShowStyleConfig, UniformConfig, VideoSwitcher } from 'tv2-common'

export interface SegmentContext<BlueprintConfig extends TV2ShowStyleConfig> extends ShowStyleContext<BlueprintConfig> {
	readonly core: ISegmentUserContext
	readonly config: BlueprintConfig
	readonly videoSwitcher: VideoSwitcher
}

export class SegmentContextImpl<BlueprintConfig extends TV2ShowStyleConfig>
	extends ShowStyleContextImpl<BlueprintConfig>
	implements SegmentContext<BlueprintConfig>
{
	constructor(readonly core: ISegmentUserContext, readonly uniformConfig: UniformConfig) {
		super(core, uniformConfig)
	}
}
