import { ConfigManifestEntryType } from 'blueprints-integration'
import * as _ from 'underscore'
import { CORE_INJECTED_KEYS, studioConfigManifest } from '../config-manifests'
import { defaultDSKConfig, OfftubeStudioConfig } from '../helpers/config'

const blankStudioConfig: OfftubeStudioConfig = {
	SofieHostURL: '',

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
	SourcesCam: [],
	SourcesRM: [],
	SourcesFeed: [],
	ABMediaPlayers: [],
	StudioMics: [],
	ABPlaybackDebugLogging: false,

	AtemSource: {
		DSK: defaultDSKConfig,
		SplitArtF: 0,
		SplitArtK: 0,
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
		volume: 0,
		useAudioFilterSyntax: false
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
	IdleWallLoop: [{ _id: 'idle-wall-loop', Enabled: false, ShowName: '', TemplateName: '' }],
	ServerPostrollDuration: 5000,
	PreventOverlayWithFull: true,
	GraphicsType: 'HTML',
	VizPilotGraphics: {
		KeepAliveDuration: 1000,
		PrerollDuration: 1000,
		OutTransitionDuration: 1000,
		CutToMediaPlayer: 1000,
		FullGraphicBackground: 0
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
		_.each(_.keys(o), k => {
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
	test('Idle Wall Loop is opt-in with no default scene', () => {
		const entries = studioConfigManifest.filter(entry => entry.id.startsWith('IdleWallLoop'))
		expect(entries).toHaveLength(1)
		expect(entries[0]).toMatchObject({
			id: 'IdleWallLoop',
			name: 'Idle Wall Loop',
			type: ConfigManifestEntryType.TABLE,
			required: false,
			defaultVal: [{ _id: 'idle-wall-loop', Enabled: false, ShowName: '', TemplateName: '' }],
			columns: [
				expect.objectContaining({ id: 'Enabled', defaultVal: false, rank: 0 }),
				expect.objectContaining({ id: 'ShowName', defaultVal: '', rank: 1 }),
				expect.objectContaining({ id: 'TemplateName', defaultVal: '', rank: 2 })
			]
		})
	})

	test('Exposed Studio Keys', () => {
		const studioManifestKeys = _.map(studioConfigManifest, e => e.id)
		const manifestKeys = studioManifestKeys.concat(CORE_INJECTED_KEYS).sort()

		const definedKeys = getObjectKeys(blankStudioConfig)

		expect(manifestKeys).toEqual(definedKeys.sort())
	})
})
