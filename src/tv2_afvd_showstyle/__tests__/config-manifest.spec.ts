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
	Transitions: [{ Transition: '1' }, { Transition: '2' }],
	ShowstyleTransition: 'CUT',
	GraphicsINewsCode: '',
	GraphicsSetups: [],
	SchemaConfig: []
}

describe('Config Manifest', () => {
	test('Exposed ShowStyle Keys', () => {
		const showStyleManifestKeys = _.map(showStyleConfigManifest, e => e.id)
		const manifestKeys = showStyleManifestKeys.sort()

		const definedKeys = Object.keys(blankShowStyleConfig)

		expect(manifestKeys).toEqual(definedKeys.sort())
	})
})
