import { ConfigManifestEntryTable, ConfigManifestEntryType, TSR } from 'blueprints-integration'
import { literal } from '../util'

export const SWITCHER_INPUT_DESCRIPTION =
	'Use an input number for ATEM or TriCaster. For M2L-X, use the input ID, for example ndi1 or vtr1, not its display name.'

export function switcherInputManifestType(
	allowNamedInputs: boolean,
	defaultVal: number
):
	| { type: ConfigManifestEntryType.STRING; defaultVal: string }
	| { type: ConfigManifestEntryType.INT; defaultVal: number } {
	return allowNamedInputs
		? { type: ConfigManifestEntryType.STRING, defaultVal: defaultVal.toString() }
		: { type: ConfigManifestEntryType.INT, defaultVal }
}

export function MakeConfigForSources(
	name: string,
	displayName: string,
	wantsToPersistAudio: boolean,
	acceptPersistAudio: boolean,
	defaultVal: ConfigManifestEntryTable['defaultVal'],
	allowNamedInputs = false
): ConfigManifestEntryTable {
	return {
		id: `Sources${name}`,
		name: `${displayName} Mapping`,
		description: `${displayName} number to Video Switcher input and Sisyfos layer`,
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
				id: 'SwitcherSource',
				name: 'Video Switcher input',
				description: allowNamedInputs ? SWITCHER_INPUT_DESCRIPTION : `Video Switcher input for ${displayName} input`,
				...switcherInputManifestType(allowNamedInputs, 0),
				required: true,
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
			...(wantsToPersistAudio
				? [
						literal<ConfigManifestEntryTable['columns'][0]>({
							id: 'WantsToPersistAudio',
							name: 'Wants To Persist Audio',
							description:
								'Tells the system that it wants to persist the audio. If the next piece accepts persistence, the audio will be persisted',
							type: ConfigManifestEntryType.BOOLEAN,
							required: true,
							defaultVal: false,
							rank: 4
						})
				  ]
				: []),
			...(acceptPersistAudio
				? [
						literal<ConfigManifestEntryTable['columns'][0]>({
							id: 'AcceptPersistAudio',
							name: 'Accept Persist Audio',
							description:
								'Accept the persistence of audio from the previous piece if that piece wants to persist audio',
							type: ConfigManifestEntryType.BOOLEAN,
							required: false,
							defaultVal: false,
							rank: 5
						})
				  ]
				: [])
		]
	}
}
