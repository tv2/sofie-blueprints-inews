import { literal } from '../../../../common/util'
import { ShowStyleConfig } from '../../../../tv2_afvd_showstyle/helpers/config'
import { TransformCuesIntoShowstyle } from '../../TransformCuesIntoShowstyle'
import { PartDefinitionKam, PartType } from '../ParseBody'
import { CueDefinitionGrafik, CueDefinitionMOS, CueDefinitionTargetEngine, CueType } from '../ParseCue'

describe('TransformCuesIntoShowstyle', () => {
	const config: ShowStyleConfig = {
		MakeAdlibsForFulls: false,
		CasparCGLoadingClip: '',
		DVEStyles: [],
		GFXTemplates: [
			{
				VizTemplate: 'VCP',
				SourceLayer: 'studio0_graphicsWall',
				LayerMapping: 'viz_layer_wall',
				INewsCode: 'SS',
				INewsName: 'SC-STILLS',
				VizDestination: 'Viz-d-wall',
				OutType: 'O',
				Argument1: '',
				Argument2: '',
				IsDesign: false
			},
			{
				VizTemplate: 'SC_LOOP_ON',
				SourceLayer: 'studio0_graphicsWall',
				LayerMapping: 'viz_layer_wall',
				INewsCode: 'SS',
				INewsName: 'SC_LOOP',
				VizDestination: 'Viz-d-wall',
				OutType: 'O',
				Argument1: '',
				Argument2: '',
				IsDesign: false
			}
		],
		WipesConfig: [],
		BreakerConfig: [],
		DefaultTemplateDuration: 3000,
		LYDConfig: []
	}

	test('Merge VCP', () => {
		const targetWallCue: CueDefinitionTargetEngine = {
			type: CueType.TargetEngine,
			data: {
				engine: 'SC-STILLS'
			},
			rawType: `SS=SC-STILLS`,
			content: {}
		}
		const mosCue: CueDefinitionMOS = {
			type: CueType.MOS,
			name: 'LgfxWeb/-ETKAEM_07-05-2019_17:55:42/Mosart=L|00:00|00:10',
			vcpid: 2520177,
			continueCount: -1,
			start: {
				seconds: 0
			},
			end: {
				seconds: 10
			}
		}
		const partDefinition: PartDefinitionKam = {
			type: PartType.Kam,
			variant: {
				name: '1'
			},
			externalId: '',
			cues: [targetWallCue, mosCue],
			rawType: 'Kam 1',
			script: '',
			fields: {},
			modified: 0,
			storyName: ''
		}

		const res = TransformCuesIntoShowstyle(config, partDefinition)

		expect(res).toEqual({
			type: PartType.Kam,
			variant: {
				name: '1'
			},
			externalId: '',
			cues: [
				literal<CueDefinitionTargetEngine>({
					type: CueType.TargetEngine,
					data: {
						engine: 'WALL',
						grafik: mosCue
					},
					rawType: `SS=SC-STILLS`,
					content: {}
				})
			],
			rawType: 'Kam 1',
			script: '',
			fields: {},
			modified: 0,
			storyName: ''
		})
	})

	test('Preserve internal', () => {
		const targetWallCue: CueDefinitionTargetEngine = {
			type: CueType.TargetEngine,
			data: {
				engine: 'SC_LOOP'
			},
			rawType: `SS=SC_LOOP`,
			content: {}
		}
		const mosCue: CueDefinitionMOS = {
			type: CueType.MOS,
			name: 'LgfxWeb/-ETKAEM_07-05-2019_17:55:42/Mosart=L|00:00|00:10',
			vcpid: 2520177,
			continueCount: -1,
			start: {
				seconds: 0
			},
			end: {
				seconds: 10
			}
		}
		const partDefinition: PartDefinitionKam = {
			type: PartType.Kam,
			variant: {
				name: '1'
			},
			externalId: '',
			cues: [targetWallCue, mosCue],
			rawType: 'Kam 1',
			script: '',
			fields: {},
			modified: 0,
			storyName: ''
		}

		const res = TransformCuesIntoShowstyle(config, partDefinition)

		expect(res).toEqual({
			type: PartType.Kam,
			variant: {
				name: '1'
			},
			externalId: '',
			cues: [
				literal<CueDefinitionTargetEngine>({
					type: CueType.TargetEngine,
					data: {
						engine: 'WALL',
						grafik: literal<CueDefinitionGrafik>({
							type: CueType.Grafik,
							template: 'SC_LOOP_ON',
							cue: 'SS=SC_LOOP',
							textFields: []
						})
					},
					rawType: `SS=SC_LOOP`,
					content: {}
				}),
				mosCue
			],
			rawType: 'Kam 1',
			script: '',
			fields: {},
			modified: 0,
			storyName: ''
		})
	})

	test('Preserves unconfigured target wall', () => {
		const targetWallCue: CueDefinitionTargetEngine = {
			type: CueType.TargetEngine,
			data: {
				engine: 'NEW_WALL_GRAFIK'
			},
			rawType: `SS=NEW_WALL_GRAFIK`,
			content: {}
		}
		const mosCue: CueDefinitionMOS = {
			type: CueType.MOS,
			name: 'LgfxWeb/-ETKAEM_07-05-2019_17:55:42/Mosart=L|00:00|00:10',
			vcpid: 2520177,
			continueCount: -1,
			start: {
				seconds: 0
			},
			end: {
				seconds: 10
			}
		}
		const partDefinition: PartDefinitionKam = {
			type: PartType.Kam,
			variant: {
				name: '1'
			},
			externalId: '',
			cues: [targetWallCue, mosCue],
			rawType: 'Kam 1',
			script: '',
			fields: {},
			modified: 0,
			storyName: ''
		}

		const res = TransformCuesIntoShowstyle(config, partDefinition)

		expect(res).toEqual({
			type: PartType.Kam,
			variant: {
				name: '1'
			},
			externalId: '',
			cues: [targetWallCue, mosCue],
			rawType: 'Kam 1',
			script: '',
			fields: {},
			modified: 0,
			storyName: ''
		})
	})
})
