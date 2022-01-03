import {
	BlueprintSyncIngestNewData,
	BlueprintSyncIngestPartInstance,
	ISyncIngestUpdateToPartInstanceContext
} from '@tv2media/blueprints-integration'
import { PieceMetaData } from 'tv2-common'
import _ = require('underscore')

function normalizeArrayToMap<T, K extends keyof T>(array: T[], indexKey: K): Map<T[K], T> {
	const normalizedObject = new Map<T[K], T>()
	for (const item of array) {
		const key = item[indexKey]
		normalizedObject.set(key, item)
	}
	return normalizedObject
}

export function updateAdLibInstances(
	context: ISyncIngestUpdateToPartInstanceContext,
	existingPartInstance: BlueprintSyncIngestPartInstance,
	newPart: BlueprintSyncIngestNewData
) {
	// Update any instances of adlibs
	const defaultAdlibSourceId = 'undefined'
	const rawAdlibs = normalizeArrayToMap(newPart.adLibPieces, '_id')
	const rawAdlibRefs = normalizeArrayToMap(newPart.referencedAdlibs, '_id')
	const groupedAdlibInstances = _.groupBy(
		existingPartInstance.pieceInstances,
		p => p.adLibSourceId ?? defaultAdlibSourceId
	)
	for (const [adlibId, adlibPieces] of Object.entries(groupedAdlibInstances)) {
		if (adlibId !== defaultAdlibSourceId) {
			const updatableAdlibPieces = adlibPieces.filter(p => {
				const metaData = p.piece.metaData as PieceMetaData
				return !metaData?.modifiedByAction
			})
			const newTemplate = rawAdlibs.get(adlibId) ?? rawAdlibRefs.get(adlibId)
			if (newTemplate) {
				// Update the pieceInstances
				for (const adlibPiece of updatableAdlibPieces) {
					context.updatePieceInstance(adlibPiece._id, newTemplate)
				}
			}
		}
	}
}
