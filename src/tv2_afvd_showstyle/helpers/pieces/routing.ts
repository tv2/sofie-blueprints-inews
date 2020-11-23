import { SourceLayer } from '../../layers'
import {
	CameraContent,
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	PieceLifespan,
	SourceLayerType,
	TSR
} from 'tv-automation-sofie-blueprints-integration'
import { CalculateTime, CueDefinitionRouting, FindSourceInfoStrict, literal, PartContext2 } from 'tv2-common'
import { BlueprintConfig } from '../config'
import _ = require('underscore')
import { AtemLLayer } from 'src/tv2_afvd_studio/layers'

export function EvaluateCueRouting(
	config: BlueprintConfig,
	context: PartContext2,
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
			context.warning(`No input provided for viz engine aux`)
		} else {
			let sourceInfo = FindSourceInfoStrict(context, config.sources, SourceLayerType.REMOTE, source)
			if (!sourceInfo) {
				sourceInfo = FindSourceInfoStrict(context, config.sources, SourceLayerType.CAMERA, source)
			}

			if (!sourceInfo) {
				context.warning(`Could not find source ${source}`)
			} else {
				pieces.push(
					literal<IBlueprintPiece>({
						externalId: partId,
						enable: {
							start: time
						},
						name: source,
						outputLayerId: 'aux',
						sourceLayerId: SourceLayer.VizFullIn1,
						lifespan: PieceLifespan.WithinPart,
						content: literal<CameraContent>({
							studioLabel: '',
							switcherInput: sourceInfo.port,
							timelineObjects: _.compact<TSR.TSRTimelineObj>([
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
