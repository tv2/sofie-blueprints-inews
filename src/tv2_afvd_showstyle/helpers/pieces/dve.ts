import {
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	ISegmentUserContext,
	PieceLifespan
} from '@tv2media/blueprints-integration'
import {
	ActionSelectDVE,
	AddParentClass,
	CalculateTime,
	CueDefinitionDVE,
	DVEPieceMetaData,
	generateExternalId,
	GetDVETemplate,
	getUniquenessIdDVE,
	literal,
	PartDefinition,
	t,
	TemplateIsValid
} from 'tv2-common'
import { AdlibActionType, AdlibTags, SharedOutputLayers } from 'tv2-constants'
import { BlueprintConfig } from '../../../tv2_afvd_showstyle/helpers/config'
import { SourceLayer } from '../../../tv2_afvd_showstyle/layers'
import { MakeContentDVE } from '../content/dve'

export function EvaluateDVE(
	context: ISegmentUserContext,
	config: BlueprintConfig,
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

	const content = MakeContentDVE(
		context,
		config,
		partDefinition,
		parsedCue,
		rawTemplate,
		AddParentClass(config, partDefinition),
		adlib
	)

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
				externalId: generateExternalId(context, userData),
				actionId: AdlibActionType.SELECT_DVE,
				userData,
				userDataManifest: {},
				display: {
					_rank: rank,
					outputLayerId: SharedOutputLayers.PGM,
					sourceLayerId: SourceLayer.PgmDVE,
					label: t(`${partDefinition.storyName} DVE: ${parsedCue.template}`),
					tags: [AdlibTags.ADLIB_FLOW_PRODUCER],
					content: content.content,
					uniquenessId: getUniquenessIdDVE(parsedCue)
				}
			})
		} else {
			let start = parsedCue.start ? CalculateTime(parsedCue.start) : 0
			start = start ? start : 0
			const end = parsedCue.end ? CalculateTime(parsedCue.end) : undefined
			const pieceName =  `DVE: ${parsedCue.template}`
			pieces.push(
				literal<IBlueprintPiece<DVEPieceMetaData>>({
					externalId: partDefinition.externalId,
					name: pieceName,
					enable: {
						start,
						...(end ? { duration: end - start } : {})
					},
					outputLayerId: SharedOutputLayers.PGM,
					sourceLayerId: SourceLayer.PgmDVE,
					lifespan: PieceLifespan.WithinPart,
					toBeQueued: true,
					content: content.content,
					prerollDuration: Number(config.studio.CasparPrerollDuration) || 0,
					metaData: {
						mediaPlayerSessions: [partDefinition.segmentExternalId],
						sources: parsedCue.sources,
						config: rawTemplate,
						userData: {
							type: AdlibActionType.SELECT_DVE,
							config: parsedCue,
							name: pieceName,
							videoId: partDefinition.fields.videoId,
							segmentExternalId: partDefinition.segmentExternalId
						},
						sisyfosPersistMetaData: {
							sisyfosLayers: []
						}
					}
				})
			)
		}
	}
}
