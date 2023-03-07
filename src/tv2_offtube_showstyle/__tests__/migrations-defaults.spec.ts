import { GetDSKSourceLayerNames } from 'tv2-common'
import * as _ from 'underscore'
import { ATEMModel } from '../../types/atem'

import { OfftubeSourceLayer } from '../layers'
import SourcelayerDefaults from '../migrations/sourcelayer-defaults'

describe('Migration Defaults', () => {
	test('SourcelayerDefaults', () => {
		const defaultsIds = _.map(SourcelayerDefaults, (v) => v._id).sort()
		const layerIds = _.values(OfftubeSourceLayer)
			.map((l) => l.toString())
			.concat(GetDSKSourceLayerNames(ATEMModel.PRODUCTION_STUDIO_4K_2ME))
			.sort()

		expect(defaultsIds).toEqual(layerIds)
	})
})
