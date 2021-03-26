import {
	AbstractLLayerServerEnable,
	CasparPlayerClip,
	CasparPlayerClipLoadingLoop,
	GetDSKMappingNames
} from 'tv2-common'
import * as _ from 'underscore'
import { ATEMModel } from '../../types/atem'

import { RealLLayers } from '../layers'
import MappingsDefaults from '../migrations/mappings-defaults'

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
		const layerIds = RealLLayers()
			.concat(['core_abstract'])
			.concat([
				CasparPlayerClip(1),
				CasparPlayerClip(2),
				CasparPlayerClipLoadingLoop(1),
				CasparPlayerClipLoadingLoop(2),
				AbstractLLayerServerEnable(1),
				AbstractLLayerServerEnable(2),
				...GetDSKMappingNames(ATEMModel.PRODUCTION_STUDIO_4K_2ME)
			])
			.sort()

		expect(defaultsIds).toEqual(layerIds)
	})
})
