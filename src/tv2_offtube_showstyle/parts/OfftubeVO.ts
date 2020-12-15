import {
	BlueprintResultPart,
	IBlueprintActionManifest,
	IBlueprintPiece,
	PieceLifespan,
	PieceMetaData
} from 'tv-automation-sofie-blueprints-integration'
import {
	AddScript,
	CreateAdlibServer,
	CreatePartServerBase,
	GetTagForServer,
	GetTagForServerNext,
	literal,
	MakeContentServer,
	PartContext2,
	PartDefinition,
	SanitizeString
} from 'tv2-common'
import { TallyTags } from 'tv2-constants'
import { OfftubeAtemLLayer, OfftubeCasparLLayer, OfftubeSisyfosLLayer } from '../../tv2_offtube_studio/layers'
import { OfftubeShowstyleBlueprintConfig } from '../helpers/config'
import { OfftubeEvaluateCues } from '../helpers/EvaluateCues'
import { OfftubeOutputLayers, OfftubeSourceLayer } from '../layers'
import { CreateEffektForpart } from './OfftubeEffekt'

export function OfftubeCreatePartVO(
	context: PartContext2,
	config: OfftubeShowstyleBlueprintConfig,
	partDefinition: PartDefinition,
	segmentExternalId: string,
	totalWords: number,
	totalTime: number
): BlueprintResultPart {
	const basePartProps = CreatePartServerBase(context, config, partDefinition)

	if (basePartProps.invalid) {
		return basePartProps.part
	}

	let part = basePartProps.part.part
	const pieces = basePartProps.part.pieces
	const adLibPieces = basePartProps.part.adLibPieces
	const actions: IBlueprintActionManifest[] = []
	const file = basePartProps.file
	const duration = basePartProps.duration
	const sanitisedScript = partDefinition.script.replace(/\n/g, '').replace(/\r/g, '')
	const actualDuration = (sanitisedScript.length / totalWords) * (totalTime * 1000 - duration) + duration
	// const sanitisedScript = partDefinition.script.replace(/\n/g, '').replace(/\r/g, '')

	part = { ...part, ...CreateEffektForpart(context, config, partDefinition, pieces) }

	const mediaPlayerSession = SanitizeString(`segment_${segmentExternalId}_${file}`)

	pieces.push(
		literal<IBlueprintPiece>({
			externalId: partDefinition.externalId,
			name: file,
			enable: { start: 0 },
			outputLayerId: 'pgm',
			sourceLayerId: OfftubeSourceLayer.PgmVoiceOver,
			lifespan: PieceLifespan.WithinPart,
			metaData: literal<PieceMetaData>({
				mediaPlayerSessions: [mediaPlayerSession]
			}),
			content: MakeContentServer(
				file,
				SanitizeString(`segment_${segmentExternalId}_${file}`),
				partDefinition,
				config,
				{
					Caspar: {
						ClipPending: OfftubeCasparLLayer.CasparPlayerClipPending
					},
					Sisyfos: {
						ClipPending: OfftubeSisyfosLLayer.SisyfosSourceClipPending
					},
					ATEM: {
						MEPGM: OfftubeAtemLLayer.AtemMEClean,
						ServerLookaheadAUX: OfftubeAtemLLayer.AtemAuxServerLookahead
					},
					OutputLayerId: OfftubeOutputLayers.PGM,
					SourceLayerId: OfftubeSourceLayer.PgmVoiceOver
				},
				actualDuration
			),
			adlibPreroll: config.studio.CasparPrerollDuration,
			tags: [
				GetTagForServer(partDefinition.segmentExternalId, file, true),
				GetTagForServerNext(partDefinition.segmentExternalId, file, true),
				TallyTags.SERVER_IS_LIVE
			]
		})
	)

	actions.push(
		CreateAdlibServer(
			config,
			0,
			mediaPlayerSession,
			partDefinition,
			file,
			true,
			{
				PgmServer: OfftubeSourceLayer.PgmServer,
				PgmVoiceOver: OfftubeSourceLayer.PgmVoiceOver,
				Caspar: {
					ClipPending: OfftubeCasparLLayer.CasparPlayerClipPending
				},
				ATEM: {
					MEPGM: OfftubeAtemLLayer.AtemMEClean
				},
				Sisyfos: {
					ClipPending: OfftubeSisyfosLLayer.SisyfosSourceClipPending
				},
				STICKY_LAYERS: config.stickyLayers,
				OutputLayerId: OfftubeOutputLayers.SELECTED_ADLIB,
				SourceLayerId: OfftubeSourceLayer.PgmVoiceOver
			},
			actualDuration,
			{
				isOfftube: true,
				tagAsAdlib: true
			}
		)
	)

	OfftubeEvaluateCues(context, config, pieces, adLibPieces, actions, partDefinition.cues, partDefinition, {})
	AddScript(partDefinition, pieces, actualDuration, OfftubeSourceLayer.PgmScript)

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
