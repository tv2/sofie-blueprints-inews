import * as _ from 'underscore'
import { CORE_INJECTED_KEYS, studioConfigManifest } from '../config-manifests'
import { StudioConfig } from '../helpers/config'

const blankStudioConfig: StudioConfig = {
	SofieHostURL: '',

	MediaFlowId: '',
	SourcesCam: '',
	SourcesRM: '',
	SourcesSkype: '',
	ABMediaPlayers: '',
	ABPlaybackDebugLogging: false,

	AtemSource: {
		DSK1F: 0,
		DSK1K: 0,
		ServerC: 0,
		JingleFill: 0,
		JingleKey: 0,
		SplitArtF: 0,
		SplitArtK: 0,
		Default: 0,
		MixMinusDefault: 0
	},
	AtemSettings: {
		CCGClip: 0,
		CCGGain: 0,
		VizClip: 0,
		VizGain: 0
	},
	AudioBedSettings: {
		fadeIn: 0,
		fadeOut: 0
	},
	CasparPrerollDuration: 0,
	PilotPrerollDuration: 0,
	ClipFileExtension: 'mxf',
	ClipSourcePath: '/',
	DVEPrerollDuration: 0,
	ATEMDelay: 1
}

function getObjectKeys(obj: any): string[] {
	const definedKeys: string[] = []
	const processObj = (prefix: string, o: any) => {
		_.each(_.keys(o), k => {
			if (_.isObject(o[k])) {
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
		const studioManifestKeys = _.map(studioConfigManifest, e => e.id)
		const manifestKeys = studioManifestKeys.concat(CORE_INJECTED_KEYS).sort()

		const definedKeys = getObjectKeys(blankStudioConfig)

		expect(manifestKeys).toEqual(definedKeys.sort())
	})
})
