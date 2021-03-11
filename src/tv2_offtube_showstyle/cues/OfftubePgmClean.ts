import {
	BaseContent,
	IBlueprintPiece,
	NotesContext,
	PieceLifespan,
	SourceLayerType,
	TimelineObjectCoreExt,
	TSR
} from '@sofie-automation/blueprints-integration'
import { CueDefinitionPgmClean, FindSourceInfoStrict, literal, SourceInfo, SourceInfoType } from 'tv2-common'
import { SharedOutputLayers } from 'tv2-constants'
import { OfftubeAtemLLayer } from '../../tv2_offtube_studio/layers'
import { OfftubeShowstyleBlueprintConfig } from '../helpers/config'
import { OfftubeSourceLayer } from '../layers'

export function OfftubeEvaluatePgmClean(
	context: NotesContext,
	config: OfftubeShowstyleBlueprintConfig,
	pieces: IBlueprintPiece[],
	partId: string,
	parsedCue: CueDefinitionPgmClean
) {
	let sourceInfo: SourceInfo | undefined
	if (parsedCue.source.match(/PGM/i)) {
		return
	}

	let sourceType: SourceInfoType | undefined
	if (parsedCue.source.match(/live/i)) {
		sourceType = SourceLayerType.REMOTE
	} else if (parsedCue.source.match(/[k|c]am/i)) {
		sourceType = SourceLayerType.CAMERA
	} else if (parsedCue.source.match(/evs/i)) {
		sourceType = SourceLayerType.LOCAL
	}

	if (!sourceType) {
		context.warning(`Invalid source for clean output: ${parsedCue.source}`)
		return
	}

	sourceInfo = FindSourceInfoStrict(context, config.sources, sourceType, parsedCue.source)

	if (!sourceInfo) {
		context.warning(`Invalid source for clean output: ${parsedCue.source}`)
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
			lifespan: PieceLifespan.OutOnRundownEnd,
			content: literal<BaseContent>({
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
