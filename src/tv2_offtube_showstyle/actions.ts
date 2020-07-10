import {
	ActionExecutionContext,
	ActionUserData,
	IBlueprintPart,
	IBlueprintPiece,
	PieceLifespan
} from 'tv-automation-sofie-blueprints-integration'
import {
	ActionSelectFullGrafik,
	executeAction,
	GetFullGrafikTemplateName,
	getPiecesToPreserve,
	literal
} from 'tv2-common'
import { OfftubeAtemLLayer, OfftubeCasparLLayer, OfftubeSisyfosLLayer } from '../tv2_offtube_studio/layers'
import { OFFTUBE_DVE_GENERATOR_OPTIONS } from './content/OfftubeDVEContent'
import { CreateFullContent, CreateFullPiece } from './cues/OfftubeGrafikCaspar'
import { parseConfig } from './helpers/config'
import { OfftubeEvaluateCues } from './helpers/EvaluateCues'
import { OfftubeOutputLayers, OfftubeSourceLayer } from './layers'
import { postProcessPieceTimelineObjects } from './postProcessTimelineObjects'

const SELECTED_ADLIB_LAYERS = [
	OfftubeSourceLayer.SelectedAdLibDVE,
	OfftubeSourceLayer.SelectedAdLibServer,
	OfftubeSourceLayer.SelectedAdLibVoiceOver,
	OfftubeSourceLayer.SelectedAdlibGraphicsFull
]

export function executeActionOfftube(
	context: ActionExecutionContext,
	actionId: string,
	userData: ActionUserData
): void {
	executeAction(
		context,
		{
			parseConfig,
			postProcessPieceTimelineObjects,
			EvaluateCues: OfftubeEvaluateCues,
			DVEGeneratorOptions: OFFTUBE_DVE_GENERATOR_OPTIONS,
			SourceLayers: {
				Server: OfftubeSourceLayer.PgmServer,
				VO: OfftubeSourceLayer.PgmVoiceOver,
				DVE: OfftubeSourceLayer.PgmDVE,
				Cam: OfftubeSourceLayer.PgmCam,
				Live: OfftubeSourceLayer.PgmLive,
				Effekt: OfftubeSourceLayer.PgmJingle
			},
			OutputLayer: {
				PGM: OfftubeOutputLayers.PGM
			},
			LLayer: {
				Caspar: {
					ClipPending: OfftubeCasparLLayer.CasparPlayerClipPending,
					Effekt: OfftubeCasparLLayer.CasparPlayerJingle
				},
				Sisyfos: {
					ClipPending: OfftubeSisyfosLLayer.SisyfosSourceClipPending,
					Effekt: OfftubeSisyfosLLayer.SisyfosSourceJingle
				},
				Atem: {
					MEProgram: OfftubeAtemLLayer.AtemMEProgram,
					MEClean: OfftubeAtemLLayer.AtemMEClean,
					Next: OfftubeAtemLLayer.AtemMENext,
					ServerLookaheadAUX: OfftubeAtemLLayer.AtemAuxServerLookahead,
					SSrcDefault: OfftubeAtemLLayer.AtemSSrcDefault,
					Effekt: OfftubeAtemLLayer.AtemDSKGraphics
				}
			},
			SelectedAdlibs: {
				SourceLayer: {
					Server: OfftubeSourceLayer.SelectedAdLibServer,
					VO: OfftubeSourceLayer.SelectedAdLibVoiceOver,
					DVE: OfftubeSourceLayer.SelectedAdLibDVE,
					GFXFull: OfftubeSourceLayer.SelectedAdlibGraphicsFull
				},
				OutputLayer: { SelectedAdLib: OfftubeOutputLayers.SELECTED_ADLIB },
				SELECTED_ADLIB_LAYERS
			},
			ServerAudioLayers: [
				OfftubeSisyfosLLayer.SisyfosSourceClipPending,
				OfftubeSisyfosLLayer.SisyfosSourceServerA,
				OfftubeSisyfosLLayer.SisyfosSourceServerB
			],
			executeActionSelectFull
		},
		actionId,
		userData
	)
}

function executeActionSelectFull(context: ActionExecutionContext, _actionId: string, userData: ActionSelectFullGrafik) {
	const config = parseConfig(context)

	const template = GetFullGrafikTemplateName(config, userData.template)

	const externalId = `adlib-action_${context.getHashId(`cut_to_kam_${template}`)}`

	const part = literal<IBlueprintPart>({
		externalId,
		title: `Full ${template}`,
		metaData: {},
		expectedDuration: 0,
		prerollDuration: config.studio.CasparPrerollDuration,
		transitionKeepaliveDuration: config.studio.FullKeepAliveDuration
	})

	const fullPiece = CreateFullPiece(config, externalId, template)

	postProcessPieceTimelineObjects(context, config, fullPiece, false)

	const fullDataStore = literal<IBlueprintPiece>({
		_id: '',
		externalId,
		name: template,
		enable: {
			start: 0
		},
		outputLayerId: OfftubeOutputLayers.SELECTED_ADLIB,
		sourceLayerId: OfftubeSourceLayer.SelectedAdlibGraphicsFull,
		infiniteMode: PieceLifespan.OutOnNextSegment,
		metaData: {
			userData
		},
		content: {
			...CreateFullContent(config, template),
			timelineObjects: []
		}
	})

	context.queuePart(part, [
		fullPiece,
		fullDataStore,
		...getPiecesToPreserve(context, SELECTED_ADLIB_LAYERS, [OfftubeSourceLayer.SelectedAdlibGraphicsFull])
	])
}
