import { IBlueprintRundownDB, PlaylistTimingType, TSR } from 'blueprints-integration'
import {
	CueDefinitionBackgroundLoop,
	CueDefinitionGraphicDesign,
	getTransitionProperties,
	PartdefinitionTypes,
	stripRedundantCuesWhenLayoutCueIsPresent,
	UnparsedCue
} from 'tv2-common'
import { CueType, PartType, SourceType } from 'tv2-constants'
import { SegmentUserContext } from '../../../../__mocks__/context'
import { defaultShowStyleConfig, defaultStudioConfig } from '../../../../tv2_afvd_showstyle/__tests__/configs'
import { getConfig, parseConfig as parseShowStyleConfig } from '../../../../tv2_afvd_showstyle/helpers/config'
import { parseConfig as parseStudioConfig } from '../../../../tv2_afvd_studio/helpers/config'
import mappingsDefaults from '../../../../tv2_afvd_studio/migrations/mappings-defaults'
import { literal } from '../../../util'
import {
	ParseBody,
	PartDefinition,
	PartDefinitionDVE,
	PartDefinitionEkstern,
	PartDefinitionEVS,
	PartDefinitionGrafik,
	PartDefinitionIntro,
	PartDefinitionKam,
	PartDefinitionServer,
	PartDefinitionTeknik,
	PartDefinitionTelefon,
	PartDefinitionUnknown,
	PartDefinitionVO,
	RemoteType,
	SourceDefinitionKam,
	SourceDefinitionRemote
} from '../ParseBody'
import {
	CueDefinition,
	CueDefinitionDVE,
	CueDefinitionEkstern,
	CueDefinitionGraphic,
	CueDefinitionJingle,
	CueDefinitionTelefon,
	CueDefinitionUnpairedPilot,
	CueDefinitionUnpairedTarget,
	GraphicInternal,
	GraphicPilot
} from '../ParseCue'

const fields = {}

const unparsedUnknown: UnparsedCue = ['Some invalid cue']

const cueGrafik1: CueDefinitionGraphic<GraphicInternal> = {
	type: CueType.Graphic,
	target: 'OVL',
	graphic: {
		type: 'internal',
		template: 'bund',
		cue: 'kg',
		textFields: ['1']
	},
	adlib: true,
	iNewsCommand: 'kg'
}

const unparsedGrafik1 = ['kg bund 1']

const cueGrafik2: CueDefinitionGraphic<GraphicInternal> = {
	type: CueType.Graphic,
	target: 'OVL',
	graphic: {
		type: 'internal',
		template: 'bund',
		cue: 'kg',
		textFields: ['2']
	},
	adlib: true,
	iNewsCommand: 'kg'
}

const unparsedGrafik2 = ['kg bund 2']

const cueGrafik3: CueDefinitionGraphic<GraphicInternal> = {
	type: CueType.Graphic,
	target: 'OVL',
	graphic: {
		type: 'internal',
		template: 'bund',
		cue: 'kg',
		textFields: ['3']
	},
	adlib: true,
	iNewsCommand: 'kg'
}

const unparsedGrafik3 = ['kg bund 3']

const SOURCE_DEFINITION_LIVE_1: SourceDefinitionRemote = {
	sourceType: SourceType.REMOTE,
	remoteType: RemoteType.LIVE,
	id: '1',
	name: 'LIVE 1',
	raw: 'LIVE 1'
}
const cueEkstern1: CueDefinitionEkstern = {
	type: CueType.Ekstern,
	sourceDefinition: SOURCE_DEFINITION_LIVE_1,
	iNewsCommand: 'EKSTERN'
}

const unparsedEkstern1 = ['EKSTERN=LIVE 1']

const SOURCE_DEFINITION_LIVE_2: SourceDefinitionRemote = {
	sourceType: SourceType.REMOTE,
	remoteType: RemoteType.LIVE,
	id: '2',
	name: 'LIVE 2',
	raw: 'LIVE 2'
}
const cueEkstern2: CueDefinitionEkstern = {
	type: CueType.Ekstern,
	sourceDefinition: SOURCE_DEFINITION_LIVE_2,
	iNewsCommand: 'EKSTERN'
}

const unparsedEkstern2 = ['EKSTERN=LIVE 2']

const cueJingle1: CueDefinitionJingle = {
	type: CueType.Jingle,
	clip: '1',
	iNewsCommand: 'JINGLE'
}

const unparsedJingle1 = ['JINGLE2=1']

const cueJingle2: CueDefinitionJingle = {
	type: CueType.Jingle,
	clip: '2',
	iNewsCommand: 'JINGLE'
}

const unparsedJingle2 = ['JINGLE2=2']

const cueJingle3: CueDefinitionJingle = {
	type: CueType.Jingle,
	clip: '3',
	iNewsCommand: 'JINGLE'
}

const unparsedJingle3 = ['JINGLE2=3']

const cueTelefon1: CueDefinitionTelefon = {
	type: CueType.Telefon,
	source: 'TLF 1',
	iNewsCommand: 'TELEFON'
}

const unparsedTelefon1 = ['TELEFON=TLF 1']

const cueTelefon2: CueDefinitionTelefon = {
	type: CueType.Telefon,
	source: 'TLF 2',
	iNewsCommand: 'TELEFON'
}

const unparsedTelefon2 = ['TELEFON=TLF 2']

const SOURCE_DEFINITION_KAM_1: SourceDefinitionKam = {
	sourceType: SourceType.KAM,
	id: '1',
	raw: 'KAM 1',
	minusMic: false,
	name: 'KAM 1'
}
const SOURCE_DEFINITION_KAM_2: SourceDefinitionKam = {
	sourceType: SourceType.KAM,
	id: '2',
	raw: 'KAM 2',
	minusMic: false,
	name: 'KAM 2'
}
const SOURCE_DEFINITION_KAM_3: SourceDefinitionKam = {
	sourceType: SourceType.KAM,
	id: '3',
	raw: 'KAM 3',
	minusMic: false,
	name: 'KAM 3'
}

const RUNDOWN_EXTERNAL_ID = 'TEST.SOFIE.JEST'

function makeMockContext() {
	const rundown = literal<IBlueprintRundownDB>({
		externalId: RUNDOWN_EXTERNAL_ID,
		name: RUNDOWN_EXTERNAL_ID,
		_id: '',
		showStyleVariantId: '',
		timing: {
			type: PlaylistTimingType.None
		}
	})
	const mockContext = new SegmentUserContext(
		'test',
		mappingsDefaults,
		parseStudioConfig,
		parseShowStyleConfig,
		rundown._id
	)
	mockContext.studioConfig = defaultStudioConfig as any
	mockContext.showStyleConfig = defaultShowStyleConfig as any

	return mockContext
}

const config = getConfig(makeMockContext())

describe('Body parser', () => {
	test('test1', () => {
		const body1 =
			'\r\n<p></p>\r\n<p><pi>*****TEKNIK*****</pi></p>\r\n<p><cc>1---JINGLE sport grafisk intro---></cc><a idref="0"><cc><----</cc></a></p>\r\n<p><cc>2---AUDIO til grafisk intro , fortsætter under teasere---></cc><a idref="1"><cc><----</cc></a></p>\r\n<p><cc>3---SS3 Sport WIPE-></cc><a idref="2"></a></p>\r\n<p><cc>4---Sport intro soundbed--></cc><a idref="3"><cc><---</cc></a></p>\r\n<p><cc>5---LED hvid på GENESIS--></cc><a idref="4"><cc><--</cc></a></p>\r\n<p><cc>6---SS3 Sport WIPE-></cc><a idref="5"></a></p>\r\n<p><cc>7---LYS:  SPORT 1 --></cc><a idref="6"><cc><--</cc></a></p>\r\n<p><cc>8---Kalder Viz Wall og kalder inputs-----</cc><a idref="7"><cc>------</cc></a></p>\r\n<p><cc>9---VCP STILL DIGI her-></cc><a idref="8"><cc><---</cc></a></p>\r\n<p></p>\r\n'
		const cues1 = [
			unparsedUnknown,
			unparsedGrafik1,
			unparsedGrafik2,
			unparsedGrafik3,
			unparsedEkstern1,
			unparsedEkstern2,
			unparsedJingle1,
			unparsedJingle2,
			unparsedJingle3
		]

		const result = ParseBody(config, '00000000001', 'test-segment', body1, cues1, fields, 0)
		expect(stripExternalId(result)).toEqual(
			literal<PartDefinition[]>([
				literal<PartDefinitionTeknik>({
					type: PartType.Teknik,
					cues: [cueGrafik1, cueGrafik2, cueGrafik3],
					script: '',
					externalId: '',
					rawType: 'TEKNIK',
					fields: {},
					modified: 0,
					storyName: 'test-segment',
					segmentExternalId: '00000000001'
				}),
				literal<PartDefinitionEkstern>({
					type: PartType.REMOTE,
					rawType: '',
					cues: [cueEkstern1],
					title: 'LIVE 1',
					script: '',
					externalId: '',
					fields: {},
					modified: 0,
					storyName: 'test-segment',
					segmentExternalId: '00000000001'
				}),
				literal<PartDefinitionEkstern>({
					type: PartType.REMOTE,
					rawType: '',
					cues: [cueEkstern2, cueJingle1, cueJingle2, cueJingle3],
					title: 'LIVE 2',
					script: '',
					externalId: '',
					fields: {},
					modified: 0,
					storyName: 'test-segment',
					segmentExternalId: '00000000001'
				})
			])
		)
	})

	test('test2a', () => {
		const body2 =
			'\r\n<p></p>\r\n<p>Thid id thr trext for the next DVE</p>\r\n<p><pi>***LIVE*** </pi></p>\r\n<p><a idref="0"></a></p>\r\n<p><a idref="1"></a></p>\r\n<p><a idref="4"></a></p>\r\n<p><cc>Spib her</cc></p>\r\n<p></p>\r\n\r\n<p>Script here</p>\r\n'
		const cues2 = [unparsedUnknown, unparsedGrafik1, null, unparsedGrafik3, unparsedEkstern1]

		const result = ParseBody(config, '00000000001', 'test-segment', body2, cues2, fields, 0)
		expect(stripExternalId(result)).toEqual(
			literal<PartDefinition[]>([
				literal<PartDefinitionUnknown>({
					type: PartType.Unknown,
					cues: [cueGrafik1],
					script: 'Thid id thr trext for the next DVE\n',
					externalId: '',
					rawType: '',
					fields: {},
					modified: 0,
					storyName: 'test-segment',
					segmentExternalId: '00000000001'
				}),
				literal<PartDefinitionEkstern>({
					type: PartType.REMOTE,
					rawType: '',
					cues: [cueEkstern1],
					title: 'LIVE 1',
					script: 'Script here\n',
					externalId: '',
					fields: {},
					modified: 0,
					storyName: 'test-segment',
					segmentExternalId: '00000000001'
				})
			])
		)
	})

	test('test2b', () => {
		const body2 =
			'\r\n<p></p>\r\n<p>Thid id thr trext for the next DVE</p>\r\n<p><pi>***LIVE*** </pi></p>\r\n<p><a idref="0"></a></p>\r\n<p><a idref="1"></a></p>\r\n<p><a idref="2"></a></p>\r\n<p><cc>Spib her</cc></p>\r\n<p></p>\r\n\r\n<p>Script here</p>\r\n'
		const cues2 = [['DVE=MORBARN', 'INP1=Kam 1', 'INP2=Kam 2', 'BYNAVN=Live/Odense'], unparsedEkstern1, unparsedGrafik1]

		const result = ParseBody(config, '00000000001', 'test-segment', body2, cues2, fields, 0)
		expect(stripExternalId(result)).toEqual(
			literal<PartDefinition[]>([
				literal<PartDefinitionDVE>({
					type: PartType.DVE,
					cues: [
						literal<CueDefinitionDVE>({
							type: CueType.DVE,
							template: 'MORBARN',
							sources: {
								INP1: { ...SOURCE_DEFINITION_KAM_1, raw: 'Kam 1' },
								INP2: { ...SOURCE_DEFINITION_KAM_2, raw: 'Kam 2' }
							},
							labels: ['Live', 'Odense'],
							iNewsCommand: 'DVE'
						})
					],
					title: 'MORBARN',
					script: 'Thid id thr trext for the next DVE\n',
					externalId: '',
					rawType: '',
					fields: {},
					modified: 0,
					storyName: 'test-segment',
					segmentExternalId: '00000000001'
				}),
				literal<PartDefinitionEkstern>({
					type: PartType.REMOTE,
					rawType: '',
					cues: [cueEkstern1, cueGrafik1],
					title: 'LIVE 1',
					script: 'Script here\n',
					externalId: '',
					fields: {},
					modified: 0,
					storyName: 'test-segment',
					segmentExternalId: '00000000001'
				})
			])
		)
	})

	test('test3', () => {
		const body3 =
			'\r\n<p><pi>KAM AR</pi></p>\r\n<p></p>\r\n<p><a idref="0"></a></p>\r\n<p><cc>------vcp digi her-></cc><a idref="8"><cc><----</cc></a></p>\r\n<p></p>\r\n<p>Lots more script</p>\r\n<p></p>\r\n<p>***<pi>SERVER*** </pi></p>\r\n<p><cc>----ss3 Sport LOOP-></cc><a idref="1"><cc><-</cc></a></p>\r\n<p><cc>---bundter herunder---></cc></p>\r\n<p> </p>\r\n<p><a idref="2">   </a></p>\r\n<p><a idref="3"></a></p>\r\n<p> <a idref="4">  </a></p>\r\n<p><a idref="5"></a></p>\r\n<p><a idref="6"></a></p>\r\n<p><a idref="7"></a></p>\r\n<p><pi>SLUTORD: ... ekstra kick</pi></p>\r\n<p></p>\r\n'
		const cues3 = [
			unparsedUnknown,
			unparsedGrafik1,
			unparsedGrafik2,
			unparsedGrafik3,
			unparsedEkstern1,
			unparsedEkstern2,
			unparsedJingle1,
			unparsedJingle2,
			unparsedJingle3
		]

		const result = ParseBody(config, '00000000001', 'test-segment', body3, cues3, fields, 0)
		expect(stripExternalId(result)).toEqual(
			literal<PartDefinition[]>([
				literal<PartDefinitionKam>({
					type: PartType.Kam,
					rawType: 'KAM AR',
					cues: [cueJingle3],
					script: 'Lots more script\n',
					sourceDefinition: { sourceType: SourceType.KAM, id: 'AR', raw: 'KAM AR', minusMic: false, name: 'KAM AR' },
					externalId: '',
					fields: {},
					modified: 0,
					storyName: 'test-segment',
					segmentExternalId: '00000000001'
				}),
				literal<PartDefinitionServer>({
					type: PartType.Server,
					rawType: 'SERVER',
					cues: [cueGrafik1, cueGrafik2, cueGrafik3],
					script: '',
					externalId: '',
					fields: {},
					modified: 0,
					storyName: 'test-segment',
					segmentExternalId: '00000000001'
				}),
				literal<PartDefinitionEkstern>({
					type: PartType.REMOTE,
					rawType: '',
					cues: [cueEkstern1],
					title: 'LIVE 1',
					script: '',
					externalId: '',
					fields: {},
					modified: 0,
					storyName: 'test-segment',
					segmentExternalId: '00000000001'
				}),
				literal<PartDefinitionEkstern>({
					type: PartType.REMOTE,
					rawType: '',
					cues: [cueEkstern2, cueJingle1, cueJingle2],
					title: 'LIVE 2',
					script: '',
					externalId: '',
					fields: {},
					modified: 0,
					storyName: 'test-segment',
					endWords: 'ekstra kick',
					segmentExternalId: '00000000001'
				})
			])
		)
	})

	test('test4', () => {
		const body4 =
			"\r\n<p></p>\r\n<p><a idref='0'></a></p>\r\n<p><pi>CAMERA 1</pi></p>\r\n<p>Her står em masse tekst</p>\r\n"
		const cues4 = [unparsedUnknown]
		const result = ParseBody(config, '00000000001', 'test-segment', body4, cues4, fields, 0)
		expect(stripExternalId(result)).toEqual(
			literal<PartDefinition[]>([
				literal<PartDefinitionKam>({
					type: PartType.Kam,
					rawType: 'CAMERA 1',
					cues: [],
					script: 'Her står em masse tekst\n',
					sourceDefinition: { sourceType: SourceType.KAM, id: '1', raw: 'CAMERA 1', minusMic: false, name: 'KAM 1' },
					externalId: '',
					fields,
					modified: 0,
					storyName: 'test-segment',
					segmentExternalId: '00000000001'
				})
			])
		)
	})

	test('test5', () => {
		const body5 =
			'\r\n<p></p>\r\n<p></p>\r\n<p><pi>KAM 1 </pi></p>\r\n<p><cc>--tlftopt-></cc><a idref="0"><cc><--</cc></a></p>\r\n<p></p>\r\n<p></p>\r\n<p><a idref="1"><pi>************ 100%GRAFIK ***********</pi></a></p>\r\n<p><a idref="4"></a></p>\r\n<p><a idref="3"></a></p>\r\n<p></p>\r\n'
		const cues5 = [unparsedUnknown, unparsedGrafik1, unparsedGrafik2, unparsedGrafik3, unparsedEkstern1]
		const result = ParseBody(config, '00000000001', 'test-segment', body5, cues5, fields, 0)
		expect(stripExternalId(result)).toEqual(
			literal<PartDefinition[]>([
				literal<PartDefinitionKam>({
					type: PartType.Kam,
					rawType: 'KAM 1',
					cues: [],
					script: '',
					sourceDefinition: SOURCE_DEFINITION_KAM_1,
					externalId: '',
					fields: {},
					modified: 0,
					storyName: 'test-segment',
					segmentExternalId: '00000000001'
				}),
				literal<PartDefinitionGrafik>({
					type: PartType.Grafik,
					rawType: '100%GRAFIK',
					cues: [cueGrafik1],
					script: '',
					externalId: '',
					fields: {},
					modified: 0,
					storyName: 'test-segment',
					segmentExternalId: '00000000001'
				}),
				literal<PartDefinitionEkstern>({
					type: PartType.REMOTE,
					rawType: '',
					cues: [cueEkstern1, cueGrafik3],
					title: 'LIVE 1',
					script: '',
					externalId: '',
					fields: {},
					modified: 0,
					storyName: 'test-segment',
					segmentExternalId: '00000000001'
				})
			])
		)
	})

	test('test6', () => {
		const body6 =
			'\r\n<p><pi></pi></p>\r\n<p><pi></pi></p>\r\n<p><pi>KAM 1 </pi></p>\r\n<p><cc>--værter-></cc><a idref="0"><cc><--</cc><pi></pi></a></p>\r\n'
		const cues6 = [unparsedUnknown]
		const result = ParseBody(config, '00000000001', 'test-segment', body6, cues6, fields, 0)
		expect(stripExternalId(result)).toEqual(
			literal<PartDefinition[]>([
				literal<PartDefinitionKam>({
					type: PartType.Kam,
					rawType: 'KAM 1',
					cues: [],
					script: '',
					sourceDefinition: SOURCE_DEFINITION_KAM_1,
					externalId: '',
					fields: {},
					modified: 0,
					storyName: 'test-segment',
					segmentExternalId: '00000000001'
				})
			])
		)
	})

	test('test7', () => {
		const body7 =
			'\r\n<p></p>\r\n<p><a idref="0"></a></p>\r\n<p></p>\r\n<p><pi>***ATTACK*** </pi></p>\r\n<p><cc>----ss3 Sport LOOP-></cc><a idref="1"><cc><-</cc></a></p>\r\n<p><cc>---AR DIGI OUT-></cc><a idref="2"><cc><---</cc></a></p>\r\n<p><cc>---bundter herunder---></cc></p>\r\n<p><a idref="3"></a></p>\r\n<p></p>\r\n<p></p>\r\n<p><pi>SLUTORD:... wauw</pi></p>\r\n<p></p>\r\n<p><pi>KAM 4 </pi></p>\r\n<p><pi>NEDLÆG</pi></p>\r\n<p>Long script. Long script. Long script. Long script. Long script. Long script. Long script. Long script. Long script. Long script. Long script. Long script.</p>\r\n<p></p>\r\n'
		const cues7 = [unparsedUnknown, unparsedGrafik1, unparsedGrafik2, unparsedGrafik3]
		const result = ParseBody(config, '00000000001', 'test-segment', body7, cues7, fields, 0)
		expect(stripExternalId(result)).toEqual(
			literal<PartDefinition[]>([
				literal<PartDefinitionServer>({
					type: PartType.Server,
					rawType: 'ATTACK',
					cues: [cueGrafik1, cueGrafik2, cueGrafik3],
					script: '',
					externalId: '',
					fields: {},
					modified: 0,
					storyName: 'test-segment',
					endWords: 'wauw',
					segmentExternalId: '00000000001'
				}),
				literal<PartDefinitionKam>({
					type: PartType.Kam,
					rawType: 'KAM 4',
					cues: [],
					script:
						'Long script. Long script. Long script. Long script. Long script. Long script. Long script. Long script. Long script. Long script. Long script. Long script.\n',
					sourceDefinition: { sourceType: SourceType.KAM, id: '4', raw: 'KAM 4', minusMic: false, name: 'KAM 4' },
					externalId: '',
					fields: {},
					modified: 0,
					storyName: 'test-segment',
					segmentExternalId: '00000000001'
				})
			])
		)
	})

	test('test8', () => {
		const body8 =
			'\r\n<p><cc>COMMENT OUTSIDE!!</cc></p>\r\n<p><pi>KAM 2</pi></p>\r\n<p><pi>KADA</pi></p>\r\n<p><a idref="0"></a></p>\r\n<p><a idref="1"><a idref="2"></a></a></p>\r\n<p><cc>Efter "BYNAVN=" og efter "#kg direkte"</cc></p>\r\n<p></p>\r\n<p><a idref="3"> <cc>Kilde til optagelse på select-feed.</cc></a></p>\r\n<p></p>\r\n<p>Some script</p>\r\n<p></p>\r\n<p><pi>***LIVE*** </pi></p>\r\n<p><cc>Some script</cc></p>\r\n<p><a idref="4"></a></p>\r\n<p></p>\r\n<p><pi>- Bullet 1?</pi></p>\r\n<p></p>\r\n<p><pi>- Bullet 2?</pi></p>\r\n<p></p>\r\n<p><pi>- Bullet 3?</pi></p>\r\n<p></p>\r\n'
		const cues8 = [unparsedUnknown, unparsedGrafik1, unparsedGrafik2, unparsedGrafik3, unparsedEkstern1]
		const result = ParseBody(config, '00000000001', 'test-segment', body8, cues8, fields, 0)
		expect(stripExternalId(result)).toEqual(
			literal<PartDefinition[]>([
				literal<PartDefinitionKam>({
					type: PartType.Kam,
					rawType: 'KAM 2',
					cues: [cueGrafik1, cueGrafik2, cueGrafik3],
					script: 'Some script\n',
					sourceDefinition: SOURCE_DEFINITION_KAM_2,
					externalId: '',
					fields: {},
					modified: 0,
					storyName: 'test-segment',
					segmentExternalId: '00000000001'
				}),
				literal<PartDefinitionEkstern>({
					type: PartType.REMOTE,
					rawType: '',
					cues: [cueEkstern1],
					title: 'LIVE 1',
					script: '',
					externalId: '',
					fields: {},
					modified: 0,
					storyName: 'test-segment',
					segmentExternalId: '00000000001'
				})
			])
		)
	})

	test('test9', () => {
		const body9 =
			'\r\n<p><cc>COMMENT OUTSIDE!!</cc></p>\r\n<p><pi>KAM 2</pi></p>\r\n<p><a idref="0"></a></p>\r\n<p><a idref="1"><a idref="2"></a></a></p>\r\n<p><cc>Efter "BYNAVN=" og efter "#kg direkte"</cc></p>\r\n<p></p>\r\n<p><a idref="3"> <cc>Kilde til optagelse på select-feed.</cc></a></p>\r\n<p></p>\r\n<p>Some script.</p>\r\n<p></p>\r\n<p>Some more script with "a quote"</p>\r\n<p></p>\r\n<p>Yet more script, this time it\'s a question? </p>\r\n<p></p>\r\n<p><pi>***LIVE*** </pi></p>\r\n<p><cc>More commentary</cc></p>\r\n<p><a idref="4"></a></p>\r\n<p></p>\r\n<p><pi>Danmark? </pi></p>\r\n<p></p>\r\n<p><pi>Grønland en "absurd diskussion"? </pi></p>\r\n<p></p>\r\n<p></p>\r\n'
		const cues9 = [unparsedUnknown, unparsedGrafik1, unparsedGrafik2, unparsedGrafik3, unparsedEkstern1]
		const result = ParseBody(config, '00000000001', 'test-segment', body9, cues9, fields, 0)
		expect(stripExternalId(result)).toEqual(
			literal<PartDefinition[]>([
				literal<PartDefinitionKam>({
					type: PartType.Kam,
					rawType: 'KAM 2',
					cues: [cueGrafik1, cueGrafik2, cueGrafik3],
					script: 'Some script.\nSome more script with "a quote"\nYet more script, this time it\'s a question?\n',
					sourceDefinition: SOURCE_DEFINITION_KAM_2,
					externalId: '',
					fields: {},
					modified: 0,
					storyName: 'test-segment',
					segmentExternalId: '00000000001'
				}),
				literal<PartDefinitionEkstern>({
					type: PartType.REMOTE,
					rawType: '',
					cues: [cueEkstern1],
					title: 'LIVE 1',
					script: '',
					externalId: '',
					fields: {},
					modified: 0,
					storyName: 'test-segment',
					segmentExternalId: '00000000001'
				})
			])
		)
	})

	test('test10', () => {
		const body10 =
			'\r\n<p><pi>KAM 2</pi></p>\r\n<p><a idref="0"></a></p>\r\n<p><a idref="1"><a idref="2"></a></a></p>\r\n<p><cc>Efter "BYNAVN=" og efter "#kg direkte"</cc></p>\r\n<p></p>\r\n<p><a idref="3"> <cc>Kilde til optagelse på select-feed.</cc></a></p>\r\n<p></p>\r\n<p>Question?</p>\r\n<p></p>\r\n<p><pi>Question, but in PI tags?</pi></p>\r\n<p></p>\r\n<p><pi>USA og Danmark?</pi></p>\r\n<p></p>\r\n<p><pi>***LIVE*** </pi></p>\r\n<p><cc>Comment</cc></p>\r\n<p><a idref="4"></a></p>\r\n<p><pi>This line should be ignored</pi></p>\r\n<p></p>\r\n<p><pi>Also this one?</pi></p>\r\n<p></p>\r\n<p><cc>More comments</cc></p>\r\n<p><cc>Even more?</cc></p>\r\n<p><cc></cc></p>\r\n'
		const cues10 = [unparsedUnknown, unparsedGrafik1, unparsedGrafik2, unparsedGrafik3, unparsedEkstern1]
		const result = ParseBody(config, '00000000001', 'test-segment', body10, cues10, fields, 0)
		expect(stripExternalId(result)).toEqual(
			literal<PartDefinition[]>([
				literal<PartDefinitionKam>({
					type: PartType.Kam,
					rawType: 'KAM 2',
					cues: [cueGrafik1, cueGrafik2, cueGrafik3],
					script: 'Question?\n',
					sourceDefinition: SOURCE_DEFINITION_KAM_2,
					externalId: '',
					fields: {},
					modified: 0,
					storyName: 'test-segment',
					segmentExternalId: '00000000001'
				}),
				literal<PartDefinitionEkstern>({
					type: PartType.REMOTE,
					rawType: '',
					cues: [cueEkstern1],
					title: 'LIVE 1',
					script: '',
					externalId: '',
					fields: {},
					modified: 0,
					storyName: 'test-segment',
					segmentExternalId: '00000000001'
				})
			])
		)
	})

	test('test11', () => {
		const body11 =
			'\r\n<p><pi>KAM 1</pi></p>\r\n<p></p>\r\n<p>Some script.</p>\r\n<p><a idref="0"></a></p>\r\n<p><pi>***VO***</pi></p>\r\n<p><a idref="1"></a></p>\r\n<p><pi><b>SB: Say this over this clip (10 sek)</b></pi></p>\r\n<p><a idref="2"></a></p>\r\n<p>More script. </p>\r\n<p></p>\r\n<p>Even more</p>\r\n<p></p>\r\n<p>More script again. </p>\r\n<p></p>\r\n<p><cc>Couple of comments</cc></p>\r\n<p><cc>Should be ignored</cc></p>\r\n<p></p>\r\n'
		const cues11 = [unparsedUnknown, unparsedGrafik1, unparsedGrafik2]
		const result = ParseBody(config, '00000000001', 'test-segment', body11, cues11, fields, 0)
		expect(stripExternalId(result)).toEqual(
			literal<PartDefinition[]>([
				literal<PartDefinitionKam>({
					type: PartType.Kam,
					rawType: 'KAM 1',
					cues: [],
					script: 'Some script.\n',
					sourceDefinition: SOURCE_DEFINITION_KAM_1,
					externalId: '',
					fields: {},
					modified: 0,
					storyName: 'test-segment',
					segmentExternalId: '00000000001'
				}),
				literal<PartDefinitionVO>({
					type: PartType.VO,
					rawType: 'VO',
					cues: [cueGrafik1, cueGrafik2],
					script: 'More script.\nEven more\nMore script again.\n',
					externalId: '',
					fields: {},
					modified: 0,
					storyName: 'test-segment',
					segmentExternalId: '00000000001'
				})
			])
		)
	})

	test('test11a - VOV', () => {
		const body11 =
			'\r\n<p><pi>KAM 1</pi></p>\r\n<p></p>\r\n<p>Some script.</p>\r\n<p><a idref="0"></a></p>\r\n<p><pi>***VOV***</pi></p>\r\n<p><a idref="1"></a></p>\r\n<p><pi><b>SB: Say this over this clip (10 sek)</b></pi></p>\r\n<p><a idref="2"></a></p>\r\n<p>More script. </p>\r\n<p></p>\r\n<p>Even more</p>\r\n<p></p>\r\n<p>More script again. </p>\r\n<p></p>\r\n<p><cc>Couple of comments</cc></p>\r\n<p><cc>Should be ignored</cc></p>\r\n<p></p>\r\n'
		const cues11 = [unparsedUnknown, unparsedGrafik1, unparsedGrafik2]
		const result = ParseBody(config, '00000000001', 'test-segment', body11, cues11, fields, 0)
		expect(stripExternalId(result)).toEqual(
			literal<PartDefinition[]>([
				literal<PartDefinitionKam>({
					type: PartType.Kam,
					rawType: 'KAM 1',
					cues: [],
					script: 'Some script.\n',
					sourceDefinition: SOURCE_DEFINITION_KAM_1,
					externalId: '',
					fields: {},
					modified: 0,
					storyName: 'test-segment',
					segmentExternalId: '00000000001'
				}),
				literal<PartDefinitionVO>({
					type: PartType.VO,
					rawType: 'VOV',
					cues: [cueGrafik1, cueGrafik2],
					script: 'More script.\nEven more\nMore script again.\n',
					externalId: '',
					fields: {},
					modified: 0,
					storyName: 'test-segment',
					segmentExternalId: '00000000001'
				})
			])
		)
	})

	test('test12', () => {
		const body12 =
			'\r\n<p><cc>This is an interview.</cc></p>\r\n<p></p>\r\n<p></p>\r\n<p><pi>KAM 3</pi></p>\r\n<p></p>\r\n<p><a idref="0"><cc> <-- Comment about this</cc></a></p>\r\n<p></p>\r\n<p><a idref="1"> <cc>Also about this! </cc></a></p>\r\n<p></p>\r\n<p><cc>Remember:</cc></p>\r\n<p></p>\r\n<p>Here is our correspondant. </p>\r\n<p></p>\r\n<p>What\'s going on over there? </p>\r\n<p></p>\r\n<p><pi>***LIVE*** </pi></p>\r\n<p><cc>There is a graphic in this part</cc></p>\r\n<p>.</p>\r\n<p></p>\r\n<p><pi>Ask a question? </pi></p>\r\n<p></p>\r\n<p><pi>Ask another?</pi></p>\r\n<p></p>\r\n<p><pi>What\'s the reaction? </pi></p>\r\n<p></p>\r\n<p><a idref="2"></a></p>\r\n<p></p>\r\n'
		const cues12 = [unparsedUnknown, unparsedGrafik1, unparsedGrafik2]
		const result = ParseBody(config, '00000000001', 'test-segment', body12, cues12, fields, 0)
		expect(stripExternalId(result)).toEqual(
			literal<PartDefinition[]>([
				literal<PartDefinitionKam>({
					type: PartType.Kam,
					rawType: 'KAM 3',
					cues: [cueGrafik1, cueGrafik2],
					script: "Here is our correspondant.\nWhat's going on over there?\n.\n",
					sourceDefinition: SOURCE_DEFINITION_KAM_3,
					externalId: '',
					fields: {},
					modified: 0,
					storyName: 'test-segment',
					segmentExternalId: '00000000001'
				})
			])
		)
	})

	test('test13', () => {
		const body13 =
			'\r\n<p><a idref="0"></a></p>\r\n<p></p>\r\n<p></p>\r\n<p></p>\r\n<p></p>\r\n<p></p>\r\n<p></p>\r\n<p></p>\r\n<p></p>\r\n<p></p>\r\n<p></p>\r\n<p></p>\r\n<p></p>\r\n<p></p>\r\n<p></p>\r\n'
		const cues13 = [unparsedUnknown]
		const result = ParseBody(config, '00000000001', 'test-segment', body13, cues13, fields, 0)
		expect(stripExternalId(result)).toEqual(literal<PartDefinition[]>([]))
	})

	test('test14', () => {
		const body14 =
			'\r\n<p></p>\r\n<p><a idref="0"></a></p>\r\n<p>What\'s going on over there?</p>\r\n<p><pi>***LIVE*** </pi></p>\r\n<p><a idref="1"></a></p>\r\n<p><a idref="2"></a></p>\r\n<p><a idref="3"></a></p>\r\n<p><a idref="4"></a></p>\r\n<p><a idref="5"><tab><tab><tab></tab></tab></tab></a></p>\r\n<p></p>\r\n'
		const cues14 = [
			unparsedUnknown,
			unparsedGrafik1,
			unparsedGrafik2,
			unparsedGrafik3,
			unparsedEkstern1,
			unparsedEkstern2
		]
		const result = ParseBody(config, '00000000001', 'test-segment', body14, cues14, fields, 0)
		expect(stripExternalId(result)).toEqual(
			literal<PartDefinition[]>([
				literal<PartDefinitionUnknown>({
					type: PartType.Unknown,
					rawType: '',
					cues: [cueGrafik1, cueGrafik2, cueGrafik3],
					script: "What's going on over there?\n",
					externalId: '',
					fields: {},
					modified: 0,
					storyName: 'test-segment',
					segmentExternalId: '00000000001'
				}),
				literal<PartDefinitionEkstern>({
					type: PartType.REMOTE,
					rawType: '',
					cues: [cueEkstern1],
					title: 'LIVE 1',
					script: '',
					externalId: '',
					fields: {},
					modified: 0,
					storyName: 'test-segment',
					segmentExternalId: '00000000001'
				}),
				literal<PartDefinitionEkstern>({
					type: PartType.REMOTE,
					rawType: '',
					cues: [cueEkstern2],
					title: 'LIVE 2',
					script: '',
					externalId: '',
					fields: {},
					modified: 0,
					storyName: 'test-segment',
					segmentExternalId: '00000000001'
				})
			])
		)
	})

	test('test15', () => {
		const body15 =
			'\r\n<p><cc>---JINGLE sport grafisk intro---></cc><a idref="0"><cc><----</cc></a></p>\r\n<p></p>\r\n<p><cc>---AUDIO til grafisk intro , fortsætter under teasere---></cc><a idref="2"><cc><----</cc></a></p>\r\n<p><a idref="1"></a></p>\r\n'
		const cues15 = [unparsedUnknown, unparsedGrafik1]
		const result = ParseBody(config, '00000000001', 'INTRO', body15, cues15, fields, 0)
		expect(stripExternalId(result)).toEqual(
			literal<PartDefinition[]>([
				literal<PartDefinitionIntro>({
					type: PartType.INTRO,
					rawType: 'INTRO',
					cues: [cueGrafik1],
					script: '',
					externalId: '',
					fields: {},
					modified: 0,
					storyName: 'INTRO',
					segmentExternalId: '00000000001'
				})
			])
		)
	})

	test('test16', () => {
		const body16 =
			'\r\n<p><a idref="0"><pi>KAM 2</pi></a></p>\r\n<p><cc>Husk at lave en DIGI=trompet</cc></p>\r\n<p><cc>OBS: Udfyld kun linje </cc></p>\r\n<p></p>\r\n<p></p>\r\n<p>Hallo, I wnat to tell you......</p>\r\n<p></p>\r\n<p></p>\r\n<p><a idref="1"></a></p>\r\n<p><pi>***SERVER*** </pi></p>\r\n<p></p>\r\n<p><a idref="2"><a idref="3"><a idref="4"><a idref="5"></a></a></a></a></p>\r\n<p><cc>---SS3 19 NYH LOOP--></cc><a idref="6"><cc><----</cc></a></p>\r\n<p></p>\r\n<p></p>\r\n<p><cc>---<b>BUNDTER HERUNDER</b> ---></cc></p>\r\n<p><pi>KAM 2</pi></p>\r\n<p></p>\r\n<p></p>\r\n<p></p>\r\n<p></p>\r\n<p></p>\r\n<p></p>\r\n<p></p>\r\n<p></p>\r\n<p><pi>SLUTORD:</pi></p>\r\n<p></p>\r\n<p><pi>KAM 2</pi></p>\r\n<p><cc>SLET KAMERA HVIS INGEN NEDLÆG</cc></p>\r\n<p></p>\r\n'
		const cues16 = [
			unparsedUnknown,
			unparsedGrafik1,
			unparsedGrafik2,
			unparsedGrafik3,
			unparsedJingle1,
			unparsedJingle2,
			unparsedJingle3
		]
		const result = ParseBody(config, '00000000001', 'test-segment', body16, cues16, fields, 0)
		expect(stripExternalId(result)).toEqual(
			literal<PartDefinition[]>([
				literal<PartDefinitionKam>({
					externalId: '',
					type: PartType.Kam,
					rawType: 'KAM 2',
					script: 'Hallo, I wnat to tell you......\n',
					sourceDefinition: SOURCE_DEFINITION_KAM_2,
					cues: [cueGrafik1],
					fields,
					modified: 0,
					storyName: 'test-segment',
					segmentExternalId: '00000000001'
				}),
				literal<PartDefinitionServer>({
					externalId: '',
					type: PartType.Server,
					rawType: 'SERVER',
					script: '',
					cues: [cueGrafik2, cueGrafik3, cueJingle1, cueJingle2, cueJingle3],
					fields,
					modified: 0,
					storyName: 'test-segment',
					segmentExternalId: '00000000001'
				}),
				literal<PartDefinitionKam>({
					externalId: '',
					type: PartType.Kam,
					rawType: 'KAM 2',
					script: '',
					sourceDefinition: SOURCE_DEFINITION_KAM_2,
					cues: [],
					fields,
					modified: 0,
					storyName: 'test-segment',
					endWords: '',
					segmentExternalId: '00000000001'
				}),
				literal<PartDefinitionKam>({
					externalId: '',
					type: PartType.Kam,
					rawType: 'KAM 2',
					script: '',
					sourceDefinition: SOURCE_DEFINITION_KAM_2,
					cues: [],
					fields,
					modified: 0,
					storyName: 'test-segment',
					segmentExternalId: '00000000001'
				})
			])
		)
	})

	test('test17', () => {
		const body17 =
			'\r\n<p></p>\r\n<p><a idref="1"></a></p>\r\n<p><a idref="2"><pi>KAM 1</pi></a></p>\r\n<p></p>\r\n<p>Single line of script</p>\r\n<p></p>\r\n<p></p>\r\n<p><pi>***SERVER*** </pi></p>\r\n<p></p>\r\n<p><a idref="4"></a></p>\r\n<p><a idref="5"></a></p>\r\n<p><a idref="6"></a></p>\r\n<p><a idref="7"></a></p>\r\n<p><a idref="8"></a></p>\r\n<p><a idref="9"></a></p>\r\n<p><a idref="10"></a></p>\r\n<p></p>\r\n<p><pi>SLUTORD:</pi></p>\r\n<p></p>\r\n<p><pi>Slutord:... Skarpere regler.</pi></p>\r\n<p></p>\r\n<p><pi>KAM 2</pi></p>\r\n<p></p>\r\n<p>And some script.</p>\r\n<p></p>\r\n'
		const cues17 = [
			unparsedUnknown,
			unparsedEkstern1,
			unparsedEkstern2,
			unparsedGrafik1,
			unparsedGrafik2,
			unparsedGrafik3,
			unparsedJingle1,
			unparsedJingle2,
			unparsedJingle3,
			unparsedTelefon1,
			unparsedTelefon2
		]
		const result = ParseBody(config, '00000000001', 'test-segment', body17, cues17, fields, 0)
		expect(stripExternalId(result)).toEqual(
			literal<PartDefinition[]>([
				literal<PartDefinitionEkstern>({
					externalId: '',
					type: PartType.REMOTE,
					rawType: '',
					cues: [cueEkstern1],
					title: 'LIVE 1',
					script: '',
					fields,
					modified: 0,
					storyName: 'test-segment',
					segmentExternalId: '00000000001'
				}),
				literal<PartDefinitionEkstern>({
					externalId: '',
					type: PartType.REMOTE,
					rawType: '',
					cues: [cueEkstern2],
					title: 'LIVE 2',
					script: '',
					fields,
					modified: 0,
					storyName: 'test-segment',
					segmentExternalId: '00000000001'
				}),
				literal<PartDefinitionKam>({
					externalId: '',
					type: PartType.Kam,
					sourceDefinition: SOURCE_DEFINITION_KAM_1,
					rawType: 'KAM 1',
					cues: [],
					script: 'Single line of script\n',
					fields,
					modified: 0,
					storyName: 'test-segment',
					segmentExternalId: '00000000001'
				}),
				literal<PartDefinitionServer>({
					externalId: '',
					type: PartType.Server,
					rawType: 'SERVER',
					cues: [cueGrafik2, cueGrafik3, cueJingle1, cueJingle2, cueJingle3],
					script: '',
					fields,
					modified: 0,
					storyName: 'test-segment',
					segmentExternalId: '00000000001'
				}),
				literal<PartDefinitionTelefon>({
					externalId: '',
					type: PartType.Telefon,
					rawType: '',
					cues: [cueTelefon1],
					script: '',
					fields,
					modified: 0,
					storyName: 'test-segment',
					segmentExternalId: '00000000001'
				}),
				literal<PartDefinitionTelefon>({
					externalId: '',
					type: PartType.Telefon,
					rawType: '',
					cues: [cueTelefon2],
					script: '',
					fields,
					modified: 0,
					storyName: 'test-segment',
					endWords: 'Skarpere regler.',
					segmentExternalId: '00000000001'
				}),
				literal<PartDefinitionKam>({
					externalId: '',
					type: PartType.Kam,
					sourceDefinition: SOURCE_DEFINITION_KAM_2,
					rawType: 'KAM 2',
					cues: [],
					script: 'And some script.\n',
					fields,
					modified: 0,
					storyName: 'test-segment',
					segmentExternalId: '00000000001'
				})
			])
		)
	})

	test('test18', () => {
		const body18 =
			'\r\n<p><pi>***VO EFFEKT 0*** </pi></p>\r\n<p><a idref="0"></a></p>\r\n<p>With some script. </p>\r\n<p></p>\r\n'
		const cues18 = [unparsedGrafik1]
		const result = ParseBody(config, '00000000001', 'test-segment', body18, cues18, fields, 0)
		expect(stripExternalId(result)).toEqual(
			literal<PartDefinition[]>([
				literal<PartDefinitionVO>({
					externalId: '',
					type: PartType.VO,
					effekt: 0,
					rawType: 'VO',
					cues: [cueGrafik1],
					script: 'With some script.\n',
					fields,
					modified: 0,
					storyName: 'test-segment',
					segmentExternalId: '00000000001'
				})
			])
		)
	})

	test('test19', () => {
		const body19 =
			'\r\n<p></p>\r\n<p><pi>KAM 1 EFFEKT 1</pi></p>\r\n<p>Dette er takst</p>\r\n<p></p>\r\n<p><pi>SERVER</pi></p>\r\n<p><a idref="0"></a></p>\r\n<p><a idref="1"></a></p>\r\n<p>STORT BILLEDE AF STUDIE</p>\r\n<p></p>\r\n'
		const cues19 = [unparsedGrafik1, unparsedGrafik2]
		const result = ParseBody(config, '00000000001', 'test-segment', body19, cues19, fields, 0)
		expect(stripExternalId(result)).toEqual(
			literal<PartDefinition[]>([
				literal<PartDefinitionKam>({
					externalId: '',
					type: PartType.Kam,
					sourceDefinition: SOURCE_DEFINITION_KAM_1,
					effekt: 1,
					rawType: 'KAM 1',
					cues: [],
					script: 'Dette er takst\n',
					fields,
					modified: 0,
					storyName: 'test-segment',
					segmentExternalId: '00000000001'
				}),
				literal<PartDefinitionServer>({
					externalId: '',
					type: PartType.Server,
					rawType: 'SERVER',
					cues: [cueGrafik1, cueGrafik2],
					script: 'STORT BILLEDE AF STUDIE\n',
					fields,
					modified: 0,
					storyName: 'test-segment',
					segmentExternalId: '00000000001'
				})
			])
		)
	})

	test('test20', () => {
		const body20 =
			'\r\n<p><cc>OBS: der skal være 2 primære templates mellem 2 breakere</cc></p>\r\n<p><pi>K2 NBA18_LEAD_OUT</pi></p>\r\n<p><a idref="0"></a></p>\r\n<p></p>\r\n<p><tab><tab><tab><tab><tab><tab></tab></tab></tab></tab></tab></tab></p>\r\n<p></p>\r\n'
		const cues20 = [unparsedJingle1]
		const result = ParseBody(config, '00000000001', 'test-segment', body20, cues20, fields, 0)
		expect(stripExternalId(result)).toEqual(
			literal<PartDefinition[]>([
				literal<PartDefinitionUnknown>({
					externalId: '',
					type: PartType.Unknown,
					rawType: '',
					cues: [cueJingle1],
					title: '1',
					script: '',
					fields,
					modified: 0,
					storyName: 'test-segment',
					segmentExternalId: '00000000001'
				})
			])
		)
	})

	test('test21', () => {
		const body21 =
			'\r\n<p><a idref="0"><pi>KAM 2</pi></a></p>\r\n<p><cc>Husk at lave en DIGI=trompet</cc></p>\r\n<p><cc>OBS: Udfyld kun linje </cc></p>\r\n<p></p>\r\n<p></p>\r\n<p>Hallo, I wnat to tell you......</p>\r\n<p>HEREEEELLLLOOOK</p>\r\n<p>YES</p>\r\n<p><a idref="1"></a></p>\r\n<p><pi>***SERVER*** </pi></p>\r\n<p></p>\r\n<p><a idref="2"><a idref="3"><a idref="4"><a idref="5"></a></a></a></a></p>\r\n<p><cc>---SS3 19 NYH LOOP--></cc><a idref="6"><cc><----</cc></a></p>\r\n<p></p>\r\n<p></p>\r\n<p><cc>---<b>BUNDTER HERUNDER</b> ---></cc></p>\r\n<p><pi>KAM 1</pi></p>\r\n<p></p>\r\n<p></p>\r\n<p><pi>KAM 1</pi></p>\r\n<p></p>\r\n<p></p>\r\n<p><pi>SLUTORD:</pi></p>\r\n<p></p>\r\n<p><pi>KAM 1</pi></p>\r\n<p><cc>SLET KAMERA HVIS INGEN NEDLÆG</cc></p>\r\n<p></p>\r\n'
		const cues21 = [
			null,
			null,
			null,
			['kg ident_blank', 'ODENSE', 'KLJ', ';x.xx'],
			['kg bund TEXT MORETEXT', 'Inews', ';x.xx'],
			['kg bund TEXT MORETEXT', 'some@email.fakeTLD', ';x.xx'],
			['SS=3-NYH-19-LOOP', ';0.01']
		]
		const result = ParseBody(config, '00000000001', 'test-segment', body21, cues21, fields, 0)
		expect(stripExternalId(result)).toEqual(
			literal<PartDefinition[]>([
				literal<PartDefinitionKam>({
					externalId: '',
					type: PartType.Kam,
					sourceDefinition: SOURCE_DEFINITION_KAM_2,
					rawType: 'KAM 2',
					cues: [],
					script: 'Hallo, I wnat to tell you......\nHEREEEELLLLOOOK\nYES\n',
					fields,
					modified: 0,
					storyName: 'test-segment',
					segmentExternalId: '00000000001'
				}),
				literal<PartDefinitionServer>({
					externalId: '',
					type: PartType.Server,
					rawType: 'SERVER',
					cues: literal<CueDefinition[]>([
						literal<CueDefinitionGraphic<GraphicInternal>>({
							type: CueType.Graphic,
							target: 'OVL',
							graphic: {
								type: 'internal',
								template: 'ident_blank',
								cue: 'kg',
								textFields: ['ODENSE', 'KLJ']
							},
							adlib: true,
							iNewsCommand: 'kg'
						}),
						literal<CueDefinitionGraphic<GraphicInternal>>({
							type: CueType.Graphic,
							target: 'OVL',
							graphic: {
								type: 'internal',
								template: 'bund',
								cue: 'kg',
								textFields: ['TEXT MORETEXT', 'Inews']
							},
							adlib: true,
							iNewsCommand: 'kg'
						}),
						literal<CueDefinitionGraphic<GraphicInternal>>({
							type: CueType.Graphic,
							target: 'OVL',
							graphic: {
								type: 'internal',
								template: 'bund',
								cue: 'kg',
								textFields: ['TEXT MORETEXT', 'some@email.fakeTLD']
							},
							adlib: true,
							iNewsCommand: 'kg'
						}),
						literal<CueDefinitionUnpairedTarget>({
							type: CueType.UNPAIRED_TARGET,
							target: 'WALL',
							start: {
								seconds: 1
							},
							iNewsCommand: 'SS'
						})
					]),
					script: '',
					fields,
					modified: 0,
					storyName: 'test-segment',
					segmentExternalId: '00000000001'
				}),
				literal<PartDefinitionKam>({
					externalId: '',
					type: PartType.Kam,
					sourceDefinition: SOURCE_DEFINITION_KAM_1,
					rawType: 'KAM 1',
					cues: [],
					script: '',
					fields,
					modified: 0,
					storyName: 'test-segment',
					segmentExternalId: '00000000001'
				}),
				literal<PartDefinitionKam>({
					externalId: '',
					type: PartType.Kam,
					sourceDefinition: SOURCE_DEFINITION_KAM_1,
					rawType: 'KAM 1',
					cues: [],
					script: '',
					fields,
					modified: 0,
					storyName: 'test-segment',
					endWords: '',
					segmentExternalId: '00000000001'
				}),
				literal<PartDefinitionKam>({
					externalId: '',
					type: PartType.Kam,
					sourceDefinition: SOURCE_DEFINITION_KAM_1,
					rawType: 'KAM 1',
					cues: [],
					script: '',
					fields,
					modified: 0,
					storyName: 'test-segment',
					segmentExternalId: '00000000001'
				})
			])
		)
	})

	test('test-22', () => {
		const body22 =
			'\r\n<p><cc>Tlf nummer på gæst:</cc></p>\r\n<p><cc>By/land:</cc></p>\r\n<p></p>\r\n<p><pi>KAM 1</pi></p>\r\n<p></p>\r\n<p>Skriv spib her</p>\r\n<p></p>\r\n<p></p>\r\n<p><cc>-----></cc><a idref="0"><cc><-----Skriv navnet på Viz-scenen ind på anden linje i TELEFON=TLF </cc></a></p>\r\n<p><a idref="1"></a></p>\r\n<p></p>\r\n<p><pi>***LIVE*** </pi></p>\r\n<p></p>\r\n<p><cc>-----></cc><a idref="2"><cc><----- Skriv </cc></a></p>\r\n<p></p>\r\n<p></p>\r\n<p></p>\r\n<p><cc>Vejledning til grafik:</cc></p>\r\n<p><cc>(Grafik laves i VCP, vælg baggrund AVID. Tid i direkte skal være ;0.00-S</cc></p>\r\n<p><cc>Så bliver tlfdirekte og tlftoplive på indtil der klippes til næste punkt.)</cc></p>\r\n<p></p>\r\n'
		const cues22 = [
			['TELEFON=TLF 2', 'kg bund', 'TEXT MORETEXT', 'some@email.fakeTLD', ';0.02'],
			['kg tlfdirekte Odense', ';0.00-S'],
			['kg tlftoptlive', 'TEXT MORETEXT', 'place', ';0.00-S']
		]
		const result = ParseBody(config, '00000000001', 'test-segment', body22, cues22, fields, 0)
		expect(stripExternalId(result)).toEqual(
			literal<PartDefinition[]>([
				literal<PartDefinitionKam>({
					externalId: '',
					type: PartType.Kam,
					sourceDefinition: SOURCE_DEFINITION_KAM_1,
					rawType: 'KAM 1',
					cues: [],
					script: 'Skriv spib her\n',
					fields,
					modified: 0,
					storyName: 'test-segment',
					segmentExternalId: '00000000001'
				}),
				literal<PartDefinitionTelefon>({
					externalId: '',
					type: PartType.Telefon,
					rawType: '',
					cues: [
						literal<CueDefinitionTelefon>({
							type: CueType.Telefon,
							source: 'TLF 2',
							iNewsCommand: 'TELEFON',
							graphic: literal<CueDefinitionGraphic<GraphicInternal>>({
								type: CueType.Graphic,
								target: 'OVL',
								graphic: {
									type: 'internal',
									template: 'bund',
									cue: 'kg',
									textFields: ['TEXT MORETEXT', 'some@email.fakeTLD']
								},
								start: {
									seconds: 2
								},
								iNewsCommand: 'kg'
							})
						}),
						literal<CueDefinitionGraphic<GraphicInternal>>({
							type: CueType.Graphic,
							target: 'OVL',
							graphic: {
								type: 'internal',
								template: 'tlfdirekte',
								cue: 'kg',
								textFields: ['Odense']
							},
							start: {
								seconds: 0
							},
							end: {
								infiniteMode: 'S'
							},
							iNewsCommand: 'kg'
						}),
						literal<CueDefinitionGraphic<GraphicInternal>>({
							type: CueType.Graphic,
							target: 'OVL',
							graphic: {
								type: 'internal',
								template: 'tlftoptlive',
								cue: 'kg',
								textFields: ['TEXT MORETEXT', 'place']
							},
							start: {
								seconds: 0
							},
							end: {
								infiniteMode: 'S'
							},
							iNewsCommand: 'kg'
						})
					],
					script: '',
					fields,
					modified: 0,
					storyName: 'test-segment',
					segmentExternalId: '00000000001'
				})
			])
		)
	})

	test('test-23', () => {
		const body22 =
			'\r\n<p><cc>Tlf nummer på gæst:</cc></p>\r\n<p><cc>By/land:</cc></p>\r\n<p></p>\r\n<p><pi>KAM 1 MIX 200</pi></p>\r\n<p></p>\r\n<p>Skriv spib her</p>\r\n<p></p>\r\n<p></p>\r\n<p><cc>-----></cc><a idref="0"><cc><-----Skriv navnet på Viz-scenen ind på anden linje i TELEFON=TLF </cc></a></p>\r\n<p><a idref="1"></a></p>\r\n<p></p>\r\n<p><pi>***LIVE*** DIP 300</pi></p>\r\n<p></p>\r\n<p><cc>-----></cc><a idref="2"><cc><----- Skriv </cc></a></p>\r\n<p></p>\r\n<p></p>\r\n<p></p>\r\n<p><cc>Vejledning til grafik:</cc></p>\r\n<p><cc>(Grafik laves i VCP, vælg baggrund AVID. Tid i direkte skal være ;0.00-S</cc></p>\r\n<p><cc>Så bliver tlfdirekte og tlftoplive på indtil der klippes til næste punkt.)</cc></p>\r\n<p></p>\r\n'
		const cues22 = [
			['TELEFON=TLF 2', 'kg bund', 'TEXT MORETEXT', 'some@email.fakeTLD', ';0.02'],
			['kg tlfdirekte Odense', ';0.00-S'],
			['kg tlftoptlive', 'TEXT MORETEXT', 'Place', ';0.00-S']
		]
		const result = ParseBody(config, '00000000001', 'test-segment', body22, cues22, fields, 0)
		expect(stripExternalId(result)).toEqual(
			literal<PartDefinition[]>([
				literal<PartDefinitionKam>({
					externalId: '',
					type: PartType.Kam,
					sourceDefinition: SOURCE_DEFINITION_KAM_1,
					transition: {
						style: TSR.AtemTransitionStyle.MIX,
						duration: 200
					},
					rawType: 'KAM 1',
					cues: [],
					script: 'Skriv spib her\n',
					fields,
					modified: 0,
					storyName: 'test-segment',
					segmentExternalId: '00000000001'
				}),
				literal<PartDefinitionTelefon>({
					externalId: '',
					type: PartType.Telefon,
					rawType: '',
					cues: [
						literal<CueDefinitionTelefon>({
							type: CueType.Telefon,
							source: 'TLF 2',
							graphic: literal<CueDefinitionGraphic<GraphicInternal>>({
								type: CueType.Graphic,
								target: 'OVL',
								graphic: {
									type: 'internal',
									template: 'bund',
									cue: 'kg',
									textFields: ['TEXT MORETEXT', 'some@email.fakeTLD']
								},
								start: {
									seconds: 2
								},
								iNewsCommand: 'kg'
							}),
							iNewsCommand: 'TELEFON'
						}),
						literal<CueDefinitionGraphic<GraphicInternal>>({
							type: CueType.Graphic,
							target: 'OVL',
							graphic: {
								type: 'internal',
								template: 'tlfdirekte',
								cue: 'kg',
								textFields: ['Odense']
							},
							start: {
								seconds: 0
							},
							end: {
								infiniteMode: 'S'
							},
							iNewsCommand: 'kg'
						}),
						literal<CueDefinitionGraphic<GraphicInternal>>({
							type: CueType.Graphic,
							target: 'OVL',
							graphic: {
								type: 'internal',
								template: 'tlftoptlive',
								cue: 'kg',
								textFields: ['TEXT MORETEXT', 'Place']
							},
							start: {
								seconds: 0
							},
							end: {
								infiniteMode: 'S'
							},
							iNewsCommand: 'kg'
						})
					],
					script: '',
					fields,
					modified: 0,
					storyName: 'test-segment',
					segmentExternalId: '00000000001'
				})
			])
		)
	})

	test('test 24', () => {
		const body18 =
			'\r\n<p><pi>***VOSB EFFEKT 0*** </pi></p>\r\n<p><a idref="0"></a></p>\r\n<p>Some script. </p>\r\n<p></p>\r\n'
		const cues18 = [unparsedGrafik1]
		const result = ParseBody(config, '00000000001', 'test-segment', body18, cues18, fields, 0)
		expect(stripExternalId(result)).toEqual(
			literal<PartDefinition[]>([
				literal<PartDefinitionVO>({
					externalId: '',
					type: PartType.VO,
					effekt: 0,
					rawType: 'VOSB',
					cues: [cueGrafik1],
					script: 'Some script.\n',
					fields,
					modified: 0,
					storyName: 'test-segment',
					segmentExternalId: '00000000001'
				})
			])
		)
	})

	test('test 25', () => {
		const body18 =
			'\r\n<p><pi>***VOSB EFFEKT 0*** </pi></p>\r\n<p><a idref="0"></a></p>\r\n<p><pi>Some script here, possibly a note to the presenter</pi></p>\r\n<p>Some script. </p>\r\n<p></p>\r\n'
		const cues18 = [unparsedGrafik1]
		const result = ParseBody(config, '00000000001', 'test-segment', body18, cues18, fields, 0)
		expect(stripExternalId(result)).toEqual(
			literal<PartDefinition[]>([
				literal<PartDefinitionVO>({
					externalId: '',
					type: PartType.VO,
					effekt: 0,
					rawType: 'VOSB',
					cues: [cueGrafik1],
					script: 'Some script.\n',
					fields,
					modified: 0,
					storyName: 'test-segment',
					segmentExternalId: '00000000001'
				})
			])
		)
	})

	test('test 26', () => {
		const body26 =
			'\r\n<p></p>\r\n<p></p>\r\n<p><pi>KAM 1 </pi></p>\r\n<p><cc>--tlftopt-></cc><a idref="0"><cc><--</cc></a></p>\r\n<p></p>\r\n<p></p>\r\n<p><a idref="1"><pi>************ 100%GRAFIK ***********</pi></a></p>\r\n<p><a idref="4"></a></p>\r\n<p><a idref="3"></a></p>\r\n<p></p>\r\n'
		const cues26 = [
			['kg tlftoptlive Dette er tlf top', 'Tester', ';0.00'],
			['GRAFIK=full'],
			null,
			['kg tlfdirekte KØBENHAVN', ';0.00'],
			[
				']] S3.0 M 0 [[',
				'cg4 ]] 2 YNYAB 0 [[ pilotdata',
				'TELEFON/KORT//LIVE_KABUL',
				'VCPID=2552305',
				'ContinueCount=3',
				'TELEFON/KORT//LIVE_KABUL'
			]
		]
		const result = ParseBody(config, '00000000001', 'test-segment', body26, cues26, fields, 0)
		expect(stripExternalId(result)).toEqual([
			literal<PartDefinitionKam>({
				externalId: '',
				type: PartType.Kam,
				sourceDefinition: SOURCE_DEFINITION_KAM_1,
				rawType: 'KAM 1',
				cues: [
					literal<CueDefinitionGraphic<GraphicInternal>>({
						type: CueType.Graphic,
						target: 'OVL',
						graphic: {
							type: 'internal',
							template: 'tlftoptlive',
							cue: 'kg',
							textFields: ['Dette er tlf top', 'Tester']
						},
						start: {
							seconds: 0
						},
						iNewsCommand: 'kg'
					})
				],
				fields,
				modified: 0,
				script: '',
				storyName: 'test-segment',
				segmentExternalId: '00000000001'
			}),
			literal<PartDefinitionGrafik>({
				externalId: '',
				type: PartType.Grafik,
				rawType: '100%GRAFIK',
				cues: [
					literal<CueDefinitionGraphic<GraphicPilot>>({
						type: CueType.Graphic,
						target: 'FULL',
						graphic: {
							type: 'pilot',
							name: 'TELEFON/KORT//LIVE_KABUL',
							vcpid: 2552305,
							continueCount: 3
						},
						start: {
							seconds: 0
						},
						iNewsCommand: 'GRAFIK'
					}),
					literal<CueDefinitionGraphic<GraphicInternal>>({
						type: CueType.Graphic,
						target: 'OVL',
						graphic: {
							type: 'internal',
							template: 'tlfdirekte',
							cue: 'kg',
							textFields: ['KØBENHAVN']
						},
						start: {
							seconds: 0
						},
						iNewsCommand: 'kg'
					})
				],
				title: 'TELEFON/KORT//LIVE_KABUL',
				fields,
				modified: 0,
				script: '',
				storyName: 'test-segment',
				segmentExternalId: '00000000001'
			})
		])
	})

	test('test 27a', () => {
		const body27 =
			'\r\n<p></p>\r\n<p></p>\r\n<p><pi>EVS 1</pi></p>\r\n<p></p>\r\n<p></p>\r\n<p><a idref="0"><a idref="1"><a idref="2"></a></a></a></p>\r\n<p></p>\r\n<p></p>\r\n<p></p>\r\n<p></p>\r\n<p>Skriv din spib her</p>\r\n<p></p>\r\n'
		const cues27 = [unparsedGrafik1, unparsedGrafik2, unparsedGrafik3]
		const result = ParseBody(config, '00000000001', 'test-segment', body27, cues27, fields, 0)
		expect(stripExternalId(result)).toEqual([
			literal<PartDefinitionEVS>({
				externalId: '',
				type: PartType.EVS,
				rawType: 'EVS 1',
				sourceDefinition: {
					sourceType: SourceType.REPLAY,
					id: 'EVS 1',
					name: 'EVS 1',
					raw: 'EVS 1',
					vo: false
				},
				cues: [cueGrafik1, cueGrafik2, cueGrafik3],
				fields,
				modified: 0,
				script: 'Skriv din spib her\n',
				storyName: 'test-segment',
				segmentExternalId: '00000000001'
			})
		])
	})

	test('test 27b', () => {
		const body27 =
			'\r\n<p></p>\r\n<p></p>\r\n<p><pi>EVS1VOV</pi></p>\r\n<p></p>\r\n<p></p>\r\n<p><a idref="0"><a idref="1"><a idref="2"></a></a></a></p>\r\n<p></p>\r\n<p></p>\r\n<p></p>\r\n<p></p>\r\n<p>Skriv din spib her</p>\r\n<p></p>\r\n'
		const cues27 = [unparsedGrafik1, unparsedGrafik2, unparsedGrafik3]
		const result = ParseBody(config, '00000000001', 'test-segment', body27, cues27, fields, 0)
		expect(stripExternalId(result)).toEqual([
			literal<PartDefinitionEVS>({
				externalId: '',
				type: PartType.EVS,
				rawType: 'EVS1VOV',
				sourceDefinition: {
					sourceType: SourceType.REPLAY,
					id: 'EVS 1',
					name: 'EVS 1 VOV',
					raw: 'EVS1VOV',
					vo: true
				},
				cues: [cueGrafik1, cueGrafik2, cueGrafik3],
				fields,
				modified: 0,
				script: 'Skriv din spib her\n',
				storyName: 'test-segment',
				segmentExternalId: '00000000001'
			})
		])
	})

	test('test 27c: accepts spaces in EVS VO red text', () => {
		const body27 =
			'\r\n<p><pi>EVS 1 VO</pi></p>\r\n<p><pi>EVS 2VO</pi></p>\r\n<p><pi>EVS3VO</pi></p>\r\n<p><pi>EVS4 VO</pi></p>\r\n'
		const result = ParseBody(config, '00000000001', 'test-segment', body27, [], fields, 0)
		expect(stripExternalId(result)).toEqual([
			literal<PartDefinitionEVS>({
				externalId: '',
				type: PartType.EVS,
				rawType: 'EVS 1 VO',
				sourceDefinition: {
					sourceType: SourceType.REPLAY,
					id: 'EVS 1',
					name: 'EVS 1 VO',
					raw: 'EVS 1 VO',
					vo: true
				},
				cues: [],
				fields,
				modified: 0,
				script: '',
				storyName: 'test-segment',
				segmentExternalId: '00000000001'
			}),
			literal<PartDefinitionEVS>({
				externalId: '',
				type: PartType.EVS,
				rawType: 'EVS 2VO',
				sourceDefinition: {
					sourceType: SourceType.REPLAY,
					id: 'EVS 2',
					name: 'EVS 2 VO',
					raw: 'EVS 2VO',
					vo: true
				},
				cues: [],
				fields,
				modified: 0,
				script: '',
				storyName: 'test-segment',
				segmentExternalId: '00000000001'
			}),
			literal<PartDefinitionEVS>({
				externalId: '',
				type: PartType.EVS,
				rawType: 'EVS3VO',
				sourceDefinition: {
					sourceType: SourceType.REPLAY,
					id: 'EVS 3',
					name: 'EVS 3 VO',
					raw: 'EVS3VO',
					vo: true
				},
				cues: [],
				fields,
				modified: 0,
				script: '',
				storyName: 'test-segment',
				segmentExternalId: '00000000001'
			}),
			literal<PartDefinitionEVS>({
				externalId: '',
				type: PartType.EVS,
				rawType: 'EVS4 VO',
				sourceDefinition: {
					sourceType: SourceType.REPLAY,
					id: 'EVS 4',
					name: 'EVS 4 VO',
					raw: 'EVS4 VO',
					vo: true
				},
				cues: [],
				fields,
				modified: 0,
				script: '',
				storyName: 'test-segment',
				segmentExternalId: '00000000001'
			})
		])
	})

	test('test 28', () => {
		const body28 =
			'\r\n<p><pi>****SERVER****</pi></a></p>\r\n<p><a idref="0"></a><cc>---</cc><a idref="1"></a></p>\r\n<p><a idref="2"></a></p>\r\n<p><pi>SLUTORD:... bare mega fedt</pi></p>\r\n<p></p>\r\n<p><cc>Big body of comment text. Big body of comment text. Big body of comment text. Big body of comment text. Big body of comment text. Big body of comment text. Big body of comment text. Big body of comment text. </cc></p>\r\n<p></p>\r\n<p><pi>****LIVE****</pi></p>\r\n<p></p>\r\n<p><a idref="3"></a><a idref="4"></a></p>\r\n<p>Some Script here</p>\r\n<p></p>\r\n'
		const cues28 = [
			['SS=SC-LOOP', ';0.00.01'],
			['TEMA=sport_kortnyt', 'TEMA SPORT KORT NYT', ';0.00-S'],
			['#kg bund TEXT MORETEXT', 'Triatlet', ';0.00'],
			['DVE=SOMMERFUGL', 'INP1=KAM 1', 'INP2=LIVE 2', 'BYNAVN=Rodovre'],
			['EKSTERN=LIVE 2']
		]
		const result = ParseBody(config, '00000000001', 'test-segment', body28, cues28, fields, 0)
		expect(stripExternalId(result)).toEqual([
			literal<PartDefinitionServer>({
				externalId: '',
				type: PartType.Server,
				rawType: 'SERVER',
				cues: [
					literal<CueDefinitionGraphic<GraphicInternal>>({
						type: CueType.Graphic,
						target: 'WALL',
						graphic: {
							type: 'internal',
							template: 'SC_LOOP_ON',
							textFields: [],
							cue: 'SC-LOOP'
						},
						start: {
							seconds: 0,
							frames: 1
						},
						iNewsCommand: 'SS'
					}),
					literal<CueDefinitionGraphic<GraphicInternal>>({
						type: CueType.Graphic,
						target: 'OVL',
						graphic: {
							type: 'internal',
							template: 'bund',
							cue: '#kg',
							textFields: ['TEXT MORETEXT', 'Triatlet']
						},
						start: {
							seconds: 0
						},
						iNewsCommand: '#kg'
					})
				],
				script: '',
				fields,
				modified: 0,
				storyName: 'test-segment',
				endWords: 'bare mega fedt',
				segmentExternalId: '00000000001'
			}),
			literal<PartDefinitionDVE>({
				externalId: '',
				type: PartType.DVE,
				rawType: '',
				cues: [
					literal<CueDefinitionDVE>({
						type: CueType.DVE,
						template: 'SOMMERFUGL',
						sources: {
							INP1: SOURCE_DEFINITION_KAM_1,
							INP2: SOURCE_DEFINITION_LIVE_2
						},
						labels: ['Rodovre'],
						iNewsCommand: 'DVE'
					})
				],
				title: 'SOMMERFUGL',
				script: '',
				fields,
				modified: 0,
				storyName: 'test-segment',
				segmentExternalId: '00000000001'
			}),
			literal<PartDefinitionEkstern>({
				externalId: '',
				type: PartType.REMOTE,
				rawType: '',
				cues: [cueEkstern2],
				title: 'LIVE 2',
				script: 'Some Script here\n',
				fields,
				modified: 0,
				storyName: 'test-segment',
				segmentExternalId: '00000000001'
			})
		])
	})

	test('test 29', () => {
		const body29 =
			'\r\n<p></p>\r\n<p><a idref="1"><a idref="2"></p>\r\n<p><pi>KAM 1</pi></p>\r\n<p></p>\r\n<p>Some script.</p>\r\n<p></p>\r\n<p></p>\r\n<p><pi>***SERVER*** </pi></p>\r\n<p></p>\r\n<p><a idref="4"></a></p>\r\n<p><a idref="5"></a></p>\r\n<p><a idref="6"></a></p>\r\n<p><a idref="7"></a></p>\r\n<p><a idref="8"></a></p>\r\n<p><a idref="9"></a></p>\r\n<p><a idref="10"></a></p>\r\n<p></p>\r\n<p><pi>SLUTORD:</pi></p>\r\n<p></p>\r\n<p><pi>Slutord:... Skarpere regler.</pi></p>\r\n<p></p>\r\n<p><pi>KAM 2</pi></p>\r\n<p></p>\r\n<p>Some script.</p>\r\n<p></p>\r\n'
		const cues29 = [
			unparsedUnknown,
			unparsedEkstern1,
			unparsedEkstern2,
			unparsedGrafik1,
			unparsedGrafik2,
			unparsedGrafik3,
			unparsedJingle1,
			unparsedJingle2,
			unparsedJingle3,
			unparsedTelefon1,
			unparsedTelefon2
		]
		const result = ParseBody(config, '00000000001', 'test-segment', body29, cues29, fields, 0)
		expect(stripExternalId(result)).toEqual(
			literal<PartDefinition[]>([
				literal<PartDefinitionEkstern>({
					externalId: '',
					type: PartType.REMOTE,
					rawType: '',
					cues: [cueEkstern1],
					title: 'LIVE 1',
					script: '',
					fields,
					modified: 0,
					storyName: 'test-segment',
					segmentExternalId: '00000000001'
				}),
				literal<PartDefinitionEkstern>({
					externalId: '',
					type: PartType.REMOTE,
					rawType: '',
					cues: [cueEkstern2],
					title: 'LIVE 2',
					script: '',
					fields,
					modified: 0,
					storyName: 'test-segment',
					segmentExternalId: '00000000001'
				}),
				literal<PartDefinitionKam>({
					externalId: '',
					type: PartType.Kam,
					sourceDefinition: SOURCE_DEFINITION_KAM_1,
					rawType: 'KAM 1',
					cues: [],
					script: 'Some script.\n',
					fields,
					modified: 0,
					storyName: 'test-segment',
					segmentExternalId: '00000000001'
				}),
				literal<PartDefinitionServer>({
					externalId: '',
					type: PartType.Server,
					rawType: 'SERVER',
					cues: [cueGrafik2, cueGrafik3, cueJingle1, cueJingle2, cueJingle3],
					script: '',
					fields,
					modified: 0,
					storyName: 'test-segment',
					segmentExternalId: '00000000001'
				}),
				literal<PartDefinitionTelefon>({
					externalId: '',
					type: PartType.Telefon,
					rawType: '',
					cues: [cueTelefon1],
					script: '',
					fields,
					modified: 0,
					storyName: 'test-segment',
					segmentExternalId: '00000000001'
				}),
				literal<PartDefinitionTelefon>({
					externalId: '',
					type: PartType.Telefon,
					rawType: '',
					cues: [cueTelefon2],
					script: '',
					fields,
					modified: 0,
					storyName: 'test-segment',
					endWords: 'Skarpere regler.',
					segmentExternalId: '00000000001'
				}),
				literal<PartDefinitionKam>({
					externalId: '',
					type: PartType.Kam,
					sourceDefinition: SOURCE_DEFINITION_KAM_2,
					rawType: 'KAM 2',
					cues: [],
					script: 'Some script.\n',
					fields,
					modified: 0,
					storyName: 'test-segment',
					segmentExternalId: '00000000001'
				})
			])
		)
	})

	test('test 30', () => {
		const body30 =
			'\r\n<p></p>\r\n<p><cc>Comments</cc></p>\r\n<p><pi>***LIVE***</pi><a idref="0"><a idref="1"></p>\r\n<p>And some script</p>\r\n<p><pi>***SERVER***</pi></p>\r\n<p>Server script</p>\r\n<p><a idref="2"><cc>--></cc><a idref="3"><cc><--</cc>\r\n<p><cc>More comments</cc></p>\r\n<p><a idref="4"></p>\r\n<p><pi>SLUTORD: bare mega fedt</pi></p>\r\n'
		const cues30 = [
			['DVE=SOMMERFUGL', 'INP1=KAM 1', 'INP2=LIVE 2', 'BYNAVN=Rodovre'],
			['EKSTERN=LIVE 2'],
			['SS=SC-LOOP', ';0.00.01'],
			['TEMA=sport_kortnyt', 'TEMA SPORT KORT NYT', ';0.00-S'],
			['#kg bund TEXT MORETEXT', 'Triatlet', ';0.00']
		]
		const result = ParseBody(config, '00000000001', 'test-segment', body30, cues30, fields, 0)
		expect(stripExternalId(result)).toEqual([
			literal<PartDefinitionDVE>({
				externalId: '',
				type: PartType.DVE,
				rawType: '',
				cues: [
					literal<CueDefinitionDVE>({
						type: CueType.DVE,
						template: 'SOMMERFUGL',
						sources: {
							INP1: SOURCE_DEFINITION_KAM_1,
							INP2: SOURCE_DEFINITION_LIVE_2
						},
						labels: ['Rodovre'],
						iNewsCommand: 'DVE'
					})
				],
				title: 'SOMMERFUGL',
				script: '',
				fields,
				modified: 0,
				storyName: 'test-segment',
				segmentExternalId: '00000000001'
			}),
			literal<PartDefinitionEkstern>({
				externalId: '',
				type: PartType.REMOTE,
				rawType: '',
				cues: [cueEkstern2],
				title: 'LIVE 2',
				script: 'And some script\n',
				fields,
				modified: 0,
				storyName: 'test-segment',
				segmentExternalId: '00000000001'
			}),
			literal<PartDefinitionServer>({
				externalId: '',
				type: PartType.Server,
				rawType: 'SERVER',
				cues: [
					literal<CueDefinitionGraphic<GraphicInternal>>({
						type: CueType.Graphic,
						target: 'WALL',
						graphic: {
							type: 'internal',
							template: 'SC_LOOP_ON',
							textFields: [],
							cue: 'SC-LOOP'
						},
						start: {
							seconds: 0,
							frames: 1
						},
						iNewsCommand: 'SS'
					}),
					literal<CueDefinitionGraphic<GraphicInternal>>({
						type: CueType.Graphic,
						target: 'OVL',
						graphic: {
							type: 'internal',
							template: 'bund',
							cue: '#kg',
							textFields: ['TEXT MORETEXT', 'Triatlet']
						},
						start: {
							seconds: 0
						},
						iNewsCommand: '#kg'
					})
				],
				script: 'Server script\n',
				fields,
				modified: 0,
				storyName: 'test-segment',
				endWords: 'bare mega fedt',
				segmentExternalId: '00000000001'
			})
		])
	})

	test('test 31', () => {
		const body31 =
			'\r\n<p></p>\r\n<p><a idref="0"></a><cc>--TEMA kort nyt--></cc><a idref="1"></a><cc><---</cc>\r\n<p><cc>Some comment</cc></p>\r\n<p><a idref="2"></a></p>\r\n<p><pi>SLUTORD: bare mega fedt</pi></p>\r\n<p><cc>Some more comment</cc></p>\r\n<p><pi>***LIVE***</pi></p>\r\n<p><a idref="3"></a><a idref="4"></a></p>\r\n<p>Some script</p>\r\n<p><pi>***SERVER***</pi></p>'
		const cues31 = [
			['SS=SC-LOOP', ';0.00.01'],
			['TEMA=sport_kortnyt', 'TEMA SPORT KORT NYT', ';0.00-S'],
			['#kg bund TEXT MORETEXT', 'Triatlet', ';0.00'],
			['DVE=SOMMERFUGL', 'INP1=KAM 1', 'INP2=LIVE 2', 'BYNAVN=Rodovre'],
			['EKSTERN=LIVE 2']
		]
		const result = ParseBody(config, '00000000001', 'test-segment', body31, cues31, fields, 0)
		expect(stripExternalId(result)).toEqual([
			literal<PartDefinitionUnknown>({
				externalId: '',
				type: PartType.Unknown,
				rawType: '',
				cues: [
					literal<CueDefinitionGraphic<GraphicInternal>>({
						type: CueType.Graphic,
						target: 'WALL',
						graphic: {
							type: 'internal',
							template: 'SC_LOOP_ON',
							textFields: [],
							cue: 'SC-LOOP'
						},
						start: {
							seconds: 0,
							frames: 1
						},
						iNewsCommand: 'SS'
					}),
					literal<CueDefinitionGraphic<GraphicInternal>>({
						type: CueType.Graphic,
						target: 'OVL',
						graphic: {
							type: 'internal',
							template: 'bund',
							cue: '#kg',
							textFields: ['TEXT MORETEXT', 'Triatlet']
						},
						start: {
							seconds: 0
						},

						iNewsCommand: '#kg'
					})
				],
				script: '',
				fields,
				modified: 0,
				storyName: 'test-segment',
				endWords: 'bare mega fedt',
				segmentExternalId: '00000000001'
			}),
			literal<PartDefinitionDVE>({
				externalId: '',
				type: PartType.DVE,
				rawType: '',
				cues: [
					literal<CueDefinitionDVE>({
						type: CueType.DVE,
						template: 'SOMMERFUGL',
						sources: {
							INP1: SOURCE_DEFINITION_KAM_1,
							INP2: SOURCE_DEFINITION_LIVE_2
						},
						labels: ['Rodovre'],
						iNewsCommand: 'DVE'
					})
				],
				title: 'SOMMERFUGL',
				script: '',
				fields,
				modified: 0,
				storyName: 'test-segment',
				segmentExternalId: '00000000001'
			}),
			literal<PartDefinitionEkstern>({
				externalId: '',
				type: PartType.REMOTE,
				rawType: '',
				cues: [cueEkstern2],
				script: 'Some script\n',
				title: 'LIVE 2',
				fields,
				modified: 0,
				storyName: 'test-segment',
				segmentExternalId: '00000000001'
			}),
			literal<PartDefinitionServer>({
				externalId: '',
				type: PartType.Server,
				rawType: 'SERVER',
				cues: [],
				script: '',
				fields,
				modified: 0,
				storyName: 'test-segment',
				segmentExternalId: '00000000001'
			})
		])
	})

	test('test 32', () => {
		const body32 = '\r\n<p></p>\r\n<p><pi>KAM1</pi></p>\r\n'
		const cues32: string[][] = []
		const result = ParseBody(config, '00000000001', 'test-segment', body32, cues32, fields, 0)
		expect(stripExternalId(result)).toEqual([
			literal<PartDefinitionKam>({
				externalId: '',
				type: PartType.Kam,
				sourceDefinition: { ...SOURCE_DEFINITION_KAM_1, raw: 'KAM1' },
				rawType: 'KAM1',
				cues: [],
				script: '',
				fields,
				modified: 0,
				storyName: 'test-segment',
				segmentExternalId: '00000000001'
			})
		])
	})

	test('test 33', () => {
		const body33 =
			'\r\n<p></p>\r\r<p><a idref="0"></a><cc>BREAKER</cc></p>\r\n<p></p>\r\n<p><a idref="1"></a></p>\r\n<p><a idref="2"></a></p>\r\n'
		const cues33 = [
			['JINGLE2=SN_breaker_kortnyt_start'],
			['SS=SC-LOOP', ';0.00.01'],
			[
				'#cg4 pilotdata',
				'TEMA_SPORT_KORTNYT/Mosart=L|00:02|O',
				'VCPID=2319983',
				'ContinueCount=1',
				'TEMA_SPORT_KORTNYT/Mosart=L|00:02|O'
			]
		]
		const result = ParseBody(config, '00000000001', 'test-segment', body33, cues33, fields, 0)
		expect(stripExternalId(result)).toEqual([
			literal<PartDefinitionUnknown>({
				externalId: '',
				type: PartType.Unknown,
				rawType: '',
				cues: [
					literal<CueDefinitionJingle>({
						type: CueType.Jingle,
						clip: 'SN_breaker_kortnyt_start',
						iNewsCommand: 'JINGLE'
					}),
					literal<CueDefinitionGraphic<GraphicInternal>>({
						type: CueType.Graphic,
						target: 'WALL',
						graphic: {
							type: 'internal',
							template: 'SC_LOOP_ON',
							textFields: [],
							cue: 'SC-LOOP'
						},
						start: {
							seconds: 0,
							frames: 1
						},
						iNewsCommand: 'SS'
					}),
					literal<CueDefinitionGraphic<GraphicPilot>>({
						type: CueType.Graphic,
						target: 'OVL',
						graphic: {
							type: 'pilot',
							name: 'TEMA_SPORT_KORTNYT',
							vcpid: 2319983,
							continueCount: 1
						},
						engineNumber: 4,
						start: {
							seconds: 2
						},
						end: {
							infiniteMode: 'O'
						},
						iNewsCommand: 'VCP'
					})
				],
				title: 'SN_breaker_kortnyt_start',
				script: '',
				fields,
				modified: 0,
				storyName: 'test-segment',
				segmentExternalId: '00000000001'
			})
		])
	})

	test('test 34', () => {
		const body34 = '\r\n<p></p>\r\n<p><pi>Kam 1</pi></p>\r\n<p><a idref="0"></a><a idref="1"></a></p>\r\n'
		const cues34 = [
			['VIZ=OVL', 'INP=LIVE 2', ';0.00'],
			[
				'#cg4 pilotdata',
				'HojreVideo/12-12-2019/MOSART=L|00:00|O',
				'VCPID=2578989',
				'ContinueCount=-1',
				'HojreVideo/12-12-2019/MOSART=L|00:00|O'
			]
		]
		const result = ParseBody(config, '00000000001', 'test-segment', body34, cues34, fields, 0)
		expect(stripExternalId(result)).toEqual([
			literal<PartDefinitionKam>({
				externalId: '',
				type: PartType.Kam,
				sourceDefinition: { ...SOURCE_DEFINITION_KAM_1, raw: 'Kam 1' },
				rawType: 'Kam 1',
				cues: [
					literal<CueDefinitionUnpairedTarget>({
						type: CueType.UNPAIRED_TARGET,
						target: 'OVL',
						iNewsCommand: 'VIZ',
						routing: {
							type: CueType.Routing,
							target: 'OVL',
							INP: SOURCE_DEFINITION_LIVE_2,
							iNewsCommand: ''
						},
						start: {
							seconds: 0
						}
					}),
					literal<CueDefinitionGraphic<GraphicPilot>>({
						type: CueType.Graphic,
						target: 'OVL',
						graphic: {
							type: 'pilot',
							name: 'HojreVideo/12-12-2019',
							vcpid: 2578989,
							continueCount: -1
						},
						start: {
							seconds: 0
						},
						end: {
							infiniteMode: 'O'
						},
						iNewsCommand: 'VCP',
						engineNumber: 4
					})
				],
				script: '',
				fields,
				modified: 0,
				storyName: 'test-segment',
				segmentExternalId: '00000000001'
			})
		])
	})

	test('test 35', () => {
		const body35 =
			'\r\n<p><pi>***100% GRAFIK***</pi></p>\r\n<p></p>\r\n<p><a idref="0"></a></p>\r\n<p></p>\r\n<p><a idref="2"></a></p>\r\n<p><cc>Indsæt viz-pilot koden til venstre efter = tegnet.</cc></p>\r\n<p></p>\r\n'
		const cues35 = [
			['GRAFIK=FULL'],
			null,
			[
				']] S3.0 M 0 [[',
				'cg4 ]] 2 YNYAB 0 [[ pilotdata',
				'PROFILE/MEST BRUGTE STARTERE I NBA/08-12-2019',
				'VCPID=2577769',
				'ContinueCount=2',
				'PROFILE/MEST BRUGTE STARTERE I NBA/08-12-2019'
			]
		]
		const result = ParseBody(config, '00000000001', 'test-segment', body35, cues35, fields, 0)
		expect(stripExternalId(result)).toEqual([
			literal<PartDefinitionGrafik>({
				type: PartType.Grafik,
				externalId: '',
				rawType: '100% GRAFIK',
				cues: [
					literal<CueDefinitionGraphic<GraphicPilot>>({
						type: CueType.Graphic,
						target: 'FULL',
						graphic: {
							type: 'pilot',
							name: 'PROFILE/MEST BRUGTE STARTERE I NBA/08-12-2019',
							vcpid: 2577769,
							continueCount: 2
						},
						start: {
							seconds: 0
						},
						iNewsCommand: 'GRAFIK'
					})
				],
				title: 'PROFILE/MEST BRUGTE STARTERE I NBA/08-12-2019',
				script: '',
				fields: {},
				modified: 0,
				storyName: 'test-segment',
				segmentExternalId: '00000000001'
			})
		])
	})

	test('test 36', () => {
		const body36 =
			'\r\n<p><pi>KAM 1</pi></p>\r\n<p>Kam 1 script</p>\r\n<p><pi>***SERVER***</pi></p>\r\n<p>Server script</p>\r\n<p><pi>KAM 2</pi></p>\r\n<p>KAM 2 script</p>\r\n'
		const cues36: string[][] = []
		const result = ParseBody(config, '00000000001', 'test-segment', body36, cues36, fields, 0)
		expect(stripExternalId(result)).toEqual([
			literal<PartDefinitionKam>({
				type: PartType.Kam,
				sourceDefinition: SOURCE_DEFINITION_KAM_1,
				externalId: '',
				rawType: 'KAM 1',
				cues: [],
				script: 'Kam 1 script\n',
				fields: {},
				modified: 0,
				storyName: 'test-segment',
				segmentExternalId: '00000000001'
			}),
			literal<PartDefinitionServer>({
				type: PartType.Server,
				externalId: '',
				rawType: 'SERVER',
				cues: [],
				script: 'Server script\n',
				fields: {},
				modified: 0,
				storyName: 'test-segment',
				segmentExternalId: '00000000001'
			}),
			literal<PartDefinitionKam>({
				type: PartType.Kam,
				sourceDefinition: SOURCE_DEFINITION_KAM_2,
				externalId: '',
				rawType: 'KAM 2',
				cues: [],
				script: 'KAM 2 script\n',
				fields: {},
				modified: 0,
				storyName: 'test-segment',
				segmentExternalId: '00000000001'
			})
		])
	})

	test('test 37', () => {
		const body36 =
			'\r\n<p><pi>KAM 1</pi></p>\r\n<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis </p>\r\n<p></p>\r\n<p><a idref="0"></a></p>\r\n<p></p>\r\n<p></p>\r\n<p><pi>KAM 2</pi></p>\r\n'
		const cues36 = [['EKSTERN=LIVE 1']]
		const result = ParseBody(config, '00000000001', 'test-segment', body36, cues36, fields, 0)
		expect(stripExternalId(result)).toEqual([
			literal<PartDefinitionKam>({
				type: PartType.Kam,
				sourceDefinition: SOURCE_DEFINITION_KAM_1,
				externalId: '',
				rawType: 'KAM 1',
				cues: [],
				script:
					'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis\n',
				fields: {},
				modified: 0,
				storyName: 'test-segment',
				segmentExternalId: '00000000001'
			}),
			literal<PartDefinitionEkstern>({
				type: PartType.REMOTE,
				externalId: '',
				rawType: '',
				cues: [cueEkstern1],
				title: 'LIVE 1',
				script: '',
				fields: {},
				modified: 0,
				storyName: 'test-segment',
				segmentExternalId: '00000000001'
			}),
			literal<PartDefinitionKam>({
				type: PartType.Kam,
				sourceDefinition: SOURCE_DEFINITION_KAM_2,
				externalId: '',
				rawType: 'KAM 2',
				cues: [],
				script: '',
				fields: {},
				modified: 0,
				storyName: 'test-segment',
				segmentExternalId: '00000000001'
			})
		])
	})

	test('test 38', () => {
		const body38 =
			'\r\n<p><pi>KAM 1</pi></p>\r\n<p><a idref="0"></a></p>\r\n<p><a idref="1"></a></p>\r\n<p><pi>KAM 2</pi></p>\r\n<p><a idref="2"></a></p>\r\n<p><a idref="3"></a></p>\r\n'
		const cues38 = [
			['GRAFIK=wall'],
			[
				'#cg4 pilotdata',
				'News/Citat/ARFG/LIVE/stoppoints_2',
				'VCPID=2547767',
				'ContinueCount=6',
				'News/Citat/ARFG/LIVE/stoppoints_2'
			],
			['SS=SC-STILLS'],
			[
				'#cg4 pilotdata',
				'News/Citat/ARFG/LIVE/stoppoints_3',
				'VCPID=2547768',
				'ContinueCount=8',
				'News/Citat/ARFG/LIVE/stoppoints_3'
			]
		]
		const result = ParseBody(config, '00000000001', 'test-segment', body38, cues38, fields, 0)
		expect(stripExternalId(result)).toEqual([
			literal<PartDefinitionKam>({
				externalId: '',
				type: PartType.Kam,
				sourceDefinition: SOURCE_DEFINITION_KAM_1,
				rawType: 'KAM 1',
				fields,
				modified: 0,
				script: '',
				storyName: 'test-segment',
				segmentExternalId: '00000000001',
				cues: [
					literal<CueDefinitionGraphic<GraphicPilot>>({
						type: CueType.Graphic,
						target: 'WALL',
						engineNumber: 4,
						graphic: {
							type: 'pilot',
							name: 'News/Citat/ARFG/LIVE/stoppoints_2',
							vcpid: 2547767,
							continueCount: 6
						},
						iNewsCommand: 'GRAFIK',
						start: {
							seconds: 0
						}
					})
				]
			}),
			literal<PartDefinitionKam>({
				externalId: '',
				type: PartType.Kam,
				sourceDefinition: SOURCE_DEFINITION_KAM_2,
				rawType: 'KAM 2',
				cues: [
					literal<CueDefinitionGraphic<GraphicPilot>>({
						type: CueType.Graphic,
						target: 'WALL',
						engineNumber: 4,
						graphic: {
							type: 'pilot',
							name: 'News/Citat/ARFG/LIVE/stoppoints_3',
							vcpid: 2547768,
							continueCount: 8
						},
						iNewsCommand: 'SS',
						start: {
							seconds: 0
						}
					})
				],
				fields,
				modified: 0,
				script: '',
				storyName: 'test-segment',
				segmentExternalId: '00000000001'
			})
		])
	})

	test('Merge target cues 1', () => {
		const bodyTarget = '\r\n<p><a idref="0"><a idref="1"></a></p>\r\n<p></p>\r\n'
		const cuesTarget = [
			['GRAFIK=FULL', 'INP1=', 'INP='],
			['#cg4 pilotdata', 'TELEFON/KORT//LIVE_KABUL', 'VCPID=2552305', 'ContinueCount=3', 'TELEFON/KORT//LIVE_KABU']
		]
		const result = ParseBody(config, '00000000001', 'test-segment', bodyTarget, cuesTarget, fields, 0)
		expect(stripExternalId(result)).toEqual(
			literal<PartDefinition[]>([
				literal<PartDefinitionUnknown>({
					externalId: '',
					type: PartType.Unknown,
					rawType: '',
					cues: [
						literal<CueDefinitionGraphic<GraphicPilot>>({
							type: CueType.Graphic,
							target: 'FULL',
							graphic: {
								type: 'pilot',
								name: 'TELEFON/KORT//LIVE_KABUL',
								vcpid: 2552305,
								continueCount: 3
							},
							routing: {
								type: CueType.Routing,
								target: 'FULL',
								INP: undefined,
								INP1: undefined,
								iNewsCommand: ''
							},
							engineNumber: 4,
							iNewsCommand: 'GRAFIK',
							start: {
								seconds: 0
							}
						})
					],
					title: 'TELEFON/KORT//LIVE_KABUL',
					script: '',
					fields,
					modified: 0,
					storyName: 'test-segment',
					segmentExternalId: '00000000001'
				})
			])
		)
	})

	test('Merge target cues 2', () => {
		const bodyTarget =
			'\r\n<p></p>\r\n<p></p>\r\n<p><cc>LOAD PILOT GRAFIK ON FULLSCREEN CHANNEL</cc></p>\r\n<p><a idref="0"></a></p>\r\n<p><a idref="1"></a></p>\r\n<p></p>\r\n<p></p>\r\n<p><a idref="2"></a></p>\r\n<p><a idref="3"></a></p>\r\n<p></p>\r\n<p></p>\r\n'
		const cuesTarget = [
			['GRAFIK=FULL', 'INP1=', 'INP2='],
			[
				']] S3.0 M 0 [[',
				'cg4 ]] 2 YNYBB 0 [[ pilotdata',
				'Senderplan/23-10-2019',
				'VCPID=2565134',
				'ContinueCount=-1',
				'Senderplan/23-10-2019'
			],
			['GRAFIK=FULL', 'INP1=', 'INP2='],
			[
				']] S3.0 M 0 [[',
				'cg4 ]] 3 YNYAB 0 [[ pilotdata',
				'Senderplan/23-10-2019',
				'VCPID=2565134',
				'ContinueCount=-1',
				'Senderplan/23-10-2019'
			]
		]
		const result = ParseBody(config, '00000000001', 'test-segment', bodyTarget, cuesTarget, fields, 0)
		expect(stripExternalId(result)).toEqual(
			literal<PartDefinition[]>([
				literal<PartDefinitionUnknown>({
					externalId: '',
					type: PartType.Unknown,
					rawType: '',
					cues: [
						literal<CueDefinitionGraphic<GraphicPilot>>({
							type: CueType.Graphic,
							target: 'FULL',
							graphic: {
								type: 'pilot',
								name: 'Senderplan/23-10-2019',
								vcpid: 2565134,
								continueCount: -1
							},
							routing: {
								type: CueType.Routing,
								target: 'FULL',
								INP1: undefined,
								iNewsCommand: ''
							},
							iNewsCommand: 'GRAFIK',
							start: {
								seconds: 0
							}
						})
					],
					title: 'Senderplan/23-10-2019',
					script: '',
					fields,
					modified: 0,
					storyName: 'test-segment',
					segmentExternalId: '00000000001'
				}),
				literal<PartDefinitionUnknown>({
					externalId: '',
					type: PartType.Unknown,
					rawType: '',
					cues: [
						literal<CueDefinitionGraphic<GraphicPilot>>({
							type: CueType.Graphic,
							target: 'FULL',
							graphic: {
								type: 'pilot',
								name: 'Senderplan/23-10-2019',
								vcpid: 2565134,
								continueCount: -1
							},
							routing: {
								type: CueType.Routing,
								target: 'FULL',
								INP1: undefined,
								iNewsCommand: ''
							},
							iNewsCommand: 'GRAFIK',
							start: {
								seconds: 0
							}
						})
					],
					title: 'Senderplan/23-10-2019',
					script: '',
					fields,
					modified: 0,
					storyName: 'test-segment',
					segmentExternalId: '00000000001'
				})
			])
		)
	})

	test('Merge wall cues', () => {
		const bodyTarget = '\r\n<p><a idref="0"><a idref="1"></a></p>\r\n<p></p>\r\n'
		const cuesTarget = [
			['SS=sc-stills', 'INP1=EVS 1', ';0.00.01'],
			['#cg4 pilotdata', 'TELEFON/KORT//LIVE_KABUL', 'VCPID=2552305', 'ContinueCount=3', 'TELEFON/KORT//LIVE_KABU']
		]
		const result = ParseBody(config, '00000000001', 'test-segment', bodyTarget, cuesTarget, fields, 0)
		expect(stripExternalId(result)).toEqual(
			literal<PartDefinition[]>([
				literal<PartDefinitionUnknown>({
					externalId: '',
					type: PartType.Unknown,
					rawType: '',
					cues: [
						literal<CueDefinitionGraphic<GraphicPilot>>({
							type: CueType.Graphic,
							target: 'WALL',
							routing: {
								type: CueType.Routing,
								target: 'WALL',
								INP1: { sourceType: SourceType.REPLAY, name: 'EVS 1', id: 'EVS 1', raw: 'EVS 1', vo: false },
								iNewsCommand: ''
							},
							graphic: {
								type: 'pilot',
								name: 'TELEFON/KORT//LIVE_KABUL',
								vcpid: 2552305,
								continueCount: 3
							},
							engineNumber: 4,
							iNewsCommand: 'SS',
							start: {
								frames: 1,
								seconds: 0
							}
						})
					],
					script: '',
					fields,
					modified: 0,
					storyName: 'test-segment',
					segmentExternalId: '00000000001'
				})
			])
		)
	})

	test('EVS 1 with EFFEKT', () => {
		const body27 =
			'\r\n<p></p>\r\n<p></p>\r\n<p><pi>EVS 1 EFFEKT 1</pi></p>\r\n<p></p>\r\n<p></p>\r\n<p><a idref="0"><a idref="1"><a idref="2"></a></a></a></p>\r\n<p></p>\r\n<p></p>\r\n<p></p>\r\n<p></p>\r\n<p>Skriv din spib her</p>\r\n<p></p>\r\n'
		const cues27 = [unparsedGrafik1, unparsedGrafik2, unparsedGrafik3]
		const result = ParseBody(config, '00000000001', 'test-segment', body27, cues27, fields, 0)
		expect(stripExternalId(result)).toEqual([
			literal<PartDefinitionEVS>({
				externalId: '',
				type: PartType.EVS,
				rawType: 'EVS 1',
				sourceDefinition: {
					sourceType: SourceType.REPLAY,
					id: 'EVS 1',
					name: 'EVS 1',
					raw: 'EVS 1',
					vo: false
				},
				effekt: 1,
				cues: [cueGrafik1, cueGrafik2, cueGrafik3],
				fields,
				modified: 0,
				script: 'Skriv din spib her\n',
				storyName: 'test-segment',
				segmentExternalId: '00000000001'
			})
		])
	})

	test('EKSTERN 1 with EFFEKT', () => {
		const body = '\r\n<p><pi>***LIVE***</pi></p>\r\n<p><a idref="0"></a></p>\r\n'
		const cues = [['EKSTERN=LIVE 1 EFFEKT 1']]
		const result = ParseBody(config, '00000000001', 'test-segment', body, cues, fields, 0)
		expect(stripExternalId(result)).toEqual([
			literal<PartDefinitionEkstern>({
				externalId: '',
				type: PartType.REMOTE,
				title: 'LIVE 1',
				rawType: '',
				effekt: 1,
				cues: [cueEkstern1],
				fields,
				modified: 0,
				script: '',
				storyName: 'test-segment',
				segmentExternalId: '00000000001'
			})
		])
	})

	/** Merging Cues From Config */

	test('Merge VCP', () => {
		const body = '\r\n<p><pi>KAM 1</pi></p>\r\n<p><a idref="0"></a><a idref="1"></a></p>\r\n'
		const cues: UnparsedCue[] = [
			['SS=SC-STILLS'],
			[
				']] S3.0 M 0 [[',
				'cg4 ]] 1 YNYAB 0 [[ pilotdata',
				'LgfxWeb/-ETKAEM_07-05-2019_17:55:42',
				'VCPID=2520177',
				'ContinueCount=-1',
				'LgfxWeb/-ETKAEM_07-05-2019_17:55:42'
			]
		]
		const result = ParseBody(config, '00000000001', 'test-segment', body, cues, fields, 0)
		expect(stripExternalId(result)).toEqual([
			literal<PartDefinitionKam>({
				type: PartType.Kam,
				sourceDefinition: SOURCE_DEFINITION_KAM_1,
				externalId: '',
				cues: [
					literal<CueDefinitionGraphic<GraphicPilot>>({
						type: CueType.Graphic,
						target: 'WALL',
						graphic: {
							type: 'pilot',
							name: 'LgfxWeb/-ETKAEM_07-05-2019_17:55:42',
							vcpid: 2520177,
							continueCount: -1
						},
						iNewsCommand: 'SS',
						start: {
							seconds: 0
						}
					})
				],
				rawType: 'KAM 1',
				script: '',
				fields,
				modified: 0,
				storyName: 'test-segment',
				segmentExternalId: '00000000001'
			})
		])
	})

	test('Preserve internal', () => {
		const body = '\r\n<p><pi>KAM 1</pi></p>\r\n<p><a idref="0"></a><a idref="1"></a></p>\r\n'
		const cues: UnparsedCue[] = [
			['SS=sc-loop'],
			[
				']] S3.0 M 0 [[',
				'cg4 ]] 1 YNYAB 0 [[ pilotdata',
				'LgfxWeb/-ETKAEM_07-05-2019_17:55:42',
				'VCPID=2520177',
				'ContinueCount=-1',
				'LgfxWeb/-ETKAEM_07-05-2019_17:55:42'
			]
		]
		const result = ParseBody(config, '00000000001', 'test-segment', body, cues, fields, 0)
		expect(stripExternalId(result)).toEqual([
			literal<PartDefinitionKam>({
				type: PartType.Kam,
				sourceDefinition: SOURCE_DEFINITION_KAM_1,
				externalId: '',
				cues: [
					literal<CueDefinitionGraphic<GraphicInternal>>({
						type: CueType.Graphic,
						target: 'WALL',
						graphic: {
							type: 'internal',
							template: 'SC_LOOP_ON',
							cue: 'sc-loop',
							textFields: []
						},
						iNewsCommand: 'SS'
					}),
					literal<CueDefinitionUnpairedPilot>({
						type: CueType.UNPAIRED_PILOT,
						name: 'LgfxWeb/-ETKAEM_07-05-2019_17:55:42',
						vcpid: 2520177,
						continueCount: -1,
						iNewsCommand: 'VCP',
						start: {
							seconds: 0
						}
					})
				],
				rawType: 'KAM 1',
				script: '',
				fields: {},
				modified: 0,
				storyName: 'test-segment',
				segmentExternalId: '00000000001'
			})
		])
	})

	test('Preserves unconfigured target wall', () => {
		const body = '\r\n<p><pi>KAM 1</pi></p>\r\n<p><a idref="0"></a><a idref="1"></a></p>\r\n'
		const cues: UnparsedCue[] = [
			['SS=NEW_WALL_GRAPHIC'],
			[
				']] S3.0 M 0 [[',
				'cg4 ]] 1 YNYAB 0 [[ pilotdata',
				'LgfxWeb/-ETKAEM_07-05-2019_17:55:42',
				'VCPID=2520177',
				'ContinueCount=-1',
				'LgfxWeb/-ETKAEM_07-05-2019_17:55:42'
			]
		]
		const result = ParseBody(config, '00000000001', 'test-segment', body, cues, fields, 0)
		expect(stripExternalId(result)).toEqual([
			literal<PartDefinitionKam>({
				type: PartType.Kam,
				sourceDefinition: SOURCE_DEFINITION_KAM_1,
				externalId: '',
				cues: [
					literal<CueDefinitionUnpairedTarget>({
						type: CueType.UNPAIRED_TARGET,
						target: 'WALL',
						iNewsCommand: 'SS'
					}),
					literal<CueDefinitionUnpairedPilot>({
						type: CueType.UNPAIRED_PILOT,
						name: 'LgfxWeb/-ETKAEM_07-05-2019_17:55:42',
						vcpid: 2520177,
						continueCount: -1,
						iNewsCommand: 'VCP',
						start: {
							seconds: 0
						}
					})
				],
				rawType: 'KAM 1',
				script: '',
				fields: {},
				modified: 0,
				storyName: 'test-segment',
				segmentExternalId: '00000000001'
			})
		])
	})

	test('Merge GRAFIK=FULL', () => {
		const body = '\r\n<p><pi>KAM 1</pi></p>\r\n<p><a idref="0"></a><a idref="1"></a></p>\r\n'
		const cues: UnparsedCue[] = [
			['GRAFIK=FULL'],
			[
				']] S3.0 M 0 [[',
				'cg4 ]] 1 YNYAB 0 [[ pilotdata',
				'LgfxWeb/-ETKAEM_07-05-2019_17:55:42',
				'VCPID=2520177',
				'ContinueCount=-1',
				'LgfxWeb/-ETKAEM_07-05-2019_17:55:42'
			]
		]
		const result = ParseBody(config, '00000000001', 'test-segment', body, cues, fields, 0)
		expect(stripExternalId(result)).toEqual([
			literal<PartDefinitionKam>({
				type: PartType.Kam,
				sourceDefinition: SOURCE_DEFINITION_KAM_1,
				externalId: '',
				cues: [],
				rawType: 'KAM 1',
				script: '',
				fields,
				modified: 0,
				storyName: 'test-segment',
				segmentExternalId: '00000000001'
			}),
			literal<PartDefinitionUnknown>({
				type: PartType.Unknown,
				externalId: '',
				cues: [
					literal<CueDefinitionGraphic<GraphicPilot>>({
						type: CueType.Graphic,
						target: 'FULL',
						graphic: {
							type: 'pilot',
							name: 'LgfxWeb/-ETKAEM_07-05-2019_17:55:42',
							vcpid: 2520177,
							continueCount: -1
						},
						iNewsCommand: 'GRAFIK',
						start: {
							seconds: 0
						}
					})
				],
				title: 'LgfxWeb/-ETKAEM_07-05-2019_17:55:42',
				rawType: '',
				script: '',
				fields,
				modified: 0,
				storyName: 'test-segment',
				segmentExternalId: '00000000001'
			})
		])
	})

	test('Merge GRAFIK=FULL when target precedes redtext', () => {
		const body =
			'\r\n<p><pi>KAM 1</pi></p>\r\n<p><a idref="0"></a></p>\r\n<p><pi>************ 100%GRAFIK ***********</pi></p>\r\n<p>Some script...</p>\r\n<p><a idref="1"></a></p>\r\n'
		const cues: UnparsedCue[] = [
			['GRAFIK=FULL'],
			[
				']] S3.0 M 0 [[',
				'cg4 ]] 1 YNYAB 0 [[ pilotdata',
				'LgfxWeb/-ETKAEM_07-05-2019_17:55:42',
				'VCPID=2520177',
				'ContinueCount=-1',
				'LgfxWeb/-ETKAEM_07-05-2019_17:55:42'
			]
		]
		const result = ParseBody(config, '00000000001', 'test-segment', body, cues, fields, 0)
		expect(stripExternalId(result)).toEqual([
			literal<PartDefinitionKam>({
				type: PartType.Kam,
				sourceDefinition: SOURCE_DEFINITION_KAM_1,
				externalId: '',
				cues: [],
				rawType: 'KAM 1',
				script: '',
				fields,
				modified: 0,
				storyName: 'test-segment',
				segmentExternalId: '00000000001'
			}),
			literal<PartDefinitionGrafik>({
				type: PartType.Grafik,
				externalId: '',
				title: 'LgfxWeb/-ETKAEM_07-05-2019_17:55:42',
				cues: [
					literal<CueDefinitionGraphic<GraphicPilot>>({
						type: CueType.Graphic,
						target: 'FULL',
						graphic: {
							type: 'pilot',
							name: 'LgfxWeb/-ETKAEM_07-05-2019_17:55:42',
							vcpid: 2520177,
							continueCount: -1
						},
						iNewsCommand: 'GRAFIK',
						start: {
							seconds: 0
						}
					})
				],
				rawType: '100%GRAFIK',
				script: 'Some script...\n',
				fields,
				modified: 0,
				storyName: 'test-segment',
				segmentExternalId: '00000000001'
			})
		])
	})

	test('Does not merge GRAFIK=FULL when target precedes redtext, with script in between', () => {
		const body =
			'\r\n<p><pi>KAM 1</pi></p>\r\n<p>Some script...</p>\r\n<p><a idref="0"></a></p>\r\n<p>Some script 1...</p>\r\n<p><pi>************ 100%GRAFIK ***********</pi></p>\r\n<p>Some script 2...</p>\r\n<p><a idref="1"></a></p>\r\n'
		const cues: UnparsedCue[] = [
			['GRAFIK=FULL'],
			[
				']] S3.0 M 0 [[',
				'cg4 ]] 1 YNYAB 0 [[ pilotdata',
				'LgfxWeb/-ETKAEM_07-05-2019_17:55:42',
				'VCPID=2520177',
				'ContinueCount=-1',
				'LgfxWeb/-ETKAEM_07-05-2019_17:55:42'
			]
		]
		const result = ParseBody(config, '00000000001', 'test-segment', body, cues, fields, 0)
		expect(stripExternalId(result)).toEqual([
			literal<PartDefinitionKam>({
				type: PartType.Kam,
				sourceDefinition: SOURCE_DEFINITION_KAM_1,
				externalId: '',
				cues: [],
				rawType: 'KAM 1',
				script: 'Some script...\n',
				fields,
				modified: 0,
				storyName: 'test-segment',
				segmentExternalId: '00000000001'
			}),
			literal<PartDefinitionUnknown>({
				type: PartType.Unknown,
				externalId: '',
				cues: [
					literal<CueDefinitionUnpairedTarget>({
						type: CueType.UNPAIRED_TARGET,
						target: 'FULL',
						iNewsCommand: 'GRAFIK',
						mergeable: true
					})
				],
				rawType: '',
				script: 'Some script 1...\n',
				fields,
				modified: 0,
				storyName: 'test-segment',
				segmentExternalId: '00000000001'
			}),
			literal<PartDefinitionGrafik>({
				type: PartType.Grafik,
				externalId: '',
				cues: [
					literal<CueDefinitionUnpairedPilot>({
						type: CueType.UNPAIRED_PILOT,
						name: 'LgfxWeb/-ETKAEM_07-05-2019_17:55:42',
						vcpid: 2520177,
						continueCount: -1,
						iNewsCommand: 'VCP',
						start: {
							seconds: 0
						}
					})
				],
				rawType: '100%GRAFIK',
				script: 'Some script 2...\n',
				fields,
				modified: 0,
				storyName: 'test-segment',
				segmentExternalId: '00000000001'
			})
		])
	})

	test('Merge GRAFIK=OVL', () => {
		const body = '\r\n<p><pi>KAM 1</pi></p>\r\n<p><a idref="0"></a><a idref="1"></a></p>\r\n'
		const cues: UnparsedCue[] = [
			['GRAFIK=OVL'],
			[
				']] S3.0 M 0 [[',
				'cg4 ]] 1 YNYAB 0 [[ pilotdata',
				'LgfxWeb/-ETKAEM_07-05-2019_17:55:42',
				'VCPID=2520177',
				'ContinueCount=-1',
				'LgfxWeb/-ETKAEM_07-05-2019_17:55:42'
			]
		]
		const result = ParseBody(config, '00000000001', 'test-segment', body, cues, fields, 0)
		expect(stripExternalId(result)).toEqual([
			literal<PartDefinitionKam>({
				type: PartType.Kam,
				sourceDefinition: SOURCE_DEFINITION_KAM_1,
				externalId: '',
				cues: [
					literal<CueDefinitionGraphic<GraphicPilot>>({
						type: CueType.Graphic,
						target: 'OVL',
						graphic: {
							type: 'pilot',
							name: 'LgfxWeb/-ETKAEM_07-05-2019_17:55:42',
							vcpid: 2520177,
							continueCount: -1
						},
						iNewsCommand: 'GRAFIK',
						start: {
							seconds: 0
						}
					})
				],
				rawType: 'KAM 1',
				script: '',
				fields,
				modified: 0,
				storyName: 'test-segment',
				segmentExternalId: '00000000001'
			})
		])
	})

	test('Handles VCP for #kg (other cues)', () => {
		const body = '\r\n<p><pi>KAM 1</pi></p>\r\n<p><a idref="0"></a><a idref="1"></a></p>\r\n'
		const cues: UnparsedCue[] = [
			['#kg MERGE'],
			[
				']] S3.0 M 0 [[',
				'cg4 ]] 1 YNYAB 0 [[ pilotdata',
				'LgfxWeb/-ETKAEM_07-05-2019_17:55:42',
				'VCPID=2520177',
				'ContinueCount=-1',
				'LgfxWeb/-ETKAEM_07-05-2019_17:55:42'
			]
		]
		const result = ParseBody(config, '00000000001', 'test-segment', body, cues, fields, 0)
		expect(stripExternalId(result)).toEqual([
			literal<PartDefinitionKam>({
				type: PartType.Kam,
				sourceDefinition: SOURCE_DEFINITION_KAM_1,
				externalId: '',
				cues: [
					literal<CueDefinitionGraphic<GraphicPilot>>({
						type: CueType.Graphic,
						target: 'OVL',
						graphic: {
							type: 'pilot',
							name: 'LgfxWeb/-ETKAEM_07-05-2019_17:55:42',
							vcpid: 2520177,
							continueCount: -1
						},
						iNewsCommand: '#kg',
						start: {
							seconds: 0
						}
					})
				],
				rawType: 'KAM 1',
				script: '',
				fields,
				modified: 0,
				storyName: 'test-segment',
				segmentExternalId: '00000000001'
			})
		])
	})

	test('Does not merge GRAFIK=FULL with MOSART=L', () => {
		const body = '\r\n<p><pi>KAM 1</pi></p>\r\n<p><a idref="0"></a><a idref="1"></a></p>\r\n'
		const cues: UnparsedCue[] = [
			['GRAFIK=FULL'],
			[
				']] S3.0 M 0 [[',
				'cg4 ]] 1 YNYAB 0 [[ pilotdata',
				'LgfxWeb/-ETKAEM_07-05-2019_17:55:42/MOSART=L|00:00|O',
				'VCPID=2520177',
				'ContinueCount=-1',
				'LgfxWeb/-ETKAEM_07-05-2019_17:55:42/MOSART=L|00:00|O'
			]
		]
		const result = ParseBody(config, '00000000001', 'test-segment', body, cues, fields, 0)
		expect(stripExternalId(result)).toEqual([
			literal<PartDefinitionKam>({
				type: PartType.Kam,
				sourceDefinition: SOURCE_DEFINITION_KAM_1,
				externalId: '',
				cues: [],
				rawType: 'KAM 1',
				script: '',
				fields,
				modified: 0,
				storyName: 'test-segment',
				segmentExternalId: '00000000001'
			}),
			literal<PartDefinitionUnknown>({
				type: PartType.Unknown,
				externalId: '',
				cues: [
					literal<CueDefinitionUnpairedTarget>({
						type: CueType.UNPAIRED_TARGET,
						target: 'FULL',
						iNewsCommand: 'GRAFIK',
						mergeable: true
					}),
					literal<CueDefinitionGraphic<GraphicPilot>>({
						type: CueType.Graphic,
						target: 'OVL',
						graphic: {
							type: 'pilot',
							name: 'LgfxWeb/-ETKAEM_07-05-2019_17:55:42',
							vcpid: 2520177,
							continueCount: -1
						},
						iNewsCommand: 'VCP',
						start: {
							seconds: 0
						},
						end: {
							infiniteMode: 'O'
						}
					})
				],
				rawType: '',
				script: '',
				fields,
				modified: 0,
				storyName: 'test-segment',
				segmentExternalId: '00000000001'
			})
		])
	})

	test('Does not merge GRAFIK=FULL with MOSART=W', () => {
		const body = '\r\n<p><pi>KAM 1</pi></p>\r\n<p><a idref="0"></a><a idref="1"></a></p>\r\n'
		const cues: UnparsedCue[] = [
			['GRAFIK=FULL'],
			[
				']] S3.0 M 0 [[',
				'cg4 ]] 1 YNYAB 0 [[ pilotdata',
				'LgfxWeb/-ETKAEM_07-05-2019_17:55:42/MOSART=W|00:00|O',
				'VCPID=2520177',
				'ContinueCount=-1',
				'LgfxWeb/-ETKAEM_07-05-2019_17:55:42/MOSART=W|00:00|O'
			]
		]
		const result = ParseBody(config, '00000000001', 'test-segment', body, cues, fields, 0)
		expect(stripExternalId(result)).toEqual([
			literal<PartDefinitionKam>({
				type: PartType.Kam,
				sourceDefinition: SOURCE_DEFINITION_KAM_1,
				externalId: '',
				cues: [],
				rawType: 'KAM 1',
				script: '',
				fields,
				modified: 0,
				storyName: 'test-segment',
				segmentExternalId: '00000000001'
			}),
			literal<PartDefinitionUnknown>({
				type: PartType.Unknown,
				externalId: '',
				cues: [
					literal<CueDefinitionUnpairedTarget>({
						type: CueType.UNPAIRED_TARGET,
						target: 'FULL',
						iNewsCommand: 'GRAFIK',
						mergeable: true
					}),
					literal<CueDefinitionGraphic<GraphicPilot>>({
						type: CueType.Graphic,
						target: 'WALL',
						graphic: {
							type: 'pilot',
							name: 'LgfxWeb/-ETKAEM_07-05-2019_17:55:42',
							vcpid: 2520177,
							continueCount: -1
						},
						iNewsCommand: 'VCP',
						start: {
							seconds: 0
						},
						end: {
							infiniteMode: 'O'
						}
					})
				],
				rawType: '',
				script: '',
				fields,
				modified: 0,
				storyName: 'test-segment',
				segmentExternalId: '00000000001'
			})
		])
	})

	test('Does not merge GRAFIK=FULL with MOSART=F', () => {
		const body = '\r\n<p><pi>KAM 1</pi></p>\r\n<p><a idref="0"></a><a idref="1"></a></p>\r\n'
		const cues: UnparsedCue[] = [
			['GRAFIK=FULL'],
			[
				']] S3.0 M 0 [[',
				'cg4 ]] 1 YNYAB 0 [[ pilotdata',
				'LgfxWeb/-ETKAEM_07-05-2019_17:55:42/MOSART=F|00:00|O',
				'VCPID=2520177',
				'ContinueCount=-1',
				'LgfxWeb/-ETKAEM_07-05-2019_17:55:42/MOSART=F|00:00|O'
			]
		]
		const result = ParseBody(config, '00000000001', 'test-segment', body, cues, fields, 0)
		expect(stripExternalId(result)).toEqual([
			literal<PartDefinitionKam>({
				type: PartType.Kam,
				sourceDefinition: SOURCE_DEFINITION_KAM_1,
				externalId: '',
				cues: [],
				rawType: 'KAM 1',
				script: '',
				fields,
				modified: 0,
				storyName: 'test-segment',
				segmentExternalId: '00000000001'
			}),
			literal<PartDefinitionUnknown>({
				type: PartType.Unknown,
				externalId: '',
				cues: [
					literal<CueDefinitionUnpairedTarget>({
						type: CueType.UNPAIRED_TARGET,
						target: 'FULL',
						iNewsCommand: 'GRAFIK',
						mergeable: true
					})
				],
				rawType: '',
				script: '',
				fields,
				modified: 0,
				storyName: 'test-segment',
				segmentExternalId: '00000000001'
			}),
			literal<PartDefinitionUnknown>({
				type: PartType.Unknown,
				externalId: '',
				cues: [
					literal<CueDefinitionGraphic<GraphicPilot>>({
						type: CueType.Graphic,
						target: 'FULL',
						graphic: {
							type: 'pilot',
							name: 'LgfxWeb/-ETKAEM_07-05-2019_17:55:42',
							vcpid: 2520177,
							continueCount: -1
						},
						iNewsCommand: 'VCP',
						start: {
							seconds: 0
						},
						end: {
							infiniteMode: 'O'
						}
					})
				],
				title: 'LgfxWeb/-ETKAEM_07-05-2019_17:55:42',
				rawType: '',
				script: '',
				fields,
				modified: 0,
				storyName: 'test-segment',
				segmentExternalId: '00000000001'
			})
		])
	})

	test('Inline wall cue', () => {
		const body =
			'"\r\n<p><pi>KAM 1</pi><a idref="0"></a></p>\r\n<p><a idref="3"></a></p>\r\n<p><pi>***VO***</pi></p>\r\n<p><a idref="2"></a></p>\r\n'
		const cues: UnparsedCue[] = [
			['SS=SC-STILLS', ';0.00.01'],
			null,
			['SS=SC-LOOP', ';0.00.01'],
			[
				']] S3.0 M 0 [[',
				'cg4 ]] 3 YNYAB 0 [[ pilotdata',
				'SP-H/Fakta/EM HÅNDBOLD',
				'VCPID=2663626',
				'ContinueCount=-1',
				'SP-H/Fakta/EM HÅNDBOLD'
			]
		]
		const result = ParseBody(config, '00000000001', 'test-segment', body, cues, fields, 0)
		expect(stripExternalId(result)).toEqual([
			literal<PartDefinitionKam>({
				type: PartType.Kam,
				sourceDefinition: SOURCE_DEFINITION_KAM_1,
				externalId: '',
				cues: [
					literal<CueDefinitionGraphic<GraphicPilot>>({
						type: CueType.Graphic,
						target: 'WALL',
						graphic: {
							type: 'pilot',
							name: 'SP-H/Fakta/EM HÅNDBOLD',
							vcpid: 2663626,
							continueCount: -1
						},
						iNewsCommand: 'SS',
						start: {
							seconds: 0,
							frames: 1
						}
					})
				],
				rawType: 'KAM 1',
				script: '',
				fields,
				modified: 0,
				storyName: 'test-segment',
				segmentExternalId: '00000000001'
			}),
			literal<PartDefinitionVO>({
				type: PartType.VO,
				externalId: '',
				cues: [
					literal<CueDefinitionGraphic<GraphicInternal>>({
						type: CueType.Graphic,
						target: 'WALL',
						graphic: {
							type: 'internal',
							template: 'SC_LOOP_ON',
							textFields: [],
							cue: 'SC-LOOP'
						},
						iNewsCommand: 'SS',
						start: {
							seconds: 0,
							frames: 1
						}
					})
				],
				rawType: 'VO',
				script: '',
				fields,
				modified: 0,
				storyName: 'test-segment',
				segmentExternalId: '00000000001'
			})
		])
	})

	/** END Merging Cues From Config */

	describe('removeDuplicateDesignCues', () => {
		it('has no no cues, does nothing', () => {
			const definitions: PartDefinition[] = [createPartDefinition(), createPartDefinition()]

			const result: PartDefinition[] = stripRedundantCuesWhenLayoutCueIsPresent(definitions)

			expect(result).toEqual(definitions)
		})

		it('has a designCue from layout and a regular design cue, removes the regular design cue', () => {
			const designFromLayout = 'designFromLayout'
			const definitions: PartDefinition[] = [
				createPartDefinition([
					createDesignCueDefinition(designFromLayout, true),
					createDesignCueDefinition('regularDesign')
				])
			]

			const result: PartDefinition[] = stripRedundantCuesWhenLayoutCueIsPresent(definitions)

			expect(result[0].cues).toHaveLength(1)
			const graphicDesignCue: CueDefinitionGraphicDesign = result[0].cues[0] as CueDefinitionGraphicDesign
			expect(graphicDesignCue.design).toEqual(designFromLayout)
		})

		it('only have a regular design cue, does nothing', () => {
			const definitions: PartDefinition[] = [createPartDefinition([createDesignCueDefinition('someDesign')])]

			const result: PartDefinition[] = stripRedundantCuesWhenLayoutCueIsPresent(definitions)

			expect(result).toEqual(definitions)
		})

		it('only have a layout design cue, does nothing', () => {
			const definitions: PartDefinition[] = [
				createPartDefinition([createDesignCueDefinition('designFromLayout', true)])
			]

			const result: PartDefinition[] = stripRedundantCuesWhenLayoutCueIsPresent(definitions)

			expect(result).toEqual(definitions)
		})

		it('has a regular design, layout design and two other random cues, only removes the regular design cue', () => {
			const regularDesign = 'regularDesignCue'
			const definitions: PartDefinition[] = [
				createPartDefinition([
					createDesignCueDefinition('designFromLayout', true),
					createDesignCueDefinition(regularDesign),
					createUnknownCueDefinition(),
					createUnknownCueDefinition()
				])
			]

			const result: PartDefinition[] = stripRedundantCuesWhenLayoutCueIsPresent(definitions)

			const cues = result[0].cues
			expect(cues).toHaveLength(3)
			const regularDesignCue = cues.find(cue => {
				const designCue = cue as CueDefinitionGraphicDesign
				if (!designCue.design) {
					return false
				}
				return designCue.design === regularDesign
			})
			expect(regularDesignCue).toBeUndefined()
		})

		it('has a regular design cue in one partDefinition, has a layout cue in another partDefinition, remove the regular designCue', () => {
			const layoutDesign = 'designFromLayout'
			const definitions: PartDefinition[] = [
				createPartDefinition([createDesignCueDefinition(layoutDesign, true)]),
				createPartDefinition([createDesignCueDefinition('regularDesign')])
			]

			const result: PartDefinition[] = stripRedundantCuesWhenLayoutCueIsPresent(definitions)

			const cues: CueDefinition[] = result.flatMap(definition => definition.cues)
			expect(cues).toHaveLength(1)
			const graphicCue = cues[0] as CueDefinitionGraphicDesign
			expect(graphicCue.design).toBe(layoutDesign)
		})

		it('has layout background cue and regular background cue, remove regular background cue', () => {
			const layoutBackground = 'layoutBackground'
			const definitions: PartDefinition[] = [
				createPartDefinition([
					createBackgroundLoopCueDefinition(layoutBackground, true),
					createBackgroundLoopCueDefinition('regularBackground')
				])
			]

			const result: PartDefinition[] = stripRedundantCuesWhenLayoutCueIsPresent(definitions)

			expect(result[0].cues).toHaveLength(1)
			const backgroundCue: CueDefinitionBackgroundLoop = result[0].cues[0] as CueDefinitionBackgroundLoop
			expect(backgroundCue.backgroundLoop).toBe(layoutBackground)
		})

		it('only have a regular background cue, does nothing', () => {
			const definitions: PartDefinition[] = [
				createPartDefinition([createBackgroundLoopCueDefinition('regularBackground')])
			]

			const result: PartDefinition[] = stripRedundantCuesWhenLayoutCueIsPresent(definitions)

			expect(result).toEqual(definitions)
		})

		it('only have a layout background cue, does nothing', () => {
			const definitions: PartDefinition[] = [
				createPartDefinition([createBackgroundLoopCueDefinition('layoutBackground', true)])
			]

			const result: PartDefinition[] = stripRedundantCuesWhenLayoutCueIsPresent(definitions)

			expect(result).toEqual(definitions)
		})
	})

	describe('getTransitionProperties', () => {
		it('has a Dip transition lasting 4 frames, transition.duration is 4', () => {
			const iNewsCue = 'SOME PART DIP 4'

			const result: Pick<PartdefinitionTypes, 'effekt' | 'transition'> = getTransitionProperties(iNewsCue)

			expect(result.transition!.duration).toBe(4)
		})

		it('has a Dip transition lasting 10 frames, transition.duration is 10', () => {
			const iNewsCue = 'SOME PART DIP 10'

			const result: Pick<PartdefinitionTypes, 'effekt' | 'transition'> = getTransitionProperties(iNewsCue)

			expect(result.transition!.duration).toBe(10)
		})

		it('has a Dip transition lasting more than the max allowed 250 frames, transition.duration is 250', () => {
			const iNewsCue = 'SOME PART DIP 231342143'

			const result: Pick<PartdefinitionTypes, 'effekt' | 'transition'> = getTransitionProperties(iNewsCue)

			expect(result.transition!.duration).toBe(250)
		})
	})
})

function createPartDefinition(cues?: CueDefinition[]): PartDefinition {
	if (!cues) {
		cues = []
	}
	return {
		externalId: `externalId_${Math.random() * 1000}`,
		cues,
		type: PartType.Grafik,
		script: '',
		fields: {},
		modified: 123,
		storyName: 'someName',
		segmentExternalId: `segmentExternalId_${Math.random() * 1000}`,
		rawType: ''
	}
}

function createDesignCueDefinition(design: string, isFromLayout?: boolean): CueDefinition {
	return {
		type: CueType.GraphicDesign,
		design,
		iNewsCommand: '',
		isFromLayout
	}
}

function createBackgroundLoopCueDefinition(backgroundLoop: string, isFromLayout?: boolean): CueDefinition {
	return {
		type: CueType.BackgroundLoop,
		target: 'DVE',
		backgroundLoop,
		isFromLayout,
		iNewsCommand: ''
	}
}

function createUnknownCueDefinition(): CueDefinition {
	return {
		type: CueType.UNKNOWN,
		iNewsCommand: ''
	}
}

export function stripExternalId(definitions: PartDefinition[]) {
	return definitions.map(def => {
		return { ...def, ...{ externalId: '' } }
	})
}
