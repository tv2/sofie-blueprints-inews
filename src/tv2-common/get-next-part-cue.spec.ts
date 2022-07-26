import {
	CueDefinitionDVE,
	CueDefinitionEkstern,
	CueDefinitionLYD,
	CueDefinitionTelefon,
	literal,
	PartDefinitionKam
} from 'tv2-common'
import { CueType, PartType, SourceType } from 'tv2-constants'
import { CueDefinitionGraphic, GraphicInternal, RemoteType, SourceDefinitionKam } from './inewsConversion'
import { GetNextPartCue } from './nextPartCue'

const SOURCE_DEFINITION_KAM_1: SourceDefinitionKam = {
	sourceType: SourceType.KAM,
	id: '1',
	raw: 'Kam 1',
	minusMic: false,
	name: 'KAM 1'
}
const SOURCE_DEFINITION_KAM_2: SourceDefinitionKam = {
	sourceType: SourceType.KAM,
	id: '2',
	raw: 'Kam 2',
	minusMic: false,
	name: 'KAM 2'
}
const partDefinitionTest1: PartDefinitionKam = {
	type: PartType.Kam,
	externalId: 'test-part',
	rawType: 'KAM 1',
	sourceDefinition: SOURCE_DEFINITION_KAM_1,
	fields: {},
	script: '',
	modified: 0,
	cues: [
		literal<CueDefinitionGraphic<GraphicInternal>>({
			type: CueType.Graphic,
			target: 'OVL',
			graphic: {
				type: 'internal',
				template: 'bund',
				cue: 'kg',
				textFields: []
			},
			iNewsCommand: 'kg'
		}),
		// Ekstern 1 - (index 1)
		literal<CueDefinitionEkstern>({
			type: CueType.Ekstern,
			sourceDefinition: {
				sourceType: SourceType.REMOTE,
				remoteType: RemoteType.LIVE,
				id: '1',
				raw: 'Live 1',
				name: 'LIVE 1'
			},
			iNewsCommand: 'EKSTERN'
		}),
		literal<CueDefinitionGraphic<GraphicInternal>>({
			type: CueType.Graphic,
			target: 'OVL',
			graphic: {
				type: 'internal',
				template: 'topt',
				cue: 'kg',
				textFields: []
			},
			iNewsCommand: 'kg'
		}),
		literal<CueDefinitionGraphic<GraphicInternal>>({
			type: CueType.Graphic,
			target: 'OVL',
			graphic: {
				type: 'internal',
				template: 'topt',
				cue: 'kg',
				textFields: []
			},
			iNewsCommand: 'kg'
		}),
		// Ekstern 2 - (index 4)
		literal<CueDefinitionEkstern>({
			type: CueType.Ekstern,
			sourceDefinition: {
				sourceType: SourceType.REMOTE,
				remoteType: RemoteType.LIVE,
				id: '2',
				raw: 'Live 2',
				name: 'LIVE 2'
			},
			iNewsCommand: 'EKSTERN'
		}),
		literal<CueDefinitionGraphic<GraphicInternal>>({
			type: CueType.Graphic,
			target: 'OVL',
			graphic: {
				type: 'internal',
				template: 'bund',
				cue: 'kg',
				textFields: []
			},
			iNewsCommand: 'kg'
		}),
		literal<CueDefinitionGraphic<GraphicInternal>>({
			type: CueType.Graphic,
			target: 'OVL',
			graphic: {
				type: 'internal',
				template: 'bund',
				cue: 'kg',
				textFields: []
			},
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
				INP1: SOURCE_DEFINITION_KAM_1,
				INP2: SOURCE_DEFINITION_KAM_2
			},
			labels: [],
			iNewsCommand: 'DVE'
		}),
		literal<CueDefinitionGraphic<GraphicInternal>>({
			type: CueType.Graphic,
			target: 'OVL',
			graphic: {
				type: 'internal',
				template: 'bund',
				cue: 'kg',
				textFields: []
			},
			iNewsCommand: 'kg'
		}),
		literal<CueDefinitionGraphic<GraphicInternal>>({
			type: CueType.Graphic,
			target: 'OVL',
			graphic: {
				type: 'internal',
				template: 'topt',
				cue: 'kg',
				textFields: []
			},
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
	sourceDefinition: SOURCE_DEFINITION_KAM_1,
	fields: {},
	script: '',
	modified: 0,
	cues: [
		// DVE 1 - (index 0)
		literal<CueDefinitionDVE>({
			type: CueType.DVE,
			template: 'MORBARN',
			sources: {
				INP1: SOURCE_DEFINITION_KAM_1,
				INP2: SOURCE_DEFINITION_KAM_2
			},
			labels: [],
			iNewsCommand: 'DVE'
		}),
		// Ekstern 1 - (index 1)
		literal<CueDefinitionEkstern>({
			type: CueType.Ekstern,
			sourceDefinition: {
				sourceType: SourceType.REMOTE,
				remoteType: RemoteType.LIVE,
				id: '1',
				raw: 'Live 1',
				name: 'LIVE 1'
			},
			iNewsCommand: 'EKSTERN'
		}),
		literal<CueDefinitionGraphic<GraphicInternal>>({
			type: CueType.Graphic,
			target: 'OVL',
			graphic: {
				type: 'internal',
				template: 'direkte',
				cue: 'kg',
				textFields: []
			},
			iNewsCommand: 'kg'
		}),
		literal<CueDefinitionGraphic<GraphicInternal>>({
			type: CueType.Graphic,
			target: 'OVL',
			graphic: {
				type: 'internal',
				template: 'bund',
				cue: 'kg',
				textFields: []
			},
			iNewsCommand: 'kg'
		}),
		literal<CueDefinitionGraphic<GraphicInternal>>({
			type: CueType.Graphic,
			target: 'OVL',
			graphic: {
				type: 'internal',
				template: 'bund',
				cue: 'kg',
				textFields: []
			},
			iNewsCommand: 'kg'
		}),
		// DVE 2 - (index 5)
		literal<CueDefinitionDVE>({
			type: CueType.DVE,
			template: 'MORBARN',
			sources: {
				INP1: SOURCE_DEFINITION_KAM_1,
				INP2: SOURCE_DEFINITION_KAM_2
			},
			labels: [],
			iNewsCommand: 'DVE'
		}),
		// Ekstern 2 - (index 6)
		literal<CueDefinitionEkstern>({
			type: CueType.Ekstern,
			sourceDefinition: {
				sourceType: SourceType.REMOTE,
				remoteType: RemoteType.LIVE,
				id: '1',
				raw: 'Live 1',
				name: 'LIVE 1'
			},
			iNewsCommand: 'EKSTERN'
		}),
		literal<CueDefinitionGraphic<GraphicInternal>>({
			type: CueType.Graphic,
			target: 'OVL',
			graphic: {
				type: 'internal',
				template: 'direkte',
				cue: 'kg',
				textFields: []
			},
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
