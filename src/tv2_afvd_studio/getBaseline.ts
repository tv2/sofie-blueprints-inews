import {
	BlueprintMapping,
	BlueprintMappings,
	BlueprintResultBaseline,
	IStudioContext,
	TSR
} from 'blueprints-integration'
import { ExtendedStudioContext, literal, TransitionStyle } from 'tv2-common'
import * as _ from 'underscore'
import { SharedGraphicLLayer } from '../tv2-constants'
import { AtemSourceIndex } from '../types/atem'
import { GalleryStudioConfig } from './helpers/config'
import { AtemLLayer, SisyfosLLAyer } from './layers'
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
function convertMappings<T>(input: BlueprintMappings, func: (k: string, v: BlueprintMapping) => T): T[] {
	return _.map(_.keys(input), k => func(k, input[k]))
}

export function getBaseline(coreContext: IStudioContext): BlueprintResultBaseline {
	const context = new ExtendedStudioContext<GalleryStudioConfig>(coreContext)
	const mappings = coreContext.getStudioMappings()

	const atemMeMappings = filterMappings(
		mappings,
		(_id, v) => v.device === TSR.DeviceType.ATEM && (v as any).mappingType === TSR.MappingAtemType.MixEffect
	)

	const sisyfosMappings = filterMappings(
		mappings,
		(_id, v) => v.device === TSR.DeviceType.SISYFOS && (v as any).mappingType !== TSR.MappingSisyfosType.CHANNELS
	)
	const mappedChannels: TSR.TimelineObjSisyfosChannels['content']['channels'] = []
	for (const id in sisyfosMappings) {
		if (sisyfosMappings[id]) {
			const sisyfosChannel = sisyfosChannels[id as SisyfosLLAyer]
			if (sisyfosChannel) {
				mappedChannels.push({
					mappedLayer: id,
					isPgm: sisyfosChannel.isPgm,
					visible: !sisyfosChannel.hideInStudioA
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
			...convertMappings(atemMeMappings, id =>
				context.videoSwitcher.getMixEffectTimelineObject({
					layer: id,
					enable: { while: '1' },
					content: {
						input: AtemSourceIndex.Bars,
						transition: TransitionStyle.CUT
					}
				})
			),
			literal<TSR.TimelineObjSisyfosChannels>({
				id: '',
				enable: {
					while: '1'
				},
				priority: 0,
				layer: SisyfosLLAyer.SisyfosConfig,
				content: {
					deviceType: TSR.DeviceType.SISYFOS,
					type: TSR.TimelineContentTypeSisyfos.CHANNELS,
					channels: mappedChannels,
					overridePriority: 0
				}
			}),

			// have ATEM output default still image
			literal<TSR.TimelineObjAtemAUX>({
				id: '',
				enable: { while: '1' },
				priority: 0,
				layer: AtemLLayer.AtemAuxPGM,
				content: {
					deviceType: TSR.DeviceType.ATEM,
					type: TSR.TimelineContentTypeAtem.AUX,
					aux: {
						input: AtemSourceIndex.Prg1
					}
				}
			}),
			literal<TSR.TimelineObjAtemAUX>({
				id: '',
				enable: { while: '1' },
				priority: 0,
				layer: AtemLLayer.AtemAuxLookahead,
				content: {
					deviceType: TSR.DeviceType.ATEM,
					type: TSR.TimelineContentTypeAtem.AUX,
					aux: {
						input: AtemSourceIndex.Prg1
					}
				}
			}),
			context.videoSwitcher.getMixEffectTimelineObject({
				enable: { while: '1' },
				layer: AtemLLayer.AtemMEProgram,
				content: {
					input: AtemSourceIndex.MP1,
					transition: TransitionStyle.CUT
				}
			}),
			literal<TSR.TimelineObjAtemMediaPlayer>({
				id: '',
				enable: { while: '1' },
				priority: 0,
				layer: AtemLLayer.AtemMP1,
				content: {
					deviceType: TSR.DeviceType.ATEM,
					type: TSR.TimelineContentTypeAtem.MEDIAPLAYER,
					mediaPlayer: {
						sourceType: TSR.MediaSourceType.Clip,
						clipIndex: context.config.studio.AtemSettings.MP1Baseline.Clip - 1, // counting from 1 in the config
						stillIndex: 0,
						playing: context.config.studio.AtemSettings.MP1Baseline.Playing,
						loop: context.config.studio.AtemSettings.MP1Baseline.Loop,
						atBeginning: false,
						clipFrame: 0
					}
				}
			}),
			literal<TSR.TimelineObjVIZMSEConcept>({
				id: '',
				enable: { while: '1' },
				layer: SharedGraphicLLayer.GraphicLLayerConcept,
				content: {
					deviceType: TSR.DeviceType.VIZMSE,
					type: TSR.TimelineContentTypeVizMSE.CONCEPT,
					concept: ''
				}
			})
		]
	}
}
