import {
	BlueprintSyncIngestNewData,
	BlueprintSyncIngestPartInstance,
	ISyncIngestUpdateToPartInstanceContext
} from 'blueprints-integration'
import { SharedSourceLayer } from 'tv2-constants'
import * as _ from 'underscore'
import { stopOrReplaceEditablePieces, updateAdLibInstances } from './index'
import { updatePartProperties } from './partProperties'

export function syncIngestUpdateToPartInstanceBase(
	context: ISyncIngestUpdateToPartInstanceContext,
	existingPartInstance: BlueprintSyncIngestPartInstance,
	newPart: BlueprintSyncIngestNewData,
	playoutStatus: 'current' | 'next',
	/** Layers that can be have pieces added / removed / updated at any time */
	freelyEditableLayers: string[]
): void {
	const editableLayers =
		playoutStatus === 'current'
			? new Set([
					...freelyEditableLayers,
					SharedSourceLayer.PgmGraphicsHeadline,
					SharedSourceLayer.PgmGraphicsIdent,
					SharedSourceLayer.PgmGraphicsLower,
					SharedSourceLayer.PgmGraphicsOverlay,
					SharedSourceLayer.PgmGraphicsTLF,
					SharedSourceLayer.PgmGraphicsTema,
					SharedSourceLayer.PgmGraphicsTop,
					SharedSourceLayer.PgmPilot,
					SharedSourceLayer.PgmPilotOverlay
			  ])
			: undefined

	stopOrReplaceEditablePieces(context, existingPartInstance, newPart, editableLayers)
	updateAdLibInstances(context, existingPartInstance, newPart)
	updatePartProperties(context, existingPartInstance, newPart)
}
