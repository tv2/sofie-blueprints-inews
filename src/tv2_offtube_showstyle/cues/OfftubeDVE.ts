import {
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	ISegmentUserContext,
	PieceLifespan,
	SplitsContent
} from '@tv2media/blueprints-integration'
import {
	ActionSelectDVE,
	AddParentClass,
	CalculateTime,
	CueDefinitionDVE,
	DVEPieceMetaData,
	generateExternalId,
	GetDVETemplate,
	GetTagForDVE,
	GetTagForDVENext,
	literal,
	PartDefinition,
	PieceMetaData,
	t,
	TemplateIsValid
} from 'tv2-common'
import { AdlibActionType, AdlibTags, SharedOutputLayers, TallyTags } from 'tv2-constants'
import { OfftubeMakeContentDVE } from '../content/OfftubeDVEContent'
import { OfftubeShowstyleBlueprintConfig } from '../helpers/config'
import { OfftubeOutputLayers, OfftubeSourceLayer } from '../layers'

export function OfftubeEvaluateDVE(
	context: ISegmentUserContext,
	config: OfftubeShowstyleBlueprintConfig,
	pieces: IBlueprintPiece[],
	_adlibPieces: IBlueprintAdLibPiece[],
	actions: IBlueprintActionManifest[],
	partDefinition: PartDefinition,
	parsedCue: CueDefinitionDVE,
	adlib?: boolean,
	rank?: number
) {
	if (!parsedCue.template) {
		return
	}

	const rawTemplate = GetDVETemplate(config.showStyle.DVEStyles, parsedCue.template)
	if (!rawTemplate) {
		context.notifyUserWarning(`Could not find template ${parsedCue.template}`)
		return
	}

	if (!TemplateIsValid(rawTemplate.DVEJSON)) {
		context.notifyUserWarning(`Invalid DVE template ${parsedCue.template}`)
		return
	}

	const adlibContent = OfftubeMakeContentDVE(
		context,
		config,
		partDefinition,
		parsedCue,
		rawTemplate,
		AddParentClass(config, partDefinition),
		true
	)

	const pieceContent = OfftubeMakeContentDVE(
		context,
		config,
		partDefinition,
		parsedCue,
		rawTemplate,
		AddParentClass(config, partDefinition),
		false
	)

	if (adlibContent.valid && pieceContent.valid) {
		let start = parsedCue.start ? CalculateTime(parsedCue.start) : 0
		start = start ? start : 0
		const end = parsedCue.end ? CalculateTime(parsedCue.end) : undefined
		pieces.push(
			literal<IBlueprintPiece>({
				externalId: partDefinition.externalId,
				name: `${parsedCue.template}`,
				enable: {
					start,
					...(end ? { duration: end - start } : {})
				},
				outputLayerId: SharedOutputLayers.PGM,
				sourceLayerId: OfftubeSourceLayer.PgmDVE,
				lifespan: PieceLifespan.WithinPart,
				toBeQueued: true,
				content: {
					...pieceContent.content,
					timelineObjects: [...pieceContent.content.timelineObjects]
				},
				prerollDuration: Number(config.studio.CasparPrerollDuration) || 0,
				metaData: literal<PieceMetaData & DVEPieceMetaData>({
					mediaPlayerSessions: [partDefinition.segmentExternalId],
					sources: parsedCue.sources,
					config: rawTemplate,
					userData: literal<ActionSelectDVE>({
						type: AdlibActionType.SELECT_DVE,
						config: parsedCue,
						videoId: partDefinition.fields.videoId,
						segmentExternalId: partDefinition.segmentExternalId
					})
				}),
				tags: [
					GetTagForDVE(partDefinition.segmentExternalId, parsedCue.template, parsedCue.sources),
					GetTagForDVENext(partDefinition.segmentExternalId, parsedCue.template, parsedCue.sources),
					TallyTags.DVE_IS_LIVE
				]
			})
		)

		const userData = literal<ActionSelectDVE>({
			type: AdlibActionType.SELECT_DVE,
			config: parsedCue,
			videoId: partDefinition.fields.videoId,
			segmentExternalId: partDefinition.segmentExternalId
		})
		actions.push(
			literal<IBlueprintActionManifest>({
				externalId: generateExternalId(context, userData),
				actionId: AdlibActionType.SELECT_DVE,
				userData,
				userDataManifest: {},
				display: {
					_rank: rank,
					sourceLayerId: OfftubeSourceLayer.PgmDVE,
					outputLayerId: OfftubeOutputLayers.PGM,
					label: t(`${partDefinition.storyName}`),
					tags: [AdlibTags.ADLIB_KOMMENTATOR, ...(adlib ? [AdlibTags.ADLIB_FLOW_PRODUCER] : [])],
					noHotKey: !adlib,
					content: literal<SplitsContent>({
						...pieceContent.content
					}),
					currentPieceTags: [GetTagForDVE(partDefinition.segmentExternalId, parsedCue.template, parsedCue.sources)],
					nextPieceTags: [GetTagForDVENext(partDefinition.segmentExternalId, parsedCue.template, parsedCue.sources)]
				}
			})
		)
	}
}
