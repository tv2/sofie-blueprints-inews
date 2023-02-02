import { ITimelineEventContext } from 'blueprints-integration'
import { TV2ShowStyleConfig } from '../blueprintConfig'
import { UniformConfig } from '../uniformConfig'
import { ExtendedShowStyleContextImpl } from './context'

export class ExtendedTimelineContext<
	BlueprintConfig extends TV2ShowStyleConfig = TV2ShowStyleConfig
> extends ExtendedShowStyleContextImpl<BlueprintConfig, ITimelineEventContext> {
	constructor(readonly core: ITimelineEventContext, uniformConfig: UniformConfig) {
		super(core, uniformConfig)
	}
}
