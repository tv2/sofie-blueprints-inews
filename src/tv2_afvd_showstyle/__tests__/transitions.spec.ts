import { fail } from 'assert'
import {
	BlueprintResultSegment,
	IBlueprintPart,
	IBlueprintPiece,
	IBlueprintRundownDB,
	IngestSegment,
	TSR
} from 'tv-automation-sofie-blueprints-integration'
import * as _ from 'underscore'
import { SegmentContext } from '../../__mocks__/context'
import { AtemLLayer } from '../../tv2_afvd_studio/layers'
import mappingsDefaults from '../../tv2_afvd_studio/migrations/mappings-defaults'
import { getSegment } from '../getSegment'
import { SourceLayer } from '../layers'
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
			expect(part.part[k as keyof IBlueprintPart]).toEqual(props[k as keyof IBlueprintPart])
		} else {
			fail(`Invalid key provided for props: ${k}`)
		}
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

describe('Primary Cue Transitions', () => {
	it('Cuts by default for KAM', () => {
		const ingestSegment = _.clone(templateSegment)

		ingestSegment.payload.iNewsStory.body = '\r\n<p><pi>SERVER</pi><p>'

		const segment = getSegment(makeMockContext(), ingestSegment)

		checkPartExistsWithProperties(segment, { prerollDuration: defaultStudioConfig.CasparPrerollDuration as number })

		const piece = getPieceOnLayerFromPart(segment, SourceLayer.PgmServer)
		const atemCutObj = getATEMMEObj(piece)

		expect(atemCutObj.content.me.transition).toBe(TSR.AtemTransitionStyle.CUT)
	})

	it('Adds effekt to KAM', () => {
		fail('Empty test')
	})

	it('Adds mix to KAM', () => {
		fail('Empty test')
	})

	it('Cuts by default for EVS1', () => {
		fail('Empty test')
	})

	it('Adds effekt to EVS1', () => {
		fail('Empty test')
	})

	it('Adds mix to EVS1', () => {
		fail('Empty test')
	})

	it('Cuts by default for EVS1VO', () => {
		fail('Empty test')
	})

	it('Adds effekt to EVS1VO', () => {
		fail('Empty test')
	})

	it('Adds mix to EVS1VO', () => {
		fail('Empty test')
	})

	it('Cuts by default for EKSTERN', () => {
		fail('Empty test')
	})

	it('Adds effekt to EKSTERN', () => {
		fail('Empty test')
	})

	it('Adds mix to EKSTERN', () => {
		fail('Empty test')
	})

	it('Cuts by default for SERVER', () => {
		fail('Empty test')
	})

	it('Adds effekt to SERVER', () => {
		fail('Empty test')
	})

	it('Adds mix to SERVER', () => {
		fail('Empty test')
	})

	it('Cuts by default for VO', () => {
		fail('Empty test')
	})

	it('Adds effekt to VO', () => {
		fail('Empty test')
	})

	it('Adds mix to VO', () => {
		fail('Empty test')
	})
})
