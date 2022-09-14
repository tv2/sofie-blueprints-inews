import {
	BaseContent,
	IBlueprintPiece,
	IShowStyleUserContext,
	PieceLifespan,
	TimelineObjectCoreExt,
	TSR,
	WithTimeline
} from '@tv2media/blueprints-integration'
import { CueDefinitionPgmClean, findSourceInfo, literal, SourceInfo } from 'tv2-common'
import { SharedOutputLayers, SourceType } from 'tv2-constants'
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
	if (parsedCue.sourceDefinition.sourceType === SourceType.PGM) {
		return
	}

	sourceInfo = findSourceInfo(config.sources, parsedCue.sourceDefinition)

	const name = parsedCue.sourceDefinition.name || parsedCue.sourceDefinition.sourceType

	if (!sourceInfo) {
		context.notifyUserWarning(`Invalid source for clean output: ${name}`)
		return
	}

	pieces.push({
		externalId: partId,
		name,
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
}
