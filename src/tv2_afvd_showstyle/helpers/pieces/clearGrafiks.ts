import {
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	PieceLifespan,
	TSR
} from 'blueprints-integration'
import { CueDefinitionClearGrafiks, getDefaultOut, getTimingEnable, literal, ShowStyleContext } from 'tv2-common'
import { SharedGraphicLLayer, SharedOutputLayer } from 'tv2-constants'
import { GalleryBlueprintConfig } from '../../../tv2_afvd_showstyle/helpers/config'
import { SourceLayer } from '../../../tv2_afvd_showstyle/layers'

export function EvaluateClearGrafiks(
	context: ShowStyleContext<GalleryBlueprintConfig>,
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
	].forEach((sourceLayerId) => {
		pieces.push({
			externalId: partId,
			name: `CLEAR ${sourceLayerId}`,
			enable: {
				start: getTimingEnable(parsedCue, getDefaultOut(context.config)).enable.start,
				duration: 1000
			},
			outputLayerId: SharedOutputLayer.SEC,
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
		...getTimingEnable(parsedCue, getDefaultOut(context.config)),
		outputLayerId: SharedOutputLayer.SEC,
		sourceLayerId: SourceLayer.PgmAdlibGraphicCmd,
		lifespan: PieceLifespan.WithinPart,
		content: {
			timelineObjects: context.config.studio.HTMLGraphics
				? [
						literal<TSR.TimelineObjVIZMSEClearAllElements>({
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
								showName: context.config.selectedGfxSetup.OvlShowName
							}
						})
				  ]
				: []
		}
	})
}
