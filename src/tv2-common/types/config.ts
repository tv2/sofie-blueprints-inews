import { DSKRoles } from 'tv2-constants'

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
	/** 0-based */
	Number: number
	Fill: number
	Key: number
	Toggle: boolean
	DefaultOn: boolean
	Roles: DSKRoles[]
	Clip: number
	Gain: number
}
