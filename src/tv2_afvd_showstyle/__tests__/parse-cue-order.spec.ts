import { literal } from '../../common/util'
import { PostProcessDefinitions } from '../helpers/postProcessDefinitions'
import { stripExternalId } from '../inewsConversion/converters/__tests__/body-parser.spec'
import {
	PartDefinition,
	PartDefinitionGrafik,
	PartDefinitionKam,
	PartDefinitionServer,
	PartDefinitionUnknown,
	PartType
} from '../inewsConversion/converters/ParseBody'
import {
	CueDefinitionDVE,
	CueDefinitionEkstern,
	CueDefinitionGrafik,
	CueDefinitionTargetEngine,
	CueType
} from '../inewsConversion/converters/ParseCue'

const testSegment1: PartDefinition[] = [
	literal<PartDefinitionKam>({
		type: PartType.Kam,
		variant: {
			name: '1'
		},
		externalId: '00001-0',
		rawType: 'Kam 1',
		cues: [
			// DVE 1 - (index 0)
			literal<CueDefinitionDVE>({
				type: CueType.DVE,
				template: 'MORBARN',
				sources: {
					INP1: 'Kam 1',
					INP2: 'Kam 2'
				},
				labels: []
			}),
			// Ekstern 1 - (index 1)
			literal<CueDefinitionEkstern>({
				type: CueType.Ekstern,
				source: '1'
			}),
			literal<CueDefinitionGrafik>({
				type: CueType.Grafik,
				template: 'direkte',
				cue: 'kg',
				textFields: []
			}),
			literal<CueDefinitionGrafik>({
				type: CueType.Grafik,
				template: 'bund',
				cue: 'kg',
				textFields: []
			}),
			literal<CueDefinitionGrafik>({
				type: CueType.Grafik,
				template: 'bund',
				cue: 'kg',
				textFields: []
			}),
			// DVE 2 - (index 5)
			literal<CueDefinitionDVE>({
				type: CueType.DVE,
				template: 'MORBARN',
				sources: {
					INP1: 'Kam 1',
					INP2: 'Kam 2'
				},
				labels: []
			}),
			// Ekstern 2 - (index 6)
			literal<CueDefinitionEkstern>({
				type: CueType.Ekstern,
				source: '1'
			}),
			literal<CueDefinitionGrafik>({
				type: CueType.Grafik,
				template: 'direkte',
				cue: 'kg',
				textFields: []
			})
		],
		script: 'Some script yay\n',
		fields: {},
		modified: 0,
		storyName: ''
	})
]

const testSegment2: PartDefinition[] = [
	literal<PartDefinitionServer>({
		type: PartType.Server,
		variant: {},
		externalId: '00001-0',
		rawType: 'Server',
		cues: [
			// DVE 1 - (index 0)
			literal<CueDefinitionDVE>({
				type: CueType.DVE,
				template: 'MORBARN',
				sources: {
					INP1: 'Kam 1',
					INP2: 'Kam 2'
				},
				labels: []
			}),
			// Ekstern 1 - (index 1)
			literal<CueDefinitionEkstern>({
				type: CueType.Ekstern,
				source: '1'
			}),
			literal<CueDefinitionGrafik>({
				type: CueType.Grafik,
				template: 'direkte',
				cue: 'kg',
				textFields: []
			}),
			literal<CueDefinitionGrafik>({
				type: CueType.Grafik,
				template: 'bund',
				cue: 'kg',
				textFields: []
			})
		],
		script: '',
		fields: {},
		modified: 0,
		storyName: ''
	})
]

const testSegment3: PartDefinition[] = [
	literal<PartDefinitionUnknown>({
		type: PartType.Unknown,
		variant: {},
		externalId: '00001-0',
		rawType: '',
		cues: [
			// DVE 1 - (index 0)
			literal<CueDefinitionDVE>({
				type: CueType.DVE,
				template: 'MORBARN',
				sources: {
					INP1: 'Kam 1',
					INP2: 'Kam 2'
				},
				labels: []
			}),
			literal<CueDefinitionGrafik>({
				type: CueType.Grafik,
				template: 'bund',
				cue: 'kg',
				textFields: []
			}),
			// Ekstern 1 - (index 2)
			literal<CueDefinitionEkstern>({
				type: CueType.Ekstern,
				source: '1'
			}),
			literal<CueDefinitionGrafik>({
				type: CueType.Grafik,
				template: 'direkte',
				cue: 'kg',
				textFields: []
			}),
			literal<CueDefinitionGrafik>({
				type: CueType.Grafik,
				template: 'bund',
				cue: 'kg',
				textFields: []
			})
		],
		script: '',
		fields: {},
		modified: 0,
		storyName: ''
	})
]

const testSegment4: PartDefinition[] = [
	literal<PartDefinitionUnknown>({
		type: PartType.Unknown,
		variant: {},
		externalId: '00001-0',
		rawType: 'LIVE',
		cues: [
			literal<CueDefinitionDVE>({
				type: CueType.DVE,
				template: 'SOMMERFUGL',
				sources: {
					INP1: 'KAM 1',
					INP2: 'LIVE 2'
				},
				labels: ['Rodovre']
			}),
			literal<CueDefinitionEkstern>({
				type: CueType.Ekstern,
				source: 'LIVE 2'
			})
		],
		script: 'Some script',
		fields: {},
		modified: 0,
		storyName: ''
	})
]

const testSegment5: PartDefinition[] = [
	literal<PartDefinitionKam>({
		type: PartType.Kam,
		variant: {
			name: '1'
		},
		externalId: '00001-0',
		rawType: 'KAM 1',
		cues: [
			literal<CueDefinitionDVE>({
				type: CueType.DVE,
				template: 'SOMMERFUGL',
				sources: {
					INP1: 'KAM 1',
					INP2: 'LIVE 2'
				},
				labels: ['Rodovre']
			}),
			literal<CueDefinitionEkstern>({
				type: CueType.Ekstern,
				source: 'LIVE 2'
			})
		],
		script: 'Some script',
		fields: {},
		modified: 0,
		storyName: '',
		endWords: 'The end'
	})
]

const testSegment6: PartDefinition[] = [
	literal<PartDefinitionGrafik>({
		type: PartType.Grafik,
		variant: {},
		externalId: '00001-0',
		rawType: '100% GRAFIK',
		cues: [
			literal<CueDefinitionTargetEngine>({
				type: CueType.TargetEngine,
				rawType: 'GRAFIK=FULL',
				content: {},
				engine: 'FULL',
				grafik: {
					type: CueType.MOS,
					name: 'PROFILE/MEST BRUGTE STARTERE I NBA/08-12-2019',
					vcpid: 2577769,
					continueCount: 2,
					start: {
						seconds: 0
					}
				}
			})
		],
		script: '',
		fields: {},
		modified: 0,
		storyName: ''
	})
]

describe('Parse Cue Order', () => {
	test.skip('Kam - DVE - Ekstern (direkte bund bund - DVE - Ekstern (direkte)', () => {
		expect(stripExternalId(PostProcessDefinitions(testSegment1, '00001'))).toEqual([
			literal<PartDefinitionKam>({
				type: PartType.Kam,
				variant: {
					name: '1'
				},
				externalId: '',
				rawType: 'Kam 1',
				cues: [],
				script: 'Some script yay\n',
				fields: {},
				modified: 0,
				storyName: ''
			}),
			literal<PartDefinitionUnknown>({
				type: PartType.Unknown,
				variant: {},
				externalId: '',
				rawType: '',
				cues: [
					// DVE 1 - (index 0)
					literal<CueDefinitionDVE>({
						type: CueType.DVE,
						template: 'MORBARN',
						sources: {
							INP1: 'Kam 1',
							INP2: 'Kam 2'
						},
						labels: []
					})
				],
				script: '',
				fields: {},
				modified: 0,
				storyName: ''
			}),
			literal<PartDefinitionUnknown>({
				type: PartType.Unknown,
				variant: {},
				externalId: '',
				rawType: '',
				cues: [
					// Ekstern 1 - (index 1)
					literal<CueDefinitionEkstern>({
						type: CueType.Ekstern,
						source: '1'
					}),
					literal<CueDefinitionGrafik>({
						type: CueType.Grafik,
						template: 'direkte',
						cue: 'kg',
						textFields: []
					}),
					literal<CueDefinitionGrafik>({
						type: CueType.Grafik,
						template: 'bund',
						cue: 'kg',
						textFields: []
					}),
					literal<CueDefinitionGrafik>({
						type: CueType.Grafik,
						template: 'bund',
						cue: 'kg',
						textFields: []
					})
				],
				script: '',
				fields: {},
				modified: 0,
				storyName: ''
			}),
			literal<PartDefinitionUnknown>({
				type: PartType.Unknown,
				variant: {},
				externalId: '',
				rawType: '',
				cues: [
					// DVE 2 - (index 5)
					literal<CueDefinitionDVE>({
						type: CueType.DVE,
						template: 'MORBARN',
						sources: {
							INP1: 'Kam 1',
							INP2: 'Kam 2'
						},
						labels: []
					})
				],
				script: '',
				fields: {},
				modified: 0,
				storyName: ''
			}),
			literal<PartDefinitionUnknown>({
				type: PartType.Unknown,
				variant: {},
				externalId: '',
				rawType: '',
				cues: [
					// Ekstern 2 - (index 6)
					literal<CueDefinitionEkstern>({
						type: CueType.Ekstern,
						source: '1'
					}),
					literal<CueDefinitionGrafik>({
						type: CueType.Grafik,
						template: 'direkte',
						cue: 'kg',
						textFields: []
					})
				],
				script: '',
				fields: {},
				modified: 0,
				storyName: ''
			})
		])
	})

	test.skip('Server - DVE - Ekstern (direkte bund)', () => {
		expect(stripExternalId(PostProcessDefinitions(testSegment2, '00001'))).toEqual([
			literal<PartDefinitionServer>({
				type: PartType.Server,
				variant: {},
				externalId: '',
				rawType: 'Server',
				cues: [],
				script: '',
				fields: {},
				modified: 0,
				storyName: ''
			}),
			literal<PartDefinitionUnknown>({
				type: PartType.Unknown,
				variant: {},
				externalId: '',
				rawType: '',
				cues: [
					// DVE 1 - (index 0)
					literal<CueDefinitionDVE>({
						type: CueType.DVE,
						template: 'MORBARN',
						sources: {
							INP1: 'Kam 1',
							INP2: 'Kam 2'
						},
						labels: []
					})
				],
				script: '',
				fields: {},
				modified: 0,
				storyName: ''
			}),
			literal<PartDefinitionUnknown>({
				type: PartType.Unknown,
				variant: {},
				externalId: '',
				rawType: '',
				cues: [
					// Ekstern 1 - (index 1)
					literal<CueDefinitionEkstern>({
						type: CueType.Ekstern,
						source: '1'
					}),
					literal<CueDefinitionGrafik>({
						type: CueType.Grafik,
						template: 'direkte',
						cue: 'kg',
						textFields: []
					}),
					literal<CueDefinitionGrafik>({
						type: CueType.Grafik,
						template: 'bund',
						cue: 'kg',
						textFields: []
					})
				],
				script: '',
				fields: {},
				modified: 0,
				storyName: ''
			})
		])
	})

	test.skip('Unknown DVE (bund) - Ekstern (direkte bund)', () => {
		expect(stripExternalId(PostProcessDefinitions(testSegment3, '00001'))).toEqual([
			literal<PartDefinitionUnknown>({
				type: PartType.Unknown,
				variant: {},
				externalId: '',
				rawType: '',
				cues: [
					// DVE 1 - (index 0)
					literal<CueDefinitionDVE>({
						type: CueType.DVE,
						template: 'MORBARN',
						sources: {
							INP1: 'Kam 1',
							INP2: 'Kam 2'
						},
						labels: []
					}),
					literal<CueDefinitionGrafik>({
						type: CueType.Grafik,
						template: 'bund',
						cue: 'kg',
						textFields: []
					})
				],
				script: '',
				fields: {},
				modified: 0,
				storyName: ''
			}),
			literal<PartDefinitionUnknown>({
				type: PartType.Unknown,
				variant: {},
				externalId: '',
				rawType: '',
				cues: [
					// Ekstern 1 - (index 1)
					literal<CueDefinitionEkstern>({
						type: CueType.Ekstern,
						source: '1'
					}),
					literal<CueDefinitionGrafik>({
						type: CueType.Grafik,
						template: 'direkte',
						cue: 'kg',
						textFields: []
					}),
					literal<CueDefinitionGrafik>({
						type: CueType.Grafik,
						template: 'bund',
						cue: 'kg',
						textFields: []
					})
				],
				script: '',
				fields: {},
				modified: 0,
				storyName: ''
			})
		])
	})

	test.skip('Unknown LIVE + Script - DVE - Ekstern', () => {
		expect(stripExternalId(PostProcessDefinitions(testSegment4, '00001'))).toEqual([
			literal<PartDefinitionUnknown>({
				externalId: '',
				type: PartType.Unknown,
				variant: {},
				rawType: '',
				cues: [
					literal<CueDefinitionDVE>({
						type: CueType.DVE,
						template: 'SOMMERFUGL',
						sources: {
							INP1: 'KAM 1',
							INP2: 'LIVE 2'
						},
						labels: ['Rodovre']
					})
				],
				script: 'Some script',
				fields: {},
				modified: 0,
				storyName: ''
			}),
			literal<PartDefinitionUnknown>({
				externalId: '',
				type: PartType.Unknown,
				variant: {},
				rawType: '',
				cues: [
					literal<CueDefinitionEkstern>({
						type: CueType.Ekstern,
						source: 'LIVE 2'
					})
				],
				script: '',
				fields: {},
				modified: 0,
				storyName: ''
			})
		])
	})

	test.skip('Slutord with script', () => {
		expect(stripExternalId(PostProcessDefinitions(testSegment5, '00001'))).toEqual([
			literal<PartDefinitionKam>({
				externalId: '',
				type: PartType.Kam,
				variant: {
					name: '1'
				},
				rawType: 'KAM 1',
				cues: [],
				fields: {},
				script: '',
				modified: 0,
				storyName: '',
				endWords: 'The end'
			}),
			literal<PartDefinitionUnknown>({
				externalId: '',
				type: PartType.Unknown,
				variant: {},
				rawType: '',
				cues: [
					literal<CueDefinitionDVE>({
						type: CueType.DVE,
						template: 'SOMMERFUGL',
						sources: {
							INP1: 'KAM 1',
							INP2: 'LIVE 2'
						},
						labels: ['Rodovre']
					})
				],
				fields: {},
				script: 'Some script',
				modified: 0,
				storyName: ''
			}),
			literal<PartDefinitionUnknown>({
				externalId: '',
				type: PartType.Unknown,
				variant: {},
				rawType: '',
				cues: [
					literal<CueDefinitionEkstern>({
						type: CueType.Ekstern,
						source: 'LIVE 2'
					})
				],
				fields: {},
				script: '',
				modified: 0,
				storyName: ''
			})
		])
	})

	test.skip('100% GRAFIK', () => {
		expect(stripExternalId(PostProcessDefinitions(testSegment6, '00001'))).toEqual([
			literal<PartDefinitionGrafik>({
				type: PartType.Grafik,
				variant: {},
				externalId: '',
				rawType: '100% GRAFIK',
				cues: [
					literal<CueDefinitionTargetEngine>({
						type: CueType.TargetEngine,
						rawType: 'GRAFIK=FULL',
						content: {},
						engine: 'FULL',
						grafik: {
							type: CueType.MOS,
							name: 'PROFILE/MEST BRUGTE STARTERE I NBA/08-12-2019',
							vcpid: 2577769,
							continueCount: 2,
							start: {
								seconds: 0
							}
						}
					})
				],
				script: '',
				fields: {},
				modified: 0,
				storyName: ''
			})
		])
	})
})
