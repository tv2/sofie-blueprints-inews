import { ConfigItemValue, TableConfigItemValue } from 'blueprints-integration'
import { literal, StripFolderFromDVEConfig } from 'tv2-common'
import { MockShowstyleMigrationContext } from './migrationContext.mock'

const DVE_CONFIG_KEY = 'DVEStyles'

type StripDVEFolderMigrationTestCaseData = Array<{
	DVEName: string
	DVEGraphicsKeyPreMigration: string
	DVEGraphicsKeyPostMigration?: string
	DVEGraphicsFramePreMigration: string
	DVEGraphicsFramePostMigration?: string
}>

interface StripDVEFolderMigrationTestCase {
	description: string
	data: StripDVEFolderMigrationTestCaseData
	shouldMigrate: boolean
}

/**
 * Converts a test description into a TableConfigItemValue
 * @param description Array of test cases
 * @param step Whether this is pre-migration (validate) or post-migration
 */
function testDescriptionToConfig(
	description: StripDVEFolderMigrationTestCaseData,
	step: 'premigration' | 'postmigration'
): ConfigItemValue {
	const preMigration = step === 'premigration'
	return literal<TableConfigItemValue>(
		description.map((item) => ({
			_id: item.DVEName,
			DVEName: item.DVEName,
			DVEGraphicsKey: preMigration
				? item.DVEGraphicsKeyPreMigration
				: item.DVEGraphicsKeyPostMigration ?? item.DVEGraphicsKeyPreMigration,
			DVEGraphicsFrame: preMigration
				? item.DVEGraphicsFramePreMigration
				: item.DVEGraphicsFramePostMigration ?? item.DVEGraphicsFramePreMigration
		}))
	)
}

const normalizeSoundbedTests: StripDVEFolderMigrationTestCase[] = [
	{
		description: 'Does not migrate if no config exists',
		data: [],
		shouldMigrate: false
	},
	{
		description: 'Does not migrate if no values start with `dve/`',
		data: [
			{
				DVEName: '01',
				DVEGraphicsKeyPreMigration: 'dve01K',
				DVEGraphicsFramePreMigration: 'dve01'
			},
			{
				DVEName: '02',
				DVEGraphicsKeyPreMigration: 'dve02K',
				DVEGraphicsFramePreMigration: 'dve02'
			},
			{
				DVEName: '03',
				DVEGraphicsKeyPreMigration: 'dve03K',
				DVEGraphicsFramePreMigration: 'dve03'
			},
			{
				DVEName: '04',
				DVEGraphicsKeyPreMigration: 'dve04K',
				DVEGraphicsFramePreMigration: 'dve04'
			},
			{
				DVEName: '05',
				DVEGraphicsKeyPreMigration: 'dve05K',
				DVEGraphicsFramePreMigration: 'dve05'
			}
		],
		shouldMigrate: false
	},
	{
		description: 'Does not migrate if values contain `dve/` but do not start with `dve/`',
		data: [
			{
				DVEName: '01',
				DVEGraphicsKeyPreMigration: 'dve01 dve/K',
				DVEGraphicsFramePreMigration: 'dve01'
			},
			{
				DVEName: '02',
				DVEGraphicsKeyPreMigration: 'dve0dve/2K',
				DVEGraphicsFramePreMigration: 'dve02'
			},
			{
				DVEName: '03',
				DVEGraphicsKeyPreMigration: 'dve03Kdve/',
				DVEGraphicsFramePreMigration: 'dve03'
			},
			{
				DVEName: '04',
				DVEGraphicsKeyPreMigration: 'dve04K',
				DVEGraphicsFramePreMigration: 'dve04'
			},
			{
				DVEName: '05',
				DVEGraphicsKeyPreMigration: 'dve05K',
				DVEGraphicsFramePreMigration: 'dve05'
			}
		],
		shouldMigrate: false
	},
	{
		description: 'Does not migrate if value starts with `dve` but without a slash',
		data: [
			{
				DVEName: '01',
				DVEGraphicsKeyPreMigration: 'dve01K',
				DVEGraphicsFramePreMigration: 'dve01'
			},
			{
				DVEName: '02',
				DVEGraphicsKeyPreMigration: 'dve02K',
				DVEGraphicsFramePreMigration: 'dve02'
			},
			{
				DVEName: '03',
				DVEGraphicsKeyPreMigration: 'dve03K',
				DVEGraphicsFramePreMigration: 'dve03'
			},
			{
				DVEName: '04',
				DVEGraphicsKeyPreMigration: 'dve04K',
				DVEGraphicsFramePreMigration: 'dve04'
			},
			{
				DVEName: '05',
				DVEGraphicsKeyPreMigration: 'dve05K',
				DVEGraphicsFramePreMigration: 'dve05'
			}
		],
		shouldMigrate: false
	},
	{
		description: 'Does not migrate if DVE name column contains `dve/`, instead of asset',
		data: [
			{
				DVEName: 'dve/01',
				DVEGraphicsKeyPreMigration: 'dve01K',
				DVEGraphicsFramePreMigration: 'dve01'
			},
			{
				DVEName: 'dve/02',
				DVEGraphicsKeyPreMigration: 'dve02K',
				DVEGraphicsFramePreMigration: 'dve02'
			},
			{
				DVEName: '03',
				DVEGraphicsKeyPreMigration: 'dve03K',
				DVEGraphicsFramePreMigration: 'dve03'
			},
			{
				DVEName: '04',
				DVEGraphicsKeyPreMigration: 'dve04K',
				DVEGraphicsFramePreMigration: 'dve04'
			},
			{
				DVEName: 'dve/05',
				DVEGraphicsKeyPreMigration: 'dve05K',
				DVEGraphicsFramePreMigration: 'dve05'
			}
		],
		shouldMigrate: false
	},
	{
		description: 'Migrates if one value contains `dve/`',
		data: [
			{
				DVEName: '01',
				DVEGraphicsKeyPreMigration: 'dve/01K',
				DVEGraphicsFramePreMigration: 'dve01',
				DVEGraphicsKeyPostMigration: '01K'
			},
			{
				DVEName: '02',
				DVEGraphicsKeyPreMigration: 'dve02K',
				DVEGraphicsFramePreMigration: 'dve02'
			},
			{
				DVEName: '03',
				DVEGraphicsKeyPreMigration: 'dve03K',
				DVEGraphicsFramePreMigration: 'dve/dve03',
				DVEGraphicsFramePostMigration: 'dve03'
			},
			{
				DVEName: '04',
				DVEGraphicsKeyPreMigration: 'dve04K',
				DVEGraphicsFramePreMigration: 'dve04'
			},
			{
				DVEName: '05',
				DVEGraphicsKeyPreMigration: 'dve05K',
				DVEGraphicsFramePreMigration: 'dve05'
			}
		],
		shouldMigrate: true
	},
	{
		description: 'Migrates if more than one value contains `dve/`',
		data: [
			{
				DVEName: '01',
				DVEGraphicsKeyPreMigration: 'dve/01K',
				DVEGraphicsFramePreMigration: 'dve01',
				DVEGraphicsKeyPostMigration: '01K'
			},
			{
				DVEName: '02',
				DVEGraphicsKeyPreMigration: 'dve02K',
				DVEGraphicsFramePreMigration: 'dve02'
			},
			{
				DVEName: '03',
				DVEGraphicsKeyPreMigration: 'dve03K',
				DVEGraphicsFramePreMigration: 'dve03'
			},
			{
				DVEName: '04',
				DVEGraphicsKeyPreMigration: 'dve/dve04K',
				DVEGraphicsFramePreMigration: 'dve/dve04',
				DVEGraphicsKeyPostMigration: 'dve04K',
				DVEGraphicsFramePostMigration: 'dve04'
			},
			{
				DVEName: '05',
				DVEGraphicsKeyPreMigration: 'dve05K',
				DVEGraphicsFramePreMigration: 'dve05'
			}
		],
		shouldMigrate: true
	},
	{
		description: 'Migrates if all values contain `dve/`',
		data: [
			{
				DVEName: '01',
				DVEGraphicsKeyPreMigration: 'dve/dve01K',
				DVEGraphicsFramePreMigration: 'dve/dve01',
				DVEGraphicsKeyPostMigration: 'dve01K',
				DVEGraphicsFramePostMigration: 'dve01'
			},
			{
				DVEName: '02',
				DVEGraphicsKeyPreMigration: 'dve/dve02K',
				DVEGraphicsFramePreMigration: 'dve/dve02',
				DVEGraphicsKeyPostMigration: 'dve02K',
				DVEGraphicsFramePostMigration: 'dve02'
			},
			{
				DVEName: '03',
				DVEGraphicsKeyPreMigration: 'dve/dve03K',
				DVEGraphicsFramePreMigration: 'dve/dve03',
				DVEGraphicsKeyPostMigration: 'dve03K',
				DVEGraphicsFramePostMigration: 'dve03'
			},
			{
				DVEName: '04',
				DVEGraphicsKeyPreMigration: 'dve/dve04K',
				DVEGraphicsFramePreMigration: 'dve/dve04',
				DVEGraphicsKeyPostMigration: 'dve04K',
				DVEGraphicsFramePostMigration: 'dve04'
			},
			{
				DVEName: '05',
				DVEGraphicsKeyPreMigration: 'dve/dve05K',
				DVEGraphicsFramePreMigration: 'dve/dve05',
				DVEGraphicsKeyPostMigration: 'dve05K',
				DVEGraphicsFramePostMigration: 'dve05'
			}
		],
		shouldMigrate: true
	}
]

describe('Remove dve folder from dve config', () => {
	normalizeSoundbedTests.forEach((testDescription) => {
		test(testDescription.description, () => {
			const context = new MockShowstyleMigrationContext()
			context.configs.set(DVE_CONFIG_KEY, testDescriptionToConfig(testDescription.data, 'premigration'))
			const migration = StripFolderFromDVEConfig('0.0.0', 'test')
			expect(migration.validate(context, false)).toEqual(testDescription.shouldMigrate)

			if (testDescription.shouldMigrate) {
				migration.migrate!(context, {})
			}

			expect(context.configs.get(DVE_CONFIG_KEY)).toEqual(
				testDescriptionToConfig(testDescription.data, 'postmigration')
			)
		})
	})
})
