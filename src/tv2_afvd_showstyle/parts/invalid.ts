import { BlueprintResultPart, IBlueprintPart } from 'tv-automation-sofie-blueprints-integration'
import { PartDefinition } from '../../common/inewsConversion/converters/ParseBody'
import { literal } from '../../common/util'

export function CreatePartInvalid(ingestPart: PartDefinition, externalIdSuffix?: string): BlueprintResultPart {
	const part = literal<IBlueprintPart>({
		externalId: ingestPart.externalId + (externalIdSuffix ? `_${externalIdSuffix}` : ''),
		title: ingestPart.rawType || 'Unknown',
		metaData: {},
		typeVariant: '',
		invalid: true,
		autoNext: true
	})

	return {
		part,
		adLibPieces: [],
		pieces: []
	}
}
