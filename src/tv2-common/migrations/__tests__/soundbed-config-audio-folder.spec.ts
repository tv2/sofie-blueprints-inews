import { ConfigItemValue, TableConfigItemValue } from 'blueprints-integration'
import { literal, StripFolderFromAudioBedConfig } from 'tv2-common'
import { MockShowstyleMigrationContext } from './migrationContext.mock'

const AUDIO_BED_CONFIG_KEY = 'LYDConfig'

type StripAudioFolderMigrationTestCaseData = Array<{
	iNewsName: string
	PreMigration: string
	PostMigration?: string
}>

interface StripAudioFolderMigrationTestCase {
	description: string
	data: StripAudioFolderMigrationTestCaseData
	shouldMigrate: boolean
}

/**
 * Converts a test description into a TableConfigItemValue
 * @param description Array of test cases
 * @param step Whether this is pre-migration (validate) or post-migration
 */
function testDescriptionToConfig(
	description: StripAudioFolderMigrationTestCaseData,
	step: 'premigration' | 'postmigration'
): ConfigItemValue {
	const preMigration = step === 'premigration'
	return literal<TableConfigItemValue>(
		description.map((item) => ({
			_id: item.iNewsName,
			INewsName: item.iNewsName,
			FileName: preMigration ? item.PreMigration : item.PostMigration ?? item.PreMigration
		}))
	)
}

const normalizeSoundbedTests: StripAudioFolderMigrationTestCase[] = [
	{
		description: 'Does not migrate if no config exists',
		data: [],
		shouldMigrate: false
	},
	{
		description: 'Does not migrate if no values start with `audio/`',
		data: [
			{
				iNewsName: '01',
				PreMigration: 'TV 2 soundbed 1'
			},
			{
				iNewsName: '02',
				PreMigration: 'TV 2 soundbed 2'
			},
			{
				iNewsName: '03',
				PreMigration: 'TV 2 soundbed 3'
			},
			{
				iNewsName: '04',
				PreMigration: 'TV 2 soundbed 4'
			},
			{
				iNewsName: '05',
				PreMigration: 'TV 2 soundbed 5'
			}
		],
		shouldMigrate: false
	},
	{
		description: 'Does not migrate if values contain `audio/` but do not start with `audio/`',
		data: [
			{
				iNewsName: '01',
				PreMigration: 'TV 2 audio/soundbed 1'
			},
			{
				iNewsName: '02',
				PreMigration: 'TV 2 soundbed 2'
			},
			{
				iNewsName: '03',
				PreMigration: 'TV audio/2 soundbed 3'
			},
			{
				iNewsName: '04',
				PreMigration: 'TV 2 soundbed 4'
			},
			{
				iNewsName: '05',
				PreMigration: 'TV 2 soundbed audio/5'
			}
		],
		shouldMigrate: false
	},
	{
		description: 'Does not migrate if value starts with `audio` but without a slash',
		data: [
			{
				iNewsName: '01',
				PreMigration: 'audio TV 2 soundbed 1'
			},
			{
				iNewsName: '02',
				PreMigration: 'audioTV 2 soundbed 2'
			},
			{
				iNewsName: '03',
				PreMigration: 'audiofileTV 2 soundbed 3'
			},
			{
				iNewsName: '04',
				PreMigration: 'audio_TV 2 soundbed 4'
			},
			{
				iNewsName: '05',
				PreMigration: 'audio\\TV 2 soundbed 5'
			}
		],
		shouldMigrate: false
	},
	{
		description: 'Does not migrate if iNews column contains `audio/`, instead of filename',
		data: [
			{
				iNewsName: 'audio/01',
				PreMigration: 'TV 2 soundbed 1'
			},
			{
				iNewsName: '0 audio/ 2',
				PreMigration: 'TV 2 soundbed 2'
			},
			{
				iNewsName: '03 audio/',
				PreMigration: 'TV 2 soundbed 3'
			},
			{
				iNewsName: '04',
				PreMigration: 'TV 2 soundbed 4'
			},
			{
				iNewsName: '05',
				PreMigration: 'TV 2 soundbed 5'
			}
		],
		shouldMigrate: false
	},
	{
		description: 'Migrates if one value contains `audio/`',
		data: [
			{
				iNewsName: '01',
				PreMigration: 'TV 2 soundbed 1'
			},
			{
				iNewsName: '02',
				PreMigration: 'TV 2 soundbed 2'
			},
			{
				iNewsName: '03',
				PreMigration: 'audio/TV 2 soundbed 3',
				PostMigration: 'TV 2 soundbed 3'
			},
			{
				iNewsName: '04',
				PreMigration: 'TV 2 soundbed 4'
			},
			{
				iNewsName: '05',
				PreMigration: 'TV 2 soundbed 5'
			}
		],
		shouldMigrate: true
	},
	{
		description: 'Migrates if more than one value contains `audio/`',
		data: [
			{
				iNewsName: '01',
				PreMigration: 'audio/TV 2 soundbed 1',
				PostMigration: 'TV 2 soundbed 1'
			},
			{
				iNewsName: '02',
				PreMigration: 'TV 2 soundbed 2'
			},
			{
				iNewsName: '03',
				PreMigration: 'TV 2 soundbed 3'
			},
			{
				iNewsName: '04',
				PreMigration: 'audio/TV 2 soundbed 4',
				PostMigration: 'TV 2 soundbed 4'
			},
			{
				iNewsName: '05',
				PreMigration: 'audio/TV 2 soundbed 5',
				PostMigration: 'TV 2 soundbed 5'
			}
		],
		shouldMigrate: true
	},
	{
		description: 'Migrates if all values contain `audio/`',
		data: [
			{
				iNewsName: '01',
				PreMigration: 'audio/TV 2 soundbed 1',
				PostMigration: 'TV 2 soundbed 1'
			},
			{
				iNewsName: '02',
				PreMigration: 'audio/TV 2 soundbed 2',
				PostMigration: 'TV 2 soundbed 2'
			},
			{
				iNewsName: '03',
				PreMigration: 'audio/TV 2 soundbed 3',
				PostMigration: 'TV 2 soundbed 3'
			},
			{
				iNewsName: '04',
				PreMigration: 'audio/TV 2 soundbed 4',
				PostMigration: 'TV 2 soundbed 4'
			},
			{
				iNewsName: '05',
				PreMigration: 'audio/TV 2 soundbed 5',
				PostMigration: 'TV 2 soundbed 5'
			}
		],
		shouldMigrate: true
	}
]

describe('Remove audio folder from soundbed config', () => {
	normalizeSoundbedTests.forEach((testDescription) => {
		test(testDescription.description, () => {
			const context = new MockShowstyleMigrationContext()
			context.configs.set(AUDIO_BED_CONFIG_KEY, testDescriptionToConfig(testDescription.data, 'premigration'))
			const migration = StripFolderFromAudioBedConfig('0.0.0', 'test')
			expect(migration.validate(context, false)).toEqual(testDescription.shouldMigrate)

			if (testDescription.shouldMigrate) {
				migration.migrate!(context, {})
			}

			expect(context.configs.get(AUDIO_BED_CONFIG_KEY)).toEqual(
				testDescriptionToConfig(testDescription.data, 'postmigration')
			)
		})
	})
})
