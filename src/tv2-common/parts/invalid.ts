import { BlueprintResultPart, IBlueprintPart } from 'blueprints-integration'
import { PartDefinition } from 'tv2-common'
import { Invalidity } from '../types/invalidity'

export interface Part<T = unknown> extends IBlueprintPart<T> {
	invalidity?: Invalidity
}

export function CreatePartInvalid(
	ingestPart: PartDefinition,
	invalidity: Invalidity,
	externalIdSuffix?: string
): BlueprintResultPart {
	const part: Part = {
		externalId: ingestPart.externalId + (externalIdSuffix ? `_${externalIdSuffix}` : ''),
		title: ingestPart.rawType || 'Unknown',
		metaData: {},
		invalid: true,
		invalidity
	}

	return {
		part,
		adLibPieces: [],
		pieces: [],
		actions: []
	}
}
