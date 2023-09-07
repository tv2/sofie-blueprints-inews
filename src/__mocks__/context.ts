import * as crypto from 'crypto'
import * as _ from 'underscore'

import {
	BlueprintMappings,
	ConfigItemValue,
	IBlueprintConfig,
	IBlueprintMutatablePart,
	IBlueprintPart,
	IBlueprintPartInstance,
	IBlueprintPiece,
	IBlueprintPieceInstance,
	IBlueprintResolvedPieceInstance,
	IBlueprintRundownDB,
	IBlueprintRundownPlaylist,
	IBlueprintShowStyleVariant,
	ICommonContext,
	IGetRundownContext,
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
	PieceLifespan,
	PlaylistTimingType,
	Time
} from 'blueprints-integration'
import {
	ITV2ActionExecutionContext,
	PieceMetaData,
	SegmentContext,
	TV2StudioConfigBase,
	UniformConfig,
	VideoSwitcherBase
} from 'tv2-common'
import { NoteType } from 'tv2-constants'
import { defaultShowStyleConfig, defaultStudioConfig } from '../tv2_afvd_showstyle/__tests__/configs'
import {
	GalleryBlueprintConfig,
	GalleryShowStyleConfig,
	preprocessConfig as parseShowStyleConfigAFVD
} from '../tv2_afvd_showstyle/helpers/config'
import { preprocessConfig as parseStudioConfigAFVD } from '../tv2_afvd_studio/helpers/config'
import mappingsDefaultsAFVD from '../tv2_afvd_studio/migrations/mappings-defaults'
import { GALLERY_UNIFORM_CONFIG } from '../tv2_afvd_studio/uniformConfig'

function getHash(str: string): string {
	const hash = crypto.createHash('sha1')
	return hash
		.update(str)
		.digest('base64')
		.replace(/[\+\/\=]/gi, '_') // remove +/= from strings, because they cause troubles
}

// tslint:disable: max-classes-per-file
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

	public notifyUserInfo(_message: string, _params?: { [p: string]: any }): void {
		// Do nothing
	}
}

export class StudioContext extends CommonContext implements IStudioContext {
	public studioId: string = 'studio0'
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

export class ShowStyleContextMock extends StudioContext implements IShowStyleContext, IPackageInfoContext {
	public studioConfig: { [key: string]: ConfigItemValue } = {}
	public showStyleConfig: { [key: string]: ConfigItemValue } = {}

	private parseShowStyleConfig: (
		context: ICommonContext,
		config: IBlueprintConfig,
		showStyleVariants: IBlueprintShowStyleVariant[]
	) => any

	constructor(
		contextName: string,
		mappingsDefaults: BlueprintMappings,
		parseStudioConfig: (context: ICommonContext, rawConfig: IBlueprintConfig) => any,
		parseShowStyleConfig: (
			context: ICommonContext,
			config: IBlueprintConfig,
			showStyleVariants: IBlueprintShowStyleVariant[]
		) => any,
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
		return _.clone(this.parseShowStyleConfig(this, this.showStyleConfig, []))
	}
	public getShowStyleConfigRef(_configKey: string): string {
		return 'test'
	}
	public async hackGetMediaObjectDuration(_mediaId: string): Promise<number | undefined> {
		return undefined
	}
}

export class ShowStyleUserContextMock extends ShowStyleContextMock implements IUserNotesContext {
	public notifyUserError(message: string, _params?: { [key: string]: any }): void {
		this.pushNote(NoteType.NOTIFY_USER_ERROR, message)
	}
	public notifyUserWarning(message: string, _params?: { [key: string]: any }): void {
		this.pushNote(NoteType.NOTIFY_USER_WARNING, message)
	}

	public notifyUserInfo(_message: string, _params?: { [p: string]: any }): void {
		// Do nothing
	}
}

export class GetRundownContextMock extends ShowStyleUserContextMock implements IGetRundownContext {
	public async getCurrentPlaylist(): Promise<Readonly<IBlueprintRundownPlaylist> | undefined> {
		return undefined
	}

	public async getPlaylists(): Promise<Readonly<IBlueprintRundownPlaylist[]>> {
		return []
	}

	public getRandomId(): string {
		return ''
	}
}

export class RundownContextMock extends ShowStyleContextMock implements IRundownContext {
	public readonly rundownId: string = 'rundown0'
	public readonly rundown: Readonly<IBlueprintRundownDB>

	constructor(
		contextName: string,
		mappingsDefaults: BlueprintMappings,
		parseStudioConfig: (context: ICommonContext, rawConfig: IBlueprintConfig) => any,
		parseShowStyleConfig: (
			context: ICommonContext,
			config: IBlueprintConfig,
			showStyleVariants: IBlueprintShowStyleVariant[]
		) => any,
		rundownId?: string,
		segmentId?: string,
		partId?: string
	) {
		super(contextName, mappingsDefaults, parseStudioConfig, parseShowStyleConfig, rundownId, segmentId, partId)
		this.rundownId = rundownId ?? this.rundownId
		this.rundown = {
			_id: this.rundownId,
			externalId: this.rundownId,
			name: this.rundownId,
			timing: {
				type: PlaylistTimingType.None
			},
			showStyleVariantId: 'variant0'
		}
	}
}

export class RundownUserContextMock extends RundownContextMock implements IRundownUserContext {
	public notifyUserError(message: string, _params?: { [key: string]: any }): void {
		this.pushNote(NoteType.NOTIFY_USER_ERROR, message)
	}
	public notifyUserWarning(message: string, _params?: { [key: string]: any }): void {
		this.pushNote(NoteType.NOTIFY_USER_WARNING, message)
	}

	public notifyUserInfo(_message: string, _params?: { [p: string]: any }): void {
		// Do nothing
	}
}

export class SegmentUserContextMock extends RundownContextMock implements ISegmentUserContext {
	constructor(
		contextName: string,
		mappingsDefaults: BlueprintMappings,
		parseStudioConfig: (context: ICommonContext, rawConfig: IBlueprintConfig) => any,
		parseShowStyleConfig: (
			context: ICommonContext,
			config: IBlueprintConfig,
			showStyleVariants: IBlueprintShowStyleVariant[]
		) => any,
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
	public async hackGetMediaObjectDuration(_mediaId: string): Promise<number | undefined> {
		return undefined
	}
	public getPackageInfo(_packageId: string): readonly PackageInfo.Any[] {
		return []
	}

	public notifyUserInfo(_message: string, _params?: { [p: string]: any }): void {
		// Do nothing
	}
}

export class SyncIngestUpdateToPartInstanceContextMock
	extends RundownUserContextMock
	implements ISyncIngestUpdateToPartInstanceContext
{
	public syncedPieceInstances: string[] = []
	public removedPieceInstances: string[] = []
	public updatedPieceInstances: string[] = []
	public updatedPartInstance: IBlueprintPartInstance | undefined

	constructor(
		contextName: string,
		mappingsDefaults: BlueprintMappings,
		parseStudioConfig: (context: ICommonContext, rawConfig: IBlueprintConfig) => any,
		parseShowStyleConfig: (
			context: ICommonContext,
			config: IBlueprintConfig,
			showStyleVariants: IBlueprintShowStyleVariant[]
		) => any,
		rundownId: string,
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
		return {
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
		}
	}
	public insertPieceInstance(piece: IBlueprintPiece<unknown>): IBlueprintPieceInstance<unknown> {
		return {
			_id: '',
			piece: {
				_id: '',
				...piece
			},
			partInstanceId: ''
		}
	}
	public updatePieceInstance(
		pieceInstanceId: string,
		piece: Partial<IBlueprintPiece<unknown>>
	): IBlueprintPieceInstance<unknown> {
		this.updatedPieceInstances.push(pieceInstanceId)
		return {
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
		}
	}
	public removePieceInstances(...pieceInstanceIds: string[]): string[] {
		this.removedPieceInstances.push(...pieceInstanceIds)
		return pieceInstanceIds
	}
	public updatePartInstance(props: Partial<IBlueprintMutatablePart<unknown>>): IBlueprintPartInstance<unknown> {
		this.updatedPartInstance = {
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
		}
		return this.updatedPartInstance
	}

	public notifyUserInfo(_message: string, _params?: { [p: string]: any }): void {
		// Do nothing
	}

	public removePartInstance(): void {
		// Do nothing
	}
}

export class ActionExecutionContextMock extends ShowStyleUserContextMock implements ITV2ActionExecutionContext {
	public currentPart: IBlueprintPartInstance
	public currentPieceInstances: Array<IBlueprintPieceInstance<PieceMetaData>>
	public nextPart: IBlueprintPartInstance | undefined
	public nextPieceInstances: Array<IBlueprintPieceInstance<PieceMetaData>> | undefined

	public takeAfterExecute: boolean = false

	constructor(
		contextName: string,
		mappingsDefaults: BlueprintMappings,
		parseStudioConfig: (context: ICommonContext, rawConfig: IBlueprintConfig) => any,
		parseShowStyleConfig: (
			context: ICommonContext,
			config: IBlueprintConfig,
			showStyleVariants: IBlueprintShowStyleVariant[]
		) => any,
		rundownId: string,
		segmentId: string,
		partId: string,
		currentPart: IBlueprintPartInstance,
		currentPieceInstances: Array<IBlueprintPieceInstance<PieceMetaData>>,
		nextPart?: IBlueprintPartInstance,
		nextPieceInstances?: Array<IBlueprintPieceInstance<PieceMetaData>>
	) {
		super(contextName, mappingsDefaults, parseStudioConfig, parseShowStyleConfig, rundownId, segmentId, partId)

		this.currentPart = currentPart
		this.currentPieceInstances = currentPieceInstances
		this.nextPart = nextPart
		this.nextPieceInstances = nextPieceInstances
	}

	/** Get the mappings for the studio */
	public getStudioMappings = () => {
		throw new Error(`Function not implemented in mock: 'getStudioMappings'`)
	}

	/** Get a PartInstance which can be modified */
	public async getPartInstance(part: 'current' | 'next'): Promise<IBlueprintPartInstance | undefined> {
		if (part === 'current') {
			return this.currentPart
		}
		return this.nextPart
	}
	/** Get the PieceInstances for a modifiable PartInstance */
	public async getPieceInstances(part: 'current' | 'next'): Promise<Array<IBlueprintPieceInstance<PieceMetaData>>> {
		if (part === 'current') {
			return this.currentPieceInstances
		}

		return this.nextPieceInstances || []
	}
	/** Get the resolved PieceInstances for a modifiable PartInstance */
	public async getResolvedPieceInstances(
		part: 'current' | 'next'
	): Promise<Array<IBlueprintResolvedPieceInstance<PieceMetaData>>> {
		const pieces = part === 'current' ? this.currentPieceInstances : this.nextPieceInstances ?? []
		const now = Date.now()
		// this is nowhere near to what core does; we should reconsider the way we're mocking this context
		return pieces.map((pieceInstance) => {
			const pieceStart = pieceInstance.piece.enable.start
			const resolvedStart = pieceStart === 'now' ? now : pieceStart

			return {
				...pieceInstance,
				resolvedStart
			}
		})
	}
	/** Get the last active piece on given layer */
	public async findLastPieceOnLayer(
		_sourceLayerId: string,
		_options?: {
			excludeCurrentPart?: boolean
			originalOnly?: boolean
			pieceMetaDataFilter?: any
		}
	): Promise<IBlueprintPieceInstance<PieceMetaData> | undefined> {
		return undefined
	}
	public async findLastScriptedPieceOnLayer(
		_sourceLayerId: string,
		_options?: {
			excludeCurrentPart?: boolean
			pieceMetaDataFilter?: any
		}
	): Promise<IBlueprintPiece<PieceMetaData> | undefined> {
		return undefined
	}
	public async getPartInstanceForPreviousPiece(_piece: IBlueprintPieceInstance): Promise<IBlueprintPartInstance> {
		return {
			_id: '',
			segmentId: '',
			part: {
				_id: '',
				segmentId: '',
				externalId: '',
				title: ''
			},
			rehearsal: false
		}
	}
	public async getPartForPreviousPiece(_piece: { _id: string }): Promise<IBlueprintPart | undefined> {
		return undefined
	}
	/** Creative actions */
	/** Insert a piece. Returns id of new PieceInstance. Any timelineObjects will have their ids changed, so are not safe to reference from another piece */
	public async insertPiece(
		part: 'current' | 'next',
		piece: IBlueprintPiece<PieceMetaData>
	): Promise<IBlueprintPieceInstance<PieceMetaData>> {
		const pieceInstance: IBlueprintPieceInstance<PieceMetaData> = {
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
	public async updatePieceInstance(
		_pieceInstanceId: string,
		piece: Partial<OmitId<IBlueprintPiece>>
	): Promise<IBlueprintPieceInstance<PieceMetaData>> {
		return {
			_id: '',
			piece: {
				_id: '',
				...(piece as IBlueprintPiece<PieceMetaData>)
			},
			partInstanceId: ''
		}
	}
	/** Insert a queued part to follow the current part */
	public async queuePart(
		part: IBlueprintPart,
		pieces: Array<IBlueprintPiece<PieceMetaData>>
	): Promise<IBlueprintPartInstance> {
		const instance: IBlueprintPartInstance = {
			_id: '',
			segmentId: this.notesSegmentId || '',
			part: {
				_id: '',
				...part,
				segmentId: this.notesSegmentId || ''
			},
			rehearsal: false
		}

		this.nextPart = instance
		this.nextPieceInstances = pieces.map<IBlueprintPieceInstance<PieceMetaData>>((p) => ({
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
	public async updatePartInstance(
		part: 'current' | 'next',
		props: Partial<IBlueprintMutatablePart>
	): Promise<IBlueprintPartInstance> {
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
	public async stopPiecesOnLayers(_sourceLayerIds: string[], _timeOffset?: number): Promise<string[]> {
		return []
	}
	/** Stop piecesInstances by id. Returns ids of piecesInstances that were removed */
	public async stopPieceInstances(_pieceInstanceIds: string[], _timeOffset?: number): Promise<string[]> {
		return []
	}
	/** Remove piecesInstances by id. Returns ids of piecesInstances that were removed */
	public async removePieceInstances(part: 'current' | 'next', pieceInstanceIds: string[]): Promise<string[]> {
		if (part === 'current') {
			this.currentPieceInstances = this.currentPieceInstances.filter((p) => !pieceInstanceIds.includes(p._id))
		} else if (this.nextPieceInstances) {
			this.nextPieceInstances = this.nextPieceInstances.filter((p) => !pieceInstanceIds.includes(p._id))
		}

		return pieceInstanceIds
	}
	public async moveNextPart(_partDelta: number, _segmentDelta: number): Promise<void> {
		throw new Error('Method not implemented.')
	}
	/** Set flag to perform take after executing the current action. Returns state of the flag after each call. */
	public async takeAfterExecuteAction(take: boolean): Promise<boolean> {
		this.takeAfterExecute = take

		return take
	}
	public async hackGetMediaObjectDuration(_mediaId: string): Promise<number | undefined> {
		return undefined
	}
	public getPackageInfo(_packageId: string): PackageInfo.Any[] {
		return []
	}
	public getCurrentTime(): number {
		throw new Error('Method not implemented.')
	}

	public async blockTakeUntil(_time: Time | null): Promise<void> {
		return undefined
	}

	public notifyUserInfo(_message: string, _params?: { [p: string]: any }): void {
		// Do nothing
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

export interface MockConfigOverrides {
	studioConfig?: Partial<TV2StudioConfigBase>
	showStyleConfig?: Partial<GalleryShowStyleConfig>
	mappingDefaults?: BlueprintMappings
	uniformConfig?: Partial<UniformConfig>
}

export function makeMockCoreGalleryContext(overrides?: MockConfigOverrides) {
	const mockCoreContext = new SegmentUserContextMock(
		'test',
		{ ...mappingsDefaultsAFVD, ...overrides?.mappingDefaults },
		parseStudioConfigAFVD,
		parseShowStyleConfigAFVD
	)
	mockCoreContext.studioConfig = { ...defaultStudioConfig, ...overrides?.studioConfig } as any
	mockCoreContext.showStyleConfig = { ...defaultShowStyleConfig, ...overrides?.showStyleConfig } as any
	return mockCoreContext
}

export function makeMockGalleryContext(overrides?: MockConfigOverrides) {
	const mockCoreContext = makeMockCoreGalleryContext(overrides)
	const config = { ...mockCoreContext.getStudioConfig(), ...(mockCoreContext.getShowStyleConfig() as any) }
	const mockContext: SegmentContext<GalleryBlueprintConfig> = {
		core: mockCoreContext,
		config,
		uniformConfig: { ...GALLERY_UNIFORM_CONFIG, ...overrides?.uniformConfig },
		videoSwitcher: VideoSwitcherBase.getVideoSwitcher(mockCoreContext, config, GALLERY_UNIFORM_CONFIG) // new MockVideoSwitcher()
	}
	return mockContext
}
