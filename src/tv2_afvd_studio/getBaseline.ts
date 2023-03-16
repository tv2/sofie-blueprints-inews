import {
	BlueprintMapping,
	BlueprintMappings,
	BlueprintResultBaseline,
	IStudioContext,
	TSR
} from 'blueprints-integration'
import { literal, SpecialInput, StudioContext, TransitionStyle } from 'tv2-common'
import * as _ from 'underscore'
import { SharedGraphicLLayer, SwitcherMediaPlayerLLayer } from '../tv2-constants'
import { AtemSourceIndex } from '../types/atem'
import { GalleryStudioConfig } from './helpers/config'
import { SisyfosLLAyer } from './layers'
import { sisyfosChannels } from './sisyfosChannels'
import { GALLERY_UNIFORM_CONFIG } from './uniformConfig'

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
	const context = new StudioContext<GalleryStudioConfig>(coreContext, GALLERY_UNIFORM_CONFIG)
	const mappings = coreContext.getStudioMappings()

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
		timelineObjects: _.compact([
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
			context.uniformConfig.mixEffects.program.auxLayer
				? context.videoSwitcher.getAuxTimelineObject({
						enable: { while: '1' },
						layer: context.uniformConfig.mixEffects.program.auxLayer,
						content: {
							input: SpecialInput.ME1_PROGRAM
						}
				  })
				: undefined,
			context.uniformConfig.switcherLLayers.nextAux
				? context.videoSwitcher.getAuxTimelineObject({
						enable: { while: '1' },
						layer: context.uniformConfig.switcherLLayers.nextAux,
						content: {
							input: SpecialInput.ME1_PROGRAM
						}
				  })
				: undefined,
			context.videoSwitcher.getMixEffectTimelineObject({
				enable: { while: '1' },
				layer: context.uniformConfig.mixEffects.program.mixEffectLayer,
				content: {
					input: AtemSourceIndex.MP1,
					transition: TransitionStyle.CUT
				}
			}),
			literal<TSR.TimelineObjAtemMediaPlayer>({
				id: '',
				enable: { while: '1' },
				priority: 0,
				layer: SwitcherMediaPlayerLLayer.Mp1,
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
		])
	}
}
