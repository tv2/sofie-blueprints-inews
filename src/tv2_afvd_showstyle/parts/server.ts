import {
	BlueprintResultPart,
	IBlueprintActionManifest,
	IBlueprintPiece,
	PieceLifespan
} from 'tv-automation-sofie-blueprints-integration'
import {
	AddScript,
	CreatePartServerBase,
	GetTagForServer,
	GetTagForServerNext,
	literal,
	MakeContentServer,
	PartContext2,
	PartDefinition,
	PieceMetaData,
	SanitizeString
} from 'tv2-common'
import { TallyTags } from 'tv2-constants'
import { AtemLLayer, CasparLLayer, SisyfosLLAyer } from '../../tv2_afvd_studio/layers'
import { BlueprintConfig } from '../helpers/config'
import { EvaluateCues } from '../helpers/pieces/evaluateCues'
import { SourceLayer } from '../layers'
import { CreateEffektForpart } from './effekt'

export function CreatePartServer(
	context: PartContext2,
	config: BlueprintConfig,
	partDefinition: PartDefinition,
	segmentExternalId: string
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
	const actions: IBlueprintActionManifest[] = []

	part = {
		...part,
		...CreateEffektForpart(context, config, partDefinition, pieces)
	}
	AddScript(partDefinition, pieces, duration, SourceLayer.PgmScript)

	const mediaPlayerSession = SanitizeString(`segment_${segmentExternalId}_${file}`)

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
				mediaPlayerSessions: [mediaPlayerSession]
			}),
			content: MakeContentServer(
				file,
				mediaPlayerSession,
				partDefinition,
				config,
				{
					Caspar: {
						ClipPending: CasparLLayer.CasparPlayerClipPending
					},
					Sisyfos: {
						ClipPending: SisyfosLLAyer.SisyfosSourceClipPending
					},
					ATEM: {
						MEPGM: AtemLLayer.AtemMEProgram
					}
				},
				duration
			),
			adlibPreroll: config.studio.CasparPrerollDuration,
			tags: [GetTagForServer(file, false), GetTagForServerNext(file, false), TallyTags.SERVER_IS_LIVE]
		})
	)

	EvaluateCues(context, config, pieces, adLibPieces, actions, partDefinition.cues, partDefinition, {})

	if (pieces.length === 0) {
		part.invalid = true
	}

	return {
		part,
		adLibPieces,
		pieces,
		actions
	}
}
