import { AdlibActionType } from 'tv2-constants'
import { DVEConfigInput } from '../helpers'
import {
	CueDefinitionDVE,
	PartDefinition,
	SourceDefinition,
	SourceDefinitionKam,
	SourceDefinitionRemote
} from '../inewsConversion'

export interface ActionBase {
	type: AdlibActionType
}

export interface ActionSelectServerClip extends ActionBase {
	type: AdlibActionType.SELECT_SERVER_CLIP
	file: string
	partDefinition: PartDefinition
	duration: number
	voLayer: boolean
	voLevels: boolean
	adLibPix: boolean
}

export interface ActionSelectFullGrafik extends ActionBase {
	type: AdlibActionType.SELECT_FULL_GRAFIK
	name: string
	vcpid: number
	segmentExternalId: string
}

export interface ActionSelectDVE extends ActionBase {
	type: AdlibActionType.SELECT_DVE
	config: CueDefinitionDVE
	name: string
	videoId: string | undefined
	segmentExternalId: string
}

export interface ActionSelectDVELayout extends ActionBase {
	type: AdlibActionType.SELECT_DVE_LAYOUT
	config: DVEConfigInput
}

export interface ActionSelectJingle extends ActionBase {
	type: AdlibActionType.SELECT_JINGLE
	segmentExternalId: string
	clip: string
}

export interface ActionCallRobotPreset extends ActionBase {
	type: AdlibActionType.CALL_ROBOT_PRESET
}

export interface ActionCutToCamera extends ActionBase {
	type: AdlibActionType.CUT_TO_CAMERA
	cutDirectly: boolean
	sourceDefinition: SourceDefinitionKam
}

export interface ActionCutToRemote extends ActionBase {
	type: AdlibActionType.CUT_TO_REMOTE
	cutDirectly: boolean
	sourceDefinition: SourceDefinitionRemote
}

export interface ActionCutSourceToBox extends ActionBase {
	type: AdlibActionType.CUT_SOURCE_TO_BOX
	name: string
	box: number
	sourceDefinition: SourceDefinition
}

export interface ActionCommentatorSelectServer extends ActionBase {
	type: AdlibActionType.COMMENTATOR_SELECT_SERVER
}

export interface ActionCommentatorSelectDVE extends ActionBase {
	type: AdlibActionType.COMMENTATOR_SELECT_DVE
}

export interface ActionCommentatorSelectFull extends ActionBase {
	type: AdlibActionType.COMMENTATOR_SELECT_FULL
}

export interface ActionCommentatorSelectJingle extends ActionBase {
	type: AdlibActionType.COMMENTATOR_SELECT_JINGLE
}

export interface ActionClearAllGraphics extends ActionBase {
	type: AdlibActionType.CLEAR_ALL_GRAPHICS
	sendCommands?: boolean
	label: string
}

export interface ActionClearTemaGraphics extends ActionBase {
	type: AdlibActionType.CLEAR_TEMA_GRAPHICS
}

export interface ActionTakeWithTransitionVariantBase {
	type: 'cut' | 'mix' | 'breaker' | 'dip'
}

export interface ActionTakeWithTransitionVariantCut extends ActionTakeWithTransitionVariantBase {
	type: 'cut'
}

export interface ActionTakeWithTransitionVariantMix extends ActionTakeWithTransitionVariantBase {
	type: 'mix'
	frames: number
}

export interface ActionTakeWithTransitionVariantBreaker extends ActionTakeWithTransitionVariantBase {
	type: 'breaker'
	breaker: string
}

export interface ActionTakeWithTransitionVariantDip extends ActionTakeWithTransitionVariantBase {
	type: 'dip'
	frames: number
}

export type ActionTakeWithTransitionVariant =
	| ActionTakeWithTransitionVariantCut
	| ActionTakeWithTransitionVariantMix
	| ActionTakeWithTransitionVariantBreaker
	| ActionTakeWithTransitionVariantDip

export interface ActionTakeWithTransition extends ActionBase {
	type: AdlibActionType.TAKE_WITH_TRANSITION
	variant: ActionTakeWithTransitionVariant
	/** Whether to take when this action is called. Set to false to just set the next transition. */
	takeNow: boolean
}

export interface ActionRecallLastLive extends ActionBase {
	type: AdlibActionType.RECALL_LAST_LIVE
}

export interface ActionRecallLastDVE extends ActionBase {
	type: AdlibActionType.RECALL_LAST_DVE
}

export interface ActionFadeDownPersistedAudioLevels extends ActionBase {
	type: AdlibActionType.FADE_DOWN_PERSISTED_AUDIO_LEVELS
}

export interface ActionFadeDownSoundPlayer extends ActionBase {
	type: AdlibActionType.FADE_DOWN_SOUND_PLAYER
}

export type TV2AdlibAction =
	| ActionSelectServerClip
	| ActionSelectDVE
	| ActionSelectDVELayout
	| ActionSelectFullGrafik
	| ActionSelectJingle
	| ActionCallRobotPreset
	| ActionCutToCamera
	| ActionCutToRemote
	| ActionCommentatorSelectServer
	| ActionCommentatorSelectDVE
	| ActionCommentatorSelectFull
	| ActionCommentatorSelectJingle
	| ActionClearAllGraphics
	| ActionTakeWithTransition
	| ActionRecallLastLive
	| ActionRecallLastDVE
	| ActionFadeDownPersistedAudioLevels
	| ActionFadeDownSoundPlayer
