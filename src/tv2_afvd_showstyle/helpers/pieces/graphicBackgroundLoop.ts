import { GraphicsContent, PieceLifespan, TSR, WithTimeline } from 'blueprints-integration'
import {
	calculateTime,
	CueDefinitionBackgroundLoop,
	DveLoopGenerator,
	EvaluateCueResult,
	literal,
	ShowStyleContext,
	TV2ShowStyleConfig
} from 'tv2-common'
import { SharedGraphicLLayer, SharedOutputLayer } from 'tv2-constants'
import { SourceLayer } from '../../layers'

export function EvaluateCueBackgroundLoop(
	context: ShowStyleContext,
	partId: string,
	parsedCue: CueDefinitionBackgroundLoop,
	adlib?: boolean,
	rank?: number
): EvaluateCueResult {
	const result = new EvaluateCueResult()
	const start = (parsedCue.start ? calculateTime(parsedCue.start) : 0) ?? 0

	if (parsedCue.target === 'DVE') {
		const dveLoopGenerator = new DveLoopGenerator() // todo: where to instantiate it?
		const fileName = parsedCue.backgroundLoop
		const path = `dve/${fileName}`
		if (adlib) {
			result.adlibPieces.push({
				_rank: rank ?? 0,
				externalId: partId,
				name: fileName,
				outputLayerId: SharedOutputLayer.SEC,
				sourceLayerId: SourceLayer.PgmDVEBackground,
				lifespan: PieceLifespan.OutOnRundownChange,
				content: literal<WithTimeline<GraphicsContent>>({
					fileName,
					path,
					ignoreMediaObjectStatus: true,
					timelineObjects: dveLoopGenerator.createDveLoopTimelineObject(fileName)
				})
			})
		} else {
			result.pieces.push({
				externalId: partId,
				name: fileName,
				enable: {
					start
				},
				outputLayerId: SharedOutputLayer.SEC,
				sourceLayerId: SourceLayer.PgmDVEBackground,
				lifespan: PieceLifespan.OutOnRundownChange,
				content: literal<WithTimeline<GraphicsContent>>({
					fileName,
					path,
					ignoreMediaObjectStatus: true,
					timelineObjects: dveLoopGenerator.createDveLoopTimelineObject(fileName)
				})
			})
		}
	} else {
		// Full
		if (adlib) {
			result.adlibPieces.push({
				_rank: rank ?? 0,
				externalId: partId,
				name: parsedCue.backgroundLoop,
				outputLayerId: SharedOutputLayer.SEC,
				sourceLayerId: SourceLayer.PgmFullBackground,
				lifespan: PieceLifespan.OutOnRundownChange,
				content: literal<WithTimeline<GraphicsContent>>({
					fileName: parsedCue.backgroundLoop,
					path: parsedCue.backgroundLoop,
					ignoreMediaObjectStatus: true,
					timelineObjects: fullLoopTimeline(context.config, parsedCue)
				})
			})
		} else {
			result.pieces.push({
				externalId: partId,
				name: parsedCue.backgroundLoop,
				enable: {
					start
				},
				outputLayerId: SharedOutputLayer.SEC,
				sourceLayerId: SourceLayer.PgmFullBackground,
				lifespan: PieceLifespan.OutOnRundownChange,
				content: literal<WithTimeline<GraphicsContent>>({
					fileName: parsedCue.backgroundLoop,
					path: parsedCue.backgroundLoop,
					ignoreMediaObjectStatus: true,
					timelineObjects: fullLoopTimeline(context.config, parsedCue)
				})
			})
		}
	}
	return result
}

function fullLoopTimeline(config: TV2ShowStyleConfig, parsedCue: CueDefinitionBackgroundLoop): TSR.TSRTimelineObj[] {
	if (!config.selectedGfxSetup.FullShowName) {
		return []
	}
	return [
		literal<TSR.TimelineObjVIZMSEElementInternal>({
			id: '',
			enable: { start: 0 },
			priority: 1,
			layer: SharedGraphicLLayer.GraphicLLayerFullLoop,
			content: {
				deviceType: TSR.DeviceType.VIZMSE,
				type: TSR.TimelineContentTypeVizMSE.ELEMENT_INTERNAL,
				templateName: parsedCue.backgroundLoop,
				templateData: [],
				showName: config.selectedGfxSetup.FullShowName
			}
		})
	]
}
