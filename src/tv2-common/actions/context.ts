import {
	BlueprintMappings,
	IActionExecutionContext,
	IBlueprintMutatablePart,
	IBlueprintPart,
	IBlueprintPartInstance,
	IBlueprintPiece,
	IBlueprintPieceDB,
	IBlueprintPieceInstance,
	IBlueprintResolvedPieceInstance,
	PackageInfo
} from '@sofie-automation/blueprints-integration'
import { literal, PartMetaData } from 'tv2-common'

export interface ITV2ActionExecutionContext extends IActionExecutionContext {
	/** To prompt type errors for frong context type */
	isTV2Context: true
}

class TV2ActionExecutionContext implements ITV2ActionExecutionContext {
	public studioId: string
	public isTV2Context: true
	private coreContext: IActionExecutionContext

	private modifiedParts: Set<'current' | 'next'> = new Set()

	constructor(coreContext: IActionExecutionContext) {
		this.coreContext = coreContext
		this.studioId = coreContext.studioId
	}
	public getPartInstance(part: 'current' | 'next'): IBlueprintPartInstance<unknown> | undefined {
		return this.coreContext.getPartInstance(part)
	}
	public getPieceInstances(part: 'current' | 'next'): Array<IBlueprintPieceInstance<unknown>> {
		return this.coreContext.getPieceInstances(part)
	}
	public getResolvedPieceInstances(part: 'current' | 'next'): Array<IBlueprintResolvedPieceInstance<unknown>> {
		return this.coreContext.getResolvedPieceInstances(part)
	}
	public findLastPieceOnLayer(
		sourceLayerId: string | string[],
		options?: {
			excludeCurrentPart?: boolean | undefined
			originalOnly?: boolean | undefined
			pieceMetaDataFilter?: any
		}
	): IBlueprintPieceInstance<unknown> | undefined {
		return this.coreContext.findLastPieceOnLayer(sourceLayerId, options)
	}
	public findLastScriptedPieceOnLayer(
		sourceLayerId: string | string[],
		options?: { excludeCurrentPart?: boolean | undefined; pieceMetaDataFilter?: any }
	): IBlueprintPiece<unknown> | undefined {
		return this.coreContext.findLastScriptedPieceOnLayer(sourceLayerId, options)
	}
	public getPartInstanceForPreviousPiece(piece: IBlueprintPieceInstance<unknown>): IBlueprintPartInstance<unknown> {
		return this.coreContext.getPartInstanceForPreviousPiece(piece)
	}
	public getPartForPreviousPiece(piece: IBlueprintPieceDB<unknown>): IBlueprintPart<unknown> | undefined {
		return this.coreContext.getPartForPreviousPiece(piece)
	}
	public stopPiecesOnLayers(sourceLayerIds: string[], timeOffset?: number): string[] {
		return this.coreContext.stopPiecesOnLayers(sourceLayerIds, timeOffset)
	}
	public stopPieceInstances(pieceInstanceIds: string[], timeOffset?: number): string[] {
		return this.coreContext.stopPieceInstances(pieceInstanceIds, timeOffset)
	}
	public takeAfterExecuteAction(take: boolean): boolean {
		return this.coreContext.takeAfterExecuteAction(take)
	}
	public notifyUserError(message: string, params?: { [key: string]: any }): void {
		return this.coreContext.notifyUserError(message, params)
	}
	public notifyUserWarning(message: string, params?: { [key: string]: any }): void {
		return this.coreContext.notifyUserWarning(message, params)
	}
	public getHashId(originString: string, originIsNotUnique?: boolean | undefined) {
		return this.coreContext.getHashId(originString, originIsNotUnique)
	}
	public unhashId(hash: string) {
		return this.coreContext.unhashId(hash)
	}
	public logDebug(message: string) {
		return this.coreContext.logDebug(message)
	}
	public logInfo(message: string) {
		return this.coreContext.logInfo(message)
	}
	public logWarning(message: string) {
		return this.coreContext.logWarning(message)
	}
	public logError(message: string) {
		return this.coreContext.logError(message)
	}
	public getShowStyleConfig(): unknown {
		return this.coreContext.getShowStyleConfig()
	}
	public getShowStyleConfigRef(configKey: string): string {
		return this.coreContext.getShowStyleConfigRef(configKey)
	}
	public getStudioConfig(): unknown {
		return this.coreContext.getStudioConfig()
	}
	public getStudioConfigRef(configKey: string): string {
		return this.coreContext.getShowStyleConfigRef(configKey)
	}
	public getStudioMappings(): Readonly<BlueprintMappings> {
		return this.coreContext.getStudioMappings()
	}
	public getPackageInfo(packageId: string): readonly PackageInfo.Any[] {
		return this.coreContext.getPackageInfo(packageId)
	}
	public hackGetMediaObjectDuration(mediaId: string): number | undefined {
		return this.coreContext.hackGetMediaObjectDuration(mediaId)
	}
	public getCurrentTime(): number {
		return this.coreContext.getCurrentTime()
	}

	public moveNextPart(partDelta: number, segmentDelta: number): void {
		this.modifiedParts.add('next')

		return this.coreContext.moveNextPart(partDelta, segmentDelta)
	}

	public queuePart(rawPart: IBlueprintPart, rawPieces: IBlueprintPiece[]): IBlueprintPartInstance {
		this.modifiedParts.add('next')

		return this.coreContext.queuePart(rawPart, rawPieces)
	}

	public removePieceInstances(part: 'next', pieceInstanceIds: string[]): string[] {
		this.modifiedParts.add('next')

		return this.coreContext.removePieceInstances(part, pieceInstanceIds)
	}

	public insertPiece(part: 'current' | 'next', piece: IBlueprintPiece): IBlueprintPieceInstance {
		this.modifiedParts.add(part)
		return this.coreContext.insertPiece(part, piece)
	}
	public updatePartInstance(part: 'current' | 'next', props: Partial<IBlueprintMutatablePart>): IBlueprintPartInstance {
		this.modifiedParts.add(part)
		return this.coreContext.updatePartInstance(part, props)
	}
	public updatePieceInstance(pieceInstanceId: string, piece: Partial<IBlueprintPiece>): IBlueprintPieceInstance {
		const currentPieceInstances = this.coreContext.getPieceInstances('current')
		if (currentPieceInstances.map(p => p._id).includes(pieceInstanceId)) {
			this.modifiedParts.add('current')
		} else {
			const nextPieceInstances = this.coreContext.getPieceInstances('next')
			if (nextPieceInstances.map(p => p._id).includes(pieceInstanceId)) {
				this.modifiedParts.add('next')
			}
		}

		// Regardless of above, let core handle errors
		return this.coreContext.updatePieceInstance(pieceInstanceId, piece)
	}

	/**
	 * Call this when the context is finished with.
	 * After this, no further calls can be made.
	 */
	public afterActions() {
		for (const part of this.modifiedParts) {
			this.markPartAsModifiedByAction(part)
		}
	}

	private markPartAsModifiedByAction(part: 'current' | 'next') {
		const partInstance = this.coreContext.getPartInstance(part)
		if (!partInstance) {
			return
		}

		if (!partInstance.part.metaData) {
			partInstance.part.metaData = {}
		}

		this.coreContext.updatePartInstance(part, {
			metaData: literal<PartMetaData>({ ...(partInstance.part.metaData as PartMetaData), dirty: true })
		})
	}
}

export function executeWithContext(
	coreContext: IActionExecutionContext,
	func: (context: ITV2ActionExecutionContext) => void
) {
	const context = new TV2ActionExecutionContext(coreContext)
	func(context)
	context.afterActions()
}
