import {
	AbstractLLayerServerEnable,
	ATEM_LAYER_PREFIX,
	CasparPlayerClip,
	CasparPlayerClipLoadingLoop,
	getUsedLayers
} from 'tv2-common'
import { AbstractLLayer, SharedGraphicLLayer } from 'tv2-constants'
import * as _ from 'underscore'
import { OfftubeCasparLLayer, OfftubeSisyfosLLayer } from '../layers'

import MappingsDefaults from '../migrations/mappings-defaults'
import { QBOX_UNIFORM_CONFIG } from '../uniformConfig'

/** Get all the Real LLayers (map to devices). Note: Does not include some which are dynamically generated */
export function getRealLLayers(): string[] {
	return getUsedLayers(QBOX_UNIFORM_CONFIG)
		.flatMap((layer) => [ATEM_LAYER_PREFIX + layer])
		.concat(_.values(OfftubeSisyfosLLayer))
		.concat(_.values(OfftubeCasparLLayer))
		.concat(_.values(AbstractLLayer))
		.concat(_.values(SharedGraphicLLayer))
}

describe('Migration Defaults', () => {
	test('MappingsDefaults', () => {
		const allMappings = {
			...MappingsDefaults
			// Inject MediaPlayer ones, as they are used directly and part of the enum
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
