import { ConfigManifestEntry, ConfigManifestEntryType } from '@sofie-automation/blueprints-integration'

export function MakeConfigWithMediaFlow(
	name: string,
	defaultBasePath: string,
	defaultFlowId: string,
	defaultExtension: string
): ConfigManifestEntry[] {
	const namePlural = `${name}s`
	return [
		{
			id: `NetworkBasePath${name}`,
			name: `Network base path (${namePlural})`,
			description:
				'The base path for the Omneon network share. Needs to match the base path of the source in Media manager', // @todo: stupid dependency
			type: ConfigManifestEntryType.STRING,
			required: true,
			defaultVal: defaultBasePath
		},
		{
			id: `${name}MediaFlowId`,
			name: `Media Flow Id (${namePlural})`,
			description: '',
			type: ConfigManifestEntryType.STRING,
			required: true,
			defaultVal: defaultFlowId
		},
		{
			id: `${name}FileExtension`,
			name: `File extension (${namePlural})`,
			description: 'Default file extension to clips to fetch from Omneon and play at CasparCG',
			type: ConfigManifestEntryType.STRING,
			required: true,
			defaultVal: defaultExtension
		}
	]
}
