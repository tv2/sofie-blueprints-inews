import {
	BlueprintResultPart,
	IBlueprintPiece,
	PartContext,
	PieceLifespan
} from 'tv-automation-sofie-blueprints-integration'
import { CreatePartServerBase, literal, MakeContentServer, PartDefinition, PieceMetaData } from 'tv2-common'
import { AtemLLayer, CasparLLayer, SisyfosLLAyer } from '../../tv2_afvd_studio/layers'
import { BlueprintConfig } from '../helpers/config'
import { EvaluateCues } from '../helpers/pieces/evaluateCues'
import { AddScript } from '../helpers/pieces/script'
import { SourceLayer } from '../layers'
import { CreateEffektForpart } from './effekt'

export function CreatePartServer(
	context: PartContext,
	config: BlueprintConfig,
	partDefinition: PartDefinition
): BlueprintResultPart {
	const basePartProps = CreatePartServerBase(context, config, partDefinition)

	if (basePartProps.invalid) {
		return basePartProps.part
	}

	let part = basePartProps.part.part
	const pieces = basePartProps.part.pieces
	const adLibPieces = basePartProps.part.adLibPieces
	const file = basePartProps.file
	const duration = basePartProps.duration

	part = {
		...part,
		...CreateEffektForpart(context, config, partDefinition, pieces)
	}
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
			metaData: literal<PieceMetaData>({
				mediaPlayerSessions: [part.externalId]
			}),
			content: MakeContentServer(file, part.externalId, partDefinition, config, {
				Caspar: {
					ClipPending: CasparLLayer.CasparPlayerClipPending
				},
				Sisyfos: {
					ClipPending: SisyfosLLAyer.SisyfosSourceClipPending
				},
				ATEM: {
					MEPGM: AtemLLayer.AtemMEProgram
				}
			}),
			adlibPreroll: config.studio.CasparPrerollDuration
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
