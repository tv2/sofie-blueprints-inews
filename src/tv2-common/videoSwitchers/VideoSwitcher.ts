import { IStudioContext, TimelineObjectCoreExt, TSR } from 'blueprints-integration'
import {
	Atem,
	AuxProps,
	DskProps,
	DveProps,
	MixEffectProps,
	OnAirMixEffectProps,
	SpecialInput,
	SwitcherType,
	TransitionStyle,
	TriCaster,
	TV2StudioConfig,
	UniformConfig,
	VideoSwitcher
} from 'tv2-common'
import _ = require('underscore')

export abstract class VideoSwitcherImpl implements VideoSwitcher {
	public static getVideoSwitcher(
		core: IStudioContext,
		config: TV2StudioConfig,
		uniformConfig: UniformConfig
	): VideoSwitcherImpl {
		return config.studio.SwitcherType === SwitcherType.ATEM
			? new Atem(core, config, uniformConfig)
			: new TriCaster(core, config, uniformConfig)
	}
	public abstract readonly type: SwitcherType
	public abstract isDsk: (timelineObject: TimelineObjectCoreExt) => boolean
	public abstract isAux: (timelineObject: TimelineObjectCoreExt) => boolean
	public abstract isDveBoxes: (timelineObject: TimelineObjectCoreExt) => boolean
	public abstract isVideoSwitcherTimelineObject: (timelineObject: TimelineObjectCoreExt) => boolean
	public abstract isMixEffect: (timelineObject: TSR.TSRTimelineObj) => boolean
	protected readonly config: TV2StudioConfig
	protected readonly core: IStudioContext
	protected readonly uniformConfig: UniformConfig

	protected constructor(core: IStudioContext, config: TV2StudioConfig, uniformConfig: UniformConfig) {
		this.config = config
		this.core = core
		this.uniformConfig = uniformConfig
	}
	public getOnAirTimelineObjects(properties: OnAirMixEffectProps): TSR.TSRTimelineObj[] {
		const result: TSR.TSRTimelineObj[] = []
		const primaryId = properties.id ?? this.core.getHashId(this.uniformConfig.SwitcherLLayers.PrimaryMixEffect, true)
		result.push(
			this.getMixEffectTimelineObject({
				...properties,
				id: primaryId,
				layer: this.uniformConfig.SwitcherLLayers.PrimaryMixEffect
			})
		)
		if (this.uniformConfig.SwitcherLLayers.PrimaryMixEffectClone) {
			result.push(
				this.getMixEffectTimelineObject({
					...properties,
					layer: this.uniformConfig.SwitcherLLayers.PrimaryMixEffectClone,
					metaData: { ...properties.metaData, context: `Clone of Primary MixEffect timeline object ${primaryId}` }
				})
			)
		}
		if (this.uniformConfig.SwitcherLLayers.NextPreviewMixEffect && properties.content.input) {
			result.push(
				this.getMixEffectTimelineObject({
					..._.omit(properties, 'content'),
					content: { previewInput: properties.content.input },
					layer: this.uniformConfig.SwitcherLLayers.NextPreviewMixEffect,
					metaData: { ...properties.metaData, context: `Preview Lookahead for ${primaryId}` }
				})
			)
		}
		if (this.uniformConfig.SwitcherLLayers.NextAux && properties.content.input) {
			result.push(
				this.getAuxTimelineObject({
					..._.omit(properties, 'content'),
					priority: 0, // lower than lookahead-lookahead
					content: { input: properties.content.input },
					layer: this.uniformConfig.SwitcherLLayers.NextAux,
					metaData: { ...properties.metaData, context: `Aux Lookahead for ${primaryId}` }
				})
			)
		}
		if (this.uniformConfig.SwitcherLLayers.MixMinusAux) {
			const input = properties.mixMinusInput || properties.content.input
			if (input) {
				result.push(
					this.getAuxTimelineObject({
						..._.omit(properties, 'content'),
						content: { input },
						layer: this.uniformConfig.SwitcherLLayers.MixMinusAux,
						metaData: { ...properties.metaData, context: `Mix-minus for ${primaryId}` }
					})
				)
			}
		}
		return result
	}
	public abstract updateAuxInput(
		timelineObject: TimelineObjectCoreExt<unknown, unknown>,
		input: number | SpecialInput
	): TSR.TSRTimelineObj
	public abstract getDveTimelineObjects(properties: DveProps): TSR.TSRTimelineObj[]
	public abstract updateUnpopulatedDveBoxes(
		timelineObject: TimelineObjectCoreExt<unknown, unknown>,
		input: number | SpecialInput
	): TSR.TSRTimelineObj
	public abstract getMixEffectTimelineObject(properties: MixEffectProps): TSR.TSRTimelineObj
	public abstract updateTransition(
		timelineObjects: TSR.TSRTimelineObj,
		transition: TransitionStyle,
		transitionDuration?: number | undefined
	): TSR.TSRTimelineObj
	public abstract updatePreviewInput(
		timelineObject: TSR.TSRTimelineObj,
		previewInput: number | SpecialInput
	): TSR.TSRTimelineObj
	public abstract updateInput(timelineObject: TSR.TSRTimelineObj, input: number | SpecialInput): TSR.TSRTimelineObj

	public abstract getDskTimelineObject(properties: DskProps): TSR.TSRTimelineObj
	public abstract getAuxTimelineObject(properties: AuxProps): TSR.TSRTimelineObj
}
