import { DskRole } from 'tv2-constants'

export type SwitcherInput = number | string

export interface TableConfigItemSourceMapping {
	SourceName: string
	SwitcherSource: SwitcherInput
}

export type TableConfigItemSourceMappingWithSisyfos = {
	SisyfosLayers: string[]
	StudioMics: boolean
	WantsToPersistAudio?: boolean
	AcceptPersistAudio?: boolean
} & TableConfigItemSourceMapping

export interface SwitcherDskProps {
	/** 0-based */
	Number: number
	Fill: SwitcherInput
	Key: SwitcherInput
	Clip: number
	Gain: number
}

export interface TableConfigItemDSK extends SwitcherDskProps {
	Toggle: boolean
	DefaultOn: boolean
	Roles?: DskRole[]
	UsePreconfigured?: boolean
	SourceName?: string
}
