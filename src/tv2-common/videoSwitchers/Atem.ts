import { TSR } from 'blueprints-integration'
import { AtemSourceIndex } from '../../types/atem'
import {
	AuxProps,
	DskProps,
	MixEffectProps,
	SpecialInput,
	SwitcherType,
	TransitionStyle,
	VideoSwitcherImpl
} from './index'

const SPECIAL_INPUT_MAP = {
	[SpecialInput.ME1_PROGRAM]: AtemSourceIndex.Prg1,
	[SpecialInput.ME2_PROGRAM]: AtemSourceIndex.Prg2,
	[SpecialInput.SSRC]: AtemSourceIndex.SSrc
}

const TRANSITION_MAP = {
	[TransitionStyle.CUT]: TSR.AtemTransitionStyle.CUT,
	[TransitionStyle.DIP]: TSR.AtemTransitionStyle.DIP,
	[TransitionStyle.MIX]: TSR.AtemTransitionStyle.MIX,
	[TransitionStyle.WIPE]: TSR.AtemTransitionStyle.WIPE
}

export class Atem extends VideoSwitcherImpl {
	public readonly type = SwitcherType.ATEM

	public getMixEffectTimelineObject(props: MixEffectProps): TSR.TimelineObjAtemME {
		const { content } = props
		return {
			id: props.id,
			enable: props.enable,
			layer: props.layer,
			priority: props.priority,
			content: {
				deviceType: TSR.DeviceType.ATEM,
				type: TSR.TimelineContentTypeAtem.ME,
				me: {
					input: this.getInputNumber(content.input),
					transition: this.getTransition(content.transition),
					transitionSettings: this.getTransitionSettings(content.transition, content.transitionDuration)
				}
			}
		}
	}

	public getDskTimelineObjects(props: DskProps) {
		const { content } = props
		const timelineObject: TSR.TimelineObjAtemDSK = {
			id: props.id,
			enable: props.enable,
			layer: props.layer,
			priority: props.priority,
			content: {
				deviceType: TSR.DeviceType.ATEM,
				type: TSR.TimelineContentTypeAtem.DSK,
				dsk: {
					onAir: content.onAir,
					sources: content.sources && {
						fillSource: this.getInputNumber(content.sources.fillSource),
						cutSource: this.getInputNumber(content.sources.cutSource)
					},
					properties: content.properties && {
						...content.properties,
						mask: {
							enabled: false
						}
					}
				}
			}
		}
		return [timelineObject]
	}

	public getAuxTimelineObject(props: AuxProps): TSR.TimelineObjAtemAUX {
		return {
			id: props.id,
			enable: props.enable,
			layer: props.layer,
			priority: props.priority,
			content: {
				deviceType: TSR.DeviceType.ATEM,
				type: TSR.TimelineContentTypeAtem.AUX,
				aux: {
					input: this.getInputNumber(props.content.input)
				}
			}
		}
	}

	private getInputNumber(input: number | SpecialInput) {
		if (typeof input === 'number') {
			return input
		}
		return SPECIAL_INPUT_MAP[input]
	}
	private getTransition(transition: TransitionStyle) {
		return TRANSITION_MAP[transition]
	}
	private getTransitionSettings(
		transition: TransitionStyle,
		duration?: number
	): TSR.AtemTransitionSettings | undefined {
		if (!duration) {
			duration = 1000
		}
		switch (transition) {
			case TransitionStyle.CUT:
				return undefined
			case TransitionStyle.WIPE:
				return { wipe: { rate: duration } }
			case TransitionStyle.MIX:
				return { mix: { rate: duration } }
			case TransitionStyle.DIP:
				return { dip: { rate: duration, input: this.config.studio?.AtemSource?.Dip ?? AtemSourceIndex.Col2 } }
		}
	}
}
