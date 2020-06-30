import { SourceLayerType } from 'tv-automation-sofie-blueprints-integration'
import { AdlibActionType } from 'tv2-constants'
import { PartDefinition } from '../inewsConversion'

interface ActionBase {
	type: AdlibActionType
}

export interface ActionSelectServerClip extends ActionBase {
	type: AdlibActionType.SELECT_SERVER_CLIP
	file: string
	partDefinition: PartDefinition
	duration: number
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
}

export type TV2AdlibAction = ActionSelectServerClip | ActionCutToCamera | ActionCutToRemote
