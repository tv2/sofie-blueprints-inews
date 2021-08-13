import {
	HackPartMediaObjectSubscription,
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPart,
	IBlueprintPiece,
	ISegmentUserContext
} from '@sofie-automation/blueprints-integration'
import { CueDefinition, EvaluateCuesBase, EvaluateCuesOptions, EvaluateLYD, PartDefinition } from 'tv2-common'
import { BlueprintConfig } from '../../../tv2_afvd_showstyle/helpers/config'
import { EvaluateAdLib } from './adlib'
import { EvaluateClearGrafiks } from './clearGrafiks'
import { EvaluateCueDesign } from './design'
import { EvaluateDVE } from './dve'
import { EvaluateEkstern } from './ekstern'
import { EvaluateCueGraphic } from './graphic'
import { EvaluateCueBackgroundLoop } from './graphicBackgroundLoop'
import { EvaluateJingle } from './jingle'
import { EvaluateCueRouting } from './routing'
import { EvaluateTelefon } from './telefon'

export function EvaluateCues(
	context: ISegmentUserContext,
	config: BlueprintConfig,
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
