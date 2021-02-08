import {
	BlueprintSyncIngestNewData,
	BlueprintSyncIngestPartInstance,
	IBlueprintPieceInstance,
	SyncIngestUpdateToPartInstanceContext
} from '@sofie-automation/blueprints-integration'

export function stopOrReplaceAlwaysEditablePieces(
	context: SyncIngestUpdateToPartInstanceContext,
	existingPartInstance: BlueprintSyncIngestPartInstance,
	newPart: BlueprintSyncIngestNewData,
	allowedSourceLayers: string[]
) {
	const pieceInstancesOnLayersInExistingPart = existingPartInstance.pieceInstances.filter(p =>
		allowedSourceLayers.includes(p.piece.sourceLayerId)
	)
	const groupedPieceInstancesInExistingPart = pieceInstancesOnLayersInExistingPart.reduce<{
		[sourceLayerId: string]: IBlueprintPieceInstance | undefined
	}>((acc, curr) => {
		acc[curr.piece.sourceLayerId] = curr
		return acc
	}, {})

	const pieceInstancesOnLayersInNewPart = newPart.pieceInstances.filter(p =>
		allowedSourceLayers.includes(p.piece.sourceLayerId)
	)
	const groupedPieceInstancesInNewPart = pieceInstancesOnLayersInNewPart.reduce<{
		[sourceLayerId: string]: IBlueprintPieceInstance | undefined
	}>((acc, curr) => {
		acc[curr.piece.sourceLayerId] = curr
		return acc
	}, {})

	for (const layer of allowedSourceLayers) {
		const existingPieceInstance = groupedPieceInstancesInExistingPart[layer]
		const newPieceInstance = groupedPieceInstancesInNewPart[layer]

		if (newPieceInstance && !existingPieceInstance) {
			context.syncPieceInstance(newPieceInstance._id)
		} else if (newPieceInstance && existingPieceInstance) {
			context.syncPieceInstance(newPieceInstance._id)
		} else if (!newPieceInstance && existingPieceInstance && !existingPieceInstance.dynamicallyInserted) {
			context.removePieceInstances(existingPieceInstance._id)
		}
	}
}
