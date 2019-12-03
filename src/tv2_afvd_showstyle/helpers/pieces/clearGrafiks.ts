import { DeviceType, TimelineContentTypeVizMSE, TimelineObjVIZMSEClearAllElements } from 'timeline-state-resolver-types'
import { IBlueprintPiece, PieceLifespan } from 'tv-automation-sofie-blueprints-integration'
import { literal } from '../../../common/util'
import { CueDefinitionClearGrafiks } from '../../../tv2_afvd_showstyle/inewsConversion/converters/ParseCue'
import { SourceLayer } from '../../../tv2_afvd_showstyle/layers'
import { VizLLayer } from './../../../tv2_afvd_studio/layers'
import { CreateTimingEnable } from './evaluateCues'

export function EvaluateClearGrafiks(pieces: IBlueprintPiece[], partId: string, parsedCue: CueDefinitionClearGrafiks) {
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
						layer: VizLLayer.VizLLayerAdLibs,
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
