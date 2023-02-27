import { IStudioContext, TimelineObjectCoreExt, TSR } from 'blueprints-integration'
import { literal, TimeFromFrames, TV2StudioConfig, UniformConfig } from 'tv2-common'
import { SwitcherDveLLayer } from 'tv2-constants'
import _ = require('underscore')
import { TRICASTER_DVE_ME, TRICASTER_LAYER_PREFIX } from '../layers'
import { TriCasterDveConverter } from './TriCasterDveConverter'
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
	[SpecialInput.ME1_PROGRAM]: 'v1',
	[SpecialInput.ME2_PROGRAM]: 'v2',
	[SpecialInput.ME3_PROGRAM]: 'v3',
	[SpecialInput.ME4_PROGRAM]: 'v4',
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

const DVE_OVERLAY_INPUT_NUMBER: number = 5

export class TriCaster extends VideoSwitcherImpl {
	public readonly type = SwitcherType.ATEM

	public isMixEffect = TSR.isTimelineObjTriCasterME

	public isDsk = TSR.isTimelineObjTriCasterDSK
	public isAux = TSR.isTimelineObjTriCasterMixOutput
	public isVideoSwitcherTimelineObject = TSR.isTimelineObjTriCaster

	private dveConverter: TriCasterDveConverter

	constructor(
		core: IStudioContext,
		config: TV2StudioConfig,
		uniformConfig: UniformConfig,
		dveConverter: TriCasterDveConverter
	) {
		super(core, config, uniformConfig)
		this.dveConverter = dveConverter
	}

	public getMixEffectTimelineObject(props: MixEffectProps): TSR.TimelineObjTriCasterME {
		const { content } = props
		const transition = this.getTransition(content.transition)
		const result: TSR.TimelineObjTriCasterME = {
			...this.getBaseProperties(props, props.layer),
			content: {
				deviceType: TSR.DeviceType.TRICASTER,
				type: TSR.TimelineContentTypeTriCaster.ME,
				me: {
					programInput: this.getInputName(content.input),
					...(content.previewInput !== undefined && transition === 'cut'
						? { previewInput: this.getInputName(content.previewInput) }
						: {}),
					transitionEffect: transition,
					transitionDuration: this.getTransitionDuration(content.transition, content.transitionDuration),
					keyers: content.keyers && this.getKeyers(content.keyers)
				}
			}
		}
		return result
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
		timelineObject.content.me.transitionEffect = this.getTransition(transition)
		;(timelineObject.content.me as TSR.TriCasterMixEffectInMixMode).transitionDuration = this.getTransitionDuration(
			transition,
			transitionDuration
		)
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

	public getDskTimelineObject(props: DskProps): TSR.TimelineObjTriCasterME {
		// we chose to use an ME (not the main switcher) as the PGM ME, hence this returns just an ME object
		return {
			...this.getBaseProperties(props, props.layer),
			content: {
				deviceType: TSR.DeviceType.TRICASTER,
				type: TSR.TimelineContentTypeTriCaster.ME,
				me: {
					keyers: {
						[`dsk${props.content.config.Number + 1}`]: {
							onAir: props.content.onAir,
							input: this.getInputName(props.content.config.Fill)
						}
					}
				}
			}
		}
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

	public updateUnpopulatedDveBoxes(
		_timelineObject: TSR.TSRTimelineObj,
		_input: number | SpecialInput
	): TSR.TSRTimelineObj {
		throw new Error('Method not implemented.')
	}

	public getDveTimelineObjects(dveProps: DveProps): TSR.TSRTimelineObj[] {
		return [
			literal<TSR.TimelineObjTriCasterME>({
				id: '',
				enable: dveProps.enable ?? { start: 0 },
				layer: TRICASTER_LAYER_PREFIX + SwitcherDveLLayer.DveBoxes,
				priority: 1,
				content: {
					deviceType: TSR.DeviceType.TRICASTER,
					type: TSR.TimelineContentTypeTriCaster.ME,
					me: literal<TSR.TriCasterMixEffectInEffectMode>({
						transitionEffect: 8,
						layers: this.generateDveBoxLayers(dveProps.content.boxes),
						keyers: this.generateOverlayKeyer()
					})
				}
			})
		]
	}

	private generateDveBoxLayers(boxes: any[]): Partial<Record<TSR.TriCasterLayerName, TSR.TriCasterLayer>> {
		return {
			a: boxes[0].enabled ? this.generateDveBoxLayout(boxes[0]) : this.generateInvisibleBoxLayer(),
			b: boxes[1].enabled ? this.generateDveBoxLayout(boxes[1]) : this.generateInvisibleBoxLayer(),
			c: boxes[2].enabled ? this.generateDveBoxLayout(boxes[2]) : this.generateInvisibleBoxLayer(),
			d: boxes[3].enabled ? this.generateDveBoxLayout(boxes[3]) : this.generateInvisibleBoxLayer()
		}
	}

	private generateDveBoxLayout(box: any): TSR.TriCasterLayer {
		return {
			input: this.getInputName(box.source),
			positioningAndCropEnabled: true,
			position: this.dveConverter.convertPosition(box.x, box.y),
			scale: this.dveConverter.convertScale(box.size),
			crop: this.dveConverter.convertCrop(box)
		}
	}

	private generateInvisibleBoxLayer(): TSR.TriCasterLayer {
		return {
			input: 'Black',
			positioningAndCropEnabled: true,
			position: {
				x: -3.555,
				y: -2
			},
			crop: {
				down: 0,
				up: 0,
				left: 0,
				right: 0
			}
		}
	}

	private generateOverlayKeyer(): Record<TSR.TriCasterKeyerName, TSR.TriCasterKeyer> {
		return {
			dsk1: {
				input: this.getInputName(this.config.studio.SwitcherSource?.SplitArtFill ?? DVE_OVERLAY_INPUT_NUMBER),
				onAir: true,
				transitionEffect: 'cut'
			}
		}
	}

	private getTransitionDuration(transition?: TransitionStyle, durationInFrames?: number): number {
		if (transition === TransitionStyle.WIPE_FOR_GFX) {
			durationInFrames = this.config.studio.HTMLGraphics.TransitionSettings.wipeRate
		}
		return TimeFromFrames(durationInFrames ?? 25) / 1000
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
			accumulator[`dsk${keyer.config.Number + 1}`] = {
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
