import { DVEConfigBox } from '../content/dve'
import { m2lxAssert } from './m2lxErrors'
import { M2LXLayout } from './m2lxLayout'

function isRecord(value: unknown): value is Record<string, unknown> {
	return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function isAtemBox(value: unknown): value is DVEConfigBox {
	return (
		isRecord(value) &&
		typeof value.enabled === 'boolean' &&
		typeof value.cropped === 'boolean' &&
		['source', 'x', 'y', 'size', 'cropTop', 'cropBottom', 'cropLeft', 'cropRight'].every(
			field => typeof value[field] === 'number' && Number.isFinite(value[field])
		)
	)
}

/** Explicit offline geometry conversion; does not map sources or configure artwork. */
export function convertAtemToM2lxDve(value: unknown): Pick<M2LXLayout, 'bus' | 'boxes'> {
	m2lxAssert(isRecord(value) && value.index === 0, 'conversion requires a single ATEM SuperSource export')
	m2lxAssert(
		value.border === undefined || (isRecord(value.border) && value.border.borderEnabled === false),
		'ATEM borders cannot be converted to M2L-X'
	)
	const sourceBoxes = value.boxes
	m2lxAssert(
		isRecord(sourceBoxes) && Object.keys(sourceBoxes).join(',') === '0,1,2,3',
		'conversion requires the four exported ATEM boxes'
	)
	const entries = Object.entries(sourceBoxes)
	entries.forEach(([, box]) => m2lxAssert(isAtemBox(box), 'invalid ATEM box geometry'))
	const active = entries.filter(([, box]) => isAtemBox(box) && box.enabled).map(([position]) => position)
	const indices = [0, 1, 2, 3] as const
	const boxes: M2LXLayout['boxes'] = {}
	let hidden = active.length
	for (const [position, box] of entries) {
		m2lxAssert(isAtemBox(box), 'invalid ATEM box geometry')
		if (!box.enabled) {
			boxes[position] = { index: indices[hidden++], enabled: false }
			continue
		}
		m2lxAssert(box.size > 0, 'ATEM box size must be positive')
		const left = box.cropped ? box.cropLeft / 32000 : 0
		const right = box.cropped ? box.cropRight / 32000 : 0
		const top = box.cropped ? box.cropTop / 18000 : 0
		const bottom = box.cropped ? box.cropBottom / 18000 : 0
		m2lxAssert(
			[left, right, top, bottom].every(margin => margin >= 0) && left + right < 1 && top + bottom < 1,
			'ATEM crop must retain a positive source rectangle'
		)
		const scale = box.size / 1000
		boxes[position] = {
			// ATEM's first box is foreground; native PiPs use the highest index.
			index: indices[active.length - 1 - active.indexOf(position)],
			enabled: true,
			translation: {
				x: Math.round(960 + (box.x / 3200) * 1920 - (1920 * scale) / 2),
				y: Math.round(540 - (box.y / 1800) * 1080 - (1080 * scale) / 2)
			},
			scale: { x: scale, y: scale },
			crop: { x: left, y: top, width: 1 - left - right, height: 1 - top - bottom }
		}
	}
	return { bus: 'program', boxes }
}
