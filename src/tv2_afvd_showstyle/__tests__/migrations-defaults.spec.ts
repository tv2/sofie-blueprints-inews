import { GetDSKSourceLayerNames } from 'tv2-common'
import * as _ from 'underscore'
import { ATEMModel } from '../../types/atem'

import { SourceLayer } from '../layers'
import SourcelayerDefaults from '../migrations/sourcelayer-defaults'

describe('Migration Defaults', () => {
	test('SourcelayerDefaults', () => {
		const defaultsIds = _.map(SourcelayerDefaults, (v) => v._id).sort()
		const layerIds = _.values(SourceLayer)
			.map((l) => l.toString())
			.concat(GetDSKSourceLayerNames(ATEMModel.CONSTELLATION_8K_UHD_MODE))
			.sort()

		expect(defaultsIds).toEqual(layerIds)
	})
})
