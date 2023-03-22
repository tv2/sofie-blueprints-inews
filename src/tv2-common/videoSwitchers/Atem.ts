import { TimelineObjectCoreExt, TSR } from 'blueprints-integration'
import { literal } from 'tv2-common'
import { SwitcherDveLLayer } from 'tv2-constants'
import _ = require('underscore')
import { AtemSourceIndex } from '../../types/atem'
import { ATEM_LAYER_PREFIX } from '../layers'
import { TimelineBlueprintExt } from '../onTimelineGenerate'
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
	TransitionStyle,
	VideoSwitcherBase
} from './index'

const TRANSITION_MAP = {
	[TransitionStyle.CUT]: TSR.AtemTransitionStyle.CUT,
	[TransitionStyle.DIP]: TSR.AtemTransitionStyle.DIP,
	[TransitionStyle.MIX]: TSR.AtemTransitionStyle.MIX,
	[TransitionStyle.STING]: TSR.AtemTransitionStyle.STING,
	[TransitionStyle.WIPE]: TSR.AtemTransitionStyle.WIPE,
	[TransitionStyle.WIPE_FOR_GFX]: TSR.AtemTransitionStyle.WIPE
}

export class Atem extends VideoSwitcherBase {
	public readonly type = SwitcherType.ATEM

	public isVideoSwitcherTimelineObject = (
		timelineObject: TSR.TSRTimelineObj
	): timelineObject is TSR.TimelineObjAtemAny => {
		return timelineObject.content.deviceType === TSR.DeviceType.ATEM
	}

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
			...this.getBaseProperties(props, props.layer),
			content: {
				deviceType: TSR.DeviceType.ATEM,
				type: TSR.TimelineContentTypeAtem.ME,
				me
			}
		}
	}

	public isMixEffect = (timelineObject: TSR.TSRTimelineObj): timelineObject is TSR.TimelineObjAtemME => {
		return (
			this.isVideoSwitcherTimelineObject(timelineObject) &&
			timelineObject.content.type === TSR.TimelineContentTypeAtem.ME
		)
	}

	public updateTransition(
		timelineObject: TSR.TSRTimelineObj,
		transition: TransitionStyle,
		transitionDuration?: number | undefined
	): TSR.TSRTimelineObj {
		if (!this.isMixEffect(timelineObject)) {
			this.logWrongTimelineObjectType(timelineObject, this.updateTransition.name)
			return timelineObject
		}
		timelineObject.content.me.transition = this.getTransition(transition)
		timelineObject.content.me.transitionSettings = this.getTransitionSettings(transition, transitionDuration)
		return timelineObject
	}
	public updatePreviewInput(
		timelineObject: TSR.TSRTimelineObj,
		previewInput: number | SpecialInput
	): TSR.TSRTimelineObj {
		if (!this.isMixEffect(timelineObject)) {
			this.logWrongTimelineObjectType(timelineObject, this.updatePreviewInput.name)
			return timelineObject
		}
		timelineObject.content.me.previewInput = this.getInputNumber(previewInput)
		return timelineObject
	}
	public updateInput(timelineObject: TSR.TSRTimelineObj, input: number | SpecialInput): TSR.TSRTimelineObj {
		if (!this.isMixEffect(timelineObject)) {
			this.logWrongTimelineObjectType(timelineObject, this.updateInput.name)
			return timelineObject
		}
		timelineObject.content.me.input = this.getInputNumber(input)
		return timelineObject
	}

	public getDskTimelineObject(props: DskProps) {
		const { content } = props
		const timelineObject: TSR.TimelineObjAtemDSK = {
			...this.getBaseProperties(props, props.layer),
			content: {
				deviceType: TSR.DeviceType.ATEM,
				type: TSR.TimelineContentTypeAtem.DSK,
				dsk: {
					onAir: content.onAir,
					sources: {
						fillSource: this.getInputNumber(content.config.Fill),
						cutSource: this.getInputNumber(content.config.Key)
					},
					properties: {
						clip: content.config.Clip * 10, // input is percents (0-100), atem uses 1-000,
						gain: content.config.Gain * 10, // input is percents (0-100), atem uses 1-000,
						mask: {
							enabled: false
						}
					}
				}
			}
		}
		return timelineObject
	}

	public getAuxTimelineObject(props: AuxProps): TSR.TimelineObjAtemAUX {
		return {
			...this.getBaseProperties(props, props.layer),
			content: {
				deviceType: TSR.DeviceType.ATEM,
				type: TSR.TimelineContentTypeAtem.AUX,
				aux: {
					input: this.getInputNumber(props.content.input)
				}
			}
		}
	}

	public isDsk = (timelineObject: TSR.TSRTimelineObj): timelineObject is TSR.TimelineObjAtemDSK => {
		return (
			this.isVideoSwitcherTimelineObject(timelineObject) &&
			timelineObject.content.type === TSR.TimelineContentTypeAtem.DSK
		)
	}
	public isAux = (timelineObject: TSR.TSRTimelineObj): timelineObject is TSR.TimelineObjAtemAUX => {
		return (
			this.isVideoSwitcherTimelineObject(timelineObject) &&
			timelineObject.content.type === TSR.TimelineContentTypeAtem.AUX
		)
	}
	public getDveTimelineObjects(props: DveProps): TSR.TSRTimelineObj[] {
		return [
			literal<TSR.TimelineObjAtemSsrc & TimelineBlueprintExt>({
				...this.getBaseProperties(props, SwitcherDveLLayer.DVE_BOXES),
				content: {
					deviceType: TSR.DeviceType.ATEM,
					type: TSR.TimelineContentTypeAtem.SSRC,
					ssrc: { boxes: props.content.boxes }
				}
			}),
			literal<TSR.TimelineObjAtemSsrcProps>({
				...this.getBaseProperties(props, SwitcherDveLLayer.DVE),
				content: {
					deviceType: TSR.DeviceType.ATEM,
					type: TSR.TimelineContentTypeAtem.SSRCPROPS,
					ssrcProps: {
						artFillSource: props.content.artFillSource,
						artCutSource: props.content.artCutSource,
						artOption: 1,
						...(props.content.template.properties && props.content.template.properties?.artPreMultiplied === false
							? {
									artPreMultiplied: false,
									artInvertKey: props.content.template.properties.artInvertKey,
									artClip: props.content.template.properties.artClip * 10,
									artGain: props.content.template.properties.artGain * 10
							  }
							: { artPreMultiplied: true }),
						...(props.content.template.border?.borderEnabled
							? {
									...props.content.template.border
							  }
							: { borderEnabled: false })
					}
				}
			})
		]
	}
	public updateAuxInput(timelineObject: TSR.TSRTimelineObj, input: number | SpecialInput): TSR.TSRTimelineObj {
		if (!this.isAux(timelineObject)) {
			this.logWrongTimelineObjectType(timelineObject, this.updateAuxInput.name)
			return timelineObject
		}
		timelineObject.content.aux.input = this.getInputNumber(input)
		return timelineObject
	}
	public isDveBoxes = (timelineObject: TSR.TSRTimelineObj): timelineObject is TSR.TimelineObjAtemSsrc => {
		return (
			this.isVideoSwitcherTimelineObject(timelineObject) &&
			timelineObject.content.type === TSR.TimelineContentTypeAtem.SSRC
		)
	}
	public updateUnpopulatedDveBoxes(
		_timelineObject: TimelineObjectCoreExt<unknown, unknown>,
		_input: number | SpecialInput
	): TSR.TSRTimelineObj {
		throw new Error('Method not implemented.')
	}

	private getBaseProperties(
		props: TimelineObjectProps,
		layer: string
	): Omit<TSR.TimelineObjAtemAny, 'content' | 'keyframes'> {
		return {
			...TIMELINE_OBJECT_DEFAULTS,
			..._.omit(props, 'content'),
			layer: ATEM_LAYER_PREFIX + layer
		}
	}

	private getInputNumber(input: number | SpecialInput) {
		// this is kind of pointless, but I'm not sure SpecialInput being ATEM values is right
		return input
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
				return { dip: { rate: duration, input: this.config.studio?.SwitcherSource?.Dip ?? AtemSourceIndex.Col2 } }
			case TransitionStyle.MIX:
				return { mix: { rate: duration } }
			case TransitionStyle.WIPE:
				return { wipe: { rate: duration } }
			case TransitionStyle.WIPE_FOR_GFX:
				return {
					wipe: {
						rate: this.config.studio.HTMLGraphics.TransitionSettings.wipeRate,
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
		return keyers.map((keyer) => ({
			upstreamKeyerId: keyer.config.Number,
			onAir: keyer.onAir,
			mixEffectKeyType: 0,
			flyEnabled: false,
			fillSource: keyer.config.Fill,
			cutSource: keyer.config.Key,
			maskEnabled: false,
			lumaSettings: {
				clip: keyer.config.Clip * 10, // input is percents (0-100), atem uses 1-000
				gain: keyer.config.Gain * 10 // input is percents (0-100), atem uses 1-000
			}
		}))
	}
}
