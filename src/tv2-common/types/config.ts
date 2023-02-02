import { DSKRoles } from 'tv2-constants'

export interface TableConfigItemSourceMapping {
	SourceName: string
	SwitcherSource: number
}

export type TableConfigItemSourceMappingWithSisyfos = {
	SisyfosLayers: string[]
	StudioMics: boolean
	WantsToPersistAudio?: boolean
	AcceptPersistAudio?: boolean
} & TableConfigItemSourceMapping

export interface TableConfigItemDSK {
	/** 0-based */
	Number: number
	Fill: number
	Key: number
	Toggle: boolean
	DefaultOn: boolean
	Roles?: DSKRoles[]
	Clip: string
	Gain: string
}
