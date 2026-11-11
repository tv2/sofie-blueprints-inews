import { TSR } from 'blueprints-integration'
import { SwitcherInput } from '../types/config'
import { m2lxAssert } from './m2lxConfig'

export interface M2LXLayoutBox {
	index: TSR.M2LXPipKeyerIndex
	enabled: boolean
	translation?: TSR.M2LXTranslation
	scale?: TSR.M2LXScale
	crop?: TSR.M2LXCrop
	border?: TSR.M2LXBorder
}

/** Program composition, prepared on Preview through selected Next; never a routable source. */
export interface M2LXLayout {
	format?: 'm2lx-native-v1'
	bus: 'preview' | 'program'
	background: string
	boxes: { [box: string]: M2LXLayoutBox }
}

export function isM2LXLayout(value: unknown): value is M2LXLayout {
	return !!value && typeof value === 'object' && (value as M2LXLayout).format === 'm2lx-native-v1'
}

export function parseM2LXLayout(value: unknown, background?: SwitcherInput): M2LXLayout {
	m2lxAssert(value && typeof value === 'object' && !Array.isArray(value), 'Split Screen layout must be an object')
	const layout = value as M2LXLayout
	const source = layout.background ?? background
	m2lxAssert(typeof source === 'string', 'Split Screen background must be an exact source name on the mixer')
	return validateM2LXLayout({ ...layout, bus: layout.bus ?? 'program', background: source })
}

export function validateM2LXLayout(value: M2LXLayout): M2LXLayout {
	m2lxAssert(value.format === undefined || value.format === 'm2lx-native-v1', 'unrecognized Split Screen layout format')
	m2lxAssert(
		value.bus === 'program',
		'Split Screen destination must be Program; select the layout as Next to prepare Preview'
	)
	m2lxAssert(
		typeof value.background === 'string' &&
			value.background.trim().length > 0 &&
			value.background === value.background.trim(),
		'Split Screen background must be an exact source name on the mixer'
	)
	m2lxAssert(
		value.boxes && typeof value.boxes === 'object' && !Array.isArray(value.boxes),
		'layout boxes must be an object'
	)
	const entries = Object.entries(value.boxes)
	m2lxAssert(entries.length <= 4, 'at most four Split Screen boxes are available')
	const indices = new Set<number>()
	entries.forEach(([box, geometry], i) => {
		m2lxAssert(box === i.toString(), 'layout box positions must be consecutive, starting at 0')
		m2lxAssert(geometry && typeof geometry === 'object', 'each box requires native geometry')
		m2lxAssert(
			Number.isInteger(geometry.index) && geometry.index >= 0 && geometry.index <= 3,
			'Split Screen box number must be 1 to 4 (stored as 0 to 3)'
		)
		m2lxAssert(!indices.has(geometry.index), 'layout reuses a Split Screen box')
		indices.add(geometry.index)
		m2lxAssert(typeof geometry.enabled === 'boolean', 'box enabled must be boolean')
		m2lxAssert(
			value.bus !== 'program' || geometry.border === undefined,
			'Program composition does not support border; reconcile native border/rotation on both buses outside the template'
		)
		if (
			geometry.enabled ||
			geometry.translation !== undefined ||
			geometry.scale !== undefined ||
			geometry.crop !== undefined
		) {
			m2lxAssert(
				geometry.translation && [geometry.translation.x, geometry.translation.y].every(Number.isFinite),
				'translation x/y must be finite native pixel offsets'
			)
			m2lxAssert(
				[geometry.translation.x, geometry.translation.y].every(Number.isInteger),
				'translation x/y must use whole pixels; fractional positions are not supported'
			)
			m2lxAssert(
				geometry.scale && [geometry.scale.x, geometry.scale.y].every(n => Number.isFinite(n) && n > 0),
				'scale x/y must be positive unitless fractions'
			)
			const crop = geometry.crop
			m2lxAssert(
				crop &&
					[crop.x, crop.y, crop.width, crop.height].every(Number.isFinite) &&
					crop.x >= 0 &&
					crop.y >= 0 &&
					crop.width > 0 &&
					crop.height > 0 &&
					crop.x + crop.width <= 1 &&
					crop.y + crop.height <= 1,
				'crop must be a normalized retained rectangle inside 0..1'
			)
		}
		if (geometry.border) {
			const border = geometry.border
			m2lxAssert(
				typeof border.color === 'string' &&
					border.color.trim() &&
					Object.keys(border).every(key =>
						[
							'color',
							'enabled',
							'fill_enabled',
							'height',
							'width',
							'inner_edge_softness',
							'outer_edge_softness',
							'inner_radius',
							'outer_radius',
							'lock_aspect_ratio',
							'offset'
						].includes(key)
					) &&
					['enabled', 'fill_enabled', 'lock_aspect_ratio'].every(
						key => typeof border[key as keyof TSR.M2LXBorder] === 'boolean'
					) &&
					[
						'height',
						'width',
						'inner_edge_softness',
						'outer_edge_softness',
						'inner_radius',
						'outer_radius',
						'offset'
					].every(
						key =>
							typeof border[key as keyof TSR.M2LXBorder] === 'number' &&
							Number.isFinite(border[key as keyof TSR.M2LXBorder])
					),
				'border requires every supported mixer border setting; ATEM art/border settings cannot be used'
			)
		}
		const unsupported = Object.keys(geometry).filter(
			key => !['index', 'enabled', 'translation', 'scale', 'crop', 'border'].includes(key)
		)
		m2lxAssert(
			unsupported.length === 0,
			`unsupported box property: ${unsupported.join(', ')}; use native translation/scale/crop/border only`
		)
	})
	m2lxAssert(
		Object.keys(value).every(key => ['format', 'bus', 'background', 'boxes'].includes(key)),
		'native layouts do not support ATEM art, fill/key, or undocumented properties'
	)
	return value
}
