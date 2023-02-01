import { BlueprintResultPart, IBlueprintPart } from 'blueprints-integration'
import {
	ExtendedShowStyleContext,
	PartDefinition,
	PartTime,
	TV2BlueprintConfigBase,
	TV2StudioConfigBase
} from 'tv2-common'

export function CreatePartKamBase<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	context: ExtendedShowStyleContext<ShowStyleConfig>,
	partDefinition: PartDefinition,
	totalWords: number
): { part: BlueprintResultPart; duration: number; invalid?: true } {
	const partTime = PartTime(context.config, partDefinition, totalWords, false)

	const part: IBlueprintPart = {
		externalId: partDefinition.externalId,
		title: partDefinition.rawType,
		metaData: {},
		expectedDuration: partTime > 0 ? partTime : 0
	}

	return {
		part: {
			part,
			pieces: [],
			adLibPieces: [],
			actions: []
		},
		duration: partTime
	}
}
