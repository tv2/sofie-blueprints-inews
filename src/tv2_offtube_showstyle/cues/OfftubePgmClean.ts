import {
	BaseContent,
	IBlueprintPiece,
	PieceLifespan,
	TimelineObjectCoreExt,
	WithTimeline
} from 'blueprints-integration'
import { CueDefinitionPgmClean, findSourceInfo, literal, SegmentContext, SourceInfo } from 'tv2-common'
import { SharedOutputLayer, SourceType, SwitcherAuxLLayer } from 'tv2-constants'
import { PlayoutContentType } from '../../tv2-constants/tv2-playout-content'
import { OfftubeBlueprintConfig } from '../helpers/config'
import { OfftubeSourceLayer } from '../layers'

export function OfftubeEvaluatePgmClean(
	context: SegmentContext<OfftubeBlueprintConfig>,
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
		outputLayerId: SharedOutputLayer.AUX,
		sourceLayerId: OfftubeSourceLayer.AuxPgmClean,
		lifespan: PieceLifespan.OutOnShowStyleEnd,
		content: literal<WithTimeline<BaseContent>>({
			timelineObjects: literal<TimelineObjectCoreExt[]>([
				context.videoSwitcher.getAuxTimelineObject({
					enable: { while: '1' },
					layer: SwitcherAuxLLayer.CLEAN,
					content: {
						input: sourceInfo.port
					}
				})
			])
		}),
		metaData: {
			playoutContent: {
				type: PlayoutContentType.UNKNOWN
			}
		}
	})
}
