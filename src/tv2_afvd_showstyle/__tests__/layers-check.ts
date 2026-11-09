import * as _ from 'underscore'

import { BlueprintMappings, IBlueprintPieceGeneric, TimelineObjectCoreExt, TSR } from 'blueprints-integration'

import { GetDSKSourceLayerNames } from 'tv2-common'
import mappingsDefaults from '../../tv2_afvd_studio/migrations/mappings-defaults'
import { ATEMModel } from '../../types/atem'
import { SourceLayer } from '../layers'
import OutputlayerDefaults from '../migrations/outputlayer-defaults'

export function checkAllLayers(pieces: IBlueprintPieceGeneric[], otherObjs?: TSR.TSRTimelineObjBase[]) {
	const missingSourceLayers: string[] = []
	const missingOutputLayers: string[] = []
	const missingLayers: Array<string | number> = []
	const wrongDeviceLayers: Array<string | number> = []

	const allSourceLayers: string[] = _.values(SourceLayer)
		.map(l => l.toString())
		.concat(GetDSKSourceLayerNames(ATEMModel.CONSTELLATION_8K_UHD_MODE))
		.sort()
	const allOutputLayers = _.map(OutputlayerDefaults, m => m._id)

	const allMappings: BlueprintMappings = {
		...mappingsDefaults
	}

	const validateObject = (obj: TimelineObjectCoreExt) => {
		const isAbstract = obj.content.deviceType === TSR.DeviceType.ABSTRACT
		const mapping = allMappings[obj.layer]

		const isMediaPlayerPending =
			(obj.layer + '').endsWith('_pending') && mapping && mapping.device === TSR.DeviceType.ABSTRACT
		if (
			mapping &&
			mapping.device !== obj.content.deviceType &&
			!isMediaPlayerPending &&
			(obj.content as any).type !== 'empty'
		) {
			wrongDeviceLayers.push(obj.layer)
		} else if (!isAbstract && !mapping) {
			missingLayers.push(obj.layer)
		}
	}

	for (const sli of pieces) {
		if (allSourceLayers.indexOf(sli.sourceLayerId) === -1) {
			missingSourceLayers.push(sli.sourceLayerId)
		}
		if (allOutputLayers.indexOf(sli.outputLayerId) === -1) {
			missingOutputLayers.push(sli.outputLayerId)
		}

		if (sli.content && sli.content.timelineObjects) {
			for (const obj of sli.content.timelineObjects as TimelineObjectCoreExt[]) {
				validateObject(obj)
			}
		}
	}

	if (otherObjs) {
		_.each(otherObjs, validateObject)
	}

	expect(_.unique(missingOutputLayers)).toHaveLength(0)
	expect(_.unique(missingSourceLayers)).toHaveLength(0)
	expect(_.unique(missingLayers)).toHaveLength(0)
	expect(_.unique(wrongDeviceLayers)).toHaveLength(0)
}
