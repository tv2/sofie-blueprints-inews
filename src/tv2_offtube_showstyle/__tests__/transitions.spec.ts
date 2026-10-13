import {
	BlueprintResultPart,
	ConfigManifestEntryType,
	IBlueprintPiece,
	IBlueprintPieceType,
	IBlueprintResolvedPieceInstance,
	IngestSegment,
	OnGenerateTimelineObj,
	PieceLifespan,
	TSR
} from 'blueprints-integration'
import {
	ApplyUnderlyingMixToPieces,
	assignMediaPlayers,
	literal,
	PartDefinitionUnknown,
	PieceMetaData,
	TableConfigItemBreakers,
	TimelineBlueprintExt
} from 'tv2-common'
import { CueType, PartType, SharedOutputLayers } from 'tv2-constants'
import { makeMockAFVDContext, SegmentUserContext } from '../../__mocks__/context'
import { defaultShowStyleConfig, defaultStudioConfig } from '../../tv2_afvd_showstyle/__tests__/configs'
import { getSegment as getGallerySegment } from '../../tv2_afvd_showstyle/getSegment'
import { AtemLLayer } from '../../tv2_afvd_studio/layers'
import { parseConfig as parseStudioConfig } from '../../tv2_offtube_studio/helpers/config'
import { OfftubeAtemLLayer, OfftubeCasparLLayer, OfftubeSisyfosLLayer } from '../../tv2_offtube_studio/layers'
import mappingsDefaults from '../../tv2_offtube_studio/migrations/mappings-defaults'
import { showStyleConfigManifest } from '../config-manifests'
import { OfftubeEvaluateJingle } from '../cues/OfftubeJingle'
import { getSegment } from '../getSegment'
import { getConfig, parseConfig as parseShowStyleConfig } from '../helpers/config'
import { OfftubeSourceLayer } from '../layers'

const BREAKER: TableConfigItemBreakers = {
	BreakerName: '1',
	ClipName: 'WIPE',
	Duration: 50,
	StartAlpha: 20,
	EndAlpha: 30,
	Autonext: false,
	LoadFirstFrame: true
}

class MixTestContext extends SegmentUserContext {
	public readonly currentPartInstance = undefined
	public readonly nextPartInstance = undefined
	public readonly previousPartInstance = undefined
	public getCurrentTime = () => 10000
	public getPieceABSessionId = (_piece: unknown, session: string) => session
	public getTimelineObjectAbSessionId = (_obj: unknown, session: string) => session
}

function makeContext(overrides: Partial<TableConfigItemBreakers> = {}, preroll: number = 200) {
	const context = new MixTestContext('mix test', mappingsDefaults, parseStudioConfig, parseShowStyleConfig)
	context.studioConfig = { ...JSON.parse(JSON.stringify(defaultStudioConfig)), CasparPrerollDuration: preroll }
	context.showStyleConfig = {
		...JSON.parse(JSON.stringify(defaultShowStyleConfig)),
		BreakerConfig: [{ ...BREAKER, ...overrides }]
	}
	return context
}

function makeSegment(cue: string): IngestSegment {
	return {
		externalId: 'mix-segment',
		name: 'Breaker mix',
		rank: 0,
		parts: [],
		payload: {
			rundownId: 'mix-rundown',
			iNewsStory: {
				fields: {
					pageNumber: '1',
					title: 'Breaker mix',
					videoId: 'TEST_VIDEO',
					tapeTime: '10',
					audioTime: '0',
					totalTime: '10',
					modifyDate: '1583748300'
				},
				meta: { words: '0', rate: '160' },
				cues: [],
				id: '00000000:00000000:00000001',
				body: `\r\n<p><pi>${cue}</pi></p>`,
				fileId: '00000000:00000000:00000001',
				identifier: 'mix-segment'
			},
			modified: '1583748300',
			externalId: 'mix-segment',
			rank: 0,
			name: 'Breaker mix',
			float: false
		}
	}
}

function getME(part: BlueprintResultPart, layer: string = OfftubeAtemLLayer.AtemMEClean) {
	const objects = part.pieces.flatMap(p => p.content?.timelineObjects ?? []) as TSR.TSRTimelineObj[]
	const me = objects.find(
		(obj): obj is TSR.TimelineObjAtemME & TimelineBlueprintExt =>
			obj.layer === layer &&
			obj.content.deviceType === TSR.DeviceType.ATEM &&
			obj.content.type === TSR.TimelineContentTypeAtem.ME
	)
	expect(me).toBeDefined()
	return me!
}

describe('QBox underlying breaker mix', () => {
	it.each([0, 1, 10])('remains a cut by default with %i opaque frames', async opaque => {
		const context = makeContext({ EndAlpha: 30 - opaque })
		const { parts } = await getSegment(context, makeSegment('KAM 1 EFFEKT 1'))
		expect(getME(parts[0]).content.me.transition).toBe(TSR.AtemTransitionStyle.CUT)
		expect(parts[0].part.inTransition).toEqual({
			blockTakeDuration: 2200,
			previousPartKeepaliveDuration: 1000,
			partContentDelayDuration: 1000 + opaque * 40
		})
		expect(context.getNotes()).toEqual([])
	})

	it.each([0, 1, 10])('mixes when enabled regardless of %i opaque frames', async opaque => {
		const context = makeContext({ MixUnderBreaker: true, EndAlpha: 30 - opaque })
		const { parts } = await getSegment(context, makeSegment('KAM 1 EFFEKT 1'))
		expect(getME(parts[0]).content.me).toMatchObject({
			transition: TSR.AtemTransitionStyle.MIX,
			transitionSettings: { mix: { rate: 4 } }
		})
		expect(parts[0].part.inTransition).toEqual({
			blockTakeDuration: 2200,
			previousPartKeepaliveDuration: 1160 + opaque * 40,
			partContentDelayDuration: 1000 + opaque * 40
		})
		expect(context.getNotes()).toEqual([])
	})

	it.each([
		{ UnderlyingMixStartFrame: '', UnderlyingMixDuration: '', start: 1000, end: 1160, rate: 4 },
		{ UnderlyingMixStartFrame: '0', UnderlyingMixDuration: '', start: 200, end: 360, rate: 4 },
		{ UnderlyingMixStartFrame: 0, UnderlyingMixDuration: 6, start: 200, end: 440, rate: 6 },
		{ UnderlyingMixStartFrame: ' 18 ', UnderlyingMixDuration: '6', start: 920, end: 1160, rate: 6 },
		{ UnderlyingMixStartFrame: '', UnderlyingMixDuration: '8', start: 1000, end: 1320, rate: 8 },
		{ UnderlyingMixStartFrame: '49', UnderlyingMixDuration: '10', start: 2160, end: 2560, rate: 10 }
	])('uses independent start/duration overrides: %j', async ({ start, end, rate, ...overrides }) => {
		const context = makeContext({ MixUnderBreaker: true, ...overrides })
		const { parts } = await getSegment(context, makeSegment('KAM 1 EFFEKT 1'))
		expect(parts[0].part.inTransition).toEqual({
			blockTakeDuration: Math.max(2200, end),
			previousPartKeepaliveDuration: end,
			partContentDelayDuration: start
		})
		expect(getME(parts[0]).content.me.transitionSettings?.mix?.rate).toBe(rate)
		expect(context.getNotes()).toEqual([])
	})

	it.each(['SERVER', 'VO'])('preserves %s preroll, session and preview with an early mix', async cue => {
		for (const preroll of [0, 200, 480]) {
			const context = makeContext({ MixUnderBreaker: true, UnderlyingMixStartFrame: '0' }, preroll)
			const { parts } = await getSegment(context, makeSegment(`${cue} EFFEKT 1`))
			const part = parts[0]
			const me = getME(part)
			const pgm = part.pieces.find(p => p.outputLayerId === SharedOutputLayers.PGM)!
			const selection = part.pieces.find(
				p =>
					p.sourceLayerId === OfftubeSourceLayer.SelectedServer ||
					p.sourceLayerId === OfftubeSourceLayer.SelectedVoiceOver
			)!
			const preview = getME(part, OfftubeAtemLLayer.AtemMENext)
			expect(part.part.inTransition).toEqual({
				blockTakeDuration: 2000 + preroll,
				previousPartKeepaliveDuration: preroll + 160,
				partContentDelayDuration: preroll
			})
			expect(pgm.prerollDuration).toBe(preroll)
			expect(selection.prerollDuration).toBe(preroll)
			expect(me.enable).toEqual({ start: preroll })
			expect(me.content.me).toMatchObject({
				input: -1,
				transition: TSR.AtemTransitionStyle.MIX,
				transitionSettings: { mix: { rate: 4 } }
			})
			expect(me.metaData?.mediaPlayerSession).toBeTruthy()
			expect((pgm.metaData as PieceMetaData).mediaPlayerSessions).toContain(me.metaData?.mediaPlayerSession)
			expect((selection.metaData as PieceMetaData).mediaPlayerSessions).toContain(me.metaData?.mediaPlayerSession)
			expect(preview.metaData?.mediaPlayerSession).toBe(me.metaData?.mediaPlayerSession)
			expect(preview.content.me.transition).toBeUndefined()
			// Core offsets a preroll piece by its preroll; its ME command adds that back, not the mix delay again.
			expect(part.part.inTransition!.partContentDelayDuration - pgm.prerollDuration! + preroll).toBe(preroll)
			expect(context.getNotes()).toEqual([])
		}
	})

	it('leaves breaker playback, keying and audio untouched', async () => {
		const plain = await getSegment(makeContext(), makeSegment('KAM 1 EFFEKT 1'))
		const mixed = await getSegment(makeContext({ MixUnderBreaker: true }), makeSegment('KAM 1 EFFEKT 1'))
		const plainEffect = plain.parts[0].pieces.find(p => p.pieceType === IBlueprintPieceType.InTransition)!
		const mixedEffect = mixed.parts[0].pieces.find(p => p.pieceType === IBlueprintPieceType.InTransition)!
		expect(mixedEffect.content).toEqual(plainEffect.content)
		expect(mixedEffect.enable).toEqual(plainEffect.enable)
	})

	it('assigns distinct A/B players while outgoing and incoming servers overlap', async () => {
		const context = makeContext({ MixUnderBreaker: true })
		const outgoing = (await getSegment(context, makeSegment('SERVER'))).parts[0]
		const incomingSegment = makeSegment('SERVER EFFEKT 1')
		incomingSegment.payload.iNewsStory.fields.videoId = 'NEXT_VIDEO'
		incomingSegment.payload.iNewsStory.identifier = 'next-segment'
		incomingSegment.externalId = 'next-segment'
		const incoming = (await getSegment(context, incomingSegment)).parts[0]
		const timings = incoming.part.inTransition!
		const takeTime = 10000
		const resolved: Array<IBlueprintResolvedPieceInstance<PieceMetaData>> = [outgoing, incoming].flatMap(
			(part, index) =>
				part.pieces
					.filter(p => (p.metaData as PieceMetaData | undefined)?.mediaPlayerSessions)
					.map((piece, pieceIndex) => ({
						_id: `${index}-${pieceIndex}`,
						partInstanceId: `${index}`,
						resolvedStart: index === 0 ? 0 : takeTime + timings.partContentDelayDuration - (piece.prerollDuration ?? 0),
						resolvedDuration: index === 0 ? takeTime + timings.previousPartKeepaliveDuration : undefined,
						piece: { ...piece, _id: `${index}-${pieceIndex}`, metaData: piece.metaData as PieceMetaData }
					}))
		)
		const timeline: OnGenerateTimelineObj[] = resolved.flatMap(piece =>
			piece.piece.content.timelineObjects.map((obj, index) => ({
				...obj,
				id: `${piece._id}-${index}`,
				pieceInstanceId: piece._id
			}))
		)
		const outgoingSession = getME(outgoing).metaData!.mediaPlayerSession!
		const incomingSession = getME(incoming).metaData!.mediaPlayerSession!
		expect(incomingSession).not.toBe(outgoingSession)
		const assignment = assignMediaPlayers(
			context,
			getConfig(context),
			timeline,
			{ 1: [{ sessionId: outgoingSession, playerId: 1, lookahead: false }] },
			resolved,
			{
				Caspar: { ClipPending: OfftubeCasparLLayer.CasparPlayerClipPending },
				Sisyfos: {
					ClipPending: OfftubeSisyfosLLayer.SisyfosSourceClipPending,
					PlayerA: OfftubeSisyfosLLayer.SisyfosSourceServerA,
					PlayerB: OfftubeSisyfosLLayer.SisyfosSourceServerB
				}
			}
		)
		expect(assignment[1]).toContainEqual({ sessionId: outgoingSession, playerId: 1, lookahead: false })
		expect(assignment[2]).toContainEqual({ sessionId: incomingSession, playerId: 2, lookahead: false })
		const incomingME = (timeline as Array<TSR.TimelineObjAtemME & TimelineBlueprintExt>).find(
			obj => obj.layer === OfftubeAtemLLayer.AtemMEClean && obj.metaData?.mediaPlayerSession === incomingSession
		)!
		expect(incomingME.content.me).toMatchObject({
			input: 2,
			transition: TSR.AtemTransitionStyle.MIX,
			transitionSettings: { mix: { rate: 4 } }
		})
		expect(resolved.filter(p => p.partInstanceId === '0').every(p => p.resolvedDuration === 11160)).toBe(true)
		expect(context.getNotes()).toEqual([])
	})

	it('is idempotent and does not change other MEs or delayed source pieces', async () => {
		const { parts } = await getSegment(makeContext({ MixUnderBreaker: true }), makeSegment('KAM 1 EFFEKT 1'))
		const pieces = parts[0].pieces
		const source = pieces.find(p => p.outputLayerId === SharedOutputLayers.PGM)!
		const delayed: IBlueprintPiece = {
			...source,
			enable: { start: 500 },
			content: {
				timelineObjects: [
					literal<TSR.TimelineObjAtemME>({
						...getME(parts[0]),
						content: { ...getME(parts[0]).content, me: { input: 5, transition: TSR.AtemTransitionStyle.CUT } }
					})
				]
			}
		}
		pieces.push(delayed)
		const before = JSON.parse(JSON.stringify(pieces))
		ApplyUnderlyingMixToPieces(pieces, OfftubeAtemLLayer.AtemMEClean)
		ApplyUnderlyingMixToPieces(pieces, OfftubeAtemLLayer.AtemMEClean)
		expect(pieces).toEqual(before)
		expect(getME(parts[0], OfftubeAtemLLayer.AtemMENext).content.me.transition).toBeUndefined()
	})

	it.each<Partial<TableConfigItemBreakers>>([
		{ UnderlyingMixDuration: '0' },
		{ UnderlyingMixDuration: -1 },
		{ UnderlyingMixDuration: 256 },
		{ UnderlyingMixDuration: '1.5' },
		{ UnderlyingMixDuration: 'oops' },
		{ UnderlyingMixDuration: Infinity },
		{ UnderlyingMixStartFrame: -1 },
		{ UnderlyingMixStartFrame: '51' },
		{ UnderlyingMixStartFrame: '0x10' },
		{ UnderlyingMixStartFrame: NaN },
		{ Duration: 0 },
		{ StartAlpha: -1 },
		{ EndAlpha: 31 }
	])('reports invalid enabled mix settings: %j', async overrides => {
		const context = makeContext({ MixUnderBreaker: true, ...overrides })
		const { parts } = await getSegment(context, makeSegment('KAM 1 EFFEKT 1'))
		expect(context.getNotes()).toEqual([
			expect.objectContaining({ message: expect.stringContaining('Invalid underlying mix for breaker 1') })
		])
		expect(parts[0].pieces.some(p => p.pieceType === IBlueprintPieceType.InTransition)).toBe(false)
	})

	it('ignores overrides when mixing is off', async () => {
		const context = makeContext({ MixUnderBreaker: false, UnderlyingMixDuration: 'invalid' })
		const { parts } = await getSegment(context, makeSegment('KAM 1 EFFEKT 1'))
		expect(getME(parts[0]).content.me.transition).toBe(TSR.AtemTransitionStyle.CUT)
		expect(context.getNotes()).toEqual([])
	})

	it('does not enable the feature in gallery', async () => {
		const context = makeMockAFVDContext({ CasparPrerollDuration: 200 })
		context.showStyleConfig = {
			...context.showStyleConfig,
			BreakerConfig: [{ _id: '1', ...BREAKER, MixUnderBreaker: true }]
		}
		const { parts } = await getGallerySegment(context, makeSegment('KAM 1 EFFEKT 1'))
		expect(getME(parts[0], AtemLLayer.AtemMEProgram).content.me.transition).toBe(TSR.AtemTransitionStyle.CUT)
		expect(parts[0].part.inTransition?.previousPartKeepaliveDuration).toBe(1000)
		expect(context.getNotes()).toEqual([])
	})

	it('does not change standalone jingles', () => {
		const definition: PartDefinitionUnknown = {
			type: PartType.Unknown,
			externalId: 'jingle',
			rawType: '',
			script: '',
			fields: {},
			modified: 0,
			storyName: 'story',
			segmentExternalId: 'segment',
			cues: [{ type: CueType.Jingle, clip: '1', iNewsCommand: 'JINGLE 1' }]
		}
		const outputs = [false, true].map(mixUnderBreaker => {
			const context = makeContext({
				MixUnderBreaker: mixUnderBreaker,
				UnderlyingMixStartFrame: '18',
				UnderlyingMixDuration: '6'
			})
			const pieces: Array<IBlueprintPiece<PieceMetaData>> = []
			OfftubeEvaluateJingle(
				context,
				getConfig(context),
				pieces,
				[],
				[],
				{ type: CueType.Jingle, clip: '1', iNewsCommand: 'JINGLE 1' },
				definition
			)
			expect(context.getNotes()).toEqual([])
			return pieces
		})
		expect(outputs[1]).toEqual(outputs[0])
		expect(outputs[1][0].lifespan).toBe(PieceLifespan.WithinPart)
	})

	it('exposes opt-in and blank defaults only in the breaker table', () => {
		const manifest = showStyleConfigManifest.find(entry => entry.id === 'BreakerConfig')
		if (!manifest || manifest.type !== ConfigManifestEntryType.TABLE) {
			throw new Error('Missing breaker table')
		}
		expect([...manifest.columns].sort((a, b) => a.rank - b.rank).slice(-3)).toMatchObject([
			{ id: 'UnderlyingMixStartFrame', name: 'Underlying mix start frame', required: false, defaultVal: '' },
			{ id: 'UnderlyingMixDuration', name: 'Underlying mix duration (frames)', required: false, defaultVal: '' },
			{ id: 'MixUnderBreaker', name: 'Underlying mix', defaultVal: false }
		])
	})
})
