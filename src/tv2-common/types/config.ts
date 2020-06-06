export interface TableConfigItemSourceMapping {
	SourceName: string
	AtemSource: number
}

export type TableConfigItemSourceMappingWithSisyfos = {
	SisyfosLayers: string[]
	StudioMics: boolean
} & TableConfigItemSourceMapping

export type TableConfigItemSourceMappingWithSisyfosAndKeepAudio = {
	KeepAudioInStudio: boolean
} & TableConfigItemSourceMappingWithSisyfos
