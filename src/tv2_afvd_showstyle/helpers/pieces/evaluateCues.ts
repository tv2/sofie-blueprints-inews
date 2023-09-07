import {
	HackPartMediaObjectSubscription,
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPart,
	IBlueprintPiece
} from 'blueprints-integration'
import {
	CueDefinition,
	EvaluateCueMixMinus,
	EvaluateCueRobotCamera,
	EvaluateCuesBase,
	EvaluateCuesOptions,
	EvaluateCueVariant,
	EvaluateLYD,
	PartDefinition,
	ShowStyleContext
} from 'tv2-common'
import { GfxSchemaGeneratorFacade } from '../../../tv2-common/cues/gfx-schema-generator-facade'
import { GalleryBlueprintConfig } from '../../../tv2_afvd_showstyle/helpers/config'
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

export async function EvaluateCues(
	context: ShowStyleContext<GalleryBlueprintConfig>,
	part: IBlueprintPart,
	pieces: IBlueprintPiece[],
	adLibPieces: IBlueprintAdLibPiece[],
	actions: IBlueprintActionManifest[],
	mediaSubscriptions: HackPartMediaObjectSubscription[],
	cues: CueDefinition[],
	partDefinition: PartDefinition,
	options: EvaluateCuesOptions
) {
	await EvaluateCuesBase(
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
			EvaluateCueGraphicSchema: (cue, partId, parsedCue) =>
				GfxSchemaGeneratorFacade.create().createBlueprintPieceFromGfxSchemaCue(cue, partId, parsedCue),
			EvaluateCueRouting,
			EvaluateCueMixMinus,
			EvaluateCueRobotCamera,
			EvaluateCueVariant
		},
		context,
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
