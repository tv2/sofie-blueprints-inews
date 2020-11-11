import { CueType, PartType } from 'tv2-constants'
import { BlueprintConfig, ShowStyleConfig } from '../../../../tv2_afvd_showstyle/helpers/config'
import { literal } from '../../../util'
import { TransformCuesIntoShowstyle } from '../../TransformCuesIntoShowstyle'
import { PartDefinitionKam } from '../ParseBody'
import { CueDefinitionGrafik, CueDefinitionMOS, CueDefinitionTargetEngine } from '../ParseCue'

describe('TransformCuesIntoShowstyle', () => {
	const showStyleConfig: ShowStyleConfig = {
		MakeAdlibsForFulls: false,
		CasparCGLoadingClip: '',
		DVEStyles: [],
		GFXTemplates: [
			{
				VizTemplate: 'VCP',
				SourceLayer: 'studio0_graphicsWall',
				LayerMapping: 'graphic_layer_wall',
				INewsCode: 'SS',
				INewsName: 'SC-STILLS',
				VizDestination: 'WALL',
				OutType: 'O',
				Argument1: '',
				Argument2: '',
				IsDesign: false
			},
			{
				VizTemplate: 'SC_LOOP_ON',
				SourceLayer: 'studio0_graphicsWall',
				LayerMapping: 'graphic_layer_wall',
				INewsCode: 'SS',
				INewsName: 'SC_LOOP',
				VizDestination: 'WALL',
				OutType: 'O',
				Argument1: '',
				Argument2: '',
				IsDesign: false
			}
		],
		WipesConfig: [],
		BreakerConfig: [],
		DefaultTemplateDuration: 3000,
		LYDConfig: [],
		Transitions: [{ Transition: '1' }, { Transition: '2' }],
		ShowstyleTransition: 'CUT'
	}

	const config: BlueprintConfig = {
		showStyle: showStyleConfig,
		studio: {} as any,
		sources: {} as any,
		mediaPlayers: {} as any,
		liveAudio: [],
		stickyLayers: []
	}

	test('Merge VCP', () => {
		const targetWallCue: CueDefinitionTargetEngine = {
			type: CueType.TargetEngine,
			data: {
				engine: 'SC-STILLS'
			},
			rawType: `SS=SC-STILLS`,
			content: {},
			iNewsCommand: 'SS'
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
			},
			iNewsCommand: 'VCP'
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
			storyName: '',
			segmentExternalId: ''
		}

		const res = TransformCuesIntoShowstyle(config, partDefinition)

		expect(res).toEqual(
			literal<PartDefinitionKam>({
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
						content: {},
						iNewsCommand: 'SS'
					})
				],
				rawType: 'Kam 1',
				script: '',
				fields: {},
				modified: 0,
				storyName: '',
				segmentExternalId: ''
			})
		)
	})

	test('Preserve internal', () => {
		const targetWallCue: CueDefinitionTargetEngine = {
			type: CueType.TargetEngine,
			data: {
				engine: 'SC_LOOP'
			},
			rawType: `SS=SC_LOOP`,
			content: {},
			iNewsCommand: 'SS'
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
			},
			iNewsCommand: 'VCP'
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
			storyName: '',
			segmentExternalId: ''
		}

		const res = TransformCuesIntoShowstyle(config, partDefinition)

		expect(res).toEqual(
			literal<PartDefinitionKam>({
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
								textFields: [],
								iNewsCommand: 'SS'
							})
						},
						rawType: `SS=SC_LOOP`,
						content: {},
						iNewsCommand: 'SS'
					}),
					mosCue
				],
				rawType: 'Kam 1',
				script: '',
				fields: {},
				modified: 0,
				storyName: '',
				segmentExternalId: ''
			})
		)
	})

	test('Preserves unconfigured target wall', () => {
		const targetWallCue: CueDefinitionTargetEngine = {
			type: CueType.TargetEngine,
			data: {
				engine: 'NEW_WALL_GRAFIK'
			},
			rawType: `SS=NEW_WALL_GRAFIK`,
			content: {},
			iNewsCommand: 'SS'
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
			},
			iNewsCommand: 'VCP'
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
			storyName: '',
			segmentExternalId: ''
		}

		const res = TransformCuesIntoShowstyle(config, partDefinition)

		expect(res).toEqual(
			literal<PartDefinitionKam>({
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
				storyName: '',
				segmentExternalId: ''
			})
		)
	})
})
