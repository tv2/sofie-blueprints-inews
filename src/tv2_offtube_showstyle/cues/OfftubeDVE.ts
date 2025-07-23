import { IBlueprintActionManifest, IBlueprintPiece, PieceLifespan, SplitsContent } from 'blueprints-integration'
import {
	ActionSelectDVE,
	calculateTime,
	CueDefinitionDVE,
	DVEPieceMetaData,
	generateExternalId,
	GetDVETemplate,
	GetTagForDVE,
	GetTagForDVENext,
	literal,
	Part,
	PartDefinition,
	SegmentContext,
	t,
	TemplateIsValid
} from 'tv2-common'
import { AdlibActionType, AdlibTags, SharedOutputLayer, TallyTags } from 'tv2-constants'
import { Tv2OutputLayer } from '../../tv2-constants/tv2-output-layer'
import { parseDveSourcesToPlayoutContent, PlayoutContentType } from '../../tv2-constants/tv2-playout-content'
import { OfftubeMakeContentDVE } from '../content/OfftubeDVEContent'
import { OfftubeBlueprintConfig } from '../helpers/config'
import { OfftubeOutputLayers, OfftubeSourceLayer } from '../layers'

export function OfftubeEvaluateDVE(
	context: SegmentContext<OfftubeBlueprintConfig>,
	part: Part,
	pieces: IBlueprintPiece[],
	actions: IBlueprintActionManifest[],
	partDefinition: PartDefinition,
	parsedCue: CueDefinitionDVE,
	adlib?: boolean,
	rank?: number
) {
	if (!parsedCue.template) {
		return
	}
	part.title = `DVE: ${parsedCue.template}`

	const rawTemplate = GetDVETemplate(context.config.showStyle.DVEStyles, parsedCue.template)
	if (!rawTemplate) {
		context.core.notifyUserWarning(`Could not find template ${parsedCue.template}`)
		return
	}

	if (!TemplateIsValid(rawTemplate.DVEJSON)) {
		context.core.notifyUserWarning(`Invalid DVE template ${parsedCue.template}`)
		return
	}

	const adlibContent = OfftubeMakeContentDVE(context, partDefinition, parsedCue, rawTemplate)

	const pieceContent = OfftubeMakeContentDVE(context, partDefinition, parsedCue, rawTemplate)

	if (adlibContent.valid && pieceContent.valid) {
		let start = parsedCue.start ? calculateTime(parsedCue.start) : 0
		start = start ? start : 0
		const end = parsedCue.end ? calculateTime(parsedCue.end) : undefined
		pieces.push({
			externalId: partDefinition.externalId,
			name: parsedCue.template,
			enable: {
				start,
				...(end ? { duration: end - start } : {})
			},
			outputLayerId: SharedOutputLayer.PGM,
			sourceLayerId: OfftubeSourceLayer.PgmDVE,
			lifespan: PieceLifespan.WithinPart,
			toBeQueued: true,
			content: {
				...pieceContent.content,
				timelineObjects: [...pieceContent.content.timelineObjects]
			},
			prerollDuration: Number(context.config.studio.CasparPrerollDuration) || 0,
			metaData: literal<DVEPieceMetaData>({
				playoutContent: {
					type: PlayoutContentType.SPLIT_SCREEN,
					layout: parsedCue.template,
					inputPlayoutContents: parseDveSourcesToPlayoutContent(parsedCue.sources, context)
				},
				outputLayer: Tv2OutputLayer.PROGRAM,
				mediaPlayerSessions: [partDefinition.segmentExternalId],
				sources: parsedCue.sources,
				config: rawTemplate,
				userData: {
					type: AdlibActionType.SELECT_DVE,
					config: parsedCue,
					name: parsedCue.template,
					videoId: partDefinition.fields.videoId,
					segmentExternalId: partDefinition.segmentExternalId
				}
			}),
			tags: [
				GetTagForDVE(partDefinition.segmentExternalId, parsedCue.template, parsedCue.sources),
				GetTagForDVENext(partDefinition.segmentExternalId, parsedCue.template, parsedCue.sources),
				TallyTags.DVE_IS_LIVE
			]
		})

		const userData: ActionSelectDVE = {
			type: AdlibActionType.SELECT_DVE,
			config: parsedCue,
			name: `DVE: ${parsedCue.template}`,
			videoId: partDefinition.fields.videoId,
			segmentExternalId: partDefinition.segmentExternalId
		}
		actions.push({
			externalId: `${partDefinition.segmentExternalId}_${generateExternalId(context.core, userData)}`,
			actionId: AdlibActionType.SELECT_DVE,
			userData,
			userDataManifest: {},
			display: {
				_rank: rank,
				sourceLayerId: OfftubeSourceLayer.PgmDVE,
				outputLayerId: OfftubeOutputLayers.PGM,
				label: t(`${partDefinition.storyName}`),
				tags: [AdlibTags.ADLIB_KOMMENTATOR, ...(adlib ? [AdlibTags.ADLIB_FLOW_PRODUCER] : [])],
				content: literal<SplitsContent>({
					...pieceContent.content
				}),
				currentPieceTags: [GetTagForDVE(partDefinition.segmentExternalId, parsedCue.template, parsedCue.sources)],
				nextPieceTags: [GetTagForDVENext(partDefinition.segmentExternalId, parsedCue.template, parsedCue.sources)]
			}
		})
	}
}
