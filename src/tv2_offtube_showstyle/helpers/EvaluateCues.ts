import {
	HackPartMediaObjectSubscription,
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPart,
	IBlueprintPiece
} from 'blueprints-integration'
import {
	CueDefinition,
	EvaluateCuesBase,
	EvaluateCuesOptions,
	EvaluateLYD,
	PartDefinition,
	SegmentContext
} from 'tv2-common'
import { GfxSchemaGeneratorFacade } from '../../tv2-common/cues/gfx-schema-generator-facade'
import { OfftubeEvaluateAdLib } from '../cues/OfftubeAdlib'
import { OfftubeEvaluateDVE } from '../cues/OfftubeDVE'
import { OfftubeEvaluateEkstern } from '../cues/OfftubeEkstern'
import { OfftubeEvaluateCueBackgroundLoop } from '../cues/OfftubeGraphicBackgroundLoop'
import { OfftubeEvaluateGraphicDesign } from '../cues/OfftubeGraphicDesign'
import { OfftubeEvaluateGrafikCaspar } from '../cues/OfftubeGraphics'
import { OfftubeEvaluateJingle } from '../cues/OfftubeJingle'
import { OfftubeEvaluatePgmClean } from '../cues/OfftubePgmClean'
import { OfftubeBlueprintConfig } from './config'

export async function OfftubeEvaluateCues(
	context: SegmentContext<OfftubeBlueprintConfig>,
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
			EvaluateCueDVE: OfftubeEvaluateDVE,
			EvaluateCueJingle: OfftubeEvaluateJingle,
			EvaluateCueAdLib: OfftubeEvaluateAdLib,
			EvaluateCueEkstern: OfftubeEvaluateEkstern,
			EvaluateCueGraphic: OfftubeEvaluateGrafikCaspar,
			EvaluateCueBackgroundLoop: OfftubeEvaluateCueBackgroundLoop,
			EvaluateCueGraphicDesign: OfftubeEvaluateGraphicDesign,
			EvaluateCuePgmClean: OfftubeEvaluatePgmClean,
			EvaluateCueLYD: EvaluateLYD,
			EvaluateCueGraphicSchema: (c, p, partId, parsedCue) =>
				GfxSchemaGeneratorFacade.create().createBlueprintPieceFromGfxSchemaCue(c, p, partId, parsedCue)
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
