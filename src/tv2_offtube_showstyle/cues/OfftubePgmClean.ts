import {
	BaseContent,
	IBlueprintPiece,
	IShowStyleUserContext,
	PieceLifespan,
	TimelineObjectCoreExt,
	TSR,
	WithTimeline
} from '@tv2media/blueprints-integration'
import { CueDefinitionPgmClean, FindSourceInfoByName, literal, SourceInfo } from 'tv2-common'
import { SharedOutputLayers } from 'tv2-constants'
import { OfftubeAtemLLayer } from '../../tv2_offtube_studio/layers'
import { OfftubeShowstyleBlueprintConfig } from '../helpers/config'
import { OfftubeSourceLayer } from '../layers'

export function OfftubeEvaluatePgmClean(
	context: IShowStyleUserContext,
	config: OfftubeShowstyleBlueprintConfig,
	pieces: IBlueprintPiece[],
	partId: string,
	parsedCue: CueDefinitionPgmClean
) {
	let sourceInfo: SourceInfo | undefined
	if (parsedCue.source.match(/PGM/i)) {
		return
	}

	sourceInfo = FindSourceInfoByName(config.sources, parsedCue.source)

	if (!sourceInfo) {
		context.notifyUserWarning(`Invalid source for clean output: ${parsedCue.source}`)
		return
	}

	pieces.push(
		literal<IBlueprintPiece>({
			externalId: partId,
			name: parsedCue.source,
			enable: {
				start: 0
			},
			outputLayerId: SharedOutputLayers.AUX,
			sourceLayerId: OfftubeSourceLayer.AuxPgmClean,
			lifespan: PieceLifespan.OutOnShowStyleEnd,
			content: literal<WithTimeline<BaseContent>>({
				timelineObjects: literal<TimelineObjectCoreExt[]>([
					literal<TSR.TimelineObjAtemAUX>({
						id: '',
						enable: { while: '1' },
						priority: 0,
						layer: OfftubeAtemLLayer.AtemAuxClean,
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
