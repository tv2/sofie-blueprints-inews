import {
	ActionExecutionContext,
	ActionUserData,
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IBlueprintPart,
	IBlueprintPiece,
	IBlueprintPieceGeneric,
	IBlueprintPieceInstance,
	NotesContext,
	PieceLifespan,
	PieceMetaData,
	ShowStyleContext,
	SourceLayerType,
	TSR
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
	TimelineBlueprintExt,
	TV2AdlibAction,
	TV2BlueprintConfigBase,
	TV2StudioConfigBase
} from 'tv2-common'
import { AdlibActionType, ControlClasses, CueType } from 'tv2-constants'
import _ = require('underscore')
import { CreateEffektForPartBase, CreateEffektForPartInner } from '../parts'
import { ActionTakeWithTransition } from './actionTypes'

export interface ActionExecutionSettings<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
> {
	parseConfig: (context: ShowStyleContext) => ShowStyleConfig
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
	}
	LLayer: {
		Caspar: {
			ClipPending: string
			Effekt: string
		}
		Sisyfos: {
			ClipPending: string
			Effekt: string
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
		}
		OutputLayer: {
			SelectedAdLib: string
		}
		SELECTED_ADLIB_LAYERS: string[]
	}
	ServerAudioLayers: string[]
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
}

export function executeAction<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	context: ActionExecutionContext,
	settings: ActionExecutionSettings<StudioConfig, ShowStyleConfig>,
	actionId: string,
	userData: ActionUserData
): void {
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
		case AdlibActionType.TAKE_WITH_TRANSITION:
			executeActionTakeWithTransition(context, settings, actionId, userData as ActionTakeWithTransition)
			break
	}
}

// Cannot insert pieces with start "now", change to start 0
function sanitizePieceStart(piece: IBlueprintPiece): IBlueprintPiece {
	if (piece.enable.start === 'now') {
		piece.enable.start = 0
	}
	return piece
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
}

function executeActionSelectServerClip<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	context: ActionExecutionContext,
	settings: ActionExecutionSettings<StudioConfig, ShowStyleConfig>,
	_actionId: string,
	userData: ActionSelectServerClip,
	sessionToContinue?: string
) {
	const file = userData.file
	const partDefinition = userData.partDefinition
	const duration = userData.duration
	const config = settings.parseConfig(context)

	const externalId = `adlib-action_${context.getHashId(`select_server_clip_${file}`)}`

	const conflictingPiece = settings.SelectedAdlibs
		? context
				.getPieceInstances('current')
				.find(
					p =>
						p.piece.sourceLayerId ===
							(userData.vo ? settings.SelectedAdlibs!.SourceLayer.Server : settings.SelectedAdlibs!.SourceLayer.VO) &&
						p.piece.infiniteMode === PieceLifespan.OutOnNextSegment
				)
		: undefined

	const activeServerPiece = literal<IBlueprintPiece>({
		_id: '',
		externalId,
		name: file,
		enable: { start: 0 },
		outputLayerId: settings.OutputLayer.PGM,
		sourceLayerId: userData.vo ? settings.SourceLayers.VO : settings.SourceLayers.Server,
		infiniteMode: PieceLifespan.OutOnNextPart,
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
					MEPGM: settings.LLayer.Atem.MEProgram
				}
			},
			duration
		),
		adlibPreroll: config.studio.CasparPrerollDuration
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
			activeServerPiece.content.timelineObjects.push(...GetSisyfosTimelineObjForCamera(context, config, 'server'))
		}
	}

	const serverDataStore = settings.SelectedAdlibs
		? literal<IBlueprintPiece>({
				_id: '',
				externalId,
				name: file,
				enable: {
					start: 0
				},
				outputLayerId: settings.SelectedAdlibs.OutputLayer.SelectedAdLib,
				sourceLayerId: userData.vo
					? settings.SelectedAdlibs.SourceLayer.VO
					: settings.SelectedAdlibs.SourceLayer.Server,
				infiniteMode: PieceLifespan.OutOnNextSegment,
				metaData: {
					userData,
					mediaPlayerSessions: sessionToContinue ? [sessionToContinue] : [externalId]
				},
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
				_id: '',
				externalId,
				name: conflictingPiece.piece.name,
				enable: {
					start: 0,
					end: 1
				},
				infiniteMode: PieceLifespan.Normal,
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

function executeActionSelectDVE<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	context: ActionExecutionContext,
	settings: ActionExecutionSettings<StudioConfig, ShowStyleConfig>,
	_actionId: string,
	userData: ActionSelectDVE
) {
	const externalId = `adlib-action_${context.getHashId(`select_server_dve_${userData.config.template}`)}`

	const config = settings.parseConfig(context)

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
		{ ...userData.part, segmentExternalId: externalId }
	)

	let start = parsedCue.start ? CalculateTime(parsedCue.start) : 0
	start = start ? start : 0
	const end = parsedCue.end ? CalculateTime(parsedCue.end) : undefined

	const dvePiece = literal<IBlueprintPiece>({
		_id: '',
		externalId,
		name: `${parsedCue.template}`,
		enable: {
			start,
			...(end ? { duration: end - start } : {})
		},
		outputLayerId: 'pgm',
		sourceLayerId: settings.SourceLayers.DVE,
		infiniteMode: PieceLifespan.OutOnNextPart,
		toBeQueued: true,
		content: {
			...pieceContent.content
		},
		adlibPreroll: Number(config.studio.CasparPrerollDuration) || 0,
		metaData: literal<PieceMetaData & DVEPieceMetaData>({
			mediaPlayerSessions: [externalId],
			sources: parsedCue.sources,
			config: rawTemplate
		})
	})

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

			if (!currentServer) {
				context.warning(`No server is playing, cannot start DVE`)
				return
			}

			// Find placeholder CasparCG object
			const casparObj = placeHolders.find(
				obj => obj.layer === settings.LLayer.Caspar.ClipPending
			) as TSR.TimelineObjCCGMedia & TimelineBlueprintExt
			// Find placeholder sisyfos object
			const sisyfosObj = placeHolders.find(
				obj => obj.layer === settings.LLayer.Sisyfos.ClipPending
			) as TSR.TimelineObjSisyfosChannel & TimelineBlueprintExt
			// Find SSRC object in DVE piece
			const ssrcObjIndex = dvePiece.content?.timelineObjects
				? (dvePiece.content?.timelineObjects as TSR.TSRTimelineObj[]).findIndex(
						obj => obj.layer === settings.LLayer.Atem.SSrcDefault
				  )
				: -1

			if (
				!casparObj ||
				!sisyfosObj ||
				ssrcObjIndex === -1 ||
				!casparObj.metaData ||
				!casparObj.metaData.mediaPlayerSession
			) {
				context.error(`Failed to start DVE with server`)
				return
			}

			const ssrcObj = (dvePiece.content.timelineObjects as Array<TSR.TSRTimelineObj & TimelineBlueprintExt>)[
				ssrcObjIndex
			]

			ssrcObj.metaData = {
				...ssrcObj.metaData,
				mediaPlayerSession: casparObj.metaData.mediaPlayerSession
			}

			dvePiece.content.timelineObjects[ssrcObjIndex] = ssrcObj
			;(dvePiece.content.timelineObjects as TSR.TSRTimelineObj[]).push(
				{
					...casparObj,
					id: ''
				},
				{
					...sisyfosObj,
					id: ''
				}
			)

			if (!dvePiece.metaData) {
				dvePiece.metaData = {}
			}

			dvePiece.metaData.mediaPlayerSessions = [casparObj.metaData.mediaPlayerSession]
		}
	}

	settings.postProcessPieceTimelineObjects(context, config, dvePiece, false)

	const dveDataStore = settings.SelectedAdlibs
		? literal<IBlueprintPiece>({
				_id: '',
				externalId,
				name: userData.config.template,
				enable: {
					start: 0
				},
				outputLayerId: settings.SelectedAdlibs?.OutputLayer.SelectedAdLib,
				sourceLayerId: settings.SelectedAdlibs.SourceLayer.DVE,
				infiniteMode: PieceLifespan.OutOnNextSegment,
				metaData: {
					userData
				},
				content: {
					...pieceContent.content,
					timelineObjects: []
				}
		  })
		: undefined

	const part = literal<IBlueprintPart>({
		externalId,
		title: `${parsedCue.template}`,
		metaData: {},
		expectedDuration: 0,
		prerollDuration: config.studio.CasparPrerollDuration
	})

	context.queuePart(part, [
		dvePiece,
		...(dveDataStore ? [dveDataStore] : []),
		...(settings.SelectedAdlibs
			? getPiecesToPreserve(context, settings.SelectedAdlibs.SELECTED_ADLIB_LAYERS, [
					settings.SelectedAdlibs.SourceLayer.DVE
			  ])
			: [])
	])
}

function executeActionSelectDVELayout<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	context: ActionExecutionContext,
	settings: ActionExecutionSettings<StudioConfig, ShowStyleConfig>,
	_actionId: string,
	userData: ActionSelectDVELayout
) {
	const config = settings.parseConfig(context)

	if (!settings.SourceLayers.DVEAdLib) {
		return
	}

	const sources: DVESources = {
		INP1: 'DEFAULT',
		INP2: 'DEFAULT'
	}

	const externalId = `adlib-action_${context.getHashId(`select_dve_layout_${userData.config.DVEName}`)}`

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

		const newDVEPiece = literal<IBlueprintPiece>({
			_id: '',
			externalId,
			enable: {
				start: 0
			},
			infiniteMode: PieceLifespan.OutOnNextPart,
			name: userData.config.DVEName,
			sourceLayerId: settings.SourceLayers.DVEAdLib,
			outputLayerId: settings.OutputLayer.PGM,
			metaData: literal<DVEPieceMetaData>({
				sources,
				config: userData.config
			}),
			content: content.content
		})

		settings.postProcessPieceTimelineObjects(context, config, newDVEPiece, false)

		context.queuePart(
			literal<IBlueprintPart>({
				externalId,
				title: userData.config.DVEName,
				prerollDuration: config.studio.CasparPrerollDuration
			}),
			[
				newDVEPiece,
				...(settings.SelectedAdlibs
					? getPiecesToPreserve(context, settings.SelectedAdlibs.SELECTED_ADLIB_LAYERS, [
							settings.SelectedAdlibs.SourceLayer.DVE
					  ])
					: [])
			]
		)
		return
	}

	const pieceContent = MakeContentDVE2(context, config, userData.config, {}, meta.sources, settings.DVEGeneratorOptions)
	const dvePiece = {
		...nextDVE.piece,
		content: pieceContent,
		metaData: literal<PieceMetaData & DVEPieceMetaData>({
			...meta,
			config: userData.config
		})
	}

	settings.postProcessPieceTimelineObjects(context, config, dvePiece, false)

	context.updatePieceInstance(nextDVE._id, dvePiece)
}

function executeActionCutToCamera<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	context: ActionExecutionContext,
	settings: ActionExecutionSettings<StudioConfig, ShowStyleConfig>,
	_actionId: string,
	userData: ActionCutToCamera
) {
	const config = settings.parseConfig(context)

	const externalId = `adlib-action_${context.getHashId(`cut_to_kam_${userData.name}`)}`

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
	const atemInput = sourceInfoCam.port

	const camSisyfos = GetSisyfosTimelineObjForCamera(context, config, `Kamera ${userData.name}`)

	const kamPiece = literal<IBlueprintPiece>({
		_id: '',
		externalId,
		name: part.title,
		enable: { start: 0 },
		outputLayerId: 'pgm',
		sourceLayerId: settings.SourceLayers.Cam,
		infiniteMode: PieceLifespan.OutOnNextPart,
		metaData: GetCameraMetaData(config, GetLayersForCamera(config, sourceInfoCam)),
		content: {
			studioLabel: '',
			switcherInput: atemInput,
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
										input: atemInput,
										transition: TSR.AtemTransitionStyle.CUT
									}
								},
								classes: ['adlib_deparent']
							})
					  ]
					: []),
				...camSisyfos,
				...config.stickyLayers
					.filter(layer => camSisyfos.map(obj => obj.layer).indexOf(layer) === -1)
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

	if (userData.queue) {
		context.queuePart(part, [
			kamPiece,
			...(settings.SelectedAdlibs
				? getPiecesToPreserve(context, settings.SelectedAdlibs.SELECTED_ADLIB_LAYERS, [])
				: [])
		])
	} else {
		context.insertPiece('current', kamPiece)
	}
}

function executeActionCutToRemote<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	context: ActionExecutionContext,
	settings: ActionExecutionSettings<StudioConfig, ShowStyleConfig>,
	_actionId: string,
	userData: ActionCutToRemote
) {
	const config = settings.parseConfig(context)

	const externalId = `adlib-action_${context.getHashId(`cut_to_remote_${userData.name}`)}`

	const part = literal<IBlueprintPart>({
		externalId,
		title: `Live ${userData.name}`,
		metaData: {},
		expectedDuration: 0
	})

	const eksternSisyfos: TSR.TimelineObjSisyfosAny[] = [
		...GetSisyfosTimelineObjForEkstern(context, config.sources, `Live ${userData.name}`, GetLayersForEkstern),
		...GetSisyfosTimelineObjForCamera(context, config, 'telefon')
	]

	const remotePiece = literal<IBlueprintPiece>({
		_id: '',
		externalId,
		name: `Live ${userData.name}`,
		enable: {
			start: 0
		},
		sourceLayerId: settings.SourceLayers.Live,
		outputLayerId: settings.OutputLayer.PGM,
		infiniteMode: PieceLifespan.OutOnNextPart,
		toBeQueued: true,
		metaData: GetEksternMetaData(
			config.stickyLayers,
			config.studio.StudioMics,
			GetLayersForEkstern(context, config.sources, `Live ${userData.name}`)
		),
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
	const config = settings.parseConfig(context)

	const currentPieces = context.getPieceInstances('current')
	const nextPieces = context.getPieceInstances('next')

	const currentDVE = currentPieces.find(
		p =>
			p.piece.sourceLayerId === settings.SourceLayers.DVE ||
			(settings.SelectedAdlibs && p.piece.sourceLayerId === settings.SelectedAdlibs.SourceLayer.DVE) ||
			(settings.SourceLayers.DVEAdLib && p.piece.sourceLayerId === settings.SourceLayers.DVEAdLib)
	)
	const nextDVE = nextPieces.find(
		p =>
			p.piece.sourceLayerId === settings.SourceLayers.DVE ||
			(settings.SelectedAdlibs && p.piece.sourceLayerId === settings.SelectedAdlibs.SourceLayer.DVE) ||
			(settings.SourceLayers.DVEAdLib && p.piece.sourceLayerId === settings.SourceLayers.DVEAdLib)
	)

	let modify: undefined | 'current' | 'next'
	let modifiedPiece: IBlueprintPieceInstance | undefined

	if (currentDVE) {
		modify = 'current'
		modifiedPiece = currentDVE
	} else if (nextDVE) {
		modify = 'next'
		modifiedPiece = nextDVE
	}

	const meta: DVEPieceMetaData | undefined = modifiedPiece?.piece.metaData as PieceMetaData & DVEPieceMetaData

	if (
		!modifiedPiece ||
		!modify ||
		!modifiedPiece.piece.content ||
		!modifiedPiece.piece.content.timelineObjects ||
		!meta
	) {
		return
	}

	meta.sources[`INP${userData.box + 1}` as keyof DVEPieceMetaData['sources']] = userData.name

	const newPieceContent = MakeContentDVE2(context, config, meta.config, {}, meta.sources, settings.DVEGeneratorOptions)

	const newDVEPiece: IBlueprintPiece = { ...modifiedPiece.piece, content: newPieceContent.content, metaData: meta }
	settings.postProcessPieceTimelineObjects(context, config, newDVEPiece, false)

	if (newPieceContent.valid) {
		context.updatePieceInstance(modifiedPiece._id, newDVEPiece)
	}
}

function executeActionTakeWithTransition<
	StudioConfig extends TV2StudioConfigBase,
	ShowStyleConfig extends TV2BlueprintConfigBase<StudioConfig>
>(
	context: ActionExecutionContext,
	settings: ActionExecutionSettings<StudioConfig, ShowStyleConfig>,
	_actionId: string,
	userData: ActionTakeWithTransition
) {
	const externalId = `adlib-action_${context.getHashId(`take_with_transition_${userData.variant.type}`)}`

	const nextPieces = context.getPieceInstances('next')
	const primaryPiece = nextPieces.find(p =>
		[
			settings.SourceLayers.Cam,
			settings.SourceLayers.DVE,
			settings.SourceLayers.DVEAdLib,
			settings.SourceLayers.Live,
			settings.SourceLayers.Server,
			settings.SourceLayers.VO
		].includes(p.piece.sourceLayerId)
	)

	context.takeAfterExecuteAction(userData.takeNow)

	if (!primaryPiece || !primaryPiece.piece.content) {
		return
	}

	const tlObjIndex = (primaryPiece.piece.content.timelineObjects as TSR.TSRTimelineObj[]).findIndex(
		obj =>
			obj.layer === settings.LLayer.Atem.MEProgram &&
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
			}
			break
		case 'effekt': {
			tlObj.content.me.transition = TSR.AtemTransitionStyle.CUT

			primaryPiece.piece.content.timelineObjects[tlObjIndex] = tlObj

			context.updatePieceInstance(primaryPiece._id, primaryPiece.piece)

			const config = settings.parseConfig(context)
			const pieces: IBlueprintPiece[] = []
			const partProps = CreateEffektForPartInner(context, config, pieces, userData.variant.effekt, externalId, {
				sourceLayer: settings.SourceLayers.Effekt,
				atemLayer: settings.LLayer.Atem.Effekt,
				casparLayer: settings.LLayer.Caspar.Effekt,
				sisyfosLayer: settings.LLayer.Sisyfos.Effekt
			})

			if (partProps) {
				context.updatePartInstance('next', partProps)
				pieces.forEach(p => context.insertPiece('next', p))
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
	const serverToPlay = findPieceToRecoverDataFrom(context, dataStoreLayers)

	if (!serverToPlay) {
		return
	}

	const data = serverToPlay.piece.piece.metaData?.userData as T | undefined

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
