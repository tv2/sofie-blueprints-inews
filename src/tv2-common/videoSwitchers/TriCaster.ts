import { TSR } from 'blueprints-integration'
import _ = require('underscore')
import {
	AuxProps,
	DskProps,
	Keyer,
	MixEffectProps,
	SpecialInput,
	SwitcherType,
	TIMELINE_OBJECT_DEFAULTS,
	TransitionStyle
} from './types'
import { VideoSwitcherImpl } from './VideoSwitcher'

const SPECIAL_INPUT_MAP = {
	[SpecialInput.ME1_PROGRAM]: 'v1',
	[SpecialInput.ME2_PROGRAM]: 'v2',
	[SpecialInput.SSRC]: 'v2' // todo: get this from config
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

	public getMixEffectTimelineObject(props: MixEffectProps): TSR.TimelineObjTriCasterME {
		const { content } = props
		return {
			...TIMELINE_OBJECT_DEFAULTS,
			..._.omit(props, 'content'),
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

	public isMixEffect = (
		timelineObject: TSR.TSRTimelineObj
	): timelineObject is TSR.TimelineObjTriCasterME => {
		return TSR.isTimelineObjTriCasterME(timelineObject)
	}

	public findMixEffectTimelineObject(timelineObjects: TSR.TSRTimelineObj[]): TSR.TSRTimelineObj | undefined {
		return timelineObjects.find(this.isMixEffect)
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

	public getDskTimelineObjects(_properties: DskProps): TSR.TSRTimelineObj[] {
		throw new Error('Method not implemented.')
	}
	public getAuxTimelineObject(_properties: AuxProps): TSR.TSRTimelineObj {
		throw new Error('Method not implemented.')
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

	private getInputName(input: number | SpecialInput | undefined) {
		if (typeof input === 'undefined') {
			return undefined
		}
		if (typeof input === 'number') {
			return `input${input}`
		}
		return SPECIAL_INPUT_MAP[input]
	}

	private getTransition(transition: TransitionStyle | undefined) {
		if (transition === undefined) {
			return 'cut'
		}
		return TRANSITION_MAP[transition]
	}
}
