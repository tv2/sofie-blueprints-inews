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

export interface SwitcherDskProps {
	Fill: number
	Key: number
	Clip: string
	Gain: string
}

export interface TableConfigItemDSK extends SwitcherDskProps {
	/** 0-based */
	Number: number
	Toggle: boolean
	DefaultOn: boolean
	Roles?: DSKRoles[]
}
