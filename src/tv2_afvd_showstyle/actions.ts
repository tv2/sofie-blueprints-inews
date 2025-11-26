import { ActionUserData, IActionExecutionContext } from 'blueprints-integration'
import { executeAction, ServerSelectMode } from 'tv2-common'
import { CasparLLayer, SisyfosLLAyer } from '../tv2_afvd_studio/layers'
import { GALLERY_UNIFORM_CONFIG } from '../tv2_afvd_studio/uniformConfig'
import { AFVD_DVE_GENERATOR_OPTIONS } from './helpers/content/dve'
import { EvaluateCues } from './helpers/pieces/evaluateCues'
import { createJingleContentAFVD } from './helpers/pieces/jingle'
import { SourceLayer } from './layers'

export async function executeActionAFVD(
	context: IActionExecutionContext,
	actionId: string,
	userData: ActionUserData,
	triggerMode?: string
): Promise<void> {
	await executeAction(
		context,
		GALLERY_UNIFORM_CONFIG,
		{
			EvaluateCues,
			DVEGeneratorOptions: AFVD_DVE_GENERATOR_OPTIONS,
			SourceLayers: {
				Server: SourceLayer.PgmServer,
				VO: SourceLayer.PgmVoiceOver,
				DVE: SourceLayer.PgmDVE,
				DVEAdLib: SourceLayer.PgmDVEAdLib,
				Cam: SourceLayer.PgmCam,
				Live: SourceLayer.PgmLive,
				Effekt: SourceLayer.PgmTransition,
				EVS: SourceLayer.PgmLocal,
				Ident: SourceLayer.PgmGraphicsIdent,
				Continuity: SourceLayer.PgmContinuity,
				Wall: SourceLayer.WallGraphics
			},
			LLayer: {
				Caspar: {
					ClipPending: CasparLLayer.CasparPlayerClipPending,
					Effekt: CasparLLayer.CasparPlayerJingle
				},
				Sisyfos: {
					ClipPending: SisyfosLLAyer.SisyfosSourceClipPending,
					Effekt: SisyfosLLAyer.SisyfosSourceJingle,
					StudioMics: SisyfosLLAyer.SisyfosGroupStudioMics
				}
			},
			SelectedAdlibs: {
				SourceLayer: {
					Server: SourceLayer.SelectedServer,
					VO: SourceLayer.SelectedVoiceOver
				},
				OutputLayer: {
					SelectedAdLib: 'sec'
				},
				SELECTED_ADLIB_LAYERS: [SourceLayer.SelectedServer, SourceLayer.SelectedVoiceOver]
			},
			createJingleContent: createJingleContentAFVD,
			serverActionSettings: {
				defaultTriggerMode: ServerSelectMode.RESUME
			}
		},
		actionId,
		userData,
		triggerMode
	)
}
