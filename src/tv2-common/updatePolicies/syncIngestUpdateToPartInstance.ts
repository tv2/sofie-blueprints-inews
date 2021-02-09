import {
	BlueprintSyncIngestNewData,
	BlueprintSyncIngestPartInstance,
	SyncIngestUpdateToPartInstanceContext
} from '@sofie-automation/blueprints-integration'
import * as _ from 'underscore'
import { stopOrReplaceAlwaysEditablePieces, updateAdLibInstances } from './index'

export function syncIngestUpdateToPartInstanceBase(
	context: SyncIngestUpdateToPartInstanceContext,
	existingPartInstance: BlueprintSyncIngestPartInstance,
	newPart: BlueprintSyncIngestNewData,
	_playoutStatus: 'current' | 'next',
	/** Layers that can be have pieces added / removed / updated at any time */
	freelyEditableLayers: string[],
	preSteps?: () => void,
	postSteps?: () => void
): void {
	if (preSteps) {
		preSteps()
	}

	stopOrReplaceAlwaysEditablePieces(context, existingPartInstance, newPart, freelyEditableLayers)
	updateAdLibInstances(context, existingPartInstance, newPart)

	if (postSteps) {
		postSteps()
	}
}
