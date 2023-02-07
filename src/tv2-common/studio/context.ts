import { IStudioContext } from 'blueprints-integration'
import { UniformConfig, VideoSwitcher, VideoSwitcherImpl } from 'tv2-common'
import { TV2StudioConfig } from '../blueprintConfig'

export class ExtendedStudioContext<BlueprintConfig extends TV2StudioConfig = TV2StudioConfig> {
	public readonly config: BlueprintConfig
	public readonly videoSwitcher: VideoSwitcher

	constructor(readonly core: IStudioContext, public readonly uniformConfig: UniformConfig) {
		this.config = this.makeConfig()
		this.videoSwitcher = VideoSwitcherImpl.getVideoSwitcher(core, this.config, uniformConfig)
	}

	private makeConfig(): BlueprintConfig {
		return { ...(this.core.getStudioConfig() as any) }
	}
}
