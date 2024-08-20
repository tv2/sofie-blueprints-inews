import {
	IBlueprintPartDB,
	IBlueprintPartInstance,
	IBlueprintPieceInstance,
	PieceLifespan,
	TSR
} from 'blueprints-integration'
import {
	ActionCommentatorSelectDVE,
	ActionCutToCamera,
	ActionCutToRemote,
	ActionSelectDVE,
	ActionSelectFullGrafik,
	ActionSelectServerClip,
	ActionTakeWithTransition,
	literal,
	PartDefinitionUnknown,
	PieceMetaData,
	RemoteType,
	SourceDefinitionKam,
	SourceDefinitionRemote
} from 'tv2-common'
import {
	AdlibActionType,
	CueType,
	NoteType,
	PartType,
	SharedSourceLayer,
	SourceType,
	SwitcherMixEffectLLayer
} from 'tv2-constants'
import { ActionExecutionContextMock } from '../../__mocks__/context'
import { prefixLayer } from '../../tv2-common/__tests__/testUtil'
import { defaultShowStyleConfig, defaultStudioConfig } from '../../tv2_afvd_showstyle/__tests__/configs'
import { OfftubeStudioConfig, preprocessConfig as parseStudioConfig } from '../../tv2_offtube_studio/helpers/config'
import mappingsDefaults from '../../tv2_offtube_studio/migrations/mappings-defaults'
import { executeActionOfftube } from '../actions'
import { preprocessConfig as parseShowStyleConfig } from '../helpers/config'
import { OfftubeOutputLayers, OfftubeSourceLayer } from '../layers'

const RUNDOWN_ID = 'MOCK_ACTION_RUNDOWN'
const SEGMENT_ID = 'MOCK_ACTION_SEGMENT'
const SEGMENT_ID_EXTERNAL = `${SEGMENT_ID}_EXTERNAL`
const CURRENT_PART_ID = 'MOCK_PART_CURRENT'
const CURRENT_PART_EXTERNAL_ID = `${CURRENT_PART_ID}_EXTERNAL`
const SERVER_DURATION_A = 12000
const VO_DURATION_A = 20000
const FULL_KEEPALIVE = 1000

const SOURCE_DEFINITION_KAM_1: SourceDefinitionKam = {
	sourceType: SourceType.KAM,
	id: '1',
	raw: 'KAM 1',
	minusMic: false,
	name: 'KAM 1'
}
const SOURCE_DEFINITION_LIVE_2: SourceDefinitionRemote = {
	sourceType: SourceType.REMOTE,
	remoteType: RemoteType.LIVE,
	id: 'LIVE 1',
	name: 'LIVE 1',
	raw: 'Live 1'
}

const currentPartMock: IBlueprintPartInstance = {
	_id: CURRENT_PART_ID,
	segmentId: SEGMENT_ID,
	part: literal<IBlueprintPartDB>({
		_id: '',
		segmentId: SEGMENT_ID,
		externalId: '',
		title: 'Current Part'
	}),
	rehearsal: false
}

const kamPieceInstance: IBlueprintPieceInstance<PieceMetaData> = {
	_id: '',
	piece: {
		_id: 'KAM 1',
		enable: {
			start: 0
		},
		externalId: CURRENT_PART_EXTERNAL_ID,
		name: 'KAM 1',
		sourceLayerId: OfftubeSourceLayer.PgmCam,
		outputLayerId: OfftubeOutputLayers.PGM,
		lifespan: PieceLifespan.WithinPart,
		content: {
			timelineObjects: [
				literal<TSR.TimelineObjAtemME>({
					id: '',
					enable: {
						start: 0
					},
					layer: prefixLayer(SwitcherMixEffectLLayer.CLEAN),
					content: {
						deviceType: TSR.DeviceType.ATEM,
						type: TSR.TimelineContentTypeAtem.ME,
						me: {
							input: 1,
							transition: TSR.AtemTransitionStyle.CUT
						}
					}
				})
			]
		}
	},
	partInstanceId: ''
}

const playingServerPieceInstance: IBlueprintPieceInstance<PieceMetaData> = {
	_id: '',
	piece: {
		_id: 'Playing Server',
		enable: {
			start: 0
		},
		externalId: CURRENT_PART_EXTERNAL_ID,
		name: 'Playing Server',
		sourceLayerId: OfftubeSourceLayer.PgmServer,
		outputLayerId: OfftubeOutputLayers.PGM,
		lifespan: PieceLifespan.WithinPart,
		content: {
			timelineObjects: []
		}
	},
	partInstanceId: ''
}

const selectedServerPieceInstance: IBlueprintPieceInstance<PieceMetaData> = {
	_id: '',
	piece: {
		_id: 'Selected Server',
		enable: {
			start: 0
		},
		externalId: CURRENT_PART_EXTERNAL_ID,
		name: 'Selected Server',
		sourceLayerId: OfftubeSourceLayer.SelectedServer,
		outputLayerId: OfftubeOutputLayers.SELECTED_ADLIB,
		lifespan: PieceLifespan.OutOnSegmentEnd,
		content: {
			timelineObjects: []
		}
	},
	partInstanceId: ''
}

const selectServerClipAction = literal<ActionSelectServerClip>({
	type: AdlibActionType.SELECT_SERVER_CLIP,
	file: '01234A',
	duration: SERVER_DURATION_A,
	voLayer: false,
	voLevels: false,
	partDefinition: literal<PartDefinitionUnknown>({
		type: PartType.Unknown,
		externalId: CURRENT_PART_EXTERNAL_ID,
		rawType: '',
		cues: [],
		script: '',
		fields: {
			videoId: '01234A',
			tapeTime: `${SERVER_DURATION_A / 1000}`
		},
		modified: 0,
		storyName: SEGMENT_ID,
		segmentExternalId: SEGMENT_ID_EXTERNAL,
		segmentRank: 0
	}),
	adLibPix: false
})

const selectVOClipAction = literal<ActionSelectServerClip>({
	type: AdlibActionType.SELECT_SERVER_CLIP,
	file: 'VOVOA',
	duration: VO_DURATION_A,
	voLayer: true,
	voLevels: true,
	partDefinition: literal<PartDefinitionUnknown>({
		type: PartType.Unknown,
		externalId: CURRENT_PART_EXTERNAL_ID,
		rawType: '',
		cues: [],
		script: '',
		fields: {
			videoId: 'VOVOA',
			tapeTime: `${VO_DURATION_A / 1000}`
		},
		modified: 0,
		storyName: SEGMENT_ID,
		segmentExternalId: SEGMENT_ID_EXTERNAL,
		segmentRank: 0
	}),
	adLibPix: false
})

const selectDVEActionMorbarn = literal<ActionSelectDVE>({
	type: AdlibActionType.SELECT_DVE,
	config: {
		type: CueType.DVE,
		template: 'morbarn',
		sources: {
			INP1: SOURCE_DEFINITION_KAM_1,
			INP2: SOURCE_DEFINITION_LIVE_2
		},
		labels: ['Live'],
		iNewsCommand: 'DVE=MORBARN'
	},
	name: 'morbarn',
	videoId: undefined,
	segmentExternalId: SEGMENT_ID_EXTERNAL
})

const selectDVEActionBarnmor = literal<ActionSelectDVE>({
	type: AdlibActionType.SELECT_DVE,
	config: {
		type: CueType.DVE,
		template: 'barnmor',
		sources: {
			INP1: SOURCE_DEFINITION_KAM_1,
			INP2: SOURCE_DEFINITION_LIVE_2
		},
		labels: ['Live'],
		iNewsCommand: 'DVE=BARNMOR'
	},
	name: 'barnmor',
	videoId: undefined,
	segmentExternalId: SEGMENT_ID_EXTERNAL
})

const commentatorSelectDVE = literal<ActionCommentatorSelectDVE>({
	type: AdlibActionType.COMMENTATOR_SELECT_DVE
})

const selectCameraAction = literal<ActionCutToCamera>({
	type: AdlibActionType.CUT_TO_CAMERA,
	sourceDefinition: SOURCE_DEFINITION_KAM_1,
	cutDirectly: false
})

const selectLiveAction = literal<ActionCutToRemote>({
	type: AdlibActionType.CUT_TO_REMOTE,
	cutDirectly: false,
	sourceDefinition: SOURCE_DEFINITION_LIVE_2
})

const selectFullGrafikAction = literal<ActionSelectFullGrafik>({
	type: AdlibActionType.SELECT_FULL_GRAFIK,
	name: 'scoreboard',
	vcpid: 1234567890,
	segmentExternalId: ''
})

const setMIX20AsTransition = literal<ActionTakeWithTransition>({
	type: AdlibActionType.TAKE_WITH_TRANSITION,
	variant: {
		type: 'mix',
		frames: 20
	},
	takeNow: false
})

interface ActivePiecesForSource {
	activePiece: IBlueprintPieceInstance | undefined
	dataStore: IBlueprintPieceInstance | undefined
}

async function getActiveServerPieces(
	context: ActionExecutionContextMock,
	part: 'current' | 'next'
): Promise<ActivePiecesForSource> {
	return {
		activePiece: await context
			.getPieceInstances(part)
			.then((pieceInstances) => pieceInstances.find((p) => p.piece.sourceLayerId === OfftubeSourceLayer.PgmServer)),
		dataStore: await context
			.getPieceInstances(part)
			.then((pieceInstances) => pieceInstances.find((p) => p.piece.sourceLayerId === OfftubeSourceLayer.SelectedServer))
	}
}

async function getVOPieces(
	context: ActionExecutionContextMock,
	part: 'current' | 'next'
): Promise<ActivePiecesForSource> {
	return {
		activePiece: await context
			.getPieceInstances(part)
			.then((pieceInstances) => pieceInstances.find((p) => p.piece.sourceLayerId === OfftubeSourceLayer.PgmVoiceOver)),
		dataStore: await context
			.getPieceInstances(part)
			.then((pieceInstances) =>
				pieceInstances.find((p) => p.piece.sourceLayerId === OfftubeSourceLayer.SelectedVoiceOver)
			)
	}
}

async function getDVEPieces(
	context: ActionExecutionContextMock,
	part: 'current' | 'next'
): Promise<ActivePiecesForSource> {
	return {
		activePiece: await context
			.getPieceInstances(part)
			.then((pieceInstances) => pieceInstances.find((p) => p.piece.sourceLayerId === OfftubeSourceLayer.PgmDVE)),
		dataStore: await context
			.getPieceInstances(part)
			.then((pieceInstances) =>
				pieceInstances.find((p) => p.piece.sourceLayerId === OfftubeSourceLayer.SelectedAdLibDVE)
			)
	}
}

async function getFullGrafikPieces(
	context: ActionExecutionContextMock,
	part: 'current' | 'next'
): Promise<ActivePiecesForSource> {
	return {
		activePiece: await context
			.getPieceInstances(part)
			.then((pieceInstances) => pieceInstances.find((p) => p.piece.sourceLayerId === SharedSourceLayer.PgmPilot)),
		dataStore: await context
			.getPieceInstances(part)
			.then((pieceInstances) =>
				pieceInstances.find((p) => p.piece.sourceLayerId === SharedSourceLayer.SelectedAdlibGraphicsFull)
			)
	}
}

async function getCameraPiece(
	context: ActionExecutionContextMock,
	part: 'current' | 'next'
): Promise<IBlueprintPieceInstance | undefined> {
	return context
		.getPieceInstances(part)
		.then((pieceInstances) => pieceInstances.find((p) => p.piece.sourceLayerId === OfftubeSourceLayer.PgmCam))
}

async function getRemotePiece(
	context: ActionExecutionContextMock,
	part: 'current' | 'next'
): Promise<IBlueprintPieceInstance | undefined> {
	return context
		.getPieceInstances(part)
		.then((pieceInstances) => pieceInstances.find((p) => p.piece.sourceLayerId === OfftubeSourceLayer.PgmLive))
}

function validateSourcePiecesExist(pieces: ActivePiecesForSource) {
	expect(pieces.activePiece).toBeTruthy()
	expect(pieces.dataStore).toBeTruthy()
}

function validateSourcePiecesExistWithPrerollDuration(pieces: ActivePiecesForSource) {
	validateSourcePiecesExist(pieces)
	expect(pieces.activePiece!.piece.prerollDuration)
	expect(pieces.dataStore!.piece.prerollDuration)
}

function validateOnlySelectionIsPreserved(pieces: ActivePiecesForSource) {
	expect(pieces.activePiece).toBeFalsy()
	expect(pieces.dataStore).toBeTruthy()
}

function validateSelectionRemoved(pieces: ActivePiecesForSource) {
	expect(pieces.activePiece).toBeFalsy()
	expect(pieces.dataStore).toBeFalsy()
}

function validateCameraPiece(piece: IBlueprintPieceInstance | undefined) {
	expect(piece).toBeTruthy()
}

function validateRemotePiece(piece: IBlueprintPieceInstance | undefined) {
	expect(piece).toBeTruthy()
}

function validateNoWarningsOrErrors(context: ActionExecutionContextMock) {
	expect(
		context.getNotes().filter((n) => n.type === NoteType.WARNING || n.type === NoteType.NOTIFY_USER_WARNING)
	).toEqual([])
	expect(context.getNotes().filter((n) => n.type === NoteType.ERROR || n.type === NoteType.NOTIFY_USER_ERROR)).toEqual(
		[]
	)
}

function validateNextPartExistsWithDuration(context: ActionExecutionContextMock, duration: number) {
	expect(context.nextPart).toBeTruthy()
	expect(context.nextPart?.part.expectedDuration).toEqual(duration)
}

function validateNextPartExistsWithPreviousPartKeepaliveDuration(
	context: ActionExecutionContextMock,
	duration: number
) {
	expect(context.nextPart).toBeTruthy()
	expect(context.nextPart?.part.inTransition?.previousPartKeepaliveDuration).toEqual(duration)
}

function getATEMMEObj(piece: IBlueprintPieceInstance): TSR.TimelineObjAtemME {
	const atemObj = (piece.piece.content.timelineObjects as TSR.TSRTimelineObj[]).find(
		(obj) =>
			obj.layer === prefixLayer(SwitcherMixEffectLLayer.CLEAN) &&
			obj.content.deviceType === TSR.DeviceType.ATEM &&
			obj.content.type === TSR.TimelineContentTypeAtem.ME
	) as TSR.TimelineObjAtemME | undefined
	expect(atemObj).toBeTruthy()

	return atemObj!
}

function expectUndefinedTransition(piece: IBlueprintPieceInstance): void {
	const atemObj = getATEMMEObj(piece)

	expect(atemObj.content.me.transition).toBe(undefined)
}

function expectATEMToMixOver(piece: IBlueprintPieceInstance, frames: number) {
	const atemObj = getATEMMEObj(piece)

	expect(atemObj.content.me.transition).toBe(TSR.AtemTransitionStyle.MIX)
	expect(atemObj.content.me.transitionSettings?.mix).toStrictEqual({ rate: frames })
}

describe('Select Server Action', () => {
	it('Inserts a new part when no next part is present', async () => {
		const context = new ActionExecutionContextMock(
			'test',
			mappingsDefaults,
			parseStudioConfig,
			parseShowStyleConfig,
			RUNDOWN_ID,
			SEGMENT_ID,
			currentPartMock._id,
			currentPartMock,
			[kamPieceInstance]
		)
		context.studioConfig = defaultStudioConfig as any
		context.showStyleConfig = defaultShowStyleConfig as any
		;(context.studioConfig as unknown as OfftubeStudioConfig).GraphicsType = 'HTML'

		await executeActionOfftube(context, AdlibActionType.SELECT_SERVER_CLIP, selectServerClipAction)

		const activePieces: ActivePiecesForSource = await getActiveServerPieces(context, 'next')

		validateNextPartExistsWithDuration(context, SERVER_DURATION_A)
		validateSourcePiecesExistWithPrerollDuration(activePieces)
		expect(activePieces.dataStore?.piece.lifespan).toEqual(PieceLifespan.WithinPart)

		validateNoWarningsOrErrors(context)
	})

	it('Leaves current part unaffected when a clip is currently playing', async () => {
		const context = new ActionExecutionContextMock(
			'test',
			mappingsDefaults,
			parseStudioConfig,
			parseShowStyleConfig,
			RUNDOWN_ID,
			SEGMENT_ID,
			currentPartMock._id,
			currentPartMock,
			[playingServerPieceInstance, selectedServerPieceInstance]
		)
		context.studioConfig = defaultStudioConfig as any
		context.showStyleConfig = defaultShowStyleConfig as any
		;(context.studioConfig as unknown as OfftubeStudioConfig).GraphicsType = 'HTML'

		await executeActionOfftube(context, AdlibActionType.SELECT_SERVER_CLIP, selectServerClipAction)

		const currentPieces = await getActiveServerPieces(context, 'current')
		const nextPieces = await getActiveServerPieces(context, 'next')

		validateSourcePiecesExist(currentPieces)
		expect(currentPieces.activePiece?.piece.name).toEqual('Playing Server')
		expect(currentPieces.dataStore?.piece.name).toEqual('Selected Server')

		validateSourcePiecesExist(nextPieces)
		expect(nextPieces.activePiece?.piece.name).toEqual('01234A')
		expect(nextPieces.dataStore?.piece.name).toEqual('01234A')
	})
})

describe('Combination Actions', () => {
	it('Server -> DVE', async () => {
		const context = new ActionExecutionContextMock(
			'test',
			mappingsDefaults,
			parseStudioConfig,
			parseShowStyleConfig,
			RUNDOWN_ID,
			SEGMENT_ID,
			currentPartMock._id,
			currentPartMock,
			[kamPieceInstance]
		)
		context.studioConfig = defaultStudioConfig as any
		context.showStyleConfig = defaultShowStyleConfig as any
		;(context.studioConfig as unknown as OfftubeStudioConfig).GraphicsType = 'HTML'

		await executeActionOfftube(context, AdlibActionType.SELECT_SERVER_CLIP, selectServerClipAction)

		let serverPieces = await getActiveServerPieces(context, 'next')

		validateNextPartExistsWithDuration(context, SERVER_DURATION_A)
		validateSourcePiecesExistWithPrerollDuration(serverPieces)

		await executeActionOfftube(context, AdlibActionType.SELECT_DVE, selectDVEActionMorbarn)

		serverPieces = await getActiveServerPieces(context, 'next')
		const dvePieces = await getDVEPieces(context, 'next')

		validateNextPartExistsWithDuration(context, 0)
		validateOnlySelectionIsPreserved(serverPieces)
		validateSourcePiecesExistWithPrerollDuration(dvePieces)
	})

	it('Server -> Full', async () => {
		const context = new ActionExecutionContextMock(
			'test',
			mappingsDefaults,
			parseStudioConfig,
			parseShowStyleConfig,
			RUNDOWN_ID,
			SEGMENT_ID,
			currentPartMock._id,
			currentPartMock,
			[kamPieceInstance]
		)
		context.studioConfig = defaultStudioConfig as any
		context.showStyleConfig = defaultShowStyleConfig as any
		;(context.studioConfig as unknown as OfftubeStudioConfig).GraphicsType = 'HTML'

		await executeActionOfftube(context, AdlibActionType.SELECT_SERVER_CLIP, selectServerClipAction)

		let serverPieces = await getActiveServerPieces(context, 'next')

		validateNextPartExistsWithDuration(context, SERVER_DURATION_A)
		validateSourcePiecesExistWithPrerollDuration(serverPieces)

		await executeActionOfftube(context, AdlibActionType.SELECT_FULL_GRAFIK, selectFullGrafikAction)

		serverPieces = await getActiveServerPieces(context, 'next')
		const fullGrafikPieces = await getFullGrafikPieces(context, 'next')

		validateNextPartExistsWithDuration(context, 0)
		validateNextPartExistsWithPreviousPartKeepaliveDuration(context, FULL_KEEPALIVE)
		validateOnlySelectionIsPreserved(serverPieces)
		validateSourcePiecesExistWithPrerollDuration(fullGrafikPieces)
	})

	it('Server -> VO', async () => {
		const context = new ActionExecutionContextMock(
			'test',
			mappingsDefaults,
			parseStudioConfig,
			parseShowStyleConfig,
			RUNDOWN_ID,
			SEGMENT_ID,
			currentPartMock._id,
			currentPartMock,
			[kamPieceInstance]
		)
		context.studioConfig = defaultStudioConfig as any
		context.showStyleConfig = defaultShowStyleConfig as any
		;(context.studioConfig as unknown as OfftubeStudioConfig).GraphicsType = 'HTML'

		await executeActionOfftube(context, AdlibActionType.SELECT_SERVER_CLIP, selectServerClipAction)

		let serverPieces = await getActiveServerPieces(context, 'next')

		validateNextPartExistsWithDuration(context, SERVER_DURATION_A)
		validateSourcePiecesExistWithPrerollDuration(serverPieces)

		await executeActionOfftube(context, AdlibActionType.SELECT_SERVER_CLIP, selectVOClipAction)

		serverPieces = await getActiveServerPieces(context, 'next')
		const voPieces = await getVOPieces(context, 'next')

		validateNextPartExistsWithDuration(context, VO_DURATION_A)
		validateSelectionRemoved(serverPieces)
		validateSourcePiecesExistWithPrerollDuration(voPieces)
		expect(voPieces.dataStore?.piece.name).toEqual('VOVOA')
	})

	it('Server -> CAM', async () => {
		const context = new ActionExecutionContextMock(
			'test',
			mappingsDefaults,
			parseStudioConfig,
			parseShowStyleConfig,
			RUNDOWN_ID,
			SEGMENT_ID,
			currentPartMock._id,
			currentPartMock,
			[kamPieceInstance]
		)
		context.studioConfig = defaultStudioConfig as any
		context.showStyleConfig = defaultShowStyleConfig as any
		;(context.studioConfig as unknown as OfftubeStudioConfig).GraphicsType = 'HTML'

		await executeActionOfftube(context, AdlibActionType.SELECT_SERVER_CLIP, selectServerClipAction)

		let serverPieces = await getActiveServerPieces(context, 'next')

		validateNextPartExistsWithDuration(context, SERVER_DURATION_A)
		validateSourcePiecesExistWithPrerollDuration(serverPieces)

		await executeActionOfftube(context, AdlibActionType.CUT_TO_CAMERA, selectCameraAction)

		serverPieces = await getActiveServerPieces(context, 'next')
		const camPiece = await getCameraPiece(context, 'next')

		validateNextPartExistsWithDuration(context, 0)
		validateOnlySelectionIsPreserved(serverPieces)
		validateCameraPiece(camPiece)
	})

	it('Server -> LIVE', async () => {
		const context = new ActionExecutionContextMock(
			'test',
			mappingsDefaults,
			parseStudioConfig,
			parseShowStyleConfig,
			RUNDOWN_ID,
			SEGMENT_ID,
			currentPartMock._id,
			currentPartMock,
			[kamPieceInstance]
		)
		context.studioConfig = defaultStudioConfig as any
		context.showStyleConfig = defaultShowStyleConfig as any
		;(context.studioConfig as unknown as OfftubeStudioConfig).GraphicsType = 'HTML'

		await executeActionOfftube(context, AdlibActionType.SELECT_SERVER_CLIP, selectServerClipAction)

		let serverPieces = await getActiveServerPieces(context, 'next')

		validateNextPartExistsWithDuration(context, SERVER_DURATION_A)
		validateSourcePiecesExistWithPrerollDuration(serverPieces)

		await executeActionOfftube(context, AdlibActionType.CUT_TO_REMOTE, selectLiveAction)

		serverPieces = await getActiveServerPieces(context, 'next')
		const remotePiece = await getRemotePiece(context, 'next')

		validateNextPartExistsWithDuration(context, 0)
		validateOnlySelectionIsPreserved(serverPieces)
		validateRemotePiece(remotePiece)
	})

	it('DVE -> Server', async () => {
		const context = new ActionExecutionContextMock(
			'test',
			mappingsDefaults,
			parseStudioConfig,
			parseShowStyleConfig,
			RUNDOWN_ID,
			SEGMENT_ID,
			currentPartMock._id,
			currentPartMock,
			[kamPieceInstance]
		)
		context.studioConfig = defaultStudioConfig as any
		context.showStyleConfig = defaultShowStyleConfig as any
		;(context.studioConfig as unknown as OfftubeStudioConfig).GraphicsType = 'HTML'

		await executeActionOfftube(context, AdlibActionType.SELECT_DVE, selectDVEActionMorbarn)

		let dvePieces = await getDVEPieces(context, 'next')
		validateSourcePiecesExistWithPrerollDuration(dvePieces)
		validateNextPartExistsWithDuration(context, 0)

		await executeActionOfftube(context, AdlibActionType.SELECT_SERVER_CLIP, selectServerClipAction)

		dvePieces = await getDVEPieces(context, 'next')
		const serverPieces = await getActiveServerPieces(context, 'next')

		validateNextPartExistsWithDuration(context, SERVER_DURATION_A)
		validateOnlySelectionIsPreserved(dvePieces)
		validateSourcePiecesExistWithPrerollDuration(serverPieces)
	})

	it('DVE -> Full', async () => {
		const context = new ActionExecutionContextMock(
			'test',
			mappingsDefaults,
			parseStudioConfig,
			parseShowStyleConfig,
			RUNDOWN_ID,
			SEGMENT_ID,
			currentPartMock._id,
			currentPartMock,
			[kamPieceInstance]
		)
		context.studioConfig = defaultStudioConfig as any
		context.showStyleConfig = defaultShowStyleConfig as any
		;(context.studioConfig as unknown as OfftubeStudioConfig).GraphicsType = 'HTML'

		await executeActionOfftube(context, AdlibActionType.SELECT_DVE, selectDVEActionMorbarn)

		let dvePieces = await getDVEPieces(context, 'next')
		validateNextPartExistsWithDuration(context, 0)
		validateSourcePiecesExistWithPrerollDuration(dvePieces)

		await executeActionOfftube(context, AdlibActionType.SELECT_FULL_GRAFIK, selectFullGrafikAction)

		dvePieces = await getDVEPieces(context, 'next')
		const fullGrafikPieces = await getFullGrafikPieces(context, 'next')

		validateNextPartExistsWithDuration(context, 0)
		validateNextPartExistsWithPreviousPartKeepaliveDuration(context, FULL_KEEPALIVE)
		validateOnlySelectionIsPreserved(dvePieces)
		validateSourcePiecesExistWithPrerollDuration(fullGrafikPieces)
	})

	it('DVE -> VO', async () => {
		const context = new ActionExecutionContextMock(
			'test',
			mappingsDefaults,
			parseStudioConfig,
			parseShowStyleConfig,
			RUNDOWN_ID,
			SEGMENT_ID,
			currentPartMock._id,
			currentPartMock,
			[kamPieceInstance]
		)
		context.studioConfig = defaultStudioConfig as any
		context.showStyleConfig = defaultShowStyleConfig as any
		;(context.studioConfig as unknown as OfftubeStudioConfig).GraphicsType = 'HTML'

		await executeActionOfftube(context, AdlibActionType.SELECT_DVE, selectDVEActionMorbarn)

		let dvePieces = await getDVEPieces(context, 'next')
		validateSourcePiecesExistWithPrerollDuration(dvePieces)
		validateNextPartExistsWithDuration(context, 0)

		await executeActionOfftube(context, AdlibActionType.SELECT_SERVER_CLIP, selectVOClipAction)

		dvePieces = await getDVEPieces(context, 'next')
		const voPieces = await getVOPieces(context, 'next')

		validateNextPartExistsWithDuration(context, VO_DURATION_A)
		validateOnlySelectionIsPreserved(dvePieces)
		validateSourcePiecesExistWithPrerollDuration(voPieces)
	})

	it('DVE -> CAM', async () => {
		const context = new ActionExecutionContextMock(
			'test',
			mappingsDefaults,
			parseStudioConfig,
			parseShowStyleConfig,
			RUNDOWN_ID,
			SEGMENT_ID,
			currentPartMock._id,
			currentPartMock,
			[kamPieceInstance]
		)
		context.studioConfig = defaultStudioConfig as any
		context.showStyleConfig = defaultShowStyleConfig as any
		;(context.studioConfig as unknown as OfftubeStudioConfig).GraphicsType = 'HTML'

		await executeActionOfftube(context, AdlibActionType.SELECT_DVE, selectDVEActionMorbarn)

		let dvePieces = await getDVEPieces(context, 'next')
		validateSourcePiecesExistWithPrerollDuration(dvePieces)
		validateNextPartExistsWithDuration(context, 0)

		await executeActionOfftube(context, AdlibActionType.CUT_TO_CAMERA, selectCameraAction)

		dvePieces = await getDVEPieces(context, 'next')
		const camPiece = await getCameraPiece(context, 'next')

		validateNextPartExistsWithDuration(context, 0)
		validateOnlySelectionIsPreserved(dvePieces)
		validateCameraPiece(camPiece)
	})

	it('DVE -> LIVE', async () => {
		const context = new ActionExecutionContextMock(
			'test',
			mappingsDefaults,
			parseStudioConfig,
			parseShowStyleConfig,
			RUNDOWN_ID,
			SEGMENT_ID,
			currentPartMock._id,
			currentPartMock,
			[kamPieceInstance]
		)
		context.studioConfig = defaultStudioConfig as any
		context.showStyleConfig = defaultShowStyleConfig as any
		;(context.studioConfig as unknown as OfftubeStudioConfig).GraphicsType = 'HTML'

		await executeActionOfftube(context, AdlibActionType.SELECT_DVE, selectDVEActionMorbarn)

		let dvePieces = await getDVEPieces(context, 'next')
		validateSourcePiecesExistWithPrerollDuration(dvePieces)
		validateNextPartExistsWithDuration(context, 0)

		await executeActionOfftube(context, AdlibActionType.CUT_TO_REMOTE, selectLiveAction)

		dvePieces = await getDVEPieces(context, 'next')
		const remotePiece = await getRemotePiece(context, 'next')

		validateNextPartExistsWithDuration(context, 0)
		validateOnlySelectionIsPreserved(dvePieces)
		validateRemotePiece(remotePiece)
	})

	it('Server (01234A) -> DVE (morbarn) -> VO (VOVOA) -> DVE (barnmor) -> CAM (1) -> LIVE (2) -> SERVER (01234A) -> Commentator Select DVE', async () => {
		const context = new ActionExecutionContextMock(
			'test',
			mappingsDefaults,
			parseStudioConfig,
			parseShowStyleConfig,
			RUNDOWN_ID,
			SEGMENT_ID,
			currentPartMock._id,
			currentPartMock,
			[kamPieceInstance]
		)
		context.studioConfig = defaultStudioConfig as any
		context.showStyleConfig = defaultShowStyleConfig as any
		;(context.studioConfig as unknown as OfftubeStudioConfig).GraphicsType = 'HTML'

		// SERVER (A)
		await executeActionOfftube(context, AdlibActionType.SELECT_SERVER_CLIP, selectServerClipAction)

		let serverPieces = await getActiveServerPieces(context, 'next')

		validateNextPartExistsWithDuration(context, SERVER_DURATION_A)
		validateSourcePiecesExistWithPrerollDuration(serverPieces)

		// DVE (A)
		await executeActionOfftube(context, AdlibActionType.SELECT_DVE, selectDVEActionMorbarn)

		serverPieces = await getActiveServerPieces(context, 'next')
		let dvePieces = await getDVEPieces(context, 'next')

		validateNextPartExistsWithDuration(context, 0)
		validateOnlySelectionIsPreserved(serverPieces)
		validateSourcePiecesExistWithPrerollDuration(dvePieces)

		// VO (A)
		await executeActionOfftube(context, AdlibActionType.SELECT_SERVER_CLIP, selectVOClipAction)

		let voPieces = await getVOPieces(context, 'next')
		serverPieces = await getActiveServerPieces(context, 'next')
		dvePieces = await getDVEPieces(context, 'next')

		validateNextPartExistsWithDuration(context, VO_DURATION_A)
		validateSelectionRemoved(serverPieces)
		validateOnlySelectionIsPreserved(dvePieces)
		validateSourcePiecesExistWithPrerollDuration(voPieces)

		// DVE (B)
		expect(dvePieces.dataStore?.piece.name).toEqual('morbarn')
		await executeActionOfftube(context, AdlibActionType.SELECT_DVE, selectDVEActionBarnmor)

		voPieces = await getVOPieces(context, 'next')
		serverPieces = await getActiveServerPieces(context, 'next')
		dvePieces = await getDVEPieces(context, 'next')

		validateNextPartExistsWithDuration(context, 0)
		validateSourcePiecesExistWithPrerollDuration(dvePieces)
		validateSelectionRemoved(serverPieces)
		validateOnlySelectionIsPreserved(voPieces)
		expect(dvePieces.dataStore?.piece.name).toEqual('barnmor')

		// CAM (1)
		await executeActionOfftube(context, AdlibActionType.CUT_TO_CAMERA, selectCameraAction)

		voPieces = await getVOPieces(context, 'next')
		serverPieces = await getActiveServerPieces(context, 'next')
		dvePieces = await getDVEPieces(context, 'next')
		let camPiece = await getCameraPiece(context, 'next')

		validateNextPartExistsWithDuration(context, 0)
		validateOnlySelectionIsPreserved(voPieces)
		validateOnlySelectionIsPreserved(dvePieces)
		validateSelectionRemoved(serverPieces)
		validateCameraPiece(camPiece)

		// LIVE (2)
		await executeActionOfftube(context, AdlibActionType.CUT_TO_REMOTE, selectLiveAction)

		voPieces = await getVOPieces(context, 'next')
		serverPieces = await getActiveServerPieces(context, 'next')
		dvePieces = await getDVEPieces(context, 'next')
		camPiece = await getCameraPiece(context, 'next')
		let remotePiece = await getRemotePiece(context, 'next')

		validateNextPartExistsWithDuration(context, 0)
		validateOnlySelectionIsPreserved(voPieces)
		validateOnlySelectionIsPreserved(dvePieces)
		validateSelectionRemoved(serverPieces)
		expect(camPiece).toBeFalsy()
		validateRemotePiece(remotePiece)

		// SERVER (A)
		await executeActionOfftube(context, AdlibActionType.SELECT_SERVER_CLIP, selectServerClipAction)

		voPieces = await getVOPieces(context, 'next')
		serverPieces = await getActiveServerPieces(context, 'next')
		dvePieces = await getDVEPieces(context, 'next')
		camPiece = await getCameraPiece(context, 'next')
		remotePiece = await getRemotePiece(context, 'next')

		validateNextPartExistsWithDuration(context, SERVER_DURATION_A)
		validateSelectionRemoved(voPieces)
		validateOnlySelectionIsPreserved(dvePieces)
		validateSourcePiecesExistWithPrerollDuration(serverPieces)
		expect(camPiece).toBeFalsy()
		expect(remotePiece).toBeFalsy()

		// Commentator Select DVE
		await executeActionOfftube(context, AdlibActionType.COMMENTATOR_SELECT_DVE, commentatorSelectDVE)

		voPieces = await getVOPieces(context, 'next')
		serverPieces = await getActiveServerPieces(context, 'next')
		dvePieces = await getDVEPieces(context, 'next')
		camPiece = await getCameraPiece(context, 'next')
		remotePiece = await getRemotePiece(context, 'next')

		validateNextPartExistsWithDuration(context, 0)
		validateSelectionRemoved(voPieces)
		validateOnlySelectionIsPreserved(serverPieces)
		validateSourcePiecesExistWithPrerollDuration(dvePieces)
		expect(camPiece).toBeFalsy()
		expect(remotePiece).toBeFalsy()
		expect(dvePieces.activePiece?.piece.name).toEqual('barnmor')
	})

	it('CAM -> MIX 20 (No Take) -> LIVE (2)', async () => {
		const context = new ActionExecutionContextMock(
			'test',
			mappingsDefaults,
			parseStudioConfig,
			parseShowStyleConfig,
			RUNDOWN_ID,
			SEGMENT_ID,
			currentPartMock._id,
			currentPartMock,
			[kamPieceInstance]
		)
		context.studioConfig = defaultStudioConfig as any
		context.showStyleConfig = defaultShowStyleConfig as any
		;(context.studioConfig as unknown as OfftubeStudioConfig).GraphicsType = 'HTML'

		await executeActionOfftube(context, AdlibActionType.CUT_TO_CAMERA, selectCameraAction)

		let camPiece = await getCameraPiece(context, 'next')

		validateNextPartExistsWithDuration(context, 0)
		validateCameraPiece(camPiece)
		expectUndefinedTransition(camPiece!)

		await executeActionOfftube(context, AdlibActionType.TAKE_WITH_TRANSITION, setMIX20AsTransition)

		camPiece = await getCameraPiece(context, 'next')

		validateNextPartExistsWithDuration(context, 0)
		validateCameraPiece(camPiece)
		expectATEMToMixOver(camPiece!, 20)

		await executeActionOfftube(context, AdlibActionType.CUT_TO_REMOTE, selectLiveAction)

		const livePiece = await getRemotePiece(context, 'next')
		camPiece = await getCameraPiece(context, 'next')

		expect(camPiece).toBeFalsy()
		validateNextPartExistsWithDuration(context, 0)
		validateRemotePiece(livePiece)
		expectATEMToMixOver(livePiece!, 20)
	})

	it('CAM -> MIX 20 (No Take) -> SERVER', async () => {
		const context = new ActionExecutionContextMock(
			'test',
			mappingsDefaults,
			parseStudioConfig,
			parseShowStyleConfig,
			RUNDOWN_ID,
			SEGMENT_ID,
			currentPartMock._id,
			currentPartMock,
			[kamPieceInstance]
		)
		context.studioConfig = defaultStudioConfig as any
		context.showStyleConfig = defaultShowStyleConfig as any
		;(context.studioConfig as unknown as OfftubeStudioConfig).GraphicsType = 'HTML'

		await executeActionOfftube(context, AdlibActionType.CUT_TO_CAMERA, selectCameraAction)

		let camPiece = await getCameraPiece(context, 'next')

		validateNextPartExistsWithDuration(context, 0)
		validateCameraPiece(camPiece)
		expectUndefinedTransition(camPiece!)

		await executeActionOfftube(context, AdlibActionType.TAKE_WITH_TRANSITION, setMIX20AsTransition)

		camPiece = await getCameraPiece(context, 'next')

		validateNextPartExistsWithDuration(context, 0)
		validateCameraPiece(camPiece)
		expectATEMToMixOver(camPiece!, 20)

		await executeActionOfftube(context, AdlibActionType.SELECT_SERVER_CLIP, selectServerClipAction)

		const serverPieces = await getActiveServerPieces(context, 'next')
		camPiece = await getCameraPiece(context, 'next')

		validateNextPartExistsWithDuration(context, SERVER_DURATION_A)
		validateSourcePiecesExistWithPrerollDuration(serverPieces)
		expect(camPiece).toBeFalsy()
		expectATEMToMixOver(serverPieces.activePiece!, 20)
	})

	it('CAM -> MIX 20 (No Take) -> VO', async () => {
		const context = new ActionExecutionContextMock(
			'test',
			mappingsDefaults,
			parseStudioConfig,
			parseShowStyleConfig,
			RUNDOWN_ID,
			SEGMENT_ID,
			currentPartMock._id,
			currentPartMock,
			[kamPieceInstance]
		)
		context.studioConfig = defaultStudioConfig as any
		context.showStyleConfig = defaultShowStyleConfig as any
		;(context.studioConfig as unknown as OfftubeStudioConfig).GraphicsType = 'HTML'

		await executeActionOfftube(context, AdlibActionType.CUT_TO_CAMERA, selectCameraAction)

		let camPiece = await getCameraPiece(context, 'next')

		validateNextPartExistsWithDuration(context, 0)
		validateCameraPiece(camPiece)
		expectUndefinedTransition(camPiece!)

		await executeActionOfftube(context, AdlibActionType.TAKE_WITH_TRANSITION, setMIX20AsTransition)

		camPiece = await getCameraPiece(context, 'next')

		validateNextPartExistsWithDuration(context, 0)
		validateCameraPiece(camPiece)
		expectATEMToMixOver(camPiece!, 20)

		await executeActionOfftube(context, AdlibActionType.SELECT_SERVER_CLIP, selectVOClipAction)

		const serverPieces = await getVOPieces(context, 'next')
		camPiece = await getCameraPiece(context, 'next')

		validateNextPartExistsWithDuration(context, VO_DURATION_A)
		validateSourcePiecesExistWithPrerollDuration(serverPieces)
		expect(camPiece).toBeFalsy()
		expectATEMToMixOver(serverPieces.activePiece!, 20)
	})

	it('CAM -> MIX 20 (No Take) -> DVE', async () => {
		const context = new ActionExecutionContextMock(
			'test',
			mappingsDefaults,
			parseStudioConfig,
			parseShowStyleConfig,
			RUNDOWN_ID,
			SEGMENT_ID,
			currentPartMock._id,
			currentPartMock,
			[kamPieceInstance]
		)
		context.studioConfig = defaultStudioConfig as any
		context.showStyleConfig = defaultShowStyleConfig as any
		;(context.studioConfig as unknown as OfftubeStudioConfig).GraphicsType = 'HTML'

		await executeActionOfftube(context, AdlibActionType.CUT_TO_CAMERA, selectCameraAction)

		let camPiece = await getCameraPiece(context, 'next')

		validateNextPartExistsWithDuration(context, 0)
		validateCameraPiece(camPiece)
		expectUndefinedTransition(camPiece!)

		await executeActionOfftube(context, AdlibActionType.TAKE_WITH_TRANSITION, setMIX20AsTransition)

		camPiece = await getCameraPiece(context, 'next')

		validateNextPartExistsWithDuration(context, 0)
		validateCameraPiece(camPiece)
		expectATEMToMixOver(camPiece!, 20)

		await executeActionOfftube(context, AdlibActionType.SELECT_DVE, selectDVEActionMorbarn)

		const dvePieces = await getDVEPieces(context, 'next')
		validateNextPartExistsWithDuration(context, 0)
		validateSourcePiecesExistWithPrerollDuration(dvePieces)
		expectATEMToMixOver(dvePieces.activePiece!, 20)
	})
})
