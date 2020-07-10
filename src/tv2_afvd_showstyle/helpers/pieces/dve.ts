import {
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	PieceLifespan,
	PieceMetaData
} from 'tv-automation-sofie-blueprints-integration'
import {
	AddParentClass,
	CalculateTime,
	CueDefinitionDVE,
	DVEPieceMetaData,
	GetDVETemplate,
	literal,
	PartContext2,
	PartDefinition,
	TemplateIsValid
} from 'tv2-common'
import * as _ from 'underscore'
import { BlueprintConfig } from '../../../tv2_afvd_showstyle/helpers/config'
import { SourceLayer } from '../../../tv2_afvd_showstyle/layers'
import { MakeContentDVE } from '../content/dve'

export function EvaluateDVE(
	context: PartContext2,
	config: BlueprintConfig,
	pieces: IBlueprintPiece[],
	adlibPieces: IBlueprintAdLibPiece[],
	_actions: IBlueprintActionManifest[],
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

	if (!TemplateIsValid(JSON.parse(rawTemplate.DVEJSON as string))) {
		context.warning(`Invalid DVE template ${parsedCue.template}`)
		return
	}

	const content = MakeContentDVE(
		context,
		config,
		partDefinition,
		parsedCue,
		rawTemplate,
		AddParentClass(partDefinition)
	)

	if (content.valid) {
		if (adlib) {
			adlibPieces.push(
				literal<IBlueprintAdLibPiece>({
					_rank: rank || 0,
					externalId: partDefinition.externalId,
					name: `${partDefinition.storyName} DVE: ${parsedCue.template}`,
					outputLayerId: 'pgm',
					sourceLayerId: SourceLayer.PgmDVE,
					infiniteMode: PieceLifespan.OutOnNextPart,
					toBeQueued: true,
					content: content.content,
					adlibPreroll: Number(config.studio.CasparPrerollDuration) || 0,
					metaData: literal<DVEPieceMetaData>({
						sources: parsedCue.sources,
						config: rawTemplate
					})
				})
			)
		} else {
			let start = parsedCue.start ? CalculateTime(parsedCue.start) : 0
			start = start ? start : 0
			const end = parsedCue.end ? CalculateTime(parsedCue.end) : undefined
			pieces.push(
				literal<IBlueprintPiece>({
					_id: '',
					externalId: partDefinition.externalId,
					name: `DVE: ${parsedCue.template}`,
					enable: {
						start,
						...(end ? { duration: end - start } : {})
					},
					outputLayerId: 'pgm',
					sourceLayerId: SourceLayer.PgmDVE,
					infiniteMode: PieceLifespan.OutOnNextPart,
					toBeQueued: true,
					content: content.content,
					adlibPreroll: Number(config.studio.CasparPrerollDuration) || 0,
					metaData: literal<PieceMetaData & DVEPieceMetaData>({
						mediaPlayerSessions: [partDefinition.segmentExternalId],
						sources: parsedCue.sources,
						config: rawTemplate
					})
				})
			)
		}
	}
}
