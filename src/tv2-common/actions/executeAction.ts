import {
	ActionExecutionContext,
	ActionUserData,
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPart,
	IBlueprintPiece,
	IBlueprintPieceDB,
	IBlueprintPieceGeneric,
	IBlueprintPieceInstance,
	NotesContext,
	PieceLifespan,
	ShowStyleContext,
	SourceLayerType,
	SplitsContent,
	TSR,
	VTContent
} from 'tv-automation-sofie-blueprints-integration'
import {
	ActionClearGraphics,
	ActionCommentatorSelectDVE,
	ActionCommentatorSelectFull,
	ActionCommentatorSelectServer,
	ActionCutSourceToBox,
	ActionCutToCamera,
	ActionCutToRemote,
	ActionSelectDVE,
	ActionSelectDVELayout,
	ActionSelectFullGrafik,
	ActionSelectServerClip,
	CalculateTime,
	CreatePartServerBase,
	CueDefinition,
	CueDefinitionDVE,
	DVEOptions,
	DVEPieceMetaData,
	DVESources,
	EvaluateCuesOptions,
	FindSourceInfoStrict,
	GetCameraMetaData,
	GetDVETemplate,
	GetEksternMetaData,
	GetLayersForCamera,
	GetLayersForEkstern,
	GetSisyfosTimelineObjForCamera,
	GetSisyfosTimelineObjForEkstern,
	literal,
	MakeContentDVE2,
	MakeContentServer,
	PartContext2,
	PartDefinition,
	PieceMetaData,
	TimelineBlueprintExt,
	TV2AdlibAction,
	TV2BlueprintConfigBase,
	TV2StudioConfigBase
} from 'tv2-common'
import { AdlibActionType, ControlClasses, CueType, TallyTags } from 'tv2-constants'
import _ = require('underscore')
import { TimeFromFrames } from '../frameTime'
import { GetJinglePartPropertiesFromTableValue } from '../jinglePartProperties'
import { CreateEffektForPartBase, CreateEffektForPartInner } from '../parts'
import {
	GetTagForDVE,
	GetTagForDVENext,
	GetTagForJingle,
	GetTagForJingleNext,
	GetTagForKam,
	GetTagForLive,
	GetTagForServer,
	GetTagForServerNext,
	GetTagForTransition
} from '../pieces'
import { assertUnreachable } from '../util'
import { ActionCommentatorSelectJingle, ActionSelectJingle, ActionTakeWithTransition } from './actionTypes'

export interface ActionExecutionSettings<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
> {
	getConfig: (context: ShowStyleContext) => ShowStyleConfig
	postProcessPieceTimelineObjects: (
		context: NotesContext,
		config: ShowStyleConfig,
		piece: IBlueprintPieceGeneric,
		isAdlib: boolean
	) => void
	EvaluateCues: (
		context: PartContext2,
		config: ShowStyleConfig,
		pieces: IBlueprintPiece[],
		adLibPieces: IBlueprintAdLibPiece[],
		actions: IBlueprintActionManifest[],
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
	}
	OutputLayer: {
		PGM: string
		EFFEKT: string
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
			MEClean?: string
			Next: string
			ServerLookaheadAUX?: string
			SSrcDefault: string
			Effekt: string
		}
	}
	SelectedAdlibs?: {
		SourceLayer: {
			Server: string
			VO: string
			DVE: string
			GFXFull: string
			Effekt: string
		}
		OutputLayer: {
			SelectedAdLib: string
		}
		SELECTED_ADLIB_LAYERS: string[]
	}
	ServerAudioLayers: string[]
	StoppableGraphicsLayers: string[]
	executeActionSelectFull?: (
		context: ActionExecutionContext,
		actionId: string,
		userData: ActionSelectFullGrafik
	) => void
	executeActionClearGraphics?: (
		context: ActionExecutionContext,
		actionId: string,
		userData: ActionClearGraphics
	) => void
	createJingleContent?: (config: ShowStyleConfig, file: string, loadFirstFrame: boolean) => VTContent
}

export function executeAction<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	context: ActionExecutionContext,
	settings: ActionExecutionSettings<StudioConfig, ShowStyleConfig>,
	actionIdStr: string,
	userData: ActionUserData
): void {
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
			if (settings.executeActionSelectFull) {
				settings.executeActionSelectFull(context, actionId, userData as ActionSelectFullGrafik)
			}
			break
		case AdlibActionType.SELECT_JINGLE:
			executeActionSelectJingle(context, settings, actionId, userData as ActionSelectJingle)
			break
		case AdlibActionType.CLEAR_GRAPHICS:
			if (settings.executeActionClearGraphics) {
				settings.executeActionClearGraphics(context, actionId, userData as ActionClearGraphics)
			}
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
		default:
			assertUnreachable(actionId)
			break
	}

	if (actionId !== AdlibActionType.TAKE_WITH_TRANSITION) {
		if (existingTransition) {
			executeActionTakeWithTransition(context, settings, AdlibActionType.TAKE_WITH_TRANSITION, existingTransition)
		}
	}
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
	context: ActionExecutionContext,
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
				type: 'effekt',
				effekt: Number(transitionProps[1])
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
	context: ActionExecutionContext,
	adlibLayers: string[],
	ingoreLayers: string[]
): IBlueprintPiece[] {
	return context
		.getPieceInstances('next')
		.filter(p => adlibLayers.includes(p.piece.sourceLayerId) && !ingoreLayers.includes(p.piece.sourceLayerId))
		.map<IBlueprintPiece>(p => p.piece)
		.map(p => sanitizePieceStart(p))
		.map(p => sanitizePieceId(p as IBlueprintPieceDB))
}

function generateExternalId(context: ActionExecutionContext, actionId: string, args: string[]): string {
	return `adlib_action_${actionId}_${context.getHashId(args.join('_'), true)}`
}

function executeActionSelectServerClip<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	context: ActionExecutionContext,
	settings: ActionExecutionSettings<StudioConfig, ShowStyleConfig>,
	actionId: string,
	userData: ActionSelectServerClip,
	sessionToContinue?: string
) {
	const file = userData.file
	const partDefinition = userData.partDefinition
	const duration = userData.duration
	const config = settings.getConfig(context)

	const externalId = generateExternalId(context, actionId, [file])

	const conflictingPiece = settings.SelectedAdlibs
		? context
				.getPieceInstances('current')
				.find(
					p =>
						p.piece.sourceLayerId ===
							(userData.vo ? settings.SelectedAdlibs!.SourceLayer.Server : settings.SelectedAdlibs!.SourceLayer.VO) &&
						p.piece.lifespan === PieceLifespan.OutOnSegmentEnd
				)
		: undefined

	const activeServerPiece = literal<IBlueprintPiece>({
		externalId,
		name: file,
		enable: { start: 0 },
		outputLayerId: settings.OutputLayer.PGM,
		sourceLayerId: userData.vo ? settings.SourceLayers.VO : settings.SourceLayers.Server,
		lifespan: PieceLifespan.WithinPart,
		metaData: literal<PieceMetaData>({
			mediaPlayerSessions: sessionToContinue ? [sessionToContinue] : [externalId]
		}),
		content: MakeContentServer(
			file,
			sessionToContinue ?? externalId,
			partDefinition,
			config,
			{
				Caspar: {
					ClipPending: settings.LLayer.Caspar.ClipPending
				},
				Sisyfos: {
					ClipPending: settings.LLayer.Sisyfos.ClipPending
				},
				ATEM: {
					MEPGM:
						settings.SelectedAdlibs && settings.LLayer.Atem.MEClean
							? settings.LLayer.Atem.MEClean
							: settings.LLayer.Atem.MEProgram
				}
			},
			duration
		),
		adlibPreroll: config.studio.CasparPrerollDuration,
		tags: [
			GetTagForServer(userData.segmentExternalId, file, userData.vo),
			GetTagForServerNext(userData.segmentExternalId, file, userData.vo),
			TallyTags.SERVER_IS_LIVE
		]
	})

	settings.postProcessPieceTimelineObjects(context, config, activeServerPiece, false)

	const lookaheadObj = (activeServerPiece.content?.timelineObjects as Array<
		TSR.TSRTimelineObj & TimelineBlueprintExt
	>).find(t => t.layer === settings.LLayer.Atem.Next)
	const mediaObj = (activeServerPiece.content?.timelineObjects as Array<
		TSR.TSRTimelineObj & TimelineBlueprintExt
	>).find(
		t =>
			t.layer === settings.LLayer.Caspar.ClipPending &&
			t.content.deviceType === TSR.DeviceType.CASPARCG &&
			t.content.type === TSR.TimelineContentTypeCasparCg.MEDIA
	) as (TSR.TimelineObjCCGMedia & TimelineBlueprintExt) | undefined

	const grafikPieces: IBlueprintPiece[] = []

	settings.EvaluateCues(
		(context as unknown) as PartContext2,
		config,
		grafikPieces,
		[],
		[],
		partDefinition.cues,
		partDefinition,
		{
			excludeAdlibs: true,
			selectedCueTypes: [CueType.Grafik]
		}
	)

	if (activeServerPiece.content && activeServerPiece.content.timelineObjects) {
		if (userData.vo) {
			activeServerPiece.content.timelineObjects.push(
				GetSisyfosTimelineObjForCamera(context, config, 'server', settings.LLayer.Sisyfos.StudioMics)
			)
		}
	}

	const serverDataStore = settings.SelectedAdlibs
		? literal<IBlueprintPiece>({
				externalId,
				name: file,
				enable: {
					start: 0
				},
				outputLayerId: settings.SelectedAdlibs.OutputLayer.SelectedAdLib,
				sourceLayerId: userData.vo
					? settings.SelectedAdlibs.SourceLayer.VO
					: settings.SelectedAdlibs.SourceLayer.Server,
				lifespan: PieceLifespan.OutOnSegmentEnd,
				metaData: {
					userData,
					mediaPlayerSessions: sessionToContinue ? [sessionToContinue] : [externalId]
				},
				tags: [GetTagForServerNext(userData.segmentExternalId, file, userData.vo)],
				content: {
					timelineObjects:
						lookaheadObj && mediaObj
							? [
									literal<TSR.TimelineObjCCGMedia & TimelineBlueprintExt>({
										id: '',
										enable: {
											while: '1'
										},
										priority: 1,
										layer: settings.LLayer.Caspar.ClipPending,
										metaData: mediaObj.metaData,
										content: {
											deviceType: TSR.DeviceType.CASPARCG,
											type: TSR.TimelineContentTypeCasparCg.MEDIA,
											file: mediaObj.content.file,
											noStarttime: true
										},
										keyframes: [
											{
												id: '',
												enable: {
													while: `!.${ControlClasses.ServerOnAir}`
												},
												content: {
													deviceType: TSR.DeviceType.CASPARCG,
													type: TSR.TimelineContentTypeCasparCg.MEDIA,
													playing: false,
													seek: 0
												}
											}
										]
									}),
									// Lookahead AUX
									...(settings.LLayer.Atem.ServerLookaheadAUX
										? [
												literal<TSR.TimelineObjAtemAUX & TimelineBlueprintExt>({
													id: '',
													enable: lookaheadObj.enable,
													priority: 0,
													layer: settings.LLayer.Atem.ServerLookaheadAUX,
													content: {
														deviceType: TSR.DeviceType.ATEM,
														type: TSR.TimelineContentTypeAtem.AUX,
														aux: {
															input: -1
														}
													},
													metaData: lookaheadObj.metaData
												})
										  ]
										: [])
							  ]
							: []
				}
		  })
		: undefined

	const blockingPiece = conflictingPiece
		? literal<IBlueprintPiece>({
				externalId,
				name: conflictingPiece.piece.name,
				enable: {
					start: 0,
					duration: 1
				},
				lifespan: PieceLifespan.WithinPart,
				sourceLayerId: conflictingPiece.piece.sourceLayerId,
				outputLayerId: conflictingPiece.piece.outputLayerId,
				content: {}
		  })
		: undefined

	let part = CreatePartServerBase(context, config, partDefinition).part.part

	const effektPieces: IBlueprintPiece[] = []
	part = {
		...part,
		...CreateEffektForPartBase(context, config, partDefinition, effektPieces, {
			sourceLayer: settings.SourceLayers.Effekt,
			atemLayer: settings.LLayer.Atem.Effekt,
			sisyfosLayer: settings.LLayer.Sisyfos.Effekt,
			casparLayer: settings.LLayer.Caspar.Effekt
		})
	}

	context.queuePart(part, [
		activeServerPiece,
		...(serverDataStore ? [serverDataStore] : []),
		...(blockingPiece ? [blockingPiece] : []),
		...grafikPieces,
		...(settings.SelectedAdlibs
			? getPiecesToPreserve(context, settings.SelectedAdlibs.SELECTED_ADLIB_LAYERS, [
					settings.SelectedAdlibs.SourceLayer.Server,
					settings.SelectedAdlibs.SourceLayer.VO
			  ])
			: []),
		...effektPieces
	])
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
	context: ActionExecutionContext,
	settings: ActionExecutionSettings<StudioConfig, ShowStyleConfig>,
	actionId: string,
	userData: ActionSelectDVE
) {
	const externalId = generateExternalId(context, actionId, [userData.config.template])

	const config = settings.getConfig(context)

	const parsedCue = userData.config

	const rawTemplate = GetDVETemplate(config.showStyle.DVEStyles, parsedCue.template)
	if (!rawTemplate) {
		context.error(`DVE layout not recognised`)
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
		outputLayerId: 'pgm',
		sourceLayerId: settings.SourceLayers.DVE,
		lifespan: PieceLifespan.WithinPart,
		toBeQueued: true,
		content: {
			...pieceContent.content
		},
		adlibPreroll: Number(config.studio.CasparPrerollDuration) || 0,
		metaData,
		tags: [
			GetTagForDVE(parsedCue.template, parsedCue.sources),
			GetTagForDVENext(parsedCue.template, parsedCue.sources),
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
		'queue'
	)
}

function cutServerToBox<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	context: ActionExecutionContext,
	settings: ActionExecutionSettings<StudioConfig, ShowStyleConfig>,
	dvePiece: IBlueprintPiece
): IBlueprintPiece {
	// Check if DVE should continue server + copy server properties
	if (dvePiece.content?.timelineObjects) {
		const placeHolders = (dvePiece.content.timelineObjects as Array<
			TSR.TSRTimelineObj & TimelineBlueprintExt
		>).filter(obj => obj.classes?.includes(ControlClasses.DVEPlaceholder))

		if (placeHolders.length) {
			dvePiece.content.timelineObjects = (dvePiece.content.timelineObjects as Array<
				TSR.TSRTimelineObj & TimelineBlueprintExt
			>).filter(obj => !obj.classes?.includes(ControlClasses.DVEPlaceholder))

			const currentPieces = context.getPieceInstances('current')
			const currentServer = currentPieces.find(
				p =>
					p.piece.sourceLayerId === settings.SourceLayers.Server || p.piece.sourceLayerId === settings.SourceLayers.VO
			)

			if (!currentServer || !currentServer.piece.content?.timelineObjects) {
				context.warning(`No server is playing, cannot start DVE`)
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
				context.error(`Failed to start DVE with server`)
				return dvePiece
			}

			const ssrcObj = (dvePiece.content.timelineObjects as Array<TSR.TSRTimelineObj & TimelineBlueprintExt>)[
				ssrcObjIndex
			]

			ssrcObj.metaData = {
				...ssrcObj.metaData,
				mediaPlayerSession: existingCasparObj.metaData.mediaPlayerSession
			}

			dvePiece.content.timelineObjects[ssrcObjIndex] = ssrcObj
			;(dvePiece.content.timelineObjects as TSR.TSRTimelineObj[]).push(
				{
					...existingCasparObj,
					id: ''
				},
				{
					...existingSisyfosObj,
					id: ''
				}
			)

			if (!dvePiece.metaData) {
				dvePiece.metaData = {}
			}

			dvePiece.metaData.mediaPlayerSessions = [existingCasparObj.metaData.mediaPlayerSession]
		}
	}

	return dvePiece
}

function executeActionSelectDVELayout<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	context: ActionExecutionContext,
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
	const nextDVE = nextInstances.find(
		p =>
			p.piece.sourceLayerId === settings.SourceLayers.DVE ||
			(settings.SelectedAdlibs && p.piece.sourceLayerId === settings.SelectedAdlibs.SourceLayer.DVE) ||
			(settings.SourceLayers.DVEAdLib && p.piece.sourceLayerId === settings.SourceLayers.DVEAdLib)
	)

	const meta = nextDVE?.piece.metaData as DVEPieceMetaData

	if (!nextPart || !nextDVE || !meta) {
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
				videoId: undefined
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
			outputLayerId: settings.OutputLayer.PGM,
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
			'queue'
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
			GetTagForDVE(userData.config.DVEName, sources),
			GetTagForDVENext(userData.config.DVEName, sources),
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
		}
	)
}

function startNewDVELayout<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	context: ActionExecutionContext,
	config: ShowStyleConfig,
	settings: ActionExecutionSettings<StudioConfig, ShowStyleConfig>,
	dvePiece: IBlueprintPiece,
	pieceContent: SplitsContent,
	meta: PieceMetaData & DVEPieceMetaData,
	templateName: string,
	sources: CueDefinitionDVE['sources'],
	externalId: string,
	part: 'current' | 'next',
	replacePieceInstancesOrQueue: { activeDVE?: string; dataStore?: string } | 'queue'
) {
	settings.postProcessPieceTimelineObjects(context, config, dvePiece, false)

	const dveDataStore = settings.SelectedAdlibs
		? literal<IBlueprintPiece>({
				externalId,
				name: templateName,
				enable: {
					start: 0
				},
				outputLayerId: settings.SelectedAdlibs?.OutputLayer.SelectedAdLib,
				sourceLayerId: settings.SelectedAdlibs.SourceLayer.DVE,
				lifespan: PieceLifespan.WithinPart,
				metaData: meta,
				tags: [GetTagForDVENext(templateName, sources)],
				content: {
					...pieceContent,
					// Take this
					timelineObjects: pieceContent.timelineObjects
						.filter(
							tlObj =>
								!(
									tlObj.content.deviceType === TSR.DeviceType.ATEM &&
									(tlObj as TSR.TimelineObjAtemAny).content.type === TSR.TimelineContentTypeAtem.ME
								)
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
			.find(
				p =>
					p.piece.sourceLayerId === settings.SourceLayers.DVE ||
					p.piece.sourceLayerId === settings.SourceLayers.DVEAdLib
			)
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
				? getPiecesToPreserve(context, settings.SelectedAdlibs.SELECTED_ADLIB_LAYERS, [
						settings.SelectedAdlibs.SourceLayer.DVE
				  ])
				: [])
		])
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
	context: ActionExecutionContext,
	settings: ActionExecutionSettings<StudioConfig, ShowStyleConfig>,
	actionId: string,
	userData: ActionSelectJingle
) {
	if (!settings.createJingleContent) {
		return
	}

	let file = ''

	const config = settings.getConfig(context)

	if (!config.showStyle.BreakerConfig) {
		context.warning(`Jingles have not been configured`)
		return
	}

	const externalId = generateExternalId(context, actionId, [userData.clip])

	const jingle = config.showStyle.BreakerConfig.find(brkr =>
		brkr.BreakerName ? brkr.BreakerName.toString().toUpperCase() === userData.clip.toUpperCase() : false
	)
	if (!jingle) {
		context.warning(`Jingle ${userData.clip} is not configured`)
		return
	} else {
		file = jingle.ClipName.toString()
	}

	const props = GetJinglePartPropertiesFromTableValue(config, jingle)

	const pieceContent = settings.createJingleContent(config, file, jingle.LoadFirstFrame)

	const piece = literal<IBlueprintPiece>({
		externalId: `${externalId}-JINGLE`,
		name: userData.clip,
		enable: {
			start: 0
		},
		lifespan: PieceLifespan.WithinPart,
		outputLayerId: 'jingle',
		sourceLayerId: settings.SourceLayers.Effekt,
		content: pieceContent,
		tags: [
			GetTagForJingle(userData.segmentExternalId, userData.clip),
			GetTagForJingleNext(userData.segmentExternalId, userData.clip),
			TallyTags.JINGLE_IS_LIVE
		]
	})

	const jingleDataStore = settings.SelectedAdlibs
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
			? getPiecesToPreserve(context, settings.SelectedAdlibs.SELECTED_ADLIB_LAYERS, [
					settings.SelectedAdlibs.SourceLayer.Effekt
			  ])
			: [])
	])
}

function executeActionCutToCamera<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	context: ActionExecutionContext,
	settings: ActionExecutionSettings<StudioConfig, ShowStyleConfig>,
	actionId: string,
	userData: ActionCutToCamera
) {
	const config = settings.getConfig(context)

	const externalId = generateExternalId(context, actionId, [userData.name])

	const part = literal<IBlueprintPart>({
		externalId,
		title: `Kamera ${userData.name}`,
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
		`Kamera ${userData.name}`,
		settings.LLayer.Sisyfos.StudioMics
	)

	const kamPiece = literal<IBlueprintPiece>({
		externalId,
		name: part.title,
		enable: { start: userData.queue || serverInCurrentPart || currentKam ? 0 : 'now' },
		outputLayerId: 'pgm',
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
					layer:
						settings.SelectedAdlibs && settings.LLayer.Atem.MEClean // Offtube
							? settings.LLayer.Atem.MEClean
							: settings.LLayer.Atem.MEProgram,
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
		settings.postProcessPieceTimelineObjects(context, config, kamPiece, false)
		context.queuePart(part, [
			kamPiece,
			...(settings.SelectedAdlibs
				? getPiecesToPreserve(context, settings.SelectedAdlibs.SELECTED_ADLIB_LAYERS, [])
				: [])
		])
		if (serverInCurrentPart) {
			context.takeAfterExecuteAction(true)
		}
	} else if (currentKam) {
		context.updatePieceInstance(currentKam._id, kamPiece)
	} else {
		context.stopPiecesOnLayers([settings.SourceLayers.Cam])
		context.insertPiece('current', kamPiece)
	}
}

function executeActionCutToRemote<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	context: ActionExecutionContext,
	settings: ActionExecutionSettings<StudioConfig, ShowStyleConfig>,
	actionId: string,
	userData: ActionCutToRemote
) {
	const config = settings.getConfig(context)

	const externalId = generateExternalId(context, actionId, [userData.name])

	const part = literal<IBlueprintPart>({
		externalId,
		title: `Live ${userData.name}`,
		metaData: {},
		expectedDuration: 0
	})

	const eksternSisyfos: TSR.TimelineObjSisyfosAny[] = [
		...GetSisyfosTimelineObjForEkstern(context, config.sources, `Live ${userData.name}`, GetLayersForEkstern),
		GetSisyfosTimelineObjForCamera(context, config, 'telefon', settings.LLayer.Sisyfos.StudioMics)
	]

	const remotePiece = literal<IBlueprintPiece>({
		externalId,
		name: `Live ${userData.name}`,
		enable: {
			start: 0
		},
		sourceLayerId: settings.SourceLayers.Live,
		outputLayerId: settings.OutputLayer.PGM,
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
				...(settings.LLayer.Atem.MEClean
					? [
							literal<TSR.TimelineObjAtemME>({
								id: '',
								enable: { while: '1' },
								priority: 1,
								layer: settings.LLayer.Atem.MEClean,
								content: {
									deviceType: TSR.DeviceType.ATEM,
									type: TSR.TimelineContentTypeAtem.ME,
									me: {
										input: userData.port,
										transition: TSR.AtemTransitionStyle.CUT
									}
								},
								classes: ['adlib_deparent']
							})
					  ]
					: []),
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
	context: ActionExecutionContext,
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

	if (containsServerBefore && containsServerAfter) {
		const oldObjs = (modifiedPiece.piece.content.timelineObjects as TSR.TSRTimelineObj[]).filter(
			(obj: TSR.TSRTimelineObj) =>
				obj.layer === settings.LLayer.Caspar.ClipPending || obj.layer === settings.LLayer.Sisyfos.ClipPending
		)

		if (oldObjs && oldObjs.length) {
			newPieceContent.content.timelineObjects = newPieceContent.content.timelineObjects.filter(
				obj => obj.layer !== settings.LLayer.Caspar.ClipPending && obj.layer !== settings.LLayer.Sisyfos.ClipPending
			)
			newPieceContent.content.timelineObjects.push(...oldObjs)
		}
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
			{ activeDVE: modifiedPiece._id, dataStore: modifiedDataStore?._id }
		)
	}
}

function executeActionTakeWithTransition<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	context: ActionExecutionContext,
	settings: ActionExecutionSettings<StudioConfig, ShowStyleConfig>,
	actionId: string,
	userData: ActionTakeWithTransition
) {
	const externalId = generateExternalId(context, actionId, [userData.variant.type])

	const nextPieces = context.getPieceInstances('next')
	const primaryPiece = nextPieces.find(p =>
		[
			settings.SourceLayers.Cam,
			settings.SourceLayers.DVE,
			settings.SourceLayers.DVEAdLib,
			settings.SourceLayers.Live,
			settings.SourceLayers.Server,
			settings.SourceLayers.VO,
			settings.SourceLayers.Effekt
		].includes(p.piece.sourceLayerId)
	)

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
			// SelectedAdlibs is being used here to identify offtubes. Needs work.
			obj.layer === (settings.SelectedAdlibs ? settings.LLayer.Atem.MEClean : settings.LLayer.Atem.MEProgram) &&
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

	switch (userData.variant.type) {
		case 'cut':
			{
				tlObj.content.me.transition = TSR.AtemTransitionStyle.CUT

				primaryPiece.piece.content.timelineObjects[tlObjIndex] = tlObj

				context.updatePieceInstance(primaryPiece._id, primaryPiece.piece)

				const cutTransitionPiece: IBlueprintPiece = {
					enable: {
						start: 0
					},
					externalId,
					name: 'CUT',
					sourceLayerId: settings.SourceLayers.Effekt,
					outputLayerId: settings.OutputLayer.EFFEKT,
					lifespan: PieceLifespan.WithinPart,
					tags: [GetTagForTransition(userData.variant)]
				}

				context.insertPiece('next', cutTransitionPiece)
			}
			break
		case 'effekt': {
			tlObj.content.me.transition = TSR.AtemTransitionStyle.CUT

			primaryPiece.piece.content.timelineObjects[tlObjIndex] = tlObj

			context.updatePieceInstance(primaryPiece._id, primaryPiece.piece)

			const config = settings.getConfig(context)
			const pieces: IBlueprintPiece[] = []
			const partProps = CreateEffektForPartInner(context, config, pieces, userData.variant.effekt, externalId, {
				sourceLayer: settings.SourceLayers.Effekt,
				atemLayer: settings.LLayer.Atem.Effekt,
				casparLayer: settings.LLayer.Caspar.Effekt,
				sisyfosLayer: settings.LLayer.Sisyfos.Effekt
			})

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

			const mixTransitionPiece: IBlueprintPiece = {
				enable: {
					start: 0,
					duration: Math.max(TimeFromFrames(userData.variant.frames), 1000)
				},
				externalId,
				name: `MIX ${userData.variant.frames}`,
				sourceLayerId: settings.SourceLayers.Effekt,
				outputLayerId: settings.OutputLayer.EFFEKT,
				lifespan: PieceLifespan.WithinPart,
				tags: [GetTagForTransition(userData.variant)]
			}

			context.insertPiece('next', mixTransitionPiece)

			break
		}
	}
}

function findPieceToRecoverDataFrom(
	context: ActionExecutionContext,
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
	context: ActionExecutionContext,
	dataStoreLayers: string[]
): T | undefined {
	const dataStorePiece = findPieceToRecoverDataFrom(context, dataStoreLayers)

	if (!dataStorePiece) {
		return
	}

	const data = dataStorePiece.piece.piece.metaData?.userData as T | undefined

	return data
}

function findMediaPlayerSessions(
	context: ActionExecutionContext,
	sessionLayers: string[]
): { session: string | undefined; part: 'current' | 'next' | undefined } {
	const mediaPlayerSessionPiece = findPieceToRecoverDataFrom(context, sessionLayers)

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

function executeActionCommentatorSelectServer<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	context: ActionExecutionContext,
	settings: ActionExecutionSettings<StudioConfig, ShowStyleConfig>,
	_actionId: string,
	_userData: ActionCommentatorSelectServer
) {
	if (!settings.SelectedAdlibs) {
		return
	}

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
	context: ActionExecutionContext,
	settings: ActionExecutionSettings<StudioConfig, ShowStyleConfig>,
	_actionId: string,
	_userData: ActionCommentatorSelectDVE
) {
	if (!settings.SelectedAdlibs) {
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
	context: ActionExecutionContext,
	settings: ActionExecutionSettings<StudioConfig, ShowStyleConfig>,
	_actionId: string,
	_userData: ActionCommentatorSelectFull
) {
	if (!settings.SelectedAdlibs || !settings.executeActionSelectFull) {
		return
	}

	const data = findDataStore<ActionSelectFullGrafik>(context, [settings.SelectedAdlibs.SourceLayer.GFXFull])

	if (!data) {
		return
	}

	settings.executeActionSelectFull(context, AdlibActionType.SELECT_FULL_GRAFIK, data)
}

function executeActionCommentatorSelectJingle<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	context: ActionExecutionContext,
	settings: ActionExecutionSettings<StudioConfig, ShowStyleConfig>,
	_actionId: string,
	_userData: ActionCommentatorSelectJingle
) {
	if (!settings.SelectedAdlibs || !settings.executeActionSelectFull) {
		return
	}

	const data = findDataStore<ActionSelectJingle>(context, [settings.SelectedAdlibs.SourceLayer.Effekt])

	if (!data) {
		return
	}

	executeActionSelectJingle(context, settings, AdlibActionType.SELECT_JINGLE, data)
}
