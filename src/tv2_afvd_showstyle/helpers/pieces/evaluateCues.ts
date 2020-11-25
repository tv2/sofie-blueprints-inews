import { IBlueprintActionManifest } from 'tv-automation-sofie-blueprints-integration'
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
import { EvaluateCueDesign } from './design'
import { EvaluateDVE } from './dve'
import { EvaluateEkstern } from './ekstern'
import { EvaluateCueGraphic } from './graphic'
import { EvaluateCueBackgroundLoop } from './graphicBackgroundLoop'
import { EvaluateJingle } from './jingle'
import { EvaluateLYD } from './lyd'
import { EvaluateCueRouting } from './routing'
import { EvaluateTelefon } from './telefon'

export function EvaluateCues(
	context: PartContext2,
	config: BlueprintConfig,
	pieces: IBlueprintPieceEPI[],
	adLibPieces: IBlueprintAdLibPieceEPI[],
	actions: IBlueprintActionManifest[],
	cues: CueDefinition[],
	partDefinition: PartDefinition,
	options: EvaluateCuesOptions
) {
	EvaluateCuesBase(
		{
			EvaluateCueAdLib: EvaluateAdLib,
			EvaluateCueClearGrafiks: EvaluateClearGrafiks,
			EvaluateCueDVE: EvaluateDVE,
			EvaluateCueEkstern: EvaluateEkstern,
			EvaluateCueJingle: EvaluateJingle,
			EvaluateCueLYD: EvaluateLYD,
			EvaluateCueTelefon: EvaluateTelefon,
			EvaluateCueGraphic,
			EvaluateCueBackgroundLoop,
			EvaluateCueGraphicDesign: EvaluateCueDesign,
			EvaluateCueRouting
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
