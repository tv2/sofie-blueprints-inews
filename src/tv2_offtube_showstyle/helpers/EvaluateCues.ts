import {
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	SegmentContext
} from '@sofie-automation/blueprints-integration'
import { CueDefinition, EvaluateCuesBase, EvaluateCuesOptions, PartDefinition } from 'tv2-common'
import { OfftubeEvaluateAdLib } from '../cues/OfftubeAdlib'
import { OfftubeEvaluateDVE } from '../cues/OfftubeDVE'
import { OfftubeEvaluateEkstern } from '../cues/OfftubeEkstern'
import { OfftubeEvaluateGrafikCaspar } from '../cues/OfftubeGrafikCaspar'
import { OfftubeEvaluateCueBackgroundLoop } from '../cues/OfftubeGraphicBackgroundLoop'
import { OfftubeEvaluateGraphicDesign } from '../cues/OfftubeGraphicDesign'
import { OfftubeEvaluateJingle } from '../cues/OfftubeJingle'
import { OfftubeShowstyleBlueprintConfig } from './config'

export function OfftubeEvaluateCues(
	context: SegmentContext,
	config: OfftubeShowstyleBlueprintConfig,
	pieces: IBlueprintPiece[],
	adLibPieces: IBlueprintAdLibPiece[],
	actions: IBlueprintActionManifest[],
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
			EvaluateCueGraphicDesign: OfftubeEvaluateGraphicDesign
		},
		context,
		config,
		pieces,
		adLibPieces,
		actions,
		cues,
		partDefinition,
		options
	)
}
