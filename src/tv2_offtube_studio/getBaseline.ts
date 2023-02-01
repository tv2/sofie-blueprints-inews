import {
	BlueprintMapping,
	BlueprintMappings,
	BlueprintResultBaseline,
	IStudioContext,
	TSR
} from 'blueprints-integration'
import { ExtendedStudioContext, literal, SpecialInput, TransitionStyle } from 'tv2-common'
import * as _ from 'underscore'
import { AtemSourceIndex } from '../types/atem'
import { OfftubeStudioBlueprintConfig } from './helpers/config'
import { OfftubeAtemLLayer, OfftubeSisyfosLLayer } from './layers'
import { sisyfosChannels } from './sisyfosChannels'

function filterMappings(
	input: BlueprintMappings,
	filter: (k: string, v: BlueprintMapping) => boolean
): BlueprintMappings {
	const result: BlueprintMappings = {}

	_.each(_.keys(input), k => {
		const v = input[k]
		if (filter(k, v)) {
			result[k] = v
		}
	})

	return result
}

export function getBaseline(coreContext: IStudioContext): BlueprintResultBaseline {
	const context = new ExtendedStudioContext<OfftubeStudioBlueprintConfig>(coreContext)
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
		timelineObjects: [
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
				layer: OfftubeAtemLLayer.AtemMEClean,
				content: {
					input: context.config.studio.IdleSource,
					transition: TransitionStyle.CUT
				}
			}),

			// Route ME 2 PGM to ME 1 PGM
			context.videoSwitcher.getMixEffectTimelineObject({
				enable: { while: '1' },
				layer: OfftubeAtemLLayer.AtemMEProgram,
				content: {
					input: SpecialInput.ME2_PROGRAM
				}
			}),
			literal<TSR.TimelineObjAtemAUX>({
				id: '',
				enable: { while: '1' },
				priority: 0,
				layer: OfftubeAtemLLayer.AtemAuxClean,
				content: {
					deviceType: TSR.DeviceType.ATEM,
					type: TSR.TimelineContentTypeAtem.AUX,
					aux: {
						input: AtemSourceIndex.Prg2
					}
				}
			})
		]
	}
}
