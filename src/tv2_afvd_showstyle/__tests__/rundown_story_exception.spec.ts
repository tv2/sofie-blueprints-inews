import * as _ from 'underscore'

import { ExtendedIngestRundown, IBlueprintPieceGeneric, IBlueprintRundownDB } from '@tv2media/blueprints-integration'
import { defaultShowStyleConfig, defaultStudioConfig } from './configs'
import { checkAllLayers } from './layers-check'

// @ts-ignore
global.VERSION = 'test'
// @ts-ignore
global.VERSION_TSR = 'test'
// @ts-ignore
global.VERSION_INTEGRATION = 'test'

import { INewsStory, literal } from 'tv2-common'
import { GetRundownContext, SegmentUserContext } from '../../__mocks__/context'
import { parseConfig as parseStudioConfig, StudioConfig } from '../../tv2_afvd_studio/helpers/config'
import mappingsDefaults from '../../tv2_afvd_studio/migrations/mappings-defaults'
import { parseConfig as parseShowStyleConfig, ShowStyleConfig } from '../helpers/config'
import Blueprints from '../index'

// More ROs can be listed here to make them part of the basic blueprint doesnt crash test
const rundowns: Array<{ ro: string; studioConfig: StudioConfig; showStyleConfig: ShowStyleConfig }> = [
	{ ro: '../../../rundowns/on-air.json', studioConfig: defaultStudioConfig, showStyleConfig: defaultShowStyleConfig }
]

const RUNDOWN_ID = 'test_rundown'
const SEGMENT_ID = 'test_segment'
const PART_ID = 'test_part'

describe('Rundown exceptions', async () => {
	for (const roSpec of rundowns) {
		const roData = require(roSpec.ro) as ExtendedIngestRundown
		test('Valid file: ' + roSpec.ro, () => {
			expect(roData).toBeTruthy()
			expect(roData.externalId).toBeTruthy()
			expect(roData.type).toEqual('inews')
		})

		const showStyleContext = new GetRundownContext(
			'mockRo',
			mappingsDefaults,
			parseStudioConfig,
			parseShowStyleConfig,
			RUNDOWN_ID,
			SEGMENT_ID,
			PART_ID
		)
		// can I do this?:
		showStyleContext.studioConfig = roSpec.studioConfig as any
		showStyleContext.showStyleConfig = roSpec.showStyleConfig as any
		const blueprintRundown = await Blueprints.getRundown(showStyleContext, roData)
		const rundown = literal<IBlueprintRundownDB>({
			...blueprintRundown!.rundown,
			_id: 'mockRo',
			showStyleVariantId: 'mock'
		})

		for (const segment of roData.segments) {
			test('Rundown segment: ' + roSpec.ro + ' - ' + rundown.externalId, async () => {
				const mockContext = new SegmentUserContext('test', mappingsDefaults, parseStudioConfig, parseShowStyleConfig)
				mockContext.studioConfig = roSpec.studioConfig as any
				mockContext.showStyleConfig = roSpec.showStyleConfig as any

				const iNewsStory: INewsStory | undefined = segment.payload?.iNewsStory

				const res = Blueprints.getSegment(mockContext, segment)
				if (iNewsStory && iNewsStory.fields.pageNumber && iNewsStory.fields.pageNumber.trim()) {
					expect(res.segment.identifier).toEqual(iNewsStory.fields.pageNumber.trim())
				}

				expect(res.segment.name).toEqual(segment.name)

				const allPieces: IBlueprintPieceGeneric[] = []
				_.each(res.parts, part => {
					allPieces.push(...part.pieces)
					allPieces.push(...part.adLibPieces)
				})

				checkAllLayers(mockContext, allPieces)

				// ensure there were no warnings
				// TODO: Re-enable when the time is right
				// expect(mockContext.getNotes()).toEqual([])
			})
		}
	}
})
