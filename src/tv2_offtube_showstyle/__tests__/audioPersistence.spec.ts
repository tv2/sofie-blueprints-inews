import {
	IBlueprintAdLibPiece,
	IBlueprintPartInstance,
	IBlueprintPiece,
	IBlueprintPieceInstance,
	IBlueprintResolvedPieceInstance,
	ITimelineEventContext,
	PieceLifespan,
	TSR
} from 'blueprints-integration'
import {
	ActionSelectServerClip,
	CreatePartServerBase,
	createSisyfosPersistedLevelsTimelineObject,
	CueDefinitionGraphic,
	CueDefinitionJingle,
	EvaluateEksternBase,
	getEndStateForPart,
	GraphicInternalOrPilot,
	PartDefinition,
	PartEndStateExt,
	PieceMetaData,
	RemoteType,
	SourceDefinitionRemote
} from 'tv2-common'
import { AdlibActionType, CueType, PartType, SharedOutputLayers, SourceType } from 'tv2-constants'
import { ActionExecutionContext, SegmentUserContext } from '../../__mocks__/context'
import { defaultShowStyleConfig, defaultStudioConfig } from '../../tv2_afvd_showstyle/__tests__/configs'
import { parseConfig as parseStudioConfig } from '../../tv2_offtube_studio/helpers/config'
import { OfftubeAtemLLayer, OfftubeCasparLLayer, OfftubeSisyfosLLayer } from '../../tv2_offtube_studio/layers'
import mappingsDefaults from '../../tv2_offtube_studio/migrations/mappings-defaults'
import { executeActionOfftube } from '../actions'
import { OfftubeEvaluateGrafikCaspar } from '../cues/OfftubeGraphics'
import { OfftubeEvaluateJingle } from '../cues/OfftubeJingle'
import { getRundown } from '../getRundown'
import { getConfig, parseConfig as parseShowStyleConfig } from '../helpers/config'
import { OfftubeSourceLayer } from '../layers'
import { onTimelineGenerateOfftube } from '../onTimelineGenerate'
import { OfftubeCreatePartServer } from '../parts/OfftubeServer'

const REPORTER_LAYERS = ['reporter_left', 'reporter_right']
const LIVE_SOURCE: SourceDefinitionRemote = {
	sourceType: SourceType.REMOTE,
	remoteType: RemoteType.LIVE,
	id: '1',
	name: 'LIVE 1',
	raw: 'LIVE 1'
}
const PART: IBlueprintPartInstance = {
	_id: 'part',
	segmentId: 'story',
	rehearsal: false,
	part: { _id: 'part', segmentId: 'story', externalId: 'part', title: 'Part' }
}
const PERSISTENT_STATE = { activeMediaPlayers: {}, isNewSegment: false }
const SERVER_LAYERS = {
	SourceLayer: { PgmServer: OfftubeSourceLayer.PgmServer, SelectedServer: OfftubeSourceLayer.SelectedServer },
	AtemLLayer: { MEPgm: OfftubeAtemLLayer.AtemMEClean },
	Caspar: { ClipPending: OfftubeCasparLLayer.CasparPlayerClipPending },
	Sisyfos: { ClipPending: OfftubeSisyfosLLayer.SisyfosSourceClipPending },
	ATEM: {}
}

class TimelineContext extends SegmentUserContext implements ITimelineEventContext {
	public currentPartInstance = PART
	public previousPartInstance = PART
	public nextPartInstance = undefined

	public getCurrentTime() {
		return 1000
	}

	public getPieceABSessionId(_piece: IBlueprintPieceInstance, session: string) {
		return session
	}

	public getTimelineObjectAbSessionId() {
		return undefined
	}
}

function createContext(wantsToPersistAudio: boolean) {
	const context = new TimelineContext('audio persistence', mappingsDefaults, parseStudioConfig, parseShowStyleConfig)
	Object.assign(context.studioConfig, defaultStudioConfig, {
		GraphicsType: 'HTML',
		SourcesRM: [
			{
				SourceName: '1',
				AtemSource: 3,
				SisyfosLayers: REPORTER_LAYERS,
				StudioMics: false,
				WantsToPersistAudio: wantsToPersistAudio,
				AcceptPersistAudio: false
			}
		]
	})
	Object.assign(context.showStyleConfig, defaultShowStyleConfig)
	return context
}

function createActionContext(context: SegmentUserContext) {
	const actionContext = new ActionExecutionContext(
		'audio persistence',
		mappingsDefaults,
		parseStudioConfig,
		parseShowStyleConfig,
		'rundown',
		'story',
		'part',
		PART,
		[]
	)
	actionContext.studioConfig = context.studioConfig
	actionContext.showStyleConfig = context.showStyleConfig
	return actionContext
}

function definition(vo: boolean): PartDefinition {
	return {
		type: vo ? PartType.VO : PartType.Server,
		externalId: 'clip',
		rawType: vo ? 'VO' : 'SERVER',
		cues: [],
		script: '',
		fields: { videoId: 'CLIP', tapeTime: '10' },
		modified: 0,
		storyName: 'Story',
		segmentExternalId: 'story'
	}
}

function props(vo: boolean) {
	return { voLayer: vo, voLevels: vo, adLibPix: false, totalWords: 0, totalTime: 0, tapeTime: 10 }
}

function clipAction(vo: boolean, adLibPix = false): ActionSelectServerClip {
	return {
		type: AdlibActionType.SELECT_SERVER_CLIP,
		file: 'CLIP',
		duration: 10000,
		voLayer: vo,
		voLevels: vo,
		adLibPix,
		partDefinition: definition(vo)
	}
}

function graphicCue(pilot: boolean, full = false): CueDefinitionGraphic<GraphicInternalOrPilot> {
	return {
		type: CueType.Graphic,
		target: full ? 'FULL' : 'OVL',
		graphic: pilot
			? { type: 'pilot', name: 'GRAPHIC', vcpid: 1234, continueCount: -1 }
			: { type: 'internal', template: 'bund', cue: 'kg', textFields: ['Reporter'] },
		iNewsCommand: 'GRAFIK'
	}
}

function resolve(pieces: IBlueprintPiece[]): Array<IBlueprintResolvedPieceInstance<PieceMetaData>> {
	return pieces.map((piece, index) => ({
		_id: `piece${index}`,
		partInstanceId: PART._id,
		piece: { ...piece, _id: `piece${index}`, metaData: piece.metaData as PieceMetaData | undefined },
		resolvedStart: piece.enable.start === 'now' ? 500 : piece.enable.start,
		resolvedDuration: piece.enable.duration
	}))
}

function endState(
	context: SegmentUserContext,
	pieces: Array<IBlueprintResolvedPieceInstance<PieceMetaData>>,
	previousPartEndState?: PartEndStateExt,
	isNewSegment = false
): PartEndStateExt {
	return getEndStateForPart(
		context,
		{ ...PERSISTENT_STATE, isNewSegment },
		{ ...PART, previousPartEndState },
		pieces,
		1000
	) as PartEndStateExt
}

async function liveEndState(context: SegmentUserContext, adlib: boolean) {
	let pieces: Array<IBlueprintPiece<PieceMetaData>>
	if (adlib) {
		const actionContext = createActionContext(context)
		await executeActionOfftube(actionContext, AdlibActionType.CUT_TO_REMOTE, {
			type: AdlibActionType.CUT_TO_REMOTE,
			sourceDefinition: LIVE_SOURCE
		})
		pieces = (await actionContext.getPieceInstances('next')).map(p => p.piece)
	} else {
		pieces = []
		EvaluateEksternBase(
			context,
			getConfig(context),
			PART.part,
			pieces,
			[],
			'live',
			{ type: CueType.Ekstern, sourceDefinition: LIVE_SOURCE, iNewsCommand: 'EKSTERN=LIVE 1' },
			definition(false),
			{ SourceLayer: { PgmLive: OfftubeSourceLayer.PgmLive }, ATEM: { MEProgram: OfftubeAtemLLayer.AtemMEClean } }
		)
	}
	expect(pieces).toHaveLength(1)
	return endState(context, resolve(pieces))
}

async function render(
	context: TimelineContext,
	pieces: Array<IBlueprintResolvedPieceInstance<PieceMetaData>>,
	previousPartEndState: PartEndStateExt,
	newStory = false
) {
	context.currentPartInstance = { ...PART, segmentId: newStory ? 'nextStory' : PART.segmentId }
	const result = await onTimelineGenerateOfftube(context, [], PERSISTENT_STATE, previousPartEndState, pieces)
	return result.timeline.find(obj => obj.id === 'sisyfosPersistenceObject') as
		| TSR.TimelineObjSisyfosChannels
		| undefined
}

describe.each([false, true])('QBox LIVE WantsToPersistAudio=%s', wantsToPersistAudio => {
	it.each([
		['adlib SERVER', false, false, false],
		['adlib VO', true, false, false],
		['ADLIBPIX', true, true, false],
		['planned VO', true, false, true],
		['planned SERVER', false, false, true]
	])('%s respects the LIVE mapping and retains clip levels', async (_name, vo, adLibPix, planned) => {
		const context = createContext(wantsToPersistAudio)
		const expectedLayers = wantsToPersistAudio && (!planned || vo) ? REPORTER_LAYERS : []
		let pieces: IBlueprintPiece[]
		if (planned) {
			pieces = (await OfftubeCreatePartServer(context, getConfig(context), definition(vo), props(vo))).pieces
		} else {
			const actionContext = createActionContext(context)
			await executeActionOfftube(actionContext, AdlibActionType.SELECT_SERVER_CLIP, clipAction(vo, adLibPix))
			pieces = (await actionContext.getPieceInstances('next')).map(p => p.piece)
		}
		const resolvedPieces = resolve(pieces)
		for (const adlibLive of [false, true]) {
			const previousState = await liveEndState(context, adlibLive)
			const persisted = await render(context, resolvedPieces, previousState)
			expect(persisted?.content.channels).toEqual(expectedLayers.map(mappedLayer => ({ mappedLayer, isPgm: 1 })))
			expect(endState(context, resolvedPieces, previousState).sisyfosPersistMetaData.sisyfosLayers).toEqual(
				expectedLayers
			)
		}
		const clipAudio = pieces
			.flatMap(piece => piece.content?.timelineObjects ?? [])
			.find(obj => obj.layer === OfftubeSisyfosLLayer.SisyfosSourceClipPending)
		expect(clipAudio?.content).toMatchObject({ isPgm: vo ? 2 : 1 })
	})
})

describe('QBox persistence transitions', () => {
	it.each([false, true])('keeps audio under planned and adlib overlays (pilot=%s)', async pilot => {
		const context = createContext(true)
		const previousState = await liveEndState(context, false)
		const partDefinition = { ...definition(true), cues: [graphicCue(pilot)] }
		const planned = await OfftubeCreatePartServer(context, getConfig(context), partDefinition, props(true))
		expect(planned.pieces.some(piece => piece.outputLayerId === SharedOutputLayers.OVERLAY)).toBe(true)
		expect((await render(context, resolve(planned.pieces), previousState))?.content.channels).toEqual(
			REPORTER_LAYERS.map(mappedLayer => ({ mappedLayer, isPgm: 1 }))
		)

		const actionContext = createActionContext(context)
		await executeActionOfftube(actionContext, AdlibActionType.SELECT_SERVER_CLIP, {
			...clipAction(true),
			partDefinition
		})
		const pieces = (await actionContext.getPieceInstances('next')).map(p => p.piece)
		expect(pieces.some(piece => piece.outputLayerId === SharedOutputLayers.OVERLAY)).toBe(true)
		expect((await render(context, resolve(pieces), previousState))?.content.channels.map(c => c.mappedLayer)).toEqual(
			REPORTER_LAYERS
		)

		const adlibPieces: IBlueprintAdLibPiece[] = []
		OfftubeEvaluateGrafikCaspar(
			getConfig(context),
			context,
			[],
			adlibPieces,
			[],
			'overlay',
			graphicCue(pilot),
			definition(true),
			{ rank: 0 }
		)
		expect(adlibPieces.length).toBeGreaterThan(0)
		for (const adlibPiece of adlibPieces) {
			const overlay = { ...adlibPiece, enable: { start: 500 } }
			expect(
				createSisyfosPersistedLevelsTimelineObject(resolve([...pieces, overlay]), REPORTER_LAYERS).content.channels
			).toEqual(REPORTER_LAYERS.map(mappedLayer => ({ mappedLayer, isPgm: 1 })))
		}
	})

	it('full-screen graphics and jingles still stop persisted audio', async () => {
		const context = createContext(true)
		const config = getConfig(context)
		const previousState = await liveEndState(context, false)
		const fullPieces: IBlueprintPiece[] = []
		OfftubeEvaluateGrafikCaspar(config, context, fullPieces, [], [], 'full', graphicCue(true, true), definition(true))
		expect(fullPieces.length).toBeGreaterThan(0)
		expect((await render(context, resolve(fullPieces), previousState))?.content.channels).toEqual([])

		const jinglePieces: Array<IBlueprintPiece<PieceMetaData>> = []
		const clip = config.showStyle.BreakerConfig[0].BreakerName.toString()
		const jingleCue: CueDefinitionJingle = { type: CueType.Jingle, clip, iNewsCommand: clip }
		OfftubeEvaluateJingle(context, config, jinglePieces, [], [], jingleCue, { ...definition(false), cues: [jingleCue] })
		expect(jinglePieces).toHaveLength(1)
		expect((await render(context, resolve(jinglePieces), previousState))?.content.channels).toEqual([])
	})

	it('retained selections from the next part do not block LIVE or an adlib clip', async () => {
		const context = createContext(true)
		const actionContext = createActionContext(context)
		await executeActionOfftube(actionContext, AdlibActionType.SELECT_SERVER_CLIP, clipAction(false))
		await executeActionOfftube(actionContext, AdlibActionType.CUT_TO_REMOTE, {
			type: AdlibActionType.CUT_TO_REMOTE,
			sourceDefinition: LIVE_SOURCE
		})
		const pieces = await actionContext.getPieceInstances('next')
		expect(pieces.some(piece => piece.piece.sourceLayerId === OfftubeSourceLayer.SelectedServer)).toBe(true)
		expect(endState(context, resolve(pieces.map(p => p.piece))).sisyfosPersistMetaData.sisyfosLayers).toEqual(
			REPORTER_LAYERS
		)

		const selectedFull: IBlueprintPiece<PieceMetaData> = {
			externalId: 'selectedFull',
			name: 'Selected Full',
			enable: { start: 0 },
			lifespan: PieceLifespan.OutOnSegmentEnd,
			sourceLayerId: OfftubeSourceLayer.SelectedAdlibGraphicsFull,
			outputLayerId: SharedOutputLayers.SELECTED_ADLIB,
			metaData: { sisyfosPersistMetaData: { sisyfosLayers: [] } },
			content: { timelineObjects: [] }
		}
		await actionContext.insertPiece('next', selectedFull)
		await executeActionOfftube(actionContext, AdlibActionType.SELECT_SERVER_CLIP, clipAction(false))
		const clipPieces = await actionContext.getPieceInstances('next')
		expect(clipPieces.some(piece => piece.piece.sourceLayerId === OfftubeSourceLayer.SelectedAdlibGraphicsFull)).toBe(
			true
		)
		const persisted = await render(context, resolve(clipPieces.map(p => p.piece)), await liveEndState(context, false))
		expect(persisted?.content.channels.map(channel => channel.mappedLayer)).toEqual(REPORTER_LAYERS)
	})

	it('commentator Server accepts reporter audio even when recalling a planned SERVER selection', async () => {
		const context = createContext(true)
		const planned = await OfftubeCreatePartServer(context, getConfig(context), definition(false), props(false))
		const actionContext = createActionContext(context)
		actionContext.currentPieceInstances = resolve(planned.pieces)
		await executeActionOfftube(actionContext, AdlibActionType.COMMENTATOR_SELECT_SERVER, {
			type: AdlibActionType.COMMENTATOR_SELECT_SERVER
		})
		const pieces = await actionContext.getPieceInstances('next')
		const persisted = await render(context, resolve(pieces.map(p => p.piece)), await liveEndState(context, false))
		expect(persisted?.content.channels.map(channel => channel.mappedLayer)).toEqual(REPORTER_LAYERS)
	})

	it('clears persisted audio on fade-down and does not resurrect it on the following VO', async () => {
		const context = createContext(true)
		const previousState = await liveEndState(context, false)
		const planned = await OfftubeCreatePartServer(context, getConfig(context), definition(true), props(true))
		const actionContext = createActionContext(context)
		actionContext.currentPieceInstances = resolve(planned.pieces)
		jest
			.spyOn(actionContext, 'getResolvedPieceInstances')
			.mockImplementation(async () => resolve(actionContext.currentPieceInstances.map(p => p.piece)))
		await executeActionOfftube(actionContext, AdlibActionType.FADE_DOWN_PERSISTED_AUDIO_LEVELS, {
			type: AdlibActionType.FADE_DOWN_PERSISTED_AUDIO_LEVELS
		})
		const fadedPieces = await actionContext.getResolvedPieceInstances('current')
		expect((await render(context, fadedPieces, previousState))?.content.channels).toEqual([])
		const fadedState = endState(context, fadedPieces, previousState)
		expect(fadedState.sisyfosPersistMetaData.sisyfosLayers).toEqual([])
		expect((await render(context, resolve(planned.pieces), fadedState))?.content.channels).toEqual([])
	})

	it('can repeat fade-down when only earlier fade-down pieces remain', async () => {
		const context = createContext(true)
		const actionContext = createActionContext(context)
		jest
			.spyOn(actionContext, 'getResolvedPieceInstances')
			.mockImplementation(async () => resolve(actionContext.currentPieceInstances.map(p => p.piece)))
		for (let i = 0; i < 2; i++) {
			await executeActionOfftube(actionContext, AdlibActionType.FADE_DOWN_PERSISTED_AUDIO_LEVELS, {
				type: AdlibActionType.FADE_DOWN_PERSISTED_AUDIO_LEVELS
			})
		}
		expect(actionContext.currentPieceInstances).toHaveLength(2)
	})

	it('exposes the fade-down action in the QBox rundown', () => {
		const result = getRundown(createContext(true), {
			externalId: 'rundown',
			name: 'Rundown',
			type: 'inews',
			payload: {},
			segments: []
		})
		expect(
			result.globalActions?.filter(action => action.actionId === AdlibActionType.FADE_DOWN_PERSISTED_AUDIO_LEVELS)
		).toHaveLength(1)
	})

	it('does not carry LIVE audio into a VO in a new story', async () => {
		const context = createContext(true)
		const previousState = await liveEndState(context, false)
		const planned = await OfftubeCreatePartServer(context, getConfig(context), definition(true), props(true))
		const pieces = resolve(planned.pieces)
		expect(await render(context, pieces, previousState, true)).toBeUndefined()
		expect(endState(context, pieces, previousState, true).sisyfosPersistMetaData.sisyfosLayers).toEqual([])
	})
})

describe('Shared server defaults used by gallery', () => {
	it.each([
		[false, false, false],
		[true, false, false],
		[true, true, true]
	])('vo=%s, adLibPix=%s accepts persisted audio=%s', async (vo, adLibPix, accepts) => {
		const context = createContext(true)
		const part = await CreatePartServerBase(
			context,
			getConfig(context),
			definition(vo),
			{ ...props(vo), adLibPix },
			SERVER_LAYERS
		)
		const persisted = createSisyfosPersistedLevelsTimelineObject(resolve(part.part.pieces), REPORTER_LAYERS)
		expect(persisted.content.channels.map(channel => channel.mappedLayer)).toEqual(accepts ? REPORTER_LAYERS : [])
	})
})
