import { AbstractLLayerServerEnable } from 'tv2-common'
import * as _ from 'underscore'

import { RealLLayers } from '../layers'
import MappingsDefaults, {
	getCameraSisyfosMappings,
	getMediaPlayerMappings,
	getRemoteSisyfosMappings,
	getTelefonSisyfosMappings
} from '../migrations/mappings-defaults'

describe('Migration Defaults', () => {
	test('MappingsDefaults', () => {
		const allMappings = {
			...MappingsDefaults,
			// Inject MediaPlayer ones, as they are used directly and part of the enum
			...getMediaPlayerMappings([]),
			...getCameraSisyfosMappings([]),
			...getRemoteSisyfosMappings([]),
			...getTelefonSisyfosMappings('')
		}
		const defaultsIds = _.map(allMappings, (v, id) => {
			v = v
			return id
		}).sort()

		// Inject core_abstract as it is required by core and so needs to be defined
		const layerIds = RealLLayers()
			.concat(['core_abstract'])
			.concat([
				'casparcg_player_clip_1',
				'casparcg_player_clip_2',
				'casparcg_player_clip_1_loading_loop',
				'casparcg_player_clip_2_loading_loop',
				AbstractLLayerServerEnable(1),
				AbstractLLayerServerEnable(2)
			])
			.sort()

		expect(defaultsIds).toEqual(layerIds)
	})
})
