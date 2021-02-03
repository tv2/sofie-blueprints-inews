import {
	HackPartMediaObjectSubscription,
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	SegmentContext,
	TimelineObjectCoreExt,
	TSR
} from '@sofie-automation/blueprints-integration'
import { PartDefinition } from 'tv2-common'
import { CueType } from 'tv2-constants'
import { OfftubeShowstyleBlueprintConfig } from './config'
import { OfftubeEvaluateCues } from './EvaluateCues'

/**
 * Evaluates all non-adlib pieces, extracts the timeline objects from generated pieces, and places those objects into the timeline objets of a parent piece.
 * @param context Part context.
 * @param config Showstyle config.
 * @param partDefinition Part to evaluate cues from.
 * @param parentPiece Part to add timeline to.
 * @param selectedCueTypes Filter to only extract cues of a certain type.
 */
export function MergePiecesAsTimeline<T extends IBlueprintPiece | IBlueprintAdLibPiece>(
	context: SegmentContext,
	config: OfftubeShowstyleBlueprintConfig,
	partDefinition: PartDefinition,
	parentPiece: T,
	selectedCueTypes?: CueType[]
): T {
	const piecesForTimeline: Array<IBlueprintPiece | IBlueprintAdLibPiece> = []
	const actions: IBlueprintActionManifest[] = []
	const mediaSubscriptions: HackPartMediaObjectSubscription[] = []

	if (parentPiece.content && parentPiece.content.timelineObjects) {
		OfftubeEvaluateCues(
			context,
			config,
			piecesForTimeline as IBlueprintPiece[],
			piecesForTimeline as IBlueprintAdLibPiece[],
			actions,
			mediaSubscriptions,
			partDefinition.cues,
			partDefinition,
			{
				excludeAdlibs: true,
				selectedCueTypes
			}
		)

		piecesForTimeline.forEach(piece => {
			if (piece.content) {
				;(parentPiece.content!.timelineObjects as TimelineObjectCoreExt[]).push(
					...(piece.content.timelineObjects as TimelineObjectCoreExt[]).filter(
						obj => obj.content.deviceType !== TSR.DeviceType.ATEM // Remove any timeline objects that affect PGM
						// TODO: Keyers?
					)
				)
			}
		})
	}

	return parentPiece
}
