import { HackPartMediaObjectSubscription, IBlueprintActionManifest } from 'blueprints-integration'
import {
	ActionSelectDVE,
	CreateAdlibServer,
	CueDefinitionAdLib,
	CueDefinitionDVE,
	generateExternalId,
	GetDVETemplate,
	getUniquenessIdDVE,
	PartDefinition,
	ShowStyleContext,
	t,
	TemplateIsValid
} from 'tv2-common'
import { AdlibActionType, AdlibTags, CueType, SharedOutputLayer } from 'tv2-constants'
import { GalleryBlueprintConfig } from '../../../tv2_afvd_showstyle/helpers/config'
import { CasparLLayer, SisyfosLLAyer } from '../../../tv2_afvd_studio/layers'
import { SourceLayer } from '../../layers'
import { MakeContentDVE } from '../content/dve'

export async function EvaluateAdLib(
	context: ShowStyleContext<GalleryBlueprintConfig>,
	actions: IBlueprintActionManifest[],
	mediaSubscriptions: HackPartMediaObjectSubscription[],
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

		actions.push(
			await CreateAdlibServer(
				context,
				rank,
				partDefinition,
				file,
				false,
				true,
				{
					SourceLayer: {
						PgmServer: SourceLayer.PgmServer,
						SelectedServer: SourceLayer.SelectedServer
					},
					Caspar: {
						ClipPending: CasparLLayer.CasparPlayerClipPending
					},
					Sisyfos: {
						ClipPending: SisyfosLLAyer.SisyfosSourceClipPending
					}
				},
				true
			)
		)

		mediaSubscriptions.push({ mediaId: file.toUpperCase() })
	} else {
		// DVE
		if (!parsedCue.variant) {
			return
		}

		const rawTemplate = GetDVETemplate(context.config.showStyle.DVEStyles, parsedCue.variant)
		if (!rawTemplate) {
			context.core.notifyUserWarning(`Could not find template ${parsedCue.variant}`)
			return
		}

		if (!TemplateIsValid(rawTemplate.DVEJSON)) {
			context.core.notifyUserWarning(`Invalid DVE template ${parsedCue.variant}`)
			return
		}

		const cueDVE: CueDefinitionDVE = {
			type: CueType.DVE,
			template: parsedCue.variant,
			sources: parsedCue.inputs ? parsedCue.inputs : {},
			labels: parsedCue.bynavn ? parsedCue.bynavn : [],
			iNewsCommand: 'DVE'
		}

		const content = MakeContentDVE(context, partDefinition, cueDVE, rawTemplate)

		const userData: ActionSelectDVE = {
			type: AdlibActionType.SELECT_DVE,
			config: cueDVE,
			name: `DVE: ${cueDVE.template}`,
			videoId: partDefinition.fields.videoId,
			segmentExternalId: partDefinition.segmentExternalId
		}
		actions.push({
			externalId: generateExternalId(context.core, userData),
			actionId: AdlibActionType.SELECT_DVE,
			userData,
			userDataManifest: {},
			display: {
				sourceLayerId: SourceLayer.PgmDVE,
				outputLayerId: SharedOutputLayer.PGM,
				uniquenessId: getUniquenessIdDVE(cueDVE),
				label: t(`${partDefinition.storyName}`),
				tags: [AdlibTags.ADLIB_FLOW_PRODUCER],
				content: content.content
			}
		})
	}
}
