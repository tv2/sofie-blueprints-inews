import {
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	PieceLifespan,
	SplitsContent
} from 'tv-automation-sofie-blueprints-integration'
import {
	ActionSelectDVE,
	AddParentClass,
	CalculateTime,
	CueDefinitionDVE,
	DVEPieceMetaData,
	GetDVETemplate,
	GetTagForDVE,
	GetTagForDVENext,
	literal,
	PartContext2,
	PartDefinition,
	PieceMetaData,
	TemplateIsValid
} from 'tv2-common'
import { AdlibActionType, AdlibTags, TallyTags } from 'tv2-constants'
import { OfftubeMakeContentDVE } from '../content/OfftubeDVEContent'
import { OfftubeShowstyleBlueprintConfig } from '../helpers/config'
import { OfftubeOutputLayers, OfftubeSourceLayer } from '../layers'

export function OfftubeEvaluateDVE(
	context: PartContext2,
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
		context.warning(`Could not find template ${parsedCue.template}`)
		return
	}

	if (!TemplateIsValid(rawTemplate.DVEJSON)) {
		context.warning(`Invalid DVE template ${parsedCue.template}`)
		return
	}

	const adlibContent = OfftubeMakeContentDVE(
		context,
		config,
		partDefinition,
		parsedCue,
		rawTemplate,
		AddParentClass(partDefinition),
		true
	)

	const pieceContent = OfftubeMakeContentDVE(
		context,
		config,
		partDefinition,
		parsedCue,
		rawTemplate,
		AddParentClass(partDefinition),
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
				outputLayerId: 'pgm',
				sourceLayerId: OfftubeSourceLayer.PgmDVE,
				lifespan: PieceLifespan.WithinPart,
				toBeQueued: true,
				content: {
					...pieceContent.content,
					timelineObjects: [...pieceContent.content.timelineObjects]
				},
				adlibPreroll: Number(config.studio.CasparPrerollDuration) || 0,
				metaData: literal<PieceMetaData & DVEPieceMetaData>({
					mediaPlayerSessions: [partDefinition.segmentExternalId],
					sources: parsedCue.sources,
					config: rawTemplate,
					userData: literal<ActionSelectDVE>({
						type: AdlibActionType.SELECT_DVE,
						config: parsedCue,
						videoId: partDefinition.fields.videoId
					})
				}),
				tags: [
					GetTagForDVE(parsedCue.template, parsedCue.sources),
					GetTagForDVENext(parsedCue.template, parsedCue.sources),
					TallyTags.DVE_IS_LIVE
				]
			})
		)

		actions.push(
			literal<IBlueprintActionManifest>({
				actionId: AdlibActionType.SELECT_DVE,
				userData: literal<ActionSelectDVE>({
					type: AdlibActionType.SELECT_DVE,
					config: parsedCue,
					videoId: partDefinition.fields.videoId
				}),
				userDataManifest: {},
				display: {
					_rank: rank,
					sourceLayerId: OfftubeSourceLayer.PgmDVE,
					outputLayerId: OfftubeOutputLayers.PGM,
					label: `${partDefinition.storyName}`,
					tags: [AdlibTags.ADLIB_KOMMENTATOR, ...(adlib ? [AdlibTags.ADLIB_FLOW_PRODUCER] : [])],
					content: literal<SplitsContent>({
						...pieceContent.content,
						timelineObjects: []
					}),
					onAirTags: [GetTagForDVE(parsedCue.template, parsedCue.sources)],
					setNextTags: [GetTagForDVENext(parsedCue.template, parsedCue.sources)]
				}
			})
		)
	}
}
