import { BlueprintMapping, ConfigItemValue, LookaheadMode, MigrationContextStudio, TSR } from 'blueprints-integration'
import { SwitcherType } from 'tv2-common'
import { m2lxMigrations } from '../migrations/m2lx'
import { getMappingsDefaultsMigrationSteps } from '../migrations/util'

function setup() {
	const config: { [key: string]: ConfigItemValue } = {
		SwitcherType: SwitcherType.M2LX,
		'M2LX.DeviceId': 'operator-native',
		'M2LX.Configuration': JSON.stringify({
			sources: [{ input: 0, source: 'real_black' }],
			compositionPips: [1, 3],
			keyers: [],
			routers: [{ layer: 'aux_screen', node: 'router_custom', output: 'wall' }],
			wipe: 'wipe_left'
		}),
		'M2LX.EventId': 'stable-event-id',
		'M2LX.EventTimeout': 240000
	}
	const devices: { [key: string]: TSR.DeviceOptionsAny } = {
		'operator-native': {
			type: TSR.DeviceType.M2LX,
			disable: true,
			options: {
				baseUrl: 'https://example.invalid',
				password: 'unit-test-not-a-secret',
				rejectUnauthorized: true,
				commandTimeout: 2345
			}
		}
	}
	const mappings: { [key: string]: BlueprintMapping } = {
		atem_old: { device: TSR.DeviceType.ATEM, deviceId: 'preserved', lookahead: 0 }
	}
	const context: MigrationContextStudio = {
		getConfig: key => config[key],
		setConfig: (key, value) => {
			config[key] = value
		},
		removeConfig: key => {
			delete config[key]
		},
		getDevice: key => devices[key],
		insertDevice: (key, value) => {
			devices[key] = value
			return key
		},
		updateDevice: (key, value) => {
			const updated = { ...devices[key], ...value }
			devices[key] = updated as TSR.DeviceOptionsAny
		},
		removeDevice: key => {
			delete devices[key]
		},
		getMapping: key => mappings[key],
		insertMapping: (key, value) => {
			mappings[key] = value
			return key
		},
		updateMapping: (key, value) => {
			mappings[key] = { ...mappings[key], ...value }
		},
		removeMapping: key => {
			delete mappings[key]
		}
	}
	const [migration] = m2lxMigrations('1.7.11')
	return { config, devices, mappings, context, migration }
}

function setupDirectInputs() {
	const result = setup()
	result.config.SwitcherInputNames = [
		{ _id: 'black', Input: 0, Source: 'real_black' },
		{ _id: 'player', Input: 5, Source: 'native_player' }
	]
	const mapping: BlueprintMapping & TSR.MappingM2LXMixer = {
		device: TSR.DeviceType.M2LX,
		deviceId: 'operator-native',
		mappingType: TSR.MappingM2LXType.MIXER,
		lookahead: LookaheadMode.WHEN_CLEAR
	}
	result.mappings.m2lx_me_program = mapping
	const migration = m2lxMigrations('1.7.11').find(step => step.id.endsWith('.directInputs'))!
	return { ...result, migration }
}

test('direct input conversion preserves source/player IDs, existing names, DSK intent and all device/mapping options', () => {
	const { config, context, devices, mappings, migration } = setupDirectInputs()
	config.SwitcherType = 'M2LX'
	config['SwitcherSource.Default'] = 0
	config.IdleSource = 'already_named'
	config.SourcesCam = [{ _id: 'camera-id', SourceName: '1', SwitcherSource: 0, StudioMics: true }]
	config.SourcesRM = [{ _id: 'live-id', SourceName: '2', SwitcherSource: 'already_live' }]
	config.SourcesFeed = []
	config.ABMediaPlayers = [{ _id: 'player-id', SourceName: '1', SwitcherSource: '5' }]
	config['SwitcherSource.DSK'] = [
		{
			_id: 'graphics-id',
			Number: 2,
			Fill: 0,
			Key: 5,
			Clip: 50,
			Gain: 100,
			SourceName: 'prepared_composite',
			UsePreconfigured: true
		}
	]
	const before = JSON.stringify({ devices, mappings })
	expect(migration.validate(context, false)).toContain('source names')
	migration.migrate!(context, { inactiveConfirmed: true, layoutsConfirmed: true })
	expect(config['SwitcherSource.Default']).toBe('real_black')
	expect(config.IdleSource).toBe('already_named')
	expect(config.SourcesCam).toEqual([
		{ _id: 'camera-id', SourceName: '1', SwitcherSource: 'real_black', StudioMics: true }
	])
	expect(config.ABMediaPlayers).toEqual([{ _id: 'player-id', SourceName: '1', SwitcherSource: 'native_player' }])
	expect(config.SourcesRM).toEqual([{ _id: 'live-id', SourceName: '2', SwitcherSource: 'already_live' }])
	expect(config['SwitcherSource.DSK']).toEqual([
		{
			_id: 'graphics-id',
			Number: 2,
			Fill: 'real_black',
			Key: 'native_player',
			Clip: 50,
			Gain: 100,
			SourceName: 'prepared_composite',
			UsePreconfigured: true
		}
	])
	expect(config.SwitcherInputNames).toBeUndefined()
	expect(JSON.stringify({ devices, mappings })).toBe(before)
	expect(migration.validate(context, true)).toBe(false)
})

test.each(['missing binding', 'ambiguous numeric name', 'enabled device', 'missing confirmation', 'unchecked layouts'])(
	'direct input conversion blocks %s before making any writes',
	kind => {
		const { config, context, devices, mappings, migration } = setupDirectInputs()
		config['SwitcherSource.Default'] = 0
		config.ABMediaPlayers = [{ _id: 'player', SourceName: '1', SwitcherSource: '5' }]
		if (kind === 'missing binding') {
			config.SourcesCam = [{ _id: 'camera', SourceName: '1', SwitcherSource: 99 }]
		}
		if (kind === 'ambiguous numeric name') {
			config.SwitcherInputNames = [
				{ _id: 'black', Input: 0, Source: 'real_black' },
				{ _id: 'player', Input: 5, Source: 'native_player' },
				{ _id: 'numeric-name', Input: 6, Source: '5' }
			]
		}
		if (kind === 'enabled device') {
			devices['operator-native'].disable = false
		}
		const before = JSON.stringify({ config, devices, mappings })
		expect(() =>
			migration.migrate!(context, {
				inactiveConfirmed: kind !== 'missing confirmation',
				layoutsConfirmed: kind !== 'unchecked layouts'
			})
		).toThrow(/no source name|ambiguous|disable|confirmation|backgrounds/)
		expect(JSON.stringify({ config, devices, mappings })).toBe(before)
	}
)

test('empty previous bindings are removed without guessing native names or requiring a nonexistent device', () => {
	const { config, context, devices, mappings, migration } = setupDirectInputs()
	config.SwitcherInputNames = []
	config['SwitcherSource.Default'] = 2001
	config.SourcesCam = [{ _id: 'camera', SourceName: '1', SwitcherSource: 4 }]
	delete devices['operator-native']
	delete mappings.m2lx_me_program
	migration.migrate!(context, { inactiveConfirmed: true })
	expect(config.SwitcherInputNames).toBeUndefined()
	expect(config['SwitcherSource.Default']).toBe(2001)
	expect(config.SourcesCam).toEqual([{ _id: 'camera', SourceName: '1', SwitcherSource: 4 }])
})

test('old saved mixer spelling is renamed without changing resource configuration', () => {
	const { config, context, devices, mappings } = setup()
	config.SwitcherType = 'M2LX'
	const migration = m2lxMigrations('1.7.11').find(step => step.id.endsWith('.displayName'))!
	const before = JSON.stringify({ devices, mappings })
	expect(migration.canBeRunAutomatically).toBe(true)
	migration.migrate!(context, {})
	expect(config.SwitcherType).toBe('M2L-X')
	expect(JSON.stringify({ devices, mappings })).toBe(before)
	expect(migration.validate(context, true)).toBe(false)
})

test('removing the legacy studio wipe preserves it until show-style setup is confirmed', () => {
	const { config, context, devices, mappings } = setup()
	config.SwitcherWipeEffect = 'Left'
	const migration = m2lxMigrations('1.7.11').find(step => step.id.endsWith('.showStyleWipes'))!
	const before = JSON.stringify({ devices, mappings })
	expect(migration.canBeRunAutomatically).toBe(false)
	expect(migration.validate(context, false)).toContain('Left')
	expect(() => migration.migrate!(context, {})).toThrow('inactive')
	expect(() => migration.migrate!(context, { inactiveConfirmed: true })).toThrow('show-style')
	expect(config.SwitcherWipeEffect).toBe('Left')
	migration.migrate!(context, { inactiveConfirmed: true, showStylesConfirmed: true })
	expect(config.SwitcherWipeEffect).toBeUndefined()
	expect(JSON.stringify({ devices, mappings })).toBe(before)
})

test('manual conversion moves legacy settings to shared studio tables and normal mappings, preserving gateway options', () => {
	const { context, config, devices, mappings, migration } = setup()
	const options = (devices['operator-native'] as TSR.DeviceOptionsM2LX).options
	expect(migration.canBeRunAutomatically).toBe(false)
	expect(migration.validate(context, false)).toContain('Convert')
	expect(() => migration.migrate!(context, {})).toThrow('inactive')
	migration.migrate!(context, { inactiveConfirmed: true })
	expect(config.SwitcherInputNames).toEqual([{ _id: 'input-0', Input: 0, Source: 'real_black' }])
	expect(config.SwitcherSplitScreenBoxes).toBeUndefined()
	expect(config.SwitcherWipeEffect).toBe('Left')
	expect(mappings.m2lx_me_program).toMatchObject({
		deviceId: 'operator-native',
		mappingType: 'mixer',
		lookahead: LookaheadMode.PRELOAD
	})
	expect(mappings.m2lx_aux_screen).toMatchObject({ node: 'router_custom', output: 'wall' })
	expect(Object.keys(mappings).some(key => key.includes('pip'))).toBe(false)
	expect(mappings.atem_old.deviceId).toBe('preserved')
	expect((devices['operator-native'] as TSR.DeviceOptionsM2LX).options).toEqual({
		...options,
		eventId: 'stable-event-id',
		eventTimeout: 240000
	})
	expect(Object.keys(config).some(key => key.startsWith('M2LX.'))).toBe(false)
	expect(migration.validate(context, true)).toBe(false)
	migration.migrate!(context, { inactiveConfirmed: true })
})

test.each(['enabled', 'missing', 'wrong type'])('conversion refuses an %s device without changing settings', kind => {
	const { context, config, devices, mappings, migration } = setup()
	if (kind === 'enabled') {
		devices['operator-native'].disable = false
	}
	if (kind === 'missing') {
		delete devices['operator-native']
	}
	if (kind === 'wrong type') {
		devices['operator-native'] = { type: TSR.DeviceType.ATEM, options: { host: 'preserved' } }
	}
	const before = JSON.stringify({ config, devices, mappings })
	expect(() => migration.migrate!(context, { inactiveConfirmed: true })).toThrow('M2L-X')
	expect(JSON.stringify({ config, devices, mappings })).toBe(before)
})

test.each(['source', 'mapping', 'event', 'timeout'])(
	'conflicting %s configuration blocks all conversion writes',
	kind => {
		const { context, config, devices, mappings, migration } = setup()
		if (kind === 'source') {
			config.SwitcherInputNames = [{ _id: 'custom', Input: 0, Source: 'different' }]
		}
		if (kind === 'mapping') {
			mappings.m2lx_me_program = { device: TSR.DeviceType.M2LX, deviceId: 'different', lookahead: 0 }
		}
		const device = devices['operator-native'] as TSR.DeviceOptionsM2LX
		if (kind === 'event') {
			device.options!.eventId = 'different-event'
		}
		if (kind === 'timeout') {
			device.options!.eventTimeout = 90000
		}
		const before = JSON.stringify({ config, devices, mappings })
		expect(() => migration.migrate!(context, { inactiveConfirmed: true })).toThrow(/conflict|differ/)
		expect(JSON.stringify({ config, devices, mappings })).toBe(before)
	}
)

test('equivalent existing rows retain their IDs and blank legacy event fields never clear gateway options', () => {
	const { context, config, devices, migration } = setup()
	config.SwitcherInputNames = [{ _id: 'operator-row', Input: 0, Source: 'real_black' }]
	config['M2LX.EventId'] = ''
	config['M2LX.EventTimeout'] = 0
	const device = devices['operator-native'] as TSR.DeviceOptionsM2LX
	device.options!.eventId = 'gateway-authority'
	device.options!.eventTimeout = 90000
	const options = { ...device.options }
	migration.migrate!(context, { inactiveConfirmed: true })
	expect(config.SwitcherInputNames).toEqual([{ _id: 'operator-row', Input: 0, Source: 'real_black' }])
	expect((devices['operator-native'] as TSR.DeviceOptionsM2LX).options).toEqual(options)
})

test('graphics reuse the shared DSK row instead of keeping a second copy of fill/key adjustments', () => {
	const { context, config, mappings, migration } = setup()
	const composition = { Number: 0, Fill: 11, Key: 12, Clip: 50, Gain: 100 }
	config['SwitcherSource.DSK'] = [{ _id: 'graphics', ...composition, Toggle: true, DefaultOn: false }]
	const legacy = JSON.parse(config['M2LX.Configuration'] as string)
	legacy.keyers = [
		{
			layer: 'dsk_1',
			bus: 'program',
			keyer: { type: 'dsk', index: 0 },
			composition,
			preconfigured: true,
			source: { type: 'video', name: 'graphics' }
		}
	]
	config['M2LX.Configuration'] = JSON.stringify(legacy)
	migration.migrate!(context, { inactiveConfirmed: true })
	expect(config['SwitcherSource.DSK']).toEqual([
		{
			_id: 'graphics',
			...composition,
			Toggle: true,
			DefaultOn: false,
			UsePreconfigured: true,
			SourceName: 'graphics'
		}
	])
	expect(mappings.m2lx_dsk_1).toMatchObject({ bus: 'program', keyer: { type: 'dsk', index: 0 } })
})

test('conversion rejects conflicting Split Screen allocations without changing settings or mappings', () => {
	const { context, config, devices, mappings, migration } = setup()
	const legacy = JSON.parse(config['M2LX.Configuration'] as string)
	legacy.keyers = [{ layer: 'preview_pip_1', bus: 'preview', keyer: { type: 'pip', index: 1 } }]
	config['M2LX.Configuration'] = JSON.stringify(legacy)
	const before = JSON.stringify({ config, devices, mappings })
	expect(() => migration.migrate!(context, { inactiveConfirmed: true })).toThrow('managed on both buses')
	expect(JSON.stringify({ config, devices, mappings })).toBe(before)
})

test('new setups and other mixer types never run legacy device/mapping synchronization', () => {
	const { context, config, devices, migration } = setup()
	for (const key of Object.keys(config).filter(configKey => configKey.startsWith('M2LX.'))) {
		delete config[key]
	}
	const before = JSON.stringify(devices)
	expect(migration.validate(context, false)).toBe(false)
	migration.migrate!(context, {})
	expect(JSON.stringify(devices)).toBe(before)
	const atemDefaults = getMappingsDefaultsMigrationSteps('1.7.11').filter(step => step.id.includes('.atem_'))
	expect(atemDefaults.every(step => step.validate(context, false) === false)).toBe(true)
	config.SwitcherType = SwitcherType.ATEM
	expect(migration.validate(context, false)).toBe(false)
	expect(atemDefaults.some(step => step.validate(context, false))).toBe(true)
})

test('untouched defaults can be cleared without a legacy device ID and never overwrite new studio settings', () => {
	const { context, config, devices, mappings, migration } = setup()
	config['M2LX.DeviceId'] = ''
	config['M2LX.Configuration'] = '{"sources":[],"keyers":[],"routers":[]}'
	delete config['M2LX.EventId']
	delete config['M2LX.EventTimeout']
	config.SwitcherInputNames = [{ _id: 'operator-input', Input: 4, Source: 'camera' }]
	delete devices['operator-native']
	const previousDevices = JSON.stringify(devices)
	const previousMappings = JSON.stringify(mappings)
	expect(() => migration.migrate!(context, {})).toThrow('inactive')
	migration.migrate!(context, { inactiveConfirmed: true })
	expect(config.SwitcherInputNames).toEqual([{ _id: 'operator-input', Input: 4, Source: 'camera' }])
	expect(Object.keys(config).some(key => key.startsWith('M2LX.'))).toBe(false)
	expect(JSON.stringify(devices)).toBe(previousDevices)
	expect(JSON.stringify(mappings)).toBe(previousMappings)
	expect(migration.validate(context, false)).toBe(false)
})
