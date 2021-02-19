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

export interface TableConfigItemDSK {
	Number: number
	Fill: number
	Key: number
	Toggle: boolean
	DefaultOn: boolean
}
