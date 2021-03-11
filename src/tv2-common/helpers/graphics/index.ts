import { IBlueprintPart } from '@sofie-automation/blueprints-integration'
import { TV2BlueprintConfig } from 'tv2-common'

export * from './name'
export * from './timing'
export * from './target'
export * from './layers'
export * from './internal'
export * from './pilot'
export * from './caspar'
export * from './viz'

export function ApplyFullGraphicPropertiesToPart(config: TV2BlueprintConfig, part: IBlueprintPart) {
	part.prerollDuration =
		config.studio.GraphicsType === 'HTML'
			? config.studio.CasparPrerollDuration
			: config.studio.VizPilotGraphics.PrerollDuration
	part.transitionKeepaliveDuration =
		config.studio.GraphicsType === 'HTML'
			? config.studio.HTMLGraphics.KeepAliveDuration
			: config.studio.VizPilotGraphics.KeepAliveDuration
}
