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
import { ITV2ActionExecutionContext } from './context'

export class CoreActionExecutionContext implements ITV2ActionExecutionContext {
	public studioId: string

	private modifiedParts: Set<'current' | 'next'> = new Set()

	constructor(readonly core: IActionExecutionContext) {
		this.studioId = core.studioId
	}

	public async getPartInstance(part: 'current' | 'next'): Promise<IBlueprintPartInstance<unknown> | undefined> {
		return this.core.getPartInstance(part)
	}

	public async getPieceInstances(part: 'current' | 'next'): Promise<Array<IBlueprintPieceInstance<PieceMetaData>>> {
		return this.core.getPieceInstances(part) as Promise<Array<IBlueprintPieceInstance<PieceMetaData>>>
	}

	public async getResolvedPieceInstances(
		part: 'current' | 'next'
	): Promise<Array<IBlueprintResolvedPieceInstance<PieceMetaData>>> {
		return this.core.getResolvedPieceInstances(part) as Promise<Array<IBlueprintResolvedPieceInstance<PieceMetaData>>>
	}

	public async findLastPieceOnLayer(
		sourceLayerId: string | string[],
		options?: {
			excludeCurrentPart?: boolean
			originalOnly?: boolean
			pieceMetaDataFilter?: any
		}
	): Promise<IBlueprintPieceInstance<PieceMetaData> | undefined> {
		return this.core.findLastPieceOnLayer(sourceLayerId, options) as Promise<
			IBlueprintPieceInstance<PieceMetaData> | undefined
		>
	}

	public async findLastScriptedPieceOnLayer(
		sourceLayerId: string | string[],
		options?: { excludeCurrentPart?: boolean; pieceMetaDataFilter?: any }
	): Promise<IBlueprintPiece<PieceMetaData> | undefined> {
		return this.core.findLastScriptedPieceOnLayer(sourceLayerId, options) as Promise<
			IBlueprintPiece<PieceMetaData> | undefined
		>
	}

	public async getPartInstanceForPreviousPiece(
		piece: IBlueprintPieceInstance<PieceMetaData>
	): Promise<IBlueprintPartInstance<unknown>> {
		return this.core.getPartInstanceForPreviousPiece(piece)
	}

	public async getPartForPreviousPiece(
		piece: IBlueprintPieceDB<PieceMetaData>
	): Promise<IBlueprintPart<unknown> | undefined> {
		return this.core.getPartForPreviousPiece(piece)
	}

	public async stopPiecesOnLayers(sourceLayerIds: string[], timeOffset?: number): Promise<string[]> {
		return this.core.stopPiecesOnLayers(sourceLayerIds, timeOffset)
	}

	public async stopPieceInstances(pieceInstanceIds: string[], timeOffset?: number): Promise<string[]> {
		return this.core.stopPieceInstances(pieceInstanceIds, timeOffset)
	}

	public async takeAfterExecuteAction(take: boolean): Promise<boolean> {
		return this.core.takeAfterExecuteAction(take)
	}

	public notifyUserError(message: string, params?: { [key: string]: any }): void {
		return this.core.notifyUserError(message, params)
	}

	public notifyUserWarning(message: string, params?: { [key: string]: any }): void {
		return this.core.notifyUserWarning(message, params)
	}

	public getHashId(originString: string, originIsNotUnique?: boolean | undefined) {
		return this.core.getHashId(originString, originIsNotUnique)
	}

	public unhashId(hash: string) {
		return this.core.unhashId(hash)
	}

	public logDebug(message: string) {
		return this.core.logDebug(message)
	}

	public logInfo(message: string) {
		return this.core.logInfo(message)
	}

	public logWarning(message: string) {
		return this.core.logWarning(message)
	}

	public logError(message: string) {
		return this.core.logError(message)
	}

	public getShowStyleConfig(): unknown {
		return this.core.getShowStyleConfig()
	}

	public getShowStyleConfigRef(configKey: string): string {
		return this.core.getShowStyleConfigRef(configKey)
	}

	public getStudioConfig(): unknown {
		return this.core.getStudioConfig()
	}

	public getStudioConfigRef(configKey: string): string {
		return this.core.getShowStyleConfigRef(configKey)
	}

	public getStudioMappings(): Readonly<BlueprintMappings> {
		return this.core.getStudioMappings()
	}

	public getPackageInfo(packageId: string): readonly PackageInfo.Any[] {
		return this.core.getPackageInfo(packageId)
	}

	public async hackGetMediaObjectDuration(mediaId: string): Promise<number | undefined> {
		return this.core.hackGetMediaObjectDuration(mediaId)
	}

	public getCurrentTime(): number {
		return this.core.getCurrentTime()
	}

	public async moveNextPart(partDelta: number, segmentDelta: number): Promise<void> {
		this.modifiedParts.add('next')

		return this.core.moveNextPart(partDelta, segmentDelta)
	}

	public async queuePart(
		rawPart: IBlueprintPart,
		rawPieces: Array<IBlueprintPiece<PieceMetaData>>
	): Promise<IBlueprintPartInstance> {
		this.modifiedParts.add('next')

		return this.core.queuePart(rawPart, rawPieces)
	}

	public async removePieceInstances(part: 'next', pieceInstanceIds: string[]): Promise<string[]> {
		this.modifiedParts.add('next')

		return this.core.removePieceInstances(part, pieceInstanceIds)
	}

	public async insertPiece(
		part: 'current' | 'next',
		piece: IBlueprintPiece<PieceMetaData>
	): Promise<IBlueprintPieceInstance<PieceMetaData>> {
		this.modifiedParts.add(part)
		return this.core.insertPiece(part, piece) as Promise<IBlueprintPieceInstance<PieceMetaData>>
	}

	public async updatePartInstance(
		part: 'current' | 'next',
		props: Partial<IBlueprintMutatablePart>
	): Promise<IBlueprintPartInstance> {
		this.modifiedParts.add(part)
		return this.core.updatePartInstance(part, props)
	}

	public async updatePieceInstance(
		pieceInstanceId: string,
		piece: Partial<IBlueprintPiece<PieceMetaData>>
	): Promise<IBlueprintPieceInstance<PieceMetaData>> {
		const currentPieceInstances = await this.core.getPieceInstances('current')
		if (currentPieceInstances.map(p => p._id).includes(pieceInstanceId)) {
			this.modifiedParts.add('current')
		} else {
			const nextPieceInstances = await this.core.getPieceInstances('next')
			if (nextPieceInstances.map(p => p._id).includes(pieceInstanceId)) {
				this.modifiedParts.add('next')
			}
		}

		// Regardless of above, let core handle errors
		return this.core.updatePieceInstance(pieceInstanceId, piece) as Promise<IBlueprintPieceInstance<PieceMetaData>>
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
		return this.core.blockTakeUntil(time)
	}

	public notifyUserInfo(message: string, params?: { [p: string]: any }): void {
		this.core.notifyUserInfo(message, params)
	}

	private async markPartAsModifiedByAction(part: 'current' | 'next') {
		const partInstance = await this.core.getPartInstance(part)
		if (!partInstance) {
			return
		}

		if (!partInstance.part.metaData) {
			partInstance.part.metaData = {}
		}

		await this.core.updatePartInstance(part, {
			metaData: literal<PartMetaData>({ ...(partInstance.part.metaData as PartMetaData), dirty: true })
		})
	}
}
