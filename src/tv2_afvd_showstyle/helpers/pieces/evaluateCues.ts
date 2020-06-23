import {
	CueDefinition,
	EvaluateCuesBase,
	EvaluateCuesOptions,
	IBlueprintAdLibPieceEPI,
	IBlueprintPieceEPI,
	PartContext2,
	PartDefinition
} from 'tv2-common'
import { BlueprintConfig } from '../../../tv2_afvd_showstyle/helpers/config'
import { EvaluateAdLib } from './adlib'
import { EvaluateClearGrafiks } from './clearGrafiks'
// import { EvaluateClearGrafiks } from './clearGrafiks'
import { EvaluateDesign } from './design'
import { EvaluateDVE } from './dve'
import { EvaluateEkstern } from './ekstern'
import { EvaluateGrafikViz } from './grafikViz'
import { EvaluateJingle } from './jingle'
import { EvaluateLYD } from './lyd'
import { EvaluateMOSViz } from './mos'
import { EvaluateTargetEngine } from './targetEngine'
import { EvaluateTelefon } from './telefon'
import { EvaluateVIZ } from './viz'

export function EvaluateCues(
	context: PartContext2,
	config: BlueprintConfig,
	pieces: IBlueprintPieceEPI[],
	adLibPieces: IBlueprintAdLibPieceEPI[],
	cues: CueDefinition[],
	partDefinition: PartDefinition,
	options: EvaluateCuesOptions
) {
	EvaluateCuesBase(
		{
			EvaluateCueAdLib: EvaluateAdLib,
			EvaluateCueClearGrafiks: EvaluateClearGrafiks,
			EvaluateCueDVE: EvaluateDVE,
			EvaluateCueDesign: EvaluateDesign,
			EvaluateCueEkstern: EvaluateEkstern,
			EvaluateCueGrafik: EvaluateGrafikViz,
			EvaluateCueJingle: EvaluateJingle,
			EvaluateCueLYD: EvaluateLYD,
			EvaluateCueMOS: EvaluateMOSViz,
			EvaluateCueTargetEngine: EvaluateTargetEngine,
			EvaluateCueTelefon: EvaluateTelefon,
			EvaluateCueVIZ: EvaluateVIZ
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
