import { ITimelineEventContext } from 'blueprints-integration'
import { TV2ShowStyleConfig } from '../blueprintConfig'
import { UniformConfig } from '../uniformConfig'
import { ShowStyleContextImpl } from './ShowStyleContext'

export class TimelineContext<
	BlueprintConfig extends TV2ShowStyleConfig = TV2ShowStyleConfig
> extends ShowStyleContextImpl<BlueprintConfig, ITimelineEventContext> {
	constructor(readonly core: ITimelineEventContext, uniformConfig: UniformConfig) {
		super(core, uniformConfig)
	}
}
