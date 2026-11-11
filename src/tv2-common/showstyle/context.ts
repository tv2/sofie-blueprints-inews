import { IShowStyleContext, IShowStyleUserContext } from 'blueprints-integration'
import { TV2ShowStyleConfig, UniformConfig, VideoSwitcher, VideoSwitcherBase } from 'tv2-common'
import { selectSwitcherUniformConfig } from '../videoSwitchers/m2lxConfig'

export interface ShowStyleContext<BlueprintConfig extends TV2ShowStyleConfig = TV2ShowStyleConfig> {
	readonly core: IShowStyleUserContext
	readonly config: BlueprintConfig
	readonly uniformConfig: UniformConfig
	readonly videoSwitcher: VideoSwitcher
}

export class ShowStyleContextImpl<
	BlueprintConfig extends TV2ShowStyleConfig = TV2ShowStyleConfig,
	CoreContext extends IShowStyleUserContext | IShowStyleContext = IShowStyleUserContext
> {
	public readonly config: BlueprintConfig
	public readonly videoSwitcher: VideoSwitcher

	constructor(readonly core: CoreContext, public readonly uniformConfig: UniformConfig) {
		this.config = this.makeConfig()
		this.uniformConfig = selectSwitcherUniformConfig(this.config, uniformConfig)
		this.videoSwitcher = VideoSwitcherBase.getVideoSwitcher(core, this.config, this.uniformConfig)
	}

	private makeConfig(): BlueprintConfig {
		return { ...(this.core.getStudioConfig() as any), ...(this.core.getShowStyleConfig() as any) }
	}
}
