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
	PackageInfo,
	Time
} from 'blueprints-integration'
import { literal, PartMetaData, PieceMetaData } from 'tv2-common'

export interface ITV2ActionExecutionContext extends IActionExecutionContext {
	/** To prompt type errors for wrong context type */
	isTV2Context: true

	getPieceInstances(part: 'current' | 'next'): Promise<Array<IBlueprintPieceInstance<PieceMetaData>>>
	getResolvedPieceInstances(part: 'current' | 'next'): Promise<Array<IBlueprintResolvedPieceInstance<PieceMetaData>>>

	findLastPieceOnLayer(
		sourceLayerId: string | string[],
		options?: {
			excludeCurrentPart?: boolean
			originalOnly?: boolean
			pieceMetaDataFilter?: any
		}
	): Promise<IBlueprintPieceInstance<PieceMetaData> | undefined>
	findLastScriptedPieceOnLayer(
		sourceLayerId: string | string[],
		options?: {
			excludeCurrentPart?: boolean
			pieceMetaDataFilter?: any
		}
	): Promise<IBlueprintPiece<PieceMetaData> | undefined>
	getPartInstanceForPreviousPiece(piece: IBlueprintPieceInstance): Promise<IBlueprintPartInstance>
	getPartForPreviousPiece(piece: IBlueprintPieceDB): Promise<IBlueprintPart | undefined>
	insertPiece(
		part: 'current' | 'next',
		piece: IBlueprintPiece<PieceMetaData>
	): Promise<IBlueprintPieceInstance<PieceMetaData>>
	updatePieceInstance(
		pieceInstanceId: string,
		piece: Partial<IBlueprintPiece<PieceMetaData>>
	): Promise<IBlueprintPieceInstance<PieceMetaData>>
	queuePart(part: IBlueprintPart, pieces: Array<IBlueprintPiece<PieceMetaData>>): Promise<IBlueprintPartInstance>
	updatePartInstance(part: 'current' | 'next', props: Partial<IBlueprintMutatablePart>): Promise<IBlueprintPartInstance>
}

class TV2ActionExecutionContext implements ITV2ActionExecutionContext {
	public studioId: string
	public isTV2Context: true = true

	private coreContext: IActionExecutionContext

	private modifiedParts: Set<'current' | 'next'> = new Set()

	constructor(coreContext: IActionExecutionContext) {
		this.coreContext = coreContext
		this.studioId = coreContext.studioId
	}

	public async getPartInstance(part: 'current' | 'next'): Promise<IBlueprintPartInstance<unknown> | undefined> {
		return this.coreContext.getPartInstance(part)
	}

	public async getPieceInstances(part: 'current' | 'next'): Promise<Array<IBlueprintPieceInstance<PieceMetaData>>> {
		return this.coreContext.getPieceInstances(part) as Promise<Array<IBlueprintPieceInstance<PieceMetaData>>>
	}

	public async getResolvedPieceInstances(
		part: 'current' | 'next'
	): Promise<Array<IBlueprintResolvedPieceInstance<PieceMetaData>>> {
		return this.coreContext.getResolvedPieceInstances(part) as Promise<
			Array<IBlueprintResolvedPieceInstance<PieceMetaData>>
		>
	}

	public async findLastPieceOnLayer(
		sourceLayerId: string | string[],
		options?: {
			excludeCurrentPart?: boolean
			originalOnly?: boolean
			pieceMetaDataFilter?: any
		}
	): Promise<IBlueprintPieceInstance<PieceMetaData> | undefined> {
		return this.coreContext.findLastPieceOnLayer(sourceLayerId, options) as Promise<
			IBlueprintPieceInstance<PieceMetaData> | undefined
		>
	}

	public async findLastScriptedPieceOnLayer(
		sourceLayerId: string | string[],
		options?: { excludeCurrentPart?: boolean; pieceMetaDataFilter?: any }
	): Promise<IBlueprintPiece<PieceMetaData> | undefined> {
		return this.coreContext.findLastScriptedPieceOnLayer(sourceLayerId, options) as Promise<
			IBlueprintPiece<PieceMetaData> | undefined
		>
	}

	public async getPartInstanceForPreviousPiece(
		piece: IBlueprintPieceInstance<PieceMetaData>
	): Promise<IBlueprintPartInstance<unknown>> {
		return this.coreContext.getPartInstanceForPreviousPiece(piece)
	}

	public async getPartForPreviousPiece(
		piece: IBlueprintPieceDB<PieceMetaData>
	): Promise<IBlueprintPart<unknown> | undefined> {
		return this.coreContext.getPartForPreviousPiece(piece)
	}

	public async stopPiecesOnLayers(sourceLayerIds: string[], timeOffset?: number): Promise<string[]> {
		return this.coreContext.stopPiecesOnLayers(sourceLayerIds, timeOffset)
	}

	public async stopPieceInstances(pieceInstanceIds: string[], timeOffset?: number): Promise<string[]> {
		return this.coreContext.stopPieceInstances(pieceInstanceIds, timeOffset)
	}

	public async takeAfterExecuteAction(take: boolean): Promise<boolean> {
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

	public async hackGetMediaObjectDuration(mediaId: string): Promise<number | undefined> {
		return this.coreContext.hackGetMediaObjectDuration(mediaId)
	}

	public getCurrentTime(): number {
		return this.coreContext.getCurrentTime()
	}

	public async moveNextPart(partDelta: number, segmentDelta: number): Promise<void> {
		this.modifiedParts.add('next')

		return this.coreContext.moveNextPart(partDelta, segmentDelta)
	}

	public async queuePart(
		rawPart: IBlueprintPart,
		rawPieces: Array<IBlueprintPiece<PieceMetaData>>
	): Promise<IBlueprintPartInstance> {
		this.modifiedParts.add('next')

		return this.coreContext.queuePart(rawPart, rawPieces)
	}

	public async removePieceInstances(part: 'next', pieceInstanceIds: string[]): Promise<string[]> {
		this.modifiedParts.add('next')

		return this.coreContext.removePieceInstances(part, pieceInstanceIds)
	}

	public async insertPiece(
		part: 'current' | 'next',
		piece: IBlueprintPiece<PieceMetaData>
	): Promise<IBlueprintPieceInstance<PieceMetaData>> {
		this.modifiedParts.add(part)
		return this.coreContext.insertPiece(part, piece) as Promise<IBlueprintPieceInstance<PieceMetaData>>
	}

	public async updatePartInstance(
		part: 'current' | 'next',
		props: Partial<IBlueprintMutatablePart>
	): Promise<IBlueprintPartInstance> {
		this.modifiedParts.add(part)
		return this.coreContext.updatePartInstance(part, props)
	}

	public async updatePieceInstance(
		pieceInstanceId: string,
		piece: Partial<IBlueprintPiece<PieceMetaData>>
	): Promise<IBlueprintPieceInstance<PieceMetaData>> {
		const currentPieceInstances = await this.coreContext.getPieceInstances('current')
		if (currentPieceInstances.map(p => p._id).includes(pieceInstanceId)) {
			this.modifiedParts.add('current')
		} else {
			const nextPieceInstances = await this.coreContext.getPieceInstances('next')
			if (nextPieceInstances.map(p => p._id).includes(pieceInstanceId)) {
				this.modifiedParts.add('next')
			}
		}

		// Regardless of above, let core handle errors
		return this.coreContext.updatePieceInstance(pieceInstanceId, piece) as Promise<
			IBlueprintPieceInstance<PieceMetaData>
		>
	}

	/**
	 * Call this when the context is finished with.
	 * After this, no further calls can be made.
	 */
	public async afterActions() {
		for (const part of this.modifiedParts) {
			await this.markPartAsModifiedByAction(part)
		}
	}

	public blockTakeUntil(time: Time | null): Promise<void> {
		return this.coreContext.blockTakeUntil(time)
	}

	public notifyUserInfo(message: string, params?: { [p: string]: any }): void {
		this.coreContext.notifyUserInfo(message, params)
	}

	private async markPartAsModifiedByAction(part: 'current' | 'next') {
		const partInstance = await this.coreContext.getPartInstance(part)
		if (!partInstance) {
			return
		}

		if (!partInstance.part.metaData) {
			partInstance.part.metaData = {}
		}

		await this.coreContext.updatePartInstance(part, {
			metaData: literal<PartMetaData>({ ...(partInstance.part.metaData as PartMetaData), dirty: true })
		})
	}
}

export async function executeWithContext(
	coreContext: IActionExecutionContext,
	func: (context: ITV2ActionExecutionContext) => Promise<void>
) {
	const context = new TV2ActionExecutionContext(coreContext)
	await func(context)
	await context.afterActions()
}
