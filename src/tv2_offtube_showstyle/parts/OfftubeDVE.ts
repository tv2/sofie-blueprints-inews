import {
	BlueprintResultPart,
	IBlueprintAdLibPiece,
	IBlueprintPart,
	IBlueprintPiece,
	PartContext
} from 'tv-automation-sofie-blueprints-integration'
import { literal, PartDefinitionDVE } from 'tv2-common'
import { OffTubeShowstyleBlueprintConfig } from '../helpers/config'
import { OfftubeEvaluateCues } from '../helpers/EvaluateCues'

export function OfftubeCreatePartDVE(
	context: PartContext,
	config: OffTubeShowstyleBlueprintConfig,
	partDefinition: PartDefinitionDVE,
	_totalWords: number
): BlueprintResultPart {
	const part = literal<IBlueprintPart>({
		externalId: partDefinition.externalId,
		title: `DVE`,
		typeVariant: ''
	})
	const pieces: IBlueprintPiece[] = []
	const adLibPieces: IBlueprintAdLibPiece[] = []
	OfftubeEvaluateCues(context, config, pieces, adLibPieces, partDefinition.cues, partDefinition, { adlib: true })

	return {
		part,
		pieces,
		adLibPieces
	}
}
