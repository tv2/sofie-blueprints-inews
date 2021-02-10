import {
	ActionExecutionContext,
	BlueprintResultPart,
	IBlueprintPart,
	IBlueprintPiece,
	PieceLifespan,
	SegmentContext
} from '@sofie-automation/blueprints-integration'
import {
	CutToServer,
	GetTagForServer,
	GetTagForServerNext,
	MakeContentServer,
	MakeContentServerSourceLayers,
	PieceMetaData
} from 'tv2-common'
import { AdlibActionType, TallyTags } from 'tv2-constants'
import { ActionSelectServerClip } from '../actions'
import { TV2BlueprintConfigBase, TV2StudioConfigBase } from '../blueprintConfig'
import { GetVTContentProperties } from '../content'
import { PartDefinition } from '../inewsConversion'
import { AdlibServerOfftubeOptions } from '../pieces'
import { literal, SanitizeString } from '../util'
import { CreatePartInvalid } from './invalid'

interface PieceMetaDataServer {
	userData: ActionSelectServerClip
}

export interface ServerPartProps {
	vo: boolean
	totalWords: number
	totalTime: number
	tapeTime: number
	adLib: boolean
	session?: string
}

export type ServerPartLayers = {
	SourceLayer: {
		PgmServer: string
		SelectedServer: string
	}
	AtemLLayer: {
		MEPgm: string
		ServerLookaheadAux?: string
	}
} & MakeContentServerSourceLayers

export function CreatePartServerBase<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	context: SegmentContext | ActionExecutionContext,
	config: ShowStyleConfig,
	partDefinition: PartDefinition,
	props: ServerPartProps,
	layers: ServerPartLayers,
	offtubeOptions: AdlibServerOfftubeOptions
): { part: BlueprintResultPart; file: string; duration: number; invalid?: true } {
	if (partDefinition.fields === undefined) {
		context.warning('Video ID not set!')
		return { part: CreatePartInvalid(partDefinition), file: '', duration: 0, invalid: true }
	}

	if (!partDefinition.fields.videoId) {
		context.warning('Video ID not set!')
		return { part: CreatePartInvalid(partDefinition), file: '', duration: 0, invalid: true }
	}

	const file = partDefinition.fields.videoId
	const mediaObjectDuration = context.hackGetMediaObjectDuration(file)
	const sourceDuration =
		mediaObjectDuration !== undefined ? mediaObjectDuration * 1000 - config.studio.ServerPostrollDuration : undefined
	const duration =
		(mediaObjectDuration !== undefined && ((props.vo && props.totalWords <= 0) || !props.vo) && sourceDuration) ||
		props.tapeTime * 1000 ||
		0
	const sanitisedScript = partDefinition.script.replace(/\n/g, '').replace(/\r/g, '')
	const actualDuration =
		props.vo && props.totalWords > 0
			? (sanitisedScript.length / props.totalWords) * (props.totalTime * 1000 - duration) + duration
			: duration

	const basePart = literal<IBlueprintPart>({
		externalId: partDefinition.externalId,
		title: file,
		metaData: {},
		expectedDuration: actualDuration || 1000,
		prerollDuration: config.studio.CasparPrerollDuration,
		hackListenToMediaObjectUpdates: [{ mediaId: file.toUpperCase() }]
	})

	const pieces: IBlueprintPiece[] = []

	const mediaPlayerSession = SanitizeString(`segment_${props.session ?? partDefinition.segmentExternalId}_${file}`)

	pieces.push(
		literal<IBlueprintPiece>({
			externalId: partDefinition.externalId,
			name: file,
			enable: { start: 0 },
			outputLayerId: 'sec',
			sourceLayerId: layers.SourceLayer.SelectedServer,
			lifespan: PieceLifespan.OutOnSegmentEnd,
			metaData: literal<PieceMetaData & PieceMetaDataServer>({
				mediaPlayerSessions: [mediaPlayerSession],
				userData: literal<ActionSelectServerClip>({
					type: AdlibActionType.SELECT_SERVER_CLIP,
					file,
					partDefinition,
					duration: actualDuration,
					vo: props.vo,
					adLib: props.adLib
				})
			}),
			content: MakeContentServer(
				context,
				file,
				mediaPlayerSession,
				partDefinition,
				config,
				{
					Caspar: {
						ClipPending: layers.Caspar.ClipPending
					},
					Sisyfos: {
						ClipPending: layers.Sisyfos.ClipPending,
						StudioMicsGroup: layers.Sisyfos.StudioMicsGroup
					},
					ATEM: {
						ServerLookaheadAux: layers.ATEM.ServerLookaheadAux
					}
				},
				props.adLib,
				offtubeOptions,
				props.vo,
				sourceDuration
			),
			tags: [GetTagForServerNext(partDefinition.segmentExternalId, file, props.vo)]
		})
	)

	pieces.push(
		literal<IBlueprintPiece>({
			externalId: partDefinition.externalId,
			name: file,
			enable: { start: 0 },
			outputLayerId: 'pgm',
			sourceLayerId: layers.SourceLayer.PgmServer,
			lifespan: PieceLifespan.WithinPart,
			metaData: literal<PieceMetaData>({
				mediaPlayerSessions: [mediaPlayerSession]
			}),
			content: {
				...GetVTContentProperties(config, file, sourceDuration),
				timelineObjects: CutToServer(mediaPlayerSession, partDefinition, config, layers.AtemLLayer.MEPgm)
			},
			tags: [GetTagForServer(partDefinition.segmentExternalId, file, props.vo), TallyTags.SERVER_IS_LIVE]
		})
	)

	return {
		part: {
			part: basePart,
			adLibPieces: [],
			pieces
		},
		file,
		duration: actualDuration
	}
}
