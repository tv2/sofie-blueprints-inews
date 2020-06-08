import {
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	PartContext,
	PieceLifespan
} from 'tv-automation-sofie-blueprints-integration'
import { AddParentClass, CueDefinitionDVE, GetDVETemplate, literal, PartDefinition, TemplateIsValid } from 'tv2-common'
import { OfftubeMakeContentDVE } from '../content/OfftubeDVEContent'
import { OffTubeShowstyleBlueprintConfig } from '../helpers/config'
import { OffTubeSourceLayer } from '../layers'

export function OfftubeEvaluateDVE(
	context: PartContext,
	config: OffTubeShowstyleBlueprintConfig,
	_pieces: IBlueprintPiece[],
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

	if (!TemplateIsValid(rawTemplate.DVEJSON)) {
		context.warning(`Invalid DVE template ${parsedCue.template}`)
		return
	}

	const content = OfftubeMakeContentDVE(
		context,
		config,
		partDefinition,
		parsedCue,
		rawTemplate,
		AddParentClass(partDefinition)
	)

	if (content.valid) {
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
				content: content.content,
				adlibPreroll: Number(config.studio.CasparPrerollDuration) || 0
			})
		)
	}
}
