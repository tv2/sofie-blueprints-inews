import { IShowStyleContext, IShowStyleUserContext } from 'blueprints-integration'
import { TV2ShowStyleConfig, UniformConfig, VideoSwitcher, VideoSwitcherBase } from 'tv2-common'
import { ShowStyleContextSimpleImpl } from './ShowStyleContextSimple'

export interface ShowStyleContext<BlueprintConfig extends TV2ShowStyleConfig = TV2ShowStyleConfig> {
	readonly core: IShowStyleUserContext
	readonly config: BlueprintConfig
	readonly uniformConfig: UniformConfig
	readonly videoSwitcher: VideoSwitcher
}

export class ShowStyleContextImpl<
	BlueprintConfig extends TV2ShowStyleConfig = TV2ShowStyleConfig,
	CoreContext extends IShowStyleUserContext | IShowStyleContext = IShowStyleUserContext
> extends ShowStyleContextSimpleImpl<BlueprintConfig, CoreContext> {
	public readonly videoSwitcher: VideoSwitcher

	constructor(readonly core: CoreContext, public readonly uniformConfig: UniformConfig) {
		super(core)
		this.videoSwitcher = VideoSwitcherBase.getVideoSwitcher(core, this.config, uniformConfig)
	}
}
