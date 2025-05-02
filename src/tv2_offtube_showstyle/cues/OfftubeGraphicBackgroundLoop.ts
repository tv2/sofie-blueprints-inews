import { GraphicsContent, PieceLifespan, WithTimeline } from 'blueprints-integration'
import {
	calculateTime,
	CueDefinitionBackgroundLoop,
	DveLoopGenerator,
	EvaluateCueResult,
	literal,
	SegmentContext
} from 'tv2-common'
import { SharedOutputLayer } from 'tv2-constants'
import { PlayoutContentType } from '../../tv2-constants/tv2-playout-content'
import { OfftubeBlueprintConfig } from '../helpers/config'
import { OfftubeSourceLayer } from '../layers'

export function OfftubeEvaluateCueBackgroundLoop(
	_context: SegmentContext<OfftubeBlueprintConfig>,
	partId: string,
	parsedCue: CueDefinitionBackgroundLoop,
	adlib?: boolean,
	rank?: number
): EvaluateCueResult {
	const result = new EvaluateCueResult()
	const dveLoopGenerator = new DveLoopGenerator()
	const fileName = parsedCue.backgroundLoop
	const path = `dve/${fileName}`
	const start = (parsedCue.start ? calculateTime(parsedCue.start) : 0) ?? 0
	if (adlib) {
		result.adlibPieces.push({
			_rank: rank ?? 0,
			externalId: partId,
			name: fileName,
			outputLayerId: SharedOutputLayer.SEC,
			sourceLayerId: OfftubeSourceLayer.PgmDVEBackground,
			lifespan: PieceLifespan.OutOnRundownChange,
			content: literal<WithTimeline<GraphicsContent>>({
				fileName,
				path,
				ignoreMediaObjectStatus: true,
				timelineObjects: dveLoopGenerator.createDveLoopTimelineObject(fileName)
			}),
			metaData: {
				playoutContent: {
					type: PlayoutContentType.UNKNOWN
				}
			}
		})
	} else {
		result.pieces.push({
			externalId: partId,
			name: fileName,
			enable: {
				start
			},
			outputLayerId: SharedOutputLayer.SEC,
			sourceLayerId: OfftubeSourceLayer.PgmDVEBackground,
			lifespan: PieceLifespan.OutOnRundownChange,
			content: literal<WithTimeline<GraphicsContent>>({
				fileName,
				path,
				ignoreMediaObjectStatus: true,
				timelineObjects: dveLoopGenerator.createDveLoopTimelineObject(fileName)
			}),
			metaData: {
				playoutContent: {
					type: PlayoutContentType.UNKNOWN
				}
			}
		})
	}
	return result
}
