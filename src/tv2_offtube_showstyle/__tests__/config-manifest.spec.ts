import { ConfigManifestEntryTable, ConfigManifestEntryType, TSR } from 'blueprints-integration'
import * as _ from 'underscore'
import { showStyleConfigManifest } from '../config-manifests'
import { OfftubeShowStyleConfig } from '../helpers/config'

const blankShowStyleConfig: OfftubeShowStyleConfig = {
	DVEStyles: [],
	GFXTemplates: [],
	GfxDesignTemplates: [],
	WipesConfig: [],
	BreakerConfig: [],
	DefaultTemplateDuration: 4,
	LYDConfig: [],
	CasparCGLoadingClip: '',
	Transitions: [{ Transition: '1' }, { Transition: '2' }],
	ShowstyleTransition: 'CUT',
	MakeAdlibsForFulls: true,
	SchemaConfig: [],
	GraphicsSetups: [],
	SelectedGraphicsSetupName: ''
}

describe('Config Manifest', () => {
	test('Exposed ShowStyle Keys', () => {
		const showStyleManifestKeys = _.map(showStyleConfigManifest, e => e.id)
		const manifestKeys = showStyleManifestKeys.sort()

		const definedKeys = Object.keys(blankShowStyleConfig)

		expect(manifestKeys).toEqual(definedKeys.sort())
	})

	test('GFX templates allow CasparCG and Viz MSE mappings', () => {
		const gfxTemplates = showStyleConfigManifest.find(entry => entry.id === 'GFXTemplates') as ConfigManifestEntryTable
		const layerMapping = gfxTemplates.columns.find(column => column.id === 'LayerMapping')

		expect(layerMapping?.type).toBe(ConfigManifestEntryType.LAYER_MAPPINGS)
		if (layerMapping?.type === ConfigManifestEntryType.LAYER_MAPPINGS) {
			expect(layerMapping.filters?.deviceTypes).toEqual([TSR.DeviceType.CASPARCG, TSR.DeviceType.VIZMSE])
		}
	})

	test('GFX setups expose the Viz Wall show name', () => {
		const gfxSetups = showStyleConfigManifest.find(entry => entry.id === 'GraphicsSetups') as ConfigManifestEntryTable
		const fullShowName = gfxSetups.columns.find(column => column.id === 'FullShowName')

		expect(fullShowName?.type).toBe(ConfigManifestEntryType.STRING)
	})
})
