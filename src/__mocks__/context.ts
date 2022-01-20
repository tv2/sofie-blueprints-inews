import * as crypto from 'crypto'
import * as _ from 'underscore'

import {
	BlueprintMappings,
	ConfigItemValue,
	IActionExecutionContext,
	IBlueprintConfig,
	IBlueprintMutatablePart,
	IBlueprintPart,
	IBlueprintPartInstance,
	IBlueprintPiece,
	IBlueprintPieceInstance,
	IBlueprintResolvedPieceInstance,
	IBlueprintRundownDB,
	ICommonContext,
	IPackageInfoContext,
	IRundownContext,
	IRundownUserContext,
	ISegmentUserContext,
	IShowStyleContext,
	IStudioContext,
	ISyncIngestUpdateToPartInstanceContext,
	IUserNotesContext,
	OmitId,
	PackageInfo,
	PieceLifespan
} from '@tv2media/blueprints-integration'
import { literal } from 'tv2-common'
import { NoteType } from 'tv2-constants'

export function getHash(str: string): string {
	const hash = crypto.createHash('sha1')
	return hash
		.update(str)
		.digest('base64')
		.replace(/[\+\/\=]/gi, '_') // remove +/= from strings, because they cause troubles
}

// tslint:disable-next-line: max-classes-per-file
export class CommonContext implements ICommonContext {
	protected savedNotes: PartNote[] = []
	protected notesRundownId?: string
	protected notesSegmentId?: string
	protected notesPartId?: string
	private contextName: string
	private hashI = 0
	private hashed: { [hash: string]: string } = {}

	constructor(contextName: string, rundownId?: string, segmentId?: string, partId?: string) {
		this.contextName = contextName
		this.notesRundownId = rundownId
		this.notesSegmentId = segmentId
		this.notesPartId = partId
	}
	public logDebug(message: string) {
		this.pushNote(NoteType.DEBUG, message)
	}
	public logInfo(message: string) {
		this.pushNote(NoteType.INFO, message)
	}
	public logWarning(message: string) {
		this.pushNote(NoteType.WARNING, message)
	}
	public logError(message: string) {
		this.pushNote(NoteType.ERROR, message)
	}
	public getHashId(str?: any) {
		if (!str) {
			str = 'hash' + this.hashI++
		}

		let id
		id = getHash(this.contextName + '_' + str.toString())
		this.hashed[id] = str
		return id
		// return Random.id()
	}
	public unhashId(hash: string): string {
		return this.hashed[hash] || hash
	}

	public getNotes() {
		return this.savedNotes
	}

	protected pushNote(type: NoteType, message: string) {
		this.savedNotes.push({
			type,
			origin: {
				name: this.contextName,
				roId: this.notesRundownId,
				segmentId: this.notesSegmentId,
				partId: this.notesPartId
			},
			message
		})
	}
}

// tslint:disable-next-line: max-classes-per-file
export class UserNotesContext extends CommonContext implements IUserNotesContext {
	constructor(contextName: string, rundownId?: string, segmentId?: string, partId?: string) {
		super(contextName, rundownId, segmentId, partId)
	}

	public notifyUserError(message: string, _params?: { [key: string]: any }): void {
		this.pushNote(NoteType.NOTIFY_USER_ERROR, message)
	}
	public notifyUserWarning(message: string, _params?: { [key: string]: any }): void {
		this.pushNote(NoteType.NOTIFY_USER_WARNING, message)
	}
}

// tslint:disable-next-line: max-classes-per-file
export class StudioContext extends CommonContext implements IStudioContext {
	public studioId: string
	public studioConfig: { [key: string]: ConfigItemValue } = {}
	public showStyleConfig: { [key: string]: ConfigItemValue } = {}

	private mappingsDefaults: BlueprintMappings
	private parseStudioConfig: (context: ICommonContext, rawConfig: IBlueprintConfig) => any

	constructor(
		contextName: string,
		mappingsDefaults: BlueprintMappings,
		parseStudioConfig: (context: ICommonContext, rawConfig: IBlueprintConfig) => any,
		rundownId?: string,
		segmentId?: string,
		partId?: string
	) {
		super(contextName, rundownId, segmentId, partId)
		this.mappingsDefaults = mappingsDefaults
		this.parseStudioConfig = parseStudioConfig
	}

	public getStudioConfig() {
		return _.clone(this.parseStudioConfig(this, this.studioConfig))
	}
	public getStudioConfigRef(_configKey: string): string {
		return 'test'
	}
	public getStudioMappings() {
		return _.clone(this.mappingsDefaults)
	}
}

// tslint:disable-next-line: max-classes-per-file
export class ShowStyleContext extends StudioContext implements IShowStyleContext, IPackageInfoContext {
	public studioConfig: { [key: string]: ConfigItemValue } = {}
	public showStyleConfig: { [key: string]: ConfigItemValue } = {}

	private parseShowStyleConfig: (context: ICommonContext, config: IBlueprintConfig) => any

	constructor(
		contextName: string,
		mappingsDefaults: BlueprintMappings,
		parseStudioConfig: (context: ICommonContext, rawConfig: IBlueprintConfig) => any,
		parseShowStyleConfig: (context: ICommonContext, config: IBlueprintConfig) => any,
		rundownId?: string,
		segmentId?: string,
		partId?: string
	) {
		super(contextName, mappingsDefaults, parseStudioConfig, rundownId, segmentId, partId)
		this.parseShowStyleConfig = parseShowStyleConfig
	}
	public getPackageInfo(_packageId: string): readonly PackageInfo.Any[] {
		return []
	}

	public getShowStyleConfig() {
		return _.clone(this.parseShowStyleConfig(this, this.showStyleConfig))
	}
	public getShowStyleConfigRef(_configKey: string): string {
		return 'test'
	}
	public hackGetMediaObjectDuration(_mediaId: string) {
		return undefined
	}
}

// tslint:disable-next-line: max-classes-per-file
export class ShowStyleUserContext extends ShowStyleContext implements IUserNotesContext {
	public notifyUserError(message: string, _params?: { [key: string]: any }): void {
		this.pushNote(NoteType.NOTIFY_USER_ERROR, message)
	}
	public notifyUserWarning(message: string, _params?: { [key: string]: any }): void {
		this.pushNote(NoteType.NOTIFY_USER_WARNING, message)
	}
}

// tslint:disable-next-line: max-classes-per-file
export class RundownContext extends ShowStyleContext implements IRundownContext {
	public readonly rundownId: string
	public readonly rundown: Readonly<IBlueprintRundownDB>

	constructor(
		contextName: string,
		mappingsDefaults: BlueprintMappings,
		parseStudioConfig: (context: ICommonContext, rawConfig: IBlueprintConfig) => any,
		parseShowStyleConfig: (context: ICommonContext, config: IBlueprintConfig) => any,
		rundownId?: string,
		segmentId?: string,
		partId?: string
	) {
		super(contextName, mappingsDefaults, parseStudioConfig, parseShowStyleConfig, rundownId, segmentId, partId)
	}
}

// tslint:disable-next-line: max-classes-per-file
export class RundownUserContext extends RundownContext implements IRundownUserContext {
	public notifyUserError(message: string, _params?: { [key: string]: any }): void {
		this.pushNote(NoteType.NOTIFY_USER_ERROR, message)
	}
	public notifyUserWarning(message: string, _params?: { [key: string]: any }): void {
		this.pushNote(NoteType.NOTIFY_USER_WARNING, message)
	}
}

// tslint:disable-next-line: max-classes-per-file
export class SegmentUserContext extends RundownContext implements ISegmentUserContext {
	constructor(
		contextName: string,
		mappingsDefaults: BlueprintMappings,
		parseStudioConfig: (context: ICommonContext, rawConfig: IBlueprintConfig) => any,
		parseShowStyleConfig: (context: ICommonContext, config: IBlueprintConfig) => any,
		rundownId?: string,
		segmentId?: string,
		partId?: string
	) {
		super(contextName, mappingsDefaults, parseStudioConfig, parseShowStyleConfig, rundownId, segmentId, partId)
	}

	public notifyUserError(
		message: string,
		_params?: { [key: string]: any } | undefined,
		_partExternalId?: string | undefined
	) {
		this.pushNote(NoteType.NOTIFY_USER_ERROR, message)
	}
	public notifyUserWarning(
		message: string,
		_params?: { [key: string]: any } | undefined,
		_partExternalId?: string | undefined
	) {
		this.pushNote(NoteType.NOTIFY_USER_WARNING, message)
	}
	public hackGetMediaObjectDuration(_mediaId: string) {
		return undefined
	}
	public getPackageInfo(_packageId: string): readonly PackageInfo.Any[] {
		return []
	}
}

// tslint:disable-next-line: max-classes-per-file
export class SyncIngestUpdateToPartInstanceContext extends RundownUserContext
	implements ISyncIngestUpdateToPartInstanceContext {
	public syncedPieceInstances: string[] = []
	public removedPieceInstances: string[] = []
	public updatedPieceInstances: string[] = []
	public updatedPartInstance: IBlueprintPartInstance | undefined

	constructor(
		contextName: string,
		mappingsDefaults: BlueprintMappings,
		parseStudioConfig: (context: ICommonContext, rawConfig: IBlueprintConfig) => any,
		parseShowStyleConfig: (context: ICommonContext, config: IBlueprintConfig) => any,
		rundownId?: string,
		segmentId?: string,
		partId?: string
	) {
		super(contextName, mappingsDefaults, parseStudioConfig, parseShowStyleConfig, rundownId, segmentId, partId)
	}

	public syncPieceInstance(
		pieceInstanceId: string,
		mutatedPiece?: Omit<IBlueprintPiece<unknown>, 'lifespan'>
	): IBlueprintPieceInstance<unknown> {
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
				...mutatedPiece,
				content: mutatedPiece?.content ?? { timelineObjects: [] }
			},
			partInstanceId: ''
		})
	}
	public insertPieceInstance(piece: IBlueprintPiece<unknown>): IBlueprintPieceInstance<unknown> {
		return literal<IBlueprintPieceInstance>({
			_id: '',
			piece: {
				_id: '',
				...piece
			},
			partInstanceId: ''
		})
	}
	public updatePieceInstance(
		pieceInstanceId: string,
		piece: Partial<IBlueprintPiece<unknown>>
	): IBlueprintPieceInstance<unknown> {
		this.updatedPieceInstances.push(pieceInstanceId)
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
				...piece,
				content: piece.content ?? { timelineObjects: [] }
			},
			partInstanceId: ''
		})
	}
	public removePieceInstances(...pieceInstanceIds: string[]): string[] {
		this.removedPieceInstances.push(...pieceInstanceIds)
		return pieceInstanceIds
	}
	public updatePartInstance(props: Partial<IBlueprintMutatablePart<unknown>>): IBlueprintPartInstance<unknown> {
		this.updatedPartInstance = literal<IBlueprintPartInstance>({
			_id: '',
			segmentId: '',
			part: {
				_id: '',
				segmentId: '',
				externalId: '',
				title: '',
				...props
			},
			rehearsal: false
		})
		return this.updatedPartInstance
	}
}

// tslint:disable-next-line: max-classes-per-file
export class ActionExecutionContext extends ShowStyleUserContext implements IActionExecutionContext {
	public currentPart: IBlueprintPartInstance
	public currentPieceInstances: IBlueprintPieceInstance[]
	public nextPart: IBlueprintPartInstance | undefined
	public nextPieceInstances: IBlueprintPieceInstance[] | undefined

	public takeAfterExecute: boolean = false

	/** Get the mappings for the studio */
	public getStudioMappings: () => Readonly<BlueprintMappings>

	constructor(
		contextName: string,
		mappingsDefaults: BlueprintMappings,
		parseStudioConfig: (context: ICommonContext, rawConfig: IBlueprintConfig) => any,
		parseShowStyleConfig: (context: ICommonContext, config: IBlueprintConfig) => any,
		rundownId: string,
		segmentId: string,
		partId: string,
		currentPart: IBlueprintPartInstance,
		currentPieceInstances: IBlueprintPieceInstance[],
		nextPart?: IBlueprintPartInstance,
		nextPieceInstances?: IBlueprintPieceInstance[]
	) {
		super(contextName, mappingsDefaults, parseStudioConfig, parseShowStyleConfig, rundownId, segmentId, partId)

		this.currentPart = currentPart
		this.currentPieceInstances = currentPieceInstances
		this.nextPart = nextPart
		this.nextPieceInstances = nextPieceInstances
	}

	/** Get a PartInstance which can be modified */
	public getPartInstance(part: 'current' | 'next'): IBlueprintPartInstance | undefined {
		if (part === 'current') {
			return this.currentPart
		}
		return this.nextPart
	}
	/** Get the PieceInstances for a modifiable PartInstance */
	public getPieceInstances(part: 'current' | 'next'): IBlueprintPieceInstance[] {
		if (part === 'current') {
			return this.currentPieceInstances
		}

		return this.nextPieceInstances || []
	}
	/** Get the resolved PieceInstances for a modifiable PartInstance */
	public getResolvedPieceInstances(_part: 'current' | 'next'): IBlueprintResolvedPieceInstance[] {
		return []
	}
	/** Get the last active piece on given layer */
	public findLastPieceOnLayer(
		_sourceLayerId: string,
		_options?: {
			excludeCurrentPart?: boolean
			originalOnly?: boolean
			pieceMetaDataFilter?: any
		}
	): IBlueprintPieceInstance | undefined {
		return undefined
	}
	public findLastScriptedPieceOnLayer(
		_sourceLayerId: string,
		_options?: {
			excludeCurrentPart?: boolean
			pieceMetaDataFilter?: any
		}
	): IBlueprintPiece | undefined {
		return undefined
	}
	public getPartInstanceForPreviousPiece(_piece: IBlueprintPieceInstance): IBlueprintPartInstance {
		return literal<IBlueprintPartInstance>({
			_id: '',
			segmentId: '',
			part: {
				_id: '',
				segmentId: '',
				externalId: '',
				title: ''
			},
			rehearsal: false
		})
	}
	public getPartForPreviousPiece(_piece: { _id: string }): IBlueprintPart | undefined {
		return
	}
	/** Creative actions */
	/** Insert a piece. Returns id of new PieceInstance. Any timelineObjects will have their ids changed, so are not safe to reference from another piece */
	public insertPiece(part: 'current' | 'next', piece: IBlueprintPiece): IBlueprintPieceInstance {
		const pieceInstance: IBlueprintPieceInstance = {
			_id: '',
			piece: {
				_id: '',
				...piece
			},
			partInstanceId: ''
		}
		if (part === 'current') {
			this.currentPieceInstances.push(pieceInstance)
		} else {
			if (this.nextPart && this.nextPieceInstances) {
				this.nextPieceInstances.push(pieceInstance)
			}
		}
		return pieceInstance
	}
	/** Update a pieceInstance */
	public updatePieceInstance(
		_pieceInstanceId: string,
		piece: Partial<OmitId<IBlueprintPiece>>
	): IBlueprintPieceInstance {
		return {
			_id: '',
			piece: {
				_id: '',
				...(piece as IBlueprintPiece)
			},
			partInstanceId: ''
		}
	}
	/** Insert a queued part to follow the current part */
	public queuePart(part: IBlueprintPart, pieces: IBlueprintPiece[]): IBlueprintPartInstance {
		const instance = literal<IBlueprintPartInstance>({
			_id: '',
			segmentId: this.notesSegmentId || '',
			part: {
				_id: '',
				...part,
				segmentId: this.notesSegmentId || ''
			},
			rehearsal: false
		})

		this.nextPart = instance
		this.nextPieceInstances = pieces.map<IBlueprintPieceInstance>(p => ({
			_id: (Date.now() * Math.random()).toString(),
			piece: {
				_id: '',
				...p
			},
			partInstanceId: instance._id
		}))

		return instance
	}
	/** Update a partInstance */
	public updatePartInstance(part: 'current' | 'next', props: Partial<IBlueprintMutatablePart>): IBlueprintPartInstance {
		if (part === 'current') {
			this.currentPart.part = { ...this.currentPart.part, ...props }
			return this.currentPart
		} else if (this.nextPart) {
			this.nextPart.part = { ...this.nextPart.part, ...props }
			return this.nextPart
		}

		throw new Error(`MOCK ACTION EXECTUION CONTEXT: Could not update part instance: ${part}`)
	}
	/** Destructive actions */
	/** Stop any piecesInstances on the specified sourceLayers. Returns ids of piecesInstances that were affected */
	public stopPiecesOnLayers(_sourceLayerIds: string[], _timeOffset?: number): string[] {
		return []
	}
	/** Stop piecesInstances by id. Returns ids of piecesInstances that were removed */
	public stopPieceInstances(_pieceInstanceIds: string[], _timeOffset?: number): string[] {
		return []
	}
	/** Remove piecesInstances by id. Returns ids of piecesInstances that were removed */
	public removePieceInstances(part: 'current' | 'next', pieceInstanceIds: string[]): string[] {
		if (part === 'current') {
			this.currentPieceInstances = this.currentPieceInstances.filter(p => !pieceInstanceIds.includes(p._id))
		} else if (this.nextPieceInstances) {
			this.nextPieceInstances = this.nextPieceInstances.filter(p => !pieceInstanceIds.includes(p._id))
		}

		return pieceInstanceIds
	}
	public moveNextPart(_partDelta: number, _segmentDelta: number): void {
		throw new Error('Method not implemented.')
	}
	/** Set flag to perform take after executing the current action. Returns state of the flag after each call. */
	public takeAfterExecuteAction(take: boolean): boolean {
		this.takeAfterExecute = take

		return take
	}
	public hackGetMediaObjectDuration(_mediaId: string) {
		return undefined
	}
	public getPackageInfo(_packageId: string): PackageInfo.Any[] {
		return []
	}
	public getCurrentTime(): number {
		throw new Error('Method not implemented.')
	}
}

export interface PartNote {
	type: NoteType
	origin: {
		name: string
		roId?: string
		segmentId?: string
		partId?: string
		pieceId?: string
	}
	message: string
}
