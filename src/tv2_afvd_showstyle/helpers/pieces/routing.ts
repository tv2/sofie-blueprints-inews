import {
	CameraContent,
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	ISegmentUserContext,
	PieceLifespan,
	SourceLayerType,
	TSR,
	WithTimeline
} from '@tv2media/blueprints-integration'
import { CalculateTime, CueDefinitionRouting, FindSourceInfoStrict, literal, TV2BlueprintConfig } from 'tv2-common'
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
	if (parsedCue.INP1 !== undefined || parsedCue.INP !== undefined) {
		const source = parsedCue.INP1 ?? parsedCue.INP
		if (!source || !source.length) {
			context.notifyUserWarning(`No input provided for viz engine aux`)
		} else {
			let sourceInfo = FindSourceInfoStrict(context, config.sources, SourceLayerType.REMOTE, source)
			if (!sourceInfo) {
				sourceInfo = FindSourceInfoStrict(context, config.sources, SourceLayerType.CAMERA, source)
			}

			if (!sourceInfo) {
				context.notifyUserWarning(`Could not find source ${source}`)
			} else {
				pieces.push(
					literal<IBlueprintPiece>({
						externalId: partId,
						enable: {
							start: time
						},
						name: source,
						outputLayerId: SharedOutputLayers.AUX,
						sourceLayerId: SourceLayer.VizFullIn1,
						lifespan: PieceLifespan.WithinPart,
						content: literal<WithTimeline<CameraContent>>({
							studioLabel: '',
							switcherInput: sourceInfo.port,
							timelineObjects: _.compact<TSR.TSRTimelineObj[]>([
								literal<TSR.TimelineObjAtemAUX>({
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
				)
			}
		}
	}
}
