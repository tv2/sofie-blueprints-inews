/*import * as _ from 'underscore'

import {
	BlueprintResultSegment,
	IBlueprintPieceGeneric,
	IBlueprintRundownDB,
	IngestRundown,
	IngestSegment,
	TimelineObjectCoreExt
} from '@sofie-automation/blueprints-integration'
import { ConfigMap, defaultShowStyleConfig, defaultStudioConfig } from './configs'
// import { ConfigMap } from './configs'

// @ts-ignore
global.VERSION = 'test'
// @ts-ignore
global.VERSION_TSR = 'test'
// @ts-ignore
global.VERSION_INTEGRATION = 'test'
import { literal } from 'tv2-common'
import { SegmentContext, ShowStyleContext } from '../../__mocks__/context'
import mappingsDefaults from '../../tv2_afvd_studio/migrations/mappings-defaults'
import { remapVizLLayer } from '../../tv2_offtube_showstyle/migrations'
import Blueprints from '../index'

// More ROs can be listed here to make them part of the basic blueprint doesnt crash test
const rawRundown: { ro: string; studioConfig: ConfigMap; showStyleConfig: ConfigMap } = {
	ro: '../../../rundowns/on-air-reference.json',
	studioConfig: JSON.parse(JSON.stringify(defaultStudioConfig)),
	showStyleConfig: defaultShowStyleConfig
}

const segments: { [id: string]: IngestSegment } = {
	reference: {
		externalId: '1dd244cb:00921671:5e1db210',
		name: 'Reference',
		rank: 10,
		payload: {
			rundownId: 'NYHEDERNE-TEST.SOFIE.ON-AIR',
			iNewsStory: {
				fields: {
					pageNumber: '17',
					title: 'Reference',
					var2: 'INDSL',
					tapeTime: '313',
					audioTime: '13',
					totalTime: '313',
					modifyDate: '1579008960',
					modifyBy: 'bede',
					var16: 'ååmmdd',
					ready: 'KLAR',
					runsTime: '0',
					onair: 'ON-AIR',
					typecode: 'nyx',
					programtitle: '.',
					noarchive: '.'
				},
				meta: {
					words: '28',
					rate: '140',
					float: ''
				},
				cues: [],
				id: '1dd244cb:00921671:5e1db210',
				body:
					'\r\n<p><pi>Kam 1</pi></p>\r\n<p></p>\r\n<p>This is a manus with a tape time of 5 minutes, wich is the Editors way of "giving" this LIVE a maximum of 5 minutes.</p>\r\n<p>This text is XX seconds and are added to the totaltime</p>\r\n<p></p>\r\n',
				fileId: '1DD244CB:0093A9A8:5E1DB5C9'
			},
			modified: '1579008960',
			externalId: '1dd244cb:00921671:5e1db210',
			rank: 10,
			name: 'Reference',
			float: false
		},
		parts: []
	}
}

const timings: { [id: string]: number[] } = {
	reference: [10, 303]
}

describe('Part timing', () => {
	const roData = require(rawRundown.ro) as IngestRundown
	const showStyleContext = new ShowStyleContext('mockRo', mappingsDefaults)
	const blueprintRundown = Blueprints.getRundown(showStyleContext, roData)
	const rundown = literal<IBlueprintRundownDB>({
		...blueprintRundown.rundown,
		_id: 'mockRo',
		showStyleVariantId: 'mock'
	})

	const mockContext = new SegmentContext(rundown, mappingsDefaults)
	mockContext.studioConfig = roSpec.studioConfig as any
	mockContext.showStyleConfig = roSpec.showStyleConfig as any

	/*for (const segment of segments) {
		test('Rundown segment: ' + roSpec.ro + ' - ' + rundown.externalId, async () => {
			const mockContext = new SegmentContext(rundown, mappingsDefaults)
			mockContext.studioConfig = roSpec.studioConfig as any
			mockContext.showStyleConfig = roSpec.showStyleConfig as any

			const res = Blueprints.getSegment(mockContext, segment)
			if (segment.payload.iNewsStory.fields.pageNumber && segment.payload.iNewsStory.fields.pageNumber.trim()) {
				expect(res.segment.identifier).toEqual(segment.payload.iNewsStory.fields.pageNumber.trim())
			}

			expect(res.segment.name).toEqual(segment.name)

			const allPieces: IBlueprintPieceGeneric[] = []
			_.each(res.parts, part => {
				allPieces.push(...part.pieces)
				allPieces.push(...part.adLibPieces)
			})

			const reference = require(`./regressions-afkd-reference/regression-test-afvd-${segment.externalId.replace(
				':',
				'-'
			)}.json`) as BlueprintResultSegment

			expect(res).toEqual(migrate(reference))

			// ensure there were no warnings
			expect(mockContext.getNotes()).toEqual([])
		})
	}
})
*/
