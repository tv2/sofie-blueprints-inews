import { SourceLayerType } from 'tv-automation-sofie-blueprints-integration'
import { AdlibActionType } from 'tv2-constants'
import { DVEConfigInput } from '../helpers'
import { CueDefinitionDVE, PartDefinition } from '../inewsConversion'

interface ActionBase {
	type: AdlibActionType
}

export interface ActionSelectServerClip extends ActionBase {
	type: AdlibActionType.SELECT_SERVER_CLIP
	file: string
	partDefinition: PartDefinition
	duration: number
	vo: boolean
}

export interface ActionSelectFullGrafik extends ActionBase {
	type: AdlibActionType.SELECT_FULL_GRAFIK
	template: string
}

export interface ActionSelectDVE extends ActionBase {
	type: AdlibActionType.SELECT_DVE
	config: CueDefinitionDVE
	part: PartDefinition
}

export interface ActionSelectDVELayout extends ActionBase {
	type: AdlibActionType.SELECT_DVE_LAYOUT
	config: DVEConfigInput
}

export interface ActionCutToCamera extends ActionBase {
	type: AdlibActionType.CUT_TO_CAMERA
	queue: boolean
	name: string
}

export interface ActionCutToRemote extends ActionBase {
	type: AdlibActionType.CUT_TO_REMOTE
	name: string
	port: number
}

export interface ActionCutSourceToBox extends ActionBase {
	type: AdlibActionType.CUT_SOURCE_TO_BOX
	sourceType: SourceLayerType
	name: string
	port: number
	box: number
	vo?: boolean
	server?: boolean
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

export interface ActionClearGraphics extends ActionBase {
	type: AdlibActionType.CLEAR_GRAPHICS
}

export interface ActionTakeWithTransitionVariantBase {
	type: 'cut' | 'mix' | 'effekt'
}

export interface ActionTakeWithTransitionVariantCut extends ActionTakeWithTransitionVariantBase {
	type: 'cut'
}

export interface ActionTakeWithTransitionVariantMix extends ActionTakeWithTransitionVariantBase {
	type: 'mix'
	frames: number
}

export interface ActionTakeWithTransitionVariantEffekt extends ActionTakeWithTransitionVariantBase {
	type: 'effekt'
	effekt: number
}

export type ActionTakeWithTransitionVariant =
	| ActionTakeWithTransitionVariantCut
	| ActionTakeWithTransitionVariantMix
	| ActionTakeWithTransitionVariantEffekt

export interface ActionTakeWithTransition extends ActionBase {
	type: AdlibActionType.TAKE_WITH_TRANSITION
	variant: ActionTakeWithTransitionVariant
}

export type TV2AdlibAction =
	| ActionSelectServerClip
	| ActionSelectDVE
	| ActionSelectDVELayout
	| ActionSelectFullGrafik
	| ActionCutToCamera
	| ActionCutToRemote
	| ActionCommentatorSelectServer
	| ActionCommentatorSelectDVE
	| ActionCommentatorSelectFull
	| ActionClearGraphics
	| ActionTakeWithTransition
