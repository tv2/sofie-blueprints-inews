import * as _ from 'underscore'
import { showStyleConfigManifest } from '../config-manifests'
import { ShowStyleConfig } from '../helpers/config'

const blankShowStyleConfig: ShowStyleConfig = {
	MakeAdlibsForFulls: true,
	DVEStyles: [],
	GFXTemplates: [],
	WipesConfig: [],
	BreakerConfig: [],
	DefaultTemplateDuration: 4,
	LYDConfig: [],
	CasparCGLoadingClip: '',
	TakeWithMixDuration: 12,
	AdLibBreakers: [{ Breaker: '1' }, { Breaker: '2' }],
	DefaultTransition: 'CUT'
}

describe('Config Manifest', () => {
	test('Exposed ShowStyle Keys', () => {
		const showStyleManifestKeys = _.map(showStyleConfigManifest, e => e.id)
		const manifestKeys = showStyleManifestKeys.sort()

		const definedKeys = Object.keys(blankShowStyleConfig)

		expect(manifestKeys).toEqual(definedKeys.sort())
	})
})
