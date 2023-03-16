import { IBlueprintActionManifest } from 'blueprints-integration'
import {
	ActionCallRobotPreset,
	ActionClearGraphics,
	ActionCutSourceToBox,
	ActionCutToCamera,
	ActionFadeDownPersistedAudioLevels,
	ActionRecallLastDVE,
	ActionRecallLastLive,
	ActionSelectDVELayout,
	generateExternalId,
	GetTransitionAdLibActions,
	replaySourceName,
	ShowStyleContext,
	SourceDefinitionKam,
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
			.forEach((o) => {
				blueprintActions.push(this.makeCutCameraAction(o, false, globalRank++))
			})

		this.config.sources.cameras
			.slice(0, 5) // the first x cameras to create preview cam-adlibs from
			.forEach((o) => {
				blueprintActions.push(this.makeCutCameraAction(o, true, globalRank++))
			})

		this.config.sources.cameras
			.slice(0, 5) // the first x cameras to dve actions from
			.forEach((o) => {
				blueprintActions.push(...this.makeAdlibBoxesActions(o, globalRank++))
			})

		this.config.sources.lives
			.slice(0, 10) // the first x remote to create INP1/2/3 live-adlibs from
			.forEach((o) => {
				blueprintActions.push(...this.makeAdlibBoxesActions(o, globalRank++))
			})

		this.config.sources.feeds
			.slice(0, 10) // the first x remote to create INP1/2/3 live-adlibs from
			.forEach((o) => {
				blueprintActions.push(...this.makeAdlibBoxesActions(o, globalRank++))
			})

		this.config.sources.replays.forEach((o) => {
			if (!/EPSIO/i.test(o.id)) {
				blueprintActions.push(...this.makeAdlibBoxesActionsReplay(o, globalRank++, false))
			}
			blueprintActions.push(...this.makeAdlibBoxesActionsReplay(o, globalRank++, true))
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

		return blueprintActions
	}

	private makeCutCameraAction(info: SourceInfo, queue: boolean, rank: number): IBlueprintActionManifest {
		const sourceDefinition = SourceInfoToSourceDefinition(info) as SourceDefinitionKam
		const userData: ActionCutToCamera = {
			type: AdlibActionType.CUT_TO_CAMERA,
			queue,
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
				tags: queue ? [AdlibTags.ADLIB_QUEUE_NEXT] : [AdlibTags.ADLIB_CUT_DIRECT]
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
