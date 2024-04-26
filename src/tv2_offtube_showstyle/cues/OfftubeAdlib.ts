import { HackPartMediaObjectSubscription, IBlueprintActionManifest, SplitsContent } from 'blueprints-integration'
import {
	ActionSelectDVE,
	CreateAdlibServer,
	CueDefinitionAdLib,
	CueDefinitionDVE,
	generateExternalId,
	GetDVETemplate,
	getUniquenessIdDVE,
	literal,
	PartDefinition,
	SegmentContext,
	t,
	TemplateIsValid
} from 'tv2-common'
import { AdlibActionType, AdlibTags, CueType } from 'tv2-constants'
import { OfftubeCasparLLayer, OfftubeSisyfosLLayer } from '../../tv2_offtube_studio/layers'
import { OfftubeMakeContentDVE } from '../content/OfftubeDVEContent'
import { OfftubeBlueprintConfig } from '../helpers/config'
import { OfftubeOutputLayers, OfftubeSourceLayer } from '../layers'

export async function OfftubeEvaluateAdLib(
	context: SegmentContext<OfftubeBlueprintConfig>,
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
						PgmServer: OfftubeSourceLayer.PgmServer,
						SelectedServer: OfftubeSourceLayer.SelectedServer
					},
					Caspar: {
						ClipPending: OfftubeCasparLLayer.CasparPlayerClipPending
					},
					Sisyfos: {
						ClipPending: OfftubeSisyfosLLayer.SisyfosSourceClipPending
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

		const adlibContent = OfftubeMakeContentDVE(context, partDefinition, cueDVE, rawTemplate)

		const userData: ActionSelectDVE = {
			type: AdlibActionType.SELECT_DVE,
			config: cueDVE,
			name: `DVE: ${cueDVE.template}`,
			videoId: partDefinition.fields.videoId,
			segmentExternalId: partDefinition.segmentExternalId
		}
		actions.push({
			externalId: `${partDefinition.segmentExternalId}_${generateExternalId(context.core, userData)}`,
			actionId: AdlibActionType.SELECT_DVE,
			userData,
			userDataManifest: {},
			display: {
				sourceLayerId: OfftubeSourceLayer.PgmDVE,
				outputLayerId: OfftubeOutputLayers.PGM,
				uniquenessId: getUniquenessIdDVE(cueDVE),
				label: t(`${partDefinition.storyName}`),
				tags: [AdlibTags.ADLIB_KOMMENTATOR, AdlibTags.ADLIB_FLOW_PRODUCER],
				content: literal<SplitsContent>({
					...adlibContent.content
				})
			}
		})
	}
}
