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
	partIndex: number,
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
			EvaluateCueGraphicSchema: (cue, piece, partId, parsedCue) =>
				GfxSchemaGeneratorFacade.create().createBlueprintPieceFromGfxSchemaCue(cue, piece, partId, parsedCue),
			EvaluateCueRouting,
			EvaluateCueMixMinus,
			EvaluateCueRobotCamera
		},
		context,
		part,
		pieces,
		adLibPieces,
		actions,
		mediaSubscriptions,
		cues,
		partDefinition,
		options,
		partIndex
	)
}
