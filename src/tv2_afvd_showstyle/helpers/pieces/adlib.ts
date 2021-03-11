import {
	HackPartMediaObjectSubscription,
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	PieceLifespan,
	SegmentContext
} from '@sofie-automation/blueprints-integration'
import {
	ActionSelectDVE,
	CreateAdlibServer,
	CueDefinitionAdLib,
	CueDefinitionDVE,
	DVEPieceMetaData,
	GetDVETemplate,
	getUniquenessIdDVE,
	literal,
	PartDefinition,
	PieceMetaData,
	TemplateIsValid
} from 'tv2-common'
import { AdlibActionType, CueType } from 'tv2-constants'
import { BlueprintConfig } from '../../../tv2_afvd_showstyle/helpers/config'
import { AtemLLayer, CasparLLayer, SisyfosLLAyer } from '../../../tv2_afvd_studio/layers'
import { SourceLayer } from '../../layers'
import { MakeContentDVE } from '../content/dve'

export function EvaluateAdLib(
	context: SegmentContext,
	config: BlueprintConfig,
	adLibPieces: IBlueprintAdLibPiece[],
	actions: IBlueprintActionManifest[],
	mediaSubscriptions: HackPartMediaObjectSubscription[],
	partId: string,
	parsedCue: CueDefinitionAdLib,
	partDefinition: PartDefinition,
	rank: number
) {
	if (parsedCue.variant.match(/server/i)) {
		// Create server AdLib
		const file = partDefinition.fields.videoId

		if (!file) {
			return
		}

		const sourceDuration = Math.max(
			(context.hackGetMediaObjectDuration(file) || 0) * 1000 - config.studio.ServerPostrollDuration,
			0
		)

		actions.push(
			CreateAdlibServer(
				config,
				rank,
				partDefinition,
				file,
				false,
				false,
				{
					SourceLayer: {
						PgmServer: SourceLayer.PgmServer,
						SelectedServer: SourceLayer.SelectedServer
					},
					Caspar: {
						ClipPending: CasparLLayer.CasparPlayerClipPending
					},
					Sisyfos: {
						ClipPending: SisyfosLLAyer.SisyfosSourceClipPending,
						StudioMicsGroup: SisyfosLLAyer.SisyfosGroupStudioMics
					},
					AtemLLayer: {
						MEPgm: AtemLLayer.AtemMEProgram
					},
					ATEM: {}
				},
				sourceDuration,
				true
			)
		)

		mediaSubscriptions.push({ mediaId: file.toUpperCase() })
	} else {
		// DVE
		if (!parsedCue.variant) {
			return
		}

		const rawTemplate = GetDVETemplate(config.showStyle.DVEStyles, parsedCue.variant)
		if (!rawTemplate) {
			context.warning(`Could not find template ${parsedCue.variant}`)
			return
		}

		if (!TemplateIsValid(rawTemplate.DVEJSON)) {
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
				uniquenessId: getUniquenessIdDVE(cueDVE),
				toBeQueued: true,
				content: content.content,
				invalid: !content.valid,
				lifespan: PieceLifespan.WithinPart,
				metaData: literal<PieceMetaData & DVEPieceMetaData>({
					stickySisyfosLevels: sticky,
					sources: cueDVE.sources,
					config: rawTemplate,
					userData: literal<ActionSelectDVE>({
						type: AdlibActionType.SELECT_DVE,
						config: cueDVE,
						videoId: partDefinition.fields.videoId,
						segmentExternalId: partDefinition.segmentExternalId
					})
				})
			})
		)
	}
}
