import { TimelineObjectCoreExt, TSR } from 'blueprints-integration'
import { SwitcherDskProps, SwitcherInput, TimelineObjectMetaData } from 'tv2-common'
import { SwitcherAuxLLayer, SwitcherDskLLayer, SwitcherMixEffectLLayer } from 'tv2-constants'
import { AtemSourceIndex } from '../../types/atem'

export enum SwitcherType {
	ATEM = 'ATEM',
	TRICASTER = 'TRICASTER',
	M2LX = 'M2L-X'
}

export function isM2LXSwitcher(value: unknown): boolean {
	return value === SwitcherType.M2LX || value === 'M2LX'
}

export function numericSwitcherInput(input: SwitcherInput): number {
	const value = typeof input === 'string' && /^-?\d+$/.test(input) ? Number(input) : input
	if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < -1) {
		throw new Error('ATEM and TriCaster inputs must be integer input numbers')
	}
	return value
}

/** Using Atem values for compatibility */
export enum SpecialInput {
	/** AB input awaiting assignment in onTimelineGenerate */
	AB_PLACEHOLDER = -1,

	BLACK = AtemSourceIndex.Blk,
	ME1_PROGRAM = AtemSourceIndex.Prg1,
	ME2_PROGRAM = AtemSourceIndex.Prg2,
	ME3_PROGRAM = AtemSourceIndex.Prg3,
	ME4_PROGRAM = AtemSourceIndex.Prg4,
	DVE = AtemSourceIndex.SSrc,
	COLOR_GENERATOR1 = AtemSourceIndex.Col1,
	COLOR_GENERATOR2 = AtemSourceIndex.Col2
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

export enum TemporalPriority {
	AUX_MIX_MINUS_OVERRIDE = -1, // to make the overriding timelineobjects act before the cut on an M/E
	DEFAULT = 0, // the default (does not have to be explicitly set)
	DVE = 1 // to place DVE commands afer regular M/E and AUX commands (ATEM integration does that by default)
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
	/**
	 * Currently a TriCaster-only feature allowing reordering of commands in a single batch
	 * Lower means the command will execue faster
	 * Default: 0
	 */
	temporalPriority?: number
	metaData?: TimelineObjectMetaData
	classes?: string[]
}

type TimelineObjectEnable = TSR.TSRTimelineObj['enable']

export interface MixEffectProps extends TimelineObjectProps {
	layer: SwitcherMixEffectLLayer
	content: {
		input?: SwitcherInput
		previewInput?: SwitcherInput
		transition?: TransitionStyle
		/** Transition duration (frames) */
		transitionDuration?: number
		wipeDirection?: string
		atemTransitionSettings?: TSR.AtemTransitionSettings
		keyers?: Keyer[]
		transitionKeyers?: boolean
	}
}

export interface OnAirMixEffectProps extends Omit<MixEffectProps, 'layer'> {}

export interface Keyer {
	onAir: boolean
	config: SwitcherDskProps
}

export interface DskProps extends TimelineObjectProps {
	layer: SwitcherDskLLayer
	content: {
		onAir: boolean
		config: SwitcherDskProps
	}
}

export interface AuxProps extends TimelineObjectProps {
	layer: SwitcherAuxLLayer
	content: {
		input: SwitcherInput
	}
}

export interface DveProps extends TimelineObjectProps {
	content: {
		boxes: any // @todo
		template: any // @todo
		artFillSource: SwitcherInput
		artCutSource: SwitcherInput
		artEnabled?: boolean
	}
}

export interface VideoSwitcher {
	readonly type: SwitcherType
	isMixEffect(timelineObject: TimelineObjectCoreExt): boolean
	getMixEffectTimelineObject(properties: MixEffectProps): TSR.TSRTimelineObj

	/**
	 * Returns timeline objects that cut (or transition) to a given input on Program and Clean M/Es
	 * @param properties OnAirMixEffectProps
	 */
	getOnAirTimelineObjects(properties: OnAirMixEffectProps): TSR.TSRTimelineObj[]
	/**
	 * Returns timeline objects that cut (or transition) to a given input on Program and Clean M/Es
	 * and objects letting lookahead logic show given input as Next
	 * @param properties OnAirMixEffectProps
	 */
	getOnAirTimelineObjectsWithLookahead(properties: OnAirMixEffectProps): TSR.TSRTimelineObj[]
	isVideoSwitcherTimelineObject(timelineObject: TimelineObjectCoreExt): boolean
	updateTransition(
		timelineObject: TimelineObjectCoreExt,
		transition: TransitionStyle,
		transitionDuration?: number,
		atemTransitionSettings?: TSR.AtemTransitionSettings,
		wipeDirection?: string
	): TSR.TSRTimelineObj
	updatePreviewInput(timelineObject: TimelineObjectCoreExt, previewInput: SwitcherInput): TSR.TSRTimelineObj
	updateInput(timelineObject: TimelineObjectCoreExt, input: SwitcherInput): TSR.TSRTimelineObj

	isDsk(timelineObject: TimelineObjectCoreExt): boolean
	getDskTimelineObject(properties: DskProps): TSR.TSRTimelineObj

	isAux(timelineObject: TimelineObjectCoreExt): boolean
	supportsAuxLayer(layer: SwitcherAuxLLayer): boolean
	getAuxTimelineObject(properties: AuxProps): TSR.TSRTimelineObj
	updateAuxInput(timelineObject: TimelineObjectCoreExt, input: SwitcherInput): TSR.TSRTimelineObj

	isDveBoxes(timelineObject: TimelineObjectCoreExt): boolean
	getDveTimelineObjects(properties: DveProps): TSR.TSRTimelineObj[]
	updateUnpopulatedDveBoxes(timelineObject: TimelineObjectCoreExt, input: SwitcherInput): TSR.TSRTimelineObj
}
