import { SwitcherType } from 'tv2-common'
import * as _ from 'underscore'
import { CORE_INJECTED_KEYS, studioConfigManifest } from '../config-manifests'
import { defaultDSKConfig, StudioConfig } from '../helpers/config'

const blankStudioConfig: StudioConfig = {
	SofieHostURL: '',

	SwitcherType: SwitcherType.ATEM,
	ClipMediaFlowId: '',
	GraphicMediaFlowId: '',
	JingleMediaFlowId: '',
	AudioBedMediaFlowId: '',
	DVEMediaFlowId: '',
	JingleFileExtension: '',
	ClipFileExtension: 'mxf',
	GraphicFileExtension: '.png',
	AudioBedFileExtension: '.wav',
	DVEFileExtension: '.png',
	ClipNetworkBasePath: '/',
	GraphicNetworkBasePath: '/',
	JingleNetworkBasePath: '/',
	AudioBedNetworkBasePath: '/',
	DVENetworkBasePath: '/',
	ClipFolder: '',
	GraphicFolder: '',
	JingleFolder: '',
	AudioBedFolder: '',
	DVEFolder: '',
	GraphicIgnoreStatus: false,
	JingleIgnoreStatus: false,
	ClipIgnoreStatus: false,
	AudioBedIgnoreStatus: false,
	DVEIgnoreStatus: false,
	SourcesCam: [],
	SourcesRM: [],
	SourcesFeed: [],
	SourcesReplay: [],
	ABMediaPlayers: [],
	StudioMics: [],
	ABPlaybackDebugLogging: false,

	SwitcherSource: {
		DSK: defaultDSKConfig,
		SplitArtFill: 0,
		SplitArtKey: 0,
		Default: 0,
		MixMinusDefault: 0,
		Continuity: 0,
		Dip: 0
	},
	AtemSettings: {
		MP1Baseline: {
			Clip: 1,
			Loop: false,
			Playing: true
		}
	},
	AudioBedSettings: {
		fadeIn: 0,
		fadeOut: 0,
		volume: 0
	},
	CasparPrerollDuration: 0,
	PreventOverlayWithFull: true,
	MaximumPartDuration: 0,
	DefaultPartDuration: 0,
	ServerPostrollDuration: 5000,
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

function getObjectKeys(obj: any): string[] {
	const definedKeys: string[] = []
	const processObj = (prefix: string, o: any) => {
		_.each(_.keys(o), (k) => {
			if (_.isArray(o[k])) {
				definedKeys.push(prefix + k)
			} else if (_.isObject(o[k])) {
				processObj(prefix + k + '.', o[k])
			} else {
				definedKeys.push(prefix + k)
			}
		})
	}
	processObj('', obj)
	return definedKeys
}

describe('Config Manifest', () => {
	test('Exposed Studio Keys', () => {
		const studioManifestKeys = _.map(studioConfigManifest, (e) => e.id)
		const manifestKeys = studioManifestKeys.concat(CORE_INJECTED_KEYS).sort()

		const definedKeys = getObjectKeys(blankStudioConfig)

		expect(manifestKeys).toEqual(definedKeys.sort())
	})
})
