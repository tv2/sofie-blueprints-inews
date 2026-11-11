import { IStudioContext, LookaheadMode, TSR } from 'blueprints-integration'
import {
	AuxProps,
	DskProps,
	DveProps,
	getDskLLayerName,
	getTimeFromFrames,
	MixEffectProps,
	OnAirMixEffectProps,
	SpecialInput,
	SwitcherInput,
	SwitcherType,
	TIMELINE_OBJECT_DEFAULTS,
	TimelineBlueprintExt,
	TimelineObjectProps,
	TransitionStyle,
	TV2StudioConfig,
	UniformConfig
} from 'tv2-common'
import { SwitcherAuxLLayer } from 'tv2-constants'
import {
	M2LX_DVE_GRAPHICS_LAYER,
	M2LX_LAYER_PREFIX,
	M2LX_WIPE_EFFECTS,
	m2lxAssert,
	M2LXConfiguration,
	resolveM2LXConfiguration
} from './m2lxConfig'
import { parseM2LXLayout } from './m2lxLayout'
import { VideoSwitcherBase } from './VideoSwitcher'

export class M2LX extends VideoSwitcherBase {
	public readonly type = SwitcherType.M2LX
	public readonly native: M2LXConfiguration
	public isVideoSwitcherTimelineObject = TSR.isTimelineObjM2LX
	public isMixEffect = TSR.isTimelineObjM2LXMixer
	public isDsk = TSR.isTimelineObjM2LXKeyer
	public isAux = TSR.isTimelineObjM2LXRouter
	constructor(core: IStudioContext, config: TV2StudioConfig, uniformConfig: UniformConfig) {
		super(core, config, uniformConfig)
		m2lxAssert(uniformConfig.profile === 'singleMixer', 'only the single-mixer Offtube profile is supported')
		const { deviceId, config: native } = resolveM2LXConfiguration(config.studio, core.getStudioMappings())
		this.native = native
		for (const [layer, mapping] of Object.entries(core.getStudioMappings())) {
			const ownedLayer = layer.startsWith(M2LX_LAYER_PREFIX)
			if (!ownedLayer && (mapping.device !== TSR.DeviceType.M2LX || mapping.deviceId !== deviceId)) {
				continue
			}
			m2lxAssert(
				mapping.device === TSR.DeviceType.M2LX && mapping.deviceId === deviceId,
				`mapping ${layer} targets a different device; reconcile manually while inactive`
			)
			const nativeMapping = mapping as typeof mapping & TSR.MappingM2LX
			if (nativeMapping.mappingType === TSR.MappingM2LXType.MIXER) {
				m2lxAssert(
					layer === M2LX_LAYER_PREFIX + uniformConfig.switcherLLayers.primaryMixEffect &&
						mapping.lookahead === LookaheadMode.PRELOAD,
					'configure exactly one mixer mapping with Preload lookahead'
				)
			} else if (nativeMapping.mappingType === TSR.MappingM2LXType.KEYER) {
				if (
					this.native.dveGraphicsDsk !== undefined &&
					nativeMapping.keyer?.type === TSR.M2LXKeyerType.DSK &&
					nativeMapping.keyer.index === this.native.dveGraphicsDsk
				) {
					m2lxAssert(
						layer === M2LX_DVE_GRAPHICS_LAYER &&
							nativeMapping.bus === TSR.M2LXMixerBus.PROGRAM &&
							mapping.lookahead === LookaheadMode.NONE,
						`mapping ${layer} controls the DVE graphics DSK; it is managed on both buses by the mixer composition`
					)
					continue
				}
				m2lxAssert(
					nativeMapping.keyer?.type !== TSR.M2LXKeyerType.PIP ||
						!this.native.compositionPips?.includes(nativeMapping.keyer.index),
					`mapping ${layer} controls a managed Split Screen box; remove its separate graphics mappings on both buses while inactive`
				)
				m2lxAssert(
					this.native.keyers.some(
						row =>
							layer === M2LX_LAYER_PREFIX + row.layer &&
							row.bus === nativeMapping.bus &&
							row.keyer.type === nativeMapping.keyer?.type &&
							row.keyer.index === nativeMapping.keyer?.index
					) && mapping.lookahead === LookaheadMode.NONE,
					`mapping ${layer} controls an unowned/changed keyer or enables unsafe lookahead; reconcile manually`
				)
			} else if (nativeMapping.mappingType === TSR.MappingM2LXType.ROUTER) {
				m2lxAssert(
					this.native.routers.some(
						row =>
							layer === M2LX_LAYER_PREFIX + row.layer &&
							(row.node ?? 'router') === (nativeMapping.node ?? 'router') &&
							row.output === nativeMapping.output
					) && mapping.lookahead === LookaheadMode.NONE,
					`mapping ${layer} controls an unowned/changed router; reconcile manually`
				)
			} else {
				m2lxAssert(false, `mapping ${layer} is outside the configured Offtube mixer/keyer/router profile`)
			}
		}
	}

	public source(input: SwitcherInput): string {
		m2lxAssert(input !== SpecialInput.AB_PLACEHOLDER, 'AB player has not been assigned')
		m2lxAssert(
			typeof input === 'string' && input.trim() && input === input.trim(),
			'enter the exact source name on the mixer in the existing video input setting; numeric special sources are never inferred'
		)
		return input
	}

	public isDveBoxes = (object: TSR.TSRTimelineObj): object is TSR.TimelineObjM2LXKeyer | TSR.TimelineObjM2LXMixer =>
		TSR.isTimelineObjM2LXKeyer(object) ||
		(TSR.isTimelineObjM2LXMixer(object) && (object as TimelineBlueprintExt).metaData?.m2lxDve === true)

	public getMixEffectTimelineObject(props: MixEffectProps): TSR.TimelineObjM2LXMixer & TimelineBlueprintExt {
		m2lxAssert(
			props.layer === this.uniformConfig.switcherLLayers.primaryMixEffect,
			'independent M/Es and clean feeds are unsupported'
		)
		m2lxAssert(
			!props.content.keyers?.length && !props.content.transitionKeyers,
			'embedded keyers require the collection API'
		)
		m2lxAssert(!props.content.atemTransitionSettings, 'ATEM transition settings are not native M2L-X effects')
		const { input, previewInput, transition, transitionDuration } = props.content
		m2lxAssert(
			input !== undefined,
			'an ordinary mixer requires its Program intent; use Core lookahead, not a separate Preview-only mixer'
		)
		m2lxAssert(
			!(input === SpecialInput.AB_PLACEHOLDER && previewInput === SpecialInput.AB_PLACEHOLDER),
			'one mixer object cannot bind two unassigned AB inputs'
		)
		const object: TSR.TimelineObjM2LXMixer & TimelineBlueprintExt = {
			...this.base(props, props.layer),
			content: {
				deviceType: TSR.DeviceType.M2LX,
				type: TSR.TimelineContentTypeM2LX.MIXER,
				mixer: {
					program: input === undefined || input === SpecialInput.AB_PLACEHOLDER ? undefined : this.source(input),
					preview:
						previewInput === undefined || previewInput === SpecialInput.AB_PLACEHOLDER
							? undefined
							: this.source(previewInput),
					transition:
						transition === undefined
							? undefined
							: this.transition(transition, transitionDuration, props.content.wipeDirection),
					composition: this.hiddenComposition()
				}
			}
		}
		if (input === SpecialInput.AB_PLACEHOLDER || previewInput === SpecialInput.AB_PLACEHOLDER) {
			object.metaData = {
				...object.metaData,
				m2lxPendingInput: input === SpecialInput.AB_PLACEHOLDER ? 'program' : 'preview'
			}
		}
		return object
	}

	public getOnAirTimelineObjects(props: OnAirMixEffectProps): TSR.TSRTimelineObj[] {
		m2lxAssert(!props.content.transitionKeyers, 'atomic keyer transitions are not supported')
		const { keyers, ...content } = props.content
		m2lxAssert(
			content.input !== undefined || keyers?.length,
			'on-air collection requires Program input or explicit keyer intents'
		)
		m2lxAssert(
			content.input !== undefined || content.transition === undefined,
			'keyer-only transitions are unsupported'
		)
		m2lxAssert(
			content.input !== undefined || content.previewInput === undefined,
			'Preview requires the same ordinary Program intent, not a separate mixer object'
		)
		return [
			...(content.input === undefined
				? []
				: [
						this.getMixEffectTimelineObject({
							...props,
							content,
							layer: this.uniformConfig.switcherLLayers.primaryMixEffect
						})
				  ]),
			...(keyers ?? []).map(keyer =>
				this.getDskTimelineObject({
					...props,
					id: props.id ? `${props.id}_keyer_${keyer.config.Number}` : undefined,
					layer: getDskLLayerName(keyer.config.Number),
					content: { onAir: keyer.onAir, config: keyer.config }
				})
			)
		]
	}

	public getOnAirTimelineObjectsWithLookahead(props: OnAirMixEffectProps): TSR.TSRTimelineObj[] {
		// Core creates lookahead on the same mapping. TSR parks its program on Preview.
		return this.getOnAirTimelineObjects(props)
	}

	public updateTransition(
		object: TSR.TSRTimelineObj,
		style: TransitionStyle,
		frames?: number,
		atem?: TSR.AtemTransitionSettings,
		wipeDirection?: string
	) {
		m2lxAssert(this.isMixEffect(object), 'transition target must be a native mixer')
		m2lxAssert(!atem, 'ATEM transition settings are unsupported')
		object.content.mixer.transition = this.transition(style, frames, wipeDirection)
		return object
	}

	public updateInput(object: TSR.TSRTimelineObj, input: SwitcherInput) {
		m2lxAssert(this.isMixEffect(object), 'input target must be a native mixer')
		const metaData = (object as TimelineBlueprintExt).metaData
		if (metaData?.m2lxPendingInput === 'preview') {
			return this.updatePreviewInput(object, input)
		}
		object.content.mixer.program = this.source(input)
		if (metaData) {
			delete metaData.m2lxPendingInput
		}
		return object
	}

	public updatePreviewInput(object: TSR.TSRTimelineObj, input: SwitcherInput) {
		m2lxAssert(this.isMixEffect(object), 'preview target must be a native mixer')
		object.content.mixer.preview = this.source(input)
		const metaData = (object as TimelineBlueprintExt).metaData
		if (metaData?.m2lxPendingInput === 'preview') {
			delete metaData.m2lxPendingInput
		}
		return object
	}

	public getDskTimelineObject(props: DskProps): TSR.TimelineObjM2LXKeyer {
		const allocation = this.native.keyers.find(row => row.layer === props.layer)
		m2lxAssert(allocation, `keyer layer ${props.layer} is not explicitly owned`)
		m2lxAssert(
			allocation.composition && allocation.preconfigured,
			`keyer ${props.layer} requires an operator-validated native composition`
		)
		for (const key of ['Number', 'Fill', 'Key', 'Clip', 'Gain'] as const) {
			m2lxAssert(
				allocation.composition[key] === props.content.config[key],
				`keyer ${props.layer} ${key} differs from its preconfigured native composition`
			)
		}
		return {
			...this.base(props, props.layer),
			content: {
				deviceType: TSR.DeviceType.M2LX,
				type: TSR.TimelineContentTypeM2LX.KEYER,
				keyer: { visible: props.content.onAir, source: allocation.source }
			}
		}
	}

	public supportsAuxLayer(layer: SwitcherAuxLLayer): boolean {
		return this.native.routers.some(row => row.layer === layer)
	}

	public getAuxTimelineObject(props: AuxProps): TSR.TimelineObjM2LXRouter & TimelineBlueprintExt {
		m2lxAssert(
			this.supportsAuxLayer(props.layer),
			`router layer ${props.layer} is not configured; clean-feed aliases are unsupported`
		)
		m2lxAssert(props.content.input !== SpecialInput.AB_PLACEHOLDER, 'router AB assignment requires a resolved source')
		return {
			...this.base(props, props.layer),
			content: {
				deviceType: TSR.DeviceType.M2LX,
				type: TSR.TimelineContentTypeM2LX.ROUTER,
				input: this.source(props.content.input)
			}
		}
	}

	public updateAuxInput(object: TSR.TSRTimelineObj, input: SwitcherInput) {
		m2lxAssert(this.isAux(object), 'router input target must be native')
		object.content.input = this.source(input)
		return object
	}

	public getDveTimelineObjects(props: DveProps): TSR.TSRTimelineObj[] {
		const layout = parseM2LXLayout(
			props.content.template,
			this.config.studio.SwitcherSource.SplitBackground ?? this.config.studio.SwitcherSource.Default
		)
		this.source(layout.background)
		const boxes = props.content.boxes as Array<{ source: SwitcherInput }>
		const composition = this.hiddenComposition()
		const object = this.getMixEffectTimelineObject({
			...props,
			layer: this.uniformConfig.switcherLLayers.primaryMixEffect,
			content: { input: layout.background, transition: TransitionStyle.CUT }
		})
		object.metaData = { ...object.metaData, m2lxDve: true }
		Object.values(layout.boxes).forEach((box, position) => {
			if (!box.enabled) {
				return
			}
			const { translation, scale, crop } = box
			m2lxAssert(
				translation && scale && crop,
				'each visible Split Screen box needs position, size and cropping settings'
			)
			const geometry = { translation, scale, crop }
			if (boxes[position]?.source === SpecialInput.AB_PLACEHOLDER) {
				m2lxAssert(props.metaData?.mediaPlayerSession, 'AB composition box requires media-player session metadata')
				object.metaData!.m2lxPendingPips = [...(object.metaData!.m2lxPendingPips ?? []), { index: box.index, geometry }]
			} else {
				composition.pip[box.index] = {
					visible: true,
					source: { type: 'video', name: this.source(boxes[position]?.source) },
					...geometry
				}
			}
		})
		if (props.content.artEnabled) {
			const index = this.native.dveGraphicsDsk
			m2lxAssert(
				index !== undefined && composition.dsk,
				'assign a DVE graphics DSK in studio layer mappings before using frames or locators'
			)
			composition.dsk[index] = {
				visible: true,
				source: { type: 'video', name: this.source(props.content.artFillSource) },
				translation: { x: 0, y: 0 },
				scale: { x: 1, y: 1 },
				crop: { x: 0, y: 0, width: 1, height: 1 }
			}
		}
		object.content.mixer.composition = composition
		return [object]
	}

	public updateUnpopulatedDveBoxes(object: TSR.TSRTimelineObj, input: SwitcherInput) {
		m2lxAssert(this.isDveBoxes(object), 'AB box target must be a native keyer or composition mixer')
		const metaData = (object as TimelineBlueprintExt).metaData
		if (this.isMixEffect(object)) {
			const composition = object.content.mixer.composition
			m2lxAssert(composition, 'native DVE mixer is missing its stable composition ownership')
			for (const pending of metaData?.m2lxPendingPips ?? []) {
				composition.pip[pending.index] = {
					visible: true,
					source: { type: 'video', name: this.source(input) },
					...pending.geometry
				}
			}
			if (metaData) {
				delete metaData.m2lxPendingPips
			}
			return object
		}
		if (metaData?.m2lxPendingInput === 'keyer') {
			object.content.keyer.source = { type: 'video', name: this.source(input) }
			delete metaData.m2lxPendingInput
		}
		return object
	}

	private hiddenComposition() {
		m2lxAssert(this.native.compositionPips, 'Split Screen composition ownership is missing')
		const pip: TSR.M2LXComposition['pip'] = {}
		for (const index of this.native.compositionPips) {
			pip[index] = { visible: false }
		}
		const dsk: Partial<Record<0 | 1, TSR.M2LXCompositionPip>> = {}
		if (this.native.dveGraphicsDsk !== undefined) {
			dsk[this.native.dveGraphicsDsk] = { visible: false }
		}
		return { pip, ...(this.native.dveGraphicsDsk === undefined ? {} : { dsk }) }
	}

	private base(props: TimelineObjectProps, layer: string) {
		return {
			...TIMELINE_OBJECT_DEFAULTS,
			id: props.id ?? '',
			enable: props.enable ?? TIMELINE_OBJECT_DEFAULTS.enable,
			priority: props.priority ?? 0,
			classes: props.classes,
			metaData: props.metaData,
			layer: M2LX_LAYER_PREFIX + layer
		}
	}

	private transition(style: TransitionStyle, frames?: number, wipeDirection?: string): TSR.M2LXTransition {
		if (style === TransitionStyle.CUT) {
			return { type: TSR.M2LXTransitionType.CUT }
		}
		let wipe: TSR.M2LXEffectName | undefined
		if (style === TransitionStyle.WIPE) {
			const direction = wipeDirection ?? this.config.showStyle?.DefaultWipeDirection ?? 'None'
			m2lxAssert(
				Object.prototype.hasOwnProperty.call(M2LX_WIPE_EFFECTS, direction),
				'select a supported wipe direction in the show-style transition settings'
			)
			wipe = M2LX_WIPE_EFFECTS[direction]
		}
		m2lxAssert(
			style === TransitionStyle.MIX || (style === TransitionStyle.WIPE && wipe),
			`transition ${style} is not configured/supported; select a wipe direction in the show-style transition settings`
		)
		m2lxAssert(frames !== undefined && Number.isFinite(frames) && frames > 0, 'effect duration must be positive frames')
		return {
			type: TSR.M2LXTransitionType.EFFECT,
			effect: {
				name: style === TransitionStyle.MIX ? 'crossfade' : wipe,
				duration: getTimeFromFrames(frames) / 1000
			}
		}
	}
}
