import {
	IBlueprintPartDB,
	IBlueprintPartInstance,
	IBlueprintPieceDB,
	IBlueprintPieceInstance,
	PieceLifespan,
	TSR
} from 'tv-automation-sofie-blueprints-integration'
import {
	ActionCommentatorSelectDVE,
	ActionCutToCamera,
	ActionCutToRemote,
	ActionSelectDVE,
	ActionSelectFullGrafik,
	ActionSelectServerClip,
	ActionTakeWithTransition,
	literal,
	PartDefinitionUnknown
} from 'tv2-common'
import { AdlibActionType, CueType, PartType } from 'tv2-constants'
import { AtemLLayer } from '../../tv2_afvd_studio/layers'
import { OfftubeAtemLLayer } from '../../tv2_offtube_studio/layers'
import { executeActionOfftube } from '../actions'
import { OfftubeOutputLayers, OfftubeSourceLayer } from '../layers'
import { MockContext } from './actionExecutionContext.mock'

const SEGMENT_ID = 'MOCK_ACTION_SEGMENT'
const SEGMENT_ID_EXTERNAL = `${SEGMENT_ID}_EXTERNAL`
const CURRENT_PART_ID = 'MOCK_PART_CURRENT'
const CURRENT_PART_EXTERNAL_ID = `${CURRENT_PART_ID}_EXTERNAL`
const SERVER_DURATION_A = 12000
const VO_DURATION_A = 20000
const SERVER_PREROLL = 280
const DVE_PREROLL = 280
const FULL_PREROLL = 280
const FULL_KEEPALIVE = 1000

const currentPartMock: IBlueprintPartInstance = {
	_id: CURRENT_PART_ID,
	segmentId: SEGMENT_ID,
	part: literal<IBlueprintPartDB>({
		_id: '',
		segmentId: SEGMENT_ID,
		externalId: '',
		title: 'Current Part'
	})
}

const kamPieceInstance: IBlueprintPieceInstance = {
	_id: '',
	piece: literal<IBlueprintPieceDB>({
		_id: 'KAM 1',
		enable: {
			start: 0
		},
		partId: CURRENT_PART_ID,
		externalId: CURRENT_PART_EXTERNAL_ID,
		name: 'KAM 1',
		sourceLayerId: OfftubeSourceLayer.PgmCam,
		outputLayerId: OfftubeOutputLayers.PGM,
		infiniteMode: PieceLifespan.OutOnNextPart,
		content: {
			timelineObjects: [
				literal<TSR.TimelineObjAtemME>({
					id: '',
					enable: {
						start: 0
					},
					layer: AtemLLayer.AtemMEClean,
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
	})
}

const playingServerPieceInstance: IBlueprintPieceInstance = {
	_id: '',
	piece: literal<IBlueprintPieceDB>({
		_id: 'Playing Server',
		enable: {
			start: 0
		},
		partId: CURRENT_PART_ID,
		externalId: CURRENT_PART_EXTERNAL_ID,
		name: 'Playing Server',
		sourceLayerId: OfftubeSourceLayer.PgmServer,
		outputLayerId: OfftubeOutputLayers.PGM,
		infiniteMode: PieceLifespan.OutOnNextPart
	})
}

const selectedServerPieceInstance: IBlueprintPieceInstance = {
	_id: '',
	piece: literal<IBlueprintPieceDB>({
		_id: 'Selected Server',
		enable: {
			start: 0
		},
		partId: CURRENT_PART_ID,
		externalId: CURRENT_PART_EXTERNAL_ID,
		name: 'Selected Server',
		sourceLayerId: OfftubeSourceLayer.SelectedAdLibServer,
		outputLayerId: OfftubeOutputLayers.SELECTED_ADLIB,
		infiniteMode: PieceLifespan.OutOnNextSegment
	})
}

const selectServerClipAction = literal<ActionSelectServerClip>({
	type: AdlibActionType.SELECT_SERVER_CLIP,
	file: '01234A',
	duration: SERVER_DURATION_A,
	vo: false,
	partDefinition: literal<PartDefinitionUnknown>({
		type: PartType.Unknown,
		externalId: CURRENT_PART_EXTERNAL_ID,
		variant: {},
		rawType: '',
		cues: [],
		script: '',
		fields: {
			videoId: '01234A',
			tapeTime: `${SERVER_DURATION_A / 1000}`
		},
		modified: 0,
		storyName: SEGMENT_ID,
		segmentExternalId: SEGMENT_ID_EXTERNAL
	}),
	segmentExternalId: 'TEST STORY 1'
})

const selectVOClipAction = literal<ActionSelectServerClip>({
	type: AdlibActionType.SELECT_SERVER_CLIP,
	file: 'VOVOA',
	duration: VO_DURATION_A,
	vo: true,
	partDefinition: literal<PartDefinitionUnknown>({
		type: PartType.Unknown,
		externalId: CURRENT_PART_EXTERNAL_ID,
		variant: {},
		rawType: '',
		cues: [],
		script: '',
		fields: {
			videoId: 'VOVOA',
			tapeTime: `${VO_DURATION_A / 1000}`
		},
		modified: 0,
		storyName: SEGMENT_ID,
		segmentExternalId: SEGMENT_ID_EXTERNAL
	}),
	segmentExternalId: 'TEST STORY 2'
})

const selectDVEActionMorbarn = literal<ActionSelectDVE>({
	type: AdlibActionType.SELECT_DVE,
	config: {
		type: CueType.DVE,
		template: 'morbarn',
		sources: {
			INP1: 'Kam 1',
			INP2: 'Live 2'
		},
		labels: ['Live'],
		iNewsCommand: 'DVE=MORBARN'
	},
	videoId: undefined
})

const selectDVEActionBarnmor = literal<ActionSelectDVE>({
	type: AdlibActionType.SELECT_DVE,
	config: {
		type: CueType.DVE,
		template: 'barnmor',
		sources: {
			INP1: 'Kam 1',
			INP2: 'Live 2'
		},
		labels: ['Live'],
		iNewsCommand: 'DVE=BARNMOR'
	},
	videoId: undefined
})

const commentatorSelectDVE = literal<ActionCommentatorSelectDVE>({
	type: AdlibActionType.COMMENTATOR_SELECT_DVE
})

const selectCameraAction = literal<ActionCutToCamera>({
	type: AdlibActionType.CUT_TO_CAMERA,
	name: '1',
	queue: true
})

const selectLiveAction = literal<ActionCutToRemote>({
	type: AdlibActionType.CUT_TO_REMOTE,
	name: '2',
	port: 3
})

const selectFullGrafikAction = literal<ActionSelectFullGrafik>({
	type: AdlibActionType.SELECT_FULL_GRAFIK,
	template: 'scoreboard',
	segmentExternalId: 'TEST STORY 3'
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

function getServerPieces(context: MockContext, part: 'current' | 'next'): ActivePiecesForSource {
	return {
		activePiece: context.getPieceInstances(part).find(p => p.piece.sourceLayerId === OfftubeSourceLayer.PgmServer),
		dataStore: context
			.getPieceInstances(part)
			.find(p => p.piece.sourceLayerId === OfftubeSourceLayer.SelectedAdLibServer)
	}
}

function getVOPieces(context: MockContext, part: 'current' | 'next'): ActivePiecesForSource {
	return {
		activePiece: context.getPieceInstances(part).find(p => p.piece.sourceLayerId === OfftubeSourceLayer.PgmVoiceOver),
		dataStore: context
			.getPieceInstances(part)
			.find(p => p.piece.sourceLayerId === OfftubeSourceLayer.SelectedAdLibVoiceOver)
	}
}

function getDVEPieces(context: MockContext, part: 'current' | 'next'): ActivePiecesForSource {
	return {
		activePiece: context.getPieceInstances(part).find(p => p.piece.sourceLayerId === OfftubeSourceLayer.PgmDVE),
		dataStore: context.getPieceInstances(part).find(p => p.piece.sourceLayerId === OfftubeSourceLayer.SelectedAdLibDVE)
	}
}

function getFullGrafikPieces(context: MockContext, part: 'current' | 'next'): ActivePiecesForSource {
	return {
		activePiece: context.getPieceInstances(part).find(p => p.piece.sourceLayerId === OfftubeSourceLayer.PgmFull),
		dataStore: context
			.getPieceInstances(part)
			.find(p => p.piece.sourceLayerId === OfftubeSourceLayer.SelectedAdlibGraphicsFull)
	}
}

function getCameraPiece(context: MockContext, part: 'current' | 'next'): IBlueprintPieceInstance | undefined {
	return context.getPieceInstances(part).find(p => p.piece.sourceLayerId === OfftubeSourceLayer.PgmCam)
}

function getRemotePiece(context: MockContext, part: 'current' | 'next'): IBlueprintPieceInstance | undefined {
	return context.getPieceInstances(part).find(p => p.piece.sourceLayerId === OfftubeSourceLayer.PgmLive)
}

function validateSourcePiecesExist(pieces: ActivePiecesForSource) {
	expect(pieces.activePiece).toBeTruthy()
	expect(pieces.dataStore).toBeTruthy()
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

function validateNoWarningsOrErrors(context: MockContext) {
	expect(context.warnings).toEqual([])
	expect(context.errors).toEqual([])
}

function validateNextPartExistsWithDuration(context: MockContext, duration: number) {
	expect(context.nextPart).toBeTruthy()
	expect(context.nextPart?.part.expectedDuration).toEqual(duration)
}

function validateNextPartExistsWithPreRoll(context: MockContext, duration: number) {
	expect(context.nextPart).toBeTruthy()
	expect(context.nextPart?.part.prerollDuration).toEqual(duration)
}

function validateNextPartExistsWithTransitionKeepAlive(context: MockContext, duration: number) {
	expect(context.nextPart).toBeTruthy()
	expect(context.nextPart?.part.transitionKeepaliveDuration).toEqual(duration)
}

function getATEMMEObj(piece: IBlueprintPieceInstance): TSR.TimelineObjAtemME {
	const atemObj = (piece.piece.content!.timelineObjects as TSR.TSRTimelineObj[]).find(
		obj =>
			obj.layer === OfftubeAtemLLayer.AtemMEClean &&
			obj.content.deviceType === TSR.DeviceType.ATEM &&
			obj.content.type === TSR.TimelineContentTypeAtem.ME
	) as TSR.TimelineObjAtemME | undefined
	expect(atemObj).toBeTruthy()

	return atemObj!
}

function expectATEMToCut(piece: IBlueprintPieceInstance) {
	const atemObj = getATEMMEObj(piece)

	expect(atemObj.content.me.transition).toBe(TSR.AtemTransitionStyle.CUT)
}

function expectATEMToMixOver(piece: IBlueprintPieceInstance, frames: number) {
	const atemObj = getATEMMEObj(piece)

	expect(atemObj.content.me.transition).toBe(TSR.AtemTransitionStyle.MIX)
	expect(atemObj.content.me.transitionSettings?.mix).toStrictEqual({ rate: frames })
}

describe('Select Server Action', () => {
	it('Inserts a new part when no next part is present', () => {
		const context = new MockContext(SEGMENT_ID, currentPartMock, [kamPieceInstance])

		executeActionOfftube(context, AdlibActionType.SELECT_SERVER_CLIP, selectServerClipAction)

		const pieces = getServerPieces(context, 'next')

		validateNextPartExistsWithDuration(context, SERVER_DURATION_A)
		validateNextPartExistsWithPreRoll(context, SERVER_PREROLL)
		validateSourcePiecesExist(pieces)
		expect(pieces.dataStore?.piece.infiniteMode).toEqual(PieceLifespan.OutOnNextSegment)

		validateNoWarningsOrErrors(context)
	})

	it('Leaves current part unaffected when a clip is currently playing', () => {
		const context = new MockContext(SEGMENT_ID, currentPartMock, [
			playingServerPieceInstance,
			selectedServerPieceInstance
		])

		executeActionOfftube(context, AdlibActionType.SELECT_SERVER_CLIP, selectServerClipAction)

		const currentPieces = getServerPieces(context, 'current')
		const nextPieces = getServerPieces(context, 'next')

		validateSourcePiecesExist(currentPieces)
		expect(currentPieces.activePiece?.piece.name).toEqual('Playing Server')
		expect(currentPieces.dataStore?.piece.name).toEqual('Selected Server')

		validateSourcePiecesExist(nextPieces)
		expect(nextPieces.activePiece?.piece.name).toEqual('01234A')
		expect(nextPieces.dataStore?.piece.name).toEqual('01234A')
	})
})

describe('Combination Actions', () => {
	it('Server -> DVE', () => {
		const context = new MockContext(SEGMENT_ID, currentPartMock, [kamPieceInstance])

		executeActionOfftube(context, AdlibActionType.SELECT_SERVER_CLIP, selectServerClipAction)

		let serverPieces = getServerPieces(context, 'next')

		validateNextPartExistsWithDuration(context, SERVER_DURATION_A)
		validateNextPartExistsWithPreRoll(context, SERVER_PREROLL)
		validateSourcePiecesExist(serverPieces)

		executeActionOfftube(context, AdlibActionType.SELECT_DVE, selectDVEActionMorbarn)

		serverPieces = getServerPieces(context, 'next')
		const dvePieces = getDVEPieces(context, 'next')

		validateNextPartExistsWithDuration(context, 0)
		validateNextPartExistsWithPreRoll(context, DVE_PREROLL)
		validateOnlySelectionIsPreserved(serverPieces)
		validateSourcePiecesExist(dvePieces)
	})

	it('Server -> Full', () => {
		const context = new MockContext(SEGMENT_ID, currentPartMock, [kamPieceInstance])

		executeActionOfftube(context, AdlibActionType.SELECT_SERVER_CLIP, selectServerClipAction)

		let serverPieces = getServerPieces(context, 'next')

		validateNextPartExistsWithDuration(context, SERVER_DURATION_A)
		validateNextPartExistsWithPreRoll(context, SERVER_PREROLL)
		validateSourcePiecesExist(serverPieces)

		executeActionOfftube(context, AdlibActionType.SELECT_FULL_GRAFIK, selectFullGrafikAction)

		serverPieces = getServerPieces(context, 'next')
		const fullGrafikPieces = getFullGrafikPieces(context, 'next')

		validateNextPartExistsWithDuration(context, 0)
		validateNextPartExistsWithPreRoll(context, FULL_PREROLL)
		validateNextPartExistsWithTransitionKeepAlive(context, FULL_KEEPALIVE)
		validateOnlySelectionIsPreserved(serverPieces)
		validateSourcePiecesExist(fullGrafikPieces)
	})

	it('Server -> VO', () => {
		const context = new MockContext(SEGMENT_ID, currentPartMock, [kamPieceInstance])

		executeActionOfftube(context, AdlibActionType.SELECT_SERVER_CLIP, selectServerClipAction)

		let serverPieces = getServerPieces(context, 'next')

		validateNextPartExistsWithDuration(context, SERVER_DURATION_A)
		validateNextPartExistsWithPreRoll(context, SERVER_PREROLL)
		validateSourcePiecesExist(serverPieces)

		executeActionOfftube(context, AdlibActionType.SELECT_SERVER_CLIP, selectVOClipAction)

		serverPieces = getServerPieces(context, 'next')
		const voPieces = getVOPieces(context, 'next')

		validateNextPartExistsWithDuration(context, VO_DURATION_A)
		validateNextPartExistsWithPreRoll(context, SERVER_PREROLL)
		validateSelectionRemoved(serverPieces)
		validateSourcePiecesExist(voPieces)
		expect(voPieces.dataStore?.piece.name).toEqual('VOVOA')
	})

	it('Server -> DVE', () => {
		const context = new MockContext(SEGMENT_ID, currentPartMock, [kamPieceInstance])

		executeActionOfftube(context, AdlibActionType.SELECT_SERVER_CLIP, selectServerClipAction)

		let serverPieces = getServerPieces(context, 'next')

		validateNextPartExistsWithDuration(context, SERVER_DURATION_A)
		validateNextPartExistsWithPreRoll(context, SERVER_PREROLL)
		validateSourcePiecesExist(serverPieces)

		executeActionOfftube(context, AdlibActionType.SELECT_DVE, selectDVEActionMorbarn)

		serverPieces = getServerPieces(context, 'next')
		const dvePieces = getDVEPieces(context, 'next')

		validateNextPartExistsWithDuration(context, 0)
		validateNextPartExistsWithPreRoll(context, DVE_PREROLL)
		validateOnlySelectionIsPreserved(serverPieces)
		validateSourcePiecesExist(dvePieces)
	})

	it('Server -> CAM', () => {
		const context = new MockContext(SEGMENT_ID, currentPartMock, [kamPieceInstance])

		executeActionOfftube(context, AdlibActionType.SELECT_SERVER_CLIP, selectServerClipAction)

		let serverPieces = getServerPieces(context, 'next')

		validateNextPartExistsWithDuration(context, SERVER_DURATION_A)
		validateNextPartExistsWithPreRoll(context, SERVER_PREROLL)
		validateSourcePiecesExist(serverPieces)

		executeActionOfftube(context, AdlibActionType.CUT_TO_CAMERA, selectCameraAction)

		serverPieces = getServerPieces(context, 'next')
		const camPiece = getCameraPiece(context, 'next')

		validateNextPartExistsWithDuration(context, 0)
		validateOnlySelectionIsPreserved(serverPieces)
		validateCameraPiece(camPiece)
	})

	it('Server -> LIVE', () => {
		const context = new MockContext(SEGMENT_ID, currentPartMock, [kamPieceInstance])

		executeActionOfftube(context, AdlibActionType.SELECT_SERVER_CLIP, selectServerClipAction)

		let serverPieces = getServerPieces(context, 'next')

		validateNextPartExistsWithDuration(context, SERVER_DURATION_A)
		validateNextPartExistsWithPreRoll(context, SERVER_PREROLL)
		validateSourcePiecesExist(serverPieces)

		executeActionOfftube(context, AdlibActionType.CUT_TO_REMOTE, selectLiveAction)

		serverPieces = getServerPieces(context, 'next')
		const remotePiece = getRemotePiece(context, 'next')

		validateNextPartExistsWithDuration(context, 0)
		validateOnlySelectionIsPreserved(serverPieces)
		validateRemotePiece(remotePiece)
	})

	it('DVE -> Server', () => {
		const context = new MockContext(SEGMENT_ID, currentPartMock, [kamPieceInstance])

		executeActionOfftube(context, AdlibActionType.SELECT_DVE, selectDVEActionMorbarn)

		let dvePieces = getDVEPieces(context, 'next')
		validateSourcePiecesExist(dvePieces)
		validateNextPartExistsWithDuration(context, 0)
		validateNextPartExistsWithPreRoll(context, DVE_PREROLL)

		executeActionOfftube(context, AdlibActionType.SELECT_SERVER_CLIP, selectServerClipAction)

		dvePieces = getDVEPieces(context, 'next')
		const serverPieces = getServerPieces(context, 'next')

		validateNextPartExistsWithDuration(context, SERVER_DURATION_A)
		validateNextPartExistsWithPreRoll(context, SERVER_PREROLL)
		validateOnlySelectionIsPreserved(dvePieces)
		validateSourcePiecesExist(serverPieces)
	})

	it('DVE -> Full', () => {
		const context = new MockContext(SEGMENT_ID, currentPartMock, [kamPieceInstance])

		executeActionOfftube(context, AdlibActionType.SELECT_DVE, selectDVEActionMorbarn)

		let dvePieces = getDVEPieces(context, 'next')
		validateNextPartExistsWithDuration(context, 0)
		validateNextPartExistsWithPreRoll(context, DVE_PREROLL)
		validateSourcePiecesExist(dvePieces)

		executeActionOfftube(context, AdlibActionType.SELECT_FULL_GRAFIK, selectFullGrafikAction)

		dvePieces = getDVEPieces(context, 'next')
		const fullGrafikPieces = getFullGrafikPieces(context, 'next')

		validateNextPartExistsWithDuration(context, 0)
		validateNextPartExistsWithPreRoll(context, FULL_PREROLL)
		validateNextPartExistsWithTransitionKeepAlive(context, FULL_KEEPALIVE)
		validateOnlySelectionIsPreserved(dvePieces)
		validateSourcePiecesExist(fullGrafikPieces)
	})

	it('DVE -> VO', () => {
		const context = new MockContext(SEGMENT_ID, currentPartMock, [kamPieceInstance])

		executeActionOfftube(context, AdlibActionType.SELECT_DVE, selectDVEActionMorbarn)

		let dvePieces = getDVEPieces(context, 'next')
		validateSourcePiecesExist(dvePieces)
		validateNextPartExistsWithDuration(context, 0)
		validateNextPartExistsWithPreRoll(context, DVE_PREROLL)

		executeActionOfftube(context, AdlibActionType.SELECT_SERVER_CLIP, selectVOClipAction)

		dvePieces = getDVEPieces(context, 'next')
		const voPieces = getVOPieces(context, 'next')

		validateNextPartExistsWithDuration(context, VO_DURATION_A)
		validateNextPartExistsWithPreRoll(context, SERVER_PREROLL)
		validateOnlySelectionIsPreserved(dvePieces)
		validateSourcePiecesExist(voPieces)
	})

	it('DVE -> CAM', () => {
		const context = new MockContext(SEGMENT_ID, currentPartMock, [kamPieceInstance])

		executeActionOfftube(context, AdlibActionType.SELECT_DVE, selectDVEActionMorbarn)

		let dvePieces = getDVEPieces(context, 'next')
		validateSourcePiecesExist(dvePieces)
		validateNextPartExistsWithDuration(context, 0)
		validateNextPartExistsWithPreRoll(context, DVE_PREROLL)

		executeActionOfftube(context, AdlibActionType.CUT_TO_CAMERA, selectCameraAction)

		dvePieces = getDVEPieces(context, 'next')
		const camPiece = getCameraPiece(context, 'next')

		validateNextPartExistsWithDuration(context, 0)
		validateOnlySelectionIsPreserved(dvePieces)
		validateCameraPiece(camPiece)
	})

	it('DVE -> LIVE', () => {
		const context = new MockContext(SEGMENT_ID, currentPartMock, [kamPieceInstance])

		executeActionOfftube(context, AdlibActionType.SELECT_DVE, selectDVEActionMorbarn)

		let dvePieces = getDVEPieces(context, 'next')
		validateSourcePiecesExist(dvePieces)
		validateNextPartExistsWithDuration(context, 0)
		validateNextPartExistsWithPreRoll(context, DVE_PREROLL)

		executeActionOfftube(context, AdlibActionType.CUT_TO_REMOTE, selectLiveAction)

		dvePieces = getDVEPieces(context, 'next')
		const remotePiece = getRemotePiece(context, 'next')

		validateNextPartExistsWithDuration(context, 0)
		validateOnlySelectionIsPreserved(dvePieces)
		validateRemotePiece(remotePiece)
	})

	it('Server (01234A) -> DVE (morbarn) -> VO (VOVOA) -> DVE (barnmor) -> CAM (1) -> LIVE (2) -> SERVER (01234A) -> Commentator Select DVE', () => {
		const context = new MockContext(SEGMENT_ID, currentPartMock, [kamPieceInstance])

		// SERVER (A)
		executeActionOfftube(context, AdlibActionType.SELECT_SERVER_CLIP, selectServerClipAction)

		let serverPieces = getServerPieces(context, 'next')

		validateNextPartExistsWithDuration(context, SERVER_DURATION_A)
		validateNextPartExistsWithPreRoll(context, SERVER_PREROLL)
		validateSourcePiecesExist(serverPieces)

		// DVE (A)
		executeActionOfftube(context, AdlibActionType.SELECT_DVE, selectDVEActionMorbarn)

		serverPieces = getServerPieces(context, 'next')
		let dvePieces = getDVEPieces(context, 'next')

		validateNextPartExistsWithDuration(context, 0)
		validateNextPartExistsWithPreRoll(context, DVE_PREROLL)
		validateOnlySelectionIsPreserved(serverPieces)
		validateSourcePiecesExist(dvePieces)

		// VO (A)
		executeActionOfftube(context, AdlibActionType.SELECT_SERVER_CLIP, selectVOClipAction)

		let voPieces = getVOPieces(context, 'next')
		serverPieces = getServerPieces(context, 'next')
		dvePieces = getDVEPieces(context, 'next')

		validateNextPartExistsWithDuration(context, VO_DURATION_A)
		validateNextPartExistsWithPreRoll(context, SERVER_PREROLL)
		validateSelectionRemoved(serverPieces)
		validateOnlySelectionIsPreserved(dvePieces)
		validateSourcePiecesExist(voPieces)

		// DVE (B)
		expect(dvePieces.dataStore?.piece.name).toEqual('morbarn')
		executeActionOfftube(context, AdlibActionType.SELECT_DVE, selectDVEActionBarnmor)

		voPieces = getVOPieces(context, 'next')
		serverPieces = getServerPieces(context, 'next')
		dvePieces = getDVEPieces(context, 'next')

		validateNextPartExistsWithDuration(context, 0)
		validateNextPartExistsWithPreRoll(context, DVE_PREROLL)
		validateSourcePiecesExist(dvePieces)
		validateSelectionRemoved(serverPieces)
		validateOnlySelectionIsPreserved(voPieces)
		expect(dvePieces.dataStore?.piece.name).toEqual('barnmor')

		// CAM (1)
		executeActionOfftube(context, AdlibActionType.CUT_TO_CAMERA, selectCameraAction)

		voPieces = getVOPieces(context, 'next')
		serverPieces = getServerPieces(context, 'next')
		dvePieces = getDVEPieces(context, 'next')
		let camPiece = getCameraPiece(context, 'next')

		validateNextPartExistsWithDuration(context, 0)
		validateOnlySelectionIsPreserved(voPieces)
		validateOnlySelectionIsPreserved(dvePieces)
		validateSelectionRemoved(serverPieces)
		validateCameraPiece(camPiece)

		// LIVE (2)
		executeActionOfftube(context, AdlibActionType.CUT_TO_REMOTE, selectLiveAction)

		voPieces = getVOPieces(context, 'next')
		serverPieces = getServerPieces(context, 'next')
		dvePieces = getDVEPieces(context, 'next')
		camPiece = getCameraPiece(context, 'next')
		let remotePiece = getRemotePiece(context, 'next')

		validateNextPartExistsWithDuration(context, 0)
		validateOnlySelectionIsPreserved(voPieces)
		validateOnlySelectionIsPreserved(dvePieces)
		validateSelectionRemoved(serverPieces)
		expect(camPiece).toBeFalsy()
		validateRemotePiece(remotePiece)

		// SERVER (A)
		executeActionOfftube(context, AdlibActionType.SELECT_SERVER_CLIP, selectServerClipAction)

		voPieces = getVOPieces(context, 'next')
		serverPieces = getServerPieces(context, 'next')
		dvePieces = getDVEPieces(context, 'next')
		camPiece = getCameraPiece(context, 'next')
		remotePiece = getRemotePiece(context, 'next')

		validateNextPartExistsWithDuration(context, SERVER_DURATION_A)
		validateNextPartExistsWithPreRoll(context, SERVER_PREROLL)
		validateSelectionRemoved(voPieces)
		validateOnlySelectionIsPreserved(dvePieces)
		validateSourcePiecesExist(serverPieces)
		expect(camPiece).toBeFalsy()
		expect(remotePiece).toBeFalsy()

		// Commentator Select DVE
		executeActionOfftube(context, AdlibActionType.COMMENTATOR_SELECT_DVE, commentatorSelectDVE)

		voPieces = getVOPieces(context, 'next')
		serverPieces = getServerPieces(context, 'next')
		dvePieces = getDVEPieces(context, 'next')
		camPiece = getCameraPiece(context, 'next')
		remotePiece = getRemotePiece(context, 'next')

		validateNextPartExistsWithDuration(context, 0)
		validateNextPartExistsWithPreRoll(context, DVE_PREROLL)
		validateSelectionRemoved(voPieces)
		validateOnlySelectionIsPreserved(serverPieces)
		validateSourcePiecesExist(dvePieces)
		expect(camPiece).toBeFalsy()
		expect(remotePiece).toBeFalsy()
		expect(dvePieces.activePiece?.piece.name).toEqual('barnmor')
	})

	it('CAM -> MIX 20 (No Take) -> LIVE (2)', () => {
		const context = new MockContext(SEGMENT_ID, currentPartMock, [kamPieceInstance])

		executeActionOfftube(context, AdlibActionType.CUT_TO_CAMERA, selectCameraAction)

		let camPiece = getCameraPiece(context, 'next')

		validateNextPartExistsWithDuration(context, 0)
		validateCameraPiece(camPiece)
		expectATEMToCut(camPiece!)

		executeActionOfftube(context, AdlibActionType.TAKE_WITH_TRANSITION, setMIX20AsTransition)

		camPiece = getCameraPiece(context, 'next')

		validateNextPartExistsWithDuration(context, 0)
		validateCameraPiece(camPiece)
		expectATEMToMixOver(camPiece!, 20)

		executeActionOfftube(context, AdlibActionType.CUT_TO_REMOTE, selectLiveAction)

		const livePiece = getRemotePiece(context, 'next')
		camPiece = getCameraPiece(context, 'next')

		expect(camPiece).toBeFalsy()
		validateNextPartExistsWithDuration(context, 0)
		validateRemotePiece(livePiece)
		expectATEMToMixOver(livePiece!, 20)
	})

	it('CAM -> MIX 20 (No Take) -> SERVER', () => {
		const context = new MockContext(SEGMENT_ID, currentPartMock, [kamPieceInstance])

		executeActionOfftube(context, AdlibActionType.CUT_TO_CAMERA, selectCameraAction)

		let camPiece = getCameraPiece(context, 'next')

		validateNextPartExistsWithDuration(context, 0)
		validateCameraPiece(camPiece)
		expectATEMToCut(camPiece!)

		executeActionOfftube(context, AdlibActionType.TAKE_WITH_TRANSITION, setMIX20AsTransition)

		camPiece = getCameraPiece(context, 'next')

		validateNextPartExistsWithDuration(context, 0)
		validateCameraPiece(camPiece)
		expectATEMToMixOver(camPiece!, 20)

		executeActionOfftube(context, AdlibActionType.SELECT_SERVER_CLIP, selectServerClipAction)

		const serverPieces = getServerPieces(context, 'next')
		camPiece = getCameraPiece(context, 'next')

		validateNextPartExistsWithDuration(context, SERVER_DURATION_A)
		validateNextPartExistsWithPreRoll(context, SERVER_PREROLL)
		validateSourcePiecesExist(serverPieces)
		expect(camPiece).toBeFalsy()
		expectATEMToMixOver(serverPieces.activePiece!, 20)
	})

	it('CAM -> MIX 20 (No Take) -> VO', () => {
		const context = new MockContext(SEGMENT_ID, currentPartMock, [kamPieceInstance])

		executeActionOfftube(context, AdlibActionType.CUT_TO_CAMERA, selectCameraAction)

		let camPiece = getCameraPiece(context, 'next')

		validateNextPartExistsWithDuration(context, 0)
		validateCameraPiece(camPiece)
		expectATEMToCut(camPiece!)

		executeActionOfftube(context, AdlibActionType.TAKE_WITH_TRANSITION, setMIX20AsTransition)

		camPiece = getCameraPiece(context, 'next')

		validateNextPartExistsWithDuration(context, 0)
		validateCameraPiece(camPiece)
		expectATEMToMixOver(camPiece!, 20)

		executeActionOfftube(context, AdlibActionType.SELECT_SERVER_CLIP, selectVOClipAction)

		const serverPieces = getVOPieces(context, 'next')
		camPiece = getCameraPiece(context, 'next')

		validateNextPartExistsWithDuration(context, VO_DURATION_A)
		validateNextPartExistsWithPreRoll(context, SERVER_PREROLL)
		validateSourcePiecesExist(serverPieces)
		expect(camPiece).toBeFalsy()
		expectATEMToMixOver(serverPieces.activePiece!, 20)
	})

	it('CAM -> MIX 20 (No Take) -> DVE', () => {
		const context = new MockContext(SEGMENT_ID, currentPartMock, [kamPieceInstance])

		executeActionOfftube(context, AdlibActionType.CUT_TO_CAMERA, selectCameraAction)

		let camPiece = getCameraPiece(context, 'next')

		validateNextPartExistsWithDuration(context, 0)
		validateCameraPiece(camPiece)
		expectATEMToCut(camPiece!)

		executeActionOfftube(context, AdlibActionType.TAKE_WITH_TRANSITION, setMIX20AsTransition)

		camPiece = getCameraPiece(context, 'next')

		validateNextPartExistsWithDuration(context, 0)
		validateCameraPiece(camPiece)
		expectATEMToMixOver(camPiece!, 20)

		executeActionOfftube(context, AdlibActionType.SELECT_DVE, selectDVEActionMorbarn)

		const dvePieces = getDVEPieces(context, 'next')
		validateNextPartExistsWithDuration(context, 0)
		validateNextPartExistsWithPreRoll(context, DVE_PREROLL)
		validateSourcePiecesExist(dvePieces)
		expectATEMToMixOver(dvePieces.activePiece!, 20)
	})
})
