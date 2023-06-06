import {
	ActionUserData,
	HackPartMediaObjectSubscription,
	IActionExecutionContext,
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPart,
	IBlueprintPiece,
	IBlueprintPieceDB,
	IBlueprintPieceInstance,
	IBlueprintResolvedPieceInstance,
	PieceLifespan,
	SplitsContent,
	TimelineObjectCoreExt,
	TSR,
	VTContent,
	WithTimeline
} from 'blueprints-integration'
import {
	ActionClearAllGraphics,
	ActionCutSourceToBox,
	ActionCutToCamera,
	ActionCutToRemote,
	ActionExecutionContext,
	ActionSelectDVE,
	ActionSelectDVELayout,
	ActionSelectFullGrafik,
	ActionSelectServerClip,
	calculateTime,
	createDipTransitionBlueprintPieceForPart,
	createInTransitionForTransitionStyle,
	CreatePartServerBase,
	CueDefinition,
	CueDefinitionDVE,
	CueDefinitionGraphic,
	DVEOptions,
	DVEPieceMetaData,
	DVESources,
	EvaluateCuesOptions,
	executeWithContext,
	findLastPlayingPieceInstance,
	GetDVETemplate,
	getServerPosition,
	GetSisyfosTimelineObjForCamera,
	GetSisyfosTimelineObjForRemote,
	getTimeFromFrames,
	GraphicPilot,
	literal,
	MakeContentDVE2,
	PartDefinition,
	PartEndStateExt,
	PieceMetaData,
	PilotGraphicGenerator,
	ServerSelectMode,
	ShowStyleContext,
	SisyfosPersistenceMetaData,
	TableConfigItemBreaker,
	TimelineBlueprintExt,
	TransitionStyle,
	TV2AdlibAction,
	TV2BlueprintConfigBase,
	TV2ShowStyleConfig,
	TV2StudioConfigBase,
	UniformConfig
} from 'tv2-common'
import {
	AdlibActionType,
	ControlClasses,
	CueType,
	PartType,
	SharedGraphicLLayer,
	SharedOutputLayer,
	SharedSisyfosLLayer,
	SharedSourceLayer,
	SourceType,
	TallyTags
} from 'tv2-constants'
import _ = require('underscore')
import { EnableServer } from '../content'
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
import { createTelemetricsPieceForRobotCamera } from '../pieces/telemetric'
import { findSourceInfo } from '../sources'
import { assertUnreachable } from '../util'
import { ActionSelectJingle, ActionTakeWithTransition } from './actionTypes'

const STOPPABLE_GRAPHICS_LAYERS = [
	SharedSourceLayer.PgmGraphicsIdent,
	SharedSourceLayer.PgmGraphicsTop,
	SharedSourceLayer.PgmGraphicsLower,
	SharedSourceLayer.PgmGraphicsHeadline,
	SharedSourceLayer.PgmGraphicsTema,
	SharedSourceLayer.PgmGraphicsOverlay,
	SharedSourceLayer.PgmPilotOverlay,
	SharedSourceLayer.PgmGraphicsTLF
]

export interface ActionExecutionSettings<BlueprintConfig extends TV2ShowStyleConfig = TV2ShowStyleConfig> {
	EvaluateCues: (
		context: ShowStyleContext<BlueprintConfig>,
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
		context: ShowStyleContext<BlueprintConfig>,
		file: string,
		breakerConfig: TableConfigItemBreaker
	) => WithTimeline<VTContent>
	serverActionSettings: ServerActionSettings
}

interface ServerActionSettings {
	defaultTriggerMode: ServerSelectMode
}

export async function executeAction<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	coreContext: IActionExecutionContext,
	uniformConfig: UniformConfig,
	settings: ActionExecutionSettings<ShowStyleConfig>,
	actionIdStr: string,
	userData: ActionUserData,
	triggerMode?: string
): Promise<void> {
	await executeWithContext<ShowStyleConfig>(coreContext, uniformConfig, async (context) => {
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
				await executeActionSelectFull(context, settings, userData as ActionSelectFullGrafik)
				break
			case AdlibActionType.SELECT_JINGLE:
				await executeActionSelectJingle(context, settings, actionId, userData as ActionSelectJingle)
				break
			case AdlibActionType.CLEAR_ALL_GRAPHICS:
				await executeActionClearAllGraphics(context, userData as ActionClearAllGraphics)
				break
			case AdlibActionType.CLEAR_TEMA_GRAPHICS:
				await executeActionClearTemaGraphics(context)
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
				await executeActionCommentatorSelectDVE(context, settings)
				break
			case AdlibActionType.COMMENTATOR_SELECT_SERVER:
				await executeActionCommentatorSelectServer(context, settings)
				break
			case AdlibActionType.COMMENTATOR_SELECT_FULL:
				await executeActionCommentatorSelectFull(context, settings)
				break
			case AdlibActionType.COMMENTATOR_SELECT_JINGLE:
				await executeActionCommentatorSelectJingle(context, settings)
				break
			case AdlibActionType.TAKE_WITH_TRANSITION:
				await executeActionTakeWithTransition(context, settings, actionId, userData as ActionTakeWithTransition)
				break
			case AdlibActionType.RECALL_LAST_LIVE:
				await executeActionRecallLastLive(context, settings, actionId)
				break
			case AdlibActionType.RECALL_LAST_DVE:
				await executeActionRecallLastDVE(context, settings, actionId)
				break
			case AdlibActionType.FADE_DOWN_PERSISTED_AUDIO_LEVELS:
				await executeActionFadeDownPersistedAudioLevels(context)
				break
			case AdlibActionType.CALL_ROBOT_PRESET: {
				const preset: number = Number(triggerMode)
				if (Number.isNaN(preset)) {
					context.core.notifyUserWarning(`Calling Robot preset ignored. '${triggerMode}' is not a number`)
					break
				}
				await executeActionCallRobotPreset(context, preset)
				break
			}
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
	context: ActionExecutionContext<ShowStyleConfig>,
	settings: ActionExecutionSettings<ShowStyleConfig>,
	part: 'current' | 'next'
): Promise<ActionTakeWithTransition | undefined> {
	const existingTransition = await context.core
		.getPieceInstances(part)
		.then((pieceInstances) => pieceInstances.find((p) => p.piece.sourceLayerId === settings.SourceLayers.Effekt))

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

function sanitizePieceId(piece: IBlueprintPieceDB<PieceMetaData>): IBlueprintPiece<PieceMetaData> {
	return _.omit(piece, ['_id', 'partId', 'infiniteId', 'playoutDuration'])
}

export async function getPiecesToPreserve(
	context: ActionExecutionContext,
	adlibLayers: string[],
	ignoreLayers: string[]
): Promise<Array<IBlueprintPiece<PieceMetaData>>> {
	const currentPartSegmentId = await context.core
		.getPartInstance('current')
		.then((partInstance) => partInstance?.segmentId)
	const nextPartSegmentId = await context.core.getPartInstance('next').then((partInstance) => partInstance?.segmentId)

	if (!currentPartSegmentId || !nextPartSegmentId) {
		return []
	}

	if (currentPartSegmentId !== nextPartSegmentId) {
		return []
	}

	return context.core.getPieceInstances('next').then((pieceInstances) => {
		return pieceInstances
			.filter((p) => adlibLayers.includes(p.piece.sourceLayerId) && !ignoreLayers.includes(p.piece.sourceLayerId))
			.filter((p) => !p.infinite?.fromPreviousPart && !p.infinite?.fromPreviousPlayhead)
			.map<IBlueprintPiece<PieceMetaData>>((p) => p.piece)
			.map((p) => sanitizePieceStart(p))
			.map((p) => sanitizePieceId(p as IBlueprintPieceDB<PieceMetaData>))
	})
}

function generateExternalId(context: ActionExecutionContext, actionId: string, args: string[]): string {
	return `adlib_action_${actionId}_${context.core.getHashId(args.join('_'), true)}`
}

async function executeActionSelectServerClip<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	context: ActionExecutionContext<ShowStyleConfig>,
	settings: ActionExecutionSettings<ShowStyleConfig>,
	actionId: string,
	userData: ActionSelectServerClip,
	triggerMode?: ServerSelectMode,
	sessionToContinue?: string
) {
	const file = userData.file
	const partDefinition = userData.partDefinition

	const externalId = generateExternalId(context, actionId, [file])

	const currentPiece = settings.SelectedAdlibs
		? await context.core
				.getPieceInstances('current')
				.then((pieceInstances) => pieceInstances.find((p) => isServerOnPgm(p, settings, userData.voLayer)))
		: undefined

	const basePart = await CreatePartServerBase(
		context,
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
			actionTriggerMode: triggerMode ?? settings.serverActionSettings.defaultTriggerMode
		},
		{
			SourceLayer: {
				PgmServer: userData.voLayer ? settings.SourceLayers.VO : settings.SourceLayers.Server,
				SelectedServer: userData.voLayer
					? settings.SelectedAdlibs.SourceLayer.VO
					: settings.SelectedAdlibs.SourceLayer.Server
			},
			Caspar: {
				ClipPending: settings.LLayer.Caspar.ClipPending
			},
			Sisyfos: {
				ClipPending: settings.LLayer.Sisyfos.ClipPending
			}
		}
	)

	const activeServerPiece = basePart.part.pieces.find(
		(p) => p.sourceLayerId === settings.SourceLayers.Server || p.sourceLayerId === settings.SourceLayers.VO
	)

	const serverDataStore = basePart.part.pieces.find(
		(p) =>
			p.sourceLayerId === settings.SelectedAdlibs.SourceLayer.Server ||
			p.sourceLayerId === settings.SelectedAdlibs.SourceLayer.VO
	)

	let part = basePart.part.part

	const grafikPieces: Array<IBlueprintPiece<PieceMetaData>> = []
	const effektPieces: Array<IBlueprintPiece<PieceMetaData>> = []

	part = {
		...part,
		...CreateEffektForPartBase(context, partDefinition, effektPieces, {
			sourceLayer: settings.SourceLayers.Effekt,
			sisyfosLayer: settings.LLayer.Sisyfos.Effekt,
			casparLayer: settings.LLayer.Caspar.Effekt
		})
	}

	settings.EvaluateCues(context, basePart.part.part, grafikPieces, [], [], [], partDefinition.cues, partDefinition, {
		excludeAdlibs: true,
		selectedCueTypes: [CueType.Graphic]
	})

	if (basePart.invalid || !activeServerPiece || !serverDataStore) {
		context.core.notifyUserWarning(`Could not start server clip`)
		return
	}

	await context.core.queuePart(part, [
		activeServerPiece as IBlueprintPiece<PieceMetaData>, // @todo: get rid of these casts
		serverDataStore as IBlueprintPiece<PieceMetaData>,
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
		await context.core.stopPiecesOnLayers([
			userData.voLayer ? settings.SelectedAdlibs.SourceLayer.VO : settings.SelectedAdlibs.SourceLayer.Server
		])
	}
}

function dveContainsServer(sources: DVESources): boolean {
	return (
		sources.INP1?.sourceType === SourceType.SERVER ||
		sources.INP2?.sourceType === SourceType.SERVER ||
		sources.INP3?.sourceType === SourceType.SERVER ||
		sources.INP4?.sourceType === SourceType.SERVER
	)
}

function isServerOnPgm<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(pieceInstance: IBlueprintPieceInstance, settings: ActionExecutionSettings<ShowStyleConfig>, voLayer: boolean) {
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
	context: ActionExecutionContext<ShowStyleConfig>,
	settings: ActionExecutionSettings<ShowStyleConfig>,
	actionId: string,
	userData: ActionSelectDVE
) {
	const externalId = generateExternalId(context, actionId, [userData.config.template])

	const parsedCue: CueDefinitionDVE = userData.config

	const rawTemplate = GetDVETemplate(context.config.showStyle.DVEStyles, parsedCue.template)
	if (!rawTemplate) {
		context.core.notifyUserWarning(`DVE layout not recognised`)
		return
	}

	const graphicsTemplateContent: { [key: string]: string } = {}
	parsedCue.labels.forEach((label, i) => {
		graphicsTemplateContent[`locator${i + 1}`] = label
	})

	const pieceContent = MakeContentDVE2(
		context,
		rawTemplate,
		graphicsTemplateContent,
		parsedCue.sources,
		settings.DVEGeneratorOptions,
		externalId
	)

	let start = parsedCue.start ? calculateTime(parsedCue.start) : 0
	start = start ? start : 0
	const end = parsedCue.end ? calculateTime(parsedCue.end) : undefined

	const metaData: DVEPieceMetaData = {
		mediaPlayerSessions: dveContainsServer(parsedCue.sources) ? [externalId] : [],
		sources: parsedCue.sources,
		config: rawTemplate,
		userData
	}

	let dvePiece: IBlueprintPiece<DVEPieceMetaData> = {
		externalId,
		name: userData.name,
		enable: {
			start,
			...(end ? { duration: end - start } : {})
		},
		outputLayerId: SharedOutputLayer.PGM,
		sourceLayerId: settings.SourceLayers.DVE,
		lifespan: PieceLifespan.WithinPart,
		toBeQueued: true,
		content: {
			...pieceContent.content
		},
		prerollDuration: Number(context.config.studio.CasparPrerollDuration) || 0,
		metaData,
		tags: [
			GetTagForDVE(userData.segmentExternalId, parsedCue.template, parsedCue.sources),
			GetTagForDVENext(userData.segmentExternalId, parsedCue.template, parsedCue.sources),
			TallyTags.DVE_IS_LIVE
		]
	}

	dvePiece = await cutServerToBox(context, settings, dvePiece)

	await startNewDVELayout(
		context,
		settings,
		dvePiece,
		pieceContent.content,
		metaData,
		parsedCue.template,
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
	context: ActionExecutionContext<ShowStyleConfig>,
	settings: ActionExecutionSettings<ShowStyleConfig>,
	newDvePiece: IBlueprintPiece<DVEPieceMetaData>,
	containedServerBefore?: boolean,
	modifiesCurrent?: boolean
): Promise<IBlueprintPiece<DVEPieceMetaData>> {
	// Check if DVE should continue server + copy server properties

	if (!newDvePiece.metaData) {
		return newDvePiece
	}

	const meta = newDvePiece.metaData

	const containsServer: boolean = dveContainsServer(meta.sources)

	if (!containsServer) {
		if (containedServerBefore) {
			stopServerMetaData(context, meta)
		}
		return newDvePiece
	}

	if (newDvePiece.content?.timelineObjects) {
		const currentServer = await context.core
			.getPieceInstances('current')
			.then((currentPieces) =>
				currentPieces.find(
					(p) =>
						p.piece.sourceLayerId === settings.SelectedAdlibs?.SourceLayer.Server ||
						p.piece.sourceLayerId === settings.SelectedAdlibs?.SourceLayer.VO
				)
			)

		if (!currentServer || !currentServer.piece.content?.timelineObjects) {
			context.core.notifyUserWarning(`No server is playing, cannot start DVE`)
			return newDvePiece
		}

		// Find existing CasparCG object
		const existingCasparObj = (currentServer.piece.content.timelineObjects as TSR.TSRTimelineObj[]).find(
			(obj) => obj.layer === settings.LLayer.Caspar.ClipPending
		) as TSR.TimelineObjCCGMedia & TimelineBlueprintExt
		// Find existing sisyfos object
		const existingSisyfosObj = (currentServer.piece.content.timelineObjects as TSR.TSRTimelineObj[]).find(
			(obj) => obj.layer === settings.LLayer.Sisyfos.ClipPending
		) as TSR.TimelineObjSisyfosChannel & TimelineBlueprintExt
		// Find DVE Boxes object in DVE piece
		const dveBoxesObj = newDvePiece.content.timelineObjects.find(context.videoSwitcher.isDveBoxes) as
			| TimelineBlueprintExt
			| undefined
		if (
			!existingCasparObj ||
			!existingSisyfosObj ||
			!dveBoxesObj ||
			!existingCasparObj.metaData ||
			!existingCasparObj.metaData.mediaPlayerSession
		) {
			context.core.notifyUserWarning(`Failed to start DVE with server`)
			return newDvePiece
		}

		dveBoxesObj.metaData = {
			...dveBoxesObj.metaData,
			mediaPlayerSession: existingCasparObj.metaData.mediaPlayerSession
		}

		newDvePiece.content.timelineObjects.push(EnableServer(existingCasparObj.metaData.mediaPlayerSession))
		newDvePiece.metaData.mediaPlayerSessions = [existingCasparObj.metaData.mediaPlayerSession]

		if (!containedServerBefore) {
			startServerMetaData(context, meta, modifiesCurrent)
		}
	}

	return newDvePiece
}

function stopServerMetaData(context: ActionExecutionContext, metaData: DVEPieceMetaData) {
	const length = metaData.serverPlaybackTiming?.length
	if (metaData.serverPlaybackTiming && length) {
		metaData.serverPlaybackTiming[length - 1].end = context.core.getCurrentTime()
	}
}

function startServerMetaData(context: ActionExecutionContext, metaData: DVEPieceMetaData, modifiesCurrent?: boolean) {
	if (!metaData.serverPlaybackTiming) {
		metaData.serverPlaybackTiming = []
	}
	metaData.serverPlaybackTiming.push(modifiesCurrent ? { start: context.core.getCurrentTime() } : {})
}

async function executeActionSelectDVELayout<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	context: ActionExecutionContext<ShowStyleConfig>,
	settings: ActionExecutionSettings<ShowStyleConfig>,
	actionId: string,
	userData: ActionSelectDVELayout
) {
	if (!settings.SourceLayers.DVEAdLib) {
		return
	}

	const sources: DVESources = {
		INP1: { sourceType: SourceType.DEFAULT },
		INP2: { sourceType: SourceType.DEFAULT },
		INP3: { sourceType: SourceType.DEFAULT },
		INP4: { sourceType: SourceType.DEFAULT }
	}

	const externalId = generateExternalId(context, actionId, [userData.config.DVEName])

	const nextPart = await context.core.getPartInstance('next')

	const nextDVE = (await context.core
		.getPieceInstances('next')
		.then((nextPieceInstances) =>
			nextPieceInstances.find((p) => p.piece.sourceLayerId === settings.SourceLayers.DVE)
		)) as IBlueprintPieceInstance<DVEPieceMetaData> | undefined

	const meta = nextDVE?.piece.metaData

	if (
		!nextPart ||
		!nextDVE ||
		!nextDVE.dynamicallyInserted ||
		!meta ||
		nextPart.segmentId !== (await context.core.getPartInstance('current'))?.segmentId
	) {
		const content = MakeContentDVE2(context, userData.config, {}, sources, settings.DVEGeneratorOptions)

		if (!content.valid) {
			return
		}

		const newMetaData: DVEPieceMetaData = {
			sources,
			config: userData.config,
			userData: {
				type: AdlibActionType.SELECT_DVE,
				config: {
					type: CueType.DVE,
					template: userData.config.DVEName,
					sources,
					labels: [],
					iNewsCommand: `DVE=${userData.config.DVEName}`
				},
				name: userData.config.DVEName,
				videoId: undefined,
				segmentExternalId: ''
			}
		}

		let newDVEPiece: IBlueprintPiece<DVEPieceMetaData> = {
			externalId,
			enable: {
				start: 0
			},
			lifespan: PieceLifespan.WithinPart,
			name: userData.config.DVEName,
			sourceLayerId: settings.SourceLayers.DVEAdLib,
			outputLayerId: SharedOutputLayer.PGM,
			metaData: newMetaData,
			content: content.content
		}

		newDVEPiece = await cutServerToBox(context, settings, newDVEPiece)

		return startNewDVELayout(
			context,
			settings,
			newDVEPiece,
			content.content,
			newMetaData,
			userData.config.DVEName,
			externalId,
			'next',
			'queue',
			GetTagForDVENext('', userData.config.DVEName, sources)
		)
	}

	const newMetaData2: DVEPieceMetaData = {
		...meta,
		sources: { ...sources, ...meta.sources },
		config: userData.config
	}

	const pieceContent = MakeContentDVE2(context, userData.config, {}, meta.sources, settings.DVEGeneratorOptions)
	let dvePiece: IBlueprintPiece<DVEPieceMetaData> = {
		...nextDVE.piece,
		content: pieceContent.content,
		metaData: newMetaData2,
		name: userData.config.DVEName,
		tags: [
			GetTagForDVE('', userData.config.DVEName, sources),
			GetTagForDVENext('', userData.config.DVEName, sources),
			TallyTags.DVE_IS_LIVE
		]
	}

	dvePiece = await cutServerToBox(context, settings, dvePiece)

	await startNewDVELayout(
		context,
		settings,
		dvePiece,
		pieceContent.content,
		newMetaData2,
		userData.config.DVEName,
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
	context: ActionExecutionContext<ShowStyleConfig>,
	settings: ActionExecutionSettings<ShowStyleConfig>,
	dvePiece: IBlueprintPiece<PieceMetaData>,
	pieceContent: WithTimeline<SplitsContent>,
	metaData: DVEPieceMetaData,
	templateName: string,
	externalId: string,
	part: 'current' | 'next',
	replacePieceInstancesOrQueue: { activeDVE?: string; dataStore?: string } | 'queue',
	nextTag: string
) {
	const dveDataStore: IBlueprintPiece<PieceMetaData> | undefined = settings.SelectedAdlibs.SourceLayer.DVE
		? {
				externalId,
				name: templateName,
				enable: {
					start: 0
				},
				outputLayerId: settings.SelectedAdlibs.OutputLayer.SelectedAdLib,
				sourceLayerId: settings.SelectedAdlibs.SourceLayer.DVE,
				lifespan: PieceLifespan.OutOnSegmentEnd,
				metaData,
				tags: [nextTag],
				content: {
					...pieceContent,
					// Take this
					timelineObjects: pieceContent.timelineObjects
						.filter(
							(tlObj) =>
								!context.videoSwitcher.isMixEffect(tlObj) && tlObj.content.deviceType !== TSR.DeviceType.SISYFOS
						)
						.map((obj) => ({ ...obj, priority: obj.priority ?? 1 / 2 }))
				}
		  }
		: undefined

	if (replacePieceInstancesOrQueue === 'queue') {
		const newPart: IBlueprintPart = {
			externalId,
			title: templateName,
			metaData: {},
			expectedDuration: 0
		}

		const currentPieceInstances = await context.core.getPieceInstances('current')
		// If a DVE is not on air, but a layout is selected, stop the selected layout and replace with the new one.
		const onAirPiece = currentPieceInstances.find((p) => p.piece.sourceLayerId === settings.SourceLayers.DVE)

		const dataPiece =
			settings.SelectedAdlibs &&
			currentPieceInstances.find((p) => p.piece.sourceLayerId === settings.SelectedAdlibs.SourceLayer.DVE)

		if (onAirPiece === undefined && dataPiece !== undefined) {
			await context.core.stopPieceInstances([dataPiece._id])
		}
		dvePiece.prerollDuration = context.config.studio.CasparPrerollDuration
		await context.core.queuePart(newPart, [
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
			await context.core.stopPiecesOnLayers([settings.SelectedAdlibs.SourceLayer.DVE])
		}
	} else {
		if (replacePieceInstancesOrQueue.activeDVE) {
			await context.core.updatePieceInstance(replacePieceInstancesOrQueue.activeDVE, dvePiece)
			await context.core.updatePartInstance(part, { expectedDuration: 0 })
			if (dveDataStore) {
				if (replacePieceInstancesOrQueue.dataStore) {
					await context.core.updatePieceInstance(replacePieceInstancesOrQueue.dataStore, dveDataStore)
				} else {
					await context.core.insertPiece(part, dveDataStore)
				}
			}
		}
	}
}

async function executeActionSelectJingle<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	context: ActionExecutionContext<ShowStyleConfig>,
	settings: ActionExecutionSettings<ShowStyleConfig>,
	actionId: string,
	userData: ActionSelectJingle
) {
	let file = ''

	const externalId = generateExternalId(context, actionId, [userData.clip])

	const jingle = context.config.showStyle.BreakerConfig.find((brkr) =>
		brkr.BreakerName ? brkr.BreakerName.toString().toUpperCase() === userData.clip.toUpperCase() : false
	)
	if (!jingle) {
		context.core.notifyUserWarning(`Jingle ${userData.clip} is not configured`)
		return
	} else {
		file = jingle.ClipName.toString()
	}

	const props = GetJinglePartPropertiesFromTableValue(jingle)

	const pieceContent = settings.createJingleContent(context, file, jingle)

	const piece: IBlueprintPiece<PieceMetaData> = {
		externalId: `${externalId}-JINGLE`,
		name: userData.clip,
		enable: {
			start: 0
		},
		lifespan: PieceLifespan.WithinPart,
		outputLayerId: SharedOutputLayer.JINGLE,
		sourceLayerId: settings.SourceLayers.Effekt,
		prerollDuration: context.config.studio.CasparPrerollDuration + getTimeFromFrames(Number(jingle.StartAlpha)),
		content: pieceContent,
		tags: [
			GetTagForJingle(userData.segmentExternalId, userData.clip),
			GetTagForJingleNext(userData.segmentExternalId, userData.clip),
			TallyTags.JINGLE_IS_LIVE,
			TallyTags.JINGLE
		]
	}

	const part: IBlueprintPart = {
		externalId,
		title: `JINGLE ${userData.clip}`,
		metaData: {},
		...props
	}

	await context.core.queuePart(part, [
		piece,
		...(settings.SelectedAdlibs
			? await getPiecesToPreserve(
					context,
					settings.SelectedAdlibs.SELECTED_ADLIB_LAYERS,
					settings.SelectedAdlibs.SourceLayer.Effekt ? [settings.SelectedAdlibs.SourceLayer.Effekt] : []
			  )
			: [])
	])

	if (settings.SelectedAdlibs.SourceLayer.Effekt) {
		await context.core.stopPiecesOnLayers([settings.SelectedAdlibs.SourceLayer.Effekt])
	}
}

async function executeActionCutToCamera<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	context: ActionExecutionContext<ShowStyleConfig>,
	settings: ActionExecutionSettings<ShowStyleConfig>,
	actionId: string,
	userData: ActionCutToCamera
) {
	const externalId = generateExternalId(context, actionId, [userData.sourceDefinition.name])

	const part: IBlueprintPart = {
		externalId,
		title: userData.sourceDefinition.name,
		metaData: {},
		expectedDuration: 0
	}

	const sourceInfoCam = findSourceInfo(context.config.sources, userData.sourceDefinition)
	if (sourceInfoCam === undefined) {
		return
	}

	const camSisyfos = GetSisyfosTimelineObjForCamera(context.config, sourceInfoCam, false)

	const kamPiece: IBlueprintPiece<PieceMetaData> = {
		externalId,
		name: part.title,
		enable: { start: 0 },
		outputLayerId: SharedOutputLayer.PGM,
		sourceLayerId: settings.SourceLayers.Cam,
		lifespan: PieceLifespan.WithinPart,
		metaData: {
			sisyfosPersistMetaData: {
				sisyfosLayers: [],
				acceptsPersistedAudio: sourceInfoCam.acceptPersistAudio,
				isModifiedOrInsertedByAction: userData.cutDirectly
			}
		},
		tags: [GetTagForKam(userData.sourceDefinition)],
		content: {
			timelineObjects: [
				...context.videoSwitcher.getOnAirTimelineObjectsWithLookahead({
					priority: 1,
					content: {
						input: sourceInfoCam.port,
						transition: TransitionStyle.CUT
					}
				}),
				...camSisyfos
			]
		}
	}

	await executePiece(context, settings, kamPiece, !userData.cutDirectly, part)
}

async function executePiece(
	context: ActionExecutionContext,
	settings: ActionExecutionSettings,
	pieceToExecute: IBlueprintPiece<PieceMetaData>,
	shouldBeQueued: boolean,
	partToQueue: IBlueprintPart
) {
	const currentPieceInstances = await context.core.getResolvedPieceInstances('current')
	const isServerInCurrentPart = currentPieceInstances.some(
		(p) => p.piece.sourceLayerId === settings.SourceLayers.Server || p.piece.sourceLayerId === settings.SourceLayers.VO
	)

	const layersWithCutDirect: string[] = [settings.SourceLayers.Live, settings.SourceLayers.Cam]
	const currentPieceInstance: IBlueprintResolvedPieceInstance<PieceMetaData> | undefined = findLastPlayingPieceInstance(
		currentPieceInstances,
		(p) => layersWithCutDirect.includes(p.piece.sourceLayerId)
	)

	if (shouldBeQueued || isServerInCurrentPart) {
		await context.core.queuePart(partToQueue, [
			pieceToExecute,
			...(settings.SelectedAdlibs
				? await getPiecesToPreserve(context, settings.SelectedAdlibs.SELECTED_ADLIB_LAYERS, [])
				: [])
		])

		if (isServerInCurrentPart && !shouldBeQueued) {
			await context.core.takeAfterExecuteAction(true)
		}
	} else if (currentPieceInstance && !isPlannedPieceOnLayer(currentPieceInstance, settings.SourceLayers.Live)) {
		await executePieceByReplacingCurrent(context, pieceToExecute, currentPieceInstance, currentPieceInstances)
	} else {
		await executePieceByStoppingCurrent(context, pieceToExecute, currentPieceInstances, settings)
	}
}

async function executePieceByStoppingCurrent(
	context: ActionExecutionContext,
	pieceToExecute: IBlueprintPiece<PieceMetaData>,
	currentPieceInstances: Array<IBlueprintResolvedPieceInstance<PieceMetaData>>,
	settings: ActionExecutionSettings<TV2ShowStyleConfig>
) {
	const currentExternalId = await context.core
		.getPartInstance('current')
		.then((currentPartInstance) => currentPartInstance?.part.externalId)

	if (currentExternalId) {
		pieceToExecute.externalId = currentExternalId
	}

	const currentPieceInstanceWithMetaData = findLastPlayingPieceInstance(
		currentPieceInstances,
		(piece) => !!piece.piece.metaData?.sisyfosPersistMetaData
	)

	await updatePersistenceMetaData(context, pieceToExecute, currentPieceInstanceWithMetaData)

	await context.core.stopPiecesOnLayers([
		settings.SourceLayers.DVE,
		...(settings.SourceLayers.DVEAdLib ? [settings.SourceLayers.DVEAdLib] : []),
		settings.SourceLayers.Effekt,
		settings.SourceLayers.Live,
		settings.SourceLayers.Server,
		settings.SourceLayers.VO,
		...(settings.SourceLayers.EVS ? [settings.SourceLayers.EVS] : []),
		settings.SourceLayers.Continuity
	])
	await stopGraphicPiecesThatShouldEndWithPart(context, currentPieceInstances)

	pieceToExecute.enable = { start: 'now' }
	await context.core.insertPiece('current', pieceToExecute)
}

async function executePieceByReplacingCurrent(
	context: ActionExecutionContext,
	pieceToExecute: IBlueprintPiece<PieceMetaData>,
	currentPiece: IBlueprintResolvedPieceInstance<PieceMetaData>,
	currentPieceInstances: Array<IBlueprintResolvedPieceInstance<PieceMetaData>>
) {
	pieceToExecute.externalId = currentPiece.piece.externalId
	pieceToExecute.enable = currentPiece.piece.enable

	await updatePersistenceMetaData(context, pieceToExecute, currentPiece)

	await stopGraphicPiecesThatShouldEndWithPart(context, currentPieceInstances)

	await context.core.updatePieceInstance(currentPiece._id, pieceToExecute)
}

async function updatePersistenceMetaData(
	context: ActionExecutionContext,
	pieceToExecute: IBlueprintPiece<PieceMetaData>,
	currentPieceInstance: IBlueprintResolvedPieceInstance<PieceMetaData> | undefined
) {
	const currentPart = await context.core.getPartInstance('current')
	if (!currentPart) {
		return
	}

	const currentMetaData = currentPieceInstance?.piece.metaData
	const nextMetaData = pieceToExecute.metaData!
	const previousPartEndState = currentPart.previousPartEndState as PartEndStateExt | undefined
	nextMetaData.sisyfosPersistMetaData = mergePersistenceMetaData(
		currentPart.segmentId,
		nextMetaData.sisyfosPersistMetaData!,
		currentMetaData?.sisyfosPersistMetaData,
		previousPartEndState
	)
}

function isPlannedPieceOnLayer(currentPiece: IBlueprintPieceInstance<PieceMetaData>, sourceLayerId: string) {
	return (
		currentPiece.piece.sourceLayerId === sourceLayerId &&
		!currentPiece.piece.metaData?.modifiedByAction &&
		!currentPiece?.dynamicallyInserted
	)
}

async function stopGraphicPiecesThatShouldEndWithPart(
	context: ActionExecutionContext,
	currentPieceInstances: Array<IBlueprintPieceInstance<unknown>>
) {
	await context.core.stopPieceInstances(
		currentPieceInstances
			.filter((pieceInstance) => isGraphicThatShouldEndWithPart(pieceInstance))
			.map((pieceInstance) => pieceInstance._id)
	)
}

function isGraphicThatShouldEndWithPart(pieceInstance: IBlueprintPieceInstance<unknown>): boolean {
	return (
		pieceInstance.piece.lifespan === PieceLifespan.WithinPart &&
		!pieceInstance.stoppedPlayback &&
		(STOPPABLE_GRAPHICS_LAYERS as string[]).includes(pieceInstance.piece.sourceLayerId)
	)
}

async function executeActionCutToRemote<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	context: ActionExecutionContext<ShowStyleConfig>,
	settings: ActionExecutionSettings<ShowStyleConfig>,
	actionId: string,
	userData: ActionCutToRemote
) {
	const externalId = generateExternalId(context, actionId, [userData.sourceDefinition.name])

	const title = userData.sourceDefinition.name

	const part: IBlueprintPart = {
		externalId,
		title,
		metaData: {},
		expectedDuration: 0
	}

	const sourceInfo = findSourceInfo(context.config.sources, userData.sourceDefinition)
	if (sourceInfo === undefined) {
		context.core.notifyUserWarning(`Invalid source: ${userData.sourceDefinition.name}`)
		return
	}

	const eksternSisyfos: TSR.TimelineObjSisyfosAny[] = GetSisyfosTimelineObjForRemote(context.config, sourceInfo)

	const sisyfosPersistMetaData: SisyfosPersistenceMetaData =
		sourceInfo !== undefined
			? {
					sisyfosLayers: sourceInfo.sisyfosLayers ?? [],
					wantsToPersistAudio: sourceInfo.wantsToPersistAudio,
					acceptsPersistedAudio: sourceInfo.acceptPersistAudio,
					isModifiedOrInsertedByAction: userData.cutDirectly
			  }
			: { sisyfosLayers: [] }

	const remotePiece: IBlueprintPiece<PieceMetaData> = {
		externalId,
		name: title,
		enable: {
			start: 0
		},
		sourceLayerId: settings.SourceLayers.Live,
		outputLayerId: SharedOutputLayer.PGM,
		lifespan: PieceLifespan.WithinPart,
		toBeQueued: true,
		metaData: {
			sisyfosPersistMetaData
		},
		tags: [GetTagForLive(userData.sourceDefinition)],
		content: {
			timelineObjects: _.compact<TSR.TSRTimelineObj[]>([
				...context.videoSwitcher.getOnAirTimelineObjectsWithLookahead({
					enable: { while: '1' },
					priority: 1,
					content: {
						input: sourceInfo.port,
						transition: TransitionStyle.CUT
					},
					classes: [ControlClasses.OVERRIDDEN_ON_MIX_MINUS]
				}),
				...eksternSisyfos
			])
		}
	}

	await executePiece(context, settings, remotePiece, !userData.cutDirectly, part)
}

async function executeActionCutSourceToBox<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	context: ActionExecutionContext<ShowStyleConfig>,
	settings: ActionExecutionSettings<ShowStyleConfig>,
	_actionId: string,
	userData: ActionCutSourceToBox
) {
	const currentPieces: IBlueprintPieceInstance[] = await context.core.getPieceInstances('current')
	const nextPieces: IBlueprintPieceInstance[] = await context.core.getPieceInstances('next')

	const currentDVE = currentPieces.find(
		(p) =>
			p.piece.sourceLayerId === settings.SourceLayers.DVE ||
			(settings.SourceLayers.DVEAdLib && p.piece.sourceLayerId === settings.SourceLayers.DVEAdLib)
	)
	const currentDataStore = currentPieces.find(
		(p) => settings.SelectedAdlibs && p.piece.sourceLayerId === settings.SelectedAdlibs.SourceLayer.DVE
	)
	const nextDVE = nextPieces.find(
		(p) =>
			p.piece.sourceLayerId === settings.SourceLayers.DVE ||
			(settings.SourceLayers.DVEAdLib && p.piece.sourceLayerId === settings.SourceLayers.DVEAdLib)
	)
	const nextDataStore = nextPieces.find(
		(p) => settings.SelectedAdlibs && p.piece.sourceLayerId === settings.SelectedAdlibs.SourceLayer.DVE
	)

	let modify: undefined | 'current' | 'next'
	let modifiedPiece: IBlueprintPieceInstance<DVEPieceMetaData> | undefined
	let modifiedDataStore: IBlueprintPieceInstance | undefined

	if (currentDVE && !currentDVE.stoppedPlayback) {
		modify = 'current'
		modifiedPiece = currentDVE as IBlueprintPieceInstance<DVEPieceMetaData>
		modifiedDataStore = currentDataStore
	} else if (nextDVE) {
		modify = 'next'
		modifiedPiece = nextDVE as IBlueprintPieceInstance<DVEPieceMetaData>
		modifiedDataStore = nextDataStore
	}

	const meta = modifiedPiece?.piece.metaData

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

	const containsServerBefore: boolean = dveContainsServer(meta.sources)

	meta.sources[`INP${userData.box + 1}` as keyof DVEPieceMetaData['sources']] = userData.sourceDefinition

	const containsServerAfter: boolean = dveContainsServer(meta.sources)

	const graphicsTemplateContent: { [key: string]: string } = {}

	meta.userData.config.labels.forEach((label, i) => {
		graphicsTemplateContent[`locator${i + 1}`] = label
	})

	const mediaPlayerSession = containsServerBefore && meta.mediaPlayerSessions ? meta.mediaPlayerSessions[0] : undefined

	const newPieceContent = MakeContentDVE2(
		context,
		meta.config,
		graphicsTemplateContent,
		meta.sources,
		settings.DVEGeneratorOptions,
		mediaPlayerSession
	)

	let newDVEPiece: IBlueprintPiece<DVEPieceMetaData> = {
		...modifiedPiece.piece,
		content: newPieceContent.content,
		metaData: meta
	}
	if (!containsServerBefore || !containsServerAfter) {
		newDVEPiece = await cutServerToBox(context, settings, newDVEPiece, !!containsServerBefore, modify === 'current')
	}

	if (newPieceContent.valid) {
		await startNewDVELayout(
			context,
			settings,
			newDVEPiece,
			newPieceContent.content,
			meta,
			meta.config.DVEName,
			newDVEPiece.externalId,
			modify,
			{ activeDVE: modifiedPiece._id, dataStore: modifiedDataStore?._id },
			GetTagForDVENext('', meta.config.DVEName, meta.sources)
		)
	}
}

interface PiecesBySourceLayer {
	[key: string]: Array<IBlueprintPieceInstance<PieceMetaData>>
}

function groupPiecesBySourceLayer(pieceInstances: Array<IBlueprintPieceInstance<PieceMetaData>>): PiecesBySourceLayer {
	const piecesBySourceLayer: PiecesBySourceLayer = {}
	pieceInstances.forEach((piece) => {
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
>(settings: ActionExecutionSettings<ShowStyleConfig>, piecesBySourceLayer: PiecesBySourceLayer) {
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

async function executeActionTakeWithTransition<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	context: ActionExecutionContext<ShowStyleConfig>,
	settings: ActionExecutionSettings<ShowStyleConfig>,
	actionId: string,
	userData: ActionTakeWithTransition
) {
	const externalId = generateExternalId(context, actionId, [userData.variant.type])

	const nextPieces = await context.core.getPieceInstances('next')

	const nextPiecesBySourceLayer = groupPiecesBySourceLayer(nextPieces)
	const primaryPiece = findPrimaryPieceUsingPriority(settings, nextPiecesBySourceLayer)

	await context.core.takeAfterExecuteAction(userData.takeNow)

	if (
		!primaryPiece ||
		!primaryPiece.piece.content ||
		primaryPiece.piece.sourceLayerId === settings.SourceLayers.Effekt
	) {
		return
	}

	const mixEffectTimelineObjects = primaryPiece.piece.content.timelineObjects.filter(context.videoSwitcher.isMixEffect)

	if (!mixEffectTimelineObjects.length) {
		return
	}

	const existingEffektPiece = nextPieces.find((p) => p.piece.sourceLayerId === settings.SourceLayers.Effekt)

	if (existingEffektPiece) {
		await context.core.removePieceInstances('next', [existingEffektPiece._id])
	}

	let partProps: Partial<IBlueprintPart> | false = false

	switch (userData.variant.type) {
		case 'cut':
			{
				await updateTransition(context, mixEffectTimelineObjects, primaryPiece, TransitionStyle.CUT)
				const cutTransitionPiece: IBlueprintPiece<PieceMetaData> = {
					enable: {
						start: 0,
						duration: 1000
					},
					externalId,
					name: 'CUT',
					sourceLayerId: settings.SourceLayers.Effekt,
					outputLayerId: SharedOutputLayer.JINGLE,
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

				await context.core.insertPiece('next', cutTransitionPiece)
				await context.core.updatePartInstance('next', partProps)
			}
			break
		case 'breaker': {
			await updateTransition(context, mixEffectTimelineObjects, primaryPiece, TransitionStyle.CUT)
			const pieces: Array<IBlueprintPiece<PieceMetaData>> = []
			partProps = CreateEffektForPartInner(
				context,
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
				await context.core.updatePartInstance('next', partProps)
				pieces.forEach((p) => context.core.insertPiece('next', { ...p, tags: [GetTagForTransition(userData.variant)] }))
			}
			break
		}
		case 'mix': {
			await updateTransition(
				context,
				mixEffectTimelineObjects,
				primaryPiece,
				TransitionStyle.MIX,
				userData.variant.frames
			)

			const blueprintPiece = CreateMixTransitionBlueprintPieceForPart(
				externalId,
				userData.variant.frames,
				settings.SourceLayers.Effekt
			)

			partProps = createInTransitionForTransitionStyle(userData.variant.frames)
			await context.core.updatePartInstance('next', partProps)
			await context.core.insertPiece('next', { ...blueprintPiece, tags: [GetTagForTransition(userData.variant)] })

			break
		}
		case 'dip': {
			await updateTransition(
				context,
				mixEffectTimelineObjects,
				primaryPiece,
				TransitionStyle.DIP,
				userData.variant.frames
			)
			const blueprintPiece = createDipTransitionBlueprintPieceForPart(
				externalId,
				userData.variant.frames,
				settings.SourceLayers.Effekt
			)

			partProps = createInTransitionForTransitionStyle(userData.variant.frames)
			await context.core.updatePartInstance('next', partProps)
			await context.core.insertPiece('next', { ...blueprintPiece, tags: [GetTagForTransition(userData.variant)] })
			break
		}
	}
}

async function updateTransition(
	context: ActionExecutionContext,
	timelineObjects: TimelineObjectCoreExt[],
	pieceInstance: IBlueprintPieceInstance<PieceMetaData>,
	transitionStyle: TransitionStyle,
	transitionDuration?: number
): Promise<void> {
	for (const timelineObject of timelineObjects) {
		context.videoSwitcher.updateTransition(timelineObject, transitionStyle, transitionDuration)
	}
	await context.core.updatePieceInstance(pieceInstance._id, pieceInstance.piece)
}

async function findPieceToRecoverDataFrom(
	context: ActionExecutionContext,
	dataStoreLayers: string[]
): Promise<{ piece: IBlueprintPieceInstance<PieceMetaData>; part: 'current' | 'next' } | undefined> {
	const pieces = await Promise.all([context.core.getPieceInstances('current'), context.core.getPieceInstances('next')])
	const currentPieces = pieces[0]
	const nextPieces = pieces[1]

	const currentServer = currentPieces.find((p) => dataStoreLayers.includes(p.piece.sourceLayerId))

	const nextServer = nextPieces.find((p) => dataStoreLayers.includes(p.piece.sourceLayerId))

	let pieceToRecoverDataFrom: IBlueprintPieceInstance<PieceMetaData> | undefined

	let part: 'current' | 'next' = 'current'

	if (nextServer) {
		part = 'next'
		pieceToRecoverDataFrom = nextServer
	} else if (currentServer) {
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
	context: ActionExecutionContext,
	dataStoreLayers: string[]
): Promise<T | undefined> {
	const dataStorePiece = await findPieceToRecoverDataFrom(context, dataStoreLayers)

	if (!dataStorePiece) {
		return
	}

	return (dataStorePiece.piece.piece.metaData as any)?.userData as T | undefined
}

async function findMediaPlayerSessions(
	context: ActionExecutionContext,
	sessionLayers: string[]
): Promise<{ session: string | undefined; part: 'current' | 'next' | undefined }> {
	const mediaPlayerSessionPiece = await findPieceToRecoverDataFrom(context, sessionLayers)

	if (!mediaPlayerSessionPiece) {
		return {
			session: undefined,
			part: undefined
		}
	}

	const sessions = mediaPlayerSessionPiece.piece.piece.metaData?.mediaPlayerSessions

	return {
		// Assume there will be only one session
		session: sessions && sessions.length ? sessions[0] : undefined,
		part: mediaPlayerSessionPiece.part
	}
}

async function executeActionCommentatorSelectServer<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(context: ActionExecutionContext<ShowStyleConfig>, settings: ActionExecutionSettings<ShowStyleConfig>) {
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
		settings.serverActionSettings.defaultTriggerMode,
		session
	)
}

async function executeActionCommentatorSelectDVE<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(context: ActionExecutionContext<ShowStyleConfig>, settings: ActionExecutionSettings<ShowStyleConfig>) {
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
>(context: ActionExecutionContext<ShowStyleConfig>, settings: ActionExecutionSettings<ShowStyleConfig>) {
	const data = await findDataStore<ActionSelectFullGrafik>(context, [SharedSourceLayer.SelectedAdlibGraphicsFull])

	if (!data) {
		return
	}

	await executeActionSelectFull(context, settings, data)
}

async function executeActionCommentatorSelectJingle<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(context: ActionExecutionContext<ShowStyleConfig>, settings: ActionExecutionSettings<ShowStyleConfig>) {
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
	context: ActionExecutionContext<ShowStyleConfig>,
	settings: ActionExecutionSettings<ShowStyleConfig>,
	actionId: string
) {
	const lastLive = await context.core.findLastPieceOnLayer(settings.SourceLayers.Live, {
		originalOnly: true,
		excludeCurrentPart: false,
		pieceMetaDataFilter: {
			modifiedByAction: { $ne: true }
		}
	})

	if (!lastLive) {
		return
	}

	const lastIdent = await context.core.findLastPieceOnLayer(settings.SourceLayers.Ident, {
		originalOnly: true,
		excludeCurrentPart: false,
		pieceMetaDataFilter: {
			partType: PartType.REMOTE,
			pieceExternalId: lastLive.piece.externalId
		}
	})

	const externalId = generateExternalId(context, actionId, [lastLive.piece.name])

	const part: IBlueprintPart = {
		externalId,
		title: lastLive.piece.name
	}

	const pieces: Array<IBlueprintPiece<PieceMetaData>> = []
	pieces.push({
		...lastLive.piece,
		externalId,
		enable: {
			start: 0
		},
		lifespan: PieceLifespan.WithinPart
	})

	if (lastIdent) {
		pieces.push({
			...lastIdent.piece,
			externalId,
			lifespan: PieceLifespan.WithinPart
		})
	}

	await context.core.queuePart(part, pieces)
}

async function executeActionRecallLastDVE<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	context: ActionExecutionContext<ShowStyleConfig>,
	settings: ActionExecutionSettings<ShowStyleConfig>,
	actionId: string
) {
	const lastPlayedScheduledDVE = (await context.core.findLastPieceOnLayer(settings.SourceLayers.DVE, {
		originalOnly: true
	})) as IBlueprintPieceInstance<DVEPieceMetaData> | undefined
	const isLastPlayedAScheduledDVE: boolean = !lastPlayedScheduledDVE?.dynamicallyInserted

	if (lastPlayedScheduledDVE && isLastPlayedAScheduledDVE) {
		await scheduleLastPlayedDVE(context, settings, actionId, lastPlayedScheduledDVE)
		await addLatestPieceOnLayerForDve(context, settings.SourceLayers.Ident, actionId, lastPlayedScheduledDVE.piece)
	}
}

async function addLatestPieceOnLayerForDve(
	context: ActionExecutionContext,
	layer: string,
	actionId: string,
	dvePiece: IBlueprintPiece
): Promise<void> {
	const lastIdent = await context.core.findLastPieceOnLayer(layer, {
		originalOnly: true,
		excludeCurrentPart: false,
		pieceMetaDataFilter: {
			partType: PartType.DVE,
			pieceExternalId: dvePiece.externalId
		}
	})

	if (!lastIdent) {
		return
	}

	const externalId = generateExternalId(context, actionId, [dvePiece.name])
	const newIdentPiece: IBlueprintPiece<PieceMetaData> = {
		...lastIdent.piece,
		externalId,
		lifespan: PieceLifespan.WithinPart
	}

	await context.core.insertPiece('next', newIdentPiece)
}

async function executeActionFadeDownPersistedAudioLevels(context: ActionExecutionContext) {
	const resolvedPieceInstances = await context.core.getResolvedPieceInstances('current')
	if (resolvedPieceInstances.length === 0) {
		return
	}

	const latestPiece = findLastPlayingPieceInstance(
		resolvedPieceInstances,
		(piece) => !!piece.piece.metaData?.sisyfosPersistMetaData
	)
	if (!latestPiece) {
		return
	}

	latestPiece.piece.content.timelineObjects = latestPiece.piece.content.timelineObjects.filter(
		(timelineObject) => timelineObject.layer !== SharedSisyfosLLayer.SisyfosPersistedLevels
	)
	const latestPieceMetaData = latestPiece.piece.metaData?.sisyfosPersistMetaData
	if (latestPieceMetaData) {
		delete latestPieceMetaData.previousSisyfosLayers
		delete latestPieceMetaData.acceptsPersistedAudio
		latestPieceMetaData.isModifiedOrInsertedByAction = true
	}
	return context.core.updatePieceInstance(latestPiece._id, latestPiece.piece)
}

async function executeActionCallRobotPreset(context: ActionExecutionContext, preset: number): Promise<void> {
	const robotCameraPiece: IBlueprintPiece<PieceMetaData> = createTelemetricsPieceForRobotCamera(
		`callRobotPreset${preset}`,
		preset,
		'now'
	)
	await context.core.insertPiece('current', robotCameraPiece)
}

async function scheduleLastPlayedDVE<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	context: ActionExecutionContext<ShowStyleConfig>,
	settings: ActionExecutionSettings<ShowStyleConfig>,
	actionId: string,
	lastPlayedDVE: IBlueprintPieceInstance<DVEPieceMetaData>
): Promise<void> {
	const lastPlayedDVEMeta: DVEPieceMetaData = lastPlayedDVE.piece.metaData!
	const externalId: string = generateExternalId(context, actionId, [lastPlayedDVE.piece.name])

	await executeActionSelectDVE(context, settings, actionId, {
		type: AdlibActionType.SELECT_DVE,
		config: lastPlayedDVEMeta.userData.config,
		name: lastPlayedDVE.piece.name,
		segmentExternalId: externalId,
		videoId: lastPlayedDVEMeta.userData.videoId
	})
}

async function executeActionSelectFull<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	context: ActionExecutionContext<ShowStyleConfig>,
	settings: ActionExecutionSettings<ShowStyleConfig>,
	userData: ActionSelectFullGrafik
) {
	const externalId = generateExternalId(context, 'cut_to_full', [userData.name])

	const graphicType = context.config.studio.GraphicsType
	const previousPartKeepaliveDuration =
		graphicType === 'HTML'
			? context.config.studio.HTMLGraphics.KeepAliveDuration
			: context.config.studio.VizPilotGraphics.KeepAliveDuration

	const cue: CueDefinitionGraphic<GraphicPilot> = {
		type: CueType.Graphic,
		target: 'FULL',
		graphic: {
			type: 'pilot',
			name: userData.name,
			vcpid: userData.vcpid,
			continueCount: -1
		},
		iNewsCommand: ''
	}

	const generator = PilotGraphicGenerator.createPilotGraphicGenerator({
		context,
		partId: externalId,
		parsedCue: cue,
		segmentExternalId: userData.segmentExternalId,
		adlib: { rank: 0 }
	})

	const fullPiece = generator.createPiece()

	const fullDataStore = generator.createFullDataStore()

	const part: IBlueprintPart = {
		externalId,
		title: `Full ${generator.getTemplateName()}`,
		metaData: {},
		expectedDuration: 0,
		inTransition: {
			previousPartKeepaliveDuration,
			partContentDelayDuration: 0,
			blockTakeDuration: 0
		}
	}

	await context.core.queuePart(part, [
		fullPiece,
		fullDataStore,
		...(await getPiecesToPreserve(context, settings.SelectedAdlibs.SELECTED_ADLIB_LAYERS, [
			SharedSourceLayer.SelectedAdlibGraphicsFull
		]))
	])

	await context.core.stopPiecesOnLayers([SharedSourceLayer.SelectedAdlibGraphicsFull])
}

async function executeActionClearAllGraphics<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(context: ActionExecutionContext<ShowStyleConfig>, userData: ActionClearAllGraphics) {
	await context.core.stopPiecesOnLayers(STOPPABLE_GRAPHICS_LAYERS)
	const timelineObjects: TSR.TSRTimelineObj[] =
		context.config.studio.GraphicsType === 'VIZ'
			? [
					{
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
							showName: context.config.selectedGfxSetup.OvlShowName ?? '' // @todo: improve types at the junction of HTML and Viz
						}
					}
			  ]
			: []
	await context.core.insertPiece('current', {
		enable: {
			start: 'now',
			duration: 3000
		},
		externalId: 'clearAllGFX',
		name: userData.label,
		sourceLayerId: SharedSourceLayer.PgmAdlibGraphicCmd,
		outputLayerId: SharedOutputLayer.SEC,
		lifespan: PieceLifespan.WithinPart,
		content: {
			timelineObjects
		},
		tags: userData.sendCommands ? [TallyTags.GFX_CLEAR] : [TallyTags.GFX_ALTUD]
	})
}

async function executeActionClearTemaGraphics(context: ActionExecutionContext) {
	await context.core.stopPiecesOnLayers([SharedSourceLayer.PgmGraphicsTema])
	const timelineObjects: TSR.TSRTimelineObj[] =
		context.config.studio.GraphicsType === 'VIZ'
			? [
					{
						id: '',
						enable: {
							start: 0
						},
						priority: 100,
						layer: SharedGraphicLLayer.GraphicLLayerAdLibs,
						content: {
							deviceType: TSR.DeviceType.VIZMSE,
							type: TSR.TimelineContentTypeVizMSE.ELEMENT_INTERNAL,
							templateName: 'OUT_TEMA_H',
							templateData: [],
							showName: context.config.selectedGfxSetup.OvlShowName ?? ''
						}
					}
			  ]
			: []
	await context.core.insertPiece('current', {
		enable: {
			start: 'now',
			duration: 3000
		},
		externalId: 'clearTemaGFX',
		name: 'GFX Temaud',
		sourceLayerId: SharedSourceLayer.PgmAdlibGraphicCmd,
		outputLayerId: SharedOutputLayer.SEC,
		lifespan: PieceLifespan.WithinPart,
		content: {
			timelineObjects
		},
		tags: [TallyTags.GFX_TEMAUD]
	})
}

export function mergePersistenceMetaData(
	currentSegmentId: string,
	nextMetaData: SisyfosPersistenceMetaData,
	currentMetaData: SisyfosPersistenceMetaData | undefined,
	previousPartEndState: PartEndStateExt | undefined
): SisyfosPersistenceMetaData {
	if (!currentMetaData) {
		return nextMetaData
	}
	if (nextMetaData.acceptsPersistedAudio && currentMetaData.wantsToPersistAudio) {
		const includePreviousPart =
			!currentMetaData.isModifiedOrInsertedByAction &&
			previousPartEndState &&
			previousPartEndState.segmentId === currentSegmentId
		nextMetaData.previousSisyfosLayers = Array.from(
			new Set([
				...(includePreviousPart ? previousPartEndState?.sisyfosPersistenceMetaData.sisyfosLayers : []),
				...(currentMetaData.previousSisyfosLayers ?? []),
				...currentMetaData.sisyfosLayers
			])
		)
	}
	return nextMetaData
}
