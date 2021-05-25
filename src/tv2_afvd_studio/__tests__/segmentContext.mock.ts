import { BlueprintMappings, ConfigItemValue, IBlueprintConfig } from '@sofie-automation/blueprints-integration'
import { DVEConfigInput, literal, TableConfigItemSourceMappingWithSisyfos } from 'tv2-common'
import { SegmentContext } from '../../__mocks__/context'
import { DefaultBreakerConfig } from '../../tv2_afvd_showstyle/__tests__/breakerConfigDefault'
import { parseConfig as parseShowStyleConfig, ShowStyleConfig } from '../../tv2_afvd_showstyle/helpers/config'
import { defaultDSKConfig, parseConfig, StudioConfig } from '../helpers/config'
import { SisyfosLLAyer } from '../layers'

const mockStudioConfig: StudioConfig = {
	SofieHostURL: '',

	ClipMediaFlowId: '',
	GraphicMediaFlowId: '',
	JingleMediaFlowId: '',
	JingleFileExtension: '',
	ClipFileExtension: 'mxf',
	GraphicFileExtension: '.png',
	ClipNetworkBasePath: '/',
	GraphicNetworkBasePath: '/',
	JingleNetworkBasePath: '/',
	ClipFolder: '',
	GraphicFolder: '',
	JingleFolder: '',
	GraphicIgnoreStatus: false,
	JingleIgnoreStatus: false,
	ClipIgnoreStatus: false,
	SourcesCam: [
		literal<TableConfigItemSourceMappingWithSisyfos>({
			SisyfosLayers: [],
			StudioMics: true,
			SourceName: '1',
			AtemSource: 4
		})
	],
	SourcesRM: [],
	SourcesFeed: [],
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
		DSK: defaultDSKConfig,
		SplitArtF: 0,
		SplitArtK: 0,
		Default: 0,
		Continuity: 0,
		MixMinusDefault: 0
	},
	AtemSettings: {
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
	PreventOverlayWithFull: true,
	CasparPrerollDuration: 280,
	MaximumPartDuration: 0,
	DefaultPartDuration: 0,
	ServerPostrollDuration: 3000,
	GraphicsType: 'HTML',
	VizPilotGraphics: {
		KeepAliveDuration: 1000,
		PrerollDuration: 1000,
		OutTransitionDuration: 1000,
		CutToMediaPlayer: 1000,
		FullGraphicBackground: 36
	},
	HTMLGraphics: {
		GraphicURL: '',
		KeepAliveDuration: 1000,
		TransitionSettings: {
			wipeRate: 20,
			borderSoftness: 7500,
			loopOutTransitionDuration: 120
		}
	}
}

const mockShowStyleConfig: ShowStyleConfig = {
	DVEStyles: [
		literal<DVEConfigInput>({
			DVEName: 'morbarn',
			DVEJSON: '{}',
			DVEGraphicsFrame: '',
			DVEGraphicsKey: '',
			DVEGraphicsTemplateJSON: '',
			DVEInputs: ''
		}),
		literal<DVEConfigInput>({
			DVEName: 'barnmor',
			DVEJSON: '{}',
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
