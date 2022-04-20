import {
	ActionUserData,
	GraphicsContent,
	HackPartMediaObjectSubscription,
	IActionExecutionContext,
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPart,
	IBlueprintPiece,
	IBlueprintPieceDB,
	IBlueprintPieceGeneric,
	IBlueprintPieceInstance,
	IShowStyleUserContext,
	PieceLifespan,
	SourceLayerType,
	SplitsContent,
	TSR,
	VTContent,
	WithTimeline
} from '@tv2media/blueprints-integration'
import {
	ActionClearGraphics,
	ActionCommentatorSelectDVE,
	ActionCommentatorSelectFull,
	ActionCommentatorSelectServer,
	ActionCutSourceToBox,
	ActionCutToCamera,
	ActionCutToRemote,
	ActionPlayGraphics,
	ActionSelectDVE,
	ActionSelectDVELayout,
	ActionSelectFullGrafik,
	ActionSelectServerClip,
	CalculateTime,
	CreateFullPiece,
	CreatePartServerBase,
	CueDefinition,
	CueDefinitionDVE,
	CueDefinitionGraphic,
	DVEOptions,
	DVEPieceMetaData,
	DVESources,
	EvaluateCuesOptions,
	executeWithContext,
	FindSourceInfoStrict,
	GetCameraMetaData,
	GetDVETemplate,
	GetEksternMetaData,
	GetFullGrafikTemplateName,
	GetLayersForCamera,
	GetLayersForEkstern,
	GetSisyfosTimelineObjForCamera,
	GetSisyfosTimelineObjForEkstern,
	GraphicPilot,
	IsTargetingOVL,
	ITV2ActionExecutionContext,
	literal,
	MakeContentDVE2,
	PartDefinition,
	PieceMetaData,
	TimelineBlueprintExt,
	TV2AdlibAction,
	TV2BlueprintConfigBase,
	TV2StudioConfigBase
} from 'tv2-common'
import {
	AdlibActionType,
	CueType,
	GraphicLLayer,
	SharedOutputLayers,
	SharedSourceLayers,
	TallyTags
} from 'tv2-constants'
import _ = require('underscore')
import { EnableServer } from '../content'
import { CreateFullDataStore, GetEnableForWall, PilotGeneratorSettings } from '../helpers'
import { InternalGraphic } from '../helpers/graphics/InternalGraphic'
import { GetJinglePartPropertiesFromTableValue } from '../jinglePartProperties'
import { CreateEffektForPartBase, CreateEffektForPartInner, CreateMixForPartInner } from '../parts'
import {
	GetTagForDVE,
	GetTagForDVENext,
	GetTagForJingle,
	GetTagForJingleNext,
	GetTagForKam,
	GetTagForLive,
	GetTagForTransition
} from '../pieces'
import { assertUnreachable } from '../util'
import {
	ActionCommentatorSelectJingle,
	ActionRecallLastDVE,
	ActionRecallLastLive,
	ActionSelectJingle,
	ActionTakeWithTransition
} from './actionTypes'

const STOPPABLE_GRAPHICS_LAYERS = [
	SharedSourceLayers.PgmGraphicsIdent,
	SharedSourceLayers.PgmGraphicsIdentPersistent,
	SharedSourceLayers.PgmGraphicsTop,
	SharedSourceLayers.PgmGraphicsLower,
	SharedSourceLayers.PgmGraphicsHeadline,
	SharedSourceLayers.PgmGraphicsTema,
	SharedSourceLayers.PgmGraphicsOverlay,
	SharedSourceLayers.PgmPilotOverlay,
	SharedSourceLayers.PgmGraphicsTLF
]

export interface ActionExecutionSettings<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
> {
	getConfig: (context: IShowStyleUserContext) => ShowStyleConfig
	postProcessPieceTimelineObjects: (
		context: IShowStyleUserContext,
		config: ShowStyleConfig,
		piece: IBlueprintPieceGeneric,
		isAdlib: boolean
	) => void
	EvaluateCues: (
		context: IShowStyleUserContext,
		config: ShowStyleConfig,
		part: IBlueprintPart,
		pieces: IBlueprintPiece[],
		adLibPieces: IBlueprintAdLibPiece[],
		actions: IBlueprintActionManifest[],
		mediaSubscriptions: HackPartMediaObjectSubscription[],
		cues: CueDefinition[],
		partDefinition: PartDefinition,
		options: EvaluateCuesOptions
	) => void
	DVEGeneratorOptions: DVEOptions
	SourceLayers: {
		Server: string
		VO: string
		DVE: string
		DVEAdLib?: string
		Cam: string
		Live: string
		Effekt: string
		Continuity: string
		EVS?: string
		/** Ident visual representation layer *not* the infinite layer */
		Ident: string
		Wall: string
	}
	LLayer: {
		Caspar: {
			ClipPending: string
			Effekt: string
		}
		Sisyfos: {
			ClipPending: string
			Effekt: string
			StudioMics: string
			PersistedLevels: string
		}
		Atem: {
			MEProgram: string
			MEClean: string
			Next: string
			ServerLookaheadAUX?: string
			SSrcDefault: string
			cutOnclean: boolean
		}
	}
	SelectedAdlibs: {
		SourceLayer: {
			Server: string
			VO: string
			DVE?: string
			Effekt?: string
		}
		OutputLayer: {
			SelectedAdLib: string
		}
		SELECTED_ADLIB_LAYERS: string[]
	}
	ServerAudioLayers: string[]
	createJingleContent: (
		config: ShowStyleConfig,
		file: string,
		alphaAtStart: number,
		loadFirstFrame: boolean,
		duration: number,
		alphaAtEnd: number
	) => WithTimeline<VTContent>
	pilotGraphicSettings: PilotGeneratorSettings
}

export function executeAction<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	coreContext: IActionExecutionContext,
	settings: ActionExecutionSettings<StudioConfig, ShowStyleConfig>,
	actionIdStr: string,
	userData: ActionUserData
): void {
	executeWithContext(coreContext, context => {
		const existingTransition = getExistingTransition(context, settings, 'next')

		const actionId = actionIdStr as AdlibActionType

		switch (actionId) {
			case AdlibActionType.SELECT_SERVER_CLIP:
				executeActionSelectServerClip(context, settings, actionId, userData as ActionSelectServerClip)
				break
			case AdlibActionType.SELECT_DVE:
				executeActionSelectDVE(context, settings, actionId, userData as ActionSelectDVE)
				break
			case AdlibActionType.SELECT_DVE_LAYOUT:
				executeActionSelectDVELayout(context, settings, actionId, userData as ActionSelectDVELayout)
				break
			case AdlibActionType.SELECT_FULL_GRAFIK:
				executeActionSelectFull(context, settings, actionId, userData as ActionSelectFullGrafik)
				break
			case AdlibActionType.SELECT_JINGLE:
				executeActionSelectJingle(context, settings, actionId, userData as ActionSelectJingle)
				break
			case AdlibActionType.CLEAR_GRAPHICS:
				executeActionClearGraphics(context, settings, actionId, userData as ActionClearGraphics)
				break
			case AdlibActionType.CUT_TO_CAMERA:
				executeActionCutToCamera(context, settings, actionId, userData as ActionCutToCamera)
				break
			case AdlibActionType.CUT_TO_REMOTE:
				executeActionCutToRemote(context, settings, actionId, userData as ActionCutToRemote)
				break
			case AdlibActionType.CUT_SOURCE_TO_BOX:
				executeActionCutSourceToBox(context, settings, actionId, userData as ActionCutSourceToBox)
				break
			case AdlibActionType.COMMENTATOR_SELECT_DVE:
				executeActionCommentatorSelectDVE(context, settings, actionId, userData as ActionCommentatorSelectDVE)
				break
			case AdlibActionType.COMMENTATOR_SELECT_SERVER:
				executeActionCommentatorSelectServer(context, settings, actionId, userData as ActionCommentatorSelectServer)
				break
			case AdlibActionType.COMMENTATOR_SELECT_FULL:
				executeActionCommentatorSelectFull(context, settings, actionId, userData as ActionCommentatorSelectFull)
				break
			case AdlibActionType.COMMENTATOR_SELECT_JINGLE:
				executeActionCommentatorSelectJingle(context, settings, actionId, userData as ActionCommentatorSelectJingle)
				break
			case AdlibActionType.TAKE_WITH_TRANSITION:
				executeActionTakeWithTransition(context, settings, actionId, userData as ActionTakeWithTransition)
				break
			case AdlibActionType.RECALL_LAST_LIVE:
				executeActionRecallLastLive(context, settings, actionId, userData as ActionRecallLastLive)
				break
			case AdlibActionType.RECALL_LAST_DVE:
				executeActionRecallLastDVE(context, settings, actionId, userData as ActionRecallLastDVE)
				break
			case AdlibActionType.PLAY_GRAPHICS:
				executeActionPlayGraphics(context, settings, actionId, userData as ActionPlayGraphics)
				break
			default:
				assertUnreachable(actionId)
				break
		}

		if (actionId !== AdlibActionType.TAKE_WITH_TRANSITION) {
			if (existingTransition) {
				executeActionTakeWithTransition(context, settings, AdlibActionType.TAKE_WITH_TRANSITION, existingTransition)
			}
		}
	})
}

// Cannot insert pieces with start "now", change to start 0
function sanitizePieceStart(piece: IBlueprintPiece): IBlueprintPiece {
	if (piece.enable.start === 'now') {
		piece.enable.start = 0
	}
	return piece
}

function getExistingTransition<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	context: ITV2ActionExecutionContext,
	settings: ActionExecutionSettings<StudioConfig, ShowStyleConfig>,
	part: 'current' | 'next'
): ActionTakeWithTransition | undefined {
	const existingTransition = context
		.getPieceInstances(part)
		.find(p => p.piece.sourceLayerId === settings.SourceLayers.Effekt)

	if (!existingTransition) {
		return
	}

	const transition = existingTransition.piece.name

	// Case sensitive! Blueprints will set these names correctly.
	const transitionProps = transition.match(/CUT|MIX (\d+)|EFFEKT (\d+)/)
	if (!transitionProps || !transitionProps[0]) {
		return
	}

	if (transitionProps[0].match(/CUT/)) {
		return literal<ActionTakeWithTransition>({
			type: AdlibActionType.TAKE_WITH_TRANSITION,
			variant: {
				type: 'cut'
			},
			takeNow: false
		})
	} else if (transitionProps[0].match(/MIX/) && transitionProps[1] !== undefined) {
		return literal<ActionTakeWithTransition>({
			type: AdlibActionType.TAKE_WITH_TRANSITION,
			variant: {
				type: 'mix',
				frames: Number(transitionProps[1])
			},
			takeNow: false
		})
	} else if (transitionProps[0].match(/EFFEKT/) && transitionProps[1] !== undefined) {
		return literal<ActionTakeWithTransition>({
			type: AdlibActionType.TAKE_WITH_TRANSITION,
			variant: {
				type: 'breaker',
				breaker: transitionProps[1].toString()
			},
			takeNow: false
		})
	} else {
		return
	}
}

function sanitizePieceId(piece: IBlueprintPieceDB): IBlueprintPiece {
	return _.omit(piece, ['_id', 'partId', 'infiniteId', 'playoutDuration'])
}

export function getPiecesToPreserve(
	context: ITV2ActionExecutionContext,
	adlibLayers: string[],
	ingoreLayers: string[]
): IBlueprintPiece[] {
	const currentPartSegmentId = context.getPartInstance('current')?.segmentId
	const nextPartSegmentId = context.getPartInstance('next')?.segmentId

	if (!currentPartSegmentId || !nextPartSegmentId) {
		return []
	}

	if (currentPartSegmentId !== nextPartSegmentId) {
		return []
	}

	return context
		.getPieceInstances('next')
		.filter(p => adlibLayers.includes(p.piece.sourceLayerId) && !ingoreLayers.includes(p.piece.sourceLayerId))
		.filter(p => !p.infinite?.fromPreviousPart && !p.infinite?.fromPreviousPlayhead)
		.map<IBlueprintPiece>(p => p.piece)
		.map(p => sanitizePieceStart(p))
		.map(p => sanitizePieceId(p as IBlueprintPieceDB))
}

function generateExternalId(context: ITV2ActionExecutionContext, actionId: string, args: string[]): string {
	return `adlib_action_${actionId}_${context.getHashId(args.join('_'), true)}`
}

function executeActionSelectServerClip<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	context: ITV2ActionExecutionContext,
	settings: ActionExecutionSettings<StudioConfig, ShowStyleConfig>,
	actionId: string,
	userData: ActionSelectServerClip,
	sessionToContinue?: string
) {
	const file = userData.file
	const partDefinition = userData.partDefinition
	const config = settings.getConfig(context)

	const externalId = generateExternalId(context, actionId, [file])

	const currentPiece = settings.SelectedAdlibs
		? context
				.getPieceInstances('current')
				.find(
					p => p.piece.sourceLayerId === (userData.voLayer ? settings.SourceLayers.VO : settings.SourceLayers.Server)
				)
		: undefined

	const basePart = CreatePartServerBase(
		context,
		config,
		partDefinition,
		{
			voLayer: userData.voLayer,
			voLevels: userData.voLevels,
			totalWords: 0,
			totalTime: 0,
			tapeTime: userData.duration / 1000,
			session: sessionToContinue ?? externalId,
			adLibPix: userData.adLibPix
		},
		{
			SourceLayer: {
				PgmServer: userData.voLayer ? settings.SourceLayers.VO : settings.SourceLayers.Server,
				SelectedServer: userData.voLayer
					? settings.SelectedAdlibs.SourceLayer.VO
					: settings.SelectedAdlibs.SourceLayer.Server
			},
			AtemLLayer: {
				MEPgm: settings.LLayer.Atem.cutOnclean ? settings.LLayer.Atem.MEClean : settings.LLayer.Atem.MEProgram,
				ServerLookaheadAux: settings.LLayer.Atem.ServerLookaheadAUX
			},
			Caspar: {
				ClipPending: settings.LLayer.Caspar.ClipPending
			},
			Sisyfos: {
				ClipPending: settings.LLayer.Sisyfos.ClipPending,
				StudioMicsGroup: settings.LLayer.Sisyfos.StudioMics
			},
			ATEM: {
				ServerLookaheadAux: settings.LLayer.Atem.ServerLookaheadAUX
			}
		}
	)

	const activeServerPiece = basePart.part.pieces.find(
		p => p.sourceLayerId === settings.SourceLayers.Server || p.sourceLayerId === settings.SourceLayers.VO
	)

	const serverDataStore = basePart.part.pieces.find(
		p =>
			p.sourceLayerId === settings.SelectedAdlibs.SourceLayer.Server ||
			p.sourceLayerId === settings.SelectedAdlibs.SourceLayer.VO
	)

	let part = basePart.part.part

	const grafikPieces: IBlueprintPiece[] = []
	const effektPieces: IBlueprintPiece[] = []

	part = {
		...part,
		...CreateEffektForPartBase(context, config, partDefinition, effektPieces, {
			sourceLayer: settings.SourceLayers.Effekt,
			sisyfosLayer: settings.LLayer.Sisyfos.Effekt,
			casparLayer: settings.LLayer.Caspar.Effekt
		})
	}

	settings.EvaluateCues(
		context,
		config,
		basePart.part.part,
		grafikPieces,
		[],
		[],
		[],
		partDefinition.cues,
		partDefinition,
		{
			excludeAdlibs: true,
			selectedCueTypes: [CueType.Graphic]
		}
	)

	if (basePart.invalid || !activeServerPiece || !serverDataStore) {
		context.notifyUserWarning(`Could not start server clip`)
		return
	}

	if (activeServerPiece.content && activeServerPiece.content.timelineObjects) {
		settings.postProcessPieceTimelineObjects(context, config, activeServerPiece, false)
	}

	context.queuePart(part, [
		activeServerPiece,
		serverDataStore,
		...grafikPieces,
		...(settings.SelectedAdlibs
			? getPiecesToPreserve(context, settings.SelectedAdlibs.SELECTED_ADLIB_LAYERS, [
					settings.SelectedAdlibs.SourceLayer.VO,
					settings.SelectedAdlibs.SourceLayer.Server
			  ])
			: []),
		...effektPieces
	])
	if (settings.SelectedAdlibs && !currentPiece) {
		context.stopPiecesOnLayers([
			userData.voLayer ? settings.SelectedAdlibs.SourceLayer.VO : settings.SelectedAdlibs.SourceLayer.Server
		])
	}
}

function dveContainsServer(sources: DVESources) {
	return (
		sources.INP1?.match(/SERVER/i) ||
		sources.INP2?.match(/SERVER/i) ||
		sources.INP3?.match(/SERVER/i) ||
		sources.INP4?.match(/SERVER/i)
	)
}

function executeActionSelectDVE<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	context: ITV2ActionExecutionContext,
	settings: ActionExecutionSettings<StudioConfig, ShowStyleConfig>,
	actionId: string,
	userData: ActionSelectDVE
) {
	const externalId = generateExternalId(context, actionId, [userData.config.template])

	const config = settings.getConfig(context)

	const parsedCue = userData.config

	const rawTemplate = GetDVETemplate(config.showStyle.DVEStyles, parsedCue.template)
	if (!rawTemplate) {
		context.notifyUserWarning(`DVE layout not recognised`)
		return
	}

	const graphicsTemplateContent: { [key: string]: string } = {}
	parsedCue.labels.forEach((label, i) => {
		graphicsTemplateContent[`locator${i + 1}`] = label
	})

	const pieceContent = MakeContentDVE2(
		context,
		config,
		rawTemplate,
		graphicsTemplateContent,
		parsedCue.sources,
		settings.DVEGeneratorOptions,
		undefined,
		false,
		userData.videoId,
		externalId
	)

	let start = parsedCue.start ? CalculateTime(parsedCue.start) : 0
	start = start ? start : 0
	const end = parsedCue.end ? CalculateTime(parsedCue.end) : undefined

	const metaData = literal<PieceMetaData & DVEPieceMetaData>({
		mediaPlayerSessions: dveContainsServer(parsedCue.sources) ? [externalId] : [],
		sources: parsedCue.sources,
		config: rawTemplate,
		userData
	})

	let dvePiece = literal<IBlueprintPiece>({
		externalId,
		name: `${parsedCue.template}`,
		enable: {
			start,
			...(end ? { duration: end - start } : {})
		},
		outputLayerId: SharedOutputLayers.PGM,
		sourceLayerId: settings.SourceLayers.DVE,
		lifespan: PieceLifespan.WithinPart,
		toBeQueued: true,
		content: {
			...pieceContent.content
		},
		adlibPreroll: Number(config.studio.CasparPrerollDuration) || 0,
		metaData,
		tags: [
			GetTagForDVE(userData.segmentExternalId, parsedCue.template, parsedCue.sources),
			GetTagForDVENext(userData.segmentExternalId, parsedCue.template, parsedCue.sources),
			TallyTags.DVE_IS_LIVE
		]
	})

	dvePiece = cutServerToBox(context, settings, dvePiece)

	startNewDVELayout(
		context,
		config,
		settings,
		dvePiece,
		pieceContent.content,
		metaData,
		parsedCue.template,
		parsedCue.sources,
		externalId,
		'next',
		'queue',
		GetTagForDVENext(userData.segmentExternalId, parsedCue.template, parsedCue.sources)
	)
}

function cutServerToBox<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	context: ITV2ActionExecutionContext,
	settings: ActionExecutionSettings<StudioConfig, ShowStyleConfig>,
	dvePiece: IBlueprintPiece
): IBlueprintPiece {
	// Check if DVE should continue server + copy server properties

	if (!dvePiece.metaData) {
		return dvePiece
	}

	const meta = dvePiece.metaData as DVEPieceMetaData

	if (!dveContainsServer(meta.sources)) {
		return dvePiece
	}

	if (dvePiece.content?.timelineObjects) {
		const currentPieces = context.getPieceInstances('current')
		const currentServer = currentPieces.find(
			p =>
				p.piece.sourceLayerId === settings.SelectedAdlibs?.SourceLayer.Server ||
				p.piece.sourceLayerId === settings.SelectedAdlibs?.SourceLayer.VO
		)

		if (!currentServer || !currentServer.piece.content?.timelineObjects) {
			context.notifyUserWarning(`No server is playing, cannot start DVE`)
			return dvePiece
		}

		// Find existing CasparCG object
		const existingCasparObj = (currentServer.piece.content.timelineObjects as TSR.TSRTimelineObj[]).find(
			obj => obj.layer === settings.LLayer.Caspar.ClipPending
		) as TSR.TimelineObjCCGMedia & TimelineBlueprintExt
		// Find existing sisyfos object
		const existingSisyfosObj = (currentServer.piece.content.timelineObjects as TSR.TSRTimelineObj[]).find(
			obj => obj.layer === settings.LLayer.Sisyfos.ClipPending
		) as TSR.TimelineObjSisyfosChannel & TimelineBlueprintExt
		// Find SSRC object in DVE piece
		const ssrcObjIndex = dvePiece.content?.timelineObjects
			? (dvePiece.content?.timelineObjects as TSR.TSRTimelineObj[]).findIndex(
					obj => obj.layer === settings.LLayer.Atem.SSrcDefault
			  )
			: -1

		if (
			!existingCasparObj ||
			!existingSisyfosObj ||
			ssrcObjIndex === -1 ||
			!existingCasparObj.metaData ||
			!existingCasparObj.metaData.mediaPlayerSession
		) {
			context.notifyUserWarning(`Failed to start DVE with server`)
			return dvePiece
		}

		const ssrcObj = (dvePiece.content.timelineObjects as Array<TSR.TSRTimelineObj & TimelineBlueprintExt>)[ssrcObjIndex]

		ssrcObj.metaData = {
			...ssrcObj.metaData,
			mediaPlayerSession: existingCasparObj.metaData.mediaPlayerSession
		}

		dvePiece.content.timelineObjects[ssrcObjIndex] = ssrcObj
		dvePiece.content.timelineObjects.push(EnableServer(existingCasparObj.metaData.mediaPlayerSession))

		if (!dvePiece.metaData) {
			dvePiece.metaData = {}
		}

		;(dvePiece.metaData as any).mediaPlayerSessions = [existingCasparObj.metaData.mediaPlayerSession]
	}

	return dvePiece
}

function executeActionSelectDVELayout<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	context: ITV2ActionExecutionContext,
	settings: ActionExecutionSettings<StudioConfig, ShowStyleConfig>,
	actionId: string,
	userData: ActionSelectDVELayout
) {
	const config = settings.getConfig(context)

	if (!settings.SourceLayers.DVEAdLib) {
		return
	}

	const sources: DVESources = {
		INP1: 'DEFAULT',
		INP2: 'DEFAULT',
		INP3: 'DEFAULT',
		INP4: 'DEFAULT'
	}

	const externalId = generateExternalId(context, actionId, [userData.config.DVEName])

	const nextPart = context.getPartInstance('next')

	const nextInstances = context.getPieceInstances('next')
	const nextDVE = nextInstances.find(p => p.piece.sourceLayerId === settings.SourceLayers.DVE)

	const meta = nextDVE?.piece.metaData as DVEPieceMetaData

	if (!nextPart || !nextDVE || !meta || nextPart.segmentId !== context.getPartInstance('current')?.segmentId) {
		const content = MakeContentDVE2(context, config, userData.config, {}, sources, settings.DVEGeneratorOptions)

		if (!content.valid) {
			return
		}

		const newMetaData = literal<DVEPieceMetaData>({
			sources,
			config: userData.config,
			userData: literal<ActionSelectDVE>({
				type: AdlibActionType.SELECT_DVE,
				config: literal<CueDefinitionDVE>({
					type: CueType.DVE,
					template: userData.config.DVEName,
					sources,
					labels: [],
					iNewsCommand: `DVE=${userData.config.DVEName}`
				}),
				videoId: undefined,
				segmentExternalId: ''
			})
		})

		let newDVEPiece = literal<IBlueprintPiece>({
			externalId,
			enable: {
				start: 0
			},
			lifespan: PieceLifespan.WithinPart,
			name: userData.config.DVEName,
			sourceLayerId: settings.SourceLayers.DVEAdLib,
			outputLayerId: SharedOutputLayers.PGM,
			metaData: newMetaData,
			content: content.content
		})

		newDVEPiece = cutServerToBox(context, settings, newDVEPiece)

		return startNewDVELayout(
			context,
			config,
			settings,
			newDVEPiece,
			content.content,
			newMetaData,
			userData.config.DVEName,
			sources,
			externalId,
			'next',
			'queue',
			GetTagForDVENext('', userData.config.DVEName, sources)
		)
	}

	const newMetaData2 = literal<PieceMetaData & DVEPieceMetaData>({
		...meta,
		config: userData.config
	})

	const pieceContent = MakeContentDVE2(context, config, userData.config, {}, meta.sources, settings.DVEGeneratorOptions)
	let dvePiece: IBlueprintPiece = {
		...nextDVE.piece,
		content: pieceContent.content,
		metaData: newMetaData2,
		tags: [
			GetTagForDVE('', userData.config.DVEName, sources),
			GetTagForDVENext('', userData.config.DVEName, sources),
			TallyTags.DVE_IS_LIVE
		]
	}

	dvePiece = cutServerToBox(context, settings, dvePiece)

	startNewDVELayout(
		context,
		config,
		settings,
		dvePiece,
		pieceContent.content,
		newMetaData2,
		userData.config.DVEName,
		sources,
		externalId,
		'next',
		{
			activeDVE: nextDVE._id
		},
		GetTagForDVENext('', userData.config.DVEName, sources)
	)
}

function startNewDVELayout<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	context: ITV2ActionExecutionContext,
	config: ShowStyleConfig,
	settings: ActionExecutionSettings<StudioConfig, ShowStyleConfig>,
	dvePiece: IBlueprintPiece,
	pieceContent: WithTimeline<SplitsContent>,
	meta: PieceMetaData & DVEPieceMetaData,
	templateName: string,
	_sources: CueDefinitionDVE['sources'],
	externalId: string,
	part: 'current' | 'next',
	replacePieceInstancesOrQueue: { activeDVE?: string; dataStore?: string } | 'queue',
	nextTag: string
) {
	settings.postProcessPieceTimelineObjects(context, config, dvePiece, false)

	const dveDataStore = settings.SelectedAdlibs.SourceLayer.DVE
		? literal<IBlueprintPiece>({
				externalId,
				name: templateName,
				enable: {
					start: 0
				},
				outputLayerId: settings.SelectedAdlibs.OutputLayer.SelectedAdLib,
				sourceLayerId: settings.SelectedAdlibs.SourceLayer.DVE,
				lifespan: PieceLifespan.OutOnSegmentEnd,
				metaData: meta,
				tags: [nextTag],
				content: {
					...pieceContent,
					// Take this
					timelineObjects: pieceContent.timelineObjects
						.filter(
							tlObj =>
								!(
									tlObj.content.deviceType === TSR.DeviceType.ATEM &&
									(tlObj as TSR.TimelineObjAtemAny).content.type === TSR.TimelineContentTypeAtem.ME
								) && tlObj.content.deviceType !== TSR.DeviceType.SISYFOS
						)
						.map(obj => ({ ...obj, priority: obj.priority ?? 1 / 2 }))
				}
		  })
		: undefined

	if (replacePieceInstancesOrQueue === 'queue') {
		const newPart = literal<IBlueprintPart>({
			externalId,
			title: templateName,
			metaData: {},
			expectedDuration: 0,
			prerollDuration: config.studio.CasparPrerollDuration
		})

		// If a DVE is not on air, but a layout is selected, stop the selected layout and replace with the new one.
		const onAirPiece = context
			.getPieceInstances('current')
			.find(p => p.piece.sourceLayerId === settings.SourceLayers.DVE)
		const dataPiece =
			settings.SelectedAdlibs &&
			context.getPieceInstances('current').find(p => p.piece.sourceLayerId === settings.SelectedAdlibs!.SourceLayer.DVE)

		if (onAirPiece === undefined && dataPiece !== undefined) {
			context.stopPieceInstances([dataPiece._id])
		}
		context.queuePart(newPart, [
			dvePiece,
			...(dveDataStore ? [dveDataStore] : []),
			...(settings.SelectedAdlibs
				? getPiecesToPreserve(
						context,
						settings.SelectedAdlibs.SELECTED_ADLIB_LAYERS,
						settings.SelectedAdlibs.SourceLayer.DVE ? [settings.SelectedAdlibs.SourceLayer.DVE] : []
				  )
				: [])
		])
		if (settings.SelectedAdlibs.SourceLayer.DVE) {
			context.stopPiecesOnLayers([settings.SelectedAdlibs.SourceLayer.DVE])
		}
	} else {
		if (replacePieceInstancesOrQueue.activeDVE) {
			context.updatePieceInstance(replacePieceInstancesOrQueue.activeDVE, dvePiece)
			context.updatePartInstance(part, { expectedDuration: 0 })
			if (dveDataStore) {
				if (replacePieceInstancesOrQueue.dataStore) {
					context.updatePieceInstance(replacePieceInstancesOrQueue.dataStore, dveDataStore)
				} else {
					context.insertPiece(part, dveDataStore)
				}
			}
		}
	}
}

function executeActionSelectJingle<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	context: ITV2ActionExecutionContext,
	settings: ActionExecutionSettings<StudioConfig, ShowStyleConfig>,
	actionId: string,
	userData: ActionSelectJingle
) {
	let file = ''

	const config = settings.getConfig(context)

	if (!config.showStyle.BreakerConfig) {
		context.notifyUserWarning(`Jingles have not been configured`)
		return
	}

	const externalId = generateExternalId(context, actionId, [userData.clip])

	const jingle = config.showStyle.BreakerConfig.find(brkr =>
		brkr.BreakerName ? brkr.BreakerName.toString().toUpperCase() === userData.clip.toUpperCase() : false
	)
	if (!jingle) {
		context.notifyUserWarning(`Jingle ${userData.clip} is not configured`)
		return
	} else {
		file = jingle.ClipName.toString()
	}

	const props = GetJinglePartPropertiesFromTableValue(config, jingle)

	const pieceContent = settings.createJingleContent(
		config,
		file,
		jingle.StartAlpha,
		jingle.LoadFirstFrame,
		jingle.Duration,
		jingle.EndAlpha
	)

	const piece = literal<IBlueprintPiece>({
		externalId: `${externalId}-JINGLE`,
		name: userData.clip,
		enable: {
			start: 0
		},
		lifespan: PieceLifespan.WithinPart,
		outputLayerId: SharedOutputLayers.JINGLE,
		sourceLayerId: settings.SourceLayers.Effekt,
		content: pieceContent,
		metaData: literal<PieceMetaData>({
			transition: {
				isJingle: true
			}
		}),
		tags: [
			GetTagForJingle(userData.segmentExternalId, userData.clip),
			GetTagForJingleNext(userData.segmentExternalId, userData.clip),
			TallyTags.JINGLE_IS_LIVE
		]
	})

	const jingleDataStore = settings.SelectedAdlibs.SourceLayer.Effekt
		? literal<IBlueprintPiece>({
				externalId,
				name: userData.clip,
				enable: {
					start: 0
				},
				outputLayerId: settings.SelectedAdlibs.OutputLayer.SelectedAdLib,
				sourceLayerId: settings.SelectedAdlibs.SourceLayer.Effekt,
				lifespan: PieceLifespan.WithinPart,
				metaData: {
					userData
				},
				content: {
					...pieceContent,
					timelineObjects: []
				},
				tags: [GetTagForJingleNext(userData.segmentExternalId, userData.clip)]
		  })
		: undefined

	settings.postProcessPieceTimelineObjects(context, config, piece, false)

	const part = literal<IBlueprintPart>({
		externalId,
		title: `JINGLE ${userData.clip}`,
		metaData: {},
		...props
	})

	context.queuePart(part, [
		piece,
		...(jingleDataStore ? [] : []),
		...(settings.SelectedAdlibs
			? getPiecesToPreserve(
					context,
					settings.SelectedAdlibs.SELECTED_ADLIB_LAYERS,
					settings.SelectedAdlibs.SourceLayer.Effekt ? [settings.SelectedAdlibs.SourceLayer.Effekt] : []
			  )
			: [])
	])

	if (settings.SelectedAdlibs.SourceLayer.Effekt) {
		context.stopPiecesOnLayers([settings.SelectedAdlibs.SourceLayer.Effekt])
	}
}

function executeActionCutToCamera<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	context: ITV2ActionExecutionContext,
	settings: ActionExecutionSettings<StudioConfig, ShowStyleConfig>,
	actionId: string,
	userData: ActionCutToCamera
) {
	const config = settings.getConfig(context)

	const externalId = generateExternalId(context, actionId, [userData.name])

	const part = literal<IBlueprintPart>({
		externalId,
		title: `KAM ${userData.name}`,
		metaData: {},
		expectedDuration: 0
	})

	const sourceInfoCam = FindSourceInfoStrict(context, config.sources, SourceLayerType.CAMERA, `Kam ${userData.name}`)
	if (sourceInfoCam === undefined) {
		return
	}

	const currentPieceInstances = context.getPieceInstances('current')

	const serverInCurrentPart = currentPieceInstances.some(
		p => p.piece.sourceLayerId === settings.SourceLayers.Server || p.piece.sourceLayerId === settings.SourceLayers.VO
	)

	const currentKam = currentPieceInstances.find(p => p.piece.sourceLayerId === settings.SourceLayers.Cam)

	const camSisyfos = GetSisyfosTimelineObjForCamera(
		context,
		config,
		`KAM ${userData.name}`,
		settings.LLayer.Sisyfos.StudioMics
	)

	const kamPiece = literal<IBlueprintPiece>({
		externalId,
		name: part.title,
		enable: { start: 0 },
		outputLayerId: SharedOutputLayers.PGM,
		sourceLayerId: settings.SourceLayers.Cam,
		lifespan: PieceLifespan.WithinPart,
		metaData: GetCameraMetaData(config, GetLayersForCamera(config, sourceInfoCam)),
		tags: [GetTagForKam(userData.name)],
		content: {
			timelineObjects: _.compact<TSR.TSRTimelineObj>([
				literal<TSR.TimelineObjAtemME>({
					id: '',
					enable: { while: '1' },
					priority: 1,
					layer: settings.LLayer.Atem.cutOnclean ? settings.LLayer.Atem.MEClean : settings.LLayer.Atem.MEProgram,
					content: {
						deviceType: TSR.DeviceType.ATEM,
						type: TSR.TimelineContentTypeAtem.ME,
						me: {
							input: sourceInfoCam.port,
							transition: TSR.AtemTransitionStyle.CUT
						}
					},
					classes: ['adlib_deparent']
				}),
				camSisyfos,
				literal<TSR.TimelineObjSisyfosChannels & TimelineBlueprintExt>({
					id: '',
					enable: {
						start: 0
					},
					priority: 1,
					layer: settings.LLayer.Sisyfos.PersistedLevels,
					content: {
						deviceType: TSR.DeviceType.SISYFOS,
						type: TSR.TimelineContentTypeSisyfos.CHANNELS,
						overridePriority: 1,
						channels: config.stickyLayers
							.filter(layer => camSisyfos.content.channels.map(channel => channel.mappedLayer).indexOf(layer) === -1)
							.map<TSR.TimelineObjSisyfosChannels['content']['channels'][0]>(layer => {
								return {
									mappedLayer: layer,
									isPgm: 0
								}
							})
					},
					metaData: {
						sisyfosPersistLevel: true
					}
				}),
				// Force server to be muted (for adlibbing over DVE)
				...settings.ServerAudioLayers.map<TSR.TimelineObjSisyfosChannel>(layer => {
					return literal<TSR.TimelineObjSisyfosChannel>({
						id: '',
						enable: {
							start: 0
						},
						priority: 2,
						layer,
						content: {
							deviceType: TSR.DeviceType.SISYFOS,
							type: TSR.TimelineContentTypeSisyfos.CHANNEL,
							isPgm: 0
						}
					})
				})
			])
		}
	})

	settings.postProcessPieceTimelineObjects(context, config, kamPiece, false)

	if (userData.queue || serverInCurrentPart) {
		context.queuePart(part, [
			kamPiece,
			...(settings.SelectedAdlibs
				? getPiecesToPreserve(context, settings.SelectedAdlibs.SELECTED_ADLIB_LAYERS, [])
				: [])
		])
		if (serverInCurrentPart && !userData.queue) {
			context.takeAfterExecuteAction(true)
		}
	} else if (currentKam) {
		kamPiece.externalId = currentKam.piece.externalId
		kamPiece.enable = currentKam.piece.enable
		context.updatePieceInstance(currentKam._id, kamPiece)
	} else {
		const currentExternalId = context.getPartInstance('current')?.part.externalId

		if (currentExternalId) {
			kamPiece.externalId = currentExternalId
		}

		context.stopPiecesOnLayers([
			settings.SourceLayers.DVE,
			...(settings.SourceLayers.DVEAdLib ? [settings.SourceLayers.DVEAdLib] : []),
			settings.SourceLayers.Effekt,
			settings.SourceLayers.Live,
			settings.SourceLayers.Server,
			settings.SourceLayers.VO,
			...(settings.SourceLayers.EVS ? [settings.SourceLayers.EVS] : []),
			settings.SourceLayers.Continuity
		])
		kamPiece.enable = { start: 'now' }
		context.insertPiece('current', kamPiece)
	}
}

function executeActionCutToRemote<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	context: ITV2ActionExecutionContext,
	settings: ActionExecutionSettings<StudioConfig, ShowStyleConfig>,
	actionId: string,
	userData: ActionCutToRemote
) {
	const config = settings.getConfig(context)

	const externalId = generateExternalId(context, actionId, [userData.name])

	const feed = userData.name.match(/^F(.+).*$/) // TODO: fix when refactoring FindSourceInfo
	const title = feed ? `FEED ${feed[1]}` : `LIVE ${userData.name}`

	const part = literal<IBlueprintPart>({
		externalId,
		title,
		metaData: {},
		expectedDuration: 0
	})

	const eksternSisyfos: TSR.TimelineObjSisyfosAny[] = [
		...GetSisyfosTimelineObjForEkstern(context, config.sources, `Live ${userData.name}`, GetLayersForEkstern),
		GetSisyfosTimelineObjForCamera(context, config, 'telefon', settings.LLayer.Sisyfos.StudioMics)
	]

	const remotePiece = literal<IBlueprintPiece>({
		externalId,
		name: title,
		enable: {
			start: 0
		},
		sourceLayerId: settings.SourceLayers.Live,
		outputLayerId: SharedOutputLayers.PGM,
		lifespan: PieceLifespan.WithinPart,
		toBeQueued: true,
		metaData: GetEksternMetaData(
			config.stickyLayers,
			config.studio.StudioMics,
			GetLayersForEkstern(context, config.sources, `Live ${userData.name}`)
		),
		tags: [GetTagForLive(userData.name)],
		content: {
			timelineObjects: _.compact<TSR.TSRTimelineObj>([
				literal<TSR.TimelineObjAtemME>({
					id: '',
					enable: { while: '1' },
					priority: 1,
					layer: settings.LLayer.Atem.cutOnclean ? settings.LLayer.Atem.MEClean : settings.LLayer.Atem.MEProgram,
					content: {
						deviceType: TSR.DeviceType.ATEM,
						type: TSR.TimelineContentTypeAtem.ME,
						me: {
							input: userData.port,
							transition: TSR.AtemTransitionStyle.CUT
						}
					},
					classes: ['adlib_deparent']
				}),
				...eksternSisyfos,
				...config.stickyLayers
					.filter(layer => eksternSisyfos.map(obj => obj.layer).indexOf(layer) === -1)
					.filter(layer => config.liveAudio.indexOf(layer) === -1)
					.map<TSR.TimelineObjSisyfosChannel & TimelineBlueprintExt>(layer => {
						return literal<TSR.TimelineObjSisyfosChannel & TimelineBlueprintExt>({
							id: '',
							enable: {
								start: 0
							},
							priority: 1,
							layer,
							content: {
								deviceType: TSR.DeviceType.SISYFOS,
								type: TSR.TimelineContentTypeSisyfos.CHANNEL,
								isPgm: 0
							},
							metaData: {
								sisyfosPersistLevel: true
							}
						})
					}),
				// Force server to be muted (for adlibbing over DVE)
				...settings.ServerAudioLayers.map<TSR.TimelineObjSisyfosChannel>(layer => {
					return literal<TSR.TimelineObjSisyfosChannel>({
						id: '',
						enable: {
							start: 0
						},
						priority: 2,
						layer,
						content: {
							deviceType: TSR.DeviceType.SISYFOS,
							type: TSR.TimelineContentTypeSisyfos.CHANNEL,
							isPgm: 0
						}
					})
				})
			])
		}
	})

	settings.postProcessPieceTimelineObjects(context, config, remotePiece, false)

	context.queuePart(part, [
		remotePiece,
		...(settings.SelectedAdlibs ? getPiecesToPreserve(context, settings.SelectedAdlibs.SELECTED_ADLIB_LAYERS, []) : [])
	])
}

function executeActionCutSourceToBox<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	context: ITV2ActionExecutionContext,
	settings: ActionExecutionSettings<StudioConfig, ShowStyleConfig>,
	_actionId: string,
	userData: ActionCutSourceToBox
) {
	const config = settings.getConfig(context)

	const currentPieces = context.getPieceInstances('current')
	const nextPieces = context.getPieceInstances('next')

	const currentDVE = currentPieces.find(
		p =>
			p.piece.sourceLayerId === settings.SourceLayers.DVE ||
			(settings.SourceLayers.DVEAdLib && p.piece.sourceLayerId === settings.SourceLayers.DVEAdLib)
	)
	const currentDataStore = currentPieces.find(
		p => settings.SelectedAdlibs && p.piece.sourceLayerId === settings.SelectedAdlibs.SourceLayer.DVE
	)
	const nextDVE = nextPieces.find(
		p =>
			p.piece.sourceLayerId === settings.SourceLayers.DVE ||
			(settings.SourceLayers.DVEAdLib && p.piece.sourceLayerId === settings.SourceLayers.DVEAdLib)
	)
	const nextDataStore = nextPieces.find(
		p => settings.SelectedAdlibs && p.piece.sourceLayerId === settings.SelectedAdlibs.SourceLayer.DVE
	)

	let modify: undefined | 'current' | 'next'
	let modifiedPiece: IBlueprintPieceInstance | undefined
	let modifiedDataStore: IBlueprintPieceInstance | undefined

	if (currentDVE) {
		modify = 'current'
		modifiedPiece = currentDVE
		modifiedDataStore = currentDataStore
	} else if (nextDVE) {
		modify = 'next'
		modifiedPiece = nextDVE
		modifiedDataStore = nextDataStore
	}

	const meta: (DVEPieceMetaData & PieceMetaData) | undefined = modifiedPiece?.piece.metaData as PieceMetaData &
		DVEPieceMetaData

	if (
		!modifiedPiece ||
		!modify ||
		!modifiedPiece.piece.content ||
		!modifiedPiece.piece.content.timelineObjects ||
		!meta
	) {
		return
	}

	const containsServerBefore = dveContainsServer(meta.sources)

	// ADD 'VO' to VO sources
	const name = `${userData.name}${userData.vo && !userData.name.match(/VO/i) ? 'VO' : ''}`

	meta.sources[`INP${userData.box + 1}` as keyof DVEPieceMetaData['sources']] = name

	const containsServerAfter = dveContainsServer(meta.sources)

	const graphicsTemplateContent: { [key: string]: string } = {}

	meta.userData.config.labels.forEach((label, i) => {
		graphicsTemplateContent[`locator${i + 1}`] = label
	})

	const mediaPlayerSession = containsServerBefore && meta.mediaPlayerSessions ? meta.mediaPlayerSessions[0] : undefined

	const newPieceContent = MakeContentDVE2(
		context,
		config,
		meta.config,
		graphicsTemplateContent,
		meta.sources,
		settings.DVEGeneratorOptions,
		undefined,
		undefined,
		undefined,
		mediaPlayerSession
	)
	if (userData.vo) {
		const studioMics = GetSisyfosTimelineObjForCamera(context, config, 'evs', settings.LLayer.Sisyfos.StudioMics)
		// Replace any existing instances of studio mics with VO values
		newPieceContent.content.timelineObjects = newPieceContent.content.timelineObjects.filter(
			obj => studioMics.layer !== obj.layer
		)
		newPieceContent.content.timelineObjects.push(studioMics)
	}

	let newDVEPiece: IBlueprintPiece = { ...modifiedPiece.piece, content: newPieceContent.content, metaData: meta }
	if (!(containsServerBefore && containsServerAfter)) {
		newDVEPiece = cutServerToBox(context, settings, newDVEPiece)
	}

	if (newPieceContent.valid) {
		startNewDVELayout(
			context,
			config,
			settings,
			newDVEPiece,
			newPieceContent.content,
			meta,
			meta.config.DVEName,
			meta.sources,
			newDVEPiece.externalId,
			modify,
			{ activeDVE: modifiedPiece._id, dataStore: modifiedDataStore?._id },
			GetTagForDVENext('', meta.config.DVEName, meta.sources)
		)
	}
}

interface PiecesBySourceLayer {
	[key: string]: IBlueprintPieceInstance[]
}

function groupPiecesBySourceLayer(pieceInstances: IBlueprintPieceInstance[]): PiecesBySourceLayer {
	const piecesBySourceLayer: PiecesBySourceLayer = {}
	pieceInstances.forEach(piece => {
		if (!piecesBySourceLayer[piece.piece.sourceLayerId]) {
			piecesBySourceLayer[piece.piece.sourceLayerId] = []
		}
		piecesBySourceLayer[piece.piece.sourceLayerId].push(piece)
	})
	return piecesBySourceLayer
}

function findPrimaryPieceUsingPriority<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(settings: ActionExecutionSettings<StudioConfig, ShowStyleConfig>, piecesBySourceLayer: PiecesBySourceLayer) {
	const sourceLayersOrderedByPriority = [
		settings.SourceLayers.Cam,
		settings.SourceLayers.DVE,
		settings.SourceLayers.DVEAdLib,
		settings.SourceLayers.Live,
		settings.SourceLayers.Server,
		settings.SourceLayers.VO,
		...(settings.SourceLayers.EVS ? [settings.SourceLayers.EVS] : []),
		settings.SourceLayers.Effekt,
		settings.SourceLayers.Continuity
	]
	for (const layer of sourceLayersOrderedByPriority) {
		if (layer && piecesBySourceLayer[layer]) {
			return piecesBySourceLayer[layer][0]
		}
	}
	return undefined
}

function applyPrerollToWallGraphics<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	context: ITV2ActionExecutionContext,
	settings: ActionExecutionSettings<StudioConfig, ShowStyleConfig>,
	piecesBySourceLayer: PiecesBySourceLayer,
	partProps: Partial<IBlueprintPart>
) {
	const wallPieces = piecesBySourceLayer[settings.SourceLayers.Wall]
	if (!wallPieces) {
		return
	}
	const enable = GetEnableForWall(partProps)
	for (const pieceInstance of wallPieces) {
		if (pieceInstance.piece.content?.timelineObjects && !pieceInstance.infinite?.fromPreviousPart) {
			const newPieceProps = {
				content: pieceInstance.piece.content as WithTimeline<GraphicsContent>
			}
			const timelineObjectsToUpdate = newPieceProps.content.timelineObjects.filter(
				timelineObject =>
					timelineObject.layer === GraphicLLayer.GraphicLLayerWall &&
					(timelineObject.content.deviceType === TSR.DeviceType.VIZMSE ||
						timelineObject.content.deviceType === TSR.DeviceType.CASPARCG)
			)
			timelineObjectsToUpdate.forEach(timelineObject => {
				timelineObject.enable = enable
			})
			context.updatePieceInstance(pieceInstance._id, newPieceProps)
		}
	}
}

function executeActionTakeWithTransition<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	context: ITV2ActionExecutionContext,
	settings: ActionExecutionSettings<StudioConfig, ShowStyleConfig>,
	actionId: string,
	userData: ActionTakeWithTransition
) {
	const externalId = generateExternalId(context, actionId, [userData.variant.type])

	const nextPieces = context.getPieceInstances('next')

	const nextPiecesBySourceLayer = groupPiecesBySourceLayer(nextPieces)
	const primaryPiece = findPrimaryPieceUsingPriority(settings, nextPiecesBySourceLayer)

	context.takeAfterExecuteAction(userData.takeNow)

	if (
		!primaryPiece ||
		!primaryPiece.piece.content ||
		primaryPiece.piece.sourceLayerId === settings.SourceLayers.Effekt
	) {
		return
	}

	const tlObjIndex = (primaryPiece.piece.content.timelineObjects as TSR.TSRTimelineObj[]).findIndex(
		obj =>
			obj.layer === (settings.LLayer.Atem.cutOnclean ? settings.LLayer.Atem.MEClean : settings.LLayer.Atem.MEProgram) &&
			obj.content.deviceType === TSR.DeviceType.ATEM &&
			obj.content.type === TSR.TimelineContentTypeAtem.ME
	)

	const tlObj =
		tlObjIndex > -1
			? ((primaryPiece.piece.content.timelineObjects as TSR.TSRTimelineObj[])[tlObjIndex] as TSR.TimelineObjAtemME)
			: undefined

	if (!tlObj) {
		return
	}

	const existingEffektPiece = nextPieces.find(p => p.piece.sourceLayerId === settings.SourceLayers.Effekt)

	if (existingEffektPiece) {
		context.removePieceInstances('next', [existingEffektPiece._id])
	}

	let partProps: Partial<IBlueprintPart> | false = false

	switch (userData.variant.type) {
		case 'cut':
			{
				tlObj.content.me.transition = TSR.AtemTransitionStyle.CUT

				primaryPiece.piece.content.timelineObjects[tlObjIndex] = tlObj

				context.updatePieceInstance(primaryPiece._id, primaryPiece.piece)

				const cutTransitionPiece: IBlueprintPiece = {
					enable: {
						start: 0,
						duration: 1000
					},
					externalId,
					name: 'CUT',
					sourceLayerId: settings.SourceLayers.Effekt,
					outputLayerId: SharedOutputLayers.JINGLE,
					lifespan: PieceLifespan.WithinPart,
					tags: [GetTagForTransition(userData.variant)],
					content: {
						ignoreMediaObjectStatus: true,
						timelineObjects: []
					}
				}

				partProps = {
					transitionKeepaliveDuration: undefined,
					transitionDuration: undefined,
					transitionPrerollDuration: undefined
				}

				context.insertPiece('next', cutTransitionPiece)
				context.updatePartInstance('next', partProps)
			}
			break
		case 'breaker': {
			tlObj.content.me.transition = TSR.AtemTransitionStyle.CUT

			primaryPiece.piece.content.timelineObjects[tlObjIndex] = tlObj

			context.updatePieceInstance(primaryPiece._id, primaryPiece.piece)

			const config = settings.getConfig(context)
			const pieces: IBlueprintPiece[] = []
			partProps = CreateEffektForPartInner(
				context,
				config,
				pieces,
				userData.variant.breaker,
				externalId,
				{
					sourceLayer: settings.SourceLayers.Effekt,
					casparLayer: settings.LLayer.Caspar.Effekt,
					sisyfosLayer: settings.LLayer.Sisyfos.Effekt
				},
				!!userData.variant.breaker.match(/^\d+$/) ? `EFFEKT ${userData.variant.breaker}` : userData.variant.breaker
			)

			if (partProps) {
				context.updatePartInstance('next', partProps)
				pieces.forEach(p => context.insertPiece('next', { ...p, tags: [GetTagForTransition(userData.variant)] }))
			}
			break
		}
		case 'mix': {
			tlObj.content.me.transition = TSR.AtemTransitionStyle.MIX
			tlObj.content.me.transitionSettings = {
				...tlObj.content.me.transitionSettings,
				mix: {
					rate: userData.variant.frames
				}
			}

			primaryPiece.piece.content.timelineObjects[tlObjIndex] = tlObj

			context.updatePieceInstance(primaryPiece._id, primaryPiece.piece)

			const pieces: IBlueprintPiece[] = []
			partProps = CreateMixForPartInner(pieces, externalId, userData.variant.frames, {
				sourceLayer: settings.SourceLayers.Effekt,
				casparLayer: settings.LLayer.Caspar.Effekt,
				sisyfosLayer: settings.LLayer.Sisyfos.Effekt
			})

			context.updatePartInstance('next', partProps)
			pieces.forEach(p => context.insertPiece('next', { ...p, tags: [GetTagForTransition(userData.variant)] }))

			break
		}
	}

	if (partProps) {
		applyPrerollToWallGraphics(context, settings, nextPiecesBySourceLayer, partProps)
	}
}

function findPieceToRecoverDataFrom(
	context: ITV2ActionExecutionContext,
	dataStoreLayers: string[]
): { piece: IBlueprintPieceInstance; part: 'current' | 'next' } | undefined {
	const currentPieces = context.getPieceInstances('current')
	const nextPieces = context.getPieceInstances('next')

	const currentServer = currentPieces.find(p => dataStoreLayers.includes(p.piece.sourceLayerId))

	const nextServer = nextPieces.find(p => dataStoreLayers.includes(p.piece.sourceLayerId))

	let pieceToRecoverDataFrom: IBlueprintPieceInstance | undefined

	let part: 'current' | 'next' = 'current'

	if (nextServer) {
		part = 'next'
		pieceToRecoverDataFrom = nextServer
	} else if (currentServer) {
		part = 'current'
		pieceToRecoverDataFrom = currentServer
	}

	if (!pieceToRecoverDataFrom) {
		return
	}

	return {
		piece: pieceToRecoverDataFrom,
		part
	}
}

function findDataStore<T extends TV2AdlibAction>(
	context: ITV2ActionExecutionContext,
	dataStoreLayers: string[]
): T | undefined {
	const dataStorePiece = findPieceToRecoverDataFrom(context, dataStoreLayers)

	if (!dataStorePiece) {
		return
	}

	const data = (dataStorePiece.piece.piece.metaData as any)?.userData as T | undefined

	return data
}

function findMediaPlayerSessions(
	context: ITV2ActionExecutionContext,
	sessionLayers: string[]
): { session: string | undefined; part: 'current' | 'next' | undefined } {
	const mediaPlayerSessionPiece = findPieceToRecoverDataFrom(context, sessionLayers)

	if (!mediaPlayerSessionPiece) {
		return {
			session: undefined,
			part: undefined
		}
	}

	const sessions = (mediaPlayerSessionPiece.piece.piece.metaData as any)?.mediaPlayerSessions

	return {
		// Assume there will be only one session
		session: sessions && sessions.length ? sessions[0] : undefined,
		part: mediaPlayerSessionPiece.part
	}
}

function executeActionCommentatorSelectServer<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	context: ITV2ActionExecutionContext,
	settings: ActionExecutionSettings<StudioConfig, ShowStyleConfig>,
	_actionId: string,
	_userData: ActionCommentatorSelectServer
) {
	const data = findDataStore<ActionSelectServerClip>(context, [
		settings.SelectedAdlibs.SourceLayer.Server,
		settings.SelectedAdlibs.SourceLayer.VO
	])

	const sessions = findMediaPlayerSessions(context, [
		settings.SelectedAdlibs.SourceLayer.Server,
		settings.SelectedAdlibs.SourceLayer.VO
	])

	if (!data) {
		return
	}

	let session: string | undefined
	if (sessions.session && sessions.part && sessions.part === 'current') {
		session = sessions.session
	}

	executeActionSelectServerClip(context, settings, AdlibActionType.SELECT_SERVER_CLIP, data, session)
}

function executeActionCommentatorSelectDVE<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	context: ITV2ActionExecutionContext,
	settings: ActionExecutionSettings<StudioConfig, ShowStyleConfig>,
	_actionId: string,
	_userData: ActionCommentatorSelectDVE
) {
	if (!settings.SelectedAdlibs.SourceLayer.DVE) {
		return
	}

	const data = findDataStore<ActionSelectDVE>(context, [settings.SelectedAdlibs.SourceLayer.DVE])

	if (!data) {
		return
	}

	executeActionSelectDVE(context, settings, AdlibActionType.SELECT_DVE, data)
}

function executeActionCommentatorSelectFull<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	context: ITV2ActionExecutionContext,
	settings: ActionExecutionSettings<StudioConfig, ShowStyleConfig>,
	_actionId: string,
	_userData: ActionCommentatorSelectFull
) {
	const data = findDataStore<ActionSelectFullGrafik>(context, [SharedSourceLayers.SelectedAdlibGraphicsFull])

	if (!data) {
		return
	}

	executeActionSelectFull(context, settings, AdlibActionType.SELECT_FULL_GRAFIK, data)
}

function executeActionCommentatorSelectJingle<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	context: ITV2ActionExecutionContext,
	settings: ActionExecutionSettings<StudioConfig, ShowStyleConfig>,
	_actionId: string,
	_userData: ActionCommentatorSelectJingle
) {
	if (!settings.SelectedAdlibs.SourceLayer.Effekt) {
		return
	}

	const data = findDataStore<ActionSelectJingle>(context, [settings.SelectedAdlibs.SourceLayer.Effekt])

	if (!data) {
		return
	}

	executeActionSelectJingle(context, settings, AdlibActionType.SELECT_JINGLE, data)
}

function executeActionRecallLastLive<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	context: ITV2ActionExecutionContext,
	settings: ActionExecutionSettings<StudioConfig, ShowStyleConfig>,
	actionId: string,
	_userData: ActionRecallLastLive
) {
	const lastLive = context.findLastPieceOnLayer(settings.SourceLayers.Live, {
		originalOnly: true,
		excludeCurrentPart: false
	})
	const lastIdent = context.findLastPieceOnLayer(settings.SourceLayers.Ident, {
		originalOnly: true,
		excludeCurrentPart: false
	})

	if (!lastLive) {
		return
	}

	const externalId = generateExternalId(context, actionId, [lastLive.piece.name])

	const part = literal<IBlueprintPart>({
		externalId,
		title: lastLive.piece.name
	})

	const pieces: IBlueprintPiece[] = []
	pieces.push({
		...lastLive.piece,
		externalId,
		enable: {
			start: 0
		},
		lifespan: PieceLifespan.WithinPart
	})

	// externalId should be replaced with something more concrete like partInstanceId
	if (lastIdent && lastIdent.piece.externalId === lastLive.piece.externalId) {
		pieces.push({
			...lastIdent.piece,
			externalId,
			enable: { ...lastIdent.piece.enable, start: 0 },
			lifespan: PieceLifespan.WithinPart
		})
	}

	context.queuePart(part, pieces)
}

function executeActionRecallLastDVE<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	context: ITV2ActionExecutionContext,
	settings: ActionExecutionSettings<StudioConfig, ShowStyleConfig>,
	actionId: string,
	_userData: ActionRecallLastDVE
) {
	const currentPart = context.getPartInstance('current')

	if (!currentPart) {
		return
	}

	const lastPlayedScheduledDVE: IBlueprintPieceInstance | undefined = context.findLastPieceOnLayer(
		settings.SourceLayers.DVE,
		{
			originalOnly: true
		}
	)
	const isLastPlayedAScheduledDVE: boolean = !lastPlayedScheduledDVE?.dynamicallyInserted

	if (lastPlayedScheduledDVE && isLastPlayedAScheduledDVE) {
		scheduleLastPlayedDVE(context, settings, actionId, lastPlayedScheduledDVE)
	} else {
		scheduleNextScriptedDVE(context, settings, actionId)
	}
}

function executeActionPlayGraphics<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	context: ITV2ActionExecutionContext,
	settings: ActionExecutionSettings<StudioConfig, ShowStyleConfig>,
	actionId: string,
	userData: ActionPlayGraphics
) {
	if (!IsTargetingOVL(userData.graphic.target)) {
		return
	}

	const externalId = context.getPartInstance('current')?.part.externalId ?? generateExternalId(context, actionId, [])

	const internalGraphic: InternalGraphic = new InternalGraphic(
		settings.getConfig(context),
		userData.graphic,
		true,
		undefined,
		externalId,
		undefined,
		undefined
	)
	const pieces: IBlueprintPiece[] = []

	internalGraphic.createPiece(pieces)

	pieces.forEach((piece: IBlueprintPiece) => {
		context.insertPiece('current', piece)
	})
}

function scheduleLastPlayedDVE<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	context: ITV2ActionExecutionContext,
	settings: ActionExecutionSettings<StudioConfig, ShowStyleConfig>,
	actionId: string,
	lastPlayedDVE: IBlueprintPieceInstance
): void {
	const lastPlayedDVEMeta: DVEPieceMetaData = lastPlayedDVE.piece.metaData as DVEPieceMetaData
	const externalId: string = generateExternalId(context, actionId, [lastPlayedDVE.piece.name])

	executeActionSelectDVE(
		context,
		settings,
		actionId,
		literal<ActionSelectDVE>({
			type: AdlibActionType.SELECT_DVE,
			config: lastPlayedDVEMeta.userData.config,
			segmentExternalId: externalId,
			videoId: lastPlayedDVEMeta.userData.videoId
		})
	)
}

function scheduleNextScriptedDVE<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	context: ITV2ActionExecutionContext,
	settings: ActionExecutionSettings<StudioConfig, ShowStyleConfig>,
	actionId: string
): void {
	const nextScriptedDVE: IBlueprintPiece | undefined = context.findLastScriptedPieceOnLayer(settings.SourceLayers.DVE)

	if (!nextScriptedDVE) {
		return
	}

	const externalId: string = generateExternalId(context, actionId, [nextScriptedDVE.name])
	const dveMeta: DVEPieceMetaData = nextScriptedDVE.metaData as DVEPieceMetaData

	executeActionSelectDVE(
		context,
		settings,
		actionId,
		literal<ActionSelectDVE>({
			type: AdlibActionType.SELECT_DVE,
			config: dveMeta.userData.config,
			segmentExternalId: externalId,
			videoId: dveMeta.userData.videoId
		})
	)
}

function executeActionSelectFull<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	context: ITV2ActionExecutionContext,
	settings: ActionExecutionSettings<StudioConfig, ShowStyleConfig>,
	_actionId: string,
	userData: ActionSelectFullGrafik
) {
	const config = settings.getConfig(context)

	const template = GetFullGrafikTemplateName(config, userData.name)

	const externalId = `adlib-action_${context.getHashId(`cut_to_full_${template}`)}`

	const graphicType = config.studio.GraphicsType
	const prerollDuration =
		graphicType === 'HTML' ? config.studio.CasparPrerollDuration : config.studio.VizPilotGraphics.OutTransitionDuration
	const transitionKeepaliveDuration =
		graphicType === 'HTML'
			? config.studio.HTMLGraphics.KeepAliveDuration
			: config.studio.VizPilotGraphics.KeepAliveDuration

	const part = literal<IBlueprintPart>({
		externalId,
		title: `Full ${template}`,
		metaData: {},
		expectedDuration: 0,
		prerollDuration,
		transitionKeepaliveDuration
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

	const fullPiece = CreateFullPiece(
		config,
		context,
		part,
		externalId,
		cue,
		'FULL',
		settings.pilotGraphicSettings,
		true,
		userData.segmentExternalId
	)

	settings.postProcessPieceTimelineObjects(context, config, fullPiece, false)

	const fullDataStore = CreateFullDataStore(
		config,
		context,
		part,
		settings.pilotGraphicSettings,
		cue,
		'FULL',
		externalId,
		true,
		userData.segmentExternalId
	)

	context.queuePart(part, [
		fullPiece,
		...(fullDataStore ? [fullDataStore] : []),
		...getPiecesToPreserve(context, settings.SelectedAdlibs.SELECTED_ADLIB_LAYERS, [
			SharedSourceLayers.SelectedAdlibGraphicsFull
		])
	])

	context.stopPiecesOnLayers([SharedSourceLayers.SelectedAdlibGraphicsFull])
}

function executeActionClearGraphics<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	context: ITV2ActionExecutionContext,
	settings: ActionExecutionSettings<StudioConfig, ShowStyleConfig>,
	_actionId: string,
	userData: ActionClearGraphics
) {
	const config = settings.getConfig(context)

	context.stopPiecesOnLayers(STOPPABLE_GRAPHICS_LAYERS)
	context.insertPiece(
		'current',
		literal<IBlueprintPiece>({
			enable: {
				start: 'now',
				duration: 3000
			},
			externalId: 'clearAllGFX',
			name: userData.label,
			sourceLayerId: SharedSourceLayers.PgmAdlibGraphicCmd,
			outputLayerId: SharedOutputLayers.SEC,
			lifespan: PieceLifespan.WithinPart,
			content:
				config.studio.GraphicsType === 'HTML'
					? {
							timelineObjects: [
								literal<TSR.TimelineObjAbstractAny>({
									id: '',
									enable: {
										start: 0
									},
									priority: 1,
									layer: GraphicLLayer.GraphicLLayerAdLibs,
									content: {
										deviceType: TSR.DeviceType.ABSTRACT
									}
								})
							]
					  }
					: {
							timelineObjects: [
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
										channelsToSendCommands: userData.sendCommands ? ['OVL1', 'FULL1', 'WALL1'] : undefined
									}
								})
							]
					  },
			tags: userData.sendCommands ? [TallyTags.GFX_CLEAR] : [TallyTags.GFX_ALTUD]
		})
	)
}
