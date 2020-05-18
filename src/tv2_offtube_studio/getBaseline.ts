import {
	AtemTransitionStyle,
	DeviceType,
	MappingAtemType,
	TimelineContentTypeAtem,
	TimelineContentTypeSisyfos,
	TimelineObjAtemME,
	TimelineObjSisyfosAny,
	TSRTimelineObjBase
} from 'timeline-state-resolver-types'
import { BlueprintMapping, BlueprintMappings, IStudioContext } from 'tv-automation-sofie-blueprints-integration'
import { literal } from 'tv2-common'
import * as _ from 'underscore'
import { AtemSourceIndex } from '../types/atem'
import { OfftubeAtemLLayer, OfftubeSisyfosLLayer } from './layers'
import { SisyfosChannel, sisyfosChannels } from './sisyfosChannels'

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

export function getBaseline(context: IStudioContext): TSRTimelineObjBase[] {
	const mappings = context.getStudioMappings()

	const atemMeMappings = filterMappings(
		mappings,
		(_id, v) => v.device === DeviceType.ATEM && (v as any).mappingType === MappingAtemType.MixEffect
	)

	const sisyfosMappings = filterMappings(mappings, (_id, v) => v.device === DeviceType.SISYFOS)

	return [
		...convertMappings(atemMeMappings, id =>
			literal<TimelineObjAtemME>({
				id: '',
				enable: { while: '1' },
				priority: 0,
				layer: id,
				content: {
					deviceType: DeviceType.ATEM,
					type: TimelineContentTypeAtem.ME,
					me: {
						input: AtemSourceIndex.Bars,
						transition: AtemTransitionStyle.CUT
					}
				}
			})
		),
		...convertMappings(sisyfosMappings, id => {
			const sisyfosChannel = sisyfosChannels[id as OfftubeSisyfosLLayer] as SisyfosChannel | undefined
			if (sisyfosChannel) {
				return literal<TimelineObjSisyfosAny>({
					id: '',
					enable: { while: '1' },
					priority: 0,
					layer: id,
					content: {
						deviceType: DeviceType.SISYFOS,
						type: TimelineContentTypeSisyfos.SISYFOS,
						isPgm: sisyfosChannel.isPgm,
						label: sisyfosChannel.label,
						visible: true
					}
				})
			} else {
				return literal<TimelineObjSisyfosAny>({
					id: '',
					enable: { while: '1' },
					priority: 0,
					layer: id,
					content: {
						deviceType: DeviceType.SISYFOS,
						type: TimelineContentTypeSisyfos.SISYFOS,
						isPgm: 0,
						label: ''
					}
				})
			}
		}),

		// have ATEM output default still image
		literal<TimelineObjAtemME>({
			id: '',
			enable: { while: '1' },
			priority: 0,
			layer: OfftubeAtemLLayer.AtemMEProgram,
			content: {
				deviceType: DeviceType.ATEM,
				type: TimelineContentTypeAtem.ME,
				me: {
					input: AtemSourceIndex.MP1,
					transition: AtemTransitionStyle.CUT
				}
			}
		}),

		// Route ME 2 PGM to ME 1 PGM
		literal<TimelineObjAtemME>({
			id: '',
			enable: { while: '1' },
			priority: 0,
			layer: OfftubeAtemLLayer.AtemMEMultiview,
			content: {
				deviceType: DeviceType.ATEM,
				type: TimelineContentTypeAtem.ME,
				me: {
					input: AtemSourceIndex.Prg1,
					transition: AtemTransitionStyle.CUT
				}
			}
		})
	]
}
