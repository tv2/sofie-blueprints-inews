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
	IBlueprintResolvedPieceInstance,
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
	CreateDipTransitionBlueprintPieceForPart,
	CreateFullPiece,
	CreateInTransitionForAtemTransitionStyle,
	CreatePartServerBase,
	CueDefinition,
	CueDefinitionDVE,
	CueDefinitionGraphic,
	DipTransitionSettings,
	DVEOptions,
	DVEPieceMetaData,
	DVESources,
	EvaluateCuesOptions,
	executeWithContext,
	FindSourceInfoStrict,
	GetDVETemplate,
	GetFullGrafikTemplateName,
	GetSisyfosTimelineObjForCamera,
	GetSisyfosTimelineObjForEkstern,
	GraphicPilot,
	IsTargetingOVL,
	ITV2ActionExecutionContext,
	literal,
	MakeContentDVE2,
	MixTransitionSettings,
	PartDefinition,
	PieceMetaData,
	SisyfosPersistMetaData,
	TimeFromFrames,
	TimelineBlueprintExt,
	TV2AdlibAction,
	TV2BlueprintConfigBase,
	TV2StudioConfigBase
} from 'tv2-common'
import {
	AdlibActionType,
	CueType,
	SharedGraphicLLayer,
	SharedOutputLayers,
	SharedSourceLayers,
	TallyTags
} from 'tv2-constants'
import _ = require('underscore')
import { EnableServer } from '../content'
import {
	CreateFullDataStore,
	GetEnableForWall,
	getServerPosition,
	PilotGeneratorSettings,
	ServerSelectMode
} from '../helpers'
import { InternalGraphic } from '../helpers/graphics/InternalGraphic'
import { GetJinglePartPropertiesFromTableValue } from '../jinglePartProperties'
import { CreateEffektForPartBase, CreateEffektForPartInner, CreateMixTransitionBlueprintPieceForPart } from '../parts'
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

const FADE_SISYFOS_LEVELS_PIECE_NAME = 'fadeDown'

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

export async function executeAction<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	coreContext: IActionExecutionContext,
	settings: ActionExecutionSettings<StudioConfig, ShowStyleConfig>,
	actionIdStr: string,
	userData: ActionUserData,
	triggerMode?: string
): Promise<void> {
	await executeWithContext(coreContext, async context => {
		const existingTransition = await getExistingTransition(context, settings, 'next')

		const actionId = actionIdStr as AdlibActionType

		switch (actionId) {
			case AdlibActionType.SELECT_SERVER_CLIP:
				await executeActionSelectServerClip(
					context,
					settings,
					actionId,
					userData as ActionSelectServerClip,
					triggerMode as ServerSelectMode | undefined
				)
				break
			case AdlibActionType.SELECT_DVE:
				await executeActionSelectDVE(context, settings, actionId, userData as ActionSelectDVE)
				break
			case AdlibActionType.SELECT_DVE_LAYOUT:
				await executeActionSelectDVELayout(context, settings, actionId, userData as ActionSelectDVELayout)
				break
			case AdlibActionType.SELECT_FULL_GRAFIK:
				await executeActionSelectFull(context, settings, actionId, userData as ActionSelectFullGrafik)
				break
			case AdlibActionType.SELECT_JINGLE:
				await executeActionSelectJingle(context, settings, actionId, userData as ActionSelectJingle)
				break
			case AdlibActionType.CLEAR_GRAPHICS:
				await executeActionClearGraphics(context, settings, actionId, userData as ActionClearGraphics)
				break
			case AdlibActionType.CUT_TO_CAMERA:
				await executeActionCutToCamera(context, settings, actionId, userData as ActionCutToCamera)
				break
			case AdlibActionType.CUT_TO_REMOTE:
				await executeActionCutToRemote(context, settings, actionId, userData as ActionCutToRemote)
				break
			case AdlibActionType.CUT_SOURCE_TO_BOX:
				await executeActionCutSourceToBox(context, settings, actionId, userData as ActionCutSourceToBox)
				break
			case AdlibActionType.COMMENTATOR_SELECT_DVE:
				await executeActionCommentatorSelectDVE(context, settings, actionId, userData as ActionCommentatorSelectDVE)
				break
			case AdlibActionType.COMMENTATOR_SELECT_SERVER:
				await executeActionCommentatorSelectServer(
					context,
					settings,
					actionId,
					userData as ActionCommentatorSelectServer
				)
				break
			case AdlibActionType.COMMENTATOR_SELECT_FULL:
				await executeActionCommentatorSelectFull(context, settings, actionId, userData as ActionCommentatorSelectFull)
				break
			case AdlibActionType.COMMENTATOR_SELECT_JINGLE:
				await executeActionCommentatorSelectJingle(
					context,
					settings,
					actionId,
					userData as ActionCommentatorSelectJingle
				)
				break
			case AdlibActionType.TAKE_WITH_TRANSITION:
				await executeActionTakeWithTransition(context, settings, actionId, userData as ActionTakeWithTransition)
				break
			case AdlibActionType.RECALL_LAST_LIVE:
				await executeActionRecallLastLive(context, settings, actionId, userData as ActionRecallLastLive)
				break
			case AdlibActionType.RECALL_LAST_DVE:
				await executeActionRecallLastDVE(context, settings, actionId, userData as ActionRecallLastDVE)
				break
			case AdlibActionType.FADE_DOWN_PERSISTED_AUDIO_LEVELS:
				await executeActionFadeDownPersistedAudioLevels(context, settings)
				break
			case AdlibActionType.PLAY_GRAPHICS:
				await executeActionPlayGraphics(context, settings, actionId, userData as ActionPlayGraphics)
				break
			default:
				assertUnreachable(actionId)
				break
		}

		if (actionId !== AdlibActionType.TAKE_WITH_TRANSITION) {
			if (existingTransition) {
				await executeActionTakeWithTransition(
					context,
					settings,
					AdlibActionType.TAKE_WITH_TRANSITION,
					existingTransition
				)
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

async function getExistingTransition<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	context: ITV2ActionExecutionContext,
	settings: ActionExecutionSettings<StudioConfig, ShowStyleConfig>,
	part: 'current' | 'next'
): Promise<ActionTakeWithTransition | undefined> {
	const existingTransition = await context
		.getPieceInstances(part)
		.then(pieceInstances => pieceInstances.find(p => p.piece.sourceLayerId === settings.SourceLayers.Effekt))

	if (!existingTransition) {
		return
	}

	const transition = existingTransition.piece.name

	// Case sensitive! Blueprints will set these names correctly.
	const transitionProps = transition.match(/CUT|MIX (\d+)|DIP (\d+)|EFFEKT (\d+)/)
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
	}

	if (transitionProps[0].match(/MIX/) && transitionProps[1] !== undefined) {
		return literal<ActionTakeWithTransition>({
			type: AdlibActionType.TAKE_WITH_TRANSITION,
			variant: {
				type: 'mix',
				frames: Number(transitionProps[1])
			},
			takeNow: false
		})
	}

	if (transitionProps[0].match(/DIP/) && transitionProps[1] !== undefined) {
		return literal<ActionTakeWithTransition>({
			type: AdlibActionType.TAKE_WITH_TRANSITION,
			variant: {
				type: 'dip',
				frames: Number(transitionProps[1])
			},
			takeNow: false
		})
	}

	if (transitionProps[0].match(/EFFEKT/) && transitionProps[1] !== undefined) {
		return literal<ActionTakeWithTransition>({
			type: AdlibActionType.TAKE_WITH_TRANSITION,
			variant: {
				type: 'breaker',
				breaker: transitionProps[1].toString()
			},
			takeNow: false
		})
	}
	return
}

function sanitizePieceId(piece: IBlueprintPieceDB): IBlueprintPiece {
	return _.omit(piece, ['_id', 'partId', 'infiniteId', 'playoutDuration'])
}

export async function getPiecesToPreserve(
	context: ITV2ActionExecutionContext,
	adlibLayers: string[],
	ignoreLayers: string[]
): Promise<IBlueprintPiece[]> {
	const currentPartSegmentId = await context.getPartInstance('current').then(partInstance => partInstance?.segmentId)
	const nextPartSegmentId = await context.getPartInstance('next').then(partInstance => partInstance?.segmentId)

	if (!currentPartSegmentId || !nextPartSegmentId) {
		return []
	}

	if (currentPartSegmentId !== nextPartSegmentId) {
		return []
	}

	return context.getPieceInstances('next').then(pieceInstances => {
		return pieceInstances
			.filter(p => adlibLayers.includes(p.piece.sourceLayerId) && !ignoreLayers.includes(p.piece.sourceLayerId))
			.filter(p => !p.infinite?.fromPreviousPart && !p.infinite?.fromPreviousPlayhead)
			.map<IBlueprintPiece>(p => p.piece)
			.map(p => sanitizePieceStart(p))
			.map(p => sanitizePieceId(p as IBlueprintPieceDB))
	})
}

function generateExternalId(context: ITV2ActionExecutionContext, actionId: string, args: string[]): string {
	return `adlib_action_${actionId}_${context.getHashId(args.join('_'), true)}`
}

async function executeActionSelectServerClip<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	context: ITV2ActionExecutionContext,
	settings: ActionExecutionSettings<StudioConfig, ShowStyleConfig>,
	actionId: string,
	userData: ActionSelectServerClip,
	triggerMode?: ServerSelectMode,
	sessionToContinue?: string
) {
	const file = userData.file
	const partDefinition = userData.partDefinition
	const config = settings.getConfig(context)

	const externalId = generateExternalId(context, actionId, [file])

	const currentPiece = settings.SelectedAdlibs
		? await context
				.getPieceInstances('current')
				.then(pieceInstances => pieceInstances.find(p => isServerOnPgm(p, settings, userData.voLayer)))
		: undefined

	const basePart = await CreatePartServerBase(
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
			adLibPix: userData.adLibPix,
			lastServerPosition: await getServerPosition(context),
			actionTriggerMode: triggerMode
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

	await context.queuePart(part, [
		activeServerPiece,
		serverDataStore,
		...grafikPieces,
		...(settings.SelectedAdlibs
			? await getPiecesToPreserve(context, settings.SelectedAdlibs.SELECTED_ADLIB_LAYERS, [
					settings.SelectedAdlibs.SourceLayer.VO,
					settings.SelectedAdlibs.SourceLayer.Server
			  ])
			: []),
		...effektPieces
	])

	if (settings.SelectedAdlibs && !currentPiece) {
		await context.stopPiecesOnLayers([
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

function isServerOnPgm<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	pieceInstance: IBlueprintPieceInstance,
	settings: ActionExecutionSettings<StudioConfig, ShowStyleConfig>,
	voLayer: boolean
) {
	return (
		pieceInstance.piece.sourceLayerId === (voLayer ? settings.SourceLayers.VO : settings.SourceLayers.Server) ||
		(pieceInstance.piece.sourceLayerId === settings.SourceLayers.DVEAdLib &&
			dveContainsServer((pieceInstance.piece.metaData as DVEPieceMetaData).sources))
	)
}

async function executeActionSelectDVE<
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

	const parsedCue: CueDefinitionDVE = userData.config

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
		sisyfosPersistMetaData: {
			sisyfosLayers: []
		},
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
		prerollDuration: Number(config.studio.CasparPrerollDuration) || 0,
		metaData,
		tags: [
			GetTagForDVE(userData.segmentExternalId, parsedCue.template, parsedCue.sources),
			GetTagForDVENext(userData.segmentExternalId, parsedCue.template, parsedCue.sources),
			TallyTags.DVE_IS_LIVE
		]
	})

	dvePiece = await cutServerToBox(context, settings, dvePiece)

	await startNewDVELayout(
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

async function cutServerToBox<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	context: ITV2ActionExecutionContext,
	settings: ActionExecutionSettings<StudioConfig, ShowStyleConfig>,
	newDvePiece: IBlueprintPiece,
	containedServerBefore?: boolean,
	modifiesCurrent?: boolean
): Promise<IBlueprintPiece> {
	// Check if DVE should continue server + copy server properties

	if (!newDvePiece.metaData) {
		return newDvePiece
	}

	const meta = newDvePiece.metaData as DVEPieceMetaData

	const containsServer = dveContainsServer(meta.sources)

	if (!containsServer) {
		if (containedServerBefore) {
			stopServerMetaData(context, meta)
		}
		return newDvePiece
	}

	if (newDvePiece.content?.timelineObjects) {
		const currentServer = await context
			.getPieceInstances('current')
			.then(currentPieces =>
				currentPieces.find(
					p =>
						p.piece.sourceLayerId === settings.SelectedAdlibs?.SourceLayer.Server ||
						p.piece.sourceLayerId === settings.SelectedAdlibs?.SourceLayer.VO
				)
			)

		if (!currentServer || !currentServer.piece.content?.timelineObjects) {
			context.notifyUserWarning(`No server is playing, cannot start DVE`)
			return newDvePiece
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
		const ssrcObjIndex = newDvePiece.content?.timelineObjects
			? (newDvePiece.content?.timelineObjects as TSR.TSRTimelineObj[]).findIndex(
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
			return newDvePiece
		}

		const ssrcObj = newDvePiece.content.timelineObjects[ssrcObjIndex] as TSR.TSRTimelineObj & TimelineBlueprintExt

		ssrcObj.metaData = {
			...ssrcObj.metaData,
			mediaPlayerSession: existingCasparObj.metaData.mediaPlayerSession
		}

		newDvePiece.content.timelineObjects[ssrcObjIndex] = ssrcObj
		newDvePiece.content.timelineObjects.push(EnableServer(existingCasparObj.metaData.mediaPlayerSession))
		;(newDvePiece.metaData as any).mediaPlayerSessions = [existingCasparObj.metaData.mediaPlayerSession]

		if (!containedServerBefore) {
			startServerMetaData(context, meta, modifiesCurrent)
		}
	}

	return newDvePiece
}

function stopServerMetaData(context: ITV2ActionExecutionContext, metaData: DVEPieceMetaData) {
	const length = metaData.serverPlaybackTiming?.length
	if (metaData.serverPlaybackTiming && length) {
		metaData.serverPlaybackTiming[length - 1].end = context.getCurrentTime()
	}
}

function startServerMetaData(
	context: ITV2ActionExecutionContext,
	metaData: DVEPieceMetaData,
	modifiesCurrent?: boolean
) {
	if (!metaData.serverPlaybackTiming) {
		metaData.serverPlaybackTiming = []
	}
	metaData.serverPlaybackTiming.push(modifiesCurrent ? { start: context.getCurrentTime() } : {})
}

async function executeActionSelectDVELayout<
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

	const nextPart = await context.getPartInstance('next')

	const nextDVE = await context
		.getPieceInstances('next')
		.then(nextPieceInstances => nextPieceInstances.find(p => p.piece.sourceLayerId === settings.SourceLayers.DVE))

	const meta = nextDVE?.piece.metaData as DVEPieceMetaData

	if (!nextPart || !nextDVE || !meta || nextPart.segmentId !== (await context.getPartInstance('current'))?.segmentId) {
		const content = MakeContentDVE2(context, config, userData.config, {}, sources, settings.DVEGeneratorOptions)

		if (!content.valid) {
			return
		}

		const newMetaData = literal<DVEPieceMetaData & PieceMetaData>({
			sources,
			config: userData.config,
			sisyfosPersistMetaData: {
				sisyfosLayers: []
			},
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

		newDVEPiece = await cutServerToBox(context, settings, newDVEPiece)

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
		config: userData.config,
		sisyfosPersistMetaData: {
			sisyfosLayers: []
		}
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

	dvePiece = await cutServerToBox(context, settings, dvePiece)

	await startNewDVELayout(
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

async function startNewDVELayout<
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
			expectedDuration: 0
		})

		const currentPieceInstances = await context.getPieceInstances('current')
		// If a DVE is not on air, but a layout is selected, stop the selected layout and replace with the new one.
		const onAirPiece = currentPieceInstances.find(p => p.piece.sourceLayerId === settings.SourceLayers.DVE)

		const dataPiece =
			settings.SelectedAdlibs &&
			currentPieceInstances.find(p => p.piece.sourceLayerId === settings.SelectedAdlibs!.SourceLayer.DVE)

		if (onAirPiece === undefined && dataPiece !== undefined) {
			await context.stopPieceInstances([dataPiece._id])
		}
		dvePiece.prerollDuration = config.studio.CasparPrerollDuration
		await context.queuePart(newPart, [
			dvePiece,
			...(dveDataStore ? [dveDataStore] : []),
			...(settings.SelectedAdlibs
				? await getPiecesToPreserve(
						context,
						settings.SelectedAdlibs.SELECTED_ADLIB_LAYERS,
						settings.SelectedAdlibs.SourceLayer.DVE ? [settings.SelectedAdlibs.SourceLayer.DVE] : []
				  )
				: [])
		])
		if (settings.SelectedAdlibs.SourceLayer.DVE) {
			await context.stopPiecesOnLayers([settings.SelectedAdlibs.SourceLayer.DVE])
		}
	} else {
		if (replacePieceInstancesOrQueue.activeDVE) {
			await context.updatePieceInstance(replacePieceInstancesOrQueue.activeDVE, dvePiece)
			await context.updatePartInstance(part, { expectedDuration: 0 })
			if (dveDataStore) {
				if (replacePieceInstancesOrQueue.dataStore) {
					await context.updatePieceInstance(replacePieceInstancesOrQueue.dataStore, dveDataStore)
				} else {
					await context.insertPiece(part, dveDataStore)
				}
			}
		}
	}
}

async function executeActionSelectJingle<
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

	const props = GetJinglePartPropertiesFromTableValue(jingle)

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
		prerollDuration: config.studio.CasparPrerollDuration + TimeFromFrames(Number(jingle.StartAlpha)),
		content: pieceContent,
		tags: [
			GetTagForJingle(userData.segmentExternalId, userData.clip),
			GetTagForJingleNext(userData.segmentExternalId, userData.clip),
			TallyTags.JINGLE_IS_LIVE,
			TallyTags.JINGLE
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

	await context.queuePart(part, [
		piece,
		...(jingleDataStore ? [] : []),
		...(settings.SelectedAdlibs
			? await getPiecesToPreserve(
					context,
					settings.SelectedAdlibs.SELECTED_ADLIB_LAYERS,
					settings.SelectedAdlibs.SourceLayer.Effekt ? [settings.SelectedAdlibs.SourceLayer.Effekt] : []
			  )
			: [])
	])

	if (settings.SelectedAdlibs.SourceLayer.Effekt) {
		await context.stopPiecesOnLayers([settings.SelectedAdlibs.SourceLayer.Effekt])
	}
}

async function executeActionCutToCamera<
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

	const currentPieceInstances = await context.getPieceInstances('current')

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
		metaData: {
			sisyfosPersistMetaData: literal<SisyfosPersistMetaData>({
				sisyfosLayers: [],
				acceptPersistAudio: sourceInfoCam.acceptPersistAudio,
				isPieceInjectedInPart: true
			})
		},
		tags: [GetTagForKam(userData.name)],
		content: {
			timelineObjects: _.compact<TSR.TSRTimelineObj[]>([
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
				camSisyfos
			])
		}
	})

	settings.postProcessPieceTimelineObjects(context, config, kamPiece, false)

	if (userData.queue || serverInCurrentPart) {
		await context.queuePart(part, [
			kamPiece,
			...(settings.SelectedAdlibs
				? await getPiecesToPreserve(context, settings.SelectedAdlibs.SELECTED_ADLIB_LAYERS, [])
				: [])
		])

		if (serverInCurrentPart && !userData.queue) {
			await context.takeAfterExecuteAction(true)
		}
	} else if (currentKam) {
		kamPiece.externalId = currentKam.piece.externalId
		kamPiece.enable = currentKam.piece.enable
		const currentMetaData = currentKam.piece.metaData as PieceMetaData
		const metaData = kamPiece.metaData as PieceMetaData
		metaData.sisyfosPersistMetaData!.previousPersistMetaDataForCurrentPiece = currentMetaData.sisyfosPersistMetaData

		await context.updatePieceInstance(currentKam._id, kamPiece)
	} else {
		const currentExternalId = await context
			.getPartInstance('current')
			.then(currentPartInstance => currentPartInstance?.part.externalId)

		if (currentExternalId) {
			kamPiece.externalId = currentExternalId
		}

		await context.stopPiecesOnLayers([
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
		await context.insertPiece('current', kamPiece)
	}
}

async function executeActionCutToRemote<
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
		...GetSisyfosTimelineObjForEkstern(context, config.sources, `Live ${userData.name}`),
		GetSisyfosTimelineObjForCamera(context, config, 'telefon', settings.LLayer.Sisyfos.StudioMics)
	]

	const sourceInfo = FindSourceInfoStrict(context, config.sources, SourceLayerType.REMOTE, `Live ${userData.name}`)
	const sisyfosPersistMetaData: SisyfosPersistMetaData =
		sourceInfo !== undefined
			? {
					sisyfosLayers: sourceInfo.sisyfosLayers ?? [],
					wantsToPersistAudio: sourceInfo.wantsToPersistAudio,
					acceptPersistAudio: sourceInfo.acceptPersistAudio
			  }
			: { sisyfosLayers: [] }

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
		metaData: {
			sisyfosPersistMetaData
		},
		tags: [GetTagForLive(userData.name)],
		content: {
			timelineObjects: _.compact<TSR.TSRTimelineObj[]>([
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
				...eksternSisyfos
			])
		}
	})

	settings.postProcessPieceTimelineObjects(context, config, remotePiece, false)

	await context.queuePart(part, [
		remotePiece,
		...(settings.SelectedAdlibs
			? await getPiecesToPreserve(context, settings.SelectedAdlibs.SELECTED_ADLIB_LAYERS, [])
			: [])
	])
}

async function executeActionCutSourceToBox<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	context: ITV2ActionExecutionContext,
	settings: ActionExecutionSettings<StudioConfig, ShowStyleConfig>,
	_actionId: string,
	userData: ActionCutSourceToBox
) {
	const config = settings.getConfig(context)

	const currentPieces: IBlueprintPieceInstance[] = await context.getPieceInstances('current')
	const nextPieces: IBlueprintPieceInstance[] = await context.getPieceInstances('next')

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

	if (currentDVE && !currentDVE.stoppedPlayback) {
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

	meta.sisyfosPersistMetaData = {
		sisyfosLayers: []
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
	if (!containsServerBefore || !containsServerAfter) {
		newDVEPiece = await cutServerToBox(context, settings, newDVEPiece, !!containsServerBefore, modify === 'current')
	}

	if (newPieceContent.valid) {
		await startNewDVELayout(
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

async function applyPrerollToWallGraphics<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	context: ITV2ActionExecutionContext,
	settings: ActionExecutionSettings<StudioConfig, ShowStyleConfig>,
	piecesBySourceLayer: PiecesBySourceLayer
) {
	const wallPieces = piecesBySourceLayer[settings.SourceLayers.Wall]
	if (!wallPieces) {
		return
	}
	const enable = GetEnableForWall()
	for (const pieceInstance of wallPieces) {
		if (pieceInstance.piece.content?.timelineObjects && !pieceInstance.infinite?.fromPreviousPart) {
			const newPieceProps = {
				content: pieceInstance.piece.content as WithTimeline<GraphicsContent>
			}
			const timelineObjectsToUpdate = newPieceProps.content.timelineObjects.filter(
				timelineObject =>
					timelineObject.layer === SharedGraphicLLayer.GraphicLLayerWall &&
					(timelineObject.content.deviceType === TSR.DeviceType.VIZMSE ||
						timelineObject.content.deviceType === TSR.DeviceType.CASPARCG)
			)
			timelineObjectsToUpdate.forEach(timelineObject => {
				timelineObject.enable = enable
			})
			await context.updatePieceInstance(pieceInstance._id, newPieceProps)
		}
	}
}

async function executeActionTakeWithTransition<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	context: ITV2ActionExecutionContext,
	settings: ActionExecutionSettings<StudioConfig, ShowStyleConfig>,
	actionId: string,
	userData: ActionTakeWithTransition
) {
	const externalId = generateExternalId(context, actionId, [userData.variant.type])

	const nextPieces: IBlueprintPieceInstance[] = await context.getPieceInstances('next')

	const nextPiecesBySourceLayer = groupPiecesBySourceLayer(nextPieces)
	const primaryPiece = findPrimaryPieceUsingPriority(settings, nextPiecesBySourceLayer)

	await context.takeAfterExecuteAction(userData.takeNow)

	if (
		!primaryPiece ||
		!primaryPiece.piece.content ||
		primaryPiece.piece.sourceLayerId === settings.SourceLayers.Effekt
	) {
		return
	}

	const timelineObjectIndex = (primaryPiece.piece.content.timelineObjects as TSR.TSRTimelineObj[]).findIndex(
		obj =>
			obj.layer === (settings.LLayer.Atem.cutOnclean ? settings.LLayer.Atem.MEClean : settings.LLayer.Atem.MEProgram) &&
			obj.content.deviceType === TSR.DeviceType.ATEM &&
			obj.content.type === TSR.TimelineContentTypeAtem.ME
	)

	const timelineObject =
		timelineObjectIndex > -1
			? ((primaryPiece.piece.content.timelineObjects as TSR.TSRTimelineObj[])[
					timelineObjectIndex
			  ] as TSR.TimelineObjAtemME)
			: undefined

	if (!timelineObject) {
		return
	}

	const existingEffektPiece = nextPieces.find(p => p.piece.sourceLayerId === settings.SourceLayers.Effekt)

	if (existingEffektPiece) {
		await context.removePieceInstances('next', [existingEffektPiece._id])
	}

	let partProps: Partial<IBlueprintPart> | false = false

	switch (userData.variant.type) {
		case 'cut':
			{
				timelineObject.content.me.transition = TSR.AtemTransitionStyle.CUT

				primaryPiece.piece.content.timelineObjects[timelineObjectIndex] = timelineObject

				await context.updatePieceInstance(primaryPiece._id, primaryPiece.piece)

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
					inTransition: undefined
				}

				await context.insertPiece('next', cutTransitionPiece)
				await context.updatePartInstance('next', partProps)
			}
			break
		case 'breaker': {
			timelineObject.content.me.transition = TSR.AtemTransitionStyle.CUT

			primaryPiece.piece.content.timelineObjects[timelineObjectIndex] = timelineObject

			await context.updatePieceInstance(primaryPiece._id, primaryPiece.piece)

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
				await context.updatePartInstance('next', partProps)
				pieces.forEach(p => context.insertPiece('next', { ...p, tags: [GetTagForTransition(userData.variant)] }))
			}
			break
		}
		case 'mix': {
			await updateTimelineObjectMeTransition(
				context,
				timelineObject,
				TSR.AtemTransitionStyle.MIX,
				MixTransitionSettings(userData.variant.frames),
				primaryPiece,
				timelineObjectIndex
			)

			const blueprintPiece: IBlueprintPiece = CreateMixTransitionBlueprintPieceForPart(
				externalId,
				userData.variant.frames,
				settings.SourceLayers.Effekt
			)

			partProps = CreateInTransitionForAtemTransitionStyle(userData.variant.frames)
			await context.updatePartInstance('next', partProps)
			await context.insertPiece('next', { ...blueprintPiece, tags: [GetTagForTransition(userData.variant)] })

			break
		}
		case 'dip': {
			const config = settings.getConfig(context)
			await updateTimelineObjectMeTransition(
				context,
				timelineObject,
				TSR.AtemTransitionStyle.DIP,
				DipTransitionSettings(config, userData.variant.frames),
				primaryPiece,
				timelineObjectIndex
			)
			const blueprintPiece: IBlueprintPiece = CreateDipTransitionBlueprintPieceForPart(
				externalId,
				userData.variant.frames,
				settings.SourceLayers.Effekt
			)

			partProps = CreateInTransitionForAtemTransitionStyle(userData.variant.frames)
			await context.updatePartInstance('next', partProps)
			await context.insertPiece('next', { ...blueprintPiece, tags: [GetTagForTransition(userData.variant)] })
			break
		}
	}

	if (partProps) {
		await applyPrerollToWallGraphics(context, settings, nextPiecesBySourceLayer)
	}
}

async function updateTimelineObjectMeTransition(
	context: ITV2ActionExecutionContext,
	timelineObject: TSR.TimelineObjAtemME,
	transitionStyle: TSR.AtemTransitionStyle,
	transitionSettings: TSR.AtemTransitionSettings,
	pieceInstance: IBlueprintPieceInstance,
	indexOfTimelineObject: number
): Promise<void> {
	timelineObject.content.me.transition = transitionStyle
	timelineObject.content.me.transitionSettings = transitionSettings

	pieceInstance.piece.content.timelineObjects[indexOfTimelineObject] = timelineObject
	await context.updatePieceInstance(pieceInstance._id, pieceInstance.piece)
}

async function findPieceToRecoverDataFrom(
	context: ITV2ActionExecutionContext,
	dataStoreLayers: string[]
): Promise<{ piece: IBlueprintPieceInstance; part: 'current' | 'next' } | undefined> {
	const pieces = await Promise.all([context.getPieceInstances('current'), context.getPieceInstances('next')])
	const currentPieces = pieces[0]
	const nextPieces = pieces[1]

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

async function findDataStore<T extends TV2AdlibAction>(
	context: ITV2ActionExecutionContext,
	dataStoreLayers: string[]
): Promise<T | undefined> {
	const dataStorePiece = await findPieceToRecoverDataFrom(context, dataStoreLayers)

	if (!dataStorePiece) {
		return
	}

	return (dataStorePiece.piece.piece.metaData as any)?.userData as T | undefined
}

async function findMediaPlayerSessions(
	context: ITV2ActionExecutionContext,
	sessionLayers: string[]
): Promise<{ session: string | undefined; part: 'current' | 'next' | undefined }> {
	const mediaPlayerSessionPiece = await findPieceToRecoverDataFrom(context, sessionLayers)

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

async function executeActionCommentatorSelectServer<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	context: ITV2ActionExecutionContext,
	settings: ActionExecutionSettings<StudioConfig, ShowStyleConfig>,
	_actionId: string,
	_userData: ActionCommentatorSelectServer
) {
	const data = await findDataStore<ActionSelectServerClip>(context, [
		settings.SelectedAdlibs.SourceLayer.Server,
		settings.SelectedAdlibs.SourceLayer.VO
	])

	if (!data) {
		return
	}

	const sessions = await findMediaPlayerSessions(context, [
		settings.SelectedAdlibs.SourceLayer.Server,
		settings.SelectedAdlibs.SourceLayer.VO
	])

	let session: string | undefined
	if (sessions.session && sessions.part && sessions.part === 'current') {
		session = sessions.session
	}

	await executeActionSelectServerClip(
		context,
		settings,
		AdlibActionType.SELECT_SERVER_CLIP,
		data,
		ServerSelectMode.RESET,
		session
	)
}

async function executeActionCommentatorSelectDVE<
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

	const data = await findDataStore<ActionSelectDVE>(context, [settings.SelectedAdlibs.SourceLayer.DVE])

	if (!data) {
		return
	}

	await executeActionSelectDVE(context, settings, AdlibActionType.SELECT_DVE, data)
}

async function executeActionCommentatorSelectFull<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	context: ITV2ActionExecutionContext,
	settings: ActionExecutionSettings<StudioConfig, ShowStyleConfig>,
	_actionId: string,
	_userData: ActionCommentatorSelectFull
) {
	const data = await findDataStore<ActionSelectFullGrafik>(context, [SharedSourceLayers.SelectedAdlibGraphicsFull])

	if (!data) {
		return
	}

	await executeActionSelectFull(context, settings, AdlibActionType.SELECT_FULL_GRAFIK, data)
}

async function executeActionCommentatorSelectJingle<
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

	const data = await findDataStore<ActionSelectJingle>(context, [settings.SelectedAdlibs.SourceLayer.Effekt])

	if (!data) {
		return
	}

	await executeActionSelectJingle(context, settings, AdlibActionType.SELECT_JINGLE, data)
}

async function executeActionRecallLastLive<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	context: ITV2ActionExecutionContext,
	settings: ActionExecutionSettings<StudioConfig, ShowStyleConfig>,
	actionId: string,
	_userData: ActionRecallLastLive
) {
	const lastLive = await context.findLastPieceOnLayer(settings.SourceLayers.Live, {
		originalOnly: true,
		excludeCurrentPart: false
	})

	if (!lastLive) {
		return
	}

	const lastIdent = await context.findLastPieceOnLayer(settings.SourceLayers.Ident, {
		originalOnly: true,
		excludeCurrentPart: false
	})

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

	await context.queuePart(part, pieces)
}

async function executeActionRecallLastDVE<
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

	const lastPlayedScheduledDVE: IBlueprintPieceInstance | undefined = await context.findLastPieceOnLayer(
		settings.SourceLayers.DVE,
		{
			originalOnly: true
		}
	)
	const isLastPlayedAScheduledDVE: boolean = !lastPlayedScheduledDVE?.dynamicallyInserted

	if (lastPlayedScheduledDVE && isLastPlayedAScheduledDVE) {
		await scheduleLastPlayedDVE(context, settings, actionId, lastPlayedScheduledDVE)
	} else {
		await scheduleNextScriptedDVE(context, settings, actionId)
	}
}

async function executeActionFadeDownPersistedAudioLevels<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(context: ITV2ActionExecutionContext, _settings: ActionExecutionSettings<StudioConfig, ShowStyleConfig>) {
	const fadeSisyfosMetaData = await createFadeSisyfosLevelsMetaData(context)
	const resetSisyfosPersistedLevelsPiece: IBlueprintPiece = {
		externalId: 'fadeSisyfosPersistedLevelsDown',
		name: FADE_SISYFOS_LEVELS_PIECE_NAME,
		outputLayerId: '',
		sourceLayerId: '',
		enable: { start: 'now' },
		lifespan: PieceLifespan.WithinPart,
		metaData: literal<PieceMetaData>({
			sisyfosPersistMetaData: fadeSisyfosMetaData
		}),
		content: {
			timelineObjects: []
		}
	}
	context.insertPiece('current', resetSisyfosPersistedLevelsPiece)
}

async function createFadeSisyfosLevelsMetaData(context: ITV2ActionExecutionContext) {
	const resolvedPieceInstances: IBlueprintResolvedPieceInstance[] = await context.getResolvedPieceInstances('current')
	const emptySisyfosMetaData: SisyfosPersistMetaData = {
		sisyfosLayers: []
	}
	if (resolvedPieceInstances.length === 0) {
		return emptySisyfosMetaData
	}

	const latestPiece: IBlueprintResolvedPieceInstance = resolvedPieceInstances
		.filter(piece => piece.piece.name !== FADE_SISYFOS_LEVELS_PIECE_NAME)
		.sort((a, b) => b.resolvedStart - a.resolvedStart)[0]

	const latestPieceMetaData = latestPiece.piece.metaData as PieceMetaData

	if (!latestPieceMetaData || !latestPieceMetaData.sisyfosPersistMetaData) {
		return emptySisyfosMetaData
	}

	return {
		sisyfosLayers: latestPieceMetaData.sisyfosPersistMetaData.sisyfosLayers,
		wantsToPersistAudio: latestPieceMetaData.sisyfosPersistMetaData.wantsToPersistAudio,
		acceptPersistAudio: false
	}
}

async function executeActionPlayGraphics<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	context: ITV2ActionExecutionContext,
	settings: ActionExecutionSettings<StudioConfig, ShowStyleConfig>,
	actionId: string,
	userData: ActionPlayGraphics
): Promise<void> {
	if (!IsTargetingOVL(userData.graphic.target)) {
		return
	}

	const currentPartInstance = await context.getPartInstance('current')
	const externalId = currentPartInstance?.part.externalId ?? generateExternalId(context, actionId, [])

	const internalGraphic: InternalGraphic = new InternalGraphic(
		settings.getConfig(context),
		userData.graphic,
		true,
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

async function scheduleLastPlayedDVE<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	context: ITV2ActionExecutionContext,
	settings: ActionExecutionSettings<StudioConfig, ShowStyleConfig>,
	actionId: string,
	lastPlayedDVE: IBlueprintPieceInstance
): Promise<void> {
	const lastPlayedDVEMeta: DVEPieceMetaData = lastPlayedDVE.piece.metaData as DVEPieceMetaData
	const externalId: string = generateExternalId(context, actionId, [lastPlayedDVE.piece.name])

	await executeActionSelectDVE(
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

async function scheduleNextScriptedDVE<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	context: ITV2ActionExecutionContext,
	settings: ActionExecutionSettings<StudioConfig, ShowStyleConfig>,
	actionId: string
): Promise<void> {
	const nextScriptedDVE: IBlueprintPiece | undefined = await context.findLastScriptedPieceOnLayer(
		settings.SourceLayers.DVE
	)

	if (!nextScriptedDVE) {
		return
	}

	const externalId: string = generateExternalId(context, actionId, [nextScriptedDVE.name])
	const dveMeta: DVEPieceMetaData = nextScriptedDVE.metaData as DVEPieceMetaData

	await executeActionSelectDVE(
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

async function executeActionSelectFull<
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
	const previousPartKeepaliveDuration =
		graphicType === 'HTML'
			? config.studio.HTMLGraphics.KeepAliveDuration
			: config.studio.VizPilotGraphics.KeepAliveDuration

	const part = literal<IBlueprintPart>({
		externalId,
		title: `Full ${template}`,
		metaData: {},
		expectedDuration: 0,
		inTransition: {
			previousPartKeepaliveDuration,
			partContentDelayDuration: 0,
			blockTakeDuration: 0
		}
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
		externalId,
		cue,
		'FULL',
		settings.pilotGraphicSettings,
		true,
		userData.segmentExternalId,
		prerollDuration
	)

	settings.postProcessPieceTimelineObjects(context, config, fullPiece, false)

	const fullDataStore = CreateFullDataStore(
		config,
		context,
		settings.pilotGraphicSettings,
		cue,
		'FULL',
		externalId,
		true,
		userData.segmentExternalId
	)

	await context.queuePart(part, [
		fullPiece,
		...(fullDataStore ? [fullDataStore] : []),
		...(await getPiecesToPreserve(context, settings.SelectedAdlibs.SELECTED_ADLIB_LAYERS, [
			SharedSourceLayers.SelectedAdlibGraphicsFull
		]))
	])

	await context.stopPiecesOnLayers([SharedSourceLayers.SelectedAdlibGraphicsFull])
}

async function executeActionClearGraphics<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	context: ITV2ActionExecutionContext,
	settings: ActionExecutionSettings<StudioConfig, ShowStyleConfig>,
	_actionId: string,
	userData: ActionClearGraphics
) {
	const config = settings.getConfig(context)

	await context.stopPiecesOnLayers(STOPPABLE_GRAPHICS_LAYERS)
	await context.insertPiece(
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
									layer: SharedGraphicLLayer.GraphicLLayerAdLibs,
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
									layer: SharedGraphicLLayer.GraphicLLayerAdLibs,
									content: {
										deviceType: TSR.DeviceType.VIZMSE,
										type: TSR.TimelineContentTypeVizMSE.CLEAR_ALL_ELEMENTS,
										channelsToSendCommands: userData.sendCommands ? ['OVL1', 'FULL1', 'WALL1'] : undefined,
										showId: config.selectedGraphicsSetup.OvlShowId
									}
								})
							]
					  },
			tags: userData.sendCommands ? [TallyTags.GFX_CLEAR] : [TallyTags.GFX_ALTUD]
		})
	)
}
