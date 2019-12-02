import { literal } from '../../common/util'
import { ParseCueOrder } from '../helpers/parseCueOrder'
import {
	PartDefinition,
	PartDefinitionKam,
	PartDefinitionServer,
	PartDefinitionUnknown,
	PartType
} from '../inewsConversion/converters/ParseBody'
import {
	CueDefinitionDVE,
	CueDefinitionEkstern,
	CueDefinitionGrafik,
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
		modified: 0
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
		modified: 0
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
		modified: 0
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
				modified: 0
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
				modified: 0
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
				modified: 0
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
				modified: 0
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
				modified: 0
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
				modified: 0
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
				modified: 0
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
				modified: 0
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
				modified: 0
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
				modified: 0
			})
		])
	})
})
