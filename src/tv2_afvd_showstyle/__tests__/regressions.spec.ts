import * as _ from 'underscore'

import {
	BlueprintResultSegment,
	// ExtendedIngestRundown,
	// IBlueprintPieceGeneric,
	// IBlueprintRundownDB,
	PieceLifespan,
	TimelineObjectCoreExt
} from 'tv-automation-sofie-blueprints-integration'
// import { ConfigMap, defaultShowStyleConfig, defaultStudioConfig } from './configs'
// import { ConfigMap } from './configs'

// @ts-ignore
global.VERSION = 'test'
// @ts-ignore
global.VERSION_TSR = 'test'
// @ts-ignore
global.VERSION_INTEGRATION = 'test'
import { remapVizLLayer } from '../../tv2_offtube_showstyle/migrations'
import { literal } from 'tv2-common'
/*import { INewsStory, literal } from 'tv2-common'
import { SegmentContext, ShowStyleContext } from '../../__mocks__/context'
import mappingsDefaults from '../../tv2_afvd_studio/migrations/mappings-defaults'
import { remapVizLLayer } from '../../tv2_offtube_showstyle/migrations'
import Blueprints from '../index'

// More ROs can be listed here to make them part of the basic blueprint doesnt crash test
const rundowns: Array<{ ro: string; studioConfig: ConfigMap; showStyleConfig: ConfigMap }> = [
	{
		ro: '../../../rundowns/on-air-reference.json',
		studioConfig: JSON.parse(JSON.stringify(defaultStudioConfig)),
		showStyleConfig: defaultShowStyleConfig
	}
]*/

/*describe.skip('Rundown exceptions', () => {
	for (const roSpec of rundowns) {
		const roData = require(roSpec.ro) as ExtendedIngestRundown
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

				const reference = require(`./regressions-afkd-reference/regression-test-afvd-${segment.externalId.replace(
					':',
					'-'
				)}.json`) as BlueprintResultSegment

				expect(res).toEqual(migrate(reference))

				// ensure there were no warnings
				expect(mockContext.getNotes()).toEqual([])
			})
		}
	}
})*/

describe('regressions-migrations', () => {
	it('Migrates VizLLayer to GraphicLLayer', () => {
		const segment: BlueprintResultSegment = {
			segment: {
				name: 'Regresstions Migrations Test 1'
			},
			parts: [
				{
					part: {
						externalId: '',
						title: ''
					},
					pieces: [
						{
							externalId: '',
							enable: {
								start: 0
							},
							name: '',
							sourceLayerId: '',
							outputLayerId: '',
							lifespan: PieceLifespan.WithinPart,
							content: {
								timelineObjects: [
									literal<TimelineObjectCoreExt>({
										id: '',
										enable: {
											while: '1'
										},
										content: {
											deviceType: 0
										},
										layer: 'viz_layer_overlay_ident'
									}),
									literal<TimelineObjectCoreExt>({
										id: '',
										enable: {
											while: '1'
										},
										content: {
											deviceType: 0
										},
										layer: 'viz_layer_design'
									}),
									literal<TimelineObjectCoreExt>({
										id: '',
										enable: {
											while: '1'
										},
										content: {
											deviceType: 0
										},
										layer: 'viz_layer_adlibs'
									})
								]
							}
						}
					],
					adLibPieces: [
						{
							_rank: 0,
							externalId: '',
							name: '',
							sourceLayerId: '',
							outputLayerId: '',
							lifespan: PieceLifespan.WithinPart,
							content: {
								timelineObjects: [
									literal<TimelineObjectCoreExt>({
										id: '',
										enable: {
											while: '1'
										},
										content: {
											deviceType: 0
										},
										layer: 'viz_layer_overlay_ident'
									}),
									literal<TimelineObjectCoreExt>({
										id: '',
										enable: {
											while: '1'
										},
										content: {
											deviceType: 0
										},
										layer: 'viz_layer_overlay_tema'
									}),
									literal<TimelineObjectCoreExt>({
										id: '',
										enable: {
											while: '1'
										},
										content: {
											deviceType: 0
										},
										layer: 'viz_layer_pilot'
									})
								]
							}
						}
					]
				}
			]
		}

		const ref: BlueprintResultSegment = {
			segment: {
				name: 'Regresstions Migrations Test 1'
			},
			parts: [
				{
					part: {
						externalId: '',
						title: ''
					},
					pieces: [
						{
							externalId: '',
							enable: {
								start: 0
							},
							name: '',
							sourceLayerId: '',
							outputLayerId: '',
							lifespan: PieceLifespan.WithinPart,
							content: {
								timelineObjects: [
									literal<TimelineObjectCoreExt>({
										id: '',
										enable: {
											while: '1'
										},
										content: {
											deviceType: 0
										},
										layer: 'graphic_overlay_ident'
									}),
									literal<TimelineObjectCoreExt>({
										id: '',
										enable: {
											while: '1'
										},
										content: {
											deviceType: 0
										},
										layer: 'graphic_design'
									}),
									literal<TimelineObjectCoreExt>({
										id: '',
										enable: {
											while: '1'
										},
										content: {
											deviceType: 0
										},
										layer: 'graphic_adlibs'
									})
								]
							}
						}
					],
					adLibPieces: [
						{
							_rank: 0,
							externalId: '',
							name: '',
							sourceLayerId: '',
							outputLayerId: '',
							lifespan: PieceLifespan.WithinPart,
							content: {
								timelineObjects: [
									literal<TimelineObjectCoreExt>({
										id: '',
										enable: {
											while: '1'
										},
										content: {
											deviceType: 0
										},
										layer: 'graphic_overlay_ident'
									}),
									literal<TimelineObjectCoreExt>({
										id: '',
										enable: {
											while: '1'
										},
										content: {
											deviceType: 0
										},
										layer: 'graphic_overlay_tema'
									}),
									literal<TimelineObjectCoreExt>({
										id: '',
										enable: {
											while: '1'
										},
										content: {
											deviceType: 0
										},
										layer: 'graphic_pilot'
									})
								]
							}
						}
					]
				}
			]
		}

		expect(migrate(segment)).toEqual(ref)
	})
})

/**
 * Migrates values from pre-offtubes AFVD to new values.
 * @param reference Reference segment.
 */
function migrate(reference: BlueprintResultSegment) {
	reference.parts = reference.parts.map(part => {
		part.adLibPieces = part.adLibPieces.map(adlib => {
			if (adlib.content && adlib.content.timelineObjects) {
				adlib.content.timelineObjects = (adlib.content.timelineObjects as TimelineObjectCoreExt[]).map(obj => {
					const remappedLayer = remapVizLLayer.get(obj.layer.toString())

					if (remappedLayer) {
						obj.layer = remappedLayer
					}

					return obj
				})
			}

			return adlib
		})

		part.pieces = part.pieces.map(adlib => {
			if (adlib.content && adlib.content.timelineObjects) {
				adlib.content.timelineObjects = (adlib.content.timelineObjects as TimelineObjectCoreExt[]).map(obj => {
					const remappedLayer = remapVizLLayer.get(obj.layer.toString())

					if (remappedLayer) {
						obj.layer = remappedLayer
					}

					return obj
				})
			}

			return adlib
		})

		return part
	})

	return reference
}
