import { ActionExecutionContext, ActionUserData } from '@sofie-automation/blueprints-integration'
import { executeAction } from 'tv2-common'
import { AtemLLayer, CasparLLayer, SisyfosLLAyer } from '../tv2_afvd_studio/layers'
import { getConfig } from './helpers/config'
import { AFVD_DVE_GENERATOR_OPTIONS } from './helpers/content/dve'
import { EvaluateCues } from './helpers/pieces/evaluateCues'
import { pilotGeneratorSettingsAFVD } from './helpers/pieces/graphicPilot'
import { createJingleContentAFVD } from './helpers/pieces/jingle'
import { SourceLayer } from './layers'
import { postProcessPieceTimelineObjects } from './postProcessTimelineObjects'

export function executeActionAFVD(context: ActionExecutionContext, actionId: string, userData: ActionUserData): void {
	executeAction(
		context,
		{
			getConfig,
			postProcessPieceTimelineObjects,
			EvaluateCues,
			DVEGeneratorOptions: AFVD_DVE_GENERATOR_OPTIONS,
			SourceLayers: {
				Server: SourceLayer.PgmServer,
				VO: SourceLayer.PgmVoiceOver,
				DVE: SourceLayer.PgmDVE,
				DVEAdLib: SourceLayer.PgmDVEAdLib,
				Cam: SourceLayer.PgmCam,
				Live: SourceLayer.PgmLive,
				Effekt: SourceLayer.PgmJingle,
				EVS: SourceLayer.PgmLocal,
				Ident: SourceLayer.PgmGraphicsIdent,
				Continuity: SourceLayer.PgmContinuity
			},
			LLayer: {
				Caspar: {
					ClipPending: CasparLLayer.CasparPlayerClipPending,
					Effekt: CasparLLayer.CasparPlayerJingle
				},
				Sisyfos: {
					ClipPending: SisyfosLLAyer.SisyfosSourceClipPending,
					Effekt: SisyfosLLAyer.SisyfosSourceJingle,
					StudioMics: SisyfosLLAyer.SisyfosGroupStudioMics,
					PersistedLevels: SisyfosLLAyer.SisyfosPersistedLevels
				},
				Atem: {
					MEProgram: AtemLLayer.AtemMEProgram,
					MEClean: AtemLLayer.AtemMEClean,
					Next: AtemLLayer.AtemAuxLookahead,
					SSrcDefault: AtemLLayer.AtemSSrcDefault,
					cutOnclean: false
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
			ServerAudioLayers: [
				SisyfosLLAyer.SisyfosSourceClipPending,
				SisyfosLLAyer.SisyfosSourceServerA,
				SisyfosLLAyer.SisyfosSourceServerB
			],
			createJingleContent: createJingleContentAFVD,
			pilotGraphicSettings: pilotGeneratorSettingsAFVD
		},
		actionId,
		userData
	)
}
