import {
	BlueprintResultPart,
	IBlueprintAdLibPiece,
	IBlueprintPart,
	IBlueprintPiece,
	PartContext,
	PieceLifespan
} from 'tv-automation-sofie-blueprints-integration'
import { literal } from '../../common/util'
import { BlueprintConfig } from '../helpers/config'
import { MakeContentServerEnableObject } from '../helpers/content/server'
import { EvaluateCues } from '../helpers/pieces/evaluateCues'
import { AddScript } from '../helpers/pieces/script'
import { PartDefinition } from '../inewsConversion/converters/ParseBody'
import { SourceLayer } from '../layers'
import { CreateEffektForpart } from './effekt'
import { CreatePartInvalid } from './invalid'

export function CreatePartServer(
	context: PartContext,
	config: BlueprintConfig,
	partDefinition: PartDefinition,
	segmentId: string
): BlueprintResultPart {
	if (partDefinition.fields === undefined) {
		context.warning('Video ID not set!')
		return CreatePartInvalid(partDefinition)
	}

	if (!partDefinition.fields.videoId) {
		context.warning('Video ID not set!')
		return CreatePartInvalid(partDefinition)
	}

	const file = partDefinition.fields.videoId
	const duration = Number(partDefinition.fields.tapeTime) * 1000 || 0

	let part = literal<IBlueprintPart>({
		externalId: partDefinition.externalId,
		title: partDefinition.rawType,
		metaData: {},
		typeVariant: '',
		expectedDuration: duration || 1000,
		prerollDuration: config.studio.CasparPrerollDuration
	})

	const adLibPieces: IBlueprintAdLibPiece[] = []
	const pieces: IBlueprintPiece[] = []

	part = { ...part, ...CreateEffektForpart(context, config, partDefinition, pieces) }
	AddScript(partDefinition, pieces, duration)

	pieces.push(
		literal<IBlueprintPiece>({
			_id: '',
			externalId: partDefinition.externalId,
			name: file,
			enable: { start: 0 },
			outputLayerId: 'pgm',
			sourceLayerId: SourceLayer.PgmServer,
			infiniteMode: PieceLifespan.OutOnNextPart,
			content: MakeContentServerEnableObject(file, segmentId, partDefinition, config)
		})
	)

	EvaluateCues(context, config, pieces, adLibPieces, partDefinition.cues, partDefinition)

	if (pieces.length === 0) {
		part.invalid = true
	}

	return {
		part,
		adLibPieces,
		pieces
	}
}
