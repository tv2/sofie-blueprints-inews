import {
	IActionExecutionContext,
	IBlueprintMutatablePart,
	IBlueprintPart,
	IBlueprintPartInstance,
	IBlueprintPiece,
	IBlueprintPieceDB,
	IBlueprintPieceInstance,
	IBlueprintResolvedPieceInstance
} from 'blueprints-integration'
import { PieceMetaData, ShowStyleContextImpl, TV2ShowStyleConfig, UniformConfig } from 'tv2-common'
import { CoreActionExecutionContext } from './CoreActionExecutionContext'

export interface ITV2ActionExecutionContext extends IActionExecutionContext {
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

export class ActionExecutionContext<
	BlueprintConfig extends TV2ShowStyleConfig = TV2ShowStyleConfig
> extends ShowStyleContextImpl<BlueprintConfig> {
	constructor(readonly core: CoreActionExecutionContext, uniformConfig: UniformConfig) {
		super(core, uniformConfig)
		this.core = core
	}
}

export async function executeWithContext<BlueprintConfig extends TV2ShowStyleConfig>(
	coreContext: IActionExecutionContext,
	uniformConfig: UniformConfig,
	func: (context: ActionExecutionContext<BlueprintConfig>) => Promise<void>
): Promise<void> {
	const coreContextWrapped = new CoreActionExecutionContext(coreContext)
	const context = new ActionExecutionContext<BlueprintConfig>(coreContextWrapped, uniformConfig)
	await func(context)
	await coreContextWrapped.afterActions()
}
