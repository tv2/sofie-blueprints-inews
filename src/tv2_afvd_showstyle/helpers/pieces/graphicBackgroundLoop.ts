import {
	GraphicsContent,
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	PieceLifespan,
	TSR
} from '@sofie-automation/blueprints-integration'
import { CalculateTime, CueDefinitionBackgroundLoop, literal } from 'tv2-common'
import { GraphicLLayer } from 'tv2-constants'
import { CasparLLayer } from '../../../tv2_afvd_studio/layers'
import { SourceLayer } from '../../layers'

export function EvaluateCueBackgroundLoop(
	pieces: IBlueprintPiece[],
	adlibPieces: IBlueprintAdLibPiece[],
	_actions: IBlueprintActionManifest[],
	partId: string,
	parsedCue: CueDefinitionBackgroundLoop,
	adlib?: boolean,
	rank?: number
) {
	const start = (parsedCue.start ? CalculateTime(parsedCue.start) : 0) ?? 0

	if (parsedCue.target === 'DVE') {
		const fileName = parsedCue.backgroundLoop
		const path = `dve/${fileName}`
		if (adlib) {
			adlibPieces.push(
				literal<IBlueprintAdLibPiece>({
					_rank: rank || 0,
					externalId: partId,
					name: fileName,
					outputLayerId: 'sec',
					sourceLayerId: SourceLayer.PgmDVEBackground,
					lifespan: PieceLifespan.OutOnRundownEnd,
					content: literal<GraphicsContent>({
						fileName,
						path,
						ignoreMediaObjectStatus: true,
						timelineObjects: dveLoopTimeline(path)
					})
				})
			)
		} else {
			pieces.push(
				literal<IBlueprintPiece>({
					externalId: partId,
					name: fileName,
					enable: {
						start
					},
					outputLayerId: 'sec',
					sourceLayerId: SourceLayer.PgmDVEBackground,
					lifespan: PieceLifespan.OutOnRundownEnd,
					content: literal<GraphicsContent>({
						fileName,
						path,
						ignoreMediaObjectStatus: true,
						timelineObjects: dveLoopTimeline(path)
					})
				})
			)
		}
	} else {
		// Full
		if (adlib) {
			adlibPieces.push(
				literal<IBlueprintAdLibPiece>({
					_rank: rank || 0,
					externalId: partId,
					name: parsedCue.backgroundLoop,
					outputLayerId: 'sec',
					sourceLayerId: SourceLayer.PgmFullBackground,
					lifespan: PieceLifespan.OutOnRundownEnd,
					content: literal<GraphicsContent>({
						fileName: parsedCue.backgroundLoop,
						path: parsedCue.backgroundLoop,
						ignoreMediaObjectStatus: true,
						timelineObjects: fullLoopTimeline(parsedCue)
					})
				})
			)
		} else {
			pieces.push(
				literal<IBlueprintPiece>({
					externalId: partId,
					name: parsedCue.backgroundLoop,
					enable: {
						start
					},
					outputLayerId: 'sec',
					sourceLayerId: SourceLayer.PgmFullBackground,
					lifespan: PieceLifespan.OutOnRundownEnd,
					content: literal<GraphicsContent>({
						fileName: parsedCue.backgroundLoop,
						path: parsedCue.backgroundLoop,
						ignoreMediaObjectStatus: true,
						timelineObjects: fullLoopTimeline(parsedCue)
					})
				})
			)
		}
	}
}

function dveLoopTimeline(path: string): TSR.TSRTimelineObj[] {
	return [
		literal<TSR.TimelineObjCCGMedia>({
			id: '',
			enable: { start: 0 },
			priority: 100,
			layer: CasparLLayer.CasparCGDVELoop,
			content: {
				deviceType: TSR.DeviceType.CASPARCG,
				type: TSR.TimelineContentTypeCasparCg.MEDIA,
				file: path,
				loop: true
			}
		})
	]
}

function fullLoopTimeline(parsedCue: CueDefinitionBackgroundLoop): TSR.TSRTimelineObj[] {
	return [
		literal<TSR.TimelineObjVIZMSEElementInternal>({
			id: '',
			enable: { start: 0 },
			priority: 1,
			layer: GraphicLLayer.GraphicLLayerFullLoop,
			content: {
				deviceType: TSR.DeviceType.VIZMSE,
				type: TSR.TimelineContentTypeVizMSE.ELEMENT_INTERNAL,
				templateName: parsedCue.backgroundLoop,
				templateData: []
			}
		})
	]
}
