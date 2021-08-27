import {
	BlueprintSyncIngestNewData,
	BlueprintSyncIngestPartInstance,
	ISyncIngestUpdateToPartInstanceContext
} from '@sofie-automation/blueprints-integration'
import _ = require('underscore')

export function updatePartProperties(
	context: ISyncIngestUpdateToPartInstanceContext,
	_existingPartInstance: BlueprintSyncIngestPartInstance,
	newPart: BlueprintSyncIngestNewData
) {
	context.updatePartInstance(
		_.omit(
			newPart.part,
			'_id',
			'externalId',
			'autoNext',
			'autoNextOverlap',
			'prerollDuration',
			'transitionPrerollDuration',
			'transitionKeepaliveDuration',
			'transitionDuration',
			'disableOutTransition'
		)
	)
}
