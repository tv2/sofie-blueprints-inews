import {
	CueDefinitionDVE,
	CueDefinitionEkstern,
	CueDefinitionGrafik,
	CueDefinitionLYD,
	CueDefinitionTelefon,
	literal,
	PartDefinitionKam
} from 'tv2-common'
import { CueType, PartType } from 'tv2-constants'
import { GetNextPartCue } from './nextPartCue'

const partDefinitionTest1: PartDefinitionKam = {
	type: PartType.Kam,
	externalId: 'test-part',
	rawType: 'KAM 1',
	variant: {
		name: '1'
	},
	fields: {},
	script: '',
	modified: 0,
	cues: [
		literal<CueDefinitionGrafik>({
			type: CueType.Grafik,
			template: 'bund',
			cue: 'kg',
			textFields: [],
			iNewsCommand: 'kg'
		}),
		// Ekstern 1 - (index 1)
		literal<CueDefinitionEkstern>({
			type: CueType.Ekstern,
			source: '1',
			iNewsCommand: 'EKSTERN'
		}),
		literal<CueDefinitionGrafik>({
			type: CueType.Grafik,
			template: 'topt',
			cue: 'kg',
			textFields: [],
			iNewsCommand: 'kg'
		}),
		literal<CueDefinitionGrafik>({
			type: CueType.Grafik,
			template: 'topt',
			cue: 'kg',
			textFields: [],
			iNewsCommand: 'kg'
		}),
		// Ekstern 2 - (index 4)
		literal<CueDefinitionEkstern>({
			type: CueType.Ekstern,
			source: '2',
			iNewsCommand: 'EKSTERN'
		}),
		literal<CueDefinitionGrafik>({
			type: CueType.Grafik,
			template: 'bund',
			cue: 'kg',
			textFields: [],
			iNewsCommand: 'kg'
		}),
		literal<CueDefinitionGrafik>({
			type: CueType.Grafik,
			template: 'bund',
			cue: 'kg',
			textFields: [],
			iNewsCommand: 'kg'
		}),
		literal<CueDefinitionLYD>({
			type: CueType.LYD,
			variant: 'bed',
			iNewsCommand: 'LYD'
		}),
		// DVE 1 - (index 8)
		literal<CueDefinitionDVE>({
			type: CueType.DVE,
			template: 'MORBARN',
			sources: {
				INP1: 'Kam 1',
				INP2: 'Kam 2'
			},
			labels: [],
			iNewsCommand: 'DVE'
		}),
		literal<CueDefinitionGrafik>({
			type: CueType.Grafik,
			template: 'bund',
			cue: 'kg',
			textFields: [],
			iNewsCommand: 'kg'
		}),
		literal<CueDefinitionGrafik>({
			type: CueType.Grafik,
			template: 'topt',
			cue: 'kg',
			textFields: [],
			iNewsCommand: 'kg'
		}),
		// TLF 1 - (index 11)
		literal<CueDefinitionTelefon>({
			type: CueType.Telefon,
			source: 'TLF 1',
			iNewsCommand: 'TELEFON'
		}),
		literal<CueDefinitionLYD>({
			type: CueType.LYD,
			variant: 'bed',
			iNewsCommand: 'LYD'
		})
	],
	storyName: '',
	segmentExternalId: ''
}

const partDefinitionTest2: PartDefinitionKam = {
	type: PartType.Kam,
	externalId: 'test-part',
	rawType: 'KAM 1',
	variant: {
		name: '1'
	},
	fields: {},
	script: '',
	modified: 0,
	cues: [
		// DVE 1 - (index 0)
		literal<CueDefinitionDVE>({
			type: CueType.DVE,
			template: 'MORBARN',
			sources: {
				INP1: 'Kam 1',
				INP2: 'Kam 2'
			},
			labels: [],
			iNewsCommand: 'DVE'
		}),
		// Ekstern 1 - (index 1)
		literal<CueDefinitionEkstern>({
			type: CueType.Ekstern,
			source: '1',
			iNewsCommand: 'EKSTERN'
		}),
		literal<CueDefinitionGrafik>({
			type: CueType.Grafik,
			template: 'direkte',
			cue: 'kg',
			textFields: [],
			iNewsCommand: 'kg'
		}),
		literal<CueDefinitionGrafik>({
			type: CueType.Grafik,
			template: 'bund',
			cue: 'kg',
			textFields: [],
			iNewsCommand: 'kg'
		}),
		literal<CueDefinitionGrafik>({
			type: CueType.Grafik,
			template: 'bund',
			cue: 'kg',
			textFields: [],
			iNewsCommand: 'kg'
		}),
		// DVE 2 - (index 5)
		literal<CueDefinitionDVE>({
			type: CueType.DVE,
			template: 'MORBARN',
			sources: {
				INP1: 'Kam 1',
				INP2: 'Kam 2'
			},
			labels: [],
			iNewsCommand: 'DVE'
		}),
		// Ekstern 2 - (index 6)
		literal<CueDefinitionEkstern>({
			type: CueType.Ekstern,
			source: '1',
			iNewsCommand: 'EKSTERN'
		}),
		literal<CueDefinitionGrafik>({
			type: CueType.Grafik,
			template: 'direkte',
			cue: 'kg',
			textFields: [],
			iNewsCommand: 'kg'
		})
	],
	storyName: '',
	segmentExternalId: ''
}

describe('Get Next Part Cue', () => {
	test('Kam (bund) - Ekstern (topt topt) - Ekstern (bund bund lyd) - DVE (bund topt) - Telefon (lyd)', () => {
		expect(GetNextPartCue(partDefinitionTest1, 1)).toEqual(4)
		expect(GetNextPartCue(partDefinitionTest1, 4)).toEqual(8)
		expect(GetNextPartCue(partDefinitionTest1, 8)).toEqual(11)
		expect(GetNextPartCue(partDefinitionTest1, 11)).toEqual(-1)
	})

	test('DVE - Ekstern (direkte bund bund - DVE - Ekstern (direkte)', () => {
		expect(GetNextPartCue(partDefinitionTest2, 0)).toEqual(1)
		expect(GetNextPartCue(partDefinitionTest2, 1)).toEqual(5)
		expect(GetNextPartCue(partDefinitionTest2, 5)).toEqual(6)
		expect(GetNextPartCue(partDefinitionTest2, 6)).toEqual(-1)
	})
})
