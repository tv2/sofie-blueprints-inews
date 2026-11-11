import { BlueprintMapping, BlueprintMappings, LookaheadMode, TSR } from 'blueprints-integration'
import {
	getDskLLayerName,
	SwitcherDskProps,
	SwitcherType,
	TV2StudioConfig,
	TV2StudioConfigBase,
	UniformConfig
} from 'tv2-common'
import { SwitcherMixEffectLLayer } from 'tv2-constants'
import { m2lxAssert, M2LXConfigurationError } from './m2lxErrors'

export { m2lxAssert, M2LXConfigurationError } from './m2lxErrors'

export const M2LX_LAYER_PREFIX = 'm2lx_'
export const M2LX_DVE_GRAPHICS_LAYER = M2LX_LAYER_PREFIX + 'dve_graphics'

export const M2LX_WIPE_EFFECTS: Record<string, TSR.M2LXEffectName | undefined> = {
	None: undefined,
	Left: 'wipe_left',
	Right: 'wipe_right',
	Up: 'wipe_up',
	Down: 'wipe_down',
	'Up and right': 'wipe_up_right',
	'Down and left': 'wipe_down_left'
}

export interface M2LXKeyerAllocation {
	layer: string
	bus: TSR.M2LXMixerBus
	keyer: TSR.M2LXKeyer
	/** Exact generic intent accepted by this operator-preconfigured composition. */
	composition?: SwitcherDskProps
	source?: { type: 'video' | 'image'; name: string }
	preconfigured?: boolean
}

export interface M2LXConfiguration {
	/** Stable ownership on both buses, including hidden PiPs on ordinary shots. Change only while inactive. */
	compositionPips?: TSR.M2LXPipKeyerIndex[]
	dveGraphicsDsk?: 0 | 1
	sources: Array<{ input: number; source: string }>
	keyers: M2LXKeyerAllocation[]
	routers: Array<{ layer: string; node?: string; output: string }>
	wipe?: TSR.M2LXEffectName
}

export function parseM2LXConfiguration(json: string): M2LXConfiguration {
	let parsed: unknown
	try {
		parsed = JSON.parse(json)
	} catch {
		throw new M2LXConfigurationError('M2L-X: Configuration must be valid JSON')
	}
	return validateM2LXConfiguration(parsed)
}

function validateM2LXConfiguration(parsed: unknown): M2LXConfiguration {
	m2lxAssert(parsed && typeof parsed === 'object', 'Configuration must be an object')
	const config = parsed as M2LXConfiguration
	m2lxAssert(
		Object.keys(config).every(key => ['sources', 'keyers', 'routers', 'wipe', 'compositionPips'].includes(key)),
		'unknown native configuration property; connection URL/password/TLS belong only in the gateway'
	)
	m2lxAssert(Array.isArray(config.sources), 'configure an explicit sources array')
	m2lxAssert(Array.isArray(config.keyers), 'configure an explicit keyers array (can be empty)')
	m2lxAssert(Array.isArray(config.routers), 'configure an explicit routers array (can be empty)')
	if (config.compositionPips !== undefined) {
		m2lxAssert(
			Array.isArray(config.compositionPips) && config.compositionPips.length > 0,
			'legacy composition ownership must contain one to four Split Screen boxes'
		)
		m2lxAssert(
			config.compositionPips.every(index => Number.isInteger(index) && index >= 0 && index <= 3) &&
				new Set(config.compositionPips).size === config.compositionPips.length,
			'legacy composition ownership must contain unique box indices from 0 to 3'
		)
	}
	const inputs = new Set<number>()
	const names = new Set<string>()
	config.sources.forEach(row => {
		m2lxAssert(row && Number.isInteger(row.input) && row.input >= 0, 'source input must be a non-negative integer')
		m2lxAssert(typeof row.source === 'string' && row.source.trim().length > 0, 'source name must not be empty')
		m2lxAssert(row.source === row.source.trim(), 'source names must not contain surrounding whitespace')
		m2lxAssert(!inputs.has(row.input) && !names.has(row.source), 'duplicate logical input or native source name')
		m2lxAssert(
			Object.keys(row).every(key => ['input', 'source'].includes(key)),
			'unknown source configuration property'
		)
		inputs.add(row.input)
		names.add(row.source)
	})
	const layers = new Set<string>([SwitcherMixEffectLLayer.Program])
	const resources = new Set<string>()
	config.keyers.forEach(row => {
		m2lxAssert(row && typeof row.layer === 'string' && row.layer.trim(), 'keyer layer is required')
		m2lxAssert(row.layer === row.layer.trim(), 'keyer layers must not contain surrounding whitespace')
		m2lxAssert(
			Object.keys(row).every(key => ['layer', 'bus', 'keyer', 'composition', 'source', 'preconfigured'].includes(key)),
			'unknown keyer configuration property'
		)
		m2lxAssert(Object.values(TSR.M2LXMixerBus).includes(row.bus), 'keyer bus must be program or preview')
		m2lxAssert(row.keyer && Number.isInteger(row.keyer.index), 'keyer index is required')
		const { type, index } = row.keyer
		const valid =
			(type === TSR.M2LXKeyerType.PIP && index >= 0 && index <= 3) ||
			(type === TSR.M2LXKeyerType.STILL && index >= 4 && index <= 7) ||
			(type === TSR.M2LXKeyerType.DSK && index >= 0 && index <= 1)
		m2lxAssert(valid, 'keyer index/type exceeds native resource limits')
		m2lxAssert(
			type !== TSR.M2LXKeyerType.PIP || !config.compositionPips?.includes(index),
			`Split Screen box ${index + 1} is managed on both buses; remove its separate graphics mappings while inactive`
		)
		m2lxAssert(
			Object.keys(row.keyer).every(key => ['type', 'index'].includes(key)),
			'unknown native keyer identifier property'
		)
		const resource = `keyer/${row.bus}/${type}/${index}`
		m2lxAssert(!resources.has(resource) && !layers.has(row.layer), 'duplicate keyer resource or layer')
		resources.add(resource)
		layers.add(row.layer)
		if (row.source) {
			m2lxAssert(
				(row.source.type === 'video' || row.source.type === 'image') &&
					typeof row.source.name === 'string' &&
					row.source.name.trim(),
				'keyer source must explicitly name a native video or image'
			)
			m2lxAssert(type !== TSR.M2LXKeyerType.PIP || row.source.type === 'video', 'PiP requires a video source')
			m2lxAssert(type !== TSR.M2LXKeyerType.STILL || row.source.type === 'image', 'still keyer requires an image')
			m2lxAssert(
				Object.keys(row.source).every(key => ['type', 'name'].includes(key)),
				'unknown native source property'
			)
		}
		if (row.composition) {
			m2lxAssert(row.preconfigured === true, 'generic fill/key/clip/gain requires explicit preconfigured:true')
			m2lxAssert(
				['Number', 'Clip', 'Gain'].every(key => {
					const value = row.composition![key as keyof SwitcherDskProps]
					return typeof value === 'number' && Number.isFinite(value)
				}),
				'composition values must be finite'
			)
			m2lxAssert(
				Number.isInteger(row.composition.Number) &&
					row.composition.Number >= 0 &&
					['Fill', 'Key'].every(key => {
						const value = row.composition![key as keyof SwitcherDskProps]
						return (
							(typeof value === 'number' && Number.isInteger(value) && value >= 0) ||
							(typeof value === 'string' && value.trim().length > 0 && value === value.trim())
						)
					}) &&
					row.composition.Clip >= 0 &&
					row.composition.Clip <= 100 &&
					row.composition.Gain >= 0 &&
					row.composition.Gain <= 100,
				'preconfigured composition needs non-negative logical inputs/number and clip/gain 0..100; dynamic AB keyers are unsupported'
			)
			m2lxAssert(
				Object.keys(row.composition).every(key => ['Number', 'Fill', 'Key', 'Clip', 'Gain'].includes(key)),
				'unknown preconfigured composition property'
			)
		}
	})
	config.routers.forEach(row => {
		m2lxAssert(
			row && typeof row.layer === 'string' && row.layer.trim() && typeof row.output === 'string' && row.output.trim(),
			'router layer and native output are required'
		)
		m2lxAssert(
			row.layer === row.layer.trim() &&
				row.output === row.output.trim() &&
				(row.node === undefined || (typeof row.node === 'string' && !!row.node.trim() && row.node === row.node.trim())),
			'router layer/node/output must not be empty or contain surrounding whitespace'
		)
		m2lxAssert(
			Object.keys(row).every(key => ['layer', 'node', 'output'].includes(key)),
			'unknown router configuration property'
		)
		const resource = `router/${row.node ?? 'router'}/${row.output}`
		m2lxAssert(!layers.has(row.layer) && !resources.has(resource), 'duplicate router layer/output')
		layers.add(row.layer)
		resources.add(resource)
	})
	m2lxAssert(
		config.wipe === undefined || (TSR.isM2LXEffectName(config.wipe) && config.wipe.startsWith('wipe_')),
		'wipe must be an explicitly supported native wipe effect'
	)
	return config
}

export function resolveM2LXConfiguration(studio: TV2StudioConfigBase, mappings: BlueprintMappings) {
	const primary = mappings[M2LX_LAYER_PREFIX + SwitcherMixEffectLLayer.Program] as BlueprintMapping &
		Partial<TSR.MappingM2LX>
	m2lxAssert(
		primary?.device === TSR.DeviceType.M2LX &&
			primary.mappingType === TSR.MappingM2LXType.MIXER &&
			typeof primary.deviceId === 'string' &&
			primary.deviceId.trim() &&
			primary.deviceId === primary.deviceId.trim(),
		'configure the Program layer mapping with an M2L-X mixer device'
	)
	const keyers: M2LXKeyerAllocation[] = []
	const routers: M2LXConfiguration['routers'] = []
	let dveGraphicsDsk: 0 | 1 | undefined
	for (const [layer, mapping] of Object.entries(mappings)) {
		if (!layer.startsWith(M2LX_LAYER_PREFIX)) {
			continue
		}
		m2lxAssert(
			mapping.device === TSR.DeviceType.M2LX && mapping.deviceId === primary.deviceId,
			`mapping ${layer} targets a different device; reconcile manually while inactive`
		)
		const native = mapping as typeof mapping & TSR.MappingM2LX
		const role = layer.slice(M2LX_LAYER_PREFIX.length)
		if (layer === M2LX_DVE_GRAPHICS_LAYER) {
			m2lxAssert(
				native.mappingType === TSR.MappingM2LXType.KEYER &&
					native.keyer?.type === TSR.M2LXKeyerType.DSK &&
					[0, 1].includes(native.keyer.index) &&
					native.bus === TSR.M2LXMixerBus.PROGRAM &&
					mapping.lookahead === LookaheadMode.NONE,
				'the DVE graphics mapping must select a Program DSK with no independent lookahead'
			)
			m2lxAssert(
				Reflect.get(TSR, 'M2LX_COMPOSITION_DSK_SUPPORTED') === true,
				'DVE graphics require matching resolver and types with coordinated DSK composition support'
			)
			dveGraphicsDsk = native.keyer.index
			continue
		}
		if (native.mappingType === TSR.MappingM2LXType.KEYER) {
			m2lxAssert(native.keyer, `select a graphics resource for layer ${layer}`)
			const dsk = studio.SwitcherSource.DSK.find(row => getDskLLayerName(row.Number) === role)
			keyers.push({
				layer: role,
				bus: native.bus,
				keyer: native.keyer,
				...(dsk
					? {
							composition: { Number: dsk.Number, Fill: dsk.Fill, Key: dsk.Key, Clip: dsk.Clip, Gain: dsk.Gain },
							preconfigured: dsk.UsePreconfigured === true,
							source: dsk.SourceName ? { type: 'video' as const, name: dsk.SourceName } : undefined
					  }
					: {})
			})
		} else if (native.mappingType === TSR.MappingM2LXType.ROUTER) {
			routers.push({ layer: role, node: native.node, output: native.output })
		}
	}
	const config = validateM2LXConfiguration({
		sources: [],
		compositionPips: [0, 1, 2, 3],
		keyers,
		routers
	})
	m2lxAssert(
		!keyers.some(row => row.keyer.type === TSR.M2LXKeyerType.DSK && row.keyer.index === dveGraphicsDsk),
		'the DVE graphics DSK is managed on both buses; remove its separate graphics mappings while inactive'
	)
	config.dveGraphicsDsk = dveGraphicsDsk
	return { deviceId: primary.deviceId, config }
}

export function selectSwitcherUniformConfig(config: TV2StudioConfig, uniform: UniformConfig): UniformConfig {
	if (config.studio.SwitcherType !== SwitcherType.M2LX) {
		return uniform
	}
	m2lxAssert(uniform.profile === 'offtube' || uniform.profile === 'singleMixer', 'only Offtube is supported, not AFVD')
	const program = {
		...uniform.mixEffects.program,
		mixEffectLayer: SwitcherMixEffectLLayer.Program,
		auxLayer: undefined
	}
	return {
		profile: 'singleMixer',
		switcherLLayers: { primaryMixEffect: SwitcherMixEffectLLayer.Program },
		mixEffects: { program, clean: program },
		specialInputAuxLLayers: {}
	}
}
