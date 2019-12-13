import { literal } from '../../common/util'
import { ParseCueOrder } from '../helpers/parseCueOrder'
import {
	PartDefinition,
	PartDefinitionGrafik,
	PartDefinitionKam,
	PartDefinitionServer,
	PartDefinitionSlutord,
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
	literal<PartDefinitionSlutord>({
		type: PartType.Slutord,
		variant: {
			endWords: 'The end'
		},
		externalId: '00001-0',
		rawType: 'SLUTORD: The end',
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
	test('Kam - DVE - Ekstern (direkte bund bund - DVE - Ekstern (direkte)', () => {
		expect(ParseCueOrder(testSegment1, '00001')).toEqual([
			literal<PartDefinitionKam>({
				type: PartType.Kam,
				variant: {
					name: '1'
				},
				externalId: '00001-0',
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
				externalId: '00001-1',
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
				externalId: '00001-2',
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
				externalId: '00001-3',
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
				externalId: '00001-4',
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

	test('Server - DVE - Ekstern (direkte bund)', () => {
		expect(ParseCueOrder(testSegment2, '00001')).toEqual([
			literal<PartDefinitionServer>({
				type: PartType.Server,
				variant: {},
				externalId: '00001-0',
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
				externalId: '00001-1',
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
				externalId: '00001-2',
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

	test('Unknown DVE (bund) - Ekstern (direkte bund)', () => {
		expect(ParseCueOrder(testSegment3, '00001')).toEqual([
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
				externalId: '00001-1',
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

	test('Unknown LIVE + Script - DVE - Ekstern', () => {
		expect(ParseCueOrder(testSegment4, '00001')).toEqual([
			literal<PartDefinitionUnknown>({
				externalId: '00001-0',
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
				externalId: '00001-1',
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

	test('Slutord with script', () => {
		expect(ParseCueOrder(testSegment5, '00001')).toEqual([
			literal<PartDefinitionSlutord>({
				externalId: '00001-0',
				type: PartType.Slutord,
				variant: {
					endWords: 'The end'
				},
				rawType: 'SLUTORD: The end',
				cues: [],
				fields: {},
				script: '',
				modified: 0,
				storyName: ''
			}),
			literal<PartDefinitionUnknown>({
				externalId: '00001-1',
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
				externalId: '00001-2',
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

	test('100% GRAFIK', () => {
		expect(ParseCueOrder(testSegment6, '00001')).toEqual([
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
		])
	})
})
