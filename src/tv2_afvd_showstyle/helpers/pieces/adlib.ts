import { IBlueprintAdLibPiece, PartContext } from 'tv-automation-sofie-blueprints-integration'
import {
	CreateAdlibServer,
	CueDefinitionAdLib,
	CueDefinitionDVE,
	GetDVETemplate,
	literal,
	PartDefinition,
	PieceMetaData,
	TemplateIsValid
} from 'tv2-common'
import { CueType, MEDIA_PLAYER_AUTO } from 'tv2-constants'
import { BlueprintConfig } from '../../../tv2_afvd_showstyle/helpers/config'
import { AtemLLayer, CasparLLayer, SisyfosLLAyer } from '../../../tv2_afvd_studio/layers'
import { SourceLayer } from '../../layers'
import { MakeContentDVE } from '../content/dve'

export function EvaluateAdLib(
	context: PartContext,
	config: BlueprintConfig,
	adLibPieces: IBlueprintAdLibPiece[],
	partId: string,
	parsedCue: CueDefinitionAdLib,
	partDefinition: PartDefinition,
	rank: number
) {
	if (parsedCue.variant.match(/server/i)) {
		// Create server AdLib
		const file = partDefinition.fields.videoId

		adLibPieces.push(
			CreateAdlibServer(config, rank, partId, MEDIA_PLAYER_AUTO, partDefinition, file, false, {
				Caspar: {
					ClipPending: CasparLLayer.CasparPlayerClipPending
				},
				Sisyfos: {
					ClipPending: SisyfosLLAyer.SisyfosSourceClipPending
				},
				ATEM: {
					MEPGM: AtemLLayer.AtemMEProgram
				},
				STICKY_LAYERS: config.stickyLayers,
				PgmServer: SourceLayer.PgmServer,
				PgmVoiceOver: SourceLayer.PgmVoiceOver
			})
		)
	} else {
		// DVE
		if (!parsedCue.variant) {
			return
		}

		const rawTemplate = GetDVETemplate(config.showStyle.DVEStyles, parsedCue.variant) // TODO - is this correct?
		if (!rawTemplate) {
			context.warning(`Could not find template ${parsedCue.variant}`)
			return
		}

		if (!TemplateIsValid(JSON.parse(rawTemplate.DVEJSON as string))) {
			context.warning(`Invalid DVE template ${parsedCue.variant}`)
			return
		}

		const cueDVE: CueDefinitionDVE = {
			type: CueType.DVE,
			template: parsedCue.variant,
			sources: parsedCue.inputs ? parsedCue.inputs : {},
			labels: parsedCue.bynavn ? [parsedCue.bynavn] : [],
			iNewsCommand: 'DVE'
		}

		const content = MakeContentDVE(context, config, partDefinition, cueDVE, rawTemplate, false, true)

		let sticky: { [key: string]: { value: number; followsPrevious: boolean } } = {}

		content.stickyLayers.forEach(layer => {
			sticky = {
				...sticky,
				[layer]: {
					value: 1,
					followsPrevious: false
				}
			}
		})

		adLibPieces.push(
			literal<IBlueprintAdLibPiece>({
				_rank: rank,
				externalId: partId,
				name: `DVE: ${parsedCue.variant}`,
				sourceLayerId: SourceLayer.PgmDVE,
				outputLayerId: 'pgm',
				toBeQueued: true,
				content: content.content,
				invalid: !content.valid,
				metaData: literal<PieceMetaData>({
					stickySisyfosLevels: sticky
				})
			})
		)
	}
}
