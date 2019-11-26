import { DeviceType, TimelineContentTypeAtem, TimelineObjAtemAUX, TSRTimelineObj } from 'timeline-state-resolver-types'
import {
	CameraContent,
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	PartContext,
	PieceLifespan,
	SourceLayerType
} from 'tv-automation-sofie-blueprints-integration'
import _ = require('underscore')
import { literal } from '../../../common/util'
import { BlueprintConfig } from '../../../tv2_afvd_showstyle/helpers/config'
import { CueDefinitionTargetEngine } from '../../../tv2_afvd_showstyle/inewsConversion/converters/ParseCue'
import { SourceLayer } from '../../../tv2_afvd_showstyle/layers'
import { FindSourceInfoStrict } from '../../../tv2_afvd_studio/helpers/sources'
import { AtemLLayer } from '../../../tv2_afvd_studio/layers'
import { CalculateTime } from './evaluateCues'
import { EvaluateMOS } from './mos'

export function EvaluateTargetEngine(
	context: PartContext,
	config: BlueprintConfig,
	pieces: IBlueprintPiece[],
	adlibPeces: IBlueprintAdLibPiece[],
	partId: string,
	parsedCue: CueDefinitionTargetEngine
) {
	// TODO: Future: Target a specific engine
	if (!parsedCue.engine.match(/full/i)) {
		return
	}
	if (!parsedCue.content.INP1 && !parsedCue.content.INP) {
		context.warning(`No input provided by ${parsedCue.rawType} for engine aux`)
	} else {
		const source = parsedCue.content.INP1 ? parsedCue.content.INP1 : parsedCue.content.INP
		let sourceInfo = FindSourceInfoStrict(context, config.sources, SourceLayerType.REMOTE, source)
		if (!sourceInfo) {
			sourceInfo = FindSourceInfoStrict(context, config.sources, SourceLayerType.CAMERA, source)
		}

		if (!sourceInfo) {
			context.warning(`Could not find source ${parsedCue.content.INP1}`)
		} else {
			pieces.push(
				literal<IBlueprintPiece>({
					_id: '',
					externalId: partId,
					enable: {
						start: parsedCue.start ? CalculateTime(parsedCue.start) : 0
					},
					name: parsedCue.content.INP1 || '',
					outputLayerId: 'aux',
					sourceLayerId: SourceLayer.VizFullIn1,
					infiniteMode: PieceLifespan.Infinite,
					content: literal<CameraContent>({
						studioLabel: '',
						switcherInput: sourceInfo.port,
						timelineObjects: _.compact<TSRTimelineObj>([
							literal<TimelineObjAtemAUX>({
								id: '',
								enable: { start: 0 },
								priority: 100,
								layer: AtemLLayer.AtemAuxVizFullIn1,
								content: {
									deviceType: DeviceType.ATEM,
									type: TimelineContentTypeAtem.AUX,
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

	if (parsedCue.grafik) {
		// TODO target engine
		EvaluateMOS(config, pieces, adlibPeces, partId, parsedCue.grafik, false, false, 0, true)
	}
}
