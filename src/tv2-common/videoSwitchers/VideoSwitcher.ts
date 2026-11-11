import { IStudioContext, TimelineObjectCoreExt, TSR } from 'blueprints-integration'
import {
	Atem,
	AuxProps,
	DskProps,
	DveProps,
	getTimeFromFrames,
	M2LX,
	MixEffectProps,
	OnAirMixEffectProps,
	SwitcherInput,
	SwitcherType,
	TransitionStyle,
	TriCaster,
	TV2ShowstyleBlueprintConfigBase,
	TV2StudioConfig,
	UniformConfig,
	VideoSwitcher
} from 'tv2-common'
import { ControlClasses, SwitcherAuxLLayer } from 'tv2-constants'
import _ = require('underscore')
import { AtemToTriCasterDveConverter } from './atemToTriCasterDveConverter'

export abstract class VideoSwitcherBase implements VideoSwitcher {
	public static getVideoSwitcher(
		core: IStudioContext,
		config: TV2StudioConfig,
		uniformConfig: UniformConfig
	): VideoSwitcherBase {
		switch (config.studio.SwitcherType) {
			case undefined:
			case SwitcherType.ATEM:
				return new Atem(core, config, uniformConfig)
			case SwitcherType.TRICASTER:
				return new TriCaster(core, config, uniformConfig, new AtemToTriCasterDveConverter())
			case SwitcherType.M2LX:
				return new M2LX(core, config, uniformConfig)
			default:
				throw new Error(`Unsupported video switcher: ${config.studio.SwitcherType}`)
		}
	}
	public abstract readonly type: SwitcherType
	public abstract isDsk: (timelineObject: TimelineObjectCoreExt) => boolean
	public abstract isAux: (timelineObject: TimelineObjectCoreExt) => boolean
	public abstract isDveBoxes: (timelineObject: TimelineObjectCoreExt) => boolean
	public abstract isVideoSwitcherTimelineObject: (timelineObject: TimelineObjectCoreExt) => boolean
	public abstract isMixEffect: (timelineObject: TSR.TSRTimelineObj) => boolean
	protected readonly config: TV2StudioConfig & { showStyle?: TV2ShowstyleBlueprintConfigBase }
	protected readonly core: IStudioContext
	protected readonly uniformConfig: UniformConfig

	protected constructor(core: IStudioContext, config: TV2StudioConfig, uniformConfig: UniformConfig) {
		this.config = config
		this.core = core
		this.uniformConfig = uniformConfig
	}

	public supportsAuxLayer(_layer: SwitcherAuxLLayer): boolean {
		return true
	}

	public getOnAirTimelineObjects(properties: OnAirMixEffectProps): TSR.TSRTimelineObj[] {
		const result: TSR.TSRTimelineObj[] = []
		const primaryId = properties.id ?? this.core.getHashId(this.uniformConfig.switcherLLayers.primaryMixEffect, true)
		result.push(
			this.getMixEffectTimelineObject({
				...properties,
				id: primaryId,
				layer: this.uniformConfig.switcherLLayers.primaryMixEffect
			})
		)

		// In order to set the preview we need to create another TimelineObject after the transition is over that sets program and preview.
		if (properties.content.transitionDuration) {
			// We need a slight delay before we tell the VideoMixer to set the next source, else we risk that the VideoMixer sets the next source in program.
			const previewTimelineObjectDelay: number = 300
			result.push(
				this.getMixEffectTimelineObject({
					...properties,
					id: primaryId + '_after_transition',
					layer: this.uniformConfig.switcherLLayers.primaryMixEffect,
					enable: {
						start: `#${primaryId}.start + ${getTimeFromFrames(properties.content.transitionDuration) +
							previewTimelineObjectDelay}`
					},
					content: {
						input: properties.content.input,
						transition: undefined
					}
				})
			)
		}

		if (this.uniformConfig.switcherLLayers.primaryMixEffectClone) {
			result.push(
				this.getMixEffectTimelineObject({
					..._.omit(properties, 'classes'),
					layer: this.uniformConfig.switcherLLayers.primaryMixEffectClone,
					metaData: { ...properties.metaData, context: `Clone of Primary MixEffect timeline object ${primaryId}` }
				})
			)
		}
		return result
	}

	public getOnAirTimelineObjectsWithLookahead(properties: OnAirMixEffectProps): TSR.TSRTimelineObj[] {
		const result: TSR.TSRTimelineObj[] = this.getOnAirTimelineObjects(properties)
		if (properties.classes?.includes(ControlClasses.NOLookahead)) {
			return result
		}
		const primaryId = result[0].id
		if (this.uniformConfig.switcherLLayers.nextPreviewMixEffect && properties.content.input !== undefined) {
			result.push(
				this.getMixEffectTimelineObject({
					..._.omit(properties, 'content', 'classes'),
					content: { previewInput: properties.content.input },
					layer: this.uniformConfig.switcherLLayers.nextPreviewMixEffect,
					metaData: { ...properties.metaData, context: `Preview Lookahead for ${primaryId}` }
				})
			)
		}
		if (this.uniformConfig.switcherLLayers.nextAux && properties.content.input !== undefined) {
			result.push(
				this.getAuxTimelineObject({
					..._.omit(properties, 'content', 'classes'),
					priority: 0, // lower than lookahead-lookahead
					content: { input: properties.content.input },
					layer: this.uniformConfig.switcherLLayers.nextAux,
					metaData: { ...properties.metaData, context: `Aux Lookahead for ${primaryId}` }
				})
			)
		}
		return result
	}

	public abstract updateAuxInput(
		timelineObject: TimelineObjectCoreExt<unknown, unknown>,
		input: SwitcherInput
	): TSR.TSRTimelineObj
	public abstract getDveTimelineObjects(properties: DveProps): TSR.TSRTimelineObj[]
	public abstract updateUnpopulatedDveBoxes(
		timelineObject: TimelineObjectCoreExt<unknown, unknown>,
		input: SwitcherInput
	): TSR.TSRTimelineObj
	public abstract getMixEffectTimelineObject(properties: MixEffectProps): TSR.TSRTimelineObj
	public abstract updateTransition(
		timelineObjects: TSR.TSRTimelineObj,
		transition: TransitionStyle,
		transitionDuration?: number | undefined,
		atemTransitionSettings?: TSR.AtemTransitionSettings,
		wipeDirection?: string
	): TSR.TSRTimelineObj
	public abstract updatePreviewInput(
		timelineObject: TSR.TSRTimelineObj,
		previewInput: SwitcherInput
	): TSR.TSRTimelineObj
	public abstract updateInput(timelineObject: TSR.TSRTimelineObj, input: SwitcherInput): TSR.TSRTimelineObj

	public abstract getDskTimelineObject(properties: DskProps): TSR.TSRTimelineObj
	public abstract getAuxTimelineObject(properties: AuxProps): TSR.TSRTimelineObj

	protected logWrongTimelineObjectType(timelineObject: TSR.TSRTimelineObj, functionName: string) {
		this.core.logWarning(
			`Modifying an incompatible timeline object (${JSON.stringify(
				_.pick(timelineObject.content, 'deviceType', 'type')
			)}) in ${functionName}`
		)
	}
}
