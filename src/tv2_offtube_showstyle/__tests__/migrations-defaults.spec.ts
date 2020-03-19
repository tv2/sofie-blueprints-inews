import * as _ from 'underscore'

import { OffTubeSourceLayer } from '../layers'
import SourcelayerDefaults from '../migrations/sourcelayer-defaults'

describe('Migration Defaults', () => {
	test('SourcelayerDefaults', () => {
		const defaultsIds = _.map(SourcelayerDefaults, v => v._id).sort()
		const layerIds = _.values(OffTubeSourceLayer).sort()

		expect(defaultsIds).toEqual(layerIds)
	})
})
