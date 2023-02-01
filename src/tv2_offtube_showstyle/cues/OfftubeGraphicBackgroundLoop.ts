import {
	GraphicsContent,
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	PieceLifespan,
	TSR,
	WithTimeline
} from 'blueprints-integration'
import { CalculateTime, CueDefinitionBackgroundLoop, ExtendedSegmentContext, literal } from 'tv2-common'
import { SharedOutputLayers } from 'tv2-constants'
import _ = require('underscore')
import { OfftubeCasparLLayer } from '../../tv2_offtube_studio/layers'
import { OfftubeBlueprintConfig } from '../helpers/config'
import { OfftubeSourceLayer } from '../layers'

export function OfftubeEvaluateCueBackgroundLoop(
	_context: ExtendedSegmentContext<OfftubeBlueprintConfig>,
	pieces: IBlueprintPiece[],
	adlibPieces: IBlueprintAdLibPiece[],
	_actions: IBlueprintActionManifest[],
	partId: string,
	parsedCue: CueDefinitionBackgroundLoop,
	adlib?: boolean,
	rank?: number
) {
	const fileName = parsedCue.backgroundLoop
	const path = `dve/${fileName}`
	const start = (parsedCue.start ? CalculateTime(parsedCue.start) : 0) ?? 0
	if (adlib) {
		adlibPieces.push({
			_rank: rank || 0,
			externalId: partId,
			name: fileName,
			outputLayerId: SharedOutputLayers.SEC,
			sourceLayerId: OfftubeSourceLayer.PgmDVEBackground,
			lifespan: PieceLifespan.OutOnShowStyleEnd,
			content: literal<WithTimeline<GraphicsContent>>({
				fileName,
				path,
				ignoreMediaObjectStatus: true,
				timelineObjects: _.compact<TSR.TSRTimelineObj[]>([
					literal<TSR.TimelineObjCCGMedia>({
						id: '',
						enable: { start: 0 },
						priority: 100,
						layer: OfftubeCasparLLayer.CasparCGDVELoop,
						content: {
							deviceType: TSR.DeviceType.CASPARCG,
							type: TSR.TimelineContentTypeCasparCg.MEDIA,
							file: path,
							loop: true
						}
					})
				])
			})
		})
	} else {
		pieces.push({
			externalId: partId,
			name: fileName,
			enable: {
				start
			},
			outputLayerId: SharedOutputLayers.SEC,
			sourceLayerId: OfftubeSourceLayer.PgmDVEBackground,
			lifespan: PieceLifespan.OutOnShowStyleEnd,
			content: literal<WithTimeline<GraphicsContent>>({
				fileName,
				path,
				ignoreMediaObjectStatus: true,
				timelineObjects: _.compact<TSR.TSRTimelineObj[]>([
					literal<TSR.TimelineObjCCGMedia>({
						id: '',
						enable: { start: 0 },
						priority: 100,
						layer: OfftubeCasparLLayer.CasparCGDVELoop,
						content: {
							deviceType: TSR.DeviceType.CASPARCG,
							type: TSR.TimelineContentTypeCasparCg.MEDIA,
							file: path,
							loop: true
						}
					})
				])
			})
		})
	}
}
