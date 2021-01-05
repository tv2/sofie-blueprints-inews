import {
	BlueprintResultPart,
	IBlueprintPart,
	IBlueprintPiece,
	NotesContext,
	PieceLifespan,
	PieceMetaData
} from 'tv-automation-sofie-blueprints-integration'
import {
	CutToServer,
	GetTagForServer,
	GetTagForServerNext,
	MakeContentServer,
	MakeContentServerSourceLayers
} from 'tv2-common'
import { TallyTags } from 'tv2-constants'
import { TV2BlueprintConfigBase, TV2StudioConfigBase } from '../blueprintConfig'
import { PartDefinition } from '../inewsConversion'
import { literal, SanitizeString } from '../util'
import { CreatePartInvalid } from './invalid'
import { GetVTContentProperties } from '../content'

export interface ServerPartProps {
	vo: boolean
	totalWords: number
	totalTime: number
	tapeTime: number
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

	const mediaPlayerSession = SanitizeString(`segment_${partDefinition.segmentExternalId}_${file}`)

	pieces.push(
		literal<IBlueprintPiece>({
			externalId: partDefinition.externalId,
			name: file,
			enable: { start: 0 },
			outputLayerId: 'sec',
			sourceLayerId: layers.SourceLayer.SelectedServer,
			lifespan: PieceLifespan.OutOnSegmentEnd,
			metaData: literal<PieceMetaData>({
				mediaPlayerSessions: [mediaPlayerSession]
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
			content: {
				...GetVTContentProperties(config, file),
				timelineObjects: CutToServer(
					mediaPlayerSession,
					partDefinition,
					config,
					layers.AtemLLayer.MEPgm,
					layers.AbstractLLayer.ServerEnable,
					layers.AtemLLayer.ServerLookaheadAux
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
