import { ConfigManifestEntry, ConfigManifestEntryTable, ConfigManifestEntryType } from 'blueprints-integration'
import { TableConfigItemGfxDefaults } from '../blueprintConfig'

export enum CommonConfigId {
	GRAPHICS_SETUPS_TABLE_ID = 'GfxSetups',
	GRAPHICS_SETUPS_NAME_COLUMN_ID = 'Name',
	GFX_DEFAULTS_TABLE_ID = 'GfxDefaults',
	DEFAULTS_SELECTED_GFX_SETUP_NAME_COLUMN_ID = 'DefaultSetupName',
	DEFAULTS_SCHEMA_COLUMN_ID = 'DefaultSchema',
	DEFAULTS_DESIGN_COLUMN_ID = 'DefaultDesign',
	GFX_SHOW_MAPPING_TABLE_ID = 'GfxShowMapping',
	GFX_SHOW_MAPPING_DESIGN_COLUMN_ID = 'Design',
	GFX_SHOW_MAPPING_GFX_SETUP_COLUMN_ID = 'GfxSetup',
	GFX_SHOW_MAPPING_SCHEMA_COLUMN_ID = 'Schema'
}

export const getGfxSetupsEntries = (columns: ConfigManifestEntryTable['columns']): ConfigManifestEntry[] => [
	{
		id: CommonConfigId.GRAPHICS_SETUPS_TABLE_ID,
		name: 'GFX Setups',
		description: 'Possible GFX setups',
		type: ConfigManifestEntryType.TABLE,
		required: false,
		defaultVal: [],
		columns: [
			{
				id: CommonConfigId.GRAPHICS_SETUPS_NAME_COLUMN_ID,
				name: 'Name',
				description: 'The code as it will appear in iNews',
				type: ConfigManifestEntryType.STRING,
				required: true,
				defaultVal: '',
				rank: 0
			},
			{
				id: 'HtmlPackageFolder',
				name: 'HTML Package Folder',
				rank: 4,
				required: true,
				defaultVal: '',
				description:
					'Name of the folder containing the HTML graphics template package, relative to the template-path in CasparCG, e.g. sport-overlay',
				type: ConfigManifestEntryType.STRING
			},
			...columns
		],
		hint: ''
	}
]

export const GFX_DEFAULT_VALUES: TableConfigItemGfxDefaults[] = [
	{
		GfxSetup: '',
		DefaultSchema: [''],
		DefaultDesign: ['']
	}
]

export const getGfxDefaults: ConfigManifestEntry = {
	id: CommonConfigId.GFX_DEFAULTS_TABLE_ID,
	name: 'GFX Defaults',
	description: 'The possible defaults available for the GFX setup',
	type: ConfigManifestEntryType.TABLE,
	required: false,
	defaultVal: GFX_DEFAULT_VALUES.map(gfxDefaultValue => ({ _id: '', ...gfxDefaultValue })),
	disableRowManipulation: true,
	columns: [
		{
			id: CommonConfigId.DEFAULTS_SELECTED_GFX_SETUP_NAME_COLUMN_ID,
			name: 'GFX Setup',
			rank: 0,
			description: 'Name of the GFX Setup',
			type: ConfigManifestEntryType.SELECT_FROM_COLUMN,
			tableId: CommonConfigId.GRAPHICS_SETUPS_TABLE_ID,
			columnId: CommonConfigId.GRAPHICS_SETUPS_NAME_COLUMN_ID,
			multiple: false,
			required: true,
			defaultVal: ''
		},
		{
			id: CommonConfigId.DEFAULTS_SCHEMA_COLUMN_ID,
			name: 'Default Skema',
			rank: 1,
			description: 'The Skema options based on the GFX Setup',
			type: ConfigManifestEntryType.FILTER_DEFAULTS_FROM_SHOW_MAPPING,
			targetTableId: CommonConfigId.GFX_DEFAULTS_TABLE_ID,
			targetCompareColumnId: CommonConfigId.DEFAULTS_SELECTED_GFX_SETUP_NAME_COLUMN_ID,
			sourceTableId: CommonConfigId.GFX_SHOW_MAPPING_TABLE_ID,
			sourceCompareColumnId: CommonConfigId.GFX_SHOW_MAPPING_GFX_SETUP_COLUMN_ID,
			sourceCollectColumnId: CommonConfigId.GFX_SHOW_MAPPING_SCHEMA_COLUMN_ID,
			multiple: false,
			required: false,
			defaultVal: ''
		},
		{
			id: CommonConfigId.DEFAULTS_DESIGN_COLUMN_ID,
			name: 'Default Design',
			rank: 2,
			description: 'The Design options based on the Default Skema or GFX Setup',
			type: ConfigManifestEntryType.FILTER_DEFAULTS_FROM_SHOW_MAPPING,
			targetTableId: CommonConfigId.GFX_DEFAULTS_TABLE_ID,
			targetCompareColumnId: CommonConfigId.DEFAULTS_SCHEMA_COLUMN_ID,
			sourceTableId: CommonConfigId.GFX_SHOW_MAPPING_TABLE_ID,
			sourceCompareColumnId: CommonConfigId.GFX_SHOW_MAPPING_SCHEMA_COLUMN_ID,
			sourceCollectColumnId: CommonConfigId.GFX_SHOW_MAPPING_DESIGN_COLUMN_ID,
			multiple: false,
			required: false,
			defaultVal: ''
		}
	]
}
