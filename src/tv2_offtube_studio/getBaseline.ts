import {
	BlueprintMapping,
	BlueprintMappings,
	BlueprintResultBaseline,
	IStudioContext,
	TSR
} from 'blueprints-integration'
import { literal, StudioContext, TransitionStyle } from 'tv2-common'
import * as _ from 'underscore'
import { OfftubeStudioBlueprintConfig } from './helpers/config'
import { OfftubeSisyfosLLayer } from './layers'
import { sisyfosChannels } from './sisyfosChannels'
import { QBOX_UNIFORM_CONFIG } from './uniformConfig'

function filterMappings(
	input: BlueprintMappings,
	filter: (k: string, v: BlueprintMapping) => boolean
): BlueprintMappings {
	const result: BlueprintMappings = {}

	_.each(_.keys(input), (k) => {
		const v = input[k]
		if (filter(k, v)) {
			result[k] = v
		}
	})

	return result
}

export function getBaseline(coreContext: IStudioContext): BlueprintResultBaseline {
	const context = new StudioContext<OfftubeStudioBlueprintConfig>(coreContext, QBOX_UNIFORM_CONFIG)
	const mappings = coreContext.getStudioMappings()

	const sisyfosMappings = filterMappings(mappings, (_id, v) => v.device === TSR.DeviceType.SISYFOS)

	const mappedChannels: TSR.TimelineObjSisyfosChannels['content']['channels'] = []
	for (const id in sisyfosMappings) {
		if (sisyfosMappings[id]) {
			const sisyfosChannel = sisyfosChannels[id as OfftubeSisyfosLLayer]
			if (sisyfosChannel) {
				mappedChannels.push({
					mappedLayer: id,
					isPgm: context.config.studio.IdleSisyfosLayers.includes(id) ? 1 : sisyfosChannel.isPgm,
					visible: true
				})
			} else {
				mappedChannels.push({
					mappedLayer: id,
					isPgm: 0,
					label: '',
					visible: false
				})
			}
		}
	}

	return {
		timelineObjects: _.compact([
			literal<TSR.TimelineObjSisyfosChannels>({
				id: '',
				enable: {
					while: '1'
				},
				priority: 1,
				layer: OfftubeSisyfosLLayer.SisyfosConfig,
				content: {
					deviceType: TSR.DeviceType.SISYFOS,
					type: TSR.TimelineContentTypeSisyfos.CHANNELS,
					channels: mappedChannels,
					overridePriority: 0
				}
			}),

			// have ATEM output default still image
			context.videoSwitcher.getMixEffectTimelineObject({
				enable: { while: '1' },
				layer: context.uniformConfig.mixEffects.clean.mixEffectLayer,
				content: {
					input: context.config.studio.IdleSource,
					transition: TransitionStyle.CUT
				}
			}),

			// Route ME 2 PGM to ME 1 PGM
			context.videoSwitcher.getMixEffectTimelineObject({
				enable: { while: '1' },
				layer: context.uniformConfig.mixEffects.program.mixEffectLayer,
				content: {
					input: context.uniformConfig.mixEffects.clean.input
				}
			}),
			context.uniformConfig.mixEffects.clean.auxLayer
				? context.videoSwitcher.getAuxTimelineObject({
						enable: { while: '1' },
						layer: context.uniformConfig.mixEffects.clean.auxLayer,
						content: {
							input: context.uniformConfig.mixEffects.clean.input
						}
				  })
				: undefined
		])
	}
}
