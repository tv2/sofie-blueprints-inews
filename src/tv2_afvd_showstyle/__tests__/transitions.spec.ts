import { fail } from 'assert'
import {
	BlueprintResultSegment,
	IBlueprintPart,
	IBlueprintPiece,
	IBlueprintRundownDB,
	IngestSegment,
	TSR
} from 'tv-automation-sofie-blueprints-integration'
import { TimeFromFrames } from 'tv2-common'
import * as _ from 'underscore'
import { SegmentContext } from '../../__mocks__/context'
import { AtemLLayer } from '../../tv2_afvd_studio/layers'
import mappingsDefaults from '../../tv2_afvd_studio/migrations/mappings-defaults'
import { getSegment } from '../getSegment'
import { ShowStyleConfig } from '../helpers/config'
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

function makeMockContextWithoutTransitionsConfig(): SegmentContext {
	const context = makeMockContext()

	// context.showStyleConfig.DefaultTransitions = []

	return context
}

function makeMockContext(): SegmentContext {
	const config = { id: 'default', studioConfig: defaultStudioConfig, showStyleConfig: defaultShowStyleConfig }

	const rundown: IBlueprintRundownDB = {
		_id: '',
		externalId: 'test_rundown',
		name: 'Test Rundown',
		showStyleVariantId: ''
	}

	const mockContext = new SegmentContext(rundown, mappingsDefaults)
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

function getTransitionProperties(effekt: ShowStyleConfig['BreakerConfig'][0]): Partial<IBlueprintPart> {
	const preroll = defaultShowStyleConfig.CasparPrerollDuration as number
	return {
		transitionDuration: TimeFromFrames(Number(effekt.Duration)) + preroll,
		transitionKeepaliveDuration: TimeFromFrames(Number(effekt.StartAlpha)) + preroll,
		transitionPrerollDuration:
			TimeFromFrames(Number(effekt.Duration)) - TimeFromFrames(Number(effekt.EndAlpha)) + preroll
	}
}

function getPieceOnLayerFromPart(segment: BlueprintResultSegment, layer: SourceLayer): IBlueprintPiece {
	const piece = segment.parts[0].pieces.find(p => p.sourceLayerId === layer)
	expect(piece).toBeTruthy()

	return piece!
}

function getATEMMEObj(piece: IBlueprintPiece): TSR.TimelineObjAtemME {
	const atemMEObj = (piece!.content!.timelineObjects as TSR.TSRTimelineObj[]).find(
		obj =>
			obj.layer === AtemLLayer.AtemMEProgram &&
			obj.content.deviceType === TSR.DeviceType.ATEM &&
			obj.content.type === TSR.TimelineContentTypeAtem.ME
	) as TSR.TimelineObjAtemME
	expect(atemMEObj).toBeTruthy()

	return atemMEObj
}

function testNotes(context: SegmentContext) {
	expect(context.getNotes()).toStrictEqual([])
}

describe('Primary Cue Transitions Without Config', () => {
	it('Cuts by default for KAM', () => {
		const ingestSegment = _.clone(templateSegment)

		ingestSegment.payload.iNewsStory.body = '\r\n<p><pi>KAM 1</pi><p>'

		const context = makeMockContextWithoutTransitionsConfig()
		const segment = getSegment(context, ingestSegment)

		testNotes(context)

		const piece = getPieceOnLayerFromPart(segment, SourceLayer.PgmCam)
		const atemCutObj = getATEMMEObj(piece)

		expect(atemCutObj.content.me.transition).toBe(TSR.AtemTransitionStyle.CUT)
	})

	it('Adds effekt to KAM', () => {
		const ingestSegment = _.clone(templateSegment)

		ingestSegment.payload.iNewsStory.body = '\r\n<p><pi>KAM 1 EFFEKT 2</pi><p>'

		const context = makeMockContextWithoutTransitionsConfig()
		const segment = getSegment(context, ingestSegment)

		testNotes(context)

		const piece = getPieceOnLayerFromPart(segment, SourceLayer.PgmCam)
		const atemCutObj = getATEMMEObj(piece)

		checkPartExistsWithProperties(segment, getTransitionProperties(MOCK_EFFEKT_2))

		expect(atemCutObj.content.me.transition).toBe(TSR.AtemTransitionStyle.CUT)
	})

	it('Adds mix to KAM', () => {
		const ingestSegment = _.clone(templateSegment)

		ingestSegment.payload.iNewsStory.body = '\r\n<p><pi>KAM 1 Mix 11</pi><p>'

		const context = makeMockContextWithoutTransitionsConfig()
		const segment = getSegment(context, ingestSegment)

		testNotes(context)

		const piece = getPieceOnLayerFromPart(segment, SourceLayer.PgmCam)
		const atemCutObj = getATEMMEObj(piece)

		expect(atemCutObj.content.me.transition).toBe(TSR.AtemTransitionStyle.MIX)
		expect(atemCutObj.content.me.transitionSettings?.mix?.rate).toBe(11)
	})

	it('Cuts by default for EVS1', () => {
		const ingestSegment = _.clone(templateSegment)

		ingestSegment.payload.iNewsStory.body = '\r\n<p><pi>EVS 1</pi><p>'

		const context = makeMockContextWithoutTransitionsConfig()
		const segment = getSegment(context, ingestSegment)

		testNotes(context)

		const piece = getPieceOnLayerFromPart(segment, SourceLayer.PgmDelayed)
		const atemCutObj = getATEMMEObj(piece)

		expect(atemCutObj.content.me.transition).toBe(TSR.AtemTransitionStyle.CUT)
	})

	it('Adds effekt to EVS1', () => {
		const ingestSegment = _.clone(templateSegment)

		ingestSegment.payload.iNewsStory.body = '\r\n<p><pi>EVS 1 EFFEKT 1</pi><p>'

		const context = makeMockContextWithoutTransitionsConfig()
		const segment = getSegment(context, ingestSegment)

		testNotes(context)

		const piece = getPieceOnLayerFromPart(segment, SourceLayer.PgmDelayed)
		const atemCutObj = getATEMMEObj(piece)

		checkPartExistsWithProperties(segment, getTransitionProperties(MOCK_EFFEKT_1))
		expect(atemCutObj.content.me.transition).toBe(TSR.AtemTransitionStyle.CUT)
	})

	it('Adds mix to EVS1', () => {
		const ingestSegment = _.clone(templateSegment)

		ingestSegment.payload.iNewsStory.body = '\r\n<p><pi>EVS 1 Mix 15</pi><p>'

		const context = makeMockContextWithoutTransitionsConfig()
		const segment = getSegment(context, ingestSegment)

		testNotes(context)

		const piece = getPieceOnLayerFromPart(segment, SourceLayer.PgmDelayed)
		const atemCutObj = getATEMMEObj(piece)

		expect(atemCutObj.content.me.transition).toBe(TSR.AtemTransitionStyle.MIX)
		expect(atemCutObj.content.me.transitionSettings?.mix?.rate).toBe(15)
	})

	it('Cuts by default for EVS1VO', () => {
		const ingestSegment = _.clone(templateSegment)

		ingestSegment.payload.iNewsStory.body = '\r\n<p><pi>EVS1VO</pi><p>'

		const context = makeMockContextWithoutTransitionsConfig()
		const segment = getSegment(context, ingestSegment)

		testNotes(context)

		const piece = getPieceOnLayerFromPart(segment, SourceLayer.PgmDelayed)
		const atemCutObj = getATEMMEObj(piece)

		expect(atemCutObj.content.me.transition).toBe(TSR.AtemTransitionStyle.CUT)
	})

	it('Adds effekt to EVS1VO', () => {
		const ingestSegment = _.clone(templateSegment)

		ingestSegment.payload.iNewsStory.body = '\r\n<p><pi>EVS 1VO EFFEKT 1</pi><p>'

		const context = makeMockContextWithoutTransitionsConfig()
		const segment = getSegment(context, ingestSegment)

		testNotes(context)

		const piece = getPieceOnLayerFromPart(segment, SourceLayer.PgmDelayed)
		const atemCutObj = getATEMMEObj(piece)

		checkPartExistsWithProperties(segment, getTransitionProperties(MOCK_EFFEKT_1))
		expect(atemCutObj.content.me.transition).toBe(TSR.AtemTransitionStyle.CUT)
	})

	it('Adds mix to EVS1VO', () => {
		const ingestSegment = _.clone(templateSegment)

		ingestSegment.payload.iNewsStory.body = '\r\n<p><pi>EVS 1 VO Mix 25</pi><p>'

		const context = makeMockContextWithoutTransitionsConfig()
		const segment = getSegment(context, ingestSegment)

		testNotes(context)

		const piece = getPieceOnLayerFromPart(segment, SourceLayer.PgmDelayed)
		const atemCutObj = getATEMMEObj(piece)

		expect(atemCutObj.content.me.transition).toBe(TSR.AtemTransitionStyle.MIX)
		expect(atemCutObj.content.me.transitionSettings?.mix?.rate).toBe(25)
	})

	it('Cuts by default for SERVER', () => {
		const ingestSegment = _.clone(templateSegment)

		ingestSegment.payload.iNewsStory.body = '\r\n<p><pi>SERVER</pi><p>'

		const context = makeMockContextWithoutTransitionsConfig()
		const segment = getSegment(context, ingestSegment)

		testNotes(context)

		const piece = getPieceOnLayerFromPart(segment, SourceLayer.PgmServer)
		const atemCutObj = getATEMMEObj(piece)

		checkPartExistsWithProperties(segment, { prerollDuration: defaultStudioConfig.CasparPrerollDuration as number })
		expect(atemCutObj.content.me.transition).toBe(TSR.AtemTransitionStyle.CUT)
	})

	it('Adds effekt to SERVER', () => {
		const ingestSegment = _.clone(templateSegment)

		ingestSegment.payload.iNewsStory.body = '\r\n<p><pi>SERVER EFFEKT 2</pi><p>'

		const context = makeMockContextWithoutTransitionsConfig()
		const segment = getSegment(context, ingestSegment)

		testNotes(context)

		const piece = getPieceOnLayerFromPart(segment, SourceLayer.PgmServer)
		const atemCutObj = getATEMMEObj(piece)

		checkPartExistsWithProperties(segment, getTransitionProperties(MOCK_EFFEKT_2))
		expect(atemCutObj.content.me.transition).toBe(TSR.AtemTransitionStyle.CUT)
	})

	it('Adds mix to SERVER', () => {
		const ingestSegment = _.clone(templateSegment)

		ingestSegment.payload.iNewsStory.body = '\r\n<p><pi>SERVER Mix 20</pi><p>'

		const context = makeMockContextWithoutTransitionsConfig()
		const segment = getSegment(context, ingestSegment)

		testNotes(context)

		const piece = getPieceOnLayerFromPart(segment, SourceLayer.PgmServer)
		const atemCutObj = getATEMMEObj(piece)

		checkPartExistsWithProperties(segment, { prerollDuration: defaultStudioConfig.CasparPrerollDuration as number })
		expect(atemCutObj.content.me.transition).toBe(TSR.AtemTransitionStyle.MIX)
		expect(atemCutObj.content.me.transitionSettings?.mix?.rate).toBe(20)
	})

	it('Cuts by default for VO', () => {
		const ingestSegment = _.clone(templateSegment)

		ingestSegment.payload.iNewsStory.body = '\r\n<p><pi>VO</pi><p>'

		const context = makeMockContextWithoutTransitionsConfig()
		const segment = getSegment(context, ingestSegment)

		testNotes(context)

		const piece = getPieceOnLayerFromPart(segment, SourceLayer.PgmVoiceOver)
		const atemCutObj = getATEMMEObj(piece)

		checkPartExistsWithProperties(segment, { prerollDuration: defaultStudioConfig.CasparPrerollDuration as number })
		expect(atemCutObj.content.me.transition).toBe(TSR.AtemTransitionStyle.CUT)
	})

	it('Adds effekt to VO', () => {
		const ingestSegment = _.clone(templateSegment)

		ingestSegment.payload.iNewsStory.body = '\r\n<p><pi>VO EFFEKT 1</pi><p>'

		const context = makeMockContextWithoutTransitionsConfig()
		const segment = getSegment(context, ingestSegment)

		testNotes(context)

		const piece = getPieceOnLayerFromPart(segment, SourceLayer.PgmVoiceOver)
		const atemCutObj = getATEMMEObj(piece)

		checkPartExistsWithProperties(segment, getTransitionProperties(MOCK_EFFEKT_1))
		expect(atemCutObj.content.me.transition).toBe(TSR.AtemTransitionStyle.CUT)
	})

	it('Adds mix to VO', () => {
		const ingestSegment = _.clone(templateSegment)

		ingestSegment.payload.iNewsStory.body = '\r\n<p><pi>VO Mix 20</pi><p>'

		const context = makeMockContextWithoutTransitionsConfig()
		const segment = getSegment(context, ingestSegment)

		testNotes(context)

		const piece = getPieceOnLayerFromPart(segment, SourceLayer.PgmVoiceOver)
		const atemCutObj = getATEMMEObj(piece)

		checkPartExistsWithProperties(segment, { prerollDuration: defaultStudioConfig.CasparPrerollDuration as number })
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
