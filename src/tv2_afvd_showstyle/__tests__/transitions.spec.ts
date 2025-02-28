import { fail } from 'assert'
import { BlueprintResultSegment, IBlueprintPart, IBlueprintPiece, IngestSegment, TSR } from 'blueprints-integration'
import { getTimeFromFrames } from 'tv2-common'
import { SwitcherMixEffectLLayer } from 'tv2-constants'
import * as _ from 'underscore'
import { SegmentUserContextMock } from '../../__mocks__/context'
import { prefixLayer } from '../../tv2-common/__tests__/testUtil'
import { preprocessConfig } from '../../tv2_afvd_studio/helpers/config'
import mappingsDefaults from '../../tv2_afvd_studio/migrations/mappings-defaults'
import { getSegment } from '../getSegment'
import { GalleryShowStyleConfig, preprocessConfig as parseShowStyleConfig } from '../helpers/config'
import { SourceLayer } from '../layers'
import { MOCK_EFFEKT_1, MOCK_EFFEKT_2 } from './breakerConfigDefault'
import { defaultShowStyleConfig, defaultStudioConfig } from './configs'

const templateSegment: IngestSegment = {
	externalId: '3859F5AB',
	name: 'Template Segment',
	rank: 0,
	payload: {
		rundownId: 'NYHEDERNE-TEST.SOFIE.MOCKS',
		iNewsStory: {
			fields: {
				pageNumber: '1',
				title: 'tempalte Segment',
				var2: 'INDSL',
				videoId: 'Test Video',
				tapeTime: '0',
				audioTime: '35',
				totalTime: '35',
				modifyDate: '1583748300',
				presenter: 'std-read',
				modifyBy: 'test',
				var16: 'ååmmdd',
				ready: 'KLAR',
				runsTime: '0',
				onair: 'ON-AIR',
				typecode: 'nyx',
				programtitle: '.',
				noarchive: '.'
			},
			meta: {
				words: '0',
				rate: '160'
			},
			cues: [],
			id: '00000000:00000000:00000001',
			body: '\r\n<p></p>',
			fileId: '00000000:00000000:00000001',
			identifier: '3859F5AB'
		},
		modified: '1583748300',
		externalId: '3859F5AB',
		rank: 0,
		name: 'Template Segment',
		float: false
	},
	parts: []
}

function makeMockContextWithoutTransitionsConfig(): SegmentUserContextMock {
	const context = makeMockContext()

	// context.showStyleConfig.DefaultTransitions = []

	return context
}

function makeMockContext(): SegmentUserContextMock {
	const config = { id: 'default', studioConfig: defaultStudioConfig, showStyleConfig: defaultShowStyleConfig }

	const mockContext = new SegmentUserContextMock('test', mappingsDefaults, preprocessConfig, parseShowStyleConfig)
	mockContext.studioConfig = config.studioConfig as any
	mockContext.showStyleConfig = config.showStyleConfig as any

	return mockContext
}

function checkPartExistsWithProperties(segment: BlueprintResultSegment, props: Partial<IBlueprintPart>) {
	const part = segment.parts[0]
	expect(part).toBeTruthy()

	for (const k in props) {
		if (k in part.part) {
			expect({ [k]: part.part[k as keyof IBlueprintPart] }).toEqual({ [k]: props[k as keyof IBlueprintPart] })
		} else {
			fail(`Key "${k}" not found in part`)
		}
	}
}

function getTransitionProperties(effekt: GalleryShowStyleConfig['BreakerConfig'][0]): Partial<IBlueprintPart> {
	const preroll = defaultStudioConfig.CasparPrerollDuration as number
	return {
		inTransition: {
			blockTakeDuration: getTimeFromFrames(Number(effekt.Duration)) + preroll,
			previousPartKeepaliveDuration: getTimeFromFrames(Number(effekt.StartAlpha)) + preroll,
			partContentDelayDuration:
				getTimeFromFrames(Number(effekt.Duration)) - getTimeFromFrames(Number(effekt.EndAlpha)) + preroll
		}
	}
}

function getPieceOnLayerFromPart(segment: BlueprintResultSegment, layer: SourceLayer): IBlueprintPiece {
	const piece = segment.parts[0].pieces.find((p) => p.sourceLayerId === layer)
	expect(piece).toBeTruthy()

	return piece!
}

function getATEMMEObj(piece: IBlueprintPiece): TSR.TimelineObjAtemME {
	const atemMEObj = (piece!.content!.timelineObjects as TSR.TSRTimelineObj[]).find(
		(obj) =>
			obj.layer === prefixLayer(SwitcherMixEffectLLayer.PROGRAM) &&
			obj.content.deviceType === TSR.DeviceType.ATEM &&
			obj.content.type === TSR.TimelineContentTypeAtem.ME
	) as TSR.TimelineObjAtemME
	expect(atemMEObj).toBeTruthy()

	return atemMEObj
}

function testNotes(context: SegmentUserContextMock) {
	expect(context.getNotes()).toStrictEqual([])
}

describe('Primary Cue Transitions Without Config', () => {
	it('Transition is undefined by default for KAM', async () => {
		const ingestSegment = _.clone(templateSegment)

		ingestSegment.payload.iNewsStory.body = '\r\n<p><pi>KAM 1</pi><p>'

		const context = makeMockContextWithoutTransitionsConfig()
		const segment = await getSegment(context, ingestSegment)

		testNotes(context)

		const piece = getPieceOnLayerFromPart(segment, SourceLayer.PgmCam)
		const atemCutObj = getATEMMEObj(piece)

		expect(atemCutObj.content.me.transition).toBe(undefined)
	})

	it('Adds effekt to KAM', async () => {
		const ingestSegment = _.clone(templateSegment)

		ingestSegment.payload.iNewsStory.body = '\r\n<p><pi>KAM 1 EFFEKT 2</pi><p>'

		const context = makeMockContextWithoutTransitionsConfig()
		const segment = await getSegment(context, ingestSegment)

		testNotes(context)

		const piece = getPieceOnLayerFromPart(segment, SourceLayer.PgmCam)
		const atemCutObj = getATEMMEObj(piece)

		checkPartExistsWithProperties(segment, getTransitionProperties(MOCK_EFFEKT_2))

		expect(atemCutObj.content.me.transition).toBe(undefined)
	})

	it('Adds mix to KAM', async () => {
		const ingestSegment = _.clone(templateSegment)

		ingestSegment.payload.iNewsStory.body = '\r\n<p><pi>KAM 1 Mix 11</pi><p>'

		const context = makeMockContextWithoutTransitionsConfig()
		const segment = await getSegment(context, ingestSegment)

		testNotes(context)

		const piece = getPieceOnLayerFromPart(segment, SourceLayer.PgmCam)
		const atemCutObj = getATEMMEObj(piece)

		checkPartExistsWithProperties(segment, {
			inTransition: {
				previousPartKeepaliveDuration: 440,
				partContentDelayDuration: 0,
				blockTakeDuration: 440
			}
		})
		expect(atemCutObj.content.me.transition).toBe(TSR.AtemTransitionStyle.MIX)
		expect(atemCutObj.content.me.transitionSettings?.mix?.rate).toBe(11)
	})

	it('Transition is undefined by default for EVS1', async () => {
		const ingestSegment = _.clone(templateSegment)

		ingestSegment.payload.iNewsStory.body = '\r\n<p><pi>EVS 1</pi><p>'

		const context = makeMockContextWithoutTransitionsConfig()
		const segment = await getSegment(context, ingestSegment)

		testNotes(context)

		const piece = getPieceOnLayerFromPart(segment, SourceLayer.PgmLocal)
		const atemCutObj = getATEMMEObj(piece)

		expect(atemCutObj.content.me.transition).toBe(undefined)
	})

	it('Adds effekt to EVS1', async () => {
		const ingestSegment = _.clone(templateSegment)

		ingestSegment.payload.iNewsStory.body = '\r\n<p><pi>EVS 1 EFFEKT 1</pi><p>'

		const context = makeMockContextWithoutTransitionsConfig()
		const segment = await getSegment(context, ingestSegment)

		testNotes(context)

		const piece = getPieceOnLayerFromPart(segment, SourceLayer.PgmLocal)
		const atemCutObj = getATEMMEObj(piece)

		checkPartExistsWithProperties(segment, getTransitionProperties(MOCK_EFFEKT_1))
		expect(atemCutObj.content.me.transition).toBe(undefined)
	})

	it('Adds mix to EVS1', async () => {
		const ingestSegment = _.clone(templateSegment)

		ingestSegment.payload.iNewsStory.body = '\r\n<p><pi>EVS 1 Mix 15</pi><p>'

		const context = makeMockContextWithoutTransitionsConfig()
		const segment = await getSegment(context, ingestSegment)

		testNotes(context)

		const piece = getPieceOnLayerFromPart(segment, SourceLayer.PgmLocal)
		const atemCutObj = getATEMMEObj(piece)

		checkPartExistsWithProperties(segment, {
			inTransition: {
				previousPartKeepaliveDuration: 600,
				partContentDelayDuration: 0,
				blockTakeDuration: 600
			}
		})
		expect(atemCutObj.content.me.transition).toBe(TSR.AtemTransitionStyle.MIX)
		expect(atemCutObj.content.me.transitionSettings?.mix?.rate).toBe(15)
	})

	it('Transition is undefined by default for EVS1VO', async () => {
		const ingestSegment = _.clone(templateSegment)

		ingestSegment.payload.iNewsStory.body = '\r\n<p><pi>EVS1VO</pi><p>'

		const context = makeMockContextWithoutTransitionsConfig()
		const segment = await getSegment(context, ingestSegment)

		testNotes(context)

		const piece = getPieceOnLayerFromPart(segment, SourceLayer.PgmLocal)
		const atemCutObj = getATEMMEObj(piece)

		expect(atemCutObj.content.me.transition).toBe(undefined)
	})

	it('Adds effekt to EVS1VO', async () => {
		const ingestSegment = _.clone(templateSegment)

		ingestSegment.payload.iNewsStory.body = '\r\n<p><pi>EVS 1VO EFFEKT 1</pi><p>'

		const context = makeMockContextWithoutTransitionsConfig()
		const segment = await getSegment(context, ingestSegment)

		testNotes(context)

		const piece = getPieceOnLayerFromPart(segment, SourceLayer.PgmLocal)
		const atemCutObj = getATEMMEObj(piece)

		checkPartExistsWithProperties(segment, getTransitionProperties(MOCK_EFFEKT_1))
		expect(atemCutObj.content.me.transition).toBe(undefined)
	})

	it('Adds mix to EVS1VO', async () => {
		const ingestSegment = _.clone(templateSegment)

		ingestSegment.payload.iNewsStory.body = '\r\n<p><pi>EVS 1 VO Mix 25</pi><p>'

		const context = makeMockContextWithoutTransitionsConfig()
		const segment = await getSegment(context, ingestSegment)

		testNotes(context)

		const piece = getPieceOnLayerFromPart(segment, SourceLayer.PgmLocal)
		const atemCutObj = getATEMMEObj(piece)

		checkPartExistsWithProperties(segment, {
			inTransition: {
				previousPartKeepaliveDuration: 1000,
				partContentDelayDuration: 0,
				blockTakeDuration: 1000
			}
		})
		expect(atemCutObj.content.me.transition).toBe(TSR.AtemTransitionStyle.MIX)
		expect(atemCutObj.content.me.transitionSettings?.mix?.rate).toBe(25)
	})

	it('Transition is undefined by default for SERVER', async () => {
		const ingestSegment = _.clone(templateSegment)

		ingestSegment.payload.iNewsStory.body = '\r\n<p><pi>SERVER</pi><p>'

		const context = makeMockContextWithoutTransitionsConfig()
		const segment = await getSegment(context, ingestSegment)

		testNotes(context)

		const piece = getPieceOnLayerFromPart(segment, SourceLayer.PgmServer)
		const atemCutObj = getATEMMEObj(piece)

		expect(atemCutObj.content.me.transition).toBe(undefined)
	})

	it('Adds effekt to SERVER', async () => {
		const ingestSegment = _.clone(templateSegment)

		ingestSegment.payload.iNewsStory.body = '\r\n<p><pi>SERVER EFFEKT 2</pi><p>'

		const context = makeMockContextWithoutTransitionsConfig()
		const segment = await getSegment(context, ingestSegment)

		testNotes(context)

		const piece = getPieceOnLayerFromPart(segment, SourceLayer.PgmServer)
		const atemCutObj = getATEMMEObj(piece)

		checkPartExistsWithProperties(segment, getTransitionProperties(MOCK_EFFEKT_2))
		expect(atemCutObj.content.me.transition).toBe(undefined)
	})

	it('Adds mix to SERVER', async () => {
		const ingestSegment = _.clone(templateSegment)

		ingestSegment.payload.iNewsStory.body = '\r\n<p><pi>SERVER Mix 20</pi><p>'

		const context = makeMockContextWithoutTransitionsConfig()
		const segment = await getSegment(context, ingestSegment)

		testNotes(context)

		const piece = getPieceOnLayerFromPart(segment, SourceLayer.PgmServer)
		const atemCutObj = getATEMMEObj(piece)

		checkPartExistsWithProperties(segment, {
			inTransition: {
				previousPartKeepaliveDuration: 800,
				partContentDelayDuration: 0,
				blockTakeDuration: 800
			}
		})
		expect(atemCutObj.content.me.transition).toBe(TSR.AtemTransitionStyle.MIX)
		expect(atemCutObj.content.me.transitionSettings?.mix?.rate).toBe(20)
	})

	it('Transition is undefined by default for VO', async () => {
		const ingestSegment = _.clone(templateSegment)

		ingestSegment.payload.iNewsStory.body = '\r\n<p><pi>VO</pi><p>'

		const context = makeMockContextWithoutTransitionsConfig()
		const segment = await getSegment(context, ingestSegment)

		testNotes(context)

		const piece = getPieceOnLayerFromPart(segment, SourceLayer.PgmVoiceOver)
		const atemCutObj = getATEMMEObj(piece)

		expect(atemCutObj.content.me.transition).toBe(undefined)
	})

	it('Adds effekt to VO', async () => {
		const ingestSegment = _.clone(templateSegment)

		ingestSegment.payload.iNewsStory.body = '\r\n<p><pi>VO EFFEKT 1</pi><p>'

		const context = makeMockContextWithoutTransitionsConfig()
		const segment = await getSegment(context, ingestSegment)

		testNotes(context)

		const piece = getPieceOnLayerFromPart(segment, SourceLayer.PgmVoiceOver)
		const atemCutObj = getATEMMEObj(piece)

		checkPartExistsWithProperties(segment, getTransitionProperties(MOCK_EFFEKT_1))
		expect(atemCutObj.content.me.transition).toBe(undefined)
	})

	it('Adds mix to VO', async () => {
		const ingestSegment = _.clone(templateSegment)

		ingestSegment.payload.iNewsStory.body = '\r\n<p><pi>VO Mix 20</pi><p>'

		const context = makeMockContextWithoutTransitionsConfig()
		const segment = await getSegment(context, ingestSegment)

		testNotes(context)

		const piece = getPieceOnLayerFromPart(segment, SourceLayer.PgmVoiceOver)
		const atemCutObj = getATEMMEObj(piece)

		checkPartExistsWithProperties(segment, {
			inTransition: {
				previousPartKeepaliveDuration: 800,
				partContentDelayDuration: 0,
				blockTakeDuration: 800
			}
		})
		expect(atemCutObj.content.me.transition).toBe(TSR.AtemTransitionStyle.MIX)
		expect(atemCutObj.content.me.transitionSettings?.mix?.rate).toBe(20)
	})
})

/*describe('Primary Cue Transitions With Config', () => {
	it('Mixes to KAM 2 over 20 frames by default', () => {
		const ingestSegment = _.clone(templateSegment)

		ingestSegment.payload.iNewsStory.body = '\r\n<p><pi>KAM 2</pi><p>'

		const context = makeMockContext()
		const segment = getSegment(context, ingestSegment)

		testNotes(context)

		const piece = getPieceOnLayerFromPart(segment, SourceLayer.PgmCam)
		const atemCutObj = getATEMMEObj(piece)

		checkPartExistsWithProperties(segment, { prerollDuration: defaultStudioConfig.CasparPrerollDuration as number })
		expect(atemCutObj.content.me.transition).toBe(TSR.AtemTransitionStyle.MIX)
		expect(atemCutObj.content.me.transitionSettings?.mix?.rate).toBe(20)
	})

	it('Mixes to KAM 2 over 25 frames (iNews)', () => {
		const ingestSegment = _.clone(templateSegment)

		ingestSegment.payload.iNewsStory.body = '\r\n<p><pi>KAM 2 MIX 25</pi><p>'

		const context = makeMockContext()
		const segment = getSegment(context, ingestSegment)

		testNotes(context)

		const piece = getPieceOnLayerFromPart(segment, SourceLayer.PgmCam)
		const atemCutObj = getATEMMEObj(piece)

		checkPartExistsWithProperties(segment, { prerollDuration: defaultStudioConfig.CasparPrerollDuration as number })
		expect(atemCutObj.content.me.transition).toBe(TSR.AtemTransitionStyle.MIX)
		expect(atemCutObj.content.me.transitionSettings?.mix?.rate).toBe(25)
	})

	it('Adds EFFEKT 1 to LIVE 1 by default', () => {
		const ingestSegment = _.clone(templateSegment)

		ingestSegment.payload.iNewsStory.body = '\r\n<p><a idref="0"></a><p>'
		ingestSegment.payload.iNewsStory.cues = [['EKSTERN=LIVE 1']]

		const context = makeMockContext()
		const segment = getSegment(context, ingestSegment)

		testNotes(context)

		const piece = getPieceOnLayerFromPart(segment, SourceLayer.PgmLive)
		const atemCutObj = getATEMMEObj(piece)

		checkPartExistsWithProperties(segment, getTransitionProperties(MOCK_EFFEKT_1))
		expect(atemCutObj.content.me.transition).toBe(TSR.AtemTransitionStyle.CUT)
	})
})*/
