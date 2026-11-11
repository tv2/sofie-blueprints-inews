import { IBlueprintConfig, ICommonContext } from 'blueprints-integration'
import {
	isM2LXSwitcher,
	MediaPlayerConfig,
	SourceMapping,
	SwitcherInput,
	SwitcherType,
	TableConfigItemDSK,
	TableConfigItemSourceMapping,
	TV2StudioConfigBase
} from 'tv2-common'
import { DskRole } from 'tv2-constants'
import * as _ from 'underscore'
import { parseMediaPlayers, parseSources } from './sources'

export interface OfftubeStudioBlueprintConfig {
	studio: OfftubeStudioConfig
	sources: SourceMapping
	mediaPlayers: MediaPlayerConfig // Atem Input Ids
	dsk: TableConfigItemDSK[]
}

export interface IdleWallLoopConfig {
	_id?: string
	Enabled: boolean
	ShowName: string
	TemplateName: string
}

export interface OfftubeStudioConfig extends TV2StudioConfigBase {
	// Injected by core
	SofieHostURL: string

	ABMediaPlayers: TableConfigItemSourceMapping[]
	ABPlaybackDebugLogging: boolean
	SwitcherSource: {
		SplitArtFill: SwitcherInput
		SplitArtKey: SwitcherInput
		SplitBackground: SwitcherInput
		Loop: SwitcherInput
		DSK: TableConfigItemDSK[]

		Default: SwitcherInput
		Continuity: SwitcherInput
		Dip: SwitcherInput
	}

	AtemSettings: {}

	AudioBedSettings: {
		fadeIn: number
		fadeOut: number
		volume: number
		useAudioFilterSyntax?: boolean
	}

	CasparPrerollDuration: number
	IdleSource: SwitcherInput
	IdleSisyfosLayers: string[]
	IdleWallLoop?: IdleWallLoopConfig[]
}

export function preprocessConfig(_context: ICommonContext, rawConfig: IBlueprintConfig): OfftubeStudioBlueprintConfig {
	const studioConfig = ({
		...rawConfig,
		...(isM2LXSwitcher(rawConfig.SwitcherType) ? { SwitcherType: SwitcherType.M2LX } : {})
	} as unknown) as OfftubeStudioConfig
	const config: OfftubeStudioBlueprintConfig = {
		studio: studioConfig,
		// showStyle: {} as any,
		sources: parseSources(studioConfig),
		mediaPlayers: parseMediaPlayers(studioConfig),
		dsk: studioConfig.SwitcherSource.DSK
	}
	return config
}

export const defaultDSKConfig: TableConfigItemDSK[] = [
	{
		Number: 0,
		Key: 8,
		Fill: 7,
		Toggle: true,
		DefaultOn: true,
		Roles: [DskRole.JINGLE, DskRole.OVERLAYGFX],
		Clip: 50.0,
		Gain: 12.5
	},
	// Offtube doesn't use DSK for fulls, but this prevents duplicate studio configs + easy switchover to Viz engine
	{
		Number: 1,
		Key: 0,
		Fill: 12,
		Toggle: false,
		DefaultOn: false,
		Roles: [DskRole.FULLGFX],
		Clip: 50.0,
		Gain: 12.5
	}
]
export { preprocessConfig as parseConfig }
