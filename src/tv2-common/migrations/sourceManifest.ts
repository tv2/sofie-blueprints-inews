import { ConfigManifestEntryTable, ConfigManifestEntryType, TSR } from '@tv2media/blueprints-integration'
import { literal } from '../util'

export function MakeConfigForSources(
	name: string,
	displayName: string,
	withKeepAudio: boolean,
	defaultVal: ConfigManifestEntryTable['defaultVal']
): ConfigManifestEntryTable {
	return literal<ConfigManifestEntryTable>({
		id: `Sources${name}`,
		name: `${displayName} Mapping`,
		description: `${displayName} number to ATEM input and Sisyfos layer`,
		type: ConfigManifestEntryType.TABLE,
		required: false,
		defaultVal,
		columns: [
			{
				id: 'SourceName',
				name: 'Name',
				description: `${displayName} name as typed in iNews`,
				type: ConfigManifestEntryType.STRING,
				required: true,
				defaultVal: '',
				rank: 0
			},
			{
				id: 'AtemSource',
				name: 'ATEM input',
				description: `ATEM vision mixer input for ${displayName} input`,
				type: ConfigManifestEntryType.INT,
				required: true,
				defaultVal: 0,
				rank: 1
			},
			{
				id: 'SisyfosLayers',
				name: 'Sisyfos layers',
				description: `Sisyfos layers for ${displayName} input`,
				type: ConfigManifestEntryType.LAYER_MAPPINGS,
				filters: {
					deviceTypes: [TSR.DeviceType.SISYFOS]
				},
				required: true,
				multiple: true,
				defaultVal: [],
				rank: 2
			},
			{
				id: 'StudioMics',
				name: 'Use Studio Mics',
				description: 'Add Sisyfos layers for Studio Mics',
				type: ConfigManifestEntryType.BOOLEAN,
				required: true,
				defaultVal: true,
				rank: 3
			},
			...(withKeepAudio
				? [
						literal<ConfigManifestEntryTable['columns'][0]>({
							id: 'KeepAudioInStudio',
							name: 'Keep audio in Studio',
							description: 'Keep audio in Studio',
							type: ConfigManifestEntryType.BOOLEAN,
							required: true,
							defaultVal: true,
							rank: 4
						})
				  ]
				: [])
		]
	})
}
