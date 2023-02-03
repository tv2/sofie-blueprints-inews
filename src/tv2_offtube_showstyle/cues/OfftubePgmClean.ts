import {
	BaseContent,
	IBlueprintPiece,
	PieceLifespan,
	TimelineObjectCoreExt,
	TSR,
	WithTimeline
} from 'blueprints-integration'
import { CueDefinitionPgmClean, ExtendedSegmentContext, findSourceInfo, literal, SourceInfo } from 'tv2-common'
import { SharedOutputLayers, SourceType, SwitcherAuxLLayer } from 'tv2-constants'
import { OfftubeAtemLLayer } from '../../tv2_offtube_studio/layers'
import { OfftubeBlueprintConfig } from '../helpers/config'
import { OfftubeSourceLayer } from '../layers'

export function OfftubeEvaluatePgmClean(
	context: ExtendedSegmentContext<OfftubeBlueprintConfig>,
	pieces: IBlueprintPiece[],
	partId: string,
	parsedCue: CueDefinitionPgmClean
) {
	let sourceInfo: SourceInfo | undefined
	if (parsedCue.sourceDefinition.sourceType === SourceType.PGM) {
		return
	}

	sourceInfo = findSourceInfo(context.config.sources, parsedCue.sourceDefinition)

	const name = parsedCue.sourceDefinition.name || parsedCue.sourceDefinition.sourceType

	if (!sourceInfo) {
		context.core.notifyUserWarning(`Invalid source for clean output: ${name}`)
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
				context.videoSwitcher.getAuxTimelineObject({
					enable: { while: '1' },
					layer: SwitcherAuxLLayer.AuxClean,
					content: {
						input: sourceInfo.port
					}
				})
			])
		})
	})
}
