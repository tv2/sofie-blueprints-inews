import { GraphicsContent, IBlueprintPiece, PieceLifespan, TSR, WithTimeline } from 'blueprints-integration'
import {
	calculateTime,
	CueDefinitionBackgroundLoop,
	DveLoopGenerator,
	EvaluateCueResult,
	FULL_SHOW_PLACEHOLDER,
	literal,
	PieceMetaData,
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
		if (adlib) {
			result.adlibPieces.push({
				...getDveLoopPieceProperties(partId, parsedCue),
				_rank: rank ?? 0
			})
		} else {
			result.pieces.push({
				...getDveLoopPieceProperties(partId, parsedCue),
				enable: {
					start
				}
			})
		}
	} else {
		// Full
		if (adlib) {
			result.adlibPieces.push({
				...getFullLoopPieceProperties(partId, context.config, parsedCue),
				_rank: rank ?? 0
			})
		} else {
			result.pieces.push({
				...getFullLoopPieceProperties(partId, context.config, parsedCue),
				enable: {
					start
				}
			})
		}
	}
	return result
}

function getDveLoopPieceProperties(
	partId: string,
	parsedCue: CueDefinitionBackgroundLoop
): Omit<IBlueprintPiece<PieceMetaData>, 'enable'> {
	const dveLoopGenerator = new DveLoopGenerator() // todo: where to instantiate it?
	const fileName = parsedCue.backgroundLoop
	const path = `dve/${fileName}`
	return {
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
	}
}

function getFullLoopPieceProperties(
	partId: string,
	config: TV2ShowStyleConfig,
	parsedCue: CueDefinitionBackgroundLoop
): Omit<IBlueprintPiece<PieceMetaData>, 'enable'> {
	return {
		externalId: partId,
		name: parsedCue.backgroundLoop,
		outputLayerId: SharedOutputLayer.SEC,
		sourceLayerId: SourceLayer.PgmFullBackground,
		lifespan: PieceLifespan.OutOnRundownChange,
		expectedPlayoutItems: [
			{
				deviceSubType: TSR.DeviceType.VIZMSE,
				content: {
					templateName: parsedCue.backgroundLoop,
					templateData: [],
					showLayer: SharedGraphicLLayer.GraphicLLayerInitFull
				}
			}
		],
		content: literal<WithTimeline<GraphicsContent>>({
			fileName: parsedCue.backgroundLoop,
			path: parsedCue.backgroundLoop,
			ignoreMediaObjectStatus: true,
			timelineObjects: [
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
						showName: FULL_SHOW_PLACEHOLDER
					},
					keyframes: config.vizShowKeyframes.full
				})
			]
		})
	}
}
