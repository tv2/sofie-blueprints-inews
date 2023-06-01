import { ConfigManifestEntry, ConfigManifestEntryTable, ConfigManifestEntryType } from 'blueprints-integration'
import { DEFAULT_GRAPHICS } from '../migrations'

export enum ShowStyleConfigId {
	GRAPHICS_SETUPS_TABLE_ID = 'GfxSetups',
	GRAPHICS_SETUPS_NAME_COLUMN_ID = 'Name',
	GFX_DEFAULTS_TABLE_ID = 'GfxDefaults',
	GFX_DEFAULTS_SELECTED_GFX_SETUP_NAME_COLUMN_ID = 'DefaultSetupName',
	GFX_DEFAULTS_SCHEMA_COLUMN_ID = 'DefaultSchema',
	GFX_DEFAULTS_DESIGN_COLUMN_ID = 'DefaultDesign',
	GFX_SHOW_MAPPING_TABLE_ID = 'GfxShowMapping',
	GFX_SHOW_MAPPING_DESIGN_COLUMN_ID = 'Design',
	GFX_SHOW_MAPPING_GFX_SETUP_COLUMN_ID = 'GfxSetup',
	GFX_SHOW_MAPPING_SCHEMA_COLUMN_ID = 'Schema'
}

export const getGfxSetupsEntries = (columns: ConfigManifestEntryTable['columns']): ConfigManifestEntry[] => [
	{
		id: ShowStyleConfigId.GRAPHICS_SETUPS_TABLE_ID,
		name: 'GFX Setups',
		description: 'Possible GFX setups',
		type: ConfigManifestEntryType.TABLE,
		required: false,
		defaultVal: [],
		columns: [
			{
				id: ShowStyleConfigId.GRAPHICS_SETUPS_NAME_COLUMN_ID,
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

const DESIGN_TABLE_ID = 'GfxDesignTemplates'
const DESIGN_NAME_COLUMN_ID = 'INewsName'

export const gfxDesignTemplates: ConfigManifestEntry[] = [
	{
		id: DESIGN_TABLE_ID,
		name: 'GFX Design Templates',
		description: '',
		type: ConfigManifestEntryType.TABLE,
		required: true,
		defaultVal: DEFAULT_GRAPHICS.map((val) => ({ _id: '', ...val })).filter((template) => template.IsDesign),
		columns: [
			{
				id: DESIGN_NAME_COLUMN_ID,
				name: 'iNews Name',
				description: 'The name of the design',
				type: ConfigManifestEntryType.STRING,
				required: false,
				defaultVal: '',
				rank: 0
			},
			{
				id: 'INewsStyleColumn',
				name: 'iNews Style Column',
				description: 'The selected style',
				type: ConfigManifestEntryType.STRING,
				required: false,
				defaultVal: '',
				rank: 1
			},
			{
				id: 'VizTemplate',
				name: 'GFX Template Name',
				description: 'The name of the Viz Template',
				type: ConfigManifestEntryType.STRING,
				required: true,
				defaultVal: '',
				rank: 2
			}
		]
	}
]

const GFX_SCHEMA_TABLE_ID = 'GfxSchemaTemplates'
const GFX_SCHEMA_NAME_COLUMN_ID = 'GfxSchemaTemplatesName'

export const gfxSchemaTemplates: ConfigManifestEntry[] = [
	{
		id: GFX_SCHEMA_TABLE_ID,
		name: 'GFX Skema Templates',
		description: 'The values for the Skema and Design combinations',
		type: ConfigManifestEntryType.TABLE,
		required: false,
		defaultVal: [],
		columns: [
			{
				id: GFX_SCHEMA_NAME_COLUMN_ID,
				name: 'iNews Name',
				description: 'The name of the design',
				type: ConfigManifestEntryType.STRING,
				required: false,
				defaultVal: '',
				rank: 0
			},
			{
				id: 'INewsSkemaColumn',
				name: 'iNews Skema Column',
				description: 'The selected skema',
				type: ConfigManifestEntryType.STRING,
				required: false,
				defaultVal: '',
				rank: 1
			},
			{
				id: 'VizTemplate',
				name: 'GFX Template Name',
				description: 'The name of the Viz Template',
				type: ConfigManifestEntryType.STRING,
				required: true,
				defaultVal: '',
				rank: 2
			},
			{
				id: 'CasparCgDesignValues',
				name: 'CasparCG Design Values',
				description:
					'A JSON array containing color values and background loops for the different Designs of the Schema used by CasparCG',
				type: ConfigManifestEntryType.JSON,
				required: false,
				defaultVal: '',
				rank: 3
			}
		]
	}
]

export const gfxShowMapping: ConfigManifestEntry = {
	id: 'GfxShowMapping',
	name: 'GFX Show mapping',
	description:
		'Maps Overlay Shows to the variety of Skemas and Designs. If a Setup does not have a corresponding Design/Skema, it should be left out of this table.',
	type: ConfigManifestEntryType.TABLE,
	required: false,
	defaultVal: [],
	columns: [
		{
			id: ShowStyleConfigId.GFX_SHOW_MAPPING_DESIGN_COLUMN_ID,
			name: 'Design',
			rank: 0,
			description: 'Name of the Design from the GFX Design table',
			type: ConfigManifestEntryType.SELECT_FROM_COLUMN,
			tableId: DESIGN_TABLE_ID,
			columnId: DESIGN_NAME_COLUMN_ID,
			multiple: false,
			required: false,
			defaultVal: ''
		},
		{
			id: ShowStyleConfigId.GFX_SHOW_MAPPING_GFX_SETUP_COLUMN_ID,
			name: 'GFX Setup',
			rank: 1,
			description: 'Names of the GFX Setups',
			type: ConfigManifestEntryType.SELECT_FROM_COLUMN,
			tableId: ShowStyleConfigId.GRAPHICS_SETUPS_TABLE_ID,
			columnId: ShowStyleConfigId.GRAPHICS_SETUPS_NAME_COLUMN_ID,
			multiple: true,
			required: false,
			defaultVal: []
		},
		{
			id: ShowStyleConfigId.GFX_SHOW_MAPPING_SCHEMA_COLUMN_ID,
			name: 'GFX Skema Templates',
			rank: 2,
			description: 'Names of the Skemas',
			type: ConfigManifestEntryType.SELECT_FROM_COLUMN,
			tableId: GFX_SCHEMA_TABLE_ID,
			columnId: GFX_SCHEMA_NAME_COLUMN_ID,
			multiple: true,
			required: false,
			defaultVal: []
		}
	]
}

const GFX_DEFAULT_VALUES = {
	DefaultSetupName: '',
	DefaultSchema: '',
	DefaultDesign: ''
}

export const getGfxDefaults: ConfigManifestEntryTable = {
	id: ShowStyleConfigId.GFX_DEFAULTS_TABLE_ID,
	name: 'GFX Defaults',
	description: 'The default values available for the GFX setup',
	type: ConfigManifestEntryType.TABLE,
	required: false,
	defaultVal: [{ _id: '', ...GFX_DEFAULT_VALUES }],
	disableRowManipulation: true,
	columns: [
		{
			id: ShowStyleConfigId.GFX_DEFAULTS_SELECTED_GFX_SETUP_NAME_COLUMN_ID,
			name: 'GFX Setup',
			rank: 0,
			description: 'Name of the GFX Setup',
			type: ConfigManifestEntryType.SELECT_FROM_COLUMN,
			tableId: ShowStyleConfigId.GRAPHICS_SETUPS_TABLE_ID,
			columnId: ShowStyleConfigId.GRAPHICS_SETUPS_NAME_COLUMN_ID,
			multiple: false,
			required: true,
			defaultVal: ''
		},
		{
			id: ShowStyleConfigId.GFX_DEFAULTS_SCHEMA_COLUMN_ID,
			name: 'Default Skema',
			rank: 1,
			description: 'The Skema options based on the GFX Setup',
			type: ConfigManifestEntryType.SELECT_FROM_TABLE_ENTRY_WITH_COMPARISON_MAPPINGS,
			comparisonMappings: [
				{
					targetColumnId: ShowStyleConfigId.GFX_DEFAULTS_SELECTED_GFX_SETUP_NAME_COLUMN_ID,
					sourceColumnId: ShowStyleConfigId.GFX_SHOW_MAPPING_GFX_SETUP_COLUMN_ID
				}
			],
			sourceTableId: ShowStyleConfigId.GFX_SHOW_MAPPING_TABLE_ID,
			sourceColumnIdWithValue: ShowStyleConfigId.GFX_SHOW_MAPPING_SCHEMA_COLUMN_ID,
			multiple: false,
			required: false,
			defaultVal: ''
		},
		{
			id: ShowStyleConfigId.GFX_DEFAULTS_DESIGN_COLUMN_ID,
			name: 'Default Design',
			rank: 2,
			description: 'The Design options based on the Default Skema or GFX Setup',
			type: ConfigManifestEntryType.SELECT_FROM_TABLE_ENTRY_WITH_COMPARISON_MAPPINGS,
			comparisonMappings: [
				{
					targetColumnId: ShowStyleConfigId.GFX_DEFAULTS_SCHEMA_COLUMN_ID,
					sourceColumnId: ShowStyleConfigId.GFX_SHOW_MAPPING_SCHEMA_COLUMN_ID
				},
				{
					targetColumnId: ShowStyleConfigId.GFX_DEFAULTS_SELECTED_GFX_SETUP_NAME_COLUMN_ID,
					sourceColumnId: ShowStyleConfigId.GFX_SHOW_MAPPING_GFX_SETUP_COLUMN_ID
				}
			],
			sourceTableId: ShowStyleConfigId.GFX_SHOW_MAPPING_TABLE_ID,
			sourceColumnIdWithValue: ShowStyleConfigId.GFX_SHOW_MAPPING_DESIGN_COLUMN_ID,
			multiple: false,
			required: false,
			defaultVal: ''
		}
	]
}
