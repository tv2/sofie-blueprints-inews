import { PartContext } from 'tv-automation-sofie-blueprints-integration'
import {
	CueDefinition,
	EvaluateCuesBase,
	IBlueprintAdLibPieceEPI,
	IBlueprintPieceEPI,
	PartDefinition
} from 'tv2-common'
import { OfftubeEvaluateDVE } from '../cues/OfftubeDVE'
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
	isGrafikPart?: boolean
) {
	EvaluateCuesBase(
		{ EvaluateCueVIZ: OfftubeEvaluateVIZ, EvaluateCueDVE: OfftubeEvaluateDVE },
		context,
		config,
		pieces,
		adLibPieces,
		cues,
		partDefinition,
		adlib,
		isGrafikPart
	)
}
