import { TSR } from 'blueprints-integration'
import {
	Atem,
	AuxProps,
	DskProps,
	MixEffectProps,
	SwitcherType,
	TransitionStyle,
	TriCaster,
	TV2StudioConfig,
	VideoSwitcher
} from 'tv2-common'

export abstract class VideoSwitcherImpl implements VideoSwitcher {
	public static videoSwitcherSingleton: VideoSwitcherImpl | undefined = undefined
	public static getVideoSwitcher(config: TV2StudioConfig): VideoSwitcherImpl {
		if (!this.videoSwitcherSingleton || this.videoSwitcherSingleton.type !== config.studio.SwitcherType) {
			this.videoSwitcherSingleton =
				config.studio.SwitcherType === SwitcherType.ATEM ? new Atem(config) : new TriCaster(config)
		}
		return this.videoSwitcherSingleton
	}
	public abstract readonly type: SwitcherType
	protected readonly config: TV2StudioConfig

	protected constructor(config: TV2StudioConfig) {
		this.config = config
	}

	public abstract getMixEffectTimelineObject(properties: MixEffectProps): TSR.TSRTimelineObj
	public abstract findMixEffectTimelineObject(timelineObjects: TSR.TSRTimelineObj[]): TSR.TSRTimelineObj | undefined
	public abstract updateTransition(
		timelineObjects: TSR.TSRTimelineObj,
		transition: TransitionStyle,
		transitionDuration?: number | undefined
	): TSR.TSRTimelineObj

	public abstract getDskTimelineObjects(properties: DskProps): TSR.TSRTimelineObj[]
	public abstract getAuxTimelineObject(properties: AuxProps): TSR.TSRTimelineObj
}
