import { DeviceType, MappingAbstract } from 'timeline-state-resolver-types'
import { BlueprintMapping, BlueprintMappings, LookaheadMode } from 'tv-automation-sofie-blueprints-integration'
import { literal } from 'tv2-common'
import * as _ from 'underscore'

export default literal<BlueprintMappings>({
	core_abstract: literal<MappingAbstract & BlueprintMapping>({
		device: DeviceType.ABSTRACT,
		deviceId: 'abstract0',
		lookahead: LookaheadMode.NONE
	}),
	offtube_abstract_pgm_enabler: literal<MappingAbstract & BlueprintMapping>({
		device: DeviceType.ABSTRACT,
		deviceId: 'abstract0',
		lookahead: LookaheadMode.NONE
	})
})
