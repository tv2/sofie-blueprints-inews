import { ActionUserData, IActionExecutionContext } from 'blueprints-integration'
import { executeAction, ServerSelectMode } from 'tv2-common'
import { OfftubeCasparLLayer, OfftubeSisyfosLLayer } from '../tv2_offtube_studio/layers'
import { QBOX_UNIFORM_CONFIG } from '../tv2_offtube_studio/uniformConfig'
import { OFFTUBE_DVE_GENERATOR_OPTIONS } from './content/OfftubeDVEContent'
import { createJingleContentOfftube } from './cues/OfftubeJingle'
import { OfftubeEvaluateCues } from './helpers/EvaluateCues'
import { OfftubeOutputLayers, OfftubeSourceLayer } from './layers'

const SELECTED_ADLIB_LAYERS = [
	OfftubeSourceLayer.SelectedAdLibDVE,
	OfftubeSourceLayer.SelectedServer,
	OfftubeSourceLayer.SelectedVoiceOver,
	OfftubeSourceLayer.SelectedAdlibGraphicsFull,
	OfftubeSourceLayer.SelectedAdlibJingle
]

export async function executeActionOfftube(
	context: IActionExecutionContext,
	actionId: string,
	userData: ActionUserData
): Promise<void> {
	await executeAction(
		context,
		QBOX_UNIFORM_CONFIG,
		{
			EvaluateCues: OfftubeEvaluateCues,
			DVEGeneratorOptions: OFFTUBE_DVE_GENERATOR_OPTIONS,
			SourceLayers: {
				Server: OfftubeSourceLayer.PgmServer,
				VO: OfftubeSourceLayer.PgmVoiceOver,
				DVE: OfftubeSourceLayer.PgmDVE,
				DVEAdLib: OfftubeSourceLayer.PgmDVEAdLib,
				Cam: OfftubeSourceLayer.PgmCam,
				Live: OfftubeSourceLayer.PgmLive,
				Effekt: OfftubeSourceLayer.PgmJingle,
				Ident: OfftubeSourceLayer.PgmGraphicsIdent,
				Continuity: OfftubeSourceLayer.PgmContinuity,
				Wall: OfftubeSourceLayer.WallGraphics
			},
			LLayer: {
				Caspar: {
					ClipPending: OfftubeCasparLLayer.CasparPlayerClipPending,
					Effekt: OfftubeCasparLLayer.CasparPlayerJingle
				},
				Sisyfos: {
					ClipPending: OfftubeSisyfosLLayer.SisyfosSourceClipPending,
					Effekt: OfftubeSisyfosLLayer.SisyfosSourceJingle,
					StudioMics: OfftubeSisyfosLLayer.SisyfosGroupStudioMics
				}
			},
			SelectedAdlibs: {
				SourceLayer: {
					Server: OfftubeSourceLayer.SelectedServer,
					VO: OfftubeSourceLayer.SelectedVoiceOver,
					DVE: OfftubeSourceLayer.SelectedAdLibDVE,
					Effekt: OfftubeSourceLayer.SelectedAdlibJingle
				},
				OutputLayer: { SelectedAdLib: OfftubeOutputLayers.SELECTED_ADLIB },
				SELECTED_ADLIB_LAYERS
			},
			createJingleContent: createJingleContentOfftube,
			serverActionSettings: {
				defaultTriggerMode: ServerSelectMode.RESET
			}
		},
		actionId,
		userData
	)
}
