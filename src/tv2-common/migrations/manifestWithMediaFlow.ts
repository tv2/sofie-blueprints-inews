import { ConfigManifestEntry, ConfigManifestEntryType } from 'blueprints-integration'

export function MakeConfigWithMediaFlow(
	name: string,
	_defaultBasePath: string,
	_defaultFlowId: string,
	_defaultExtension: string,
	_defaultFolder: string,
	_ignoreMediaStatus: boolean // Temp until galleries use same media workflow
): ConfigManifestEntry[] {
	const namePlural = `${name}s`
	return [
		{
			id: `${name}NetworkBasePath`,
			name: `Network base path (${namePlural})`,
			description:
				'The base path for the Omneon network share. Needs to match the base path of the source in Media manager', // @todo: stupid dependency
			type: ConfigManifestEntryType.STRING,
			required: true
			// defaultVal: defaultBasePath // TODO C
		},
		{
			id: `${name}MediaFlowId`,
			name: `Media Flow Id (${namePlural})`,
			description: '',
			type: ConfigManifestEntryType.STRING,
			required: true
			// defaultVal: defaultFlowId // TODO C
		},
		{
			id: `${name}FileExtension`,
			name: `File extension (${namePlural})`,
			description: 'Default file extension to clips to fetch from Omneon and play at CasparCG',
			type: ConfigManifestEntryType.STRING,
			required: true
			// defaultVal: defaultExtension // TODO C
		},
		{
			id: `${name}Folder`,
			name: `Folder for ${namePlural}`,
			description: `Subfolder to retrieve / store ${namePlural} in`,
			type: ConfigManifestEntryType.STRING,
			required: false
			// defaultVal: defaultFolder // TODO C
		},
		{
			id: `${name}IgnoreStatus`,
			name: `Ignore media status for ${namePlural}`,
			description: `If set, don't show missing media stripes`,
			type: ConfigManifestEntryType.BOOLEAN,
			required: true
			// defaultVal: ignoreMediaStatus // TODO C
		}
	]
}
