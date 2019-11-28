import { BlueprintResultPart, IBlueprintPart } from 'tv-automation-sofie-blueprints-integration'
import { literal } from '../../common/util'
import { PartDefinition } from '../inewsConversion/converters/ParseBody'

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
