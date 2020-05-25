import * as _ from 'underscore'

import { OfftubeSourceLayer } from '../layers'
import SourcelayerDefaults from '../migrations/sourcelayer-defaults'

describe('Migration Defaults', () => {
	test('SourcelayerDefaults', () => {
		const defaultsIds = _.map(SourcelayerDefaults, v => v._id).sort()
		const layerIds = _.values(OfftubeSourceLayer).sort()

		expect(defaultsIds).toEqual(layerIds)
	})
})
