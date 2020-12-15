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
	CreatePartServerBase,
	GetTagForServer,
	GetTagForServerNext,
	literal,
	MakeContentServer,
	PartContext2,
	PartDefinition,
	SanitizeString
} from 'tv2-common'
import { AdlibActionType, AdlibTags, TallyTags } from 'tv2-constants'
import { OfftubeAtemLLayer, OfftubeCasparLLayer, OfftubeSisyfosLLayer } from '../../tv2_offtube_studio/layers'
import { OfftubeShowstyleBlueprintConfig } from '../helpers/config'
import { OfftubeEvaluateCues } from '../helpers/EvaluateCues'
import { OfftubeOutputLayers, OfftubeSourceLayer } from '../layers'
import { CreateEffektForpart } from './OfftubeEffekt'

export function OfftubeCreatePartServer(
	context: PartContext2,
	config: OfftubeShowstyleBlueprintConfig,
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
	const actions: IBlueprintActionManifest[] = []
	const file = basePartProps.file
	const duration = basePartProps.duration

	part = { ...part, ...CreateEffektForpart(context, config, partDefinition, pieces) }

	const mediaPlayerSession = SanitizeString(`segment_${segmentExternalId}_${file}`)

	pieces.push(
		literal<IBlueprintPiece>({
			externalId: partDefinition.externalId,
			name: file,
			enable: { start: 0 },
			outputLayerId: 'pgm',
			sourceLayerId: OfftubeSourceLayer.PgmServer,
			lifespan: PieceLifespan.WithinPart,
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
					SourceLayerId: OfftubeSourceLayer.PgmServer
				},
				duration
			),
			adlibPreroll: config.studio.CasparPrerollDuration,
			tags: [
				GetTagForServer(partDefinition.segmentExternalId, file, false),
				GetTagForServerNext(partDefinition.segmentExternalId, file, false),
				TallyTags.SERVER_IS_LIVE
			]
		})
	)

	// TODO: Reduce to bare minimum for action
	const actionContent = MakeContentServer(
		file,
		SanitizeString(`segment_${segmentExternalId}_${file}`),
		partDefinition,
		config,
		{
			Caspar: {
				ClipPending: OfftubeCasparLLayer.CasparPlayerClipPending
			},
			ATEM: {
				MEPGM: OfftubeAtemLLayer.AtemMEClean,
				ServerLookaheadAUX: OfftubeAtemLLayer.AtemAuxServerLookahead
			},
			Sisyfos: {
				ClipPending: OfftubeSisyfosLLayer.SisyfosSourceClipPending
			},
			OutputLayerId: OfftubeOutputLayers.SELECTED_ADLIB,
			SourceLayerId: OfftubeSourceLayer.PgmServer
		},
		duration,
		true,
		{
			isOfftube: true,
			tagAsAdlib: true
		}
	)

	actions.push(
		literal<IBlueprintActionManifest>({
			actionId: AdlibActionType.SELECT_SERVER_CLIP,
			userData: literal<ActionSelectServerClip>({
				type: AdlibActionType.SELECT_SERVER_CLIP,
				file,
				partDefinition,
				duration,
				vo: false,
				segmentExternalId: partDefinition.segmentExternalId
			}),
			userDataManifest: {},
			display: {
				label: `${partDefinition.storyName}`,
				sourceLayerId: OfftubeSourceLayer.PgmServer,
				outputLayerId: OfftubeOutputLayers.PGM,
				content: { ...actionContent, timelineObjects: [] }, // TODO: No timeline
				tags: [AdlibTags.OFFTUBE_100pc_SERVER, AdlibTags.ADLIB_KOMMENTATOR],
				currentPieceTags: [GetTagForServer(partDefinition.segmentExternalId, file, false)],
				nextPieceTags: [GetTagForServerNext(partDefinition.segmentExternalId, file, false)]
			}
		})
	)

	OfftubeEvaluateCues(context, config, pieces, adLibPieces, actions, partDefinition.cues, partDefinition, {})

	AddScript(partDefinition, pieces, duration, OfftubeSourceLayer.PgmScript)

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
