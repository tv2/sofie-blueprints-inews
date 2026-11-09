import {
	BlueprintMapping,
	IBlueprintResolvedPieceInstance,
	LookaheadMode,
	OnGenerateTimelineObj,
	TSR
} from 'blueprints-integration'
import { PartType } from 'tv2-constants'
import { makeMockCoreGalleryContext } from '../../../__mocks__/context'
import { GALLERY_UNIFORM_CONFIG } from '../../../tv2_afvd_studio/uniformConfig'
import { QBOX_UNIFORM_CONFIG } from '../../../tv2_offtube_studio/uniformConfig'
import { CutToServer } from '../../content/server'
import { PartDefinitionUnknown } from '../../inewsConversion'
import { PieceMetaData } from '../../onTimelineGenerate'
import { SegmentContextImpl } from '../../segment/context'
import { ShowStyleContext } from '../../showstyle/context'
import { TimelineContext } from '../../showstyle/timelineEventContext'
import { SpecialInput, TransitionStyle } from '../../videoSwitchers/types'
import { assignMediaPlayers, resolveMediaPlayerAssignments, SessionToPlayerMap } from '../abPlayback'

function setup(debugLogging = false, uniformConfig = GALLERY_UNIFORM_CONFIG) {
	const core = Object.assign(makeMockCoreGalleryContext({ studioConfig: { ABPlaybackDebugLogging: debugLogging } }), {
		currentPartInstance: undefined,
		nextPartInstance: undefined,
		previousPartInstance: undefined,
		getCurrentTime: () => 0,
		getPieceABSessionId: (_piece: unknown, session: string) => session,
		getTimelineObjectAbSessionId: (_object: unknown, session: string) => session
	})
	const context = new TimelineContext(core, uniformConfig)
	context.config.mediaPlayers = [
		{ id: '1', val: '11' },
		{ id: '2', val: '12' }
	]
	return { core, context, producerContext: new SegmentContextImpl(core, uniformConfig) }
}

function piece(id: string, optional = false): IBlueprintResolvedPieceInstance<PieceMetaData> {
	const resolved = {
		_id: id,
		resolvedStart: 0,
		resolvedDuration: 100,
		piece: { metaData: { mediaPlayerSessions: [id], mediaPlayerOptional: optional } }
	}
	return resolved as IBlueprintResolvedPieceInstance<PieceMetaData>
}

const PREVIOUS: SessionToPlayerMap = {
	required: { sessionId: 'required', playerId: 1, lookahead: false },
	optional: { sessionId: 'optional', playerId: 2, lookahead: false }
}

const SOURCE_LAYERS = {
	Caspar: { ClipPending: 'caspar_pending' },
	Sisyfos: { ClipPending: 'sisyfos_pending', PlayerA: 'sisyfos_a', PlayerB: 'sisyfos_b' }
}

function serverTimeline(context: ShowStyleContext, transition: TransitionStyle): OnGenerateTimelineObj[] {
	const definition: PartDefinitionUnknown = {
		type: PartType.Unknown,
		externalId: 'server',
		rawType: '',
		script: '',
		fields: {},
		modified: 0,
		storyName: 'story',
		segmentExternalId: 'segment',
		cues: [],
		transition: { style: transition, duration: transition === TransitionStyle.CUT ? undefined : 6 }
	}
	return CutToServer(context, 'server', definition).map((object, index) => ({
		...object,
		id: object.id || `server-${index}`,
		pieceInstanceId: 'server'
	}))
}

function nativeMixEffect(object: OnGenerateTimelineObj | undefined): OnGenerateTimelineObj & TSR.TimelineObjAtemME {
	if (!object) {
		throw new Error('Expected native ATEM ME object')
	}
	expect(object.content).toMatchObject({ deviceType: TSR.DeviceType.ATEM, type: TSR.TimelineContentTypeAtem.ME })
	return object as OnGenerateTimelineObj & TSR.TimelineObjAtemME
}

describe.each([
	{ studio: 'gallery', uniformConfig: GALLERY_UNIFORM_CONFIG },
	{ studio: 'offtube', uniformConfig: QBOX_UNIFORM_CONFIG }
])('$studio server A/B assignment', ({ uniformConfig }) => {
	test.each([TransitionStyle.MIX, TransitionStyle.DIP])(
		'%s replaces the delayed native programInput placeholder without adding transition input',
		transition => {
			const { context, producerContext } = setup(false, uniformConfig)
			const timeline = serverTimeline(producerContext, transition)
			const delayed = nativeMixEffect(timeline.find(object => object.id.endsWith('_after_transition')))
			expect(delayed.content.me.programInput).toBe(SpecialInput.AB_PLACEHOLDER)

			const assignment = assignMediaPlayers(
				context,
				timeline,
				{},
				[{ ...piece('server'), resolvedDuration: 10000 }],
				SOURCE_LAYERS
			)

			expect(assignment[1]).toContainEqual({ sessionId: 'server', playerId: 1, lookahead: false })
			expect(delayed.content.me).toEqual({ programInput: 11, previewInput: undefined })
			expect(delayed.content.me).not.toHaveProperty('input')
			const primary = nativeMixEffect(
				timeline.find(object => object.layer === delayed.layer && object.id !== delayed.id)
			)
			expect(primary.content.me.input).toBe(11)
			expect(primary.content.me.transition).toBe(
				transition === TransitionStyle.MIX ? TSR.AtemTransitionStyle.MIX : TSR.AtemTransitionStyle.DIP
			)
			expect(primary.content.me).not.toHaveProperty('programInput')
		}
	)
})

test('PRELOAD rewrites of a custom next-preview mapping still assign native previewInput only', () => {
	const { core, context, producerContext } = setup(false, QBOX_UNIFORM_CONFIG)
	const preview = nativeMixEffect(
		serverTimeline(producerContext, TransitionStyle.CUT).find(object => object.layer === 'atem_me_next')
	)
	const customMapping: BlueprintMapping & TSR.MappingAtem = {
		device: TSR.DeviceType.ATEM,
		deviceId: 'custom-atem',
		mappingType: TSR.MappingAtemType.MixEffect,
		index: 2,
		lookahead: LookaheadMode.PRELOAD,
		lookaheadDepth: 7
	}
	const mappings = { ...core.getStudioMappings(), [preview.layer.toString()]: customMapping }
	jest.spyOn(core, 'getStudioMappings').mockReturnValue(mappings)
	const lookahead: OnGenerateTimelineObj & TSR.TimelineObjAtemME = {
		...preview,
		layer: `${preview.layer}_lookahead`,
		lookaheadForLayer: preview.layer,
		isLookahead: true,
		enable: { start: 0 }
	}

	const assignment = assignMediaPlayers(context, [lookahead], {}, [], SOURCE_LAYERS)

	expect(assignment[1]).toContainEqual({ sessionId: 'server', playerId: 1, lookahead: true })
	expect(lookahead.content.me).toEqual({ programInput: undefined, previewInput: 11 })
	expect(lookahead.content.me).not.toHaveProperty('input')
	expect(lookahead.layer).toBe('atem_me_next_lookahead')
	expect(lookahead.lookaheadForLayer).toBe('atem_me_next')
	expect(core.getStudioMappings()[preview.layer.toString()]).toEqual(customMapping)
})

test('an optional media-player claim can yield to required playback without noisy debug notes', () => {
	const { core, context } = setup()
	const result = resolveMediaPlayerAssignments(context, PREVIOUS, [
		piece('required'),
		piece('optional', true),
		piece('incoming')
	])
	expect(result.find(request => request.id === 'incoming')?.player).toBe('2')
	expect(result.find(request => request.id === 'optional')?.player).toBeUndefined()
	expect(core.getNotes()).toEqual([])
})

test('a session is not optional when any of its pieces requires playback', () => {
	const { core, context } = setup()
	const result = resolveMediaPlayerAssignments(context, PREVIOUS, [
		piece('required'),
		piece('optional', true),
		piece('optional'),
		piece('incoming')
	])
	expect(result.find(request => request.id === 'incoming')?.player).toBeUndefined()
	expect(result.find(request => request.id === 'optional')?.player).toBe('2')
	expect(core.getNotes()).toEqual([expect.objectContaining({ message: 'All the mediaplayers are in use (incoming)!' })])
})

test('media-player diagnostics retain the release opt-in logging policy', () => {
	const { core, context } = setup(true)
	const warning = jest.spyOn(core, 'logWarning')
	resolveMediaPlayerAssignments(context, {}, [piece('incoming')])
	expect(warning).toHaveBeenCalledWith(expect.stringContaining('all reqs'))
})
