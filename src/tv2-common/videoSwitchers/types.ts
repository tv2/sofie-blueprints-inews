import { TSR } from 'blueprints-integration'

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
	DIP = 'dip'
	// ...
}

export interface TimelineObjectProps {
	id: string
	enable: TimelineObjectEnable
	layer: string
	priority: number
}

type TimelineObjectEnable = TSR.TSRTimelineObj['enable']

export interface MixEffectProps extends TimelineObjectProps {
	content: {
		input: number | SpecialInput
		transition: TransitionStyle
		transitionDuration?: number
	}
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
	getMixEffectTimelineObject: (properties: MixEffectProps) => TSR.TSRTimelineObj
	getDskTimelineObjects: (properties: DskProps) => TSR.TSRTimelineObj[]
	getAuxTimelineObject: (properties: AuxProps) => TSR.TSRTimelineObj
}
