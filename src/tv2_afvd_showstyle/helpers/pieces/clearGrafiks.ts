import {
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	PieceLifespan,
	TSR
} from '@sofie-automation/blueprints-integration'
import { CreateTimingEnable, CueDefinitionClearGrafiks, GetDefaultOut, literal } from 'tv2-common'
import { GraphicLLayer, SharedOutputLayers } from 'tv2-constants'
import { SourceLayer } from '../../../tv2_afvd_showstyle/layers'
import { BlueprintConfig } from '../../../tv2_afvd_studio/helpers/config'

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
		SourceLayer.PgmGraphicsIdentPersistent,
		SourceLayer.PgmGraphicsTop,
		SourceLayer.PgmGraphicsLower,
		SourceLayer.PgmGraphicsHeadline,
		SourceLayer.PgmGraphicsTema,
		SourceLayer.PgmGraphicsOverlay,
		SourceLayer.PgmGraphicsTLF
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
			virtual: true
		})
	})

	pieces.push(
		literal<IBlueprintPiece>({
			externalId: partId,
			name: 'CLEAR',
			...CreateTimingEnable(parsedCue, GetDefaultOut(config)),
			outputLayerId: SharedOutputLayers.SEC,
			sourceLayerId: SourceLayer.PgmAdlibVizCmd,
			lifespan: PieceLifespan.WithinPart,
			content: {
				timelineObjects: [
					literal<TSR.TimelineObjVIZMSEClearAllElements>({
						id: '',
						enable: {
							start: 0,
							duration: 1000
						},
						priority: 100,
						layer: GraphicLLayer.GraphicLLayerAdLibs,
						content: {
							deviceType: TSR.DeviceType.VIZMSE,
							type: TSR.TimelineContentTypeVizMSE.CLEAR_ALL_ELEMENTS
						}
					})
				]
			}
		})
	)
}
