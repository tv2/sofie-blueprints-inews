import {
	BlueprintMapping,
	BlueprintMappings,
	ConfigItemValue,
	LookaheadMode,
	MigrationContextStudio,
	MigrationStepStudio,
	TSR
} from 'blueprints-integration'
import {
	getDskLLayerName,
	isM2LXSwitcher,
	literal,
	M2LX_LAYER_PREFIX,
	M2LX_WIPE_EFFECTS,
	m2lxAssert,
	parseM2LXConfiguration,
	SwitcherType,
	TableConfigItemDSK
} from 'tv2-common'
import { SwitcherMixEffectLLayer } from 'tv2-constants'
import * as _ from 'underscore'

function isDsk(row: unknown): row is TableConfigItemDSK & { _id: string } {
	if (!row || typeof row !== 'object') {
		return false
	}
	const value = row as Partial<TableConfigItemDSK> & { _id?: string }
	return (
		typeof value._id === 'string' &&
		['Number', 'Fill', 'Key', 'Clip', 'Gain'].every(key => {
			const field = value[key as keyof TableConfigItemDSK]
			return typeof field === 'number' && Number.isFinite(field)
		}) &&
		typeof value.Toggle === 'boolean' &&
		typeof value.DefaultOn === 'boolean' &&
		(value.UsePreconfigured === undefined || typeof value.UsePreconfigured === 'boolean') &&
		(value.SourceName === undefined || typeof value.SourceName === 'string')
	)
}

function prepareLegacySettings(context: MigrationContextStudio) {
	const deviceId = context.getConfig('M2LX.DeviceId')
	const json = context.getConfig('M2LX.Configuration')
	m2lxAssert(typeof json === 'string', 'the previous mixer configuration is missing')
	const config = parseM2LXConfiguration(json)
	if (
		(deviceId === undefined || deviceId === '') &&
		!config.sources.length &&
		!config.keyers.length &&
		!config.routers.length &&
		!config.compositionPips &&
		!config.wipe &&
		(context.getConfig('M2LX.EventId') === undefined || context.getConfig('M2LX.EventId') === '') &&
		(context.getConfig('M2LX.EventTimeout') === undefined || context.getConfig('M2LX.EventTimeout') === 0)
	) {
		return { emptyDefaults: true as const }
	}
	m2lxAssert(
		typeof deviceId === 'string' && deviceId.trim() === deviceId && deviceId,
		'select the existing mixer device before converting settings'
	)
	const device = context.getDevice(deviceId)
	m2lxAssert(
		device?.type === TSR.DeviceType.M2LX,
		'configure the existing M2L-X gateway device before converting settings'
	)
	m2lxAssert(device.disable === true && device.options, 'disable the mixer device before converting settings')
	const options = { ...device.options }
	const eventId = context.getConfig('M2LX.EventId')
	const eventTimeout = context.getConfig('M2LX.EventTimeout')
	m2lxAssert(eventId === undefined || typeof eventId === 'string', 'event selection must be a stable event ID')
	m2lxAssert(
		eventTimeout === undefined ||
			(typeof eventTimeout === 'number' && Number.isInteger(eventTimeout) && eventTimeout >= 0),
		'event timeout must be a non-negative number of milliseconds'
	)
	const oldEventId = typeof eventId === 'string' ? eventId.trim() || undefined : undefined
	const oldEventTimeout = typeof eventTimeout === 'number' ? eventTimeout || undefined : undefined
	for (const [key, value] of [
		['eventId', oldEventId],
		['eventTimeout', oldEventTimeout]
	] as const) {
		m2lxAssert(
			value === undefined || options[key] === undefined || options[key] === value,
			'event settings conflict with the gateway; reconcile them before converting'
		)
	}
	if (oldEventId !== undefined && options.eventId === undefined) {
		options.eventId = oldEventId
	}
	if (oldEventTimeout !== undefined && options.eventTimeout === undefined) {
		options.eventTimeout = oldEventTimeout
	}

	const settings: Array<[string, ConfigItemValue]> = [
		[
			'SwitcherInputNames',
			config.sources.map((row, index) => ({ _id: `input-${index}`, Input: row.input, Source: row.source }))
		],
		['SwitcherWipeEffect', Object.keys(M2LX_WIPE_EFFECTS).find(key => M2LX_WIPE_EFFECTS[key] === config.wipe)!]
	]
	for (const [key, value] of settings) {
		const existing = context.getConfig(key)
		const empty =
			existing === undefined ||
			(Array.isArray(existing) && !existing.length) ||
			(key === 'SwitcherWipeEffect' && existing === 'None')
		const withoutIds = (rows: ConfigItemValue) => (Array.isArray(rows) ? rows.map(row => _.omit(row, '_id')) : rows)
		m2lxAssert(
			empty || _.isEqual(withoutIds(existing!), withoutIds(value)),
			`${key} already contains different settings; reconcile them before converting`
		)
		if (!empty) {
			settings.find(row => row[0] === key)![1] = existing!
		}
	}
	const mappings: BlueprintMappings = {
		[M2LX_LAYER_PREFIX + SwitcherMixEffectLLayer.Program]: literal<TSR.MappingM2LXMixer & BlueprintMapping>({
			device: TSR.DeviceType.M2LX,
			deviceId,
			mappingType: TSR.MappingM2LXType.MIXER,
			lookahead: LookaheadMode.PRELOAD,
			lookaheadDepth: 1
		})
	}
	const dsks: unknown = context.getConfig('SwitcherSource.DSK') ?? []
	m2lxAssert(Array.isArray(dsks) && dsks.every(isDsk), 'the graphics settings must contain valid graphics rows')
	const updatedDsks = dsks.map(row => ({ ...row }))
	for (const row of config.keyers) {
		m2lxAssert(
			row.keyer.type !== TSR.M2LXKeyerType.PIP,
			'Split Screen boxes are managed on both buses; remove separate box mappings while inactive before converting'
		)
		mappings[M2LX_LAYER_PREFIX + row.layer] = literal<TSR.MappingM2LXKeyer & BlueprintMapping>({
			device: TSR.DeviceType.M2LX,
			deviceId,
			mappingType: TSR.MappingM2LXType.KEYER,
			bus: row.bus,
			keyer: row.keyer,
			lookahead: LookaheadMode.NONE
		})
		if (row.composition || row.source || row.preconfigured) {
			const dsk = updatedDsks.find(item => getDskLLayerName(item.Number) === row.layer)
			m2lxAssert(
				dsk && row.composition && row.preconfigured,
				'graphics preparation cannot be transferred automatically; reconcile the graphics settings first'
			)
			m2lxAssert(
				row.source === undefined || row.source.type === 'video',
				'the prepared graphics source requires manual conversion'
			)
			for (const key of ['Number', 'Fill', 'Key', 'Clip', 'Gain'] as const) {
				m2lxAssert(dsk[key] === row.composition[key], 'prepared graphics differ from the existing graphics settings')
			}
			m2lxAssert(
				dsk.UsePreconfigured !== false && (!dsk.SourceName || dsk.SourceName === row.source?.name),
				'graphics preparation conflicts with the existing graphics settings'
			)
			dsk.UsePreconfigured = true
			dsk.SourceName = row.source?.name ?? ''
		}
	}
	for (const row of config.routers) {
		mappings[M2LX_LAYER_PREFIX + row.layer] = literal<TSR.MappingM2LXRouter & BlueprintMapping>({
			device: TSR.DeviceType.M2LX,
			deviceId,
			mappingType: TSR.MappingM2LXType.ROUTER,
			node: row.node,
			output: row.output,
			lookahead: LookaheadMode.NONE
		})
	}
	for (const [layer, mapping] of Object.entries(mappings)) {
		const existing = context.getMapping(layer)
		m2lxAssert(!existing || _.isEqual(existing, mapping), `mapping ${layer} differs; reconcile manually while inactive`)
	}
	return {
		emptyDefaults: false as const,
		deviceId,
		options,
		settings,
		mappings,
		dsks: updatedDsks,
		dsksChanged: !_.isEqual(dsks, updatedDsks)
	}
}

export function m2lxMigrations(version: string): MigrationStepStudio[] {
	const legacyKeys = ['M2LX.DeviceId', 'M2LX.Configuration', 'M2LX.EventId', 'M2LX.EventTimeout']
	return [
		{
			id: `${version}.m2lx.sharedSettings`,
			version,
			canBeRunAutomatically: false,
			input: [
				{
					label: 'Confirm studio is inactive and mixer device disabled',
					description:
						'Stand down the studio and disable the mixer device. This converts the previous mixer settings to studio tables and normal layer mappings without changing existing destinations.',
					inputType: 'checkbox',
					attribute: 'inactiveConfirmed',
					defaultValue: false
				}
			],
			validate: context =>
				isM2LXSwitcher(context.getConfig('SwitcherType')) &&
				legacyKeys.some(key => context.getConfig(key) !== undefined)
					? 'Convert the previous M2L-X settings to shared studio settings. Gateway event settings and existing destinations are preserved.'
					: false,
			migrate: (context, input) => {
				if (
					!isM2LXSwitcher(context.getConfig('SwitcherType')) ||
					!legacyKeys.some(key => context.getConfig(key) !== undefined)
				) {
					return
				}
				m2lxAssert(input.inactiveConfirmed === true, 'explicit inactive studio confirmation is required')
				const prepared = prepareLegacySettings(context)
				if (prepared.emptyDefaults) {
					for (const key of legacyKeys) {
						context.removeConfig(key)
					}
					return
				}
				for (const [key, value] of prepared.settings) {
					context.setConfig(key, value)
				}
				if (prepared.dsksChanged) {
					context.setConfig('SwitcherSource.DSK', prepared.dsks)
				}
				for (const [layer, mapping] of Object.entries(prepared.mappings)) {
					if (!context.getMapping(layer)) {
						context.insertMapping(layer, mapping)
					}
				}
				context.updateDevice(prepared.deviceId, { options: prepared.options })
				for (const key of legacyKeys) {
					context.removeConfig(key)
				}
			}
		},
		{
			id: `${version}.m2lx.displayName`,
			version,
			canBeRunAutomatically: true,
			validate: context => (context.getConfig('SwitcherType') === 'M2LX' ? 'Update mixer name to M2L-X' : false),
			migrate: context => {
				if (context.getConfig('SwitcherType') === 'M2LX') {
					context.setConfig('SwitcherType', SwitcherType.M2LX)
				}
			}
		},
		{
			id: `${version}.m2lx.showStyleWipes`,
			version,
			dependOnResultFrom: `${version}.m2lx.sharedSettings`,
			canBeRunAutomatically: false,
			input: [
				{
					label: 'Confirm studio is inactive',
					description: 'Remove the previous studio-wide wipe selection.',
					inputType: 'checkbox',
					attribute: 'inactiveConfirmed',
					defaultValue: false
				},
				{
					label: 'Confirm show-style wipe directions have been set',
					description:
						'If a direction was previously selected, choose it under Default wipe direction in each show style that should retain it.',
					inputType: 'checkbox',
					attribute: 'showStylesConfirmed',
					defaultValue: false
				}
			],
			validate: context => {
				const direction = context.getConfig('SwitcherWipeEffect')
				return isM2LXSwitcher(context.getConfig('SwitcherType')) && direction !== undefined
					? `Wipe directions now belong to show styles. Previous studio selection: ${direction}. Configure the show-style defaults before removing it.`
					: false
			},
			migrate: (context, input) => {
				const direction = context.getConfig('SwitcherWipeEffect')
				if (!isM2LXSwitcher(context.getConfig('SwitcherType')) || direction === undefined) {
					return
				}
				m2lxAssert(input.inactiveConfirmed === true, 'explicit inactive studio confirmation is required')
				m2lxAssert(
					direction === 'None' || direction === '' || input.showStylesConfirmed === true,
					'confirm show-style wipe directions have been set before removing the previous selection'
				)
				context.removeConfig('SwitcherWipeEffect')
			}
		},
		{
			id: `${version}.m2lx.directInputs`,
			version,
			dependOnResultFrom: `${version}.m2lx.sharedSettings`,
			canBeRunAutomatically: false,
			input: [
				{
					label: 'Confirm studio is inactive and mixer device disabled',
					description:
						'Move the previous input-name bindings into the existing camera, live, player and default input settings. No mixer commands are sent. Check Split Screen backgrounds separately before playout.',
					inputType: 'checkbox',
					attribute: 'inactiveConfirmed',
					defaultValue: false
				},
				{
					label: 'Confirm Split Screen backgrounds have been checked',
					description:
						'For existing bindings, replace numeric backgrounds in all show style layouts and variants with exact source names, or remove those overrides to use the studio Split Screen background. The old bindings are removed after conversion; layout geometry is not changed.',
					inputType: 'checkbox',
					attribute: 'layoutsConfirmed',
					defaultValue: false
				}
			],
			validate: context =>
				isM2LXSwitcher(context.getConfig('SwitcherType')) && context.getConfig('SwitcherInputNames') !== undefined
					? 'Use source names directly in the existing video input settings and remove the separate input-name table.'
					: false,
			migrate: (context, input) => {
				if (
					!isM2LXSwitcher(context.getConfig('SwitcherType')) ||
					context.getConfig('SwitcherInputNames') === undefined
				) {
					return
				}
				m2lxAssert(input.inactiveConfirmed === true, 'explicit inactive studio confirmation is required')
				const bindings = context.getConfig('SwitcherInputNames')
				m2lxAssert(
					!Array.isArray(bindings) || !bindings.length || input.layoutsConfirmed === true,
					'confirm Split Screen backgrounds have been checked before removing the previous input bindings'
				)
				const settings = prepareDirectInputs(context)
				for (const [key, value] of settings) {
					context.setConfig(key, value)
				}
				context.removeConfig('SwitcherInputNames')
			}
		}
	]
}

function prepareDirectInputs(context: MigrationContextStudio): Array<[string, ConfigItemValue]> {
	const rows = context.getConfig('SwitcherInputNames')
	m2lxAssert(Array.isArray(rows), 'the previous input-name settings must be a table')
	const bindings = parseM2LXConfiguration(
		JSON.stringify({
			sources: rows.map(row => {
				m2lxAssert(
					row && typeof row === 'object' && !Array.isArray(row),
					'the previous input-name settings require valid rows'
				)
				return { input: row.Input, source: row.Source }
			}),
			keyers: [],
			routers: []
		})
	).sources
	if (!bindings.length) {
		return []
	}
	const mapping = context.getMapping(M2LX_LAYER_PREFIX + SwitcherMixEffectLLayer.Program)
	const device = mapping && context.getDevice(mapping.deviceId)
	m2lxAssert(
		mapping?.device === TSR.DeviceType.M2LX && device?.type === TSR.DeviceType.M2LX && device.disable === true,
		'disable the M2L-X device selected by the Program layer mapping before converting inputs'
	)
	const byInput = new Map(bindings.map(row => [row.input, row.source]))
	const names = new Set(bindings.map(row => row.source))
	const source = (value: ConfigItemValue, label: string): string => {
		if (typeof value === 'string') {
			m2lxAssert(value.trim().length > 0 && value === value.trim(), `${label} requires an exact source name`)
			if (!/^\d+$/.test(value)) {
				return value
			}
			const existingBinding = byInput.get(Number(value))
			m2lxAssert(
				!names.has(value) || existingBinding === undefined || existingBinding === value,
				`${label} is ambiguous: its numeric source name also refers to another input`
			)
			if (names.has(value)) {
				return value
			}
		}
		m2lxAssert(typeof value === 'number' || typeof value === 'string', `${label} requires a video input`)
		const bound = byInput.get(Number(value))
		m2lxAssert(
			bound !== undefined,
			`${label} input ${value} has no source name; complete the previous bindings before converting`
		)
		return bound
	}
	const settings: Array<[string, ConfigItemValue]> = []
	for (const key of [
		'SwitcherSource.Default',
		'SwitcherSource.SplitArtFill',
		'SwitcherSource.SplitArtKey',
		'SwitcherSource.SplitBackground',
		'SwitcherSource.Loop',
		'SwitcherSource.Continuity',
		'SwitcherSource.Dip',
		'IdleSource',
		'VizPilotGraphics.FullGraphicBackground'
	]) {
		const existing = context.getConfig(key)
		if (existing !== undefined) {
			const updated = source(existing, key)
			if (existing !== updated) {
				settings.push([key, updated])
			}
		}
	}
	for (const key of ['SourcesCam', 'SourcesRM', 'SourcesFeed', 'ABMediaPlayers', 'SwitcherSource.DSK']) {
		const existing = context.getConfig(key)
		if (existing === undefined) {
			continue
		}
		m2lxAssert(Array.isArray(existing), `${key} must be a table`)
		const columns = key === 'SwitcherSource.DSK' ? ['Fill', 'Key'] : ['SwitcherSource']
		const updated = existing.map(row => {
			m2lxAssert(row && typeof row === 'object', `${key} requires valid rows`)
			const result = { ...row }
			for (const column of columns) {
				m2lxAssert(row[column] !== undefined, `${key} requires ${column}`)
				result[column] = source(row[column], `${key} ${row._id} ${column}`)
			}
			return result
		})
		if (!_.isEqual(existing, updated)) {
			settings.push([key, updated])
		}
	}
	return settings
}
