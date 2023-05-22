import { IBlueprintActionManifest } from 'blueprints-integration'
import {
	ActionCallRobotPreset,
	ActionClearGraphics,
	ActionCutSourceToBox,
	ActionCutToCamera,
	ActionCutToRemote,
	ActionFadeDownPersistedAudioLevels,
	ActionFadeDownSoundPlayer,
	ActionRecallLastDVE,
	ActionRecallLastLive,
	ActionSelectDVELayout,
	generateExternalId,
	GetTransitionAdLibActions,
	replaySourceName,
	ShowStyleContext,
	SourceDefinitionKam,
	SourceDefinitionRemote,
	SourceInfo,
	SourceInfoToSourceDefinition,
	SourceInfoType,
	t
} from 'tv2-common'
import { AdlibActionType, AdlibTagCutToBox, AdlibTags, SharedOutputLayer, SourceType, TallyTags } from 'tv2-constants'
import * as _ from 'underscore'
import { GalleryBlueprintConfig } from './helpers/config'
import { NUMBER_OF_DVE_BOXES } from './helpers/content/dve'
import { SourceLayer } from './layers'

export class GlobalAdlibActionsGenerator {
	private config: GalleryBlueprintConfig
	constructor(private readonly context: ShowStyleContext<GalleryBlueprintConfig>) {
		this.config = context.config
	}

	public generate(): IBlueprintActionManifest[] {
		const blueprintActions: IBlueprintActionManifest[] = []
		let globalRank = 1000

		this.config.sources.cameras
			.slice(0, 5) // the first x cameras to create INP1/2/3 cam-adlibs from
			.forEach((camera) => {
				blueprintActions.push(this.makeCutDirectlyCameraAction(camera, globalRank++))
				blueprintActions.push(this.makeQueueAsNextCameraAction(camera, globalRank++))
			})

		this.config.sources.cameras
			.slice(0, 5) // the first x cameras to dve actions from
			.forEach((camera) => {
				blueprintActions.push(...this.makeAdlibBoxesActions(camera, globalRank++))
			})

		this.config.sources.lives
			.slice(0, 10) // the first x remote to create INP1/2/3 live-adlibs from
			.forEach((live) => {
				blueprintActions.push(...this.makeAdlibBoxesActions(live, globalRank++))
				blueprintActions.push(this.makeCutDirectLiveAction(live, globalRank++))
			})

		this.config.sources.feeds
			.slice(0, 10) // the first x remote to create INP1/2/3 live-adlibs from
			.forEach((feed) => {
				blueprintActions.push(...this.makeAdlibBoxesActions(feed, globalRank++))
			})

		this.config.sources.replays.forEach((replay) => {
			if (!/EPSIO/i.test(replay.id)) {
				blueprintActions.push(...this.makeAdlibBoxesActionsReplay(replay, globalRank++, false))
			}
			blueprintActions.push(...this.makeAdlibBoxesActionsReplay(replay, globalRank++, true))
		})

		blueprintActions.push(this.makeRecallLastLiveAction())

		blueprintActions.push(...this.makeServerAdlibBoxesActions(globalRank++))

		blueprintActions.push(this.makeClearGraphicsAction())
		blueprintActions.push(this.makeClearGraphicsAltudAction())

		blueprintActions.push(...GetTransitionAdLibActions(this.config, 800))

		blueprintActions.push(this.makeLastDveAction())
		blueprintActions.push(...this.makeDveLayoutActions())

		blueprintActions.push(this.makePersistedAudioLevelsAction())

		blueprintActions.push(this.makeRobotPresetAction())
		blueprintActions.push(this.makeFadeSoundPlayerAction())

		return blueprintActions
	}

	private makeCutDirectlyCameraAction(cameraSourceInfo: SourceInfo, rank: number): IBlueprintActionManifest {
		return this.makeCutCameraAction(cameraSourceInfo, true, rank)
	}

	private makeQueueAsNextCameraAction(cameraSourceInfo: SourceInfo, rank: number): IBlueprintActionManifest {
		return this.makeCutCameraAction(cameraSourceInfo, false, rank)
	}

	private makeCutCameraAction(
		cameraSourceInfo: SourceInfo,
		cutDirectly: boolean,
		rank: number
	): IBlueprintActionManifest {
		const sourceDefinition = SourceInfoToSourceDefinition(cameraSourceInfo) as SourceDefinitionKam
		const userData: ActionCutToCamera = {
			type: AdlibActionType.CUT_TO_CAMERA,
			cutDirectly,
			sourceDefinition
		}
		return {
			externalId: generateExternalId(this.context.core, userData),
			actionId: AdlibActionType.CUT_TO_CAMERA,
			userData,
			userDataManifest: {},
			display: {
				_rank: rank,
				label: t(sourceDefinition.name),
				sourceLayerId: SourceLayer.PgmCam,
				outputLayerId: SharedOutputLayer.PGM,
				content: {},
				tags: cutDirectly ? [AdlibTags.ADLIB_CUT_DIRECT] : [AdlibTags.ADLIB_QUEUE_NEXT]
			}
		}
	}

	private makeCutDirectLiveAction(info: SourceInfo, rank: number): IBlueprintActionManifest {
		const sourceDefinition = SourceInfoToSourceDefinition(info) as SourceDefinitionRemote
		const userData: ActionCutToRemote = {
			type: AdlibActionType.CUT_TO_REMOTE,
			cutDirectly: true,
			sourceDefinition
		}
		return {
			externalId: generateExternalId(this.context.core, userData),
			actionId: AdlibActionType.CUT_TO_REMOTE,
			userData,
			userDataManifest: {},
			display: {
				_rank: rank,
				label: t(sourceDefinition.name),
				sourceLayerId: SourceLayer.PgmLive,
				outputLayerId: SharedOutputLayer.PGM,
				content: {},
				tags: [AdlibTags.ADLIB_CUT_DIRECT]
			}
		}
	}

	private makeRecallLastLiveAction(): IBlueprintActionManifest {
		const userData: ActionRecallLastLive = {
			type: AdlibActionType.RECALL_LAST_LIVE
		}
		return {
			externalId: generateExternalId(this.context.core, userData),
			actionId: AdlibActionType.RECALL_LAST_LIVE,
			userData,
			userDataManifest: {},
			display: {
				_rank: 1,
				label: t('Last Live'),
				sourceLayerId: SourceLayer.PgmLive,
				outputLayerId: SharedOutputLayer.PGM,
				tags: [AdlibTags.ADLIB_RECALL_LAST_LIVE]
			}
		}
	}

	private makeAdlibBoxesActions(info: SourceInfo, rank: number): IBlueprintActionManifest[] {
		const blueprintActions: IBlueprintActionManifest[] = []
		for (let box = 0; box < NUMBER_OF_DVE_BOXES; box++) {
			const name = `${info.type} ${info.id}`
			const layer = info.type === SourceInfoType.KAM ? SourceLayer.PgmCam : SourceLayer.PgmLive

			const userData: ActionCutSourceToBox = {
				type: AdlibActionType.CUT_SOURCE_TO_BOX,
				name,
				box,
				sourceDefinition: SourceInfoToSourceDefinition(info)
			}
			blueprintActions.push({
				externalId: generateExternalId(this.context.core, userData),
				actionId: AdlibActionType.CUT_SOURCE_TO_BOX,
				userData,
				userDataManifest: {},
				display: {
					_rank: rank + 0.1 * box,
					label: t(`${name} inp ${box + 1}`),
					sourceLayerId: layer,
					outputLayerId: SharedOutputLayer.SEC,
					content: {},
					tags: [AdlibTagCutToBox(box)]
				}
			})
		}
		return blueprintActions
	}

	private makeAdlibBoxesActionsReplay(info: SourceInfo, rank: number, vo: boolean): IBlueprintActionManifest[] {
		const blueprintActions: IBlueprintActionManifest[] = []
		for (let box = 0; box < NUMBER_OF_DVE_BOXES; box++) {
			const name = replaySourceName(info.id, vo)
			const userData: ActionCutSourceToBox = {
				type: AdlibActionType.CUT_SOURCE_TO_BOX,
				name,
				box,
				sourceDefinition: {
					sourceType: SourceType.REPLAY,
					id: info.id,
					vo,
					raw: '',
					name
				}
			}
			blueprintActions.push({
				externalId: generateExternalId(this.context.core, userData),
				actionId: AdlibActionType.CUT_SOURCE_TO_BOX,
				userData,
				userDataManifest: {},
				display: {
					_rank: rank + 0.1 * box,
					label: t(`${name} inp ${box + 1}`),
					sourceLayerId: SourceLayer.PgmLocal,
					outputLayerId: SharedOutputLayer.SEC,
					content: {},
					tags: [AdlibTagCutToBox(box), vo ? AdlibTags.ADLIB_VO_AUDIO_LEVEL : AdlibTags.ADLIB_FULL_AUDIO_LEVEL]
				}
			})
		}
		return blueprintActions
	}

	private makeServerAdlibBoxesActions(rank: number): IBlueprintActionManifest[] {
		const blueprintActions: IBlueprintActionManifest[] = []
		for (let box = 0; box < NUMBER_OF_DVE_BOXES; box++) {
			const userData: ActionCutSourceToBox = {
				type: AdlibActionType.CUT_SOURCE_TO_BOX,
				name: `SERVER`,
				box,
				sourceDefinition: { sourceType: SourceType.SERVER }
			}
			blueprintActions.push({
				externalId: generateExternalId(this.context.core, userData),
				actionId: AdlibActionType.CUT_SOURCE_TO_BOX,
				userData,
				userDataManifest: {},
				display: {
					_rank: rank + 0.1 * box,
					label: t(`Server inp ${box + 1}`),
					sourceLayerId: SourceLayer.PgmServer,
					outputLayerId: SharedOutputLayer.SEC,
					content: {},
					tags: [AdlibTagCutToBox(box)]
				}
			})
		}
		return blueprintActions
	}

	private makeClearGraphicsAction(): IBlueprintActionManifest {
		const userData: ActionClearGraphics = {
			type: AdlibActionType.CLEAR_GRAPHICS,
			sendCommands: true,
			label: 'GFX Clear'
		}
		return {
			externalId: generateExternalId(this.context.core, userData),
			actionId: AdlibActionType.CLEAR_GRAPHICS,
			userData,
			userDataManifest: {},
			display: {
				_rank: 300,
				label: t(`GFX Clear`),
				sourceLayerId: SourceLayer.PgmAdlibGraphicCmd,
				outputLayerId: SharedOutputLayer.SEC,
				content: {},
				tags: [AdlibTags.ADLIB_STATIC_BUTTON],
				currentPieceTags: [TallyTags.GFX_CLEAR],
				nextPieceTags: [TallyTags.GFX_CLEAR]
			}
		}
	}

	private makeClearGraphicsAltudAction(): IBlueprintActionManifest {
		const userData: ActionClearGraphics = {
			type: AdlibActionType.CLEAR_GRAPHICS,
			sendCommands: false,
			label: 'GFX Altud'
		}
		return {
			externalId: generateExternalId(this.context.core, userData),
			actionId: AdlibActionType.CLEAR_GRAPHICS,
			userData,
			userDataManifest: {},
			display: {
				_rank: 400,
				label: t(`GFX Altud`),
				sourceLayerId: SourceLayer.PgmAdlibGraphicCmd,
				outputLayerId: SharedOutputLayer.SEC,
				content: {},
				tags: [AdlibTags.ADLIB_STATIC_BUTTON, AdlibTags.ADLIB_GFX_ALTUD],
				currentPieceTags: [TallyTags.GFX_ALTUD],
				nextPieceTags: [TallyTags.GFX_ALTUD]
			}
		}
	}

	private makeLastDveAction(): IBlueprintActionManifest {
		const recallLastLiveDveUserData: ActionRecallLastDVE = {
			type: AdlibActionType.RECALL_LAST_DVE
		}
		return {
			externalId: generateExternalId(this.context.core, recallLastLiveDveUserData),
			actionId: AdlibActionType.RECALL_LAST_DVE,
			userData: recallLastLiveDveUserData,
			userDataManifest: {},
			display: {
				_rank: 1,
				label: t('Last DVE'),
				sourceLayerId: SourceLayer.PgmDVEAdLib,
				outputLayerId: 'pgm',
				tags: [AdlibTags.ADLIB_RECALL_LAST_DVE]
			}
		}
	}

	private makeRobotPresetAction(): IBlueprintActionManifest {
		const callRobotPresetAction: ActionCallRobotPreset = {
			type: AdlibActionType.CALL_ROBOT_PRESET
		}
		return {
			externalId: generateExternalId(this.context.core, callRobotPresetAction),
			actionId: AdlibActionType.CALL_ROBOT_PRESET,
			userData: callRobotPresetAction,
			userDataManifest: {},
			display: {
				_rank: 400,
				label: t(`Call Robot preset`),
				sourceLayerId: SourceLayer.RobotCamera,
				outputLayerId: SharedOutputLayer.SEC,
				tags: []
			}
		}
	}

	private makeFadeSoundPlayerAction(): IBlueprintActionManifest {
		const fadeDownSoundPlayer: ActionFadeDownSoundPlayer = {
			type: AdlibActionType.FADE_DOWN_SOUND_PLAYER
		}
		return {
			externalId: generateExternalId(this.context.core, fadeDownSoundPlayer),
			actionId: AdlibActionType.FADE_DOWN_SOUND_PLAYER,
			userData: fadeDownSoundPlayer,
			userDataManifest: {},
			display: {
				_rank: 400,
				label: t(`Fade down sound player`),
				sourceLayerId: SourceLayer.PgmAudioBed,
				outputLayerId: SharedOutputLayer.SEC,
				tags: []
			}
		}
	}

	private makeDveLayoutActions(): IBlueprintActionManifest[] {
		const blueprintActions: IBlueprintActionManifest[] = []
		_.each(this.config.showStyle.DVEStyles, (dveConfig, i) => {
			const userData: ActionSelectDVELayout = {
				type: AdlibActionType.SELECT_DVE_LAYOUT,
				config: dveConfig
			}
			blueprintActions.push({
				externalId: generateExternalId(this.context.core, userData),
				actionId: AdlibActionType.SELECT_DVE_LAYOUT,
				userData,
				userDataManifest: {},
				display: {
					_rank: 200 + i,
					label: t(dveConfig.DVEName),
					sourceLayerId: SourceLayer.PgmDVEAdLib,
					outputLayerId: SharedOutputLayer.PGM,
					tags: [AdlibTags.ADLIB_SELECT_DVE_LAYOUT, dveConfig.DVEName]
				}
			})
		})
		return blueprintActions
	}

	private makePersistedAudioLevelsAction(): IBlueprintActionManifest {
		const fadeDownPersistedAudioLevelsUserData: ActionFadeDownPersistedAudioLevels = {
			type: AdlibActionType.FADE_DOWN_PERSISTED_AUDIO_LEVELS
		}
		return {
			externalId: generateExternalId(this.context.core, fadeDownPersistedAudioLevelsUserData),
			actionId: AdlibActionType.FADE_DOWN_PERSISTED_AUDIO_LEVELS,
			userData: fadeDownPersistedAudioLevelsUserData,
			userDataManifest: {},
			display: {
				_rank: 300,
				label: t('Fade down persisted audio levels'),
				sourceLayerId: SourceLayer.PgmSisyfosAdlibs,
				outputLayerId: SharedOutputLayer.SEC,
				tags: [AdlibTags.ADLIB_FADE_DOWN_PERSISTED_AUDIO_LEVELS]
			}
		}
	}
}
