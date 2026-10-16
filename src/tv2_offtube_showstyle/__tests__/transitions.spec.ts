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
	ApplyUnderlyingTransitionToPieces,
	assignMediaPlayers,
	literal,
	PartDefinitionUnknown,
	PieceMetaData,
	TableConfigItemBreakers,
	TableConfigItemUnderlyingTransition,
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
import { showStyleConfigManifest, underlyingTransitionsManifest } from '../config-manifests'
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

function makeContext(
	overrides: Partial<TableConfigItemBreakers> = {},
	preroll: number = 200,
	transition: Partial<TableConfigItemUnderlyingTransition> = {}
) {
	const context = new MixTestContext('mix test', mappingsDefaults, parseStudioConfig, parseShowStyleConfig)
	context.studioConfig = { ...JSON.parse(JSON.stringify(defaultStudioConfig)), CasparPrerollDuration: preroll }
	context.showStyleConfig = {
		...JSON.parse(JSON.stringify(defaultShowStyleConfig)),
		BreakerConfig: [{ ...BREAKER, UnderlyingTransition: 'Test', ...overrides }],
		UnderlyingTransitions: [{ Name: 'Test', Type: 'Mix', ...transition }]
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
	it.each(['KAM 1', 'SERVER', 'VO'])('applies every dot-wipe control to %s without changing preview', async cue => {
		const context = makeContext(
			{
				EnableUnderlyingTransition: true,
				UnderlyingTransition: ' test ',
				UnderlyingTransitionStartFrame: 18,
				UnderlyingTransitionDuration: 6
			},
			200,
			{
				Type: 'Dot wipe',
				BorderWidth: 1200,
				BorderInput: 2002,
				Symmetry: 6400,
				BorderSoftness: 3500,
				XPosition: 2500,
				YPosition: 7500,
				ReverseDirection: true,
				FlipFlop: true
			}
		)
		const { parts } = await getSegment(context, makeSegment(`${cue} EFFEKT 1`))
		expect(getME(parts[0]).content.me).toMatchObject({
			transition: TSR.AtemTransitionStyle.WIPE,
			transitionSettings: {
				wipe: {
					rate: 6,
					pattern: 7,
					borderWidth: 1200,
					borderInput: 2002,
					symmetry: 6400,
					borderSoftness: 3500,
					xPosition: 2500,
					yPosition: 7500,
					reverseDirection: true,
					flipFlop: true
				}
			}
		})
		expect(getME(parts[0]).content.me.transitionSettings?.mix).toBeUndefined()
		expect(getME(parts[0], OfftubeAtemLLayer.AtemMENext).content.me.transition).toBeUndefined()
		expect(parts[0].part.inTransition).toEqual({
			blockTakeDuration: 2200,
			previousPartKeepaliveDuration: 1160,
			partContentDelayDuration: 920
		})
		const before = JSON.parse(JSON.stringify(parts[0].pieces))
		ApplyUnderlyingTransitionToPieces(parts[0].pieces, OfftubeAtemLLayer.AtemMEClean)
		expect(parts[0].pieces).toEqual(before)
		expect(context.getNotes()).toEqual([])
	})

	it('sends explicit dot defaults rather than inheriting the previous wipe appearance', async () => {
		const context = makeContext({ EnableUnderlyingTransition: true }, 200, { Type: 'Dot wipe' })
		const { parts } = await getSegment(context, makeSegment('KAM 1 EFFEKT 1'))
		expect(getME(parts[0]).content.me.transitionSettings).toEqual({
			wipe: {
				rate: 4,
				pattern: 7,
				borderWidth: 0,
				borderInput: 0,
				symmetry: 5000,
				borderSoftness: 0,
				xPosition: 5000,
				yPosition: 5000,
				reverseDirection: false,
				flipFlop: false
			}
		})
		expect(context.getNotes()).toEqual([])
	})

	it('resolves dropdown IDs even after the preset is renamed', async () => {
		const context = makeContext(
			{ EnableUnderlyingTransition: true, UnderlyingTransition: { value: 'preset-id', label: 'Old name' } },
			200,
			{ _id: 'preset-id', Name: 'Renamed dot', Type: 'Dot wipe' }
		)
		const { parts } = await getSegment(context, makeSegment('KAM 1 EFFEKT 1'))
		expect(getME(parts[0]).content.me.transition).toBe(TSR.AtemTransitionStyle.WIPE)
		expect(context.getNotes()).toEqual([])
	})

	it('resolves dropdown labels when an imported table has different IDs', async () => {
		const context = makeContext(
			{ EnableUnderlyingTransition: true, UnderlyingTransition: { value: 'old-id', label: 'Test' } },
			200,
			{ _id: 'new-id', Type: 'Dot wipe' }
		)
		const { parts } = await getSegment(context, makeSegment('KAM 1 EFFEKT 1'))
		expect(getME(parts[0]).content.me.transition).toBe(TSR.AtemTransitionStyle.WIPE)
		expect(context.getNotes()).toEqual([])
	})

	it.each([0, 10000])('accepts dot control boundary %i and the maximum dot duration', async value => {
		const context = makeContext({ EnableUnderlyingTransition: true, UnderlyingTransitionDuration: 250 }, 200, {
			Type: 'Dot wipe',
			BorderWidth: value,
			BorderInput: 65535,
			Symmetry: value,
			BorderSoftness: value,
			XPosition: value,
			YPosition: value
		})
		const { parts } = await getSegment(context, makeSegment('KAM 1 EFFEKT 1'))
		expect(getME(parts[0]).content.me.transitionSettings?.wipe?.rate).toBe(250)
		expect(parts[0].part.inTransition).toEqual({
			blockTakeDuration: 11000,
			previousPartKeepaliveDuration: 11000,
			partContentDelayDuration: 1000
		})
		expect(context.getNotes()).toEqual([])
	})

	it('lets one preset use each breaker own reveal point', async () => {
		const first = makeContext({ EnableUnderlyingTransition: true }, 200, { Type: 'Dot wipe' })
		const second = makeContext({ EnableUnderlyingTransition: true, EndAlpha: 10 }, 200, { Type: 'Dot wipe' })
		const a = (await getSegment(first, makeSegment('KAM 1 EFFEKT 1'))).parts[0]
		const b = (await getSegment(second, makeSegment('KAM 1 EFFEKT 1'))).parts[0]
		expect(a.part.inTransition?.partContentDelayDuration).toBe(1000)
		expect(b.part.inTransition?.partContentDelayDuration).toBe(1800)
	})

	it.each<TableConfigItemUnderlyingTransition['Type']>(['Mix', 'Dot wipe'])(
		'uses independent breaker timings with the same %s preset',
		async type => {
			const context = makeContext(
				{ EnableUnderlyingTransition: true, UnderlyingTransitionStartFrame: 0, UnderlyingTransitionDuration: 6 },
				200,
				{ Type: type }
			)
			const config = getConfig(context).showStyle
			config.BreakerConfig.push({
				...config.BreakerConfig[0],
				BreakerName: '2',
				UnderlyingTransitionStartFrame: 18,
				UnderlyingTransitionDuration: 10
			})
			const first = (await getSegment(context, makeSegment('KAM 1 EFFEKT 1'))).parts[0]
			const second = (await getSegment(context, makeSegment('KAM 1 EFFEKT 2'))).parts[0]
			const key = type === 'Mix' ? 'mix' : 'wipe'
			expect(getME(first).content.me.transitionSettings?.[key]?.rate).toBe(6)
			expect(getME(second).content.me.transitionSettings?.[key]?.rate).toBe(10)
			expect(first.part.inTransition).toEqual({
				blockTakeDuration: 2200,
				previousPartKeepaliveDuration: 440,
				partContentDelayDuration: 200
			})
			expect(second.part.inTransition).toEqual({
				blockTakeDuration: 2200,
				previousPartKeepaliveDuration: 1320,
				partContentDelayDuration: 920
			})
			expect(config.UnderlyingTransitions).toEqual([{ Name: 'Test', Type: type }])
			expect(context.getNotes()).toEqual([])
		}
	)

	it('rejects breaker durations above the dot-wipe limit', async () => {
		const context = makeContext({ EnableUnderlyingTransition: true, UnderlyingTransitionDuration: 251 }, 200, {
			Type: 'Dot wipe'
		})
		const { parts } = await getSegment(context, makeSegment('KAM 1 EFFEKT 1'))
		expect(context.getNotes()).toEqual([
			expect.objectContaining({ message: expect.stringContaining('transition duration (1 to 250 frames)') })
		])
		expect(parts[0].pieces.some(piece => piece.pieceType === IBlueprintPieceType.InTransition)).toBe(false)
	})

	it.each([
		{ BorderWidth: -1 },
		{ BorderWidth: 10001 },
		{ BorderSoftness: 0.5 },
		{ Symmetry: Infinity },
		{ XPosition: NaN },
		{ YPosition: 10001 },
		{ BorderInput: -1 },
		{ BorderInput: 65536 },
		{ ReverseDirection: 'false' },
		{ FlipFlop: 1 },
		{ BorderWidth: null },
		{ XPosition: '5000' },
		{ Type: 'Other' }
	])('rejects invalid dot settings %j', async overrides => {
		const context = makeContext({ EnableUnderlyingTransition: true }, 200, { Type: 'Dot wipe' })
		Object.assign(getConfig(context).showStyle.UnderlyingTransitions![0], overrides)
		const { parts } = await getSegment(context, makeSegment('KAM 1 EFFEKT 1'))
		expect(context.getNotes()).toEqual([
			expect.objectContaining({ message: expect.stringContaining('Invalid underlying transition for breaker 1') })
		])
		expect(parts[0].pieces.some(piece => piece.pieceType === IBlueprintPieceType.InTransition)).toBe(false)
	})

	it.each(['', 'missing'])('rejects an enabled missing preset reference "%s"', async name => {
		const context = makeContext({ EnableUnderlyingTransition: true, UnderlyingTransition: name })
		const { parts } = await getSegment(context, makeSegment('KAM 1 EFFEKT 1'))
		expect(context.getNotes()).toEqual([
			expect.objectContaining({ message: expect.stringContaining('select a unique name') })
		])
		expect(parts[0].part.inTransition).toBeUndefined()
	})

	it.each([
		{ presets: undefined },
		{ presets: [] },
		{
			presets: [
				{ Name: 'Test', Type: 'Mix' },
				{ Name: ' test ', Type: 'Dot wipe' }
			]
		}
	])('rejects absent presets and duplicate names', async ({ presets }) => {
		const context = makeContext({ EnableUnderlyingTransition: true })
		if (presets === undefined) {
			delete context.showStyleConfig.UnderlyingTransitions
		} else {
			context.showStyleConfig.UnderlyingTransitions = presets.map((preset, index) => ({
				_id: `${index}`,
				...preset
			}))
		}
		const { parts } = await getSegment(context, makeSegment('KAM 1 EFFEKT 1'))
		expect(context.getNotes()).toEqual([
			expect.objectContaining({ message: expect.stringContaining('select a unique name') })
		])
		expect(parts[0].part.inTransition).toBeUndefined()
	})

	it('ignores dot controls for Mix and accepts 255-frame mixes', async () => {
		const context = makeContext({ EnableUnderlyingTransition: true, UnderlyingTransitionDuration: 255 }, 200, {
			BorderWidth: -1,
			XPosition: NaN
		})
		const { parts } = await getSegment(context, makeSegment('KAM 1 EFFEKT 1'))
		expect(getME(parts[0]).content.me.transitionSettings).toEqual({ mix: { rate: 255 } })
		expect(context.getNotes()).toEqual([])
	})

	it('does not require a preset when underlying transitions are disabled', async () => {
		const context = makeContext({ UnderlyingTransition: 'deleted preset' })
		delete context.showStyleConfig.UnderlyingTransitions
		const { parts } = await getSegment(context, makeSegment('KAM 1 EFFEKT 1'))
		expect(getME(parts[0]).content.me.transition).toBe(TSR.AtemTransitionStyle.CUT)
		expect(context.getNotes()).toEqual([])
	})

	it('exposes both transition types and all supported dot controls, but no timing, in the preset table', () => {
		if (underlyingTransitionsManifest.type !== ConfigManifestEntryType.TABLE) {
			throw new Error('Missing underlying transition table')
		}
		expect(underlyingTransitionsManifest.defaultVal).toEqual([])
		expect(underlyingTransitionsManifest.columns.find(column => column.id === 'Type')).toMatchObject({
			type: ConfigManifestEntryType.SELECT,
			options: ['Mix', 'Dot wipe'],
			defaultVal: 'Mix'
		})
		expect(underlyingTransitionsManifest.columns.map(column => column.id)).toEqual([
			'Name',
			'Type',
			'BorderWidth',
			'BorderInput',
			'Symmetry',
			'BorderSoftness',
			'XPosition',
			'YPosition',
			'ReverseDirection',
			'FlipFlop'
		])
	})

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
		const context = makeContext({ EnableUnderlyingTransition: true, EndAlpha: 30 - opaque })
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
		{ UnderlyingTransitionStartFrame: '', UnderlyingTransitionDuration: '', start: 1000, end: 1160, rate: 4 },
		{ UnderlyingTransitionStartFrame: '0', UnderlyingTransitionDuration: '', start: 200, end: 360, rate: 4 },
		{ UnderlyingTransitionStartFrame: 0, UnderlyingTransitionDuration: 6, start: 200, end: 440, rate: 6 },
		{ UnderlyingTransitionStartFrame: ' 18 ', UnderlyingTransitionDuration: '6', start: 920, end: 1160, rate: 6 },
		{ UnderlyingTransitionStartFrame: '', UnderlyingTransitionDuration: '8', start: 1000, end: 1320, rate: 8 },
		{ UnderlyingTransitionStartFrame: '49', UnderlyingTransitionDuration: '10', start: 2160, end: 2560, rate: 10 }
	])('uses independent start/duration overrides: %j', async ({ start, end, rate, ...overrides }) => {
		const context = makeContext({ EnableUnderlyingTransition: true, ...overrides })
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
			const context = makeContext({ EnableUnderlyingTransition: true, UnderlyingTransitionStartFrame: '0' }, preroll)
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
		const mixed = await getSegment(makeContext({ EnableUnderlyingTransition: true }), makeSegment('KAM 1 EFFEKT 1'))
		const plainEffect = plain.parts[0].pieces.find(p => p.pieceType === IBlueprintPieceType.InTransition)!
		const mixedEffect = mixed.parts[0].pieces.find(p => p.pieceType === IBlueprintPieceType.InTransition)!
		expect(mixedEffect.content).toEqual(plainEffect.content)
		expect(mixedEffect.enable).toEqual(plainEffect.enable)
	})

	it('assigns distinct A/B players while outgoing and incoming servers overlap', async () => {
		const context = makeContext({ EnableUnderlyingTransition: true })
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
		const { parts } = await getSegment(makeContext({ EnableUnderlyingTransition: true }), makeSegment('KAM 1 EFFEKT 1'))
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
		ApplyUnderlyingTransitionToPieces(pieces, OfftubeAtemLLayer.AtemMEClean)
		ApplyUnderlyingTransitionToPieces(pieces, OfftubeAtemLLayer.AtemMEClean)
		expect(pieces).toEqual(before)
		expect(getME(parts[0], OfftubeAtemLLayer.AtemMENext).content.me.transition).toBeUndefined()
	})

	it.each<Partial<TableConfigItemBreakers>>([
		{ UnderlyingTransitionDuration: '0' },
		{ UnderlyingTransitionDuration: -1 },
		{ UnderlyingTransitionDuration: 256 },
		{ UnderlyingTransitionDuration: '1.5' },
		{ UnderlyingTransitionDuration: 'oops' },
		{ UnderlyingTransitionDuration: Infinity },
		{ UnderlyingTransitionStartFrame: -1 },
		{ UnderlyingTransitionStartFrame: '51' },
		{ UnderlyingTransitionStartFrame: '0x10' },
		{ UnderlyingTransitionStartFrame: NaN }
	])('reports invalid enabled transition timing: %j', async overrides => {
		const context = makeContext({ EnableUnderlyingTransition: true, ...overrides })
		const { parts } = await getSegment(context, makeSegment('KAM 1 EFFEKT 1'))
		expect(context.getNotes()).toEqual([
			expect.objectContaining({ message: expect.stringContaining('Invalid underlying transition for breaker 1') })
		])
		expect(parts[0].pieces.some(p => p.pieceType === IBlueprintPieceType.InTransition)).toBe(false)
	})

	it.each<Partial<TableConfigItemBreakers>>([{ Duration: 0 }, { StartAlpha: -1 }, { EndAlpha: 31 }])(
		'reports invalid enabled mix settings: %j',
		async overrides => {
			const context = makeContext({ EnableUnderlyingTransition: true, ...overrides })
			const { parts } = await getSegment(context, makeSegment('KAM 1 EFFEKT 1'))
			expect(context.getNotes()).toEqual([
				expect.objectContaining({ message: expect.stringContaining('Invalid underlying transition for breaker 1') })
			])
			expect(parts[0].pieces.some(p => p.pieceType === IBlueprintPieceType.InTransition)).toBe(false)
		}
	)

	it('ignores overrides when mixing is off', async () => {
		const context = makeContext({
			EnableUnderlyingTransition: false,
			UnderlyingTransitionDuration: 'invalid',
			UnderlyingTransitionStartFrame: -1
		})
		const { parts } = await getSegment(context, makeSegment('KAM 1 EFFEKT 1'))
		expect(getME(parts[0]).content.me.transition).toBe(TSR.AtemTransitionStyle.CUT)
		expect(context.getNotes()).toEqual([])
	})

	it('does not enable the feature in gallery', async () => {
		const context = makeMockAFVDContext({ CasparPrerollDuration: 200 })
		context.showStyleConfig = {
			...context.showStyleConfig,
			BreakerConfig: [{ _id: '1', ...BREAKER, EnableUnderlyingTransition: true, UnderlyingTransition: 'Test' }],
			UnderlyingTransitions: [{ _id: 'test', Name: 'Test', Type: 'Dot wipe' }]
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
				EnableUnderlyingTransition: mixUnderBreaker,
				UnderlyingTransitionStartFrame: '18',
				UnderlyingTransitionDuration: '6'
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

	it('keeps original breaker columns and places timing between the preset selector and opt-in', () => {
		const manifest = showStyleConfigManifest.find(entry => entry.id === 'BreakerConfig')
		if (!manifest || manifest.type !== ConfigManifestEntryType.TABLE) {
			throw new Error('Missing breaker table')
		}
		const columns = [...manifest.columns].sort((a, b) => a.rank - b.rank)
		expect(columns.slice(0, 7).map(column => column.id)).toEqual([
			'BreakerName',
			'ClipName',
			'Duration',
			'StartAlpha',
			'EndAlpha',
			'Autonext',
			'LoadFirstFrame'
		])
		expect(columns.slice(7)).toMatchObject([
			{
				id: 'UnderlyingTransition',
				type: ConfigManifestEntryType.SELECT_FROM_COLUMN,
				tableId: 'UnderlyingTransitions',
				columnId: 'Name',
				required: false,
				defaultVal: ''
			},
			{
				id: 'UnderlyingTransitionStartFrame',
				type: ConfigManifestEntryType.STRING,
				required: false,
				defaultVal: ''
			},
			{
				id: 'UnderlyingTransitionDuration',
				type: ConfigManifestEntryType.STRING,
				required: false,
				defaultVal: ''
			},
			{ id: 'EnableUnderlyingTransition', name: 'Underlying transition', defaultVal: false }
		])
	})
})
