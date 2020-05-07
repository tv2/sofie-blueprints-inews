import { DeviceType, TimelineContentTypeAtem, TimelineObjAtemAUX, TSRTimelineObj } from 'timeline-state-resolver-types'
import {
	CameraContent,
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	PartContext,
	PieceLifespan,
	SourceLayerType
} from 'tv-automation-sofie-blueprints-integration'
import {
	CalculateTime,
	CueDefinitionTargetEngine,
	FindSourceInfoStrict,
	literal,
	PartDefinition,
	TranslateEngine
} from 'tv2-common'
import { CueType } from 'tv2-constants'
import _ = require('underscore')
import { BlueprintConfig } from '../../../tv2_afvd_showstyle/helpers/config'
import { SourceLayer } from '../../../tv2_afvd_showstyle/layers'
import { AtemLLayer } from '../../../tv2_afvd_studio/layers'
import { EvaluateGrafikViz } from './grafikViz'
import { EvaluateMOSViz } from './mos'

export function EvaluateTargetEngine(
	context: PartContext,
	config: BlueprintConfig,
	pieces: IBlueprintPiece[],
	adlibPieces: IBlueprintAdLibPiece[],
	partId: string,
	_partDefinition: PartDefinition,
	parsedCue: CueDefinitionTargetEngine,
	adlib: boolean
) {
	// TODO: Future: Target a specific engine
	if (!parsedCue.data.engine.match(/full|ovl|wall/i)) {
		context.warning(`Could not find engine to target for: ${parsedCue.data.engine}`)
		return
	}
	if (!parsedCue.content.INP1 && !parsedCue.content.INP) {
		// context.warning(`No input provided by ${parsedCue.rawType} for engine aux`)
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
								layer: AtemLLayer.AtemAuxVizOvlIn1,
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

	if (parsedCue.data.grafik) {
		if (parsedCue.data.grafik.type === CueType.Grafik) {
			EvaluateGrafikViz(
				config,
				context,
				pieces,
				adlibPieces,
				partId,
				parsedCue.data.grafik,
				TranslateEngine(parsedCue.data.engine),
				adlib
			)
		} else {
			EvaluateMOSViz(
				config,
				context,
				pieces,
				adlibPieces,
				partId,
				parsedCue.data.grafik,
				TranslateEngine(parsedCue.data.engine),
				adlib,
				false,
				adlibPieces.length,
				true,
				!!parsedCue.data.engine.match(/ovl/i)
			)
		}
	}
}
