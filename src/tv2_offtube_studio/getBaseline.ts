import {
	BlueprintMapping,
	BlueprintMappings,
	BlueprintResultBaseline,
	IStudioContext,
	TSR
} from 'blueprints-integration'
import { literal } from 'tv2-common'
import * as _ from 'underscore'
import { AtemSourceIndex } from '../types/atem'
import { OfftubeStudioBlueprintConfig } from './helpers/config'
import { OfftubeAtemLLayer, OfftubeGraphicLLayer, OfftubeSisyfosLLayer } from './layers'
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

export function getBaseline(context: IStudioContext): BlueprintResultBaseline {
	const mappings = context.getStudioMappings()
	const config = context.getStudioConfig() as OfftubeStudioBlueprintConfig

	const sisyfosMappings = filterMappings(mappings, (_id, v) => v.device === TSR.DeviceType.SISYFOS)

	const mappedChannels: TSR.TimelineObjSisyfosChannels['content']['channels'] = []
	for (const id in sisyfosMappings) {
		if (sisyfosMappings[id]) {
			const sisyfosChannel = sisyfosChannels[id as OfftubeSisyfosLLayer]
			if (sisyfosChannel) {
				mappedChannels.push({
					mappedLayer: id,
					isPgm: config.studio.IdleSisyfosLayers.includes(id) ? 1 : sisyfosChannel.isPgm,
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

	const idleWallLoops = config.studio.IdleWallLoop ?? []
	const idleWallLoop = idleWallLoops[0]
	const wallTimeline: TSR.TimelineObjVIZMSEElementInternal[] = []
	if (idleWallLoops.length > 1) {
		context.logWarning('Idle Wall Loop must contain only one configuration row. Remove the extra rows.')
	} else if (idleWallLoop?.Enabled === true) {
		const wallMapping = mappings[OfftubeGraphicLLayer.GraphicLLayerWall]
		if (
			typeof idleWallLoop.ShowName !== 'string' ||
			!idleWallLoop.ShowName.trim() ||
			typeof idleWallLoop.TemplateName !== 'string' ||
			!idleWallLoop.TemplateName.trim()
		) {
			context.logWarning('Idle Wall Loop is enabled but requires both a Show Name and a Template Name.')
		} else if (!wallMapping || wallMapping.device !== TSR.DeviceType.VIZMSE) {
			context.logWarning('Idle Wall Loop requires the graphic_wall mapping to target a Viz MSE device.')
		} else {
			wallTimeline.push({
				id: '',
				enable: { while: '1' },
				priority: 0,
				layer: OfftubeGraphicLLayer.GraphicLLayerWall,
				content: {
					deviceType: TSR.DeviceType.VIZMSE,
					type: TSR.TimelineContentTypeVizMSE.ELEMENT_INTERNAL,
					channelName: 'WALL1',
					showName: idleWallLoop.ShowName.trim(),
					templateName: idleWallLoop.TemplateName.trim(),
					templateData: []
				}
			})
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
			literal<TSR.TimelineObjAtemME>({
				id: '',
				enable: { while: '1' },
				priority: 0,
				layer: OfftubeAtemLLayer.AtemMEClean,
				content: {
					deviceType: TSR.DeviceType.ATEM,
					type: TSR.TimelineContentTypeAtem.ME,
					me: {
						input: config.studio.IdleSource,
						transition: TSR.AtemTransitionStyle.CUT
					}
				}
			}),

			// Route ME 2 PGM to ME 1 PGM
			literal<TSR.TimelineObjAtemME>({
				id: '',
				enable: { while: '1' },
				priority: 0,
				layer: OfftubeAtemLLayer.AtemMEProgram,
				content: {
					deviceType: TSR.DeviceType.ATEM,
					type: TSR.TimelineContentTypeAtem.ME,
					me: {
						programInput: AtemSourceIndex.Prg2
					}
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
			}),
			...wallTimeline
		]
	}
}
