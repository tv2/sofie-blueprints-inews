import { DeviceType, TimelineContentTypeVizMSE, TimelineObjVIZMSEClearAllElements } from 'timeline-state-resolver-types'
import { IBlueprintPiece, PieceLifespan } from 'tv-automation-sofie-blueprints-integration'
import { CreateTimingEnable, CueDefinitionClearGrafiks, GraphicLLayer, literal } from 'tv2-common'
import { SourceLayer } from '../../../tv2_afvd_showstyle/layers'

export function EvaluateClearGrafiks(
	pieces: IBlueprintPiece[],
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
			_id: '',
			externalId: partId,
			name: `CLEAR ${sourceLayerId}`,
			enable: {
				start: CreateTimingEnable(parsedCue).enable.start,
				duration: 1000
			},
			outputLayerId: 'sec',
			sourceLayerId,
			infiniteMode: PieceLifespan.Normal,
			virtual: true
		})
	})

	pieces.push(
		literal<IBlueprintPiece>({
			_id: '',
			externalId: partId,
			name: 'CLEAR',
			...CreateTimingEnable(parsedCue),
			outputLayerId: 'sec',
			sourceLayerId: SourceLayer.PgmAdlibVizCmd,
			infiniteMode: PieceLifespan.Normal,
			content: {
				timelineObjects: [
					literal<TimelineObjVIZMSEClearAllElements>({
						id: '',
						enable: {
							start: 0,
							duration: 1000
						},
						priority: 100,
						layer: GraphicLLayer.GraphicLLayerAdLibs,
						content: {
							deviceType: DeviceType.VIZMSE,
							type: TimelineContentTypeVizMSE.CLEAR_ALL_ELEMENTS
						}
					})
				]
			}
		})
	)
}
