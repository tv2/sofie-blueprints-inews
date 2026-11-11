import { readFileSync } from 'fs'
import { join } from 'path'
import { DVEConfig } from '../../content/dve'
import { convertAtemToM2lxDve } from '../atemToM2lxDveConverter'

const samples: Record<string, DVEConfig> = JSON.parse(
	readFileSync(join(__dirname, '../../../../docs/examples/m2lx-sports-layouts.json'), 'utf8')
)
const expected: Record<string, Array<[number, number, number, number, number]>> = {
	sommerfugl: [
		[0, 1, 0, 234, 0.5],
		[1, 0, 960, 234, 0.5]
	],
	morbarn: [
		[1, 1, 1301, 511, 0.32],
		[2, 0, -7, 91, 0.72]
	],
	barnmor: [
		[0, 1, 5, 511, 0.32],
		[1, 0, 545, 91, 0.72]
	],
	barnMorIpad: [
		[0, 1, 114, 501, 0.35],
		[1, 0, 496, 30, 0.8]
	],
	'3barnMor': [
		[0, 3, 106, 650, 0.23],
		[1, 2, 522, 173, 0.68],
		[2, 1, 106, 410, 0.23],
		[3, 0, 106, 176, 0.23]
	]
}

test.each(Object.keys(expected))('converts sports %s without changing its layout or stacking', name => {
	const converted = convertAtemToM2lxDve(samples[name])
	expect(converted.bus).toBe('program')
	expect(new Set(Object.values(converted.boxes).map(box => box.index)).size).toBe(4)
	for (const [position, index, x, y, scale] of expected[name]) {
		expect(converted.boxes[position]).toMatchObject({
			index,
			enabled: true,
			translation: { x, y },
			scale: { x: scale, y: scale }
		})
	}
	expect(converted).not.toHaveProperty('properties')
	expect(converted).not.toHaveProperty('background')
})

test('preserves asymmetric iPad crops and the cropped four-box layout', () => {
	const ipad = convertAtemToM2lxDve(samples.barnMorIpad)
	for (const [position, left, right, top, bottom] of [
		[0, 550, 2580, 240, 530],
		[1, 4380, 4170, 250, 0]
	]) {
		const crop = ipad.boxes[position].crop!
		expect(crop.x).toBeCloseTo(left / 32000, 12)
		expect(crop.y).toBeCloseTo(top / 18000, 12)
		expect(crop.width).toBeCloseTo(1 - (left + right) / 32000, 12)
		expect(crop.height).toBeCloseTo(1 - (top + bottom) / 18000, 12)
	}
	const triple = convertAtemToM2lxDve(samples['3barnMor'])
	expect(triple.boxes[1].crop?.x).toBe(400 / 32000)
	expect(triple.boxes[2].crop?.y).toBe(500 / 18000)
	expect(triple.boxes[2].crop?.height).toBeCloseTo(1 - 700 / 18000, 12)
	expect(triple.boxes[2].crop?.width).toBeCloseTo(1 - 700 / 32000, 12)
})

test('does not apply disabled crop margins or mutate the source export', () => {
	const source = {
		...samples.sommerfugl,
		boxes: {
			...samples.sommerfugl.boxes,
			0: { ...samples.sommerfugl.boxes[0], cropped: false, cropLeft: 16000 }
		}
	}
	expect(convertAtemToM2lxDve(source).boxes[0].crop).toEqual({ x: 0, y: 0, width: 1, height: 1 })
	expect(source.boxes[0].cropLeft).toBe(16000)
})

test.each([
	null,
	{ ...samples.sommerfugl, index: 1 },
	{ ...samples.sommerfugl, border: { borderEnabled: true } },
	{ ...samples.sommerfugl, boxes: { 0: samples.sommerfugl.boxes[0] } },
	{ ...samples.sommerfugl, boxes: { ...samples.sommerfugl.boxes, 0: { ...samples.sommerfugl.boxes[0], size: 0 } } },
	{
		...samples.sommerfugl,
		boxes: { ...samples.sommerfugl.boxes, 0: { ...samples.sommerfugl.boxes[0], cropLeft: 32000 } }
	}
])('rejects unsupported or invalid ATEM exports: %p', value => {
	expect(() => convertAtemToM2lxDve(value)).toThrow('M2L-X')
})
