import {
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	PartContext,
	PieceLifespan,
	PieceMetaData
} from 'tv-automation-sofie-blueprints-integration'
import {
	AddParentClass,
	CalculateTime,
	CueDefinitionDVE,
	GetDVETemplate,
	literal,
	PartDefinition,
	TemplateIsValid
} from 'tv2-common'
import { OfftubeMakeContentDVE } from '../content/OfftubeDVEContent'
import { OffTubeShowstyleBlueprintConfig } from '../helpers/config'
import { OffTubeSourceLayer } from '../layers'

export function OfftubeEvaluateDVE(
	context: PartContext,
	config: OffTubeShowstyleBlueprintConfig,
	pieces: IBlueprintPiece[],
	adlibPieces: IBlueprintAdLibPiece[],
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

	const pieceContent = OfftubeMakeContentDVE(
		context,
		config,
		partDefinition,
		parsedCue,
		rawTemplate,
		AddParentClass(partDefinition)
	)

	if (adlibContent.valid && pieceContent.valid) {
		adlibPieces.push(
			literal<IBlueprintAdLibPiece>({
				_rank: rank || 0,
				externalId: partDefinition.externalId,
				name: `${parsedCue.template}`,
				outputLayerId: 'pgm',
				sourceLayerId: OffTubeSourceLayer.SelectedAdLibDVE,
				infiniteMode: PieceLifespan.OutOnNextSegment,
				toBeQueued: true,
				canCombineQueue: true,
				content: adlibContent.content,
				adlibPreroll: Number(config.studio.CasparPrerollDuration) || 0,
				tags: ['flow_producer']
			})
		)
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
				sourceLayerId: OffTubeSourceLayer.PgmDVE,
				infiniteMode: PieceLifespan.OutOnNextPart,
				toBeQueued: true,
				content: pieceContent.content,
				adlibPreroll: Number(config.studio.CasparPrerollDuration) || 0,
				metaData: literal<PieceMetaData>({
					mediaPlayerSessions: [partDefinition.segmentExternalId]
				})
			})
		)
	}
}
