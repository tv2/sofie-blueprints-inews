import {
	BlueprintSyncIngestNewData,
	BlueprintSyncIngestPartInstance,
	IBlueprintPieceInstance,
	ISyncIngestUpdateToPartInstanceContext
} from 'blueprints-integration'

function groupPieceInstances(pieceInstances: Array<IBlueprintPieceInstance<unknown>>) {
	return pieceInstances.reduce<{
		[sourceLayerId: string]: { [pieceInstanceId: string]: IBlueprintPieceInstance } | undefined
	}>((acc, curr) => {
		;(acc[curr.piece.sourceLayerId] = acc[curr.piece.sourceLayerId] || {})[curr._id] = curr
		return acc
	}, {})
}
function isRemovable(pieceInstance: IBlueprintPieceInstance) {
	// We aren't informed about a hold piece, so ignore that. adlibs are handled separately too
	// We are also not aware of infinites that were generated in previous parts
	return !(
		pieceInstance.adLibSourceId ||
		pieceInstance.dynamicallyInserted ||
		pieceInstance.infinite?.fromHold ||
		pieceInstance.infinite?.fromPreviousPlayhead ||
		pieceInstance.infinite?.fromPreviousPart
	)
}
export function stopOrReplaceEditablePieces(
	context: ISyncIngestUpdateToPartInstanceContext,
	existingPartInstance: BlueprintSyncIngestPartInstance,
	newPart: BlueprintSyncIngestNewData,
	allowedSourceLayers: Set<string> | undefined
) {
	let pieceInstancesOnLayersInExistingPart = existingPartInstance.pieceInstances

	if (allowedSourceLayers) {
		pieceInstancesOnLayersInExistingPart = existingPartInstance.pieceInstances.filter((p) =>
			allowedSourceLayers.has(p.piece.sourceLayerId)
		)
	}
	const groupedPieceInstancesInExistingPart = groupPieceInstances(pieceInstancesOnLayersInExistingPart)

	let pieceInstancesOnLayersInNewPart = newPart.pieceInstances
	if (allowedSourceLayers) {
		pieceInstancesOnLayersInNewPart = newPart.pieceInstances.filter((p) =>
			allowedSourceLayers.has(p.piece.sourceLayerId)
		)
	}
	const groupedPieceInstancesInNewPart = groupPieceInstances(pieceInstancesOnLayersInNewPart)

	for (const layer of allowedSourceLayers ||
		new Set([...Object.keys(groupedPieceInstancesInExistingPart), ...Object.keys(groupedPieceInstancesInNewPart)])) {
		const existingPieceInstances = groupedPieceInstancesInExistingPart[layer] || {}
		const newPieceInstances = groupedPieceInstancesInNewPart[layer] || {}

		for (const existingId of Object.keys(existingPieceInstances)) {
			if (newPieceInstances[existingId]) {
				context.syncPieceInstance(existingId)
			} else if (isRemovable(existingPieceInstances[existingId])) {
				context.removePieceInstances(existingId)
			}
		}
		for (const newId of Object.keys(newPieceInstances)) {
			if (!existingPieceInstances[newId]) {
				context.syncPieceInstance(newId)
			}
		}
	}
}
