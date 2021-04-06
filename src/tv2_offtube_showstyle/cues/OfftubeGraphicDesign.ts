import {
	GraphicsContent,
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	PieceLifespan,
	SegmentContext,
	TSR
} from '@sofie-automation/blueprints-integration'
import { CalculateTime, CueDefinitionGraphicDesign, literal } from 'tv2-common'
import { GraphicLLayer, SharedOutputLayers } from 'tv2-constants'
import { OfftubeShowstyleBlueprintConfig } from '../helpers/config'
import { OfftubeSourceLayer } from '../layers'

export function OfftubeEvaluateGraphicDesign(
	_config: OfftubeShowstyleBlueprintConfig,
	context: SegmentContext,
	pieces: IBlueprintPiece[],
	adlibPieces: IBlueprintAdLibPiece[],
	_actions: IBlueprintActionManifest[],
	partId: string,
	parsedCue: CueDefinitionGraphicDesign,
	adlib?: boolean,
	rank?: number
) {
	const start = (parsedCue.start ? CalculateTime(parsedCue.start) : 0) ?? 0
	if (!parsedCue.design || !parsedCue.design.length) {
		context.warning(`No valid design found for ${parsedCue.design}`)
		return
	}

	if (adlib) {
		adlibPieces.push(
			literal<IBlueprintAdLibPiece>({
				_rank: rank || 0,
				externalId: partId,
				name: parsedCue.design,
				outputLayerId: SharedOutputLayers.SEC,
				sourceLayerId: OfftubeSourceLayer.PgmDesign,
				lifespan: PieceLifespan.OutOnRundownEnd,
				content: literal<GraphicsContent>({
					fileName: parsedCue.design,
					path: parsedCue.design,
					ignoreMediaObjectStatus: true,
					timelineObjects: designTimeline(parsedCue)
				})
			})
		)
	} else {
		pieces.push(
			literal<IBlueprintPiece>({
				externalId: partId,
				name: parsedCue.design,
				enable: {
					start
				},
				outputLayerId: SharedOutputLayers.SEC,
				sourceLayerId: OfftubeSourceLayer.PgmDesign,
				lifespan: PieceLifespan.OutOnRundownEnd,
				content: literal<GraphicsContent>({
					fileName: parsedCue.design,
					path: parsedCue.design,
					ignoreMediaObjectStatus: true,
					timelineObjects: designTimeline(parsedCue)
				})
			})
		)
	}
}

function designTimeline(parsedCue: CueDefinitionGraphicDesign): TSR.TSRTimelineObj[] {
	return [
		literal<TSR.TimelineObjCCGTemplate>({
			id: '',
			enable: {
				start: 0
			},
			priority: 1,
			layer: GraphicLLayer.GraphicLLayerDesign,
			content: {
				deviceType: TSR.DeviceType.CASPARCG,
				type: TSR.TimelineContentTypeCasparCg.TEMPLATE,
				templateType: 'html',
				name: 'sport-overlay/index',
				data: {
					display: 'program',
					design: parsedCue.design,
					partialUpdate: true
				},
				useStopCommand: false
			}
		})
	]
}
