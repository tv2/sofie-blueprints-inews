import * as _ from 'underscore'

import { ExtendedIngestRundown, IBlueprintPieceGeneric } from 'blueprints-integration'
import { defaultShowStyleConfig, defaultStudioConfig } from './configs'
import { checkAllLayers } from './layers-check'

// @ts-ignore
global.VERSION = 'test'
// @ts-ignore
global.VERSION_TSR = 'test'
// @ts-ignore
global.VERSION_INTEGRATION = 'test'

import { INewsStory } from 'tv2-common'
import { SegmentUserContextMock } from '../../__mocks__/context'
import { preprocessConfig as parseStudioConfig, StudioConfig } from '../../tv2_afvd_studio/helpers/config'
import mappingsDefaults from '../../tv2_afvd_studio/migrations/mappings-defaults'
import { GalleryShowStyleConfig, preprocessConfig as parseShowStyleConfig } from '../helpers/config'
import Blueprints from '../index'

const onAirRundownRelativePath = '../../../rundowns/on-air.json'

// More ROs can be listed here to make them part of the basic blueprint
const rundowns: Array<{ ro: string; studioConfig: StudioConfig; showStyleConfig: GalleryShowStyleConfig }> = [
	{ ro: onAirRundownRelativePath, studioConfig: defaultStudioConfig, showStyleConfig: defaultShowStyleConfig }
]

describe('Generate rundowns without error', () => {
	for (const roSpec of rundowns) {
		const roData = require(roSpec.ro) as ExtendedIngestRundown
		test('Valid file: ' + roSpec.ro, () => {
			expect(roData).toBeTruthy()
			expect(roData.externalId).toBeTruthy()
			expect(roData.type).toEqual('inews')
		})

		for (const segment of roData.segments) {
			test(`Rundown segment: ${segment.name} - ${roSpec.ro} - ${roData.externalId}`, async () => {
				const mockContext = new SegmentUserContextMock(
					'test',
					mappingsDefaults,
					parseStudioConfig,
					parseShowStyleConfig
				)
				mockContext.studioConfig = roSpec.studioConfig as any
				mockContext.showStyleConfig = roSpec.showStyleConfig as any

				const iNewsStory: INewsStory | undefined = segment.payload?.iNewsStory

				const res = await Blueprints.getSegment(mockContext, segment)
				if (iNewsStory && iNewsStory.fields.pageNumber && iNewsStory.fields.pageNumber.trim()) {
					expect(res.segment.identifier).toEqual(iNewsStory.fields.pageNumber.trim())
				}

				expect(res.segment.name).toEqual(segment.name)

				const allPieces: IBlueprintPieceGeneric[] = []
				_.each(res.parts, (part) => {
					allPieces.push(...part.pieces)
					allPieces.push(...part.adLibPieces)
				})

				checkAllLayers(allPieces)

				// ensure there were no warnings
				// TODO: Re-enable when the time is right
				// expect(mockContext.getNotes()).toEqual([])
			})
		}
	}
})
