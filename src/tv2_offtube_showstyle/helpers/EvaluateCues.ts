import {
	HackPartMediaObjectSubscription,
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPart,
	IBlueprintPiece,
	SegmentContext
} from '@sofie-automation/blueprints-integration'
import { CueDefinition, EvaluateCuesBase, EvaluateCuesOptions, PartDefinition } from 'tv2-common'
import { OfftubeEvaluateAdLib } from '../cues/OfftubeAdlib'
import { OfftubeEvaluateDVE } from '../cues/OfftubeDVE'
import { OfftubeEvaluateEkstern } from '../cues/OfftubeEkstern'
import { OfftubeEvaluateGrafikCaspar } from '../cues/OfftubeGraphics'
import { OfftubeEvaluateCueBackgroundLoop } from '../cues/OfftubeGraphicBackgroundLoop'
import { OfftubeEvaluateGraphicDesign } from '../cues/OfftubeGraphicDesign'
import { OfftubeEvaluateJingle } from '../cues/OfftubeJingle'
import { OfftubeEvaluatePgmClean } from '../cues/OfftubePgmClean'
import { OfftubeShowstyleBlueprintConfig } from './config'

export function OfftubeEvaluateCues(
	context: SegmentContext,
	config: OfftubeShowstyleBlueprintConfig,
	part: IBlueprintPart,
	pieces: IBlueprintPiece[],
	adLibPieces: IBlueprintAdLibPiece[],
	actions: IBlueprintActionManifest[],
	mediaSubscriptions: HackPartMediaObjectSubscription[],
	cues: CueDefinition[],
	partDefinition: PartDefinition,
	options: EvaluateCuesOptions
) {
	EvaluateCuesBase(
		{
			EvaluateCueDVE: OfftubeEvaluateDVE,
			EvaluateCueJingle: OfftubeEvaluateJingle,
			EvaluateCueAdLib: OfftubeEvaluateAdLib,
			EvaluateCueEkstern: OfftubeEvaluateEkstern,
			EvaluateCueGraphic: OfftubeEvaluateGrafikCaspar,
			EvaluateCueBackgroundLoop: OfftubeEvaluateCueBackgroundLoop,
			EvaluateCueGraphicDesign: OfftubeEvaluateGraphicDesign,
			EvaluateCuePgmClean: OfftubeEvaluatePgmClean
		},
		context,
		config,
		part,
		pieces,
		adLibPieces,
		actions,
		mediaSubscriptions,
		cues,
		partDefinition,
		options
	)
}
