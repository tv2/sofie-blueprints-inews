import * as _ from 'underscore'

import { BlueprintResultSegment, PieceLifespan, TimelineObjectCoreExt } from '@tv2media/blueprints-integration'

// @ts-ignore
global.VERSION = 'test'
// @ts-ignore
global.VERSION_TSR = 'test'
// @ts-ignore
global.VERSION_INTEGRATION = 'test'
import { literal } from 'tv2-common'
import { remapVizLLayer } from '../../tv2_offtube_showstyle/migrations'

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
