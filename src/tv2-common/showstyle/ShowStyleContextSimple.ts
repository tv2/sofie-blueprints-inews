import { IShowStyleContext, IShowStyleUserContext } from 'blueprints-integration'
import { TV2ShowStyleConfig } from 'tv2-common'

export interface ShowStyleContextSimple<
	BlueprintConfig extends TV2ShowStyleConfig = TV2ShowStyleConfig,
	CoreContext extends IShowStyleUserContext | IShowStyleContext = IShowStyleUserContext
> {
	readonly core: CoreContext
	readonly config: BlueprintConfig
}

export class ShowStyleContextSimpleImpl<
	BlueprintConfig extends TV2ShowStyleConfig = TV2ShowStyleConfig,
	CoreContext extends IShowStyleUserContext | IShowStyleContext = IShowStyleUserContext
> {
	public readonly config: BlueprintConfig

	constructor(readonly core: CoreContext) {
		this.config = this.makeConfig()
	}

	private makeConfig(): BlueprintConfig {
		return { ...(this.core.getStudioConfig() as any), ...(this.core.getShowStyleConfig() as any) }
	}
}
