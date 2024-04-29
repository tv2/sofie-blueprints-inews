import { IBlueprintActionManifest, IBlueprintPiece, PieceLifespan } from 'blueprints-integration'
import {
	ActionSelectDVE,
	calculateTime,
	CueDefinitionDVE,
	DVEPieceMetaData,
	generateExternalId,
	GetDVETemplate,
	getUniquenessIdDVE,
	literal,
	PartDefinition,
	ShowStyleContext,
	t,
	TemplateIsValid
} from 'tv2-common'
import { AdlibActionType, AdlibTags, SharedOutputLayer } from 'tv2-constants'
import { Tv2OutputLayer } from '../../../tv2-constants/tv2-output-layer'
import { Tv2PieceType } from '../../../tv2-constants/tv2-piece-type'
import { GalleryBlueprintConfig } from '../../../tv2_afvd_showstyle/helpers/config'
import { SourceLayer } from '../../../tv2_afvd_showstyle/layers'
import { MakeContentDVE } from '../content/dve'

export function EvaluateDVE(
	context: ShowStyleContext<GalleryBlueprintConfig>,
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

	const rawTemplate = GetDVETemplate(context.config.showStyle.DVEStyles, parsedCue.template)
	if (!rawTemplate) {
		context.core.notifyUserWarning(`Could not find template ${parsedCue.template}`)
		return
	}

	if (!TemplateIsValid(rawTemplate.DVEJSON)) {
		context.core.notifyUserWarning(`Invalid DVE template ${parsedCue.template}`)
		return
	}

	const content = MakeContentDVE(context, partDefinition, parsedCue, rawTemplate)

	if (content.valid) {
		if (adlib) {
			const userData: ActionSelectDVE = {
				type: AdlibActionType.SELECT_DVE,
				config: parsedCue,
				name: `${partDefinition.storyName} DVE: ${parsedCue.template}`,
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
					outputLayerId: SharedOutputLayer.PGM,
					sourceLayerId: SourceLayer.PgmDVE,
					label: t(`${partDefinition.storyName} DVE: ${parsedCue.template}`),
					tags: [AdlibTags.ADLIB_FLOW_PRODUCER],
					content: content.content,
					uniquenessId: getUniquenessIdDVE(parsedCue)
				}
			})
		} else {
			let start = parsedCue.start ? calculateTime(parsedCue.start) : 0
			start = start ? start : 0
			const end = parsedCue.end ? calculateTime(parsedCue.end) : undefined
			const pieceName = `DVE: ${parsedCue.template}`
			pieces.push(
				literal<IBlueprintPiece<DVEPieceMetaData>>({
					externalId: partDefinition.externalId,
					name: pieceName,
					enable: {
						start,
						...(end ? { duration: end - start } : {})
					},
					outputLayerId: SharedOutputLayer.PGM,
					sourceLayerId: SourceLayer.PgmDVE,
					lifespan: PieceLifespan.WithinPart,
					toBeQueued: true,
					content: content.content,
					prerollDuration: Number(context.config.studio.CasparPrerollDuration) || 0,
					metaData: {
						splitScreen: content.splitScreenPieceActionMetadata,
						type: Tv2PieceType.SPLIT_SCREEN,
						outputLayer: Tv2OutputLayer.PROGRAM,
						mediaPlayerSessions: [partDefinition.segmentExternalId],
						sources: parsedCue.sources,
						config: rawTemplate,
						userData: {
							type: AdlibActionType.SELECT_DVE,
							config: parsedCue,
							name: pieceName,
							videoId: partDefinition.fields.videoId,
							segmentExternalId: partDefinition.segmentExternalId
						}
					}
				})
			)
		}
	}
}
