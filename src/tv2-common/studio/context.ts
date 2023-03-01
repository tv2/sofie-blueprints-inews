import { IStudioContext } from 'blueprints-integration'
import { UniformConfig, VideoSwitcher, VideoSwitcherBase } from 'tv2-common'
import { TV2StudioConfig } from '../blueprintConfig'

export class StudioContext<BlueprintConfig extends TV2StudioConfig = TV2StudioConfig> {
	public readonly config: BlueprintConfig
	public readonly videoSwitcher: VideoSwitcher

	constructor(readonly core: IStudioContext, public readonly uniformConfig: UniformConfig) {
		this.config = this.makeConfig()
		this.videoSwitcher = VideoSwitcherBase.getVideoSwitcher(core, this.config, uniformConfig)
	}

	private makeConfig(): BlueprintConfig {
		return { ...(this.core.getStudioConfig() as any) }
	}
}
