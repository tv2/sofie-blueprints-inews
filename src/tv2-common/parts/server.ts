import {
	BlueprintResultPart,
	IBlueprintPart,
	IBlueprintPiece,
	NotesContext,
	PieceLifespan
} from 'tv-automation-sofie-blueprints-integration'
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
	session?: string
}

export type ServerPartLayers = {
	SourceLayer: {
		PgmServer: string
		SelectedServer: string
	}
	AbstractLLayer: {
		ServerEnable: string
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
	context: NotesContext,
	config: ShowStyleConfig,
	partDefinition: PartDefinition,
	props: ServerPartProps,
	layers: ServerPartLayers
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
	const duration = props.tapeTime * 1000 || 0
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
		prerollDuration: config.studio.CasparPrerollDuration
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
					vo: props.vo
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
				duration
			),
			tags: []
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
				...GetVTContentProperties(config, file),
				timelineObjects: CutToServer(
					mediaPlayerSession,
					partDefinition,
					config,
					layers.AtemLLayer.MEPgm,
					layers.AbstractLLayer.ServerEnable
				)
			},
			tags: [
				GetTagForServer(partDefinition.storyName, file, false),
				GetTagForServerNext(partDefinition.storyName, file, false),
				TallyTags.SERVER_IS_LIVE
			]
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
