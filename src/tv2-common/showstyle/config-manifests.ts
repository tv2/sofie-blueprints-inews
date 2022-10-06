import {
	ConfigManifestEntry,
	ConfigManifestEntryTable,
	ConfigManifestEntryType
} from '@tv2media/blueprints-integration'

export const getGraphicsSetupsEntries = (columns: ConfigManifestEntryTable['columns']): ConfigManifestEntry[] => [
	{
		id: 'GraphicsSetups',
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
				id: 'OvlShowName',
				name: 'Overlay Show Name',
				rank: 1,
				required: true,
				defaultVal: '',
				hint: '',
				description: 'Name of the show used for OVL channel',
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
		type: ConfigManifestEntryType.STRING,
		required: false,
		defaultVal: ''
	}
]
