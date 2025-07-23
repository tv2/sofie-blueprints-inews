import { DskRole } from 'tv2-constants'

export interface TableConfigItemSourceMapping {
	SourceName: string
	SwitcherSource: number
}

export type TableConfigForAuxiliary = {
	AuxiliaryId: string
	LayerId: string
} & TableConfigItemSourceMapping

export type TableConfigItemSourceMappingWithSisyfos = {
	SisyfosLayers: string[]
	StudioMics: boolean
	WantsToPersistAudio?: boolean
	AcceptPersistAudio?: boolean
} & TableConfigItemSourceMapping

export interface SwitcherDskProps {
	/** 0-based */
	Number: number
	Fill: number
	Key: number
	Clip: number
	Gain: number
}

export interface TableConfigItemDSK extends SwitcherDskProps {
	Toggle: boolean
	DefaultOn: boolean
	Roles?: DskRole[]
}
