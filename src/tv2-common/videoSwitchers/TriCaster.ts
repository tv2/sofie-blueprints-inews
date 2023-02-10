import { TimelineObjectCoreExt, TSR } from 'blueprints-integration'
import _ = require('underscore')
import { TRICASTER_CLEAN_ME, TRICASTER_DVE_ME, TRICASTER_LAYER_PREFIX } from '../layers'
import {
	AuxProps,
	DskProps,
	DveProps,
	Keyer,
	MixEffectProps,
	SpecialInput,
	SwitcherType,
	TIMELINE_OBJECT_DEFAULTS,
	TimelineObjectProps,
	TransitionStyle
} from './types'
import { VideoSwitcherImpl } from './VideoSwitcher'

const SPECIAL_INPUT_MAP: Record<SpecialInput, TSR.TriCasterSourceName | TSR.TriCasterMixEffectName> = {
	[SpecialInput.ME1_PROGRAM]: 'main',
	[SpecialInput.ME2_PROGRAM]: 'v1',
	[SpecialInput.ME3_PROGRAM]: 'v2',
	[SpecialInput.ME4_PROGRAM]: TRICASTER_CLEAN_ME, // @todo: fixme, I'm a hack because with TriCaster we're using a different M/E for Clean
	[SpecialInput.DVE]: TRICASTER_DVE_ME,
	[SpecialInput.COLOR_GENERATOR1]: 'bfr1',
	[SpecialInput.COLOR_GENERATOR2]: 'bfr2'
}

const TRANSITION_MAP: Record<TransitionStyle, TSR.TriCasterTransitionEffect> = {
	[TransitionStyle.CUT]: 'cut',
	[TransitionStyle.MIX]: 'fade',
	// making assumptions about the session here:
	[TransitionStyle.DIP]: 2,
	[TransitionStyle.WIPE]: 3,
	[TransitionStyle.WIPE_FOR_GFX]: 4,
	[TransitionStyle.STING]: 5 // not really supported??
}

export class TriCaster extends VideoSwitcherImpl {
	public readonly type = SwitcherType.ATEM

	public isMixEffect = TSR.isTimelineObjTriCasterME

	public isDsk = TSR.isTimelineObjTriCasterDSK
	public isAux = TSR.isTimelineObjTriCasterMixOutput
	public isVideoSwitcherTimelineObject = TSR.isTimelineObjTriCaster

	public getMixEffectTimelineObject(props: MixEffectProps): TSR.TimelineObjTriCasterME {
		const { content } = props
		return {
			...this.getBaseProperties(props, props.layer),
			content: {
				deviceType: TSR.DeviceType.TRICASTER,
				type: TSR.TimelineContentTypeTriCaster.ME,
				me: {
					programInput: this.getInputName(content.input),
					previewInput: this.getInputName(content.previewInput),
					transition: {
						effect: this.getTransition(content.transition),
						duration: content.transitionDuration ?? 1000 // @todo defaults and ranges
					},
					keyers: content.keyers && this.getKeyers(content.keyers)
				}
			}
		}
	}

	public updateTransition(
		timelineObject: TSR.TSRTimelineObj,
		transition: TransitionStyle,
		transitionDuration?: number | undefined
	): TSR.TSRTimelineObj {
		if (!this.isMixEffect(timelineObject)) {
			// @todo: log error or throw
			return timelineObject
		}
		timelineObject.content.me.transition = {
			effect: this.getTransition(transition),
			duration: transitionDuration ?? 1000 // @todo defaults and ranges
		}
		return timelineObject
	}
	public updatePreviewInput(
		timelineObject: TSR.TSRTimelineObj,
		previewInput: number | SpecialInput
	): TSR.TSRTimelineObj {
		if (!this.isMixEffect(timelineObject)) {
			// @todo: log error or throw
			return timelineObject
		}
		;(timelineObject.content.me as TSR.TriCasterMixEffectWithPreview).previewInput = this.getInputName(previewInput)
		return timelineObject
	}
	public updateInput(timelineObject: TSR.TSRTimelineObj, input: number | SpecialInput): TSR.TSRTimelineObj {
		if (!this.isMixEffect(timelineObject)) {
			// @todo: log error or throw
			return timelineObject
		}
		;(timelineObject.content.me as TSR.TriCasterMixEffectInMixMode).programInput = this.getInputName(input)
		return timelineObject
	}

	public getDskTimelineObject(_properties: DskProps): TSR.TSRTimelineObj {
		throw new Error('Method not implemented.')
	}
	public getAuxTimelineObject(props: AuxProps): TSR.TimelineObjTriCasterMixOutput {
		return {
			...this.getBaseProperties(props, props.layer),
			content: {
				deviceType: TSR.DeviceType.TRICASTER,
				type: TSR.TimelineContentTypeTriCaster.MIX_OUTPUT,
				source: this.getInputName(props.content.input)
			}
		}
	}

	public updateAuxInput(timelineObject: TSR.TSRTimelineObj, input: number | SpecialInput): TSR.TSRTimelineObj {
		if (!this.isAux(timelineObject)) {
			// @todo: log error or throw
			return timelineObject
		}
		timelineObject.content.source = this.getInputName(input)
		return timelineObject
	}
	public isDveBoxes = (timelineObject: TimelineObjectCoreExt<unknown, unknown>): boolean => {
		// @todo: this is ugly
		return (
			TSR.isTimelineObjTriCasterME(timelineObject) &&
			!!(timelineObject.content.me as TSR.TriCasterMixEffectInEffectMode).layers
		)
	}
	public getDveTimelineObjects(_properties: DveProps): TSR.TSRTimelineObj[] {
		throw new Error('Method not implemented.')
	}
	public updateUnpopulatedDveBoxes(
		_timelineObject: TSR.TSRTimelineObj,
		_input: number | SpecialInput
	): TSR.TSRTimelineObj {
		throw new Error('Method not implemented.')
	}

	private getBaseProperties(
		props: TimelineObjectProps,
		layer: string
	): Omit<TSR.TimelineObjTriCasterAny, 'content' | 'keyframes'> {
		return {
			...TIMELINE_OBJECT_DEFAULTS,
			..._.omit(props, 'content'),
			layer: TRICASTER_LAYER_PREFIX + layer
		}
	}

	private getKeyers(keyers: Keyer[]): Record<TSR.TriCasterKeyerName, TSR.TriCasterKeyer> | undefined {
		if (!keyers?.length) {
			return
		}
		return keyers.reduce<Record<TSR.TriCasterKeyerName, TSR.TriCasterKeyer>>((accumulator, keyer) => {
			accumulator[`dsk${keyer.id + 1}`] = {
				onAir: keyer.onAir,
				input: this.getInputName(keyer.config.Fill)
			}
			return accumulator
		}, {})
	}

	private getInputName(input: number | SpecialInput): TSR.TriCasterSourceName | TSR.TriCasterMixEffectName
	private getInputName(
		input: number | SpecialInput | undefined
	): TSR.TriCasterSourceName | TSR.TriCasterMixEffectName | undefined
	private getInputName(
		input: number | SpecialInput | undefined
	): TSR.TriCasterSourceName | TSR.TriCasterMixEffectName | undefined {
		if (typeof input === 'undefined') {
			return undefined
		}
		if (input < 1000) {
			return `input${input as number}`
		}
		const specialInput = SPECIAL_INPUT_MAP[input]
		if (specialInput) {
			return specialInput
		}
		return 'black'
	}

	private getTransition(transition: TransitionStyle | undefined) {
		if (transition === undefined) {
			return 'cut'
		}
		return TRANSITION_MAP[transition]
	}
}
