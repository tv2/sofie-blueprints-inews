import { BlueprintMapping, BlueprintMappings, IStudioContext, TSR } from 'tv-automation-sofie-blueprints-integration'
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

export function getBaseline(context: IStudioContext): TSR.TSRTimelineObjBase[] {
	const mappings = context.getStudioMappings()

	const atemMeMappings = filterMappings(
		mappings,
		(_id, v) => v.device === TSR.DeviceType.ATEM && (v as any).mappingType === TSR.MappingAtemType.MixEffect
	)

	const sisyfosMappings = filterMappings(mappings, (_id, v) => v.device === TSR.DeviceType.SISYFOS)

	return [
		...convertMappings(atemMeMappings, id =>
			literal<TSR.TimelineObjAtemME>({
				id: '',
				enable: { while: '1' },
				priority: 0,
				layer: id,
				content: {
					deviceType: TSR.DeviceType.ATEM,
					type: TSR.TimelineContentTypeAtem.ME,
					me: {
						input: AtemSourceIndex.Bars,
						transition: TSR.AtemTransitionStyle.CUT
					}
				}
			})
		),
		...convertMappings(sisyfosMappings, id => {
			const sisyfosChannel = sisyfosChannels[id as OfftubeSisyfosLLayer] as SisyfosChannel | undefined
			if (sisyfosChannel) {
				return literal<TSR.TimelineObjSisyfosAny>({
					id: '',
					enable: { while: '1' },
					priority: 0,
					layer: id,
					content: {
						deviceType: TSR.DeviceType.SISYFOS,
						type: TSR.TimelineContentTypeSisyfos.SISYFOS,
						isPgm: sisyfosChannel.isPgm,
						label: sisyfosChannel.label,
						visible: true
					}
				})
			} else {
				return literal<TSR.TimelineObjSisyfosAny>({
					id: '',
					enable: { while: '1' },
					priority: 0,
					layer: id,
					content: {
						deviceType: TSR.DeviceType.SISYFOS,
						type: TSR.TimelineContentTypeSisyfos.SISYFOS,
						isPgm: 0,
						label: ''
					}
				})
			}
		}),

		// have ATEM output default still image
		literal<TSR.TimelineObjAtemME>({
			id: '',
			enable: { while: '1' },
			priority: 0,
			layer: OfftubeAtemLLayer.AtemMEProgram,
			content: {
				deviceType: TSR.DeviceType.ATEM,
				type: TSR.TimelineContentTypeAtem.ME,
				me: {
					input: AtemSourceIndex.MP1,
					transition: TSR.AtemTransitionStyle.CUT
				}
			}
		})
	]
}
