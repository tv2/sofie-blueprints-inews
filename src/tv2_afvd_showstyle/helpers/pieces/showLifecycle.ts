import { BlueprintResultPart, PieceLifespan, TSR } from 'blueprints-integration'
import { literal, TV2BlueprintConfig } from 'tv2-common'
import { SharedOutputLayers } from 'tv2-constants'
import { GraphicLLayer } from '../../../tv2_afvd_studio/layers'
import { SourceLayer } from '../../layers'

export function CreateShowLifecyclePieces(
	config: TV2BlueprintConfig,
	part: BlueprintResultPart,
	initializeShowNames: string[],
	cleanupShowNames: string[]
) {
	if (config.studio.GraphicsType === 'VIZ') {
		part.pieces.push({
			externalId: part.part.externalId,
			name: 'GFX Show Init',
			enable: { start: 0 },
			outputLayerId: SharedOutputLayers.SEC,
			sourceLayerId: SourceLayer.GraphicsShowLifecycle,
			lifespan: PieceLifespan.OutOnSegmentChange,
			content: {
				timelineObjects: [
					literal<TSR.TimelineObjVIZMSEInitializeShows>({
						id: '',
						enable: {
							while: '1'
						},
						layer: GraphicLLayer.GraphicLLayerInitialize,
						content: {
							deviceType: TSR.DeviceType.VIZMSE,
							type: TSR.TimelineContentTypeVizMSE.INITIALIZE_SHOWS,
							showNames: initializeShowNames
						}
					}),
					literal<TSR.TimelineObjVIZMSECleanupShows>({
						id: '',
						enable: {
							while: '1'
						},
						layer: GraphicLLayer.GraphicLLayerCleanup,
						content: {
							deviceType: TSR.DeviceType.VIZMSE,
							type: TSR.TimelineContentTypeVizMSE.CLEANUP_SHOWS,
							showNames: cleanupShowNames
						}
					})
				]
			}
		})
	}
}
