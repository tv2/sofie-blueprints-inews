import {
	BlueprintSyncIngestNewData,
	BlueprintSyncIngestPartInstance,
	ISyncIngestUpdateToPartInstanceContext
} from '@sofie-automation/blueprints-integration'
import { syncIngestUpdateToPartInstanceBase } from 'tv2-common'
import { OfftubeSourceLayer } from './layers'

export function syncIngestUpdateToPartInstance(
	context: ISyncIngestUpdateToPartInstanceContext,
	existingPartInstance: BlueprintSyncIngestPartInstance,
	newPart: BlueprintSyncIngestNewData,
	_playoutStatus: 'current' | 'next'
): void {
	syncIngestUpdateToPartInstanceBase(context, existingPartInstance, newPart, _playoutStatus, [
		// OfftubeSourceLayer.PgmAudioBed,
		OfftubeSourceLayer.WallGraphics,
		OfftubeSourceLayer.PgmScript,
		// OfftubeSourceLayer.PgmFullBackground,
		OfftubeSourceLayer.PgmDVEBackground
	])
}
