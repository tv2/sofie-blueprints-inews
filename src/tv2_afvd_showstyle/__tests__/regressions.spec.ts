import * as _ from 'underscore'

import { IBlueprintPieceGeneric, IBlueprintRundownDB, IngestRundown } from 'tv-automation-sofie-blueprints-integration'
import { defaultShowStyleConfig, defaultStudioConfig } from './configs'
// import { ConfigMap } from './configs'

// @ts-ignore
global.VERSION = 'test'
// @ts-ignore
global.VERSION_TSR = 'test'
// @ts-ignore
global.VERSION_INTEGRATION = 'test'
import * as fs from 'fs'
import { SegmentContext, ShowStyleContext } from '../../__mocks__/context'
import { literal } from '../../common/util'
import { StudioConfig } from '../../tv2_afvd_studio/helpers/config'
import mappingsDefaults from '../../tv2_afvd_studio/migrations/mappings-defaults'
import { ShowStyleConfig } from '../helpers/config'
import Blueprints from '../index'

// More ROs can be listed here to make them part of the basic blueprint doesnt crash test
const rundowns: Array<{ ro: string; studioConfig: StudioConfig; showStyleConfig: ShowStyleConfig }> = [
	{
		ro: '../../../rundowns/on-air.json',
		studioConfig: JSON.parse(JSON.stringify(defaultStudioConfig)),
		showStyleConfig: defaultShowStyleConfig
	}
]

describe('Rundown exceptions', () => {
	for (const roSpec of rundowns) {
		const roData = require(roSpec.ro) as IngestRundown
		test('Valid file: ' + roSpec.ro, () => {
			expect(roData).toBeTruthy()
			expect(roData.externalId).toBeTruthy()
			expect(roData.type).toEqual('inews')
		})

		const showStyleContext = new ShowStyleContext('mockRo', mappingsDefaults)
		const blueprintRundown = Blueprints.getRundown(showStyleContext, roData)
		const rundown = literal<IBlueprintRundownDB>({
			...blueprintRundown.rundown,
			_id: 'mockRo',
			showStyleVariantId: 'mock'
		})

		for (const segment of roData.segments) {
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

				fs.writeFileSync(`regression-test-afvd-${segment.externalId.replace(':', '-')}`, JSON.stringify(res))

				// ensure there were no warnings
				expect(mockContext.getNotes()).toEqual([])
			})
		}
	}
})
