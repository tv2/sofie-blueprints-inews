import { ConfigManifestEntry, ConfigManifestEntryTable, ConfigManifestEntryType } from 'blueprints-integration'

export const GRAPHICS_SETUPS_TABLE_ID = 'GraphicsSetups'
export const GRAPHICS_SETUPS_NAME_COLUMN_ID = 'Name'

export const getGraphicsSetupsEntries = (columns: ConfigManifestEntryTable['columns']): ConfigManifestEntry[] => [
	{
		id: GRAPHICS_SETUPS_TABLE_ID,
		name: 'Graphics Setups',
		description: 'Possible graphics setups',
		type: ConfigManifestEntryType.TABLE,
		required: false,
		defaultVal: [],
		columns: [
			{
				id: 'Name',
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
	},
	{
		id: 'SelectedGraphicsSetupName',
		name: 'Graphic Setup name',
		description: 'Name of the Graphic Setup that should be used',
		type: ConfigManifestEntryType.SELECT_FROM_COLUMN,
		tableId: GRAPHICS_SETUPS_TABLE_ID,
		columnId: GRAPHICS_SETUPS_NAME_COLUMN_ID,
		multiple: false,
		required: false,
		defaultVal: ''
	}
]
