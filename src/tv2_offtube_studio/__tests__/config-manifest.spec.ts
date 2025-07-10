import { SwitcherType } from 'tv2-common'
import * as _ from 'underscore'
import { CORE_INJECTED_KEYS, studioConfigManifest } from '../config-manifests'
import { defaultDSKConfig, OfftubeStudioConfig } from '../helpers/config'

const blankStudioConfig: OfftubeStudioConfig = {
	SofieHostURL: '',

	SwitcherType: SwitcherType.ATEM,
	ClipMediaFlowId: '',
	JingleMediaFlowId: '',
	GraphicMediaFlowId: '',
	JingleFileExtension: '',
	AudioBedMediaFlowId: '',
	DVEMediaFlowId: '',
	JingleFolder: '',
	ClipFolder: '',
	GraphicFolder: '',
	AudioBedFolder: '',
	DVEFolder: '',
	ClipIgnoreStatus: false,
	JingleIgnoreStatus: false,
	GraphicIgnoreStatus: false,
	AudioBedIgnoreStatus: false,
	DVEIgnoreStatus: false,
	SourcesAuxiliary: [],
	SourcesCam: [],
	SourcesRM: [],
	SourcesFeed: [],
	ABMediaPlayers: [],
	StudioMics: [],
	ABPlaybackDebugLogging: false,

	SwitcherSource: {
		DSK: defaultDSKConfig,
		SplitArtFill: 0,
		SplitArtKey: 0,
		Default: 0,
		Continuity: 0,
		SplitBackground: 0,
		Loop: 0,
		Dip: 0
	},
	AtemSettings: {},
	AudioBedSettings: {
		fadeIn: 0,
		fadeOut: 0,
		volume: 0
	},
	CasparPrerollDuration: 0,
	ClipFileExtension: 'mxf',
	ClipNetworkBasePath: '/',
	GraphicNetworkBasePath: '/',
	JingleNetworkBasePath: '/',
	GraphicFileExtension: '.png',
	AudioBedNetworkBasePath: '/',
	AudioBedFileExtension: '.wav',
	DVENetworkBasePath: '/',
	DVEFileExtension: '.png',
	MaximumPartDuration: 0,
	DefaultPartDuration: 0,
	IdleSource: 0,
	IdleSisyfosLayers: [],
	ServerPostrollDuration: 5000,
	PreventOverlayWithFull: true,
	GraphicsType: 'HTML',
	VizPilotGraphics: {
		KeepAliveDuration: 1000,
		PrerollDuration: 1000,
		OutTransitionDuration: 1000,
		CutToMediaPlayer: 1000,
		FullGraphicBackground: 0,
		CleanFeedPrerollDuration: 320
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
