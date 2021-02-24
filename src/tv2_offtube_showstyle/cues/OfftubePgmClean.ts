import {
	BaseContent,
	IBlueprintPiece,
	NotesContext,
	PieceLifespan,
	SourceLayerType,
	TimelineObjectCoreExt,
	TSR
} from '@sofie-automation/blueprints-integration'
import { CueDefinitionPgmClean, FindSourceInfoStrict, literal, SourceInfo } from 'tv2-common'
import { OfftubeAtemLLayer } from '../../tv2_offtube_studio/layers'
import { AtemSourceIndex } from '../../types/atem'
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
	if (parsedCue.source !== 'PGM') {
		sourceInfo = FindSourceInfoStrict(context, config.sources, SourceLayerType.REMOTE, parsedCue.source)
	}
	pieces.push(
		literal<IBlueprintPiece>({
			externalId: partId,
			name: parsedCue.source,
			enable: {
				start: 0
			},
			outputLayerId: 'aux',
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
								input: sourceInfo ? sourceInfo.port : AtemSourceIndex.Prg2
							}
						}
					})
				])
			})
		})
	)
}
