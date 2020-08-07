import {
	ActionExecutionContext,
	ActionUserData,
	IBlueprintPiece,
	PieceLifespan,
	TSR
} from 'tv-automation-sofie-blueprints-integration'
import { ActionClearGraphics, executeAction, GraphicLLayer, literal } from 'tv2-common'
import { TallyTags } from 'tv2-constants'
import _ = require('underscore')
import { AtemLLayer, CasparLLayer, SisyfosLLAyer } from '../tv2_afvd_studio/layers'
import { parseConfig } from './helpers/config'
import { AFVD_DVE_GENERATOR_OPTIONS } from './helpers/content/dve'
import { EvaluateCues } from './helpers/pieces/evaluateCues'
import { SourceLayer } from './layers'
import { postProcessPieceTimelineObjects } from './postProcessTimelineObjects'

export function executeActionAFVD(context: ActionExecutionContext, actionId: string, userData: ActionUserData): void {
	executeAction(
		context,
		{
			parseConfig,
			postProcessPieceTimelineObjects,
			EvaluateCues,
			DVEGeneratorOptions: AFVD_DVE_GENERATOR_OPTIONS,
			SourceLayers: {
				Server: SourceLayer.PgmServer,
				VO: SourceLayer.PgmVoiceOver,
				DVE: SourceLayer.PgmDVE,
				DVEAdLib: SourceLayer.PgmDVEAdlib,
				Cam: SourceLayer.PgmCam,
				Live: SourceLayer.PgmLive,
				Effekt: SourceLayer.PgmJingle
			},
			OutputLayer: {
				PGM: 'pgm',
				EFFEKT: 'jingle'
			},
			LLayer: {
				Caspar: {
					ClipPending: CasparLLayer.CasparPlayerClipPending,
					Effekt: CasparLLayer.CasparPlayerJingle
				},
				Sisyfos: {
					ClipPending: SisyfosLLAyer.SisyfosSourceClipPending,
					Effekt: SisyfosLLAyer.SisyfosSourceJingle
				},
				Atem: {
					MEProgram: AtemLLayer.AtemMEProgram,
					MEClean: AtemLLayer.AtemMEClean,
					Next: AtemLLayer.AtemAuxLookahead,
					SSrcDefault: AtemLLayer.AtemSSrcDefault,
					Effekt: AtemLLayer.AtemDSKEffect
				}
			},
			ServerAudioLayers: [
				SisyfosLLAyer.SisyfosSourceClipPending,
				SisyfosLLAyer.SisyfosSourceServerA,
				SisyfosLLAyer.SisyfosSourceServerB
			],
			executeActionClearGraphics
		},
		actionId,
		userData
	)
}

function executeActionClearGraphics(
	context: ActionExecutionContext,
	_actionId: string,
	_userData: ActionClearGraphics
) {
	context.stopPiecesOnLayers([
		SourceLayer.PgmGraphicsIdent,
		SourceLayer.PgmGraphicsIdentPersistent,
		SourceLayer.PgmGraphicsTop,
		SourceLayer.PgmGraphicsLower,
		SourceLayer.PgmGraphicsHeadline,
		SourceLayer.PgmGraphicsTema,
		SourceLayer.PgmGraphicsOverlay,
		SourceLayer.PgmPilotOverlay,
		SourceLayer.PgmGraphicsTLF
	])
	context.insertPiece(
		'current',
		literal<IBlueprintPiece>({
			_id: '',
			enable: {
				start: 0,
				duration: 2000
			},
			externalId: 'clearAllGFX',
			name: 'GFX Clear',
			sourceLayerId: SourceLayer.PgmAdlibVizCmd,
			outputLayerId: 'sec',
			infiniteMode: PieceLifespan.Normal,
			content: {
				timelineObjects: _.compact<TSR.TSRTimelineObj>([
					literal<TSR.TimelineObjVIZMSEClearAllElements>({
						id: '',
						enable: {
							start: 0
						},
						priority: 100,
						layer: GraphicLLayer.GraphicLLayerAdLibs,
						content: {
							deviceType: TSR.DeviceType.VIZMSE,
							type: TSR.TimelineContentTypeVizMSE.CLEAR_ALL_ELEMENTS,
							channelsToSendCommands: ['OVL1', 'FULL1', 'WALL1']
						}
					})
				])
			},
			tags: [TallyTags.GFX_CLEAR]
		})
	)
}
