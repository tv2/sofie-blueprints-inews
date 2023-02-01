import { TSR } from 'blueprints-integration'
import _ = require('underscore')
import { AtemSourceIndex } from '../../types/atem'
import { TimelineBlueprintExt } from '../onTimelineGenerate'
import {
	AuxProps,
	DskProps,
	Keyer,
	MixEffectProps,
	SpecialInput,
	SwitcherType,
	TIMELINE_OBJECT_DEFAULTS,
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
	[TransitionStyle.STING]: TSR.AtemTransitionStyle.STING,
	[TransitionStyle.WIPE]: TSR.AtemTransitionStyle.WIPE,
	[TransitionStyle.WIPE_FOR_GFX]: TSR.AtemTransitionStyle.WIPE
}

export class Atem extends VideoSwitcherImpl {
	public static isMixEffectTimelineObject(timelineObject: TSR.TSRTimelineObj): timelineObject is TSR.TimelineObjAtemME {
		return (
			timelineObject.content.deviceType === TSR.DeviceType.ATEM &&
			timelineObject.content.type === TSR.TimelineContentTypeAtem.ME
		)
	}
	public readonly type = SwitcherType.ATEM

	public getMixEffectTimelineObject(props: MixEffectProps): TSR.TimelineObjAtemME & TimelineBlueprintExt {
		const { content } = props
		const me: TSR.TimelineObjAtemME['content']['me'] =
			content.input && content.transition
				? {
						input: this.getInputNumber(content.input),
						transition: this.getTransition(content.transition),
						transitionSettings: this.getTransitionSettings(content.transition, content.transitionDuration)
				  }
				: {
						programInput: content.input && this.getInputNumber(content.input),
						previewInput: content.previewInput && this.getInputNumber(content.previewInput)
				  }
		const upstreamKeyers = content.keyers && this.getUpstreamKeyers(content.keyers)
		if (upstreamKeyers) {
			me.upstreamKeyers = upstreamKeyers
		}
		return {
			...TIMELINE_OBJECT_DEFAULTS,
			..._.omit(props, 'content'),
			content: {
				deviceType: TSR.DeviceType.ATEM,
				type: TSR.TimelineContentTypeAtem.ME,
				me
			}
		}
	}

	public findMixEffectTimelineObject(timelineObjects: TSR.TSRTimelineObj[]): TSR.TSRTimelineObj | undefined {
		return timelineObjects.find(Atem.isMixEffectTimelineObject)
	}

	public updateTransition(
		timelineObject: TSR.TSRTimelineObj,
		transition: TransitionStyle,
		transitionDuration?: number | undefined
	): TSR.TSRTimelineObj {
		if (!Atem.isMixEffectTimelineObject(timelineObject)) {
			// @todo: log error or throw
			return timelineObject
		}
		timelineObject.content.me.transition = this.getTransition(transition)
		timelineObject.content.me.transitionSettings = this.getTransitionSettings(transition, transitionDuration)
		return timelineObject
	}

	public getDskTimelineObjects(props: DskProps) {
		const { content } = props
		const timelineObject: TSR.TimelineObjAtemDSK = {
			...TIMELINE_OBJECT_DEFAULTS,
			..._.omit(props, 'content'),
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
			...TIMELINE_OBJECT_DEFAULTS,
			..._.omit(props, 'content'),
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
			case TransitionStyle.STING:
				return undefined
			case TransitionStyle.DIP:
				return { dip: { rate: duration, input: this.config.studio?.AtemSource?.Dip ?? AtemSourceIndex.Col2 } }
			case TransitionStyle.MIX:
				return { mix: { rate: duration } }
			case TransitionStyle.WIPE:
				return { wipe: { rate: duration } }
			case TransitionStyle.WIPE_FOR_GFX:
				return {
					wipe: {
						rate: Number(this.config.studio.HTMLGraphics.TransitionSettings.wipeRate),
						pattern: 1,
						reverseDirection: true,
						borderSoftness: this.config.studio.HTMLGraphics.TransitionSettings.borderSoftness
					}
				}
		}
	}
	private getUpstreamKeyers(keyers: Keyer[]) {
		if (!keyers?.length) {
			return
		}
		return keyers.map(keyer => ({
			upstreamKeyerId: keyer.id,
			onAir: keyer.onAir,
			mixEffectKeyType: 0,
			flyEnabled: false,
			fillSource: keyer.config.Fill,
			cutSource: keyer.config.Key,
			maskEnabled: false,
			lumaSettings: {
				preMultiplied: false,
				clip: Number(keyer.config.Clip) * 10, // input is percents (0-100), atem uses 1-000
				gain: Number(keyer.config.Gain) * 10 // input is percents (0-100), atem uses 1-000
			}
		}))
	}
}
