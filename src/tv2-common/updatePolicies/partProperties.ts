import {
	BlueprintSyncIngestNewData,
	BlueprintSyncIngestPartInstance,
	IBlueprintMutatablePart,
	ISyncIngestUpdateToPartInstanceContext
} from 'blueprints-integration'
import _ = require('underscore')

type Complete<T> = {
	[P in keyof Required<T>]: Pick<T, P> extends Required<Pick<T, P>> ? T[P] : T[P] | undefined
}

const partPropertiesToOmit = [
	'_id',
	'externalId',
	'autoNext',
	'autoNextOverlap',
	'inTransition',
	'disableOutTransition',
	'shouldNotifyCurrentPlayingPart'
] as const

const clearedMutatablePart: Complete<Omit<IBlueprintMutatablePart, (typeof partPropertiesToOmit)[number] | 'title'>> = {
	metaData: undefined,
	expectedDuration: undefined,
	budgetDuration: undefined,
	holdMode: undefined,
	classes: undefined,
	classesForNext: undefined,
	displayDurationGroup: undefined,
	displayDuration: undefined,
	identifier: undefined,
	hackListenToMediaObjectUpdates: undefined,
	disableNextInTransition: undefined,
	outTransition: undefined
}

export function updatePartProperties(
	context: ISyncIngestUpdateToPartInstanceContext,
	_existingPartInstance: BlueprintSyncIngestPartInstance,
	newPart: BlueprintSyncIngestNewData
) {
	context.updatePartInstance({
		...clearedMutatablePart,
		..._.omit(newPart.part, ...partPropertiesToOmit)
	})
}
