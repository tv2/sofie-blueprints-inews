import { TimelineObjectCoreExt, TSR } from 'blueprints-integration'
import { TableConfigItemDSK, TimelineObjectMetaData } from 'tv2-common'

export enum SwitcherType {
	ATEM = 'ATEM',
	TRICASTER = 'TRICASTER'
}

export enum SpecialInput {
	ME1_PROGRAM = 'me1_program',
	ME2_PROGRAM = 'me2_program',
	SSRC = 'ssrc'
	// ...
}

export enum TransitionStyle {
	CUT = 'cut',
	MIX = 'mix',
	WIPE = 'wipe',
	WIPE_FOR_GFX = 'wipe_for_gfx',
	DIP = 'dip',
	STING = 'sting'
	// ...
}

export const TIMELINE_OBJECT_DEFAULTS = {
	id: '',
	enable: { start: 0 },
	priority: 0
}

export interface TimelineObjectProps {
	// Default: ''
	id?: string
	// Default: { while: '1' }
	enable?: TimelineObjectEnable
	// Default: 0
	priority?: number
	layer: string
	metaData?: TimelineObjectMetaData
	classes?: string[]
}

type TimelineObjectEnable = TSR.TSRTimelineObj['enable']

export interface MixEffectProps extends TimelineObjectProps {
	content: {
		input?: number | SpecialInput
		previewInput?: number | SpecialInput
		transition?: TransitionStyle
		transitionDuration?: number
		keyers?: Keyer[]
	}
}

export interface Keyer {
	// id starting from 0
	id: number
	onAir: boolean
	config: TableConfigItemDSK
}

export interface DskProps extends TimelineObjectProps {
	content: {
		onAir: boolean
		sources?: {
			fillSource: number | SpecialInput
			cutSource: number | SpecialInput
		}
		properties?: {
			tie?: boolean
			preMultiply?: boolean
			clip?: number // percents (0-100), atem uses 1-000,
			gain?: number // percents (0-100), atem uses 1-000,
		}
	}
}

export interface AuxProps extends TimelineObjectProps {
	content: {
		input: number | SpecialInput
	}
}

export interface VideoSwitcher {

	isMixEffect(timelineObject: TimelineObjectCoreExt): boolean
	getMixEffectTimelineObject(properties: MixEffectProps): TSR.TSRTimelineObj
	findMixEffectTimelineObject(timelineObjects: TimelineObjectCoreExt[]): TSR.TSRTimelineObj | undefined
	isVideoSwitcherTimelineObject(timelineObject: TimelineObjectCoreExt): boolean
	updateTransition(
		timelineObject: TimelineObjectCoreExt,
		transition: TransitionStyle,
		transitionDuration?: number
	): TSR.TSRTimelineObj
	updatePreviewInput(
		timelineObject: TimelineObjectCoreExt,
        previewInput: number | SpecialInput
	): TSR.TSRTimelineObj
	updateInput(
		timelineObject: TimelineObjectCoreExt,
        input: number | SpecialInput
	): TSR.TSRTimelineObj

	isDsk(timelineObject: TimelineObjectCoreExt): boolean
	getDskTimelineObjects(properties: DskProps): TSR.TSRTimelineObj[]
    
	isAux(timelineObject: TimelineObjectCoreExt): boolean
	getAuxTimelineObject(properties: AuxProps): TSR.TSRTimelineObj
	updateAuxInput(
		timelineObject: TimelineObjectCoreExt,
        input: number | SpecialInput
	): TSR.TSRTimelineObj

	isDve(timelineObject: TimelineObjectCoreExt): boolean
	getDveTimelineObject(properties: AuxProps): TSR.TSRTimelineObj
	updateUnpopulatedDveBoxes(
		timelineObject: TimelineObjectCoreExt,
        input: number | SpecialInput
	): TSR.TSRTimelineObj
}
