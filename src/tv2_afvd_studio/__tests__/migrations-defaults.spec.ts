import {
	AbstractLLayerServerEnable,
	ATEM_LAYER_PREFIX,
	CasparPlayerClip,
	CasparPlayerClipLoadingLoop,
	getUsedLayers,
	TRICASTER_LAYER_PREFIX
} from 'tv2-common'
import { AbstractLLayer, RobotCameraLayer } from 'tv2-constants'
import * as _ from 'underscore'
import { CasparLLayer, GraphicLLayer, SisyfosLLAyer, VirtualAbstractLLayer } from '../layers'

import MappingsDefaults from '../migrations/mappings-defaults'
import { GALLERY_UNIFORM_CONFIG } from '../uniformConfig'

/** Get all the Real LLayers (map to devices). Note: Does not include some which are dynamically generated */
export function getRealLLayers(): string[] {
	return getUsedLayers(GALLERY_UNIFORM_CONFIG)
		.flatMap(layer => [TRICASTER_LAYER_PREFIX + layer, ATEM_LAYER_PREFIX + layer])
		.concat(_.values(CasparLLayer))
		.concat(_.values(SisyfosLLAyer))
		.concat(_.values(AbstractLLayer))
		.concat(_.values(GraphicLLayer))
		.concat(_.values(VirtualAbstractLLayer))
		.concat(_.values(RobotCameraLayer))
}

describe('Migration Defaults', () => {
	test('MappingsDefaults', () => {
		const allMappings = {
			...MappingsDefaults
		}
		const defaultsIds = _.map(allMappings, (v, id) => {
			v = v
			return id
		}).sort()

		// Inject core_abstract as it is required by core and so needs to be defined
		const layerIds = getRealLLayers()
			.concat(['core_abstract'])
			.concat([
				CasparPlayerClip(1),
				CasparPlayerClip(2),
				CasparPlayerClipLoadingLoop(1),
				CasparPlayerClipLoadingLoop(2),
				AbstractLLayerServerEnable(1),
				AbstractLLayerServerEnable(2)
			])
			.sort()

		expect(defaultsIds).toEqual(expect.arrayContaining(layerIds))
	})
})
