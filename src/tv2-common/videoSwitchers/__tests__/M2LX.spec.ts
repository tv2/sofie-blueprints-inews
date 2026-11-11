import {
	BlueprintMapping,
	IBlueprintResolvedPieceInstance,
	LookaheadMode,
	OnGenerateTimelineObj,
	TSR
} from 'blueprints-integration'
import { CreateEffektForPartBase, DVESources, SourceInfoToSourceDefinition } from 'tv2-common'
import { PartType, SharedGraphicLLayer, SourceType, SwitcherAuxLLayer, SwitcherMixEffectLLayer } from 'tv2-constants'
import { makeMockCoreGalleryContext } from '../../../__mocks__/context'
import { m2lxStudioSettings } from '../../../__mocks__/m2lx'
import { OFFTUBE_DVE_GENERATOR_OPTIONS } from '../../../tv2_offtube_showstyle/content/OfftubeDVEContent'
import { QBOX_UNIFORM_CONFIG } from '../../../tv2_offtube_studio/uniformConfig'
import { MakeContentDVE2 } from '../../content/dve'
import { CutToServer } from '../../content/server'
import { assignMediaPlayers } from '../../helpers/abPlayback'
import { PartDefinitionUnknown } from '../../inewsConversion'
import { onTimelineGenerate, PieceMetaData, TimelineBlueprintExt } from '../../onTimelineGenerate'
import { SegmentContextImpl } from '../../segment/context'
import { TimelineContext } from '../../showstyle/timelineEventContext'
import { M2LX } from '../M2LX'
import { M2LX_DVE_GRAPHICS_LAYER, parseM2LXConfiguration } from '../m2lxConfig'
import { M2LXLayout, validateM2LXLayout } from '../m2lxLayout'
import { SpecialInput, SwitcherType, TransitionStyle } from '../types'

const NATIVE = {
	sources: [
		{ input: 0, source: 'real_black' },
		{ input: 11, source: 'player_a' },
		{ input: 12, source: 'player_b' }
	],
	keyers: [],
	routers: []
}
const LAYOUT: M2LXLayout = {
	bus: 'program',
	background: 'real_black',
	boxes: {
		'0': {
			index: 0,
			enabled: true,
			translation: { x: -420, y: 80 },
			scale: { x: 0.45, y: 0.6 },
			crop: { x: 0.1, y: 0.2, width: 0.8, height: 0.7 }
		}
	}
}
const COMPOSITION = { ...NATIVE, compositionPips: [0, 1, 2, 3] }
const PROGRAM_LAYOUT: M2LXLayout = {
	...LAYOUT,
	bus: 'program',
	boxes: {
		0: LAYOUT.boxes[0],
		1: { ...LAYOUT.boxes[0], index: 1, translation: { x: 420, y: 80 } },
		2: { index: 2, enabled: false }
	}
}

function nativeTemplate(layout: M2LXLayout) {
	return {
		DVEName: 'Native composition',
		DVEJSON: JSON.stringify(layout),
		DVEInputs: '1:INP1;2:INP2',
		DVEGraphicsKey: '',
		DVEGraphicsFrame: '',
		DVEGraphicsTemplateJSON: ''
	}
}

const dskCompositionCapability = 'M2LX_COMPOSITION_DSK_SUPPORTED'
let dskCompositionSupported: boolean | undefined = true
let capabilityRead: jest.SpyInstance

beforeEach(() => {
	dskCompositionSupported = true
	const read = Reflect.get
	capabilityRead = jest
		.spyOn(Reflect, 'get')
		.mockImplementation((...args) =>
			args[0] === TSR && args[1] === dskCompositionCapability ? dskCompositionSupported : read(...args)
		)
})
afterEach(() => capabilityRead.mockRestore())

function setup(configuration = JSON.stringify(NATIVE), graphics = false, graphicsIndex: 0 | 1 = 0) {
	const settings = m2lxStudioSettings(configuration, 'native-custom')
	if (graphics) {
		const mapping: BlueprintMapping & TSR.MappingM2LXKeyer = {
			device: TSR.DeviceType.M2LX,
			deviceId: 'native-custom',
			mappingType: TSR.MappingM2LXType.KEYER,
			bus: TSR.M2LXMixerBus.PROGRAM,
			keyer: { type: TSR.M2LXKeyerType.DSK, index: graphicsIndex },
			lookahead: LookaheadMode.NONE
		}
		settings.mappingDefaults[M2LX_DVE_GRAPHICS_LAYER] = mapping
	}
	const core = Object.assign(
		makeMockCoreGalleryContext({
			...settings,
			studioConfig: {
				...settings.studioConfig,
				SwitcherType: SwitcherType.M2LX
			}
		}),
		{
			currentPartInstance: undefined,
			nextPartInstance: undefined,
			previousPartInstance: undefined,
			getCurrentTime: () => 0,
			getPieceABSessionId: (_piece: unknown, session: string) => session,
			getTimelineObjectAbSessionId: (_object: unknown, session: string) => session
		}
	)
	const producer = new SegmentContextImpl(core, QBOX_UNIFORM_CONFIG)
	if (graphics) {
		producer.config.showStyle.GFXTemplates = [
			{
				VizTemplate: 'locators',
				SourceLayer: '',
				LayerMapping: SharedGraphicLLayer.GraphicLLayerLocators,
				INewsCode: '',
				INewsName: '',
				VizDestination: '',
				OutType: ''
			}
		]
	}
	const context = new TimelineContext(core, QBOX_UNIFORM_CONFIG)
	context.config.mediaPlayers = [
		{ id: '1', val: 'player_a' },
		{ id: '2', val: 'player_b' }
	]
	return { core, producer, context, switcher: context.videoSwitcher as M2LX }
}

test.each([0, 1] as const)('CasparCG artwork uses the shared renderer and coordinated graphics DSK %i', index => {
	const { producer, switcher, core } = setup(undefined, true, index)
	producer.config.studio.SwitcherSource.SplitArtFill = 'ndi_graphics'
	producer.config.studio.DVEFolder = 'dve'
	const template = {
		...nativeTemplate(PROGRAM_LAYOUT),
		DVEGraphicsFrame: 'sommerfugl',
		DVEGraphicsKey: 'sommerfuglK',
		DVEGraphicsTemplateJSON: JSON.stringify({ positions: ['left', 'right'] })
	}
	const result = MakeContentDVE2(
		producer,
		template,
		{ '0': 'COPENHAGEN', '1': 'OSLO' },
		{ INP1: { sourceType: SourceType.DEFAULT }, INP2: { sourceType: SourceType.DEFAULT } },
		OFFTUBE_DVE_GENERATOR_OPTIONS
	)
	expect(result.valid ? true : core.getNotes()).toBe(true)
	const objects = result.content.timelineObjects
	expect(objects.filter(TSR.isTimelineObjM2LXMixer)).toHaveLength(1)
	expect(objects.some(TSR.isTimelineObjM2LXKeyer)).toBe(false)
	expect(objects.find(TSR.isTimelineObjM2LXMixer)?.content.mixer).toMatchObject({
		program: 'real_black',
		composition: {
			pip: { 0: { visible: true }, 1: { visible: true }, 2: { visible: false }, 3: { visible: false } },
			dsk: {
				[index]: {
					visible: true,
					source: { type: 'video', name: 'ndi_graphics' },
					translation: { x: 0, y: 0 },
					scale: { x: 1, y: 1 },
					crop: { x: 0, y: 0, width: 1, height: 1 }
				}
			}
		}
	})
	expect(objects).toEqual(
		expect.arrayContaining([
			expect.objectContaining({
				content: expect.objectContaining({ deviceType: TSR.DeviceType.CASPARCG, file: 'dve/sommerfugl' })
			}),
			expect.objectContaining({
				content: expect.objectContaining({
					deviceType: TSR.DeviceType.CASPARCG,
					file: 'dve/sommerfuglK',
					mixer: { keyer: true }
				})
			})
		])
	)
	const locators = objects.find(object => object.layer === SharedGraphicLLayer.GraphicLLayerLocators)
	expect(locators).toMatchObject({
		content: {
			data: {
				display: 'program',
				slots: {
					'850_dve': {
						payload: { type: 'locators', '0': 'COPENHAGEN', '1': 'OSLO', style: { positions: ['left', 'right'] } }
					}
				}
			}
		}
	})
	expect(
		switcher.getMixEffectTimelineObject({
			layer: SwitcherMixEffectLLayer.Program,
			content: { input: 'real_black' }
		}).content.mixer.composition
	).toEqual({
		pip: { 0: { visible: false }, 1: { visible: false }, 2: { visible: false }, 3: { visible: false } },
		dsk: { [index]: { visible: false } }
	})
})

test('artwork and locator-only layouts reject missing allocation or invalid style without emitting partial graphics', () => {
	const { producer, core } = setup()
	for (const [template, labels] of [
		[{ ...nativeTemplate(PROGRAM_LAYOUT), DVEGraphicsFrame: 'frame' }, {}],
		[nativeTemplate(PROGRAM_LAYOUT), { '0': 'LOCATION' }]
	] as const) {
		const missingAllocation = MakeContentDVE2(producer, template, labels, undefined, OFFTUBE_DVE_GENERATOR_OPTIONS)
		expect(missingAllocation.valid).toBe(false)
		expect(missingAllocation.content.timelineObjects).toEqual([])
	}
	expect(core.getNotes().some(note => note.message.includes('assign a DVE graphics DSK'))).toBe(true)
	const configured = setup(undefined, true)
	const result = MakeContentDVE2(
		configured.producer,
		{ ...nativeTemplate(PROGRAM_LAYOUT), DVEGraphicsTemplateJSON: '{invalid' },
		{},
		undefined,
		OFFTUBE_DVE_GENERATOR_OPTIONS
	)
	expect(result.valid).toBe(false)
	expect(result.content.timelineObjects).toEqual([])
	expect(configured.core.getNotes().some(note => note.message.includes('Graphics Template JSON is not valid'))).toBe(
		true
	)
	configured.producer.config.showStyle.GFXTemplates = []
	const unmapped = MakeContentDVE2(
		configured.producer,
		nativeTemplate(PROGRAM_LAYOUT),
		{ '0': 'LOCATION' },
		undefined,
		OFFTUBE_DVE_GENERATOR_OPTIONS
	)
	expect(unmapped.valid).toBe(false)
	expect(unmapped.content.timelineObjects).toEqual([])
	expect(
		configured.core.getNotes().some(note => note.message.includes('configure the locators graphics template'))
	).toBe(true)
})

test('graphics require coordinated DSK support and reject independent allocations on either bus', () => {
	for (const capability of [false, undefined]) {
		dskCompositionSupported = capability
		try {
			expect(() => setup(undefined, true)).toThrow('coordinated DSK composition support')
		} finally {
			dskCompositionSupported = true
		}
	}
	for (const bus of [TSR.M2LXMixerBus.PROGRAM, TSR.M2LXMixerBus.PREVIEW]) {
		for (const layer of ['m2lx_alias', 'custom_alias']) {
			const { core } = setup(undefined, true)
			const mappings = core.getStudioMappings()
			const mapping: BlueprintMapping & TSR.MappingM2LXKeyer = {
				device: TSR.DeviceType.M2LX,
				deviceId: 'native-custom',
				mappingType: TSR.MappingM2LXType.KEYER,
				bus,
				keyer: { type: TSR.M2LXKeyerType.DSK, index: 0 },
				lookahead: LookaheadMode.NONE
			}
			jest.spyOn(core, 'getStudioMappings').mockReturnValue({ ...mappings, [layer]: mapping })
			expect(() => new SegmentContextImpl(core, QBOX_UNIFORM_CONFIG)).toThrow('DVE graphics DSK')
		}
	}
})

test('DVE graphics allocation validates its bus, resource range and lookahead while preserving a separate station DSK', () => {
	for (const override of [
		{ bus: TSR.M2LXMixerBus.PREVIEW },
		{ keyer: { type: TSR.M2LXKeyerType.PIP, index: 0 } },
		{ keyer: { type: TSR.M2LXKeyerType.DSK, index: 2 } },
		{ lookahead: LookaheadMode.PRELOAD }
	]) {
		const { core } = setup(undefined, true)
		const mappings = core.getStudioMappings()
		jest.spyOn(core, 'getStudioMappings').mockReturnValue({
			...mappings,
			[M2LX_DVE_GRAPHICS_LAYER]: { ...mappings[M2LX_DVE_GRAPHICS_LAYER], ...override }
		})
		expect(() => new SegmentContextImpl(core, QBOX_UNIFORM_CONFIG)).toThrow('Program DSK')
	}
	const stationDsk = {
		layer: 'station_logo',
		bus: 'program',
		keyer: { type: 'dsk', index: 1 }
	}
	const { switcher } = setup(JSON.stringify({ ...NATIVE, keyers: [stationDsk] }), true)
	expect(switcher.native.keyers).toEqual([stationDsk])
	expect(
		switcher.getMixEffectTimelineObject({
			layer: SwitcherMixEffectLLayer.Program,
			content: { input: 'real_black' }
		}).content.mixer.composition
	).toMatchObject({ dsk: { 0: { visible: false } } })
})

function piece(id: string): IBlueprintResolvedPieceInstance<PieceMetaData> {
	const resolved = {
		_id: id,
		resolvedStart: 0,
		resolvedDuration: 100,
		piece: { metaData: { mediaPlayerSessions: [id] } }
	}
	return resolved as IBlueprintResolvedPieceInstance<PieceMetaData>
}

const SOURCE_LAYERS = {
	Caspar: { ClipPending: 'caspar_pending' },
	Sisyfos: { ClipPending: 'sisyfos_pending', PlayerA: 'sisyfos_a', PlayerB: 'sisyfos_b' }
}

test('requires independent Preload lookahead so selected Next can reach Preview while Program is occupied', () => {
	const { core } = setup()
	const mappings = core.getStudioMappings()
	const mapping = { ...mappings.m2lx_me_program, lookahead: LookaheadMode.PRELOAD }
	jest.spyOn(core, 'getStudioMappings').mockReturnValue({ ...mappings, m2lx_me_program: mapping })
	expect(() => new SegmentContextImpl(core, QBOX_UNIFORM_CONFIG)).not.toThrow()
	mapping.lookahead = LookaheadMode.WHEN_CLEAR
	expect(() => new SegmentContextImpl(core, QBOX_UNIFORM_CONFIG)).toThrow('Preload')
})

test('real server producer binds Program and Core-lookahead program without competing preview objects', () => {
	const { context, producer, switcher } = setup(JSON.stringify(COMPOSITION))
	const definition: PartDefinitionUnknown = {
		type: PartType.Unknown,
		externalId: 'server',
		rawType: '',
		script: '',
		fields: {},
		modified: 0,
		storyName: 'story',
		segmentExternalId: 'segment',
		cues: [],
		transition: { style: TransitionStyle.MIX, duration: 50 }
	}
	const objects = CutToServer(producer, 'server', definition).filter(switcher.isMixEffect)
	expect(objects).toHaveLength(1)
	const ordinary = { ...objects[0], id: 'program', pieceInstanceId: 'server' }
	const future = {
		...switcher.getMixEffectTimelineObject({
			layer: SwitcherMixEffectLLayer.Program,
			content: { input: SpecialInput.AB_PLACEHOLDER }
		}),
		id: 'future',
		pieceInstanceId: 'future',
		isLookahead: true,
		lookaheadForLayer: objects[0].layer
	}
	future.metaData = { ...future.metaData, mediaPlayerSession: 'future' }
	const timeline: OnGenerateTimelineObj[] = [ordinary, future]
	assignMediaPlayers(context, timeline, {}, [piece('server')], SOURCE_LAYERS)
	expect(ordinary.content.mixer).toMatchObject({
		program: 'player_a',
		transition: { type: 'effect', effect: { name: 'crossfade', duration: 2 } }
	})
	expect(ordinary.content.mixer.preview).toBeUndefined()
	expect(ordinary.content.mixer.composition).toEqual({
		pip: {
			0: { visible: false },
			1: { visible: false },
			2: { visible: false },
			3: { visible: false }
		}
	})
	expect(future.content.mixer.composition).toEqual(ordinary.content.mixer.composition)
	expect(future.content.mixer.program).toBe('player_b')
	expect(future.content.mixer.preview).toBeUndefined()
	expect(timeline.every(object => object.content.deviceType === TSR.DeviceType.M2LX)).toBe(true)
	expect(timeline.every(object => !(object as TimelineBlueprintExt).metaData?.m2lxPendingInput)).toBe(true)
})

test('unresolved AB assignment fails visibly instead of emitting a source placeholder', () => {
	const { context, switcher } = setup()
	const object = switcher.getMixEffectTimelineObject({
		layer: SwitcherMixEffectLLayer.Program,
		content: { input: SpecialInput.AB_PLACEHOLDER }
	})
	expect(() =>
		onTimelineGenerate(context, [{ ...object, id: 'orphan' }], undefined, undefined, [], SOURCE_LAYERS)
	).toThrow('unresolved AB player')
})

test('native sources, effects and single-mixer topology are explicit', () => {
	const { switcher, core } = setup()
	expect(switcher.source('real_black')).toBe('real_black')
	expect(switcher.source('any_configured_camera')).toBe('any_configured_camera')
	expect(switcher.source('11')).toBe('11')
	for (const input of [99, '', ' real_black', 'real_black ']) {
		expect(() => switcher.source(input)).toThrow('exact source name')
	}
	expect(() => switcher.source(SpecialInput.ME2_PROGRAM)).toThrow('never inferred')
	expect(() => new SegmentContextImpl(core, { ...QBOX_UNIFORM_CONFIG, profile: undefined })).toThrow('not AFVD')
	for (const transition of [
		TransitionStyle.DIP,
		TransitionStyle.STING,
		TransitionStyle.WIPE_FOR_GFX,
		TransitionStyle.WIPE
	]) {
		expect(() =>
			switcher.getMixEffectTimelineObject({
				layer: SwitcherMixEffectLLayer.Program,
				content: { input: 'real_black', transition, transitionDuration: 25 }
			})
		).toThrow('not configured/supported')
	}
	expect(() =>
		switcher.getMixEffectTimelineObject({
			layer: SwitcherMixEffectLLayer.Clean,
			content: { input: 'real_black' }
		})
	).toThrow('independent M/Es')
	expect(() =>
		switcher.getMixEffectTimelineObject({
			layer: SwitcherMixEffectLLayer.Program,
			content: { previewInput: 0 }
		})
	).toThrow('Preview-only mixer')
	for (const sources of [
		[{ input: 0, source: '' }],
		[{ input: -1, source: 'placeholder' }],
		[
			{ input: 0, source: 'one' },
			{ input: 0, source: 'two' }
		],
		[
			{ input: 0, source: 'same' },
			{ input: 1, source: 'same' }
		]
	]) {
		expect(() => parseM2LXConfiguration(JSON.stringify({ ...NATIVE, sources }))).toThrow('M2L-X')
	}
	const configured = setup(JSON.stringify({ ...NATIVE, wipe: 'wipe_left' })).switcher
	expect(
		configured.getMixEffectTimelineObject({
			layer: SwitcherMixEffectLLayer.Program,
			content: { input: 'real_black', transition: TransitionStyle.WIPE, transitionDuration: 25 }
		}).content.mixer.transition
	).toEqual({ type: 'effect', effect: { name: 'wipe_left', duration: 1 } })
})

test('studio tables and normal layer mappings are authoritative without a parallel native configuration', () => {
	const { core, switcher, context: previous } = setup()
	expect(core.studioConfig).not.toHaveProperty('M2LX')
	previous.config.studio.SwitcherSource.Default = 'renamed_source'
	core.studioConfig.SourcesCam = [
		{
			_id: 'camera-row',
			SourceName: '1',
			SwitcherSource: 'renamed_camera',
			SisyfosLayers: [],
			StudioMics: true
		}
	]
	const mappings = core.getStudioMappings()
	jest
		.spyOn(core, 'getStudioMappings')
		.mockReturnValue(
			Object.fromEntries(
				Object.entries(mappings).map(([layer, mapping]) => [
					layer,
					layer.startsWith('m2lx_') ? { ...mapping, deviceId: 'another-device' } : mapping
				])
			)
		)
	const context = new SegmentContextImpl(core, QBOX_UNIFORM_CONFIG)
	const changed = context.videoSwitcher as M2LX
	expect(changed.source(context.config.studio.SwitcherSource.Default)).toBe('renamed_source')
	expect(changed.source(context.config.sources.cameras[0].port)).toBe('renamed_camera')
	expect(switcher.source('real_black')).toBe('real_black')
	expect(core.studioConfig).not.toHaveProperty('SwitcherInputNames')
	expect(changed.native.keyers).toHaveLength(0)
	expect(changed.native.compositionPips).toEqual([0, 1, 2, 3])
})

test('wipe direction belongs to each show style and can be overridden for a transition', () => {
	const first = setup()
	const second = setup()
	first.context.config.showStyle.DefaultWipeDirection = 'Left'
	second.context.config.showStyle.DefaultWipeDirection = 'Right'
	first.core.studioConfig.SwitcherWipeEffect = 'Down'
	const props = {
		layer: SwitcherMixEffectLLayer.Program,
		content: { input: 'real_black', transition: TransitionStyle.WIPE, transitionDuration: 25 }
	}
	expect(first.switcher.getMixEffectTimelineObject(props).content.mixer.transition).toEqual({
		type: 'effect',
		effect: { name: 'wipe_left', duration: 1 }
	})

	expect(second.switcher.getMixEffectTimelineObject(props).content.mixer.transition).toEqual({
		type: 'effect',
		effect: { name: 'wipe_right', duration: 1 }
	})
	const override = first.switcher.getMixEffectTimelineObject({
		...props,
		content: { ...props.content, wipeDirection: 'Up' }
	})
	expect(override.content.mixer.transition).toMatchObject({ effect: { name: 'wipe_up' } })
	first.switcher.updateTransition(override, TransitionStyle.WIPE, 10, undefined, 'Down and left')
	expect(override.content.mixer.transition).toEqual({
		type: 'effect',
		effect: { name: 'wipe_down_left', duration: 0.4 }
	})
	for (const wipeDirection of ['None', 'unsupported']) {
		expect(() =>
			first.switcher.getMixEffectTimelineObject({ ...props, content: { ...props.content, wipeDirection } })
		).toThrow('show-style transition settings')
	}
})

test('scripted M2L-X wipes retain the preceding picture for the transition duration', () => {
	const { producer } = setup(JSON.stringify({ ...NATIVE, wipe: 'wipe_left' }))
	const definition: PartDefinitionUnknown = {
		type: PartType.Unknown,
		externalId: 'wipe',
		rawType: '',
		script: '',
		fields: {},
		modified: 0,
		storyName: 'story',
		segmentExternalId: 'segment',
		cues: [],
		transition: { style: TransitionStyle.WIPE, duration: 10 }
	}
	const pieces = CutToServer(producer, 'wipe', definition)
	const timing = CreateEffektForPartBase(producer, definition, [], {
		sourceLayer: 'transition',
		casparLayer: 'jingle',
		sisyfosLayer: 'jingle_audio'
	})
	expect(pieces.filter(TSR.isTimelineObjM2LXMixer)[0].content.mixer.transition).toEqual({
		type: 'effect',
		effect: { name: 'wipe_left', duration: 0.4 }
	})
	expect(timing).toEqual({
		inTransition: { previousPartKeepaliveDuration: 400, blockTakeDuration: 400, partContentDelayDuration: 0 }
	})
})

test.each([undefined, [], [{ Box: 1 }, { Box: 3 }], [{ Box: -1 }]])(
	'obsolete reservation settings do not restrict automatic ownership: %p',
	boxes => {
		const { core } = setup()
		Object.assign(core.studioConfig, { SwitcherSplitScreenBoxes: boxes })
		const context = new SegmentContextImpl(core, QBOX_UNIFORM_CONFIG)
		const mixer = context.videoSwitcher.getMixEffectTimelineObject({
			layer: SwitcherMixEffectLLayer.Program,
			content: { input: 'real_black' }
		})
		expect(TSR.isTimelineObjM2LXMixer(mixer) && mixer.content.mixer.composition).toEqual({
			pip: { 0: { visible: false }, 1: { visible: false }, 2: { visible: false }, 3: { visible: false } }
		})
	}
)

test.each([
	{ x: 0.5, y: 0 },
	{ x: 0, y: -0.25 }
])('M2L-X rejects fractional pixel origins before generating mixer commands: %p', translation => {
	const { producer, core } = setup(JSON.stringify(COMPOSITION))
	const layout = { ...PROGRAM_LAYOUT, boxes: { 0: { ...PROGRAM_LAYOUT.boxes[0], translation } } }
	expect(() => validateM2LXLayout(layout)).toThrow('whole pixels')
	const result = MakeContentDVE2(producer, nativeTemplate(layout), {}, undefined, OFFTUBE_DVE_GENERATOR_OPTIONS)
	expect(result.valid).toBe(false)
	expect(result.content.timelineObjects).toEqual([])
	expect(core.getNotes().some(note => note.message.includes('whole pixels'))).toBe(true)
})

test('native layout validation rejects invalid destinations, geometry and duplicate keyer resources', () => {
	expect(() => validateM2LXLayout({ ...LAYOUT, bus: 'preview' })).toThrow('select the layout as Next')
	expect(() => validateM2LXLayout(({ ...LAYOUT, bus: 'both' } as unknown) as M2LXLayout)).toThrow('destination must be')
	for (const geometry of [
		{ scale: { x: 0, y: 1 } },
		{ translation: { x: Infinity, y: 1 } },
		{ crop: { x: 0.2, y: 0, width: 1, height: 1 } }
	]) {
		expect(() => validateM2LXLayout({ ...LAYOUT, boxes: { 0: { ...LAYOUT.boxes[0], ...geometry } } })).toThrow('M2L-X')
	}
	const keyer = { layer: 'dsk_1', bus: 'program', keyer: { type: 'dsk', index: 0 } }
	expect(() =>
		parseM2LXConfiguration(JSON.stringify({ ...NATIVE, keyers: [keyer, { ...keyer, layer: 'collision' }] }))
	).toThrow('duplicate keyer')
})

test('embedded keyers expand at the collection boundary and incompatible composition is never ignored', () => {
	const composition = { Number: 0, Fill: 'player_a', Key: 'player_b', Clip: 50, Gain: 100 }
	const { switcher } = setup(
		JSON.stringify({
			...NATIVE,
			keyers: [
				{
					layer: 'dsk_1',
					bus: 'program',
					keyer: { type: 'dsk', index: 0 },
					composition,
					preconfigured: true
				}
			]
		})
	)
	const properties = {
		content: { input: 'real_black', keyers: [{ onAir: true, config: composition }] },
		id: 'preserved',
		enable: { start: 17 },
		priority: 3,
		classes: ['owned'],
		metaData: { context: 'test' }
	}
	expect(() => switcher.getMixEffectTimelineObject({ ...properties, layer: SwitcherMixEffectLLayer.Program })).toThrow(
		'collection API'
	)
	const objects = switcher.getOnAirTimelineObjects(properties)
	expect(objects).toHaveLength(2)
	const keyersOnly = switcher.getOnAirTimelineObjects({
		content: { keyers: properties.content.keyers }
	})
	expect(keyersOnly).toHaveLength(1)
	expect(keyersOnly.some(switcher.isMixEffect)).toBe(false)
	expect(objects[1]).toMatchObject({
		id: 'preserved_keyer_0',
		enable: { start: 17 },
		priority: 3,
		classes: ['owned'],
		metaData: { context: 'test' },
		content: { type: 'keyer', keyer: { visible: true } }
	})
	expect(() =>
		switcher.getDskTimelineObject({
			layer: 'dsk_1',
			content: { onAir: true, config: { ...composition, Clip: 0 } }
		})
	).toThrow('Clip differs')
})

test('explicit router controls resolve sources and stale or lookahead-enabled native keyer mappings are rejected', () => {
	const { switcher, core } = setup(
		JSON.stringify({
			...NATIVE,
			routers: [{ layer: SwitcherAuxLLayer.AuxScreen, node: 'router_node', output: 'wall' }]
		})
	)
	const router = switcher.getAuxTimelineObject({
		layer: SwitcherAuxLLayer.AuxScreen,
		content: { input: 'player_a' }
	})
	expect(router.content).toEqual({
		deviceType: TSR.DeviceType.M2LX,
		type: TSR.TimelineContentTypeM2LX.ROUTER,
		input: 'player_a'
	})
	switcher.updateAuxInput(router, 'player_b')
	expect(router.content.input).toBe('player_b')
	expect(() =>
		switcher.getAuxTimelineObject({
			layer: SwitcherAuxLLayer.AuxClean,
			content: { input: 'real_black' }
		})
	).toThrow('not configured')
	const mapping: BlueprintMapping & TSR.MappingM2LXKeyer = {
		device: TSR.DeviceType.M2LX,
		deviceId: 'native-custom',
		mappingType: TSR.MappingM2LXType.KEYER,
		bus: TSR.M2LXMixerBus.PROGRAM,
		keyer: { type: TSR.M2LXKeyerType.DSK, index: 0 },
		lookahead: LookaheadMode.WHEN_CLEAR
	}
	const mappings = core.getStudioMappings()
	jest.spyOn(core, 'getStudioMappings').mockReturnValue({ ...mappings, m2lx_custom_dsk: mapping })
	expect(() => new SegmentContextImpl(core, QBOX_UNIFORM_CONFIG)).toThrow('unsafe lookahead')
})

test.each([false, true])(
	'A/B and selected Next preserve the native background and graphics composition: %s',
	async graphics => {
		const { producer, context, switcher, core } = setup(JSON.stringify(COMPOSITION), graphics)
		producer.config.studio.SwitcherSource.SplitArtFill = 'ndi_graphics'
		const graphicsComposition = graphics
			? {
					dsk: {
						0: {
							visible: true,
							source: { type: 'video', name: 'ndi_graphics' },
							translation: { x: 0, y: 0 },
							scale: { x: 1, y: 1 },
							crop: { x: 0, y: 0, width: 1, height: 1 }
						}
					}
			  }
			: {}
		const sources: DVESources = { INP1: { sourceType: SourceType.SERVER }, INP2: { sourceType: SourceType.SERVER } }
		const result = MakeContentDVE2(
			producer,
			{ ...nativeTemplate(PROGRAM_LAYOUT), DVEGraphicsFrame: graphics ? 'frame' : '' },
			{},
			sources,
			OFFTUBE_DVE_GENERATOR_OPTIONS,
			'layout'
		)
		expect(result.valid ? true : core.getNotes()).toBe(true)
		expect(result.content.timelineObjects.filter(switcher.isMixEffect)).toHaveLength(1)
		expect(result.content.timelineObjects.some(TSR.isTimelineObjM2LXKeyer)).toBe(false)
		const mixer = result.content.timelineObjects.find(TSR.isTimelineObjM2LXMixer)!
		expect(mixer.content.mixer.composition).toEqual({
			pip: { 0: { visible: false }, 1: { visible: false }, 2: { visible: false }, 3: { visible: false } },
			...graphicsComposition
		})
		const ordinary = { ...mixer, id: 'program-layout', pieceInstanceId: 'layout' }
		const future: OnGenerateTimelineObj = {
			...JSON.parse(JSON.stringify(mixer)),
			id: 'future-layout',
			pieceInstanceId: 'future',
			isLookahead: true,
			lookaheadForLayer: mixer.layer,
			metaData: { ...(mixer as TimelineBlueprintExt).metaData, mediaPlayerSession: 'future' }
		}
		const resolved = await onTimelineGenerate(
			context,
			[ordinary, future],
			undefined,
			undefined,
			[piece('layout')],
			SOURCE_LAYERS
		)
		expect(ordinary.content.mixer).toMatchObject({
			program: 'real_black',
			transition: { type: 'cut' },
			composition: {
				pip: {
					0: {
						visible: true,
						source: { type: 'video', name: 'player_a' },
						translation: PROGRAM_LAYOUT.boxes[0].translation,
						scale: PROGRAM_LAYOUT.boxes[0].scale,
						crop: PROGRAM_LAYOUT.boxes[0].crop
					},
					1: {
						visible: true,
						source: { type: 'video', name: 'player_a' },
						translation: PROGRAM_LAYOUT.boxes[1].translation
					},
					2: { visible: false }
				}
			}
		})
		expect(ordinary.content.mixer.composition).toMatchObject(graphicsComposition)
		expect(ordinary.content.mixer.preview).toBeUndefined()
		expect((ordinary as TimelineBlueprintExt).metaData?.m2lxPendingPips).toBeUndefined()
		expect(TSR.isTimelineObjM2LXMixer(future) && future.content.mixer.program).toBe('real_black')
		expect(TSR.isTimelineObjM2LXMixer(future) && future.content.mixer.composition?.pip[0]).toMatchObject({
			source: { name: 'player_b' }
		})
		expect(TSR.isTimelineObjM2LXMixer(future) && future.content.mixer.composition).toMatchObject(graphicsComposition)
		const native = resolved.timeline.filter(TSR.isTimelineObjM2LX)
		expect(native).toHaveLength(2)
		expect(native.filter(object => !object.isLookahead)).toHaveLength(1)
		expect(native.every(TSR.isTimelineObjM2LXMixer)).toBe(true)
	}
)

test('native Program DVE preserves camera audio and requires a cue assignment for every visible box', () => {
	const { producer, core } = setup(JSON.stringify(COMPOSITION))
	const camera = producer.config.sources.cameras[0]
	camera.port = 'player_a'
	camera.sisyfosLayers = ['camera_audio']
	const sources = { INP1: SourceInfoToSourceDefinition(camera) }
	const template = {
		...nativeTemplate({ ...PROGRAM_LAYOUT, boxes: { 0: PROGRAM_LAYOUT.boxes[0] } }),
		DVEInputs: '1:INP1'
	}
	const result = MakeContentDVE2(producer, template, {}, sources, OFFTUBE_DVE_GENERATOR_OPTIONS)
	expect(result.valid ? true : core.getNotes()).toBe(true)
	expect(
		result.content.timelineObjects.some(
			object => object.content.deviceType === TSR.DeviceType.SISYFOS && object.layer === 'camera_audio'
		)
	).toBe(true)
	const incomplete = { ...template, DVEJSON: JSON.stringify(PROGRAM_LAYOUT) }
	expect(MakeContentDVE2(producer, incomplete, {}, sources, OFFTUBE_DVE_GENERATOR_OPTIONS).valid).toBe(false)
	expect(core.getNotes().some(note => note.message.includes('Missing source type for DVE box: 2'))).toBe(true)
})

test.each([undefined, 'm2lx-native-v1'])(
	'selected mixer interprets a %s layout as Program and reuses the studio Split Screen background',
	format => {
		const { producer, core } = setup(JSON.stringify(COMPOSITION))
		producer.config.studio.SwitcherSource.SplitBackground = 'configured_split_background'
		const template = {
			...nativeTemplate(PROGRAM_LAYOUT),
			DVEJSON: JSON.stringify({ format, boxes: PROGRAM_LAYOUT.boxes })
		}
		const result = MakeContentDVE2(
			producer,
			template,
			{},
			{
				INP1: { sourceType: SourceType.DEFAULT },
				INP2: { sourceType: SourceType.DEFAULT }
			},
			OFFTUBE_DVE_GENERATOR_OPTIONS
		)
		expect(result.valid ? true : core.getNotes()).toBe(true)
		expect(result.content.timelineObjects.find(TSR.isTimelineObjM2LXMixer)?.content.mixer).toMatchObject({
			program: 'configured_split_background',
			composition: { pip: { 0: { source: { name: 'real_black' } } } }
		})
		const invalid = { ...template, DVEJSON: JSON.stringify({ boxes: { 0: { enabled: true, x: 100, y: 200 } } }) }
		expect(MakeContentDVE2(producer, invalid, {}, {}, OFFTUBE_DVE_GENERATOR_OPTIONS).valid).toBe(false)
		expect(core.getNotes().some(note => note.message.includes('Split Screen box number'))).toBe(true)
	}
)

test('same-background layouts retain different complete compositions; every ordinary shot hides the identical owned set', () => {
	const { producer, switcher, context } = setup(JSON.stringify(COMPOSITION))
	const sources: DVESources = { INP1: { sourceType: SourceType.SERVER }, INP2: { sourceType: SourceType.SERVER } }
	const layout = MakeContentDVE2(
		producer,
		nativeTemplate(PROGRAM_LAYOUT),
		{},
		sources,
		OFFTUBE_DVE_GENERATOR_OPTIONS,
		'layout'
	)
	const mixer = layout.content.timelineObjects.find(TSR.isTimelineObjM2LXMixer)!
	switcher.updateUnpopulatedDveBoxes(mixer, 'player_a')
	const replacement = switcher
		.getDveTimelineObjects({
			id: 'replacement',
			enable: { start: 17 },
			priority: 3,
			classes: ['owned'],
			metaData: { context: 'kept' },
			content: {
				template: { ...PROGRAM_LAYOUT, boxes: { 0: { ...PROGRAM_LAYOUT.boxes[0], translation: { x: 120, y: -70 } } } },
				boxes: [{ source: 'player_a' }],
				artFillSource: 0,
				artCutSource: 0
			}
		})
		.find(TSR.isTimelineObjM2LXMixer)!
	expect(replacement).toMatchObject({
		id: 'replacement',
		enable: { start: 17 },
		priority: 3,
		classes: ['owned'],
		metaData: { context: 'kept' }
	})
	expect(replacement.content.mixer.program).toBe(mixer.content.mixer.program)
	expect(replacement.content.mixer.composition).not.toEqual(mixer.content.mixer.composition)
	expect(replacement.content.mixer.composition?.pip[1]).toEqual({ visible: false })
	switcher.updateTransition(replacement, TransitionStyle.MIX, 25)
	expect(replacement.content.mixer.transition).toEqual({ type: 'effect', effect: { name: 'crossfade', duration: 1 } })
	expect(replacement.content.mixer.composition?.pip[0]).not.toHaveProperty('border')
	expect(replacement.content.mixer.composition?.pip[0]).not.toHaveProperty('rotation')
	const ordinary = switcher.getOnAirTimelineObjectsWithLookahead({ content: { input: 'real_black' } })
	expect(ordinary).toHaveLength(1)
	expect(ordinary.find(TSR.isTimelineObjM2LXMixer)?.content.mixer.composition).toEqual({
		pip: { 0: { visible: false }, 1: { visible: false }, 2: { visible: false }, 3: { visible: false } }
	})
	const pending = MakeContentDVE2(
		producer,
		nativeTemplate(PROGRAM_LAYOUT),
		{},
		sources,
		OFFTUBE_DVE_GENERATOR_OPTIONS,
		'orphan'
	)
	const orphan = pending.content.timelineObjects.find(TSR.isTimelineObjM2LXMixer)!
	delete (orphan as TimelineBlueprintExt).metaData?.mediaPlayerSession
	expect(() =>
		onTimelineGenerate(context, [{ ...orphan, id: 'orphan' }], undefined, undefined, [], SOURCE_LAYERS)
	).toThrow('unresolved AB player')
})

test('Program layouts reject unsupported fields, legacy Preview intent and either-bus KEYER aliases', () => {
	const { producer, core } = setup(JSON.stringify(COMPOSITION))
	for (const [field, value, message] of [
		['border', { enabled: true }, 'does not support border'],
		['rotation', 90, 'unsupported box property: rotation']
	] as const) {
		const invalidTemplate = nativeTemplate({
			...PROGRAM_LAYOUT,
			boxes: { 0: { ...PROGRAM_LAYOUT.boxes[0], [field]: value } }
		})
		expect(MakeContentDVE2(producer, invalidTemplate, {}, undefined, OFFTUBE_DVE_GENERATOR_OPTIONS).valid).toBe(false)
		expect(core.getNotes().some(note => note.message.includes(message))).toBe(true)
	}
	expect(
		MakeContentDVE2(
			producer,
			nativeTemplate({ ...PROGRAM_LAYOUT, bus: 'preview' }),
			{},
			undefined,
			OFFTUBE_DVE_GENERATOR_OPTIONS
		).valid
	).toBe(false)
	for (const compositionPips of [[0, 0], [-1], [4], []]) {
		expect(() => parseM2LXConfiguration(JSON.stringify({ ...COMPOSITION, compositionPips }))).toThrow('M2L-X')
	}
	for (const bus of [TSR.M2LXMixerBus.PROGRAM, TSR.M2LXMixerBus.PREVIEW]) {
		const mapping: BlueprintMapping & TSR.MappingM2LXKeyer = {
			device: TSR.DeviceType.M2LX,
			deviceId: 'native-custom',
			lookahead: LookaheadMode.NONE,
			mappingType: TSR.MappingM2LXType.KEYER,
			bus,
			keyer: { type: TSR.M2LXKeyerType.PIP, index: 1 }
		}
		jest.spyOn(core, 'getStudioMappings').mockReturnValue({
			...core.getStudioMappings(),
			custom_alias: mapping
		})
		expect(() => new SegmentContextImpl(core, QBOX_UNIFORM_CONFIG)).toThrow('managed Split Screen box')
	}
})
