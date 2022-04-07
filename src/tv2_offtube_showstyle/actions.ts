import { ActionUserData, IActionExecutionContext } from '@tv2media/blueprints-integration'
import { executeAction } from 'tv2-common'
import { OfftubeAtemLLayer, OfftubeCasparLLayer, OfftubeSisyfosLLayer } from '../tv2_offtube_studio/layers'
import { OFFTUBE_DVE_GENERATOR_OPTIONS } from './content/OfftubeDVEContent'
import { pilotGeneratorSettingsOfftube } from './cues/OfftubeGraphics'
import { createJingleContentOfftube } from './cues/OfftubeJingle'
import { getConfig } from './helpers/config'
import { OfftubeEvaluateCues } from './helpers/EvaluateCues'
import { OfftubeOutputLayers, OfftubeSourceLayer } from './layers'
import { postProcessPieceTimelineObjects } from './postProcessTimelineObjects'

const SELECTED_ADLIB_LAYERS = [
	OfftubeSourceLayer.SelectedAdLibDVE,
	OfftubeSourceLayer.SelectedServer,
	OfftubeSourceLayer.SelectedVoiceOver,
	OfftubeSourceLayer.SelectedAdlibGraphicsFull,
	OfftubeSourceLayer.SelectedAdlibJingle
]

export function executeActionOfftube(
	context: IActionExecutionContext,
	actionId: string,
	userData: ActionUserData
): void {
	executeAction(
		context,
		{
			getConfig,
			postProcessPieceTimelineObjects,
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
				},
				Atem: {
					MEProgram: OfftubeAtemLLayer.AtemMEProgram,
					MEClean: OfftubeAtemLLayer.AtemMEClean,
					Next: OfftubeAtemLLayer.AtemMENext,
					ServerLookaheadAUX: OfftubeAtemLLayer.AtemAuxServerLookahead,
					SSrcDefault: OfftubeAtemLLayer.AtemSSrcDefault,
					cutOnclean: true
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
			pilotGraphicSettings: pilotGeneratorSettingsOfftube
		},
		actionId,
		userData
	)
}
