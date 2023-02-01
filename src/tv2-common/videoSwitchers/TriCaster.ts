import { TSR } from 'blueprints-integration'
import { AuxProps, DskProps, MixEffectProps, SpecialInput, SwitcherType, TransitionStyle } from './types'
import { VideoSwitcherImpl } from './VideoSwitcher'

const SPECIAL_INPUT_MAP = {
	[SpecialInput.ME1_PROGRAM]: 'v1',
	[SpecialInput.ME2_PROGRAM]: 'v2',
	[SpecialInput.SSRC]: 'v2' // todo: get this from config
}

const TRANSITION_MAP: Record<TransitionStyle, TSR.TriCasterTransitionEffect> = {
	[TransitionStyle.CUT]: 'cut',
	[TransitionStyle.MIX]: 'fade',
	// making assumptions about the session here
	[TransitionStyle.DIP]: 1,
	[TransitionStyle.WIPE]: 2
}

export class TriCaster extends VideoSwitcherImpl {
	public readonly type = SwitcherType.ATEM

	public getMixEffectTimelineObject(props: MixEffectProps): TSR.TimelineObjTriCasterME {
		const { content } = props
		return {
			id: props.id,
			enable: props.enable,
			layer: props.layer,
			priority: props.priority,
			content: {
				deviceType: TSR.DeviceType.TRICASTER,
				type: TSR.TimelineContentTypeTriCaster.ME,
				me: {
					programInput: this.getInputName(content.input),
					transition: {
						effect: TRANSITION_MAP[content.transition],
						duration: content.transitionDuration ?? 1000 // @todo defaults and ranges
					}
				}
			}
		}
	}

	public getDskTimelineObjects(_properties: DskProps): TSR.TSRTimelineObj[] {
		throw new Error('Method not implemented.')
	}
	public getAuxTimelineObject(_properties: AuxProps): TSR.TSRTimelineObj {
		throw new Error('Method not implemented.')
	}

	private getInputName(input: number | SpecialInput) {
		if (typeof input === 'number') {
			return `input${input}`
		}
		return SPECIAL_INPUT_MAP[input]
	}
}
