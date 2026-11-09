import {
	BlueprintMapping,
	ConfigItemValue,
	IBlueprintConfig,
	LookaheadMode,
	MigrationContextStudio,
	MigrationStepStudio,
	TSR
} from 'blueprints-integration'
import { SwitcherType, videoSwitcherMigrations } from 'tv2-common'

function makeContext(config: IBlueprintConfig = {}, mappings: Record<string, BlueprintMapping> = {}) {
	const root = JSON.parse(JSON.stringify(config))
	const findParent = (path: string, create: boolean) => {
		const parts = path.split('.')
		const key = parts.pop()!
		let parent = root
		for (const part of parts) {
			if (!parent[part]) {
				if (!create) {
					return undefined
				}
				parent[part] = {}
			}
			parent = parent[part]
		}
		return { parent, key }
	}
	const context: MigrationContextStudio = {
		getConfig: path => {
			const target = findParent(path, false)
			return target?.parent[target.key] as ConfigItemValue | undefined
		},
		setConfig: (path, value) => {
			const target = findParent(path, true)!
			target.parent[target.key] = value
		},
		removeConfig: path => {
			const target = findParent(path, false)
			if (target) {
				delete target.parent[target.key]
			}
		},
		getMapping: id => mappings[id],
		insertMapping: (id, value) => {
			mappings[id] = value
			return id
		},
		updateMapping: (id, value) => {
			mappings[id] = { ...mappings[id], ...value }
		},
		removeMapping: id => {
			delete mappings[id]
		},
		getDevice: jest.fn(),
		insertDevice: jest.fn(),
		updateDevice: jest.fn(),
		removeDevice: jest.fn()
	}
	return { context, root, mappings }
}

function migrate(steps: MigrationStepStudio[], context: MigrationContextStudio) {
	for (const step of steps) {
		if (step.validate(context, false)) {
			step.migrate!(context, {})
			expect(step.validate(context, true)).toBeFalsy()
		}
	}
}

describe.each(['AFVD', 'Offtube'])('VideoSwitcher migration: %s', studio => {
	test('merges partially migrated configs and table rows without replacing operator destinations', () => {
		const { context, root } = makeContext({
			AtemSource: {
				Default: 2,
				SplitArtF: 21,
				SplitArtK: 22,
				DSK: [{ _id: 'jingle', Clip: '12.5', Gain: '100', Fill: 31 }]
			},
			SwitcherSource: { Default: 7, SplitArtFill: 99, DSK: [{ _id: 'jingle', Gain: '75' }] },
			SwitcherType: SwitcherType.TRICASTER,
			SourcesCam: [
				{ _id: 'old', AtemSource: 1 },
				{ _id: 'new', SwitcherSource: 4 },
				{ _id: 'both', AtemSource: 8, SwitcherSource: 9 }
			]
		})
		const steps = videoSwitcherMigrations('1.7.10', studio)
		migrate(steps, context)
		expect(root).toEqual({
			SwitcherSource: {
				Default: 7,
				SplitArtFill: 99,
				SplitArtKey: 22,
				DSK: [{ _id: 'jingle', Clip: 12.5, Gain: 75, Fill: 31 }]
			},
			SwitcherType: SwitcherType.TRICASTER,
			SourcesCam: [
				{ _id: 'old', SwitcherSource: 1 },
				{ _id: 'new', SwitcherSource: 4 },
				{ _id: 'both', SwitcherSource: 9 }
			]
		})
		const before = JSON.stringify(root)
		migrate(steps, context)
		expect(JSON.stringify(root)).toEqual(before)
		steps.forEach(step => step.migrate!(context, {}))
		expect(JSON.stringify(root)).toEqual(before)
	})

	test('moves legacy DVE mappings intact and preserves existing custom destinations', () => {
		const custom: BlueprintMapping & TSR.MappingAtem = {
			device: TSR.DeviceType.ATEM,
			deviceId: 'operator-atem',
			mappingType: TSR.MappingAtemType.SuperSourceBox,
			index: 2,
			lookahead: LookaheadMode.PRELOAD,
			lookaheadDepth: 7
		}
		const destination = { ...custom, deviceId: 'already-migrated', index: 3 }
		const { context, mappings } = makeContext(
			{},
			{
				atem_supersource_art: custom,
				atem_supersource_default: custom,
				atem_dve_boxes: destination
			}
		)
		migrate(videoSwitcherMigrations('1.7.10', studio), context)
		expect(mappings).toEqual({ atem_dve: custom, atem_dve_boxes: destination })
		expect(context.getConfig('SwitcherType')).toBe(SwitcherType.ATEM)
	})

	test.each(['', '45garbage', 'NaN', '-1', '101'])(
		'rejects invalid DSK percentage %p without partially modifying the table',
		value => {
			const table = [
				{ _id: 'valid', Clip: '10' },
				{ _id: 'invalid', Clip: value }
			]
			const { context } = makeContext({ SwitcherSource: { DSK: table } })
			const step = videoSwitcherMigrations('1.7.10', studio).find(candidate => candidate.id.endsWith('.DSK.Clip'))!
			expect(step.validate(context, false)).toBeTruthy()
			expect(() => step.migrate!(context, {})).toThrow('expected a percentage between 0 and 100')
			expect(context.getConfig('SwitcherSource.DSK')).toEqual(table)
		}
	)
})

test.each(['../../../tv2_afvd_studio/migrations', '../../../tv2_offtube_studio/migrations'])(
	'studio migration %s preserves custom mappings through final default insertion',
	modulePath => {
		Object.assign(global, { VERSION: '1.7.10' })
		const steps: MigrationStepStudio[] = require(modulePath).studioMigrations
		const custom: BlueprintMapping & TSR.MappingAtem = {
			device: TSR.DeviceType.ATEM,
			deviceId: 'custom-hardware',
			mappingType: TSR.MappingAtemType.SuperSourceBox,
			index: 5,
			lookahead: LookaheadMode.PRELOAD
		}
		const { context } = makeContext({}, { atem_supersource_default: custom })
		const relevant = steps.filter(step => step.version === '1.7.10')
		migrate(relevant, context)
		steps[steps.length - 1].migrate!(context, {})
		expect(context.getMapping('atem_dve_boxes')).toEqual(custom)
		expect(steps[steps.length - 1].id).toContain('.mappings.defaults.')
	}
)
