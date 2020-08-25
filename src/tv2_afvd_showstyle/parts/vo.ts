import {
	BlueprintResultPart,
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPart,
	IBlueprintPiece,
	PieceLifespan,
	PieceMetaData
} from 'tv-automation-sofie-blueprints-integration'
import {
	AddScript,
	CreatePartInvalid,
	GetSisyfosTimelineObjForCamera,
	GetTagForServer,
	GetTagForServerNext,
	literal,
	MakeContentServer,
	PartContext2,
	PartDefinition,
	SanitizeString
} from 'tv2-common'
import { TallyTags } from 'tv2-constants'
import { AtemLLayer, CasparLLayer, SisyfosLLAyer } from '../../tv2_afvd_studio/layers'
import { BlueprintConfig } from '../helpers/config'
import { EvaluateCues } from '../helpers/pieces/evaluateCues'
import { SourceLayer } from '../layers'
import { CreateEffektForpart } from './effekt'

export function CreatePartVO(
	context: PartContext2,
	config: BlueprintConfig,
	partDefinition: PartDefinition,
	segmentExternalId: string,
	totalWords: number,
	totalTime: number
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
	const sanitisedScript = partDefinition.script.replace(/\n/g, '').replace(/\r/g, '')
	const actualDuration = (sanitisedScript.length / totalWords) * (totalTime * 1000 - duration) + duration

	let part = literal<IBlueprintPart>({
		externalId: partDefinition.externalId,
		title: `${partDefinition.rawType} - ${partDefinition.fields.videoId}`,
		metaData: {},
		expectedDuration: actualDuration,
		prerollDuration: config.studio.CasparPrerollDuration
	})

	const adLibPieces: IBlueprintAdLibPiece[] = []
	const pieces: IBlueprintPiece[] = []
	const actions: IBlueprintActionManifest[] = []

	part = { ...part, ...CreateEffektForpart(context, config, partDefinition, pieces) }

	const mediaPlayerSession = SanitizeString(`segment_${segmentExternalId}_${file}`)

	const serverContent = MakeContentServer(
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
		duration,
		false
	)
	serverContent.timelineObjects.push(...GetSisyfosTimelineObjForCamera(context, config, 'server'))
	pieces.push(
		literal<IBlueprintPiece>({
			externalId: partDefinition.externalId,
			name: part.title,
			enable: { start: 0 },
			outputLayerId: 'pgm',
			sourceLayerId: SourceLayer.PgmVoiceOver,
			lifespan: PieceLifespan.WithinPart,
			metaData: literal<PieceMetaData>({
				mediaPlayerSessions: [mediaPlayerSession]
			}),
			content: serverContent,
			adlibPreroll: config.studio.CasparPrerollDuration,
			tags: [
				GetTagForServer(partDefinition.segmentExternalId, file, true),
				GetTagForServerNext(partDefinition.segmentExternalId, file, true),
				TallyTags.SERVER_IS_LIVE
			]
		})
	)

	EvaluateCues(context, config, pieces, adLibPieces, actions, partDefinition.cues, partDefinition, {})
	AddScript(partDefinition, pieces, actualDuration, SourceLayer.PgmScript)

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
