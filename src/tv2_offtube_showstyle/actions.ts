import {
	ActionExecutionContext,
	ActionUserData,
	IBlueprintPart,
	IBlueprintPiece,
	PieceLifespan
} from 'tv-automation-sofie-blueprints-integration'
import {
	ActionSelectFullGrafik,
	CueDefinitionGraphic,
	executeAction,
	GetFullGrafikTemplateName,
	getPiecesToPreserve,
	GetTagForFullNext,
	GraphicPilot,
	literal
} from 'tv2-common'
import { CueType } from 'tv2-constants'
import {
	OfftubeAbstractLLayer,
	OfftubeAtemLLayer,
	OfftubeCasparLLayer,
	OfftubeSisyfosLLayer
} from '../tv2_offtube_studio/layers'
import { OFFTUBE_DVE_GENERATOR_OPTIONS } from './content/OfftubeDVEContent'
import { CreateFullContent, CreateFullPiece } from './cues/OfftubeGrafikCaspar'
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
	context: ActionExecutionContext,
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
				Effekt: OfftubeSourceLayer.PgmJingle
			},
			OutputLayer: {
				PGM: OfftubeOutputLayers.PGM,
				EFFEKT: OfftubeOutputLayers.JINGLE
			},
			LLayer: {
				Caspar: {
					ClipPending: OfftubeCasparLLayer.CasparPlayerClipPending,
					Effekt: OfftubeCasparLLayer.CasparPlayerJingle
				},
				Sisyfos: {
					ClipPending: OfftubeSisyfosLLayer.SisyfosSourceClipPending,
					Effekt: OfftubeSisyfosLLayer.SisyfosSourceJingle,
					StudioMics: OfftubeSisyfosLLayer.SisyfosGroupStudioMics,
					PersistedLevels: OfftubeSisyfosLLayer.SisyfosPersistedLevels
				},
				Atem: {
					MEProgram: OfftubeAtemLLayer.AtemMEProgram,
					MEClean: OfftubeAtemLLayer.AtemMEClean,
					Next: OfftubeAtemLLayer.AtemMENext,
					ServerLookaheadAUX: OfftubeAtemLLayer.AtemAuxServerLookahead,
					SSrcDefault: OfftubeAtemLLayer.AtemSSrcDefault,
					Effekt: OfftubeAtemLLayer.AtemDSKGraphics,
					cutOnclean: true
				},
				Abstract: {
					ServerEnable: OfftubeAbstractLLayer.OfftubeAbstractLLayerServerEnable
				}
			},
			SelectedAdlibs: {
				SourceLayer: {
					Server: OfftubeSourceLayer.SelectedServer,
					VO: OfftubeSourceLayer.SelectedVoiceOver,
					DVE: OfftubeSourceLayer.SelectedAdLibDVE,
					GFXFull: OfftubeSourceLayer.SelectedAdlibGraphicsFull,
					Effekt: OfftubeSourceLayer.SelectedAdlibJingle
				},
				OutputLayer: { SelectedAdLib: OfftubeOutputLayers.SELECTED_ADLIB },
				SELECTED_ADLIB_LAYERS
			},
			ServerAudioLayers: [
				OfftubeSisyfosLLayer.SisyfosSourceClipPending,
				OfftubeSisyfosLLayer.SisyfosSourceServerA,
				OfftubeSisyfosLLayer.SisyfosSourceServerB
			],
			StoppableGraphicsLayers: [], // TODO: Needs thought for offtubes
			executeActionSelectFull,
			createJingleContent: createJingleContentOfftube
		},
		actionId,
		userData
	)
}

function executeActionSelectFull(context: ActionExecutionContext, _actionId: string, userData: ActionSelectFullGrafik) {
	const config = getConfig(context)

	const template = GetFullGrafikTemplateName(config, userData.name)

	const externalId = `adlib-action_${context.getHashId(`cut_to_kam_${template}`)}`

	const part = literal<IBlueprintPart>({
		externalId,
		title: `Full ${template}`,
		metaData: {},
		expectedDuration: 0,
		prerollDuration: config.studio.CasparPrerollDuration,
		transitionKeepaliveDuration: config.studio.FullKeepAliveDuration
	})

	const cue = literal<CueDefinitionGraphic<GraphicPilot>>({
		type: CueType.Graphic,
		target: 'FULL',
		graphic: {
			type: 'pilot',
			name: userData.name,
			vcpid: userData.vcpid,
			continueCount: -1
		},
		iNewsCommand: ''
	})

	const fullPiece = CreateFullPiece(config, externalId, cue, userData.segmentExternalId)

	postProcessPieceTimelineObjects(context, config, fullPiece, false)

	const fullDataStore = literal<IBlueprintPiece>({
		externalId,
		name: template,
		enable: {
			start: 0
		},
		outputLayerId: OfftubeOutputLayers.SELECTED_ADLIB,
		sourceLayerId: OfftubeSourceLayer.SelectedAdlibGraphicsFull,
		lifespan: PieceLifespan.OutOnSegmentEnd,
		metaData: {
			userData
		},
		content: {
			...CreateFullContent(config, cue),
			timelineObjects: []
		},
		tags: [GetTagForFullNext(userData.segmentExternalId, userData.vcpid)]
	})

	context.queuePart(part, [
		fullPiece,
		fullDataStore,
		...getPiecesToPreserve(context, SELECTED_ADLIB_LAYERS, [OfftubeSourceLayer.SelectedAdlibGraphicsFull])
	])
}
