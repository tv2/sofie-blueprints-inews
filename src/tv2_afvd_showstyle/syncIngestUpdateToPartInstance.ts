import {
	BlueprintSyncIngestNewData,
	BlueprintSyncIngestPartInstance,
	ISyncIngestUpdateToPartInstanceContext
} from 'blueprints-integration'
import { syncIngestUpdateToPartInstanceBase } from 'tv2-common'
import * as _ from 'underscore'
import { SourceLayer } from './layers'

export function syncIngestUpdateToPartInstance(
	context: ISyncIngestUpdateToPartInstanceContext,
	existingPartInstance: BlueprintSyncIngestPartInstance,
	newPart: BlueprintSyncIngestNewData,
	playoutStatus: 'current' | 'next'
): void {
	syncIngestUpdateToPartInstanceBase(context, existingPartInstance, newPart, playoutStatus, [
		SourceLayer.PgmAudioBed,
		SourceLayer.WallGraphics,
		SourceLayer.PgmScript,
		SourceLayer.PgmFullBackground,
		SourceLayer.PgmDVEBackground
	])
}
