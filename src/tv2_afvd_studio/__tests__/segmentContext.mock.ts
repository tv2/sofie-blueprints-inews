import {
	BlueprintMappings,
	ConfigItemValue,
	IBlueprintConfig,
	ShowStyleContext
} from '@sofie-automation/blueprints-integration'
import { DVEConfigInput, literal, TableConfigItemSourceMappingWithSisyfos } from 'tv2-common'
import { SegmentContext } from '../../__mocks__/context'
import { DefaultBreakerConfig } from '../../tv2_afvd_showstyle/__tests__/breakerConfigDefault'
import { parseConfig as parseShowStyleConfig, ShowStyleConfig } from '../../tv2_afvd_showstyle/helpers/config'
import { parseConfig, StudioConfig } from '../helpers/config'
import { SisyfosLLAyer } from '../layers'

const mockStudioConfig: StudioConfig = {
	SofieHostURL: '',

	ClipMediaFlowId: '',
	JingleMediaFlowId: '',
	JingleFileExtension: '',
	SourcesCam: [
		literal<TableConfigItemSourceMappingWithSisyfos>({
			SisyfosLayers: [],
			StudioMics: true,
			SourceName: '1',
			AtemSource: 4
		})
	],
	SourcesRM: [],
	SourcesSkype: [],
	ABMediaPlayers: [],
	SourcesDelayedPlayback: [],
	StudioMics: [
		SisyfosLLAyer.SisyfosSourceHost_1_ST_A,
		SisyfosLLAyer.SisyfosSourceHost_2_ST_A,
		SisyfosLLAyer.SisyfosSourceGuest_1_ST_A,
		SisyfosLLAyer.SisyfosSourceGuest_2_ST_A,
		SisyfosLLAyer.SisyfosSourceGuest_3_ST_A,
		SisyfosLLAyer.SisyfosSourceGuest_4_ST_A
	],
	ABPlaybackDebugLogging: false,

	AtemSource: {
		DSK: [],
		ServerC: 0,
		SplitArtF: 0,
		SplitArtK: 0,
		Default: 0,
		Continuity: 0,
		JingleFill: 0,
		JingleKey: 0,
		FullFrameGrafikBackground: 0,
		MixMinusDefault: 0
	},
	AtemSettings: {
		CCGClip: 0,
		CCGGain: 0,
		VizClip: 0,
		VizGain: 0,
		MP1Baseline: {
			Clip: 0,
			Loop: false,
			Playing: false
		}
	},
	AudioBedSettings: {
		fadeIn: 0,
		fadeOut: 0,
		volume: 0
	},
	PilotCutToMediaPlayer: 0,
	PilotKeepaliveDuration: 0,
	PilotOutTransitionDuration: 0,
	PilotPrerollDuration: 0,
	PreventOverlayWithFull: true,
	ATEMDelay: 0,
	CasparPrerollDuration: 280,
	ClipFileExtension: 'mxf',
	NetworkBasePathClip: '/',
	NetworkBasePathJingle: '',
	MaximumPartDuration: 0,
	DefaultPartDuration: 0,
	ServerPostrollDuration: 3000
}

const mockShowStyleConfig: ShowStyleConfig = {
	DVEStyles: [
		literal<DVEConfigInput>({
			DVEName: 'morbarn',
			DVEJSON: '{}',
			DVEGraphicsTemplate: '',
			DVEGraphicsFrame: '',
			DVEGraphicsKey: '',
			DVEGraphicsTemplateJSON: '',
			DVEInputs: ''
		}),
		literal<DVEConfigInput>({
			DVEName: 'barnmor',
			DVEJSON: '{}',
			DVEGraphicsTemplate: '',
			DVEGraphicsFrame: '',
			DVEGraphicsKey: '',
			DVEGraphicsTemplateJSON: '',
			DVEInputs: ''
		})
	],
	MakeAdlibsForFulls: true,
	GFXTemplates: [],
	WipesConfig: [],
	BreakerConfig: DefaultBreakerConfig(),
	DefaultTemplateDuration: 4,
	LYDConfig: [],
	CasparCGLoadingClip: '',
	Transitions: [{ Transition: '1' }, { Transition: '2' }],
	ShowstyleTransition: 'CUT'
}

/* tslint:disable:max-classes-per-file */
export class MockShowStyleContext implements ShowStyleContext {
	public warnings: string[] = []
	public errors: string[] = []

	public takeAfterExecute: boolean = false

	/** Get the mappings for the studio */
	public getStudioMappings: () => Readonly<BlueprintMappings>

	constructor(public segmentId: string) {}
	/** Returns a map of the ShowStyle configs */
	public getShowStyleConfig(): Readonly<{
		[key: string]: ConfigItemValue
	}> {
		return JSON.parse(JSON.stringify(parseShowStyleConfig((mockShowStyleConfig as any) as IBlueprintConfig)))
	}
	/** Returns a map of the studio configs */
	public getStudioConfig(): Readonly<{
		[key: string]: ConfigItemValue
	}> {
		return JSON.parse(JSON.stringify(parseConfig((mockStudioConfig as any) as IBlueprintConfig)))
	}
	/** Un-hash, is return the string that created the hash */
	public unhashId(hash: string) {
		return hash
	}
	/**
	 * Hash a string. Will return a unique string, to be used for all _id:s that are to be inserted in database
	 * @param originString A representation of the origin of the hash (for logging)
	 * @param originIsNotUnique If the originString is not guaranteed to be unique, set this to true
	 */
	public getHashId(originString: string, _originIsNotUnique?: boolean) {
		return originString
	}
	public warning(message: string) {
		this.warnings.push(message)
	}
	public error(message: string) {
		this.errors.push(message)
	}
	/** Returns a reference to a studio config value, that can later be resolved in Core */
	public getStudioConfigRef(_configKey: string): string {
		return ''
	}
	/** Returns a reference to a showStyle config value, that can later be resolved in Core */
	public getShowStyleConfigRef(_configKey: string): string {
		return ''
	}
}

export class MockSegmentContext extends SegmentContext {}
