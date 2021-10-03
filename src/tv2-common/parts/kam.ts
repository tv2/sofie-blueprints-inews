import { BlueprintResultPart, IBlueprintPart, IShowStyleUserContext } from '@sofie-automation/blueprints-integration'
import { literal, PartDefinition, PartTime } from 'tv2-common'

export function CreatePartKamBase(
	_context: IShowStyleUserContext,
	partDefinition: PartDefinition,
	totalWords: number
): { part: BlueprintResultPart; duration: number; invalid?: true } {
	const partTime = PartTime(partDefinition, totalWords)

	const part = literal<IBlueprintPart>({
		externalId: partDefinition.externalId,
		title: partDefinition.rawType,
		metaData: {},
		expectedDuration: partTime > 0 ? partTime : 0
	})

	return {
		part: {
			part,
			pieces: [],
			adLibPieces: []
		},
		duration: partTime
	}
}
