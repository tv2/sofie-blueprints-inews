import { TSR } from 'blueprints-integration'
import { literal, SwitcherInput } from 'tv2-common'
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
	numericSwitcherInput,
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
		// Core 46's types omit the existing ATEM transition selection used by the Qbox jingle preview.
		const me: TSR.TimelineObjAtemME['content']['me'] & { transitionProperties?: { selection: number } } =
			content.input !== undefined && content.transition !== undefined
				? {
						input: this.getInputNumber(content.input),
						transition: this.getTransition(content.transition),
						transitionSettings:
							content.atemTransitionSettings ??
							this.getTransitionSettings(content.transition, content.transitionDuration)
				  }
				: {
						programInput: content.input === undefined ? undefined : this.getInputNumber(content.input),
						previewInput: content.previewInput === undefined ? undefined : this.getInputNumber(content.previewInput)
				  }
		const upstreamKeyers = content.keyers && this.getUpstreamKeyers(content.keyers)
		if (upstreamKeyers) {
			me.upstreamKeyers = upstreamKeyers
			if (content.transitionKeyers) {
				me.transitionProperties = {
					selection: upstreamKeyers.reduce((selection, keyer) => selection | (1 << (keyer.upstreamKeyerId + 1)), 1)
				}
			}
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
		transitionDuration?: number | undefined,
		atemTransitionSettings?: TSR.AtemTransitionSettings
	): TSR.TSRTimelineObj {
		if (!this.isMixEffect(timelineObject)) {
			this.logWrongTimelineObjectType(timelineObject, this.updateTransition.name)
			return timelineObject
		}
		const me = timelineObject.content.me
		const input = me.input ?? me.programInput
		if (input !== undefined) {
			timelineObject.content.me = {
				..._.omit(me, 'programInput', 'previewInput'),
				input,
				transition: this.getTransition(transition)
			}
		}
		timelineObject.content.me.transition = this.getTransition(transition)
		timelineObject.content.me.transitionSettings =
			atemTransitionSettings ?? this.getTransitionSettings(transition, transitionDuration)
		return timelineObject
	}
	public updatePreviewInput(timelineObject: TSR.TSRTimelineObj, previewInput: SwitcherInput): TSR.TSRTimelineObj {
		if (!this.isMixEffect(timelineObject)) {
			this.logWrongTimelineObjectType(timelineObject, this.updatePreviewInput.name)
			return timelineObject
		}
		timelineObject.content.me.previewInput = this.getInputNumber(previewInput)
		return timelineObject
	}
	public updateInput(timelineObject: TSR.TSRTimelineObj, input: SwitcherInput): TSR.TSRTimelineObj {
		if (!this.isMixEffect(timelineObject)) {
			this.logWrongTimelineObjectType(timelineObject, this.updateInput.name)
			return timelineObject
		}
		if (timelineObject.content.me.programInput !== undefined) {
			timelineObject.content.me.programInput = this.getInputNumber(input)
		} else {
			timelineObject.content.me.input = this.getInputNumber(input)
		}
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
		const boxes: Array<Omit<TSR.SuperSourceBox, 'source'> & { source?: SwitcherInput }> = props.content.boxes
		return [
			literal<TSR.TimelineObjAtemSsrc & TimelineBlueprintExt>({
				...this.getBaseProperties(props, SwitcherDveLLayer.DveBoxes),
				content: {
					deviceType: TSR.DeviceType.ATEM,
					type: TSR.TimelineContentTypeAtem.SSRC,
					ssrc: {
						boxes: boxes.map(box => ({
							...box,
							source: box.source === undefined ? undefined : this.getInputNumber(box.source)
						}))
					}
				}
			}),
			literal<TSR.TimelineObjAtemSsrcProps>({
				...this.getBaseProperties(props, SwitcherDveLLayer.Dve),
				content: {
					deviceType: TSR.DeviceType.ATEM,
					type: TSR.TimelineContentTypeAtem.SSRCPROPS,
					ssrcProps: {
						artFillSource: this.getInputNumber(props.content.artFillSource),
						artCutSource: this.getInputNumber(props.content.artCutSource),
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
	public updateAuxInput(timelineObject: TSR.TSRTimelineObj, input: SwitcherInput): TSR.TSRTimelineObj {
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
	public updateUnpopulatedDveBoxes(timelineObject: TSR.TSRTimelineObj, input: SwitcherInput): TSR.TSRTimelineObj {
		if (!this.isDveBoxes(timelineObject)) {
			this.logWrongTimelineObjectType(timelineObject, this.updateUnpopulatedDveBoxes.name)
			return timelineObject
		}
		for (const box of timelineObject.content.ssrc.boxes) {
			if (box.source === SpecialInput.AB_PLACEHOLDER) {
				box.source = this.getInputNumber(input)
			}
		}
		return timelineObject
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

	private getInputNumber(input: SwitcherInput) {
		return numericSwitcherInput(input)
	}
	private getTransition(transition: TransitionStyle) {
		return TRANSITION_MAP[transition]
	}
	private getTransitionSettings(
		transition: TransitionStyle,
		duration?: number
	): TSR.AtemTransitionSettings | undefined {
		switch (transition) {
			case TransitionStyle.CUT:
			case TransitionStyle.STING:
				return undefined
			case TransitionStyle.DIP:
				return duration
					? {
							dip: {
								rate: duration,
								input: this.getInputNumber(this.config.studio?.SwitcherSource?.Dip ?? AtemSourceIndex.Col2)
							}
					  }
					: undefined
			case TransitionStyle.MIX:
				return duration ? { mix: { rate: duration } } : undefined
			case TransitionStyle.WIPE:
				return duration ? { wipe: { rate: duration } } : undefined
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
		return keyers.map(keyer => ({
			upstreamKeyerId: keyer.config.Number,
			onAir: keyer.onAir,
			mixEffectKeyType: 0,
			flyEnabled: false,
			fillSource: this.getInputNumber(keyer.config.Fill),
			cutSource: this.getInputNumber(keyer.config.Key),
			maskEnabled: false,
			lumaSettings: {
				clip: keyer.config.Clip * 10, // input is percents (0-100), atem uses 1-000
				gain: keyer.config.Gain * 10 // input is percents (0-100), atem uses 1-000
			}
		}))
	}
}
