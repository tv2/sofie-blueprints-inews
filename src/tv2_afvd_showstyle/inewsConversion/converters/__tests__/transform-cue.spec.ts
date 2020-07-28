import {
	CueDefinitionGrafik,
	CueDefinitionMOS,
	CueDefinitionTargetEngine,
	CueDefinitionVIZ,
	literal,
	PartDefinitionKam
} from 'tv2-common'
import { CueType, PartType } from 'tv2-constants'
import { ShowStyleConfig } from '../../../../tv2_afvd_showstyle/helpers/config'
import { TransformCuesIntoShowstyle } from '../../TransformCuesIntoShowstyle'

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
				VizDestination: 'WALL',
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
				VizDestination: 'WALL',
				OutType: 'O',
				Argument1: '',
				Argument2: '',
				IsDesign: false
			},
			{
				VizTemplate: 'VCP',
				SourceLayer: 'studio0_graphics_pilotOverlay',
				LayerMapping: 'viz_layer_pilot_overlay',
				INewsCode: '#kg',
				INewsName: 'bund',
				VizDestination: 'FULL',
				OutType: '',
				Argument1: '',
				Argument2: '',
				IsDesign: false
			},
			{
				VizTemplate: 'VCP',
				SourceLayer: 'studio0_graphics_pilotOverlay',
				LayerMapping: 'viz_layer_pilot_overlay',
				INewsCode: 'GRAFIK',
				INewsName: 'FULL',
				VizDestination: 'FULL',
				OutType: '',
				Argument1: '',
				Argument2: '',
				IsDesign: false
			},
			{
				VizTemplate: 'VCP',
				SourceLayer: 'studio0_graphics_pilotOverlay',
				LayerMapping: 'viz_layer_pilot_overlay',
				INewsCode: 'VIZ',
				INewsName: 'bund',
				VizDestination: 'OVL',
				OutType: '',
				Argument1: '',
				Argument2: '',
				IsDesign: false
			}
		],
		WipesConfig: [],
		BreakerConfig: [],
		DefaultTemplateDuration: 3000,
		LYDConfig: [],
		OneButtonTransition: 'MIX 12'
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

	test('Merge once', () => {
		const partDefinition = literal<PartDefinitionKam>({
			type: PartType.Kam,
			variant: {
				name: '1'
			},
			externalId: '',
			cues: [
				literal<CueDefinitionTargetEngine>({
					type: CueType.TargetEngine,
					data: {
						engine: 'FULL',
						grafik: mosCue
					},
					rawType: `GRAFIK=FULL`,
					content: {},
					iNewsCommand: 'GRAFIK'
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
							engine: 'FULL',
							grafik: mosCue
						},
						rawType: `GRAFIK=FULL`,
						content: {},
						iNewsCommand: 'GRAFIK'
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

	test('Handles VCP for #kg (other cues)', () => {
		const kgCue: CueDefinitionGrafik = {
			type: CueType.Grafik,
			iNewsCommand: '#kg',
			template: 'bund',
			cue: '#kg',
			textFields: []
		}

		const partDefinition: PartDefinitionKam = {
			type: PartType.Kam,
			variant: {
				name: '1'
			},
			externalId: '',
			cues: [kgCue, mosCue],
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
						rawType: '#kg bund',
						data: {
							engine: 'FULL',
							grafik: mosCue
						},
						iNewsCommand: '#kg',
						content: {}
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

	test('Handles VCP for VIZ= (other cues)', () => {
		const kgCue: CueDefinitionVIZ = {
			type: CueType.VIZ,
			iNewsCommand: 'VIZ',
			design: 'bund',
			rawType: 'VIZ=bund',
			content: {}
		}

		const partDefinition: PartDefinitionKam = {
			type: PartType.Kam,
			variant: {
				name: '1'
			},
			externalId: '',
			cues: [kgCue, mosCue],
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
						rawType: 'VIZ=bund',
						data: {
							engine: 'OVL',
							grafik: mosCue
						},
						iNewsCommand: 'VIZ',
						content: {}
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
})
