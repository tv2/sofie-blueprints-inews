import { literal } from '../../../../common/util'
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
	PartDefinitionSlutord,
	PartDefinitionTeknik,
	PartDefinitionTelefon,
	PartDefinitionUnknown,
	PartDefinitionVO,
	PartType
} from '../ParseBody'
import {
	CueDefinition,
	CueDefinitionDVE,
	CueDefinitionEkstern,
	CueDefinitionGrafik,
	CueDefinitionJingle,
	CueDefinitionMOS,
	CueDefinitionTargetEngine,
	CueDefinitionTargetWall,
	CueDefinitionTelefon,
	CueDefinitionUnknown,
	CueType,
	UnparsedCue
} from '../ParseCue'

const fields = {}

const cueUnknown: CueDefinitionUnknown = {
	type: CueType.Unknown
}

const unparsedUnknown: UnparsedCue = ['Some invalid cue']

const cueGrafik1: CueDefinitionGrafik = {
	type: CueType.Grafik,
	template: 'bund',
	cue: 'kg',
	textFields: ['1'],
	adlib: true
}

const unparsedGrafik1 = ['kg bund 1']

const cueGrafik2: CueDefinitionGrafik = {
	type: CueType.Grafik,
	template: 'bund',
	cue: 'kg',
	textFields: ['2'],
	adlib: true
}

const unparsedGrafik2 = ['kg bund 2']

const cueGrafik3: CueDefinitionGrafik = {
	type: CueType.Grafik,
	template: 'bund',
	cue: 'kg',
	textFields: ['3'],
	adlib: true
}

const unparsedGrafik3 = ['kg bund 3']

const cueEkstern1: CueDefinitionEkstern = {
	type: CueType.Ekstern,
	source: '1'
}

const unparsedEkstern1 = ['EKSTERN=1']

const cueEkstern2: CueDefinitionEkstern = {
	type: CueType.Ekstern,
	source: '2'
}

const unparsedEkstern2 = ['EKSTERN=2']

const cueJingle1: CueDefinitionJingle = {
	type: CueType.Jingle,
	clip: '1'
}

const unparsedJingle1 = ['JINGLE2=1']

const cueJingle2: CueDefinitionJingle = {
	type: CueType.Jingle,
	clip: '2'
}

const unparsedJingle2 = ['JINGLE2=2']

const cueJingle3: CueDefinitionJingle = {
	type: CueType.Jingle,
	clip: '3'
}

const unparsedJingle3 = ['JINGLE2=3']

const cueTelefon1: CueDefinitionTelefon = {
	type: CueType.Telefon,
	source: 'TLF 1'
}

const unparsedTelefon1 = ['TELEFON=TLF 1']

const cueTelefon2: CueDefinitionTelefon = {
	type: CueType.Telefon,
	source: 'TLF 2'
}

const unparsedTelefon2 = ['TELEFON=TLF 2']

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

		const result = ParseBody('00000000001', 'test-segment', body1, cues1, fields, 0)
		expect(stripExternalId(result)).toEqual(
			literal<PartDefinition[]>([
				literal<PartDefinitionTeknik>({
					type: PartType.Teknik,
					cues: [cueUnknown, cueGrafik1, cueGrafik2, cueGrafik3],
					script: '',
					variant: {},
					externalId: '',
					rawType: 'TEKNIK',
					fields: {},
					modified: 0,
					storyName: 'test-segment'
				}),
				literal<PartDefinitionEkstern>({
					type: PartType.Ekstern,
					rawType: '',
					cues: [cueEkstern1],
					script: '',
					variant: {},
					externalId: '',
					fields: {},
					modified: 0,
					storyName: 'test-segment'
				}),
				literal<PartDefinitionEkstern>({
					type: PartType.Ekstern,
					rawType: '',
					cues: [cueEkstern2, cueJingle1, cueJingle2, cueJingle3],
					script: '',
					variant: {},
					externalId: '',
					fields: {},
					modified: 0,
					storyName: 'test-segment'
				})
			])
		)
	})

	test('test2', () => {
		const body2 =
			'\r\n<p></p>\r\n<p>Thid id thr trext for the next DVE</p>\r\n<p><pi>***LIVE*** </pi></p>\r\n<p><a idref="0"></a></p>\r\n<p><a idref="1"></a></p>\r\n<p><a idref="4"></a></p>\r\n<p><cc>Spib her</cc></p>\r\n<p></p>\r\n\r\n<p>Script here</p>\r\n'
		const cues2 = [unparsedUnknown, unparsedGrafik1, null, unparsedGrafik3, unparsedEkstern1]

		const result = ParseBody('00000000001', 'test-segment', body2, cues2, fields, 0)
		expect(stripExternalId(result)).toEqual(
			literal<PartDefinition[]>([
				literal<PartDefinitionUnknown>({
					type: PartType.Unknown,
					cues: [cueUnknown, cueGrafik1],
					script: 'Thid id thr trext for the next DVE\n',
					variant: {},
					externalId: '',
					rawType: '',
					fields: {},
					modified: 0,
					storyName: 'test-segment'
				}),
				literal<PartDefinitionEkstern>({
					type: PartType.Ekstern,
					rawType: '',
					cues: [cueEkstern1],
					script: 'Script here\n',
					variant: {},
					externalId: '',
					fields: {},
					modified: 0,
					storyName: 'test-segment'
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

		const result = ParseBody('00000000001', 'test-segment', body3, cues3, fields, 0)
		expect(stripExternalId(result)).toEqual(
			literal<PartDefinition[]>([
				literal<PartDefinitionKam>({
					type: PartType.Kam,
					rawType: 'KAM AR',
					cues: [cueUnknown, cueJingle3],
					script: 'Lots more script\n',
					variant: {
						name: 'AR'
					},
					externalId: '',
					fields: {},
					modified: 0,
					storyName: 'test-segment'
				}),
				literal<PartDefinitionServer>({
					type: PartType.Server,
					rawType: 'SERVER',
					cues: [cueGrafik1, cueGrafik2, cueGrafik3],
					script: '',
					variant: {},
					externalId: '',
					fields: {},
					modified: 0,
					storyName: 'test-segment'
				}),
				literal<PartDefinitionEkstern>({
					type: PartType.Ekstern,
					rawType: '',
					cues: [cueEkstern1],
					script: '',
					variant: {},
					externalId: '',
					fields: {},
					modified: 0,
					storyName: 'test-segment'
				}),
				literal<PartDefinitionEkstern>({
					type: PartType.Ekstern,
					rawType: '',
					cues: [cueEkstern2, cueJingle1, cueJingle2],
					script: '',
					variant: {},
					externalId: '',
					fields: {},
					modified: 0,
					storyName: 'test-segment'
				}),
				literal<PartDefinitionSlutord>({
					type: PartType.Slutord,
					rawType: 'SLUTORD: ekstra kick',
					cues: [],
					script: '',
					variant: {
						endWords: 'ekstra kick'
					},
					externalId: '',
					fields: {},
					modified: 0,
					storyName: 'test-segment'
				})
			])
		)
	})

	test('test4', () => {
		const body4 =
			"\r\n<p></p>\r\n<p><a idref='0'></a></p>\r\n<p><pi>CAMERA 1</pi></p>\r\n<p>Her står em masse tekst</p>\r\n"
		const cues4 = [unparsedUnknown]
		const result = ParseBody('00000000001', 'test-segment', body4, cues4, fields, 0)
		expect(stripExternalId(result)).toEqual(
			literal<PartDefinition[]>([
				literal<PartDefinitionUnknown>({
					type: PartType.Unknown,
					rawType: '',
					cues: [cueUnknown],
					script: '',
					variant: {},
					externalId: '',
					fields,
					modified: 0,
					storyName: 'test-segment'
				}),
				literal<PartDefinitionKam>({
					type: PartType.Kam,
					rawType: 'CAMERA 1',
					cues: [],
					script: 'Her står em masse tekst\n',
					variant: {
						name: '1'
					},
					externalId: '',
					fields,
					modified: 0,
					storyName: 'test-segment'
				})
			])
		)
	})

	test('test5', () => {
		const body5 =
			'\r\n<p></p>\r\n<p></p>\r\n<p><pi>KAM 1 </pi></p>\r\n<p><cc>--tlftopt-></cc><a idref="0"><cc><--</cc></a></p>\r\n<p></p>\r\n<p></p>\r\n<p><a idref="1"><pi>************ 100%GRAFIK ***********</pi></a></p>\r\n<p><a idref="4"></a></p>\r\n<p><a idref="3"></a></p>\r\n<p></p>\r\n'
		const cues5 = [unparsedUnknown, unparsedGrafik1, unparsedGrafik2, unparsedGrafik3, unparsedEkstern1]
		const result = ParseBody('00000000001', 'test-segment', body5, cues5, fields, 0)
		expect(stripExternalId(result)).toEqual(
			literal<PartDefinition[]>([
				literal<PartDefinitionKam>({
					type: PartType.Kam,
					rawType: 'KAM 1',
					cues: [cueUnknown],
					script: '',
					variant: {
						name: '1'
					},
					externalId: '',
					fields: {},
					modified: 0,
					storyName: 'test-segment'
				}),
				literal<PartDefinitionGrafik>({
					type: PartType.Grafik,
					rawType: '100%GRAFIK',
					cues: [cueGrafik1],
					script: '',
					variant: {},
					externalId: '',
					fields: {},
					modified: 0,
					storyName: 'test-segment'
				}),
				literal<PartDefinitionEkstern>({
					type: PartType.Ekstern,
					rawType: '',
					cues: [cueEkstern1, cueGrafik3],
					script: '',
					variant: {},
					externalId: '',
					fields: {},
					modified: 0,
					storyName: 'test-segment'
				})
			])
		)
	})

	test('test6', () => {
		const body6 =
			'\r\n<p><pi></pi></p>\r\n<p><pi></pi></p>\r\n<p><pi>KAM 1 </pi></p>\r\n<p><cc>--værter-></cc><a idref="0"><cc><--</cc><pi></pi></a></p>\r\n'
		const cues6 = [unparsedUnknown]
		const result = ParseBody('00000000001', 'test-segment', body6, cues6, fields, 0)
		expect(stripExternalId(result)).toEqual(
			literal<PartDefinition[]>([
				literal<PartDefinitionKam>({
					type: PartType.Kam,
					rawType: 'KAM 1',
					cues: [cueUnknown],
					script: '',
					variant: {
						name: '1'
					},
					externalId: '',
					fields: {},
					modified: 0,
					storyName: 'test-segment'
				})
			])
		)
	})

	test('test7', () => {
		const body7 =
			'\r\n<p></p>\r\n<p><a idref="0"></a></p>\r\n<p></p>\r\n<p><pi>***ATTACK*** </pi></p>\r\n<p><cc>----ss3 Sport LOOP-></cc><a idref="1"><cc><-</cc></a></p>\r\n<p><cc>---AR DIGI OUT-></cc><a idref="2"><cc><---</cc></a></p>\r\n<p><cc>---bundter herunder---></cc></p>\r\n<p><a idref="3"></a></p>\r\n<p></p>\r\n<p></p>\r\n<p><pi>SLUTORD:... wauw</pi></p>\r\n<p></p>\r\n<p><pi>KAM 4 </pi></p>\r\n<p><pi>NEDLÆG</pi></p>\r\n<p>Long script. Long script. Long script. Long script. Long script. Long script. Long script. Long script. Long script. Long script. Long script. Long script.</p>\r\n<p></p>\r\n'
		const cues7 = [unparsedUnknown, unparsedGrafik1, unparsedGrafik2, unparsedGrafik3]
		const result = ParseBody('00000000001', 'test-segment', body7, cues7, fields, 0)
		expect(stripExternalId(result)).toEqual(
			literal<PartDefinition[]>([
				literal<PartDefinitionUnknown>({
					type: PartType.Unknown,
					rawType: '',
					cues: [cueUnknown],
					script: '',
					variant: {},
					externalId: '',
					fields,
					modified: 0,
					storyName: 'test-segment'
				}),
				literal<PartDefinitionServer>({
					type: PartType.Server,
					rawType: 'ATTACK',
					cues: [cueGrafik1, cueGrafik2, cueGrafik3],
					script: '',
					variant: {},
					externalId: '',
					fields: {},
					modified: 0,
					storyName: 'test-segment'
				}),
				literal<PartDefinitionSlutord>({
					type: PartType.Slutord,
					rawType: 'SLUTORD wauw',
					cues: [],
					script: '',
					variant: {
						endWords: 'wauw'
					},
					externalId: '',
					fields: {},
					modified: 0,
					storyName: 'test-segment'
				}),
				literal<PartDefinitionKam>({
					type: PartType.Kam,
					rawType: 'KAM 4',
					cues: [],
					script:
						'Long script. Long script. Long script. Long script. Long script. Long script. Long script. Long script. Long script. Long script. Long script. Long script.\n',
					variant: {
						name: '4'
					},
					externalId: '',
					fields: {},
					modified: 0,
					storyName: 'test-segment'
				})
			])
		)
	})

	test('test8', () => {
		const body8 =
			'\r\n<p><cc>COMMENT OUTSIDE!!</cc></p>\r\n<p><pi>KAM 2</pi></p>\r\n<p><pi>KADA</pi></p>\r\n<p><a idref="0"></a></p>\r\n<p><a idref="1"><a idref="2"></a></a></p>\r\n<p><cc>Efter "BYNAVN=" og efter "#kg direkte"</cc></p>\r\n<p></p>\r\n<p><a idref="3"> <cc>Kilde til optagelse på select-feed.</cc></a></p>\r\n<p></p>\r\n<p>Some script</p>\r\n<p></p>\r\n<p><pi>***LIVE*** </pi></p>\r\n<p><cc>Some script</cc></p>\r\n<p><a idref="4"></a></p>\r\n<p></p>\r\n<p><pi>- Bullet 1?</pi></p>\r\n<p></p>\r\n<p><pi>- Bullet 2?</pi></p>\r\n<p></p>\r\n<p><pi>- Bullet 3?</pi></p>\r\n<p></p>\r\n'
		const cues8 = [unparsedUnknown, unparsedGrafik1, unparsedGrafik2, unparsedGrafik3, unparsedEkstern1]
		const result = ParseBody('00000000001', 'test-segment', body8, cues8, fields, 0)
		expect(stripExternalId(result)).toEqual(
			literal<PartDefinition[]>([
				literal<PartDefinitionKam>({
					type: PartType.Kam,
					rawType: 'KAM 2',
					cues: [cueUnknown, cueGrafik1, cueGrafik2, cueGrafik3],
					script: 'Some script\n',
					variant: {
						name: '2'
					},
					externalId: '',
					fields: {},
					modified: 0,
					storyName: 'test-segment'
				}),
				literal<PartDefinitionEkstern>({
					type: PartType.Ekstern,
					rawType: '',
					cues: [cueEkstern1],
					script: '',
					variant: {},
					externalId: '',
					fields: {},
					modified: 0,
					storyName: 'test-segment'
				})
			])
		)
	})

	test('test9', () => {
		const body9 =
			'\r\n<p><cc>COMMENT OUTSIDE!!</cc></p>\r\n<p><pi>KAM 2</pi></p>\r\n<p><a idref="0"></a></p>\r\n<p><a idref="1"><a idref="2"></a></a></p>\r\n<p><cc>Efter "BYNAVN=" og efter "#kg direkte"</cc></p>\r\n<p></p>\r\n<p><a idref="3"> <cc>Kilde til optagelse på select-feed.</cc></a></p>\r\n<p></p>\r\n<p>Some script.</p>\r\n<p></p>\r\n<p>Some more script with "a quote"</p>\r\n<p></p>\r\n<p>Yet more script, this time it\'s a question? </p>\r\n<p></p>\r\n<p><pi>***LIVE*** </pi></p>\r\n<p><cc>More commentary</cc></p>\r\n<p><a idref="4"></a></p>\r\n<p></p>\r\n<p><pi>Danmark? </pi></p>\r\n<p></p>\r\n<p><pi>Grønland en "absurd diskussion"? </pi></p>\r\n<p></p>\r\n<p></p>\r\n'
		const cues9 = [unparsedUnknown, unparsedGrafik1, unparsedGrafik2, unparsedGrafik3, unparsedEkstern1]
		const result = ParseBody('00000000001', 'test-segment', body9, cues9, fields, 0)
		expect(stripExternalId(result)).toEqual(
			literal<PartDefinition[]>([
				literal<PartDefinitionKam>({
					type: PartType.Kam,
					rawType: 'KAM 2',
					cues: [cueUnknown, cueGrafik1, cueGrafik2, cueGrafik3],
					script: 'Some script.\nSome more script with "a quote"\nYet more script, this time it\'s a question?\n',
					variant: {
						name: '2'
					},
					externalId: '',
					fields: {},
					modified: 0,
					storyName: 'test-segment'
				}),
				literal<PartDefinitionEkstern>({
					type: PartType.Ekstern,
					rawType: '',
					cues: [cueEkstern1],
					script: '',
					variant: {},
					externalId: '',
					fields: {},
					modified: 0,
					storyName: 'test-segment'
				})
			])
		)
	})

	// TODO: If any users complain of missing bullet points after cameras, here's your culprit.
	test('test10', () => {
		const body10 =
			'\r\n<p><pi>KAM 2</pi></p>\r\n<p><a idref="0"></a></p>\r\n<p><a idref="1"><a idref="2"></a></a></p>\r\n<p><cc>Efter "BYNAVN=" og efter "#kg direkte"</cc></p>\r\n<p></p>\r\n<p><a idref="3"> <cc>Kilde til optagelse på select-feed.</cc></a></p>\r\n<p></p>\r\n<p>Question?</p>\r\n<p></p>\r\n<p><pi>Question, but in PI tags?</pi></p>\r\n<p></p>\r\n<p><pi>USA og Danmark?</pi></p>\r\n<p></p>\r\n<p><pi>***LIVE*** </pi></p>\r\n<p><cc>Comment</cc></p>\r\n<p><a idref="4"></a></p>\r\n<p><pi>This line should be ignored</pi></p>\r\n<p></p>\r\n<p><pi>Also this one?</pi></p>\r\n<p></p>\r\n<p><cc>More comments</cc></p>\r\n<p><cc>Even more?</cc></p>\r\n<p><cc></cc></p>\r\n'
		const cues10 = [unparsedUnknown, unparsedGrafik1, unparsedGrafik2, unparsedGrafik3, unparsedEkstern1]
		const result = ParseBody('00000000001', 'test-segment', body10, cues10, fields, 0)
		expect(stripExternalId(result)).toEqual(
			literal<PartDefinition[]>([
				literal<PartDefinitionKam>({
					type: PartType.Kam,
					rawType: 'KAM 2',
					cues: [cueUnknown, cueGrafik1, cueGrafik2, cueGrafik3],
					script: 'Question?\n',
					variant: {
						name: '2'
					},
					externalId: '',
					fields: {},
					modified: 0,
					storyName: 'test-segment'
				}),
				literal<PartDefinitionEkstern>({
					type: PartType.Ekstern,
					rawType: '',
					cues: [cueEkstern1],
					script: '',
					variant: {},
					externalId: '',
					fields: {},
					modified: 0,
					storyName: 'test-segment'
				})
			])
		)
	})

	test('test11', () => {
		const body11 =
			'\r\n<p><pi>KAM 1</pi></p>\r\n<p></p>\r\n<p>Some script.</p>\r\n<p><a idref="0"></a></p>\r\n<p><pi>***VO***</pi></p>\r\n<p><a idref="1"></a></p>\r\n<p><pi><b>SB: Say this over this clip (10 sek)</b></pi></p>\r\n<p><a idref="2"></a></p>\r\n<p>More script. </p>\r\n<p></p>\r\n<p>Even more</p>\r\n<p></p>\r\n<p>More script again. </p>\r\n<p></p>\r\n<p><cc>Couple of comments</cc></p>\r\n<p><cc>Should be ignored</cc></p>\r\n<p></p>\r\n'
		const cues11 = [unparsedUnknown, unparsedGrafik1, unparsedGrafik2]
		const result = ParseBody('00000000001', 'test-segment', body11, cues11, fields, 0)
		expect(stripExternalId(result)).toEqual(
			literal<PartDefinition[]>([
				literal<PartDefinitionKam>({
					type: PartType.Kam,
					rawType: 'KAM 1',
					cues: [cueUnknown],
					script: 'Some script.\n',
					variant: {
						name: '1'
					},
					externalId: '',
					fields: {},
					modified: 0,
					storyName: 'test-segment'
				}),
				literal<PartDefinitionVO>({
					type: PartType.VO,
					rawType: 'VO',
					cues: [cueGrafik1, cueGrafik2],
					script: 'More script.\nEven more\nMore script again.\n',
					variant: {},
					externalId: '',
					fields: {},
					modified: 0,
					storyName: 'test-segment'
				})
			])
		)
	})

	test('test11a - VOV', () => {
		const body11 =
			'\r\n<p><pi>KAM 1</pi></p>\r\n<p></p>\r\n<p>Some script.</p>\r\n<p><a idref="0"></a></p>\r\n<p><pi>***VOV***</pi></p>\r\n<p><a idref="1"></a></p>\r\n<p><pi><b>SB: Say this over this clip (10 sek)</b></pi></p>\r\n<p><a idref="2"></a></p>\r\n<p>More script. </p>\r\n<p></p>\r\n<p>Even more</p>\r\n<p></p>\r\n<p>More script again. </p>\r\n<p></p>\r\n<p><cc>Couple of comments</cc></p>\r\n<p><cc>Should be ignored</cc></p>\r\n<p></p>\r\n'
		const cues11 = [unparsedUnknown, unparsedGrafik1, unparsedGrafik2]
		const result = ParseBody('00000000001', 'test-segment', body11, cues11, fields, 0)
		expect(stripExternalId(result)).toEqual(
			literal<PartDefinition[]>([
				literal<PartDefinitionKam>({
					type: PartType.Kam,
					rawType: 'KAM 1',
					cues: [cueUnknown],
					script: 'Some script.\n',
					variant: {
						name: '1'
					},
					externalId: '',
					fields: {},
					modified: 0,
					storyName: 'test-segment'
				}),
				literal<PartDefinitionVO>({
					type: PartType.VO,
					rawType: 'VOV',
					cues: [cueGrafik1, cueGrafik2],
					script: 'More script.\nEven more\nMore script again.\n',
					variant: {},
					externalId: '',
					fields: {},
					modified: 0,
					storyName: 'test-segment'
				})
			])
		)
	})

	test('test12', () => {
		const body12 =
			'\r\n<p><cc>This is an interview.</cc></p>\r\n<p></p>\r\n<p></p>\r\n<p><pi>KAM 3</pi></p>\r\n<p></p>\r\n<p><a idref="0"><cc> <-- Comment about this</cc></a></p>\r\n<p></p>\r\n<p><a idref="1"> <cc>Also about this! </cc></a></p>\r\n<p></p>\r\n<p><cc>Remember:</cc></p>\r\n<p></p>\r\n<p>Here is our correspondant. </p>\r\n<p></p>\r\n<p>What\'s going on over there? </p>\r\n<p></p>\r\n<p><pi>***LIVE*** </pi></p>\r\n<p><cc>There is a graphic in this part</cc></p>\r\n<p>.</p>\r\n<p></p>\r\n<p><pi>Ask a question? </pi></p>\r\n<p></p>\r\n<p><pi>Ask another?</pi></p>\r\n<p></p>\r\n<p><pi>What\'s the reaction? </pi></p>\r\n<p></p>\r\n<p><a idref="2"></a></p>\r\n<p></p>\r\n'
		const cues12 = [unparsedUnknown, unparsedGrafik1, unparsedGrafik2]
		const result = ParseBody('00000000001', 'test-segment', body12, cues12, fields, 0)
		expect(stripExternalId(result)).toEqual(
			literal<PartDefinition[]>([
				literal<PartDefinitionKam>({
					type: PartType.Kam,
					rawType: 'KAM 3',
					cues: [cueUnknown, cueGrafik1, cueGrafik2],
					script: "Here is our correspondant.\nWhat's going on over there?\n.\n",
					variant: {
						name: '3'
					},
					externalId: '',
					fields: {},
					modified: 0,
					storyName: 'test-segment'
				})
			])
		)
	})

	test('test13', () => {
		const body13 =
			'\r\n<p><a idref="0"></a></p>\r\n<p></p>\r\n<p></p>\r\n<p></p>\r\n<p></p>\r\n<p></p>\r\n<p></p>\r\n<p></p>\r\n<p></p>\r\n<p></p>\r\n<p></p>\r\n<p></p>\r\n<p></p>\r\n<p></p>\r\n<p></p>\r\n'
		const cues13 = [unparsedUnknown]
		const result = ParseBody('00000000001', 'test-segment', body13, cues13, fields, 0)
		expect(stripExternalId(result)).toEqual(
			literal<PartDefinition[]>([
				literal<PartDefinitionUnknown>({
					type: PartType.Unknown,
					rawType: '',
					cues: [cueUnknown],
					script: '',
					variant: {},
					externalId: '',
					fields: {},
					modified: 0,
					storyName: 'test-segment'
				})
			])
		)
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
		const result = ParseBody('00000000001', 'test-segment', body14, cues14, fields, 0)
		expect(stripExternalId(result)).toEqual(
			literal<PartDefinition[]>([
				literal<PartDefinitionUnknown>({
					type: PartType.Unknown,
					rawType: '',
					cues: [cueUnknown, cueGrafik1, cueGrafik2, cueGrafik3],
					script: "What's going on over there?\n",
					variant: {},
					externalId: '',
					fields: {},
					modified: 0,
					storyName: 'test-segment'
				}),
				literal<PartDefinitionEkstern>({
					type: PartType.Ekstern,
					rawType: '',
					cues: [cueEkstern1],
					script: '',
					variant: {},
					externalId: '',
					fields: {},
					modified: 0,
					storyName: 'test-segment'
				}),
				literal<PartDefinitionEkstern>({
					type: PartType.Ekstern,
					rawType: '',
					cues: [cueEkstern2],
					script: '',
					variant: {},
					externalId: '',
					fields: {},
					modified: 0,
					storyName: 'test-segment'
				})
			])
		)
	})

	test('test15', () => {
		const body15 =
			'\r\n<p><cc>---JINGLE sport grafisk intro---></cc><a idref="0"><cc><----</cc></a></p>\r\n<p></p>\r\n<p><cc>---AUDIO til grafisk intro , fortsætter under teasere---></cc><a idref="2"><cc><----</cc></a></p>\r\n<p><a idref="1"></a></p>\r\n'
		const cues15 = [unparsedUnknown, unparsedGrafik1]
		const result = ParseBody('00000000001', 'INTRO', body15, cues15, fields, 0)
		expect(stripExternalId(result)).toEqual(
			literal<PartDefinition[]>([
				literal<PartDefinitionIntro>({
					type: PartType.INTRO,
					rawType: 'INTRO',
					cues: [cueUnknown, cueGrafik1],
					script: '',
					variant: {},
					externalId: '',
					fields: {},
					modified: 0,
					storyName: 'INTRO'
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
		const result = ParseBody('00000000001', 'test-segment', body16, cues16, fields, 0)
		expect(stripExternalId(result)).toEqual(
			literal<PartDefinition[]>([
				literal<PartDefinitionKam>({
					externalId: '',
					type: PartType.Kam,
					rawType: 'KAM 2',
					script: 'Hallo, I wnat to tell you......\n',
					variant: {
						name: '2'
					},
					cues: [cueUnknown, cueGrafik1],
					fields,
					modified: 0,
					storyName: 'test-segment'
				}),
				literal<PartDefinitionServer>({
					externalId: '',
					type: PartType.Server,
					rawType: 'SERVER',
					script: '',
					variant: {},
					cues: [cueGrafik2, cueGrafik3, cueJingle1, cueJingle2, cueJingle3],
					fields,
					modified: 0,
					storyName: 'test-segment'
				}),
				literal<PartDefinitionKam>({
					externalId: '',
					type: PartType.Kam,
					rawType: 'KAM 2',
					script: '',
					variant: {
						name: '2'
					},
					cues: [],
					fields,
					modified: 0,
					storyName: 'test-segment'
				}),
				literal<PartDefinitionSlutord>({
					externalId: '',
					type: PartType.Slutord,
					rawType: 'SLUTORD:',
					script: '',
					variant: {
						endWords: ''
					},
					cues: [],
					fields,
					modified: 0,
					storyName: 'test-segment'
				}),
				literal<PartDefinitionKam>({
					externalId: '',
					type: PartType.Kam,
					rawType: 'KAM 2',
					script: '',
					variant: {
						name: '2'
					},
					cues: [],
					fields,
					modified: 0,
					storyName: 'test-segment'
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
		const result = ParseBody('00000000001', 'test-segment', body17, cues17, fields, 0)
		expect(stripExternalId(result)).toEqual(
			literal<PartDefinition[]>([
				literal<PartDefinitionEkstern>({
					externalId: '',
					type: PartType.Ekstern,
					variant: {},
					rawType: '',
					cues: [cueEkstern1],
					script: '',
					fields,
					modified: 0,
					storyName: 'test-segment'
				}),
				literal<PartDefinitionEkstern>({
					externalId: '',
					type: PartType.Ekstern,
					variant: {},
					rawType: '',
					cues: [cueEkstern2],
					script: '',
					fields,
					modified: 0,
					storyName: 'test-segment'
				}),
				literal<PartDefinitionKam>({
					externalId: '',
					type: PartType.Kam,
					variant: {
						name: '1'
					},
					rawType: 'KAM 1',
					cues: [],
					script: 'Single line of script\n',
					fields,
					modified: 0,
					storyName: 'test-segment'
				}),
				literal<PartDefinitionServer>({
					externalId: '',
					type: PartType.Server,
					variant: {},
					rawType: 'SERVER',
					cues: [cueGrafik2, cueGrafik3, cueJingle1, cueJingle2, cueJingle3],
					script: '',
					fields,
					modified: 0,
					storyName: 'test-segment'
				}),
				literal<PartDefinitionTelefon>({
					externalId: '',
					type: PartType.Telefon,
					variant: {},
					rawType: '',
					cues: [cueTelefon1],
					script: '',
					fields,
					modified: 0,
					storyName: 'test-segment'
				}),
				literal<PartDefinitionTelefon>({
					externalId: '',
					type: PartType.Telefon,
					variant: {},
					rawType: '',
					cues: [cueTelefon2],
					script: '',
					fields,
					modified: 0,
					storyName: 'test-segment'
				}),
				literal<PartDefinitionSlutord>({
					externalId: '',
					type: PartType.Slutord,
					variant: {
						endWords: ''
					},
					rawType: 'SLUTORD:',
					cues: [],
					script: '',
					fields,
					modified: 0,
					storyName: 'test-segment'
				}),
				literal<PartDefinitionSlutord>({
					externalId: '',
					type: PartType.Slutord,
					variant: {
						endWords: 'Skarpere regler.'
					},
					rawType: 'Slutord Skarpere regler.',
					cues: [],
					script: '',
					fields,
					modified: 0,
					storyName: 'test-segment'
				}),
				literal<PartDefinitionKam>({
					externalId: '',
					type: PartType.Kam,
					variant: {
						name: '2'
					},
					rawType: 'KAM 2',
					cues: [],
					script: 'And some script.\n',
					fields,
					modified: 0,
					storyName: 'test-segment'
				})
			])
		)
	})

	test('test18', () => {
		const body18 =
			'\r\n<p><pi>***VO EFFEKT 0*** </pi></p>\r\n<p><a idref="0"></a></p>\r\n<p>With some script. </p>\r\n<p></p>\r\n'
		const cues18 = [unparsedGrafik1]
		const result = ParseBody('00000000001', 'test-segment', body18, cues18, fields, 0)
		expect(stripExternalId(result)).toEqual(
			literal<PartDefinition[]>([
				literal<PartDefinitionVO>({
					externalId: '',
					type: PartType.VO,
					variant: {},
					effekt: 0,
					rawType: 'VO',
					cues: [cueGrafik1],
					script: 'With some script.\n',
					fields,
					modified: 0,
					storyName: 'test-segment'
				})
			])
		)
	})

	test('test19', () => {
		const body19 =
			'\r\n<p></p>\r\n<p><pi>KAM 1 EFFEKT 1</pi></p>\r\n<p>Dette er takst</p>\r\n<p></p>\r\n<p><pi>SERVER</pi></p>\r\n<p><a idref="0"></a></p>\r\n<p><a idref="1"></a></p>\r\n<p>STORT BILLEDE AF STUDIE</p>\r\n<p></p>\r\n'
		const cues19 = [unparsedGrafik1, unparsedGrafik2]
		const result = ParseBody('00000000001', 'test-segment', body19, cues19, fields, 0)
		expect(stripExternalId(result)).toEqual(
			literal<PartDefinition[]>([
				literal<PartDefinitionKam>({
					externalId: '',
					type: PartType.Kam,
					variant: {
						name: '1'
					},
					effekt: 1,
					rawType: 'KAM 1',
					cues: [],
					script: 'Dette er takst\n',
					fields,
					modified: 0,
					storyName: 'test-segment'
				}),
				literal<PartDefinitionServer>({
					externalId: '',
					type: PartType.Server,
					variant: {},
					rawType: 'SERVER',
					cues: [cueGrafik1, cueGrafik2],
					script: 'STORT BILLEDE AF STUDIE\n',
					fields,
					modified: 0,
					storyName: 'test-segment'
				})
			])
		)
	})

	test('test20', () => {
		const body20 =
			'\r\n<p><cc>OBS: der skal være 2 primære templates mellem 2 breakere</cc></p>\r\n<p><pi>K2 NBA18_LEAD_OUT</pi></p>\r\n<p><a idref="0"></a></p>\r\n<p></p>\r\n<p><tab><tab><tab><tab><tab><tab></tab></tab></tab></tab></tab></tab></p>\r\n<p></p>\r\n'
		const cues20 = [unparsedJingle1]
		const result = ParseBody('00000000001', 'test-segment', body20, cues20, fields, 0)
		expect(stripExternalId(result)).toEqual(
			literal<PartDefinition[]>([
				literal<PartDefinitionUnknown>({
					externalId: '',
					type: PartType.Unknown,
					variant: {},
					rawType: '',
					cues: [cueJingle1],
					script: '',
					fields,
					modified: 0,
					storyName: 'test-segment'
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
		const result = ParseBody('00000000001', 'test-segment', body21, cues21, fields, 0)
		expect(stripExternalId(result)).toEqual(
			literal<PartDefinition[]>([
				literal<PartDefinitionKam>({
					externalId: '',
					type: PartType.Kam,
					variant: {
						name: '2'
					},
					rawType: 'KAM 2',
					cues: [],
					script: 'Hallo, I wnat to tell you......\nHEREEEELLLLOOOK\nYES\n',
					fields,
					modified: 0,
					storyName: 'test-segment'
				}),
				literal<PartDefinitionServer>({
					externalId: '',
					type: PartType.Server,
					variant: {},
					rawType: 'SERVER',
					cues: literal<CueDefinition[]>([
						literal<CueDefinitionGrafik>({
							type: CueType.Grafik,
							template: 'ident_blank',
							cue: 'kg',
							textFields: ['ODENSE', 'KLJ'],
							adlib: true
						}),
						literal<CueDefinitionGrafik>({
							type: CueType.Grafik,
							template: 'bund',
							cue: 'kg',
							textFields: ['TEXT MORETEXT', 'Inews'],
							adlib: true
						}),
						literal<CueDefinitionGrafik>({
							type: CueType.Grafik,
							template: 'bund',
							cue: 'kg',
							textFields: ['TEXT MORETEXT', 'some@email.fakeTLD'],
							adlib: true
						}),
						literal<CueDefinitionTargetWall>({
							type: CueType.TargetWall,
							start: {
								seconds: 1
							},
							clip: '3-NYH-19-LOOP'
						})
					]),
					script: '',
					fields,
					modified: 0,
					storyName: 'test-segment'
				}),
				literal<PartDefinitionKam>({
					externalId: '',
					type: PartType.Kam,
					variant: {
						name: '1'
					},
					rawType: 'KAM 1',
					cues: [],
					script: '',
					fields,
					modified: 0,
					storyName: 'test-segment'
				}),
				literal<PartDefinitionKam>({
					externalId: '',
					type: PartType.Kam,
					variant: {
						name: '1'
					},
					rawType: 'KAM 1',
					cues: [],
					script: '',
					fields,
					modified: 0,
					storyName: 'test-segment'
				}),
				literal<PartDefinitionSlutord>({
					externalId: '',
					type: PartType.Slutord,
					variant: {
						endWords: ''
					},
					rawType: 'SLUTORD:',
					cues: [],
					script: '',
					fields,
					modified: 0,
					storyName: 'test-segment'
				}),
				literal<PartDefinitionKam>({
					externalId: '',
					type: PartType.Kam,
					variant: {
						name: '1'
					},
					rawType: 'KAM 1',
					cues: [],
					script: '',
					fields,
					modified: 0,
					storyName: 'test-segment'
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
		const result = ParseBody('00000000001', 'test-segment', body22, cues22, fields, 0)
		expect(stripExternalId(result)).toEqual(
			literal<PartDefinition[]>([
				literal<PartDefinitionKam>({
					externalId: '',
					type: PartType.Kam,
					variant: {
						name: '1'
					},
					rawType: 'KAM 1',
					cues: [],
					script: 'Skriv spib her\n',
					fields,
					modified: 0,
					storyName: 'test-segment'
				}),
				literal<PartDefinitionTelefon>({
					externalId: '',
					type: PartType.Telefon,
					variant: {},
					rawType: '',
					cues: [
						literal<CueDefinitionTelefon>({
							type: CueType.Telefon,
							source: 'TLF 2',
							vizObj: literal<CueDefinitionGrafik>({
								type: CueType.Grafik,
								template: 'bund',
								cue: 'kg',
								textFields: ['TEXT MORETEXT', 'some@email.fakeTLD'],
								start: {
									seconds: 2
								}
							})
						}),
						literal<CueDefinitionGrafik>({
							type: CueType.Grafik,
							template: 'tlfdirekte',
							cue: 'kg',
							textFields: ['Odense'],
							start: {
								seconds: 0
							},
							end: {
								infiniteMode: 'S'
							}
						}),
						literal<CueDefinitionGrafik>({
							type: CueType.Grafik,
							template: 'tlftoptlive',
							cue: 'kg',
							textFields: ['TEXT MORETEXT', 'place'],
							start: {
								seconds: 0
							},
							end: {
								infiniteMode: 'S'
							}
						})
					],
					script: '',
					fields,
					modified: 0,
					storyName: 'test-segment'
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
		const result = ParseBody('00000000001', 'test-segment', body22, cues22, fields, 0)
		expect(stripExternalId(result)).toEqual(
			literal<PartDefinition[]>([
				literal<PartDefinitionKam>({
					externalId: '',
					type: PartType.Kam,
					variant: {
						name: '1'
					},
					transition: {
						style: 'MIX',
						duration: 200
					},
					rawType: 'KAM 1',
					cues: [],
					script: 'Skriv spib her\n',
					fields,
					modified: 0,
					storyName: 'test-segment'
				}),
				literal<PartDefinitionTelefon>({
					externalId: '',
					type: PartType.Telefon,
					variant: {},
					rawType: '',
					cues: [
						literal<CueDefinitionTelefon>({
							type: CueType.Telefon,
							source: 'TLF 2',
							vizObj: literal<CueDefinitionGrafik>({
								type: CueType.Grafik,
								template: 'bund',
								cue: 'kg',
								textFields: ['TEXT MORETEXT', 'some@email.fakeTLD'],
								start: {
									seconds: 2
								}
							})
						}),
						literal<CueDefinitionGrafik>({
							type: CueType.Grafik,
							template: 'tlfdirekte',
							cue: 'kg',
							textFields: ['Odense'],
							start: {
								seconds: 0
							},
							end: {
								infiniteMode: 'S'
							}
						}),
						literal<CueDefinitionGrafik>({
							type: CueType.Grafik,
							template: 'tlftoptlive',
							cue: 'kg',
							textFields: ['TEXT MORETEXT', 'Place'],
							start: {
								seconds: 0
							},
							end: {
								infiniteMode: 'S'
							}
						})
					],
					script: '',
					fields,
					modified: 0,
					storyName: 'test-segment'
				})
			])
		)
	})

	test('test 24', () => {
		const body18 =
			'\r\n<p><pi>***VOSB EFFEKT 0*** </pi></p>\r\n<p><a idref="0"></a></p>\r\n<p>Some script. </p>\r\n<p></p>\r\n'
		const cues18 = [unparsedGrafik1]
		const result = ParseBody('00000000001', 'test-segment', body18, cues18, fields, 0)
		expect(stripExternalId(result)).toEqual(
			literal<PartDefinition[]>([
				literal<PartDefinitionVO>({
					externalId: '',
					type: PartType.VO,
					variant: {},
					effekt: 0,
					rawType: 'VOSB',
					cues: [cueGrafik1],
					script: 'Some script.\n',
					fields,
					modified: 0,
					storyName: 'test-segment'
				})
			])
		)
	})

	test('test 25', () => {
		const body18 =
			'\r\n<p><pi>***VOSB EFFEKT 0*** </pi></p>\r\n<p><a idref="0"></a></p>\r\n<p><pi>Some script here, possibly a note to the presenter</pi></p>\r\n<p>Some script. </p>\r\n<p></p>\r\n'
		const cues18 = [unparsedGrafik1]
		const result = ParseBody('00000000001', 'test-segment', body18, cues18, fields, 0)
		expect(stripExternalId(result)).toEqual(
			literal<PartDefinition[]>([
				literal<PartDefinitionVO>({
					externalId: '',
					type: PartType.VO,
					variant: {},
					effekt: 0,
					rawType: 'VOSB',
					cues: [cueGrafik1],
					script: 'Some script.\n',
					fields,
					modified: 0,
					storyName: 'test-segment'
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
		const result = ParseBody('00000000001', 'test-segment', body26, cues26, fields, 0)
		expect(stripExternalId(result)).toEqual([
			literal<PartDefinitionKam>({
				externalId: '',
				type: PartType.Kam,
				variant: {
					name: '1'
				},
				rawType: 'KAM 1',
				cues: [
					literal<CueDefinitionGrafik>({
						type: CueType.Grafik,
						template: 'tlftoptlive',
						cue: 'kg',
						textFields: ['Dette er tlf top', 'Tester'],
						start: {
							seconds: 0
						}
					})
				],
				fields,
				modified: 0,
				script: '',
				storyName: 'test-segment'
			}),
			literal<PartDefinitionGrafik>({
				externalId: '',
				type: PartType.Grafik,
				variant: {},
				rawType: '100%GRAFIK',
				cues: [
					literal<CueDefinitionTargetEngine>({
						type: CueType.TargetEngine,
						engine: 'full',
						rawType: 'GRAFIK=full',
						content: {},
						grafik: literal<CueDefinitionMOS>({
							type: CueType.MOS,
							name: 'TELEFON/KORT//LIVE_KABUL',
							vcpid: 2552305,
							continueCount: 3,
							start: {
								seconds: 0
							}
						})
					}),
					literal<CueDefinitionGrafik>({
						type: CueType.Grafik,
						template: 'tlfdirekte',
						cue: 'kg',
						textFields: ['KØBENHAVN'],
						start: {
							seconds: 0
						}
					})
				],
				fields,
				modified: 0,
				script: '',
				storyName: 'test-segment'
			})
		])
	})

	test('test 27a', () => {
		const body27 =
			'\r\n<p></p>\r\n<p></p>\r\n<p><pi>EVS 1</pi></p>\r\n<p></p>\r\n<p></p>\r\n<p><a idref="0"><a idref="1"><a idref="2"></a></a></a></p>\r\n<p></p>\r\n<p></p>\r\n<p></p>\r\n<p></p>\r\n<p>Skriv din spib her</p>\r\n<p></p>\r\n'
		const cues27 = [unparsedGrafik1, unparsedGrafik2, unparsedGrafik3]
		const result = ParseBody('00000000001', 'test-segment', body27, cues27, fields, 0)
		expect(stripExternalId(result)).toEqual([
			literal<PartDefinitionEVS>({
				externalId: '',
				type: PartType.EVS,
				rawType: 'EVS 1',
				variant: {
					evs: '1',
					isVO: false
				},
				cues: [cueGrafik1, cueGrafik2, cueGrafik3],
				fields,
				modified: 0,
				script: 'Skriv din spib her\n',
				storyName: 'test-segment'
			})
		])
	})

	test('test 27b', () => {
		const body27 =
			'\r\n<p></p>\r\n<p></p>\r\n<p><pi>EVS1VOV</pi></p>\r\n<p></p>\r\n<p></p>\r\n<p><a idref="0"><a idref="1"><a idref="2"></a></a></a></p>\r\n<p></p>\r\n<p></p>\r\n<p></p>\r\n<p></p>\r\n<p>Skriv din spib her</p>\r\n<p></p>\r\n'
		const cues27 = [unparsedGrafik1, unparsedGrafik2, unparsedGrafik3]
		const result = ParseBody('00000000001', 'test-segment', body27, cues27, fields, 0)
		expect(stripExternalId(result)).toEqual([
			literal<PartDefinitionEVS>({
				externalId: '',
				type: PartType.EVS,
				rawType: 'EVS1VOV',
				variant: {
					evs: '1',
					isVO: true
				},
				cues: [cueGrafik1, cueGrafik2, cueGrafik3],
				fields,
				modified: 0,
				script: 'Skriv din spib her\n',
				storyName: 'test-segment'
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
		const result = ParseBody('00000000001', 'test-segment', body28, cues28, fields, 0)
		expect(stripExternalId(result)).toEqual([
			literal<PartDefinitionServer>({
				externalId: '',
				type: PartType.Server,
				variant: {},
				rawType: 'SERVER',
				cues: [
					literal<CueDefinitionTargetWall>({
						type: CueType.TargetWall,
						clip: 'SC-LOOP',
						start: {
							seconds: 0,
							frames: 1
						}
					}),
					literal<CueDefinitionUnknown>({
						type: CueType.Unknown
					}),
					literal<CueDefinitionGrafik>({
						type: CueType.Grafik,
						template: 'bund',
						cue: 'kg',
						start: {
							seconds: 0
						},
						textFields: ['TEXT MORETEXT', 'Triatlet']
					})
				],
				script: '',
				fields,
				modified: 0,
				storyName: 'test-segment'
			}),
			literal<PartDefinitionSlutord>({
				externalId: '',
				type: PartType.Slutord,
				variant: {
					endWords: 'bare mega fedt'
				},
				rawType: 'SLUTORD bare mega fedt',
				cues: [],
				script: '',
				fields,
				modified: 0,
				storyName: 'test-segment'
			}),
			literal<PartDefinitionDVE>({
				externalId: '',
				type: PartType.DVE,
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
				script: '',
				fields,
				modified: 0,
				storyName: 'test-segment'
			}),
			literal<PartDefinitionEkstern>({
				externalId: '',
				type: PartType.Ekstern,
				variant: {},
				rawType: '',
				cues: [
					literal<CueDefinitionEkstern>({
						type: CueType.Ekstern,
						source: 'LIVE 2'
					})
				],
				script: 'Some Script here\n',
				fields,
				modified: 0,
				storyName: 'test-segment'
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
		const result = ParseBody('00000000001', 'test-segment', body29, cues29, fields, 0)
		expect(stripExternalId(result)).toEqual(
			literal<PartDefinition[]>([
				literal<PartDefinitionEkstern>({
					externalId: '',
					type: PartType.Ekstern,
					variant: {},
					rawType: '',
					cues: [cueEkstern1],
					script: '',
					fields,
					modified: 0,
					storyName: 'test-segment'
				}),
				literal<PartDefinitionEkstern>({
					externalId: '',
					type: PartType.Ekstern,
					variant: {},
					rawType: '',
					cues: [cueEkstern2],
					script: '',
					fields,
					modified: 0,
					storyName: 'test-segment'
				}),
				literal<PartDefinitionKam>({
					externalId: '',
					type: PartType.Kam,
					variant: {
						name: '1'
					},
					rawType: 'KAM 1',
					cues: [],
					script: 'Some script.\n',
					fields,
					modified: 0,
					storyName: 'test-segment'
				}),
				literal<PartDefinitionServer>({
					externalId: '',
					type: PartType.Server,
					variant: {},
					rawType: 'SERVER',
					cues: [cueGrafik2, cueGrafik3, cueJingle1, cueJingle2, cueJingle3],
					script: '',
					fields,
					modified: 0,
					storyName: 'test-segment'
				}),
				literal<PartDefinitionTelefon>({
					externalId: '',
					type: PartType.Telefon,
					variant: {},
					rawType: '',
					cues: [cueTelefon1],
					script: '',
					fields,
					modified: 0,
					storyName: 'test-segment'
				}),
				literal<PartDefinitionTelefon>({
					externalId: '',
					type: PartType.Telefon,
					variant: {},
					rawType: '',
					cues: [cueTelefon2],
					script: '',
					fields,
					modified: 0,
					storyName: 'test-segment'
				}),
				literal<PartDefinitionSlutord>({
					externalId: '',
					type: PartType.Slutord,
					variant: {
						endWords: ''
					},
					rawType: 'SLUTORD:',
					cues: [],
					script: '',
					fields,
					modified: 0,
					storyName: 'test-segment'
				}),
				literal<PartDefinitionSlutord>({
					externalId: '',
					type: PartType.Slutord,
					variant: {
						endWords: 'Skarpere regler.'
					},
					rawType: 'Slutord Skarpere regler.',
					cues: [],
					script: '',
					fields,
					modified: 0,
					storyName: 'test-segment'
				}),
				literal<PartDefinitionKam>({
					externalId: '',
					type: PartType.Kam,
					variant: {
						name: '2'
					},
					rawType: 'KAM 2',
					cues: [],
					script: 'Some script.\n',
					fields,
					modified: 0,
					storyName: 'test-segment'
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
		const result = ParseBody('00000000001', 'test-segment', body30, cues30, fields, 0)
		expect(stripExternalId(result)).toEqual([
			literal<PartDefinitionDVE>({
				externalId: '',
				type: PartType.DVE,
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
				script: '',
				fields,
				modified: 0,
				storyName: 'test-segment'
			}),
			literal<PartDefinitionEkstern>({
				externalId: '',
				type: PartType.Ekstern,
				variant: {},
				rawType: '',
				cues: [
					literal<CueDefinitionEkstern>({
						type: CueType.Ekstern,
						source: 'LIVE 2'
					})
				],
				script: 'And some script\n',
				fields,
				modified: 0,
				storyName: 'test-segment'
			}),
			literal<PartDefinitionServer>({
				externalId: '',
				type: PartType.Server,
				variant: {},
				rawType: 'SERVER',
				cues: [
					literal<CueDefinitionTargetWall>({
						type: CueType.TargetWall,
						clip: 'SC-LOOP',
						start: {
							seconds: 0,
							frames: 1
						}
					}),
					literal<CueDefinitionUnknown>({
						type: CueType.Unknown
					}),
					literal<CueDefinitionGrafik>({
						type: CueType.Grafik,
						template: 'bund',
						cue: 'kg',
						start: {
							seconds: 0
						},
						textFields: ['TEXT MORETEXT', 'Triatlet']
					})
				],
				script: 'Server script\n',
				fields,
				modified: 0,
				storyName: 'test-segment'
			}),
			literal<PartDefinitionSlutord>({
				externalId: '',
				type: PartType.Slutord,
				variant: {
					endWords: 'bare mega fedt'
				},
				rawType: 'SLUTORD: bare mega fedt',
				cues: [],
				script: '',
				fields,
				modified: 0,
				storyName: 'test-segment'
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
		const result = ParseBody('00000000001', 'test-segment', body31, cues31, fields, 0)
		expect(stripExternalId(result)).toEqual([
			literal<PartDefinitionUnknown>({
				externalId: '',
				type: PartType.Unknown,
				variant: {},
				rawType: '',
				cues: [
					literal<CueDefinitionTargetWall>({
						type: CueType.TargetWall,
						clip: 'SC-LOOP',
						start: {
							seconds: 0,
							frames: 1
						}
					}),
					literal<CueDefinitionUnknown>({
						type: CueType.Unknown
					}),
					literal<CueDefinitionGrafik>({
						type: CueType.Grafik,
						template: 'bund',
						cue: 'kg',
						start: {
							seconds: 0
						},
						textFields: ['TEXT MORETEXT', 'Triatlet']
					})
				],
				script: '',
				fields,
				modified: 0,
				storyName: 'test-segment'
			}),
			literal<PartDefinitionSlutord>({
				externalId: '',
				type: PartType.Slutord,
				variant: {
					endWords: 'bare mega fedt'
				},
				rawType: 'SLUTORD: bare mega fedt',
				cues: [],
				script: '',
				fields,
				modified: 0,
				storyName: 'test-segment'
			}),
			literal<PartDefinitionDVE>({
				externalId: '',
				type: PartType.DVE,
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
				script: '',
				fields,
				modified: 0,
				storyName: 'test-segment'
			}),
			literal<PartDefinitionEkstern>({
				externalId: '',
				type: PartType.Ekstern,
				variant: {},
				rawType: '',
				cues: [
					literal<CueDefinitionEkstern>({
						type: CueType.Ekstern,
						source: 'LIVE 2'
					})
				],
				script: 'Some script\n',
				fields,
				modified: 0,
				storyName: 'test-segment'
			}),
			literal<PartDefinitionServer>({
				externalId: '',
				type: PartType.Server,
				variant: {},
				rawType: 'SERVER',
				cues: [],
				script: '',
				fields,
				modified: 0,
				storyName: 'test-segment'
			})
		])
	})

	test('test 32', () => {
		const body32 = '\r\n<p></p>\r\n<p><pi>KAM1</pi></p>\r\n'
		const cues32: string[][] = []
		const result = ParseBody('00000000001', 'test-segment', body32, cues32, fields, 0)
		expect(stripExternalId(result)).toEqual([
			literal<PartDefinitionKam>({
				externalId: '',
				type: PartType.Kam,
				variant: {
					name: '1'
				},
				rawType: 'KAM1',
				cues: [],
				script: '',
				fields,
				modified: 0,
				storyName: 'test-segment'
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
		const result = ParseBody('00000000001', 'test-segment', body33, cues33, fields, 0)
		expect(stripExternalId(result)).toEqual([
			literal<PartDefinitionUnknown>({
				externalId: '',
				type: PartType.Unknown,
				variant: {},
				rawType: '',
				cues: [
					literal<CueDefinitionJingle>({
						type: CueType.Jingle,
						clip: 'SN_breaker_kortnyt_start'
					}),
					literal<CueDefinitionTargetWall>({
						type: CueType.TargetWall,
						clip: 'SC-LOOP',
						start: {
							seconds: 0,
							frames: 1
						}
					}),
					literal<CueDefinitionMOS>({
						type: CueType.MOS,
						name: 'TEMA_SPORT_KORTNYT/Mosart=L|00:02|O',
						vcpid: 2319983,
						continueCount: 1,
						engine: '4',
						start: {
							seconds: 2
						},
						end: {
							infiniteMode: 'O'
						}
					})
				],
				script: '',
				fields,
				modified: 0,
				storyName: 'test-segment'
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
		const result = ParseBody('00000000001', 'test-segment', body34, cues34, fields, 0)
		expect(stripExternalId(result)).toEqual([
			literal<PartDefinitionKam>({
				externalId: '',
				type: PartType.Kam,
				variant: {
					name: '1'
				},
				rawType: 'Kam 1',
				cues: [
					literal<CueDefinitionTargetEngine>({
						type: CueType.TargetEngine,
						rawType: 'VIZ=OVL',
						content: {
							INP: 'LIVE 2'
						},
						engine: 'OVL',
						start: {
							seconds: 0
						},
						grafik: literal<CueDefinitionMOS>({
							type: CueType.MOS,
							name: 'HojreVideo/12-12-2019/MOSART=L|00:00|O',
							vcpid: 2578989,
							continueCount: -1,
							engine: '4',
							start: {
								seconds: 0
							},
							end: {
								infiniteMode: 'O'
							}
						})
					})
				],
				script: '',
				fields,
				modified: 0,
				storyName: 'test-segment'
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
		const result = ParseBody('00000000001', 'test-segment', body35, cues35, fields, 0)
		expect(stripExternalId(result)).toEqual([
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
				storyName: 'test-segment'
			})
		])
	})

	test('test 36', () => {
		const body36 =
			'\r\n<p><pi>KAM 1</pi></p>\r\n<p>Kam 1 script</p>\r\n<p><pi>***SERVER***</pi></p>\r\n<p>Server script</p>\r\n<p><pi>KAM 2</pi></p>\r\n<p>KAM 2 script</p>\r\n'
		const cues36: string[][] = []
		const result = ParseBody('00000000001', 'test-segment', body36, cues36, fields, 0)
		expect(stripExternalId(result)).toEqual([
			literal<PartDefinitionKam>({
				type: PartType.Kam,
				variant: {
					name: '1'
				},
				externalId: '',
				rawType: 'KAM 1',
				cues: [],
				script: 'Kam 1 script\n',
				fields: {},
				modified: 0,
				storyName: 'test-segment'
			}),
			literal<PartDefinitionServer>({
				type: PartType.Server,
				variant: {},
				externalId: '',
				rawType: 'SERVER',
				cues: [],
				script: 'Server script\n',
				fields: {},
				modified: 0,
				storyName: 'test-segment'
			}),
			literal<PartDefinitionKam>({
				type: PartType.Kam,
				variant: {
					name: '2'
				},
				externalId: '',
				rawType: 'KAM 2',
				cues: [],
				script: 'KAM 2 script\n',
				fields: {},
				modified: 0,
				storyName: 'test-segment'
			})
		])
	})

	test('test 37', () => {
		const body36 =
			'\r\n<p><pi>KAM 1</pi></p>\r\n<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis </p>\r\n<p></p>\r\n<p><a idref="0"></a></p>\r\n<p></p>\r\n<p></p>\r\n<p><pi>KAM 2</pi></p>\r\n'
		const cues36 = [['EKSTERN=LIVE 1']]
		const result = ParseBody('00000000001', 'test-segment', body36, cues36, fields, 0)
		expect(stripExternalId(result)).toEqual([
			literal<PartDefinitionKam>({
				type: PartType.Kam,
				variant: {
					name: '1'
				},
				externalId: '',
				rawType: 'KAM 1',
				cues: [],
				script:
					'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis\n',
				fields: {},
				modified: 0,
				storyName: 'test-segment'
			}),
			literal<PartDefinitionEkstern>({
				type: PartType.Ekstern,
				variant: {},
				externalId: '',
				rawType: '',
				cues: [
					literal<CueDefinitionEkstern>({
						type: CueType.Ekstern,
						source: 'LIVE 1'
					})
				],
				script: '',
				fields: {},
				modified: 0,
				storyName: 'test-segment'
			}),
			literal<PartDefinitionKam>({
				type: PartType.Kam,
				variant: {
					name: '2'
				},
				externalId: '',
				rawType: 'KAM 2',
				cues: [],
				script: '',
				fields: {},
				modified: 0,
				storyName: 'test-segment'
			})
		])
	})

	test('Merge target cues 1', () => {
		const bodyTarget = '\r\n<p><a idref="0"><a idref="1"></a></p>\r\n<p></p>\r\n'
		const cuesTarget = [
			['GRAFIK=FULL', 'INP1=', 'INP='],
			['#cg4 pilotdata', 'TELEFON/KORT//LIVE_KABUL', 'VCPID=2552305', 'ContinueCount=3', 'TELEFON/KORT//LIVE_KABU']
		]
		const result = ParseBody('00000000001', 'test-segment', bodyTarget, cuesTarget, fields, 0)
		expect(stripExternalId(result)).toEqual(
			literal<PartDefinition[]>([
				literal<PartDefinitionUnknown>({
					externalId: '',
					type: PartType.Unknown,
					variant: {},
					rawType: '',
					cues: [
						literal<CueDefinitionTargetEngine>({
							type: CueType.TargetEngine,
							rawType: 'GRAFIK=FULL',
							engine: 'FULL',
							content: {
								INP1: '',
								INP: ''
							},
							grafik: literal<CueDefinitionMOS>({
								type: CueType.MOS,
								name: 'TELEFON/KORT//LIVE_KABUL',
								vcpid: 2552305,
								start: {
									seconds: 0
								},
								continueCount: 3,
								engine: '4'
							})
						})
					],
					script: '',
					fields,
					modified: 0,
					storyName: 'test-segment'
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
		const result = ParseBody('00000000001', 'test-segment', bodyTarget, cuesTarget, fields, 0)
		expect(stripExternalId(result)).toEqual(
			literal<PartDefinition[]>([
				literal<PartDefinitionUnknown>({
					externalId: '',
					type: PartType.Unknown,
					variant: {},
					rawType: '',
					cues: [
						literal<CueDefinitionTargetEngine>({
							type: CueType.TargetEngine,
							rawType: 'GRAFIK=FULL',
							engine: 'FULL',
							content: {
								INP1: '',
								INP2: ''
							},
							grafik: literal<CueDefinitionMOS>({
								type: CueType.MOS,
								name: 'Senderplan/23-10-2019',
								vcpid: 2565134,
								start: {
									seconds: 0
								},
								continueCount: -1
							})
						})
					],
					script: '',
					fields,
					modified: 0,
					storyName: 'test-segment'
				}),
				literal<PartDefinitionUnknown>({
					externalId: '',
					type: PartType.Unknown,
					variant: {},
					rawType: '',
					cues: [
						literal<CueDefinitionTargetEngine>({
							type: CueType.TargetEngine,
							rawType: 'GRAFIK=FULL',
							engine: 'FULL',
							content: {
								INP1: '',
								INP2: ''
							},
							grafik: literal<CueDefinitionMOS>({
								type: CueType.MOS,
								name: 'Senderplan/23-10-2019',
								vcpid: 2565134,
								start: {
									seconds: 0
								},
								continueCount: -1
							})
						})
					],
					script: '',
					fields,
					modified: 0,
					storyName: 'test-segment'
				})
			])
		)
	})

	test('Merge wall cues', () => {
		const bodyTarget = '\r\n<p><a idref="0"><a idref="1"></a></p>\r\n<p></p>\r\n'
		const cuesTarget = [
			['SS=3-SPORTSDIGI', 'INP1=EVS 1', ';0.00.01'],
			['#cg4 pilotdata', 'TELEFON/KORT//LIVE_KABUL', 'VCPID=2552305', 'ContinueCount=3', 'TELEFON/KORT//LIVE_KABU']
		]
		const result = ParseBody('00000000001', 'test-segment', bodyTarget, cuesTarget, fields, 0)
		expect(stripExternalId(result)).toEqual(
			literal<PartDefinition[]>([
				literal<PartDefinitionUnknown>({
					externalId: '',
					type: PartType.Unknown,
					variant: {},
					rawType: '',
					cues: [
						literal<CueDefinitionTargetWall>({
							type: CueType.TargetWall,
							clip: '3-SPORTSDIGI',
							start: {
								frames: 1,
								seconds: 0
							}
						}),
						literal<CueDefinitionMOS>({
							type: CueType.MOS,
							name: 'TELEFON/KORT//LIVE_KABUL',
							vcpid: 2552305,
							start: {
								seconds: 0
							},
							continueCount: 3,
							engine: '4'
						})
					],
					script: '',
					fields,
					modified: 0,
					storyName: 'test-segment'
				})
			])
		)
	})
})

export function stripExternalId(definitions: PartDefinition[]) {
	return definitions.map(def => {
		return { ...def, ...{ externalId: '' } }
	})
}
