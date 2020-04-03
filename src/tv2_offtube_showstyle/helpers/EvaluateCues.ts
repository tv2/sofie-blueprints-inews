import { PartContext } from 'tv-automation-sofie-blueprints-integration'
import {
	CueDefinition,
	EvaluateCuesBase,
	IBlueprintAdLibPieceEPI,
	IBlueprintPieceEPI,
	PartDefinition
} from 'tv2-common'
import { CueType } from 'tv2-constants'
import { OfftubeEvaluateDVE } from '../cues/OfftubeDVE'
import { OfftubeEvaluateGrafikCaspar } from '../cues/OfftubeGrafikCaspar'
import { OfftubeEvaluateJingle } from '../cues/OfftubeJingle'
import { OfftubeEvaluateTargetEngine } from '../cues/OfftubeTargetEngine'
import { OfftubeEvaluateVIZ } from '../cues/OfftubeViz'
import { OffTubeShowstyleBlueprintConfig } from './config'

export function OfftubeEvaluateCues(
	context: PartContext,
	config: OffTubeShowstyleBlueprintConfig,
	pieces: IBlueprintPieceEPI[],
	adLibPieces: IBlueprintAdLibPieceEPI[],
	cues: CueDefinition[],
	partDefinition: PartDefinition,
	adlib?: boolean,
	isGrafikPart?: boolean,
	/** Passing this arguments sets the types of cues to evaluate. */
	selectedCueTypes?: CueType[] | undefined,
	/** Don't evaluate adlibs */
	excludeAdlibs?: boolean,
	/** Only evaluate adlibs */
	adlibsOnly?: boolean
) {
	EvaluateCuesBase(
		{
			EvaluateCueVIZ: OfftubeEvaluateVIZ,
			EvaluateCueDVE: OfftubeEvaluateDVE,
			EvaluateCueTargetEngine: OfftubeEvaluateTargetEngine,
			EvaluateCueGrafik: OfftubeEvaluateGrafikCaspar,
			EvaluateCueJingle: OfftubeEvaluateJingle
		},
		context,
		config,
		pieces,
		adLibPieces,
		cues,
		partDefinition,
		adlib,
		isGrafikPart,
		selectedCueTypes,
		excludeAdlibs,
		adlibsOnly
	)
}
