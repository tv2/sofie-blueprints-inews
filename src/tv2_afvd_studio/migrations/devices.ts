import {
	MigrationContextStudio,
	MigrationStepInput,
	MigrationStepInputFilteredResult,
	MigrationStepStudio,
	TSR
} from '@tv2media/blueprints-integration'
import { literal } from 'tv2-common'
import * as _ from 'underscore'

declare const VERSION: string // Injected by webpack

interface DeviceEntry {
	id: string
	firstVersion: string
	type: TSR.DeviceType
	defaultValue: (
		input: MigrationStepInputFilteredResult,
		context: MigrationContextStudio
	) => TSR.DeviceOptionsAny | undefined
	input?: MigrationStepInput[]
	validate?: (device: TSR.DeviceOptionsAny) => string | boolean
	createDependsOn?: string
	createCondition?: (context: MigrationContextStudio) => boolean
}

function validateDevice(spec: DeviceEntry): MigrationStepStudio {
	return {
		id: `Playout-gateway.${spec.id}.validate`,
		version: VERSION,
		canBeRunAutomatically: false,
		validate: (context: MigrationContextStudio) => {
			const dev = context.getDevice(spec.id)
			if (!dev) {
				return false
			}
			if (dev.type !== spec.type) {
				return `Type is not "${TSR.DeviceType[spec.type]}"`
			}

			if (spec.validate) {
				return spec.validate(dev)
			}

			return false
		},
		input: [
			{
				label: `Playout-gateway: device "${spec.id}" misconfigured`,
				description: `Go into the settings of the Playout-gateway and setup the device "${spec.id}". ($validation)`,
				inputType: null,
				attribute: null
			}
		]
	}
}
function createDevice(spec: DeviceEntry): MigrationStepStudio {
	return {
		id: `Playout-gateway.${spec.id}.create`,
		version: spec.firstVersion,
		canBeRunAutomatically: spec.input === undefined,
		validate: (context: MigrationContextStudio) => {
			if (spec.createCondition && !spec.createCondition(context)) {
				return false
			}

			const dev = context.getDevice(spec.id)
			if (!dev) {
				return `"${spec.id}" missing`
			}

			return false
		},
		migrate: (context: MigrationContextStudio, input: MigrationStepInputFilteredResult) => {
			if (spec.createCondition && !spec.createCondition(context)) {
				return
			}

			const dev = context.getDevice(spec.id)
			if (!dev) {
				const options = spec.defaultValue(input, context)
				if (options) {
					context.insertDevice(spec.id, options)
				}
			}
		},
		input: spec.input,
		dependOnResultFrom: spec.createDependsOn
	}
}

const devices: DeviceEntry[] = [
	{
		id: 'abstract0',
		firstVersion: '0.1.0',
		type: TSR.DeviceType.ABSTRACT,
		defaultValue: () => ({
			type: TSR.DeviceType.ABSTRACT,
			options: {}
		})
	},
	{
		id: 'caspar01',
		firstVersion: '0.1.0',
		type: TSR.DeviceType.CASPARCG,
		defaultValue: input => ({
			type: TSR.DeviceType.CASPARCG,
			options: {
				host: input.host,
				port: 5250,
				launcherHost: input.host,
				launcherPort: 8005
			}
		}),
		input: [
			{
				label: 'Device config caspar01: Host',
				description: 'Enter the Host paramter, example: "127.0.0.1"',
				inputType: 'text',
				attribute: 'host',
				defaultValue: undefined
			}
		],
		validate: device => {
			if (!device.options) {
				return 'Missing options'
			}

			const opts = device.options as any
			if (!opts.host) {
				return 'Host is not set'
			}
			if (!opts.launcherHost) {
				return 'Launcher host is not set'
			}

			return false
		},
		createDependsOn: 'studioConfig.DevicePrefix'
	},
	{
		id: 'caspar01-launcher',
		firstVersion: '0.1.0',
		type: TSR.DeviceType.HTTPWATCHER,
		defaultValue: (_input: MigrationStepInputFilteredResult, context: MigrationContextStudio) => {
			const mainDev = context.getDevice('caspar01')
			if (mainDev && mainDev.options) {
				const mainOpts = mainDev.options as any
				if (mainOpts.launcherHost) {
					return {
						type: TSR.DeviceType.HTTPWATCHER,
						options: {
							uri: `http://${mainOpts.launcherHost}:${mainOpts.launcherPort || 8005}/processes`,
							httpMethod: 'GET',
							expectedHttpResponse: 200,
							interval: 30000
						}
					}
				}
			}
			return undefined
		},
		validate: device => {
			if (!device.options) {
				return 'Missing options'
			}

			const opts = device.options as any
			if (!opts.uri) {
				return 'URI is not set'
			}
			if (!opts.httpMethod) {
				return 'HTTP Method is not set'
			}
			if (!opts.expectedHttpResponse) {
				return 'Expected response is not set'
			}
			if (!opts.interval) {
				return 'Inteval is not set'
			}

			return false
		},
		createDependsOn: 'Playout-gateway.caspar01.create'
	},
	{
		id: 'atem0',
		firstVersion: '0.1.0',
		type: TSR.DeviceType.ATEM,
		defaultValue: input => ({
			type: TSR.DeviceType.ATEM,
			options: {
				host: input.host,
				port: 9910
			}
		}),
		input: [
			{
				label: 'Device config atem0: Host',
				description: 'Enter the Host paramter, example: "127.0.0.1"',
				inputType: 'text',
				attribute: 'host',
				defaultValue: undefined
			}
		],
		validate: device => {
			if (!device.options) {
				return 'Missing options'
			}

			const opts = device.options as any
			if (!opts.host) {
				return 'Host is not set'
			}

			return false
		}
	}
]

export const deviceMigrations = literal<MigrationStepStudio[]>([
	// create all devices
	..._.map(devices, createDevice),

	// ensure all devices still look valid
	..._.map(devices, validateDevice)
])
