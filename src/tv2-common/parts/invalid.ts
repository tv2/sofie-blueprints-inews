import { BlueprintResultPart, IBlueprintPart } from '@tv2media/blueprints-integration'
import { literal, PartDefinition } from 'tv2-common'

export function CreatePartInvalid(ingestPart: PartDefinition, externalIdSuffix?: string): BlueprintResultPart {
	const part = literal<IBlueprintPart>({
		externalId: ingestPart.externalId + (externalIdSuffix ? `_${externalIdSuffix}` : ''),
		title: ingestPart.rawType || 'Unknown',
		metaData: {},
		invalid: true
	})

	return {
		part,
		adLibPieces: [],
		pieces: []
	}
}
