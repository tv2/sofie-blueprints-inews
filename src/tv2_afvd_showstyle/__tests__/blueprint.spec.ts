import { BlueprintResultSegment, IBlueprintRundownDB, IngestSegment } from 'tv-automation-sofie-blueprints-integration'
import { INewsStory, literal, UnparsedCue } from 'tv2-common'
import { SegmentContext } from '../../__mocks__/context'
import { defaultShowStyleConfig, defaultStudioConfig } from '../../tv2_afvd_showstyle/__tests__/configs'
import mappingsDefaults from '../../tv2_afvd_studio/migrations/mappings-defaults'
import { getSegment } from '../getSegment'
import { SourceLayer } from '../layers'

const RUNDOWN_EXTERNAL_ID = 'TEST.SOFIE.JEST'
const SEGMENT_EXTERNAL_ID = '00000000'

function makeMockContext(preventOverlay?: boolean) {
	const rundown = literal<IBlueprintRundownDB>({
		externalId: RUNDOWN_EXTERNAL_ID,
		name: RUNDOWN_EXTERNAL_ID,
		_id: '',
		showStyleVariantId: ''
	})
	const mockContext = new SegmentContext(rundown, mappingsDefaults)
	mockContext.studioConfig =
		preventOverlay === undefined
			? defaultStudioConfig
			: ({ ...defaultStudioConfig, PreventOverlayWithFull: preventOverlay } as any)
	mockContext.showStyleConfig = defaultShowStyleConfig as any

	return mockContext
}

function makeIngestSegment(cues: UnparsedCue[], body: string) {
	return literal<IngestSegment>({
		externalId: SEGMENT_EXTERNAL_ID,
		name: 'TEST SEGMENT',
		rank: 0,
		parts: [],
		payload: {
			iNewsStory: literal<INewsStory>({
				identifier: '00000000',
				locator: '01',
				fields: {
					title: 'TEST SEGMENT',
					modifyDate: '0',
					tapeTime: '0',
					audioTime: '0',
					totalTime: '0',
					cumeTime: '0',
					backTime: '0',
					pageNumber: '01'
				},
				meta: {},
				cues,
				body
			})
		}
	})
}

function expectNotesToBe(context: SegmentContext, notes: string[]) {
	expect(context.getNotes().map(msg => msg.message)).toEqual(notes)
}

function expectAllPartsToBeValid(result: BlueprintResultSegment) {
	const invalid = result.parts.filter(part => part.part.invalid === true)
	expect(invalid).toHaveLength(0)
}

describe('AFVD Blueprint', () => {
	it('Shows warning for Pilot without destination', () => {
		const ingestSegment = makeIngestSegment(
			[
				[
					'#cg4 pilotdata',
					'News/Citast/ARFG/LIVE/stoppoints_3',
					'VCPID=2547768',
					'ContinueCount=8',
					'News/Citat/ARFG/LIVE/stoppoints_3'
				]
			],
			`\r\n<pi>Kam 1</pi>\r\n<p>Some script</p>\r\n<p><a idref="0"></a></p>\r\n`
		)
		const context = makeMockContext()
		const result = getSegment(context, ingestSegment)
		expectNotesToBe(context, ['Graphic found without target engine'])
		expect(result.segment.isHidden).toBe(false)
		expect(result.parts).toHaveLength(1)
		expectAllPartsToBeValid(result)

		const kamPart = result.parts[0]
		expect(kamPart).toBeTruthy()
		expect(kamPart.pieces).toHaveLength(2)
		expect(kamPart.pieces.map(p => p.sourceLayerId)).toEqual([SourceLayer.PgmCam, SourceLayer.PgmScript])
		expect(kamPart.adLibPieces).toHaveLength(0)
		expect(kamPart.actions).toHaveLength(0)
	})

	it('Creates invalid part for standalone GRAFIK=FULL', () => {
		const ingestSegment = makeIngestSegment(
			[['GRAFIK=FULL']],
			`\r\n<pi>Kam 1</pi>\r\n<p>Some script</p>\r\n<p><a idref="0"></a></p>\r\n`
		)
		const context = makeMockContext()
		const result = getSegment(context, ingestSegment)
		expectNotesToBe(context, ['No graphic found after GRAFIK cue'])
		expect(result.segment.isHidden).toBe(false)
		expect(result.parts).toHaveLength(2)

		const kamPart = result.parts[0]
		expect(kamPart).toBeTruthy()
		expect(kamPart.pieces).toHaveLength(2)
		expect(kamPart.pieces.map(p => p.sourceLayerId)).toEqual([SourceLayer.PgmCam, SourceLayer.PgmScript])
		expect(kamPart.adLibPieces).toHaveLength(0)
		expect(kamPart.actions).toHaveLength(0)

		const fullPart = result.parts[1]
		expect(fullPart).toBeTruthy()
		expect(fullPart.part.invalid).toBe(true)
	})

	it('Creates graphic for GRAFIK=FULL with Pilot', () => {
		const ingestSegment = makeIngestSegment(
			[
				['GRAFIK=FULL'],
				[
					'#cg4 pilotdata',
					'News/Citast/ARFG/LIVE/stoppoints_3',
					'VCPID=2547768',
					'ContinueCount=8',
					'News/Citat/ARFG/LIVE/stoppoints_3'
				]
			],
			`\r\n<pi>Kam 1</pi>\r\n<p>Some script</p>\r\n<p><a idref="0"></a></p>\r\n<p><a idref="1"></a></p>\r\n`
		)
		const context = makeMockContext()
		const result = getSegment(context, ingestSegment)
		expectNotesToBe(context, [])
		expect(result.segment.isHidden).toBe(false)
		expect(result.parts).toHaveLength(2)
		expectAllPartsToBeValid(result)

		const kamPart = result.parts[0]
		expect(kamPart).toBeTruthy()
		expect(kamPart.pieces).toHaveLength(2)
		expect(kamPart.pieces.map(p => p.sourceLayerId)).toEqual([SourceLayer.PgmCam, SourceLayer.PgmScript])
		expect(kamPart.adLibPieces).toHaveLength(0)
		expect(kamPart.actions).toHaveLength(0)

		const fullPart = result.parts[1]
		expect(fullPart).toBeTruthy()
		expect(fullPart.pieces).toHaveLength(1)
		expect(fullPart.pieces.map(p => p.sourceLayerId)).toEqual([SourceLayer.PgmPilot])
		expect(fullPart.adLibPieces).toHaveLength(1)
		const fullAdlib = fullPart.adLibPieces[0]
		expect(fullAdlib).toBeTruthy()
		expect(fullAdlib.sourceLayerId).toBe(SourceLayer.PgmPilot)
		expect(fullPart.actions).toHaveLength(0)
	})

	it("Doesn't merge MOSART=L with GRAFIK=FULL", () => {
		const ingestSegment = makeIngestSegment(
			[
				['GRAFIK=FULL'],
				[
					']] S3.0 M 0 [[',
					'cg4 ]] 1 YNYAB 0 [[ pilotdata',
					'LgfxWeb/-ETKAEM_07-05-2019_17:55:42/MOSART=L|M|O',
					'VCPID=2520177',
					'ContinueCount=-1',
					'LgfxWeb/-ETKAEM_07-05-2019_17:55:42/MOSART=L|M|O'
				]
			],
			`\r\n<pi>Kam 1</pi>\r\n<p>Some script</p>\r\n<p><a idref="0"></a></p>\r\n<p><a idref="1"></a></p>\r\n`
		)
		const context = makeMockContext()
		const result = getSegment(context, ingestSegment)
		expectNotesToBe(context, ['No graphic found after GRAFIK cue'])
		expect(result.segment.isHidden).toBe(false)
		expect(result.parts).toHaveLength(2)

		const kamPart = result.parts[0]
		expect(kamPart).toBeTruthy()
		expect(kamPart.pieces).toHaveLength(2)
		expect(kamPart.pieces.map(p => p.sourceLayerId)).toEqual([SourceLayer.PgmCam, SourceLayer.PgmScript])
		expect(kamPart.adLibPieces).toHaveLength(0)
		expect(kamPart.actions).toHaveLength(0)

		const fullPart = result.parts[1]
		expect(fullPart).toBeTruthy()
		expect(fullPart.part.invalid).toBe(true)
	})

	it('Creates full when cues are correct and shows warning when OVL with FULL is disabled', () => {
		const ingestSegment = makeIngestSegment(
			[
				['GRAFIK=FULL'],
				[
					'#cg4 pilotdata',
					'News/Citast/ARFG/LIVE/stoppoints_3',
					'VCPID=2547768',
					'ContinueCount=8',
					'News/Citat/ARFG/LIVE/stoppoints_3'
				],
				[
					']] S3.0 M 0 [[',
					'cg4 ]] 1 YNYAB 0 [[ pilotdata',
					'LgfxWeb/-ETKAEM_07-05-2019_17:55:42/MOSART=L|00:00|O',
					'VCPID=2520177',
					'ContinueCount=-1',
					'LgfxWeb/-ETKAEM_07-05-2019_17:55:42/MOSART=L|00:00|O'
				]
			],
			`\r\n<pi>Kam 1</pi>\r\n<p>Some script</p>\r\n<p><a idref="0"></a></p>\r\n<p><a idref="1"></a></p>\r\n<p><a idref="2"></a></p>\r\n`
		)
		const context = makeMockContext()
		const result = getSegment(context, ingestSegment)
		expectNotesToBe(context, ['Cannot create overlay graphic with FULL'])
		expect(result.segment.isHidden).toBe(false)
		expect(result.parts).toHaveLength(2)
		expectAllPartsToBeValid(result)

		const kamPart = result.parts[0]
		expect(kamPart).toBeTruthy()
		expect(kamPart.pieces).toHaveLength(2)
		expect(kamPart.pieces.map(p => p.sourceLayerId)).toEqual([SourceLayer.PgmCam, SourceLayer.PgmScript])
		expect(kamPart.adLibPieces).toHaveLength(0)
		expect(kamPart.actions).toHaveLength(0)

		const fullPart = result.parts[1]
		expect(fullPart).toBeTruthy()
		expect(fullPart.pieces).toHaveLength(1)
		expect(fullPart.adLibPieces).toHaveLength(1)
		const fullAdlib = fullPart.adLibPieces[0]
		expect(fullAdlib).toBeTruthy()
		expect(fullAdlib.sourceLayerId).toBe(SourceLayer.PgmPilot)
		expect(fullPart.actions).toHaveLength(0)
		expect(fullPart.pieces.map(p => p.sourceLayerId)).toEqual([SourceLayer.PgmPilot])
	})

	it('Creates full when cues are correct and creates overlay when allowed', () => {
		const ingestSegment = makeIngestSegment(
			[
				['GRAFIK=FULL'],
				[
					'#cg4 pilotdata',
					'News/Citast/ARFG/LIVE/stoppoints_3',
					'VCPID=2547768',
					'ContinueCount=8',
					'News/Citat/ARFG/LIVE/stoppoints_3'
				],
				[
					']] S3.0 M 0 [[',
					'cg4 ]] 1 YNYAB 0 [[ pilotdata',
					'LgfxWeb/-ETKAEM_07-05-2019_17:55:42/MOSART=L|00:00|O',
					'VCPID=2520177',
					'ContinueCount=-1',
					'LgfxWeb/-ETKAEM_07-05-2019_17:55:42/MOSART=L|00:00|O'
				]
			],
			`\r\n<pi>Kam 1</pi>\r\n<p>Some script</p>\r\n<p><a idref="0"></a></p>\r\n<p><a idref="1"></a></p>\r\n<p><a idref="2"></a></p>\r\n`
		)
		const context = makeMockContext(false)
		const result = getSegment(context, ingestSegment)
		expectNotesToBe(context, [])
		expect(result.segment.isHidden).toBe(false)
		expect(result.parts).toHaveLength(2)
		expectAllPartsToBeValid(result)

		const kamPart = result.parts[0]
		expect(kamPart).toBeTruthy()
		expect(kamPart.pieces).toHaveLength(2)
		expect(kamPart.pieces.map(p => p.sourceLayerId)).toEqual([SourceLayer.PgmCam, SourceLayer.PgmScript])
		expect(kamPart.adLibPieces).toHaveLength(0)
		expect(kamPart.actions).toHaveLength(0)

		const fullPart = result.parts[1]
		expect(fullPart).toBeTruthy()
		expect(fullPart.pieces).toHaveLength(2)
		expect(fullPart.adLibPieces).toHaveLength(1)
		const fullAdlib = fullPart.adLibPieces[0]
		expect(fullAdlib).toBeTruthy()
		expect(fullAdlib.sourceLayerId).toBe(SourceLayer.PgmPilot)
		expect(fullPart.actions).toHaveLength(0)
		expect(fullPart.pieces.map(p => p.sourceLayerId)).toEqual([SourceLayer.PgmPilot, SourceLayer.PgmPilotOverlay])
	})

	it('Creates graphic for GRAFIK=FULL with Pilot with space', () => {
		const ingestSegment = makeIngestSegment(
			[
				['GRAFIK=FULL'],
				null,
				[
					'#cg4 pilotdata',
					'News/Citast/ARFG/LIVE/stoppoints_3',
					'VCPID=2547768',
					'ContinueCount=8',
					'News/Citat/ARFG/LIVE/stoppoints_3'
				]
			],
			`\r\n<pi>Kam 1</pi>\r\n<p>Some script</p>\r\n<p>Some script</p>\r\n<p>Some script</p>\r\n<p>Some script</p>\r\n<p>Some script</p>\r\n<p><a idref="0"></a></p>\r\n<p><a idref="2"></a></p>\r\n`
		)
		const context = makeMockContext()
		const result = getSegment(context, ingestSegment)
		expectNotesToBe(context, [])
		expect(result.segment.isHidden).toBe(false)
		expect(result.parts).toHaveLength(2)
		expectAllPartsToBeValid(result)

		const kamPart = result.parts[0]
		expect(kamPart).toBeTruthy()
		expect(kamPart.pieces).toHaveLength(2)
		expect(kamPart.pieces.map(p => p.sourceLayerId)).toEqual([SourceLayer.PgmCam, SourceLayer.PgmScript])
		expect(kamPart.adLibPieces).toHaveLength(0)
		expect(kamPart.actions).toHaveLength(0)

		const fullPart = result.parts[1]
		expect(fullPart).toBeTruthy()
		expect(fullPart.pieces).toHaveLength(1)
		expect(fullPart.pieces.map(p => p.sourceLayerId)).toEqual([SourceLayer.PgmPilot])
		expect(fullPart.adLibPieces).toHaveLength(1)
		const fullAdlib = fullPart.adLibPieces[0]
		expect(fullAdlib).toBeTruthy()
		expect(fullAdlib.sourceLayerId).toBe(SourceLayer.PgmPilot)
		expect(fullPart.actions).toHaveLength(0)
	})

	it("Creates invalid part for GRAFIK=FULL with Pilot with 'notes'", () => {
		const ingestSegment = makeIngestSegment(
			[
				['GRAFIK=FULL'],
				['These are some notes for the floor manager'],
				[
					'#cg4 pilotdata',
					'News/Citast/ARFG/LIVE/stoppoints_3',
					'VCPID=2547768',
					'ContinueCount=8',
					'News/Citat/ARFG/LIVE/stoppoints_3'
				]
			],
			`\r\n<pi>Kam 1</pi>\r\n<p>Some script</p>\r\n<p>Some script</p>\r\n<p>Some script</p>\r\n<p>Some script</p>\r\n<p>Some script</p>\r\n<p><a idref="0"></a></p>\r\n<p><a idref="1"></a></p>\r\n<p><a idref="2"></a></p>\r\n`
		)
		const context = makeMockContext()
		const result = getSegment(context, ingestSegment)
		expectNotesToBe(context, ['No graphic found after GRAFIK cue', 'Graphic found without target engine'])
		expect(result.segment.isHidden).toBe(false)
		expect(result.parts).toHaveLength(2)

		const kamPart = result.parts[0]
		expect(kamPart).toBeTruthy()
		expect(kamPart.pieces).toHaveLength(2)
		expect(kamPart.pieces.map(p => p.sourceLayerId)).toEqual([SourceLayer.PgmCam, SourceLayer.PgmScript])
		expect(kamPart.adLibPieces).toHaveLength(0)
		expect(kamPart.actions).toHaveLength(0)

		const fullPart = result.parts[1]
		expect(fullPart).toBeTruthy()
		expect(fullPart.part.invalid).toBe(true)
		expect(fullPart.pieces).toHaveLength(0)
		expect(fullPart.adLibPieces).toHaveLength(0)
		expect(fullPart.actions).toHaveLength(0)
	})

	it('Creates invalid part for GRAFIK=FULL with Pilot and bund in between', () => {
		const ingestSegment = makeIngestSegment(
			[
				['GRAFIK=FULL'],
				['#kg bund some person', ';0.00'],
				[
					'#cg4 pilotdata',
					'News/Citast/ARFG/LIVE/stoppoints_3',
					'VCPID=2547768',
					'ContinueCount=8',
					'News/Citat/ARFG/LIVE/stoppoints_3'
				]
			],
			`\r\n<pi>Kam 1</pi>\r\n<p>Some script</p>\r\n<p>Some script</p>\r\n<p>Some script</p>\r\n<p>Some script</p>\r\n<p>Some script</p>\r\n<p><a idref="0"></a></p>\r\n<p><a idref="1"></a></p>\r\n<p><a idref="2"></a></p>\r\n`
		)
		const context = makeMockContext()
		const result = getSegment(context, ingestSegment)
		expectNotesToBe(context, ['No graphic found after GRAFIK cue', 'Graphic found without target engine'])
		expect(result.segment.isHidden).toBe(false)
		expect(result.parts).toHaveLength(2)

		const kamPart = result.parts[0]
		expect(kamPart).toBeTruthy()
		expect(kamPart.pieces).toHaveLength(2)
		expect(kamPart.pieces.map(p => p.sourceLayerId)).toEqual([SourceLayer.PgmCam, SourceLayer.PgmScript])
		expect(kamPart.adLibPieces).toHaveLength(0)
		expect(kamPart.actions).toHaveLength(0)

		const fullPart = result.parts[1]
		expect(fullPart).toBeTruthy()
		expect(fullPart.part.invalid).toBe(true)
		expect(fullPart.pieces).toHaveLength(0)
		expect(fullPart.adLibPieces).toHaveLength(1)
		expect(fullPart.actions).toHaveLength(0)
	})

	it('Creates invalid part and show warning when GRAFIK=FULL and Pilot in different parts', () => {
		const ingestSegment = makeIngestSegment(
			[
				['GRAFIK=FULL'],
				[
					'#cg4 pilotdata',
					'News/Citast/ARFG/LIVE/stoppoints_3',
					'VCPID=2547768',
					'ContinueCount=8',
					'News/Citat/ARFG/LIVE/stoppoints_3'
				]
			],
			`\r\n<pi>Kam 1</pi>\r\n<p>Some script</p>\r\n<p><a idref="0"></a></p>\r\n<pi>Kam 2</pi>\r\n<p><a idref="1"></a></p>\r\n`
		)
		const context = makeMockContext()
		const result = getSegment(context, ingestSegment)
		expectNotesToBe(context, ['No graphic found after GRAFIK cue', 'Graphic found without target engine'])
		expect(result.segment.isHidden).toBe(false)
		expect(result.parts).toHaveLength(3)

		const kamPart1 = result.parts[0]
		expect(kamPart1).toBeTruthy()
		expect(kamPart1.pieces).toHaveLength(2)
		expect(kamPart1.pieces.map(p => p.sourceLayerId)).toEqual([SourceLayer.PgmCam, SourceLayer.PgmScript])
		expect(kamPart1.adLibPieces).toHaveLength(0)
		expect(kamPart1.actions).toHaveLength(0)

		const fullPart = result.parts[1]
		expect(fullPart).toBeTruthy()
		expect(fullPart.part.invalid).toBe(true)
		expect(fullPart.pieces).toHaveLength(0)
		expect(fullPart.adLibPieces).toHaveLength(0)
		expect(fullPart.actions).toHaveLength(0)

		const kamPart2 = result.parts[2]
		expect(kamPart2).toBeTruthy()
		expect(kamPart2.pieces).toHaveLength(1)
		expect(kamPart2.pieces.map(p => p.sourceLayerId)).toEqual([SourceLayer.PgmCam])
		expect(kamPart2.adLibPieces).toHaveLength(0)
		expect(kamPart2.actions).toHaveLength(0)
	})

	it('Creates overlay graphic for MOSART=L', () => {
		const ingestSegment = makeIngestSegment(
			[
				[
					']] S3.0 M 0 [[',
					'cg4 ]] 1 YNYAB 0 [[ pilotdata',
					'LgfxWeb/-ETKAEM_07-05-2019_17:55:42/MOSART=L|00:00|O',
					'VCPID=2520177',
					'ContinueCount=-1',
					'LgfxWeb/-ETKAEM_07-05-2019_17:55:42/MOSART=L|00:00|O'
				]
			],
			`\r\n<pi>Kam 1</pi>\r\n<p>Some script</p>\r\n<p><a idref="0"></a></p>\r\n`
		)
		const context = makeMockContext()
		const result = getSegment(context, ingestSegment)
		expectNotesToBe(context, [])
		expect(result.segment.isHidden).toBe(false)
		expect(result.parts).toHaveLength(1)
		expectAllPartsToBeValid(result)

		const kamPart = result.parts[0]
		expect(kamPart).toBeTruthy()
		expect(kamPart.pieces).toHaveLength(3)
		expect(kamPart.pieces.map(p => p.sourceLayerId)).toEqual([
			SourceLayer.PgmCam,
			SourceLayer.PgmPilotOverlay,
			SourceLayer.PgmScript
		])
		expect(kamPart.adLibPieces).toHaveLength(0)
		expect(kamPart.actions).toHaveLength(0)
	})

	it('Creates wall graphic for MOSART=W', () => {
		const ingestSegment = makeIngestSegment(
			[
				[
					']] S3.0 M 0 [[',
					'cg4 ]] 1 YNYAB 0 [[ pilotdata',
					'LgfxWeb/-ETKAEM_07-05-2019_17:55:42/MOSART=W|00:00|O',
					'VCPID=2520177',
					'ContinueCount=-1',
					'LgfxWeb/-ETKAEM_07-05-2019_17:55:42/MOSART=W|00:00|O'
				]
			],
			`\r\n<pi>Kam 1</pi>\r\n<p>Some script</p>\r\n<p><a idref="0"></a></p>\r\n`
		)
		const context = makeMockContext()
		const result = getSegment(context, ingestSegment)
		expectNotesToBe(context, [])
		expect(result.segment.isHidden).toBe(false)
		expect(result.parts).toHaveLength(1)
		expectAllPartsToBeValid(result)

		const kamPart = result.parts[0]
		expect(kamPart).toBeTruthy()
		expect(kamPart.pieces).toHaveLength(3)
		expect(kamPart.pieces.map(p => p.sourceLayerId)).toEqual([
			SourceLayer.PgmCam,
			SourceLayer.WallGraphics,
			SourceLayer.PgmScript
		])
		expect(kamPart.adLibPieces).toHaveLength(0)
		expect(kamPart.actions).toHaveLength(0)
	})

	it('Creates full graphic for MOSART=F', () => {
		const ingestSegment = makeIngestSegment(
			[
				[
					']] S3.0 M 0 [[',
					'cg4 ]] 1 YNYAB 0 [[ pilotdata',
					'LgfxWeb/-ETKAEM_07-05-2019_17:55:42/MOSART=F|00:00|O',
					'VCPID=2520177',
					'ContinueCount=-1',
					'LgfxWeb/-ETKAEM_07-05-2019_17:55:42/MOSART=F|00:00|O'
				]
			],
			`\r\n<pi>Kam 1</pi>\r\n<p>Some script</p>\r\n<p><a idref="0"></a></p>\r\n`
		)
		const context = makeMockContext()
		const result = getSegment(context, ingestSegment)
		expectNotesToBe(context, [])
		expect(result.segment.isHidden).toBe(false)
		expect(result.parts).toHaveLength(2)
		expectAllPartsToBeValid(result)

		const kamPart = result.parts[0]
		expect(kamPart).toBeTruthy()
		expect(kamPart.pieces).toHaveLength(2)
		expect(kamPart.pieces.map(p => p.sourceLayerId)).toEqual([SourceLayer.PgmCam, SourceLayer.PgmScript])
		expect(kamPart.adLibPieces).toHaveLength(0)
		expect(kamPart.actions).toHaveLength(0)

		const fullPart = result.parts[1]
		expect(fullPart).toBeTruthy()
		expect(fullPart.pieces).toHaveLength(1)
		expect(fullPart.adLibPieces).toHaveLength(1)
		const fullAdlib = fullPart.adLibPieces[0]
		expect(fullAdlib).toBeTruthy()
		expect(fullAdlib.sourceLayerId).toBe(SourceLayer.PgmPilot)
		expect(fullPart.actions).toHaveLength(0)
		expect(fullPart.pieces.map(p => p.sourceLayerId)).toEqual([SourceLayer.PgmPilot])
	})
})
