import {
	BlueprintResultPart,
	IBlueprintActionManifest,
	IBlueprintPiece,
	PieceLifespan,
	PieceMetaData
} from 'tv-automation-sofie-blueprints-integration'
import {
	ActionSelectServerClip,
	AddScript,
	CreateAdlibServer,
	CreatePartServerBase,
	GetSisyfosTimelineObjForCamera,
	GetTagForServer,
	GetTagForServerNext,
	literal,
	MakeContentServer,
	PartContext2,
	PartDefinition,
	SanitizeString
} from 'tv2-common'
import { AdlibActionType, AdlibTags, TallyTags } from 'tv2-constants'
import {
	OfftubeAbstractLLayer,
	OfftubeAtemLLayer,
	OfftubeCasparLLayer,
	OfftubeSisyfosLLayer
} from '../../tv2_offtube_studio/layers'
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
						MEPGM: OfftubeAtemLLayer.AtemMEClean
					}
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

	const adlibServer = CreateAdlibServer(
		config,
		0,
		partDefinition.externalId,
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
			STICKY_LAYERS: config.stickyLayers
		},
		actualDuration,
		{
			isOfftube: true,
			tagAsAdlib: true,
			serverEnable: OfftubeAbstractLLayer.OfftubeAbstractLLayerServerEnable
		}
	)
	adlibServer.content?.timelineObjects.push(
		GetSisyfosTimelineObjForCamera(context, config, 'server', OfftubeSisyfosLLayer.SisyfosGroupStudioMics)
	)

	actions.push(
		literal<IBlueprintActionManifest>({
			actionId: AdlibActionType.SELECT_SERVER_CLIP,
			userData: literal<ActionSelectServerClip>({
				type: AdlibActionType.SELECT_SERVER_CLIP,
				file,
				partDefinition,
				duration,
				vo: true,
				segmentExternalId: partDefinition.segmentExternalId
			}),
			userDataManifest: {},
			display: {
				label: `${partDefinition.storyName}`,
				sourceLayerId: OfftubeSourceLayer.PgmVoiceOver,
				outputLayerId: OfftubeOutputLayers.PGM,
				content: { ...adlibServer.content, timelineObjects: [] },
				tags: [AdlibTags.OFFTUBE_ADLIB_SERVER, AdlibTags.ADLIB_KOMMENTATOR, AdlibTags.ADLIB_FLOW_PRODUCER],
				currentPieceTags: [GetTagForServer(partDefinition.segmentExternalId, file, true)],
				nextPieceTags: [GetTagForServerNext(partDefinition.segmentExternalId, file, true)]
			}
		})
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
