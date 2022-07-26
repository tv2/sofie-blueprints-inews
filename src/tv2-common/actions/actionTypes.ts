import { AdlibActionType } from 'tv2-constants'
import { DVEConfigInput } from '../helpers'
import {
	CueDefinitionDVE,
	CueDefinitionGraphic,
	GraphicInternal,
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

export interface ActionCutToCamera extends ActionBase {
	type: AdlibActionType.CUT_TO_CAMERA
	queue: boolean
	sourceDefinition: SourceDefinitionKam
}

export interface ActionCutToRemote extends ActionBase {
	type: AdlibActionType.CUT_TO_REMOTE
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

export interface ActionClearGraphics extends ActionBase {
	type: AdlibActionType.CLEAR_GRAPHICS
	sendCommands?: boolean
	label: string
}

export interface ActionTakeWithTransitionVariantBase {
	type: 'cut' | 'mix' | 'breaker'
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

export type ActionTakeWithTransitionVariant =
	| ActionTakeWithTransitionVariantCut
	| ActionTakeWithTransitionVariantMix
	| ActionTakeWithTransitionVariantBreaker

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

export interface ActionPlayGraphics extends ActionBase {
	type: AdlibActionType.PLAY_GRAPHICS
	graphic: CueDefinitionGraphic<GraphicInternal>
}

export type TV2AdlibAction =
	| ActionSelectServerClip
	| ActionSelectDVE
	| ActionSelectDVELayout
	| ActionSelectFullGrafik
	| ActionSelectJingle
	| ActionCutToCamera
	| ActionCutToRemote
	| ActionCommentatorSelectServer
	| ActionCommentatorSelectDVE
	| ActionCommentatorSelectFull
	| ActionCommentatorSelectJingle
	| ActionClearGraphics
	| ActionTakeWithTransition
	| ActionRecallLastLive
	| ActionRecallLastDVE
	| ActionFadeDownPersistedAudioLevels
	| ActionPlayGraphics
