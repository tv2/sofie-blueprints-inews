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
	GetDVETemplate,
	literal,
	PartContext2,
	PartDefinition,
	PieceMetaData,
	TemplateIsValid
} from 'tv2-common'
import { AdlibActionType, AdlibTags, ControlClasses } from 'tv2-constants'
import { OfftubeMakeContentDVE } from '../content/OfftubeDVEContent'
import { OfftubeShowstyleBlueprintConfig } from '../helpers/config'
import { OfftubeOutputLayers, OfftubeSourceLayer } from '../layers'
import { makeofftubeDVEIDsUniqueForFlow } from './OfftubeAdlib'

export function OfftubeEvaluateDVE(
	context: PartContext2,
	config: OfftubeShowstyleBlueprintConfig,
	pieces: IBlueprintPiece[],
	adlibPieces: IBlueprintAdLibPiece[],
	actions: IBlueprintActionManifest[],
	partDefinition: PartDefinition,
	parsedCue: CueDefinitionDVE,
	_adlib?: boolean,
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

	if (!TemplateIsValid(JSON.parse(rawTemplate.DVEJSON as string))) {
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

	const adlibContentFlow = OfftubeMakeContentDVE(
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
		const dveAdlib = literal<IBlueprintAdLibPiece>({
			_rank: rank || 0,
			externalId: partDefinition.externalId,
			name: `${partDefinition.storyName}`,
			outputLayerId: 'selectedAdlib',
			sourceLayerId: OfftubeSourceLayer.SelectedAdLibDVE,
			infiniteMode: PieceLifespan.OutOnNextSegment,
			toBeQueued: true,
			canCombineQueue: true,
			content: {
				...adlibContent.content,
				timelineObjects: adlibContent.content.timelineObjects.map(tlObj => {
					return {
						...tlObj,
						classes: tlObj.classes ? [...tlObj.classes, ControlClasses.NOLookahead] : [ControlClasses.NOLookahead]
					}
				})
			},
			adlibPreroll: Number(config.studio.CasparPrerollDuration) || 0,
			tags: [AdlibTags.ADLIB_KOMMENTATOR]
		})

		adlibPieces.push(
			literal<IBlueprintAdLibPiece>({
				...dveAdlib,
				outputLayerId: 'pgm',
				sourceLayerId: OfftubeSourceLayer.PgmDVE,
				infiniteMode: PieceLifespan.OutOnNextPart,
				tags: [AdlibTags.ADLIB_FLOW_PRODUCER],
				additionalPieces: [],
				content: {
					...adlibContentFlow.content,
					timelineObjects: makeofftubeDVEIDsUniqueForFlow([...adlibContentFlow.content.timelineObjects])
				}
			})
		)

		let start = parsedCue.start ? CalculateTime(parsedCue.start) : 0
		start = start ? start : 0
		const end = parsedCue.end ? CalculateTime(parsedCue.end) : undefined
		pieces.push(
			literal<IBlueprintPiece>({
				_id: '',
				externalId: partDefinition.externalId,
				name: `${parsedCue.template}`,
				enable: {
					start,
					...(end ? { duration: end - start } : {})
				},
				outputLayerId: 'pgm',
				sourceLayerId: OfftubeSourceLayer.PgmDVE,
				infiniteMode: PieceLifespan.OutOnNextPart,
				toBeQueued: true,
				content: {
					...pieceContent.content,
					timelineObjects: [...pieceContent.content.timelineObjects]
				},
				adlibPreroll: Number(config.studio.CasparPrerollDuration) || 0,
				metaData: literal<PieceMetaData>({
					mediaPlayerSessions: [partDefinition.segmentExternalId]
				})
			})
		)

		actions.push(
			literal<IBlueprintActionManifest>({
				actionId: AdlibActionType.SELECT_DVE,
				userData: literal<ActionSelectDVE>({
					type: AdlibActionType.SELECT_DVE,
					config: parsedCue,
					part: partDefinition
				}),
				userDataManifest: {},
				display: {
					sourceLayerId: OfftubeSourceLayer.PgmDVE,
					outputLayerId: OfftubeOutputLayers.PGM,
					label: `${partDefinition.storyName} Action`,
					tags: [AdlibTags.ADLIB_KOMMENTATOR],
					content: literal<SplitsContent>({
						...pieceContent.content,
						timelineObjects: []
					})
				}
			})
		)
	}
}
