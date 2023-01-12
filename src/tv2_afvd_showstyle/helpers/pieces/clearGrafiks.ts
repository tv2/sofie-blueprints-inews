import {
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	PieceLifespan,
	TSR
} from 'blueprints-integration'
import { CreateTimingEnable, CueDefinitionClearGrafiks, GetDefaultOut, literal } from 'tv2-common'
import { SharedGraphicLLayer, SharedOutputLayers } from 'tv2-constants'
import { BlueprintConfig } from '../../../tv2_afvd_showstyle/helpers/config'
import { SourceLayer } from '../../../tv2_afvd_showstyle/layers'

export function EvaluateClearGrafiks(
	config: BlueprintConfig,
	pieces: IBlueprintPiece[],
	_adLibPieces: IBlueprintAdLibPiece[],
	_actions: IBlueprintActionManifest[],
	partId: string,
	parsedCue: CueDefinitionClearGrafiks,
	shouldAdlib: boolean
) {
	if (shouldAdlib) {
		return
	}

	;[
		SourceLayer.PgmGraphicsIdent,
		SourceLayer.PgmGraphicsTop,
		SourceLayer.PgmGraphicsLower,
		SourceLayer.PgmGraphicsHeadline,
		SourceLayer.PgmGraphicsTema,
		SourceLayer.PgmGraphicsOverlay
	].forEach(sourceLayerId => {
		pieces.push({
			externalId: partId,
			name: `CLEAR ${sourceLayerId}`,
			enable: {
				start: CreateTimingEnable(parsedCue, GetDefaultOut(config)).enable.start,
				duration: 1000
			},
			outputLayerId: SharedOutputLayers.SEC,
			sourceLayerId,
			lifespan: PieceLifespan.WithinPart,
			virtual: true,
			content: {
				timelineObjects: []
			}
		})
	})

	pieces.push({
		externalId: partId,
		name: 'CLEAR',
		...CreateTimingEnable(parsedCue, GetDefaultOut(config)),
		outputLayerId: SharedOutputLayers.SEC,
		sourceLayerId: SourceLayer.PgmAdlibGraphicCmd,
		lifespan: PieceLifespan.WithinPart,
		content: {
			timelineObjects: config.studio.HTMLGraphics
				? [
						literal<TSR.TSRTimelineObj<TSR.TimelineContentVIZMSEClearAllElements>>({
							id: '',
							enable: {
								start: 0,
								duration: 1000
							},
							priority: 100,
							layer: SharedGraphicLLayer.GraphicLLayerAdLibs,
							content: {
								deviceType: TSR.DeviceType.VIZMSE,
								type: TSR.TimelineContentTypeVizMSE.CLEAR_ALL_ELEMENTS,
								showName: config.selectedGraphicsSetup.OvlShowName
							}
						})
				  ]
				: []
		}
	})
}
