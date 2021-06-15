import {
	BlueprintSyncIngestNewData,
	BlueprintSyncIngestPartInstance,
	SyncIngestUpdateToPartInstanceContext
} from '@sofie-automation/blueprints-integration'
import { syncIngestUpdateToPartInstanceBase } from 'tv2-common'
import { OfftubeSourceLayer } from './layers'

export function syncIngestUpdateToPartInstance(
	context: SyncIngestUpdateToPartInstanceContext,
	existingPartInstance: BlueprintSyncIngestPartInstance,
	newPart: BlueprintSyncIngestNewData,
	playoutStatus: 'current' | 'next'
): void {
	syncIngestUpdateToPartInstanceBase(context, existingPartInstance, newPart, playoutStatus, [
		// OfftubeSourceLayer.PgmAudioBed,
		OfftubeSourceLayer.WallGraphics,
		OfftubeSourceLayer.PgmScript,
		// OfftubeSourceLayer.PgmFullBackground,
		OfftubeSourceLayer.PgmDVEBackground
	])
}
