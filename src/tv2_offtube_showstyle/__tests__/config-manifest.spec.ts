import * as _ from 'underscore'
import { showStyleConfigManifest } from '../config-manifests'
import { OfftubeShowStyleConfig } from '../helpers/config'

const blankShowStyleConfig: OfftubeShowStyleConfig = {
	DVEStyles: [],
	GFXTemplates: [],
	WipesConfig: [],
	BreakerConfig: [],
	DefaultTemplateDuration: 4,
	LYDConfig: [],
	CasparCGLoadingClip: '',
	TakeWithMixDuration: 12,
	TakeEffekts: [{ Effekt: '1' }, { Effekt: '2' }]
}

describe('Config Manifest', () => {
	test('Exposed ShowStyle Keys', () => {
		const showStyleManifestKeys = _.map(showStyleConfigManifest, e => e.id)
		const manifestKeys = showStyleManifestKeys.sort()

		const definedKeys = Object.keys(blankShowStyleConfig)

		expect(manifestKeys).toEqual(definedKeys.sort())
	})
})
