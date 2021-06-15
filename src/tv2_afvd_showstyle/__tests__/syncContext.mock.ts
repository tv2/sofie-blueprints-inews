import {
	IBlueprintMutatablePart,
	IBlueprintPartInstance,
	IBlueprintPiece,
	IBlueprintPieceInstance,
	PieceLifespan,
	SyncIngestUpdateToPartInstanceContext
} from '@sofie-automation/blueprints-integration'
import { literal } from 'tv2-common'
import { MockSegmentContext } from '../../tv2_afvd_studio/__tests__/segmentContext.mock'

export class MockSyncIngestUpdateToPartInstanceContext extends MockSegmentContext
	implements SyncIngestUpdateToPartInstanceContext {
	public syncedPieceInstances: string[] = []
	public removedPieceInstances: string[] = []
	public updatedPieceInstances: string[] = []
	public updatedPartInstance: IBlueprintPartInstance | undefined = undefined

	/** Sync a pieceInstance. Inserts the pieceInstance if new, updates if existing. Optionally pass in a mutated Piece, to change the content of the instance */
	public syncPieceInstance(
		pieceInstanceId: string,
		mutatedPiece?: Omit<IBlueprintPiece, 'lifespan'>
	): IBlueprintPieceInstance {
		this.syncedPieceInstances.push(pieceInstanceId)
		return literal<IBlueprintPieceInstance>({
			_id: pieceInstanceId,
			piece: {
				_id: '',
				enable: {
					start: 0
				},
				externalId: '',
				name: '',
				sourceLayerId: '',
				outputLayerId: '',
				lifespan: PieceLifespan.WithinPart,
				...mutatedPiece
			}
		})
	}

	/** Insert a pieceInstance. Returns id of new PieceInstance. Any timelineObjects will have their ids changed, so are not safe to reference from another piece */
	public insertPieceInstance(piece: IBlueprintPiece): IBlueprintPieceInstance {
		return literal<IBlueprintPieceInstance>({
			_id: '',
			piece: {
				_id: '',
				...piece
			}
		})
	}

	/** Update a piecesInstance */
	public updatePieceInstance(pieceInstanceId: string, piece: Partial<IBlueprintPiece>): IBlueprintPieceInstance {
		return literal<IBlueprintPieceInstance>({
			_id: pieceInstanceId,
			piece: {
				_id: '',
				enable: {
					start: 0
				},
				externalId: '',
				name: '',
				sourceLayerId: '',
				outputLayerId: '',
				lifespan: PieceLifespan.WithinPart,
				...piece
			}
		})
	}

	/** Remove a pieceInstance */
	public removePieceInstances(...pieceInstanceIds: string[]): string[] {
		this.removedPieceInstances.push(...pieceInstanceIds)
		return pieceInstanceIds
	}

	/** Update a partInstance */
	public updatePartInstance(props: Partial<IBlueprintMutatablePart>): IBlueprintPartInstance {
		this.updatedPartInstance = literal<IBlueprintPartInstance>({
			_id: '',
			segmentId: '',
			part: {
				_id: '',
				segmentId: '',
				externalId: '',
				title: '',
				...props
			}
		})
		return this.updatedPartInstance
	}
}
