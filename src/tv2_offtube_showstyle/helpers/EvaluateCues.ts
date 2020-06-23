import { IBlueprintAdLibPiece, IBlueprintPiece } from 'tv-automation-sofie-blueprints-integration'
import { CueDefinition, EvaluateCuesBase, EvaluateCuesOptions, PartContext2, PartDefinition } from 'tv2-common'
import { OfftubeEvaluateAdLib } from '../cues/OfftubeAdlib'
import { OfftubeEvaluateDVE } from '../cues/OfftubeDVE'
import { OfftubeEvaluateEkstern } from '../cues/OfftubeEkstern'
import { OfftubeEvaluateGrafikCaspar } from '../cues/OfftubeGrafikCaspar'
import { OfftubeEvaluateJingle } from '../cues/OfftubeJingle'
import { OfftubeEvaluateTargetEngine } from '../cues/OfftubeTargetEngine'
import { OfftubeEvaluateVIZ } from '../cues/OfftubeViz'
import { OfftubeShowstyleBlueprintConfig } from './config'

export function OfftubeEvaluateCues(
	context: PartContext2,
	config: OfftubeShowstyleBlueprintConfig,
	pieces: IBlueprintPiece[],
	adLibPieces: IBlueprintAdLibPiece[],
	cues: CueDefinition[],
	partDefinition: PartDefinition,
	options: EvaluateCuesOptions
) {
	EvaluateCuesBase(
		{
			EvaluateCueVIZ: OfftubeEvaluateVIZ,
			EvaluateCueDVE: OfftubeEvaluateDVE,
			EvaluateCueTargetEngine: OfftubeEvaluateTargetEngine,
			EvaluateCueGrafik: OfftubeEvaluateGrafikCaspar,
			EvaluateCueJingle: OfftubeEvaluateJingle,
			EvaluateCueAdLib: OfftubeEvaluateAdLib,
			EvaluateCueEkstern: OfftubeEvaluateEkstern
		},
		context,
		config,
		pieces,
		adLibPieces,
		cues,
		partDefinition,
		options
	)
}
