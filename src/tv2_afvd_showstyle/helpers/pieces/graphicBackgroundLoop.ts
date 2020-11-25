import {
	GraphicsContent,
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	PieceLifespan,
	TSR
} from 'tv-automation-sofie-blueprints-integration'
import { CalculateTime, CueDefinitionBackgroundLoop, literal } from 'tv2-common'
import _ = require('underscore')
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
	const fileName = parsedCue.backgroundLoop
	const path = `dve/${fileName}`
	const start = (parsedCue.start ? CalculateTime(parsedCue.start) : 0) ?? 0
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
					timelineObjects: _.compact<TSR.TSRTimelineObj>([
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
					])
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
					timelineObjects: _.compact<TSR.TSRTimelineObj>([
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
					])
				})
			})
		)
	}
}
