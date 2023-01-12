import {
	CameraContent,
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	ISegmentUserContext,
	PieceLifespan,
	TSR,
	WithTimeline
} from 'blueprints-integration'
import { CalculateTime, CueDefinitionRouting, findSourceInfo, literal, TV2BlueprintConfig } from 'tv2-common'
import { SharedOutputLayers } from 'tv2-constants'
import _ = require('underscore')
import { AtemLLayer } from '../../../tv2_afvd_studio/layers'
import { SourceLayer } from '../../layers'

export function EvaluateCueRouting(
	config: TV2BlueprintConfig,
	context: ISegmentUserContext,
	pieces: IBlueprintPiece[],
	_adlibPieces: IBlueprintAdLibPiece[],
	_actions: IBlueprintActionManifest[],
	partId: string,
	parsedCue: CueDefinitionRouting
) {
	const time = (parsedCue.start ? CalculateTime(parsedCue.start) : 0) ?? 0
	const sourceDefinition = parsedCue.INP1 ?? parsedCue.INP
	if (!sourceDefinition) {
		context.notifyUserWarning(`No input provided for viz engine aux`)
		return
	}

	const sourceInfo = findSourceInfo(config.sources, sourceDefinition)
	const name = sourceDefinition.name || sourceDefinition.sourceType
	if (!sourceInfo) {
		context.notifyUserWarning(`Could not find source ${name}`)
		return
	}

	pieces.push({
		externalId: partId,
		enable: {
			start: time
		},
		name,
		outputLayerId: SharedOutputLayers.AUX,
		sourceLayerId: SourceLayer.VizFullIn1,
		lifespan: PieceLifespan.WithinPart,
		content: literal<WithTimeline<CameraContent>>({
			studioLabel: '',
			switcherInput: sourceInfo.port,
			timelineObjects: _.compact<Array<TSR.TSRTimelineObj<TSR.TSRTimelineContent>>>([
				literal<TSR.TSRTimelineObj<TSR.TimelineContentAtemAUX>>({
					id: '',
					enable: { start: 0 },
					priority: 100,
					layer: AtemLLayer.AtemAuxVizOvlIn1,
					content: {
						deviceType: TSR.DeviceType.ATEM,
						type: TSR.TimelineContentTypeAtem.AUX,
						aux: {
							input: sourceInfo.port
						}
					}
				})
			])
		})
	})
}
