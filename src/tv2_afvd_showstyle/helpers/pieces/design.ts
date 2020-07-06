import {
	GraphicsContent,
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	PieceLifespan,
	TSR
} from 'tv-automation-sofie-blueprints-integration'
import { CalculateTime, CueDefinitionDesign, GraphicLLayer, literal, PartContext2 } from 'tv2-common'
import * as _ from 'underscore'
import { SourceLayer } from '../../../tv2_afvd_showstyle/layers'
import { BlueprintConfig } from '../../../tv2_afvd_studio/helpers/config'

export function EvaluateDesign(
	_config: BlueprintConfig,
	context: PartContext2,
	pieces: IBlueprintPiece[],
	adlibPieces: IBlueprintAdLibPiece[],
	_actions: IBlueprintActionManifest[],
	partId: string,
	parsedCue: CueDefinitionDesign,
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
				outputLayerId: 'sec',
				sourceLayerId: SourceLayer.PgmDesign,
				infiniteMode: PieceLifespan.Infinite,
				content: literal<GraphicsContent>({
					fileName: parsedCue.design,
					path: parsedCue.design,
					timelineObjects: _.compact<TSR.TSRTimelineObj>([
						literal<TSR.TimelineObjVIZMSEElementInternal>({
							id: '',
							enable: { start: 0 },
							priority: 100,
							layer: GraphicLLayer.GraphicLLayerDesign,
							content: {
								deviceType: TSR.DeviceType.VIZMSE,
								type: TSR.TimelineContentTypeVizMSE.ELEMENT_INTERNAL,
								templateName: parsedCue.design,
								templateData: []
							}
						})
					])
				})
			})
		)
	} else {
		pieces.push(
			literal<IBlueprintPiece>({
				_id: '',
				externalId: partId,
				name: parsedCue.design,
				enable: {
					start
				},
				outputLayerId: 'sec',
				sourceLayerId: SourceLayer.PgmDesign,
				infiniteMode: PieceLifespan.Infinite,
				content: literal<GraphicsContent>({
					fileName: parsedCue.design,
					path: parsedCue.design,
					timelineObjects: _.compact<TSR.TSRTimelineObj>([
						literal<TSR.TimelineObjVIZMSEElementInternal>({
							id: '',
							enable: { start: 0 },
							priority: 100,
							layer: GraphicLLayer.GraphicLLayerDesign,
							content: {
								deviceType: TSR.DeviceType.VIZMSE,
								type: TSR.TimelineContentTypeVizMSE.ELEMENT_INTERNAL,
								templateName: parsedCue.design,
								templateData: []
							}
						})
					])
				})
			})
		)
	}
}
