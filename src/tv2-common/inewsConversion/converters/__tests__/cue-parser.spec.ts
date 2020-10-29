import { CueType } from 'tv2-constants'
import { literal } from '../../../util'
import {
	CueDefinition,
	CueDefinitionClearGrafiks,
	CueDefinitionJingle,
	CueDefinitionLYD,
	CueDefinitionMOS,
	CueDefinitionTargetEngine,
	isTime,
	ParseCue,
	parseTime
} from '../ParseCue'

describe('Cue parser', () => {
	test('Null Cue', () => {
		const result = ParseCue(null)
		expect(result).toEqual(undefined)
	})

	test('Empty Cue', () => {
		const result = ParseCue([])
		expect(result).toEqual(undefined)
	})

	test('Empty String', () => {
		const result = ParseCue([''])
		expect(result).toEqual(undefined)
	})

	test('Cues Sofie should ignore', () => {
		expect(ParseCue(['    '])).toBe(undefined)
		expect(ParseCue(['Some text for the producer'])).toBe(undefined)
		expect(
			ParseCue([
				'Some text for the producer',
				'',
				'across multiple lines',
				'',
				'with blank lines',
				'with GRAFIK= in the text'
			])
		).toBe(undefined)
		expect(ParseCue(['Instructions on how to use GRAFIK=FULL'])).toBe(undefined)
		expect(ParseCue(['Some text with GRAFIK='])).toBe(undefined)
		expect(ParseCue(['GGRAFIK='])).toBe(undefined)
		expect(ParseCue(['GRAFIC='])).toBe(undefined)
		expect(ParseCue(['Some text with kg #kg KG', 'and some more text', 'and time', ';0.01'])).toBe(undefined)
		expect(ParseCue(['Something that looks like time ;0.01'])).toBe(undefined)
		expect(ParseCue(['Something that looks like floated time ;x.xx'])).toBe(undefined)
	})

	test('Time with symbolic out', () => {
		let time = ';0.01-S'
		let result: any = isTime(time)
		expect(result).toBe(true)
		result = parseTime(time)
		expect(result).toEqual({
			start: {
				seconds: 1
			},
			end: {
				infiniteMode: 'S'
			}
		})
		time = ';0.01-B'
		result = isTime(time)
		expect(result).toBe(true)
		result = parseTime(time)
		expect(result).toEqual({
			start: {
				seconds: 1
			},
			end: {
				infiniteMode: 'B'
			}
		})
		time = ';0.01-O'
		result = isTime(time)
		expect(result).toBe(true)
		result = parseTime(time)
		expect(result).toEqual({
			start: {
				seconds: 1
			},
			end: {
				infiniteMode: 'O'
			}
		})
	})

	test('Time with spaces', () => {
		const time = ';0.01 - B'
		let result: any = isTime(time)
		expect(result).toBe(true)
		result = parseTime(time)
		expect(result).toEqual({
			start: {
				seconds: 1
			},
			end: {
				infiniteMode: 'B'
			}
		})
	})

	test('Grafik (kg) - Inline first text field', () => {
		const cueGrafik = ['kg bund TEXT MORETEXT', 'some@email.fakeTLD', ';0.02']
		const result = ParseCue(cueGrafik)
		expect(result).toEqual(
			literal<CueDefinition>({
				type: CueType.Grafik,
				template: 'bund',
				cue: 'kg',
				textFields: ['TEXT MORETEXT', 'some@email.fakeTLD'],
				start: {
					seconds: 2
				},
				iNewsCommand: 'kg'
			})
		)
	})

	test('Grafik (kg) - AdLib ;x.xx', () => {
		const cueGrafik = ['kg bund TEXT MORETEXT', 'some@email.fakeTLD', ';x.xx']
		const result = ParseCue(cueGrafik)
		expect(result).toEqual(
			literal<CueDefinition>({
				type: CueType.Grafik,
				template: 'bund',
				cue: 'kg',
				textFields: ['TEXT MORETEXT', 'some@email.fakeTLD'],
				adlib: true,
				iNewsCommand: 'kg'
			})
		)
	})

	test('Grafik (kg) - AdLib ;x.xx-O', () => {
		const cueGrafik = ['kg bund TEXT MORETEXT', 'some@email.fakeTLD', ';x.xx-O']
		const result = ParseCue(cueGrafik)
		expect(result).toEqual(
			literal<CueDefinition>({
				type: CueType.Grafik,
				template: 'bund',
				cue: 'kg',
				textFields: ['TEXT MORETEXT', 'some@email.fakeTLD'],
				adlib: true,
				iNewsCommand: 'kg',
				end: {
					infiniteMode: 'O'
				}
			})
		)
	})

	test('Grafik (kg) - AdLib ;x.xx-S', () => {
		const cueGrafik = ['kg bund TEXT MORETEXT', 'some@email.fakeTLD', ';x.xx-S']
		const result = ParseCue(cueGrafik)
		expect(result).toEqual(
			literal<CueDefinition>({
				type: CueType.Grafik,
				template: 'bund',
				cue: 'kg',
				textFields: ['TEXT MORETEXT', 'some@email.fakeTLD'],
				adlib: true,
				iNewsCommand: 'kg',
				end: {
					infiniteMode: 'S'
				}
			})
		)
	})

	test('Grafik (kg) - AdLib ;x.xx-B', () => {
		const cueGrafik = ['kg bund TEXT MORETEXT', 'some@email.fakeTLD', ';x.xx-B']
		const result = ParseCue(cueGrafik)
		expect(result).toEqual(
			literal<CueDefinition>({
				type: CueType.Grafik,
				template: 'bund',
				cue: 'kg',
				textFields: ['TEXT MORETEXT', 'some@email.fakeTLD'],
				adlib: true,
				iNewsCommand: 'kg',
				end: {
					infiniteMode: 'B'
				}
			})
		)
	})

	test('Grafik (kg) - AdLib ;x.xx-0.30', () => {
		const cueGrafik = ['kg bund TEXT MORETEXT', 'some@email.fakeTLD', ';x.xx-0.30']
		const result = ParseCue(cueGrafik)
		expect(result).toEqual(
			literal<CueDefinition>({
				type: CueType.Grafik,
				template: 'bund',
				cue: 'kg',
				textFields: ['TEXT MORETEXT', 'some@email.fakeTLD'],
				adlib: true,
				iNewsCommand: 'kg',
				end: {
					seconds: 30
				}
			})
		)
	})

	test('Grafik (kg) - Inline first text field, blank time', () => {
		const cueGrafik = ['kg bund TEXT MORETEXT', 'some@email.fakeTLD', ';x.xx']
		const result = ParseCue(cueGrafik)
		expect(result).toEqual(
			literal<CueDefinition>({
				type: CueType.Grafik,
				template: 'bund',
				cue: 'kg',
				textFields: ['TEXT MORETEXT', 'some@email.fakeTLD'],
				adlib: true,
				iNewsCommand: 'kg'
			})
		)
	})

	test('Grafik (kg) - Multiline text fields', () => {
		const cueGrafik = ['kg bund', 'TEXT MORETEXT', 'some@email.fakeTLD', ';0.02']
		const result = ParseCue(cueGrafik)
		expect(result).toEqual(
			literal<CueDefinition>({
				type: CueType.Grafik,
				template: 'bund',
				cue: 'kg',
				textFields: ['TEXT MORETEXT', 'some@email.fakeTLD'],
				start: {
					seconds: 2
				},
				iNewsCommand: 'kg'
			})
		)
	})

	test('Grafik (kg) - No time', () => {
		const cueGrafik = ['kg bund TEXT MORETEXT', 'some@email.fakeTLD']
		const result = ParseCue(cueGrafik)
		expect(result).toEqual(
			literal<CueDefinition>({
				type: CueType.Grafik,
				template: 'bund',
				cue: 'kg',
				textFields: ['TEXT MORETEXT', 'some@email.fakeTLD'],
				adlib: true,
				iNewsCommand: 'kg'
			})
		)
	})

	test('Grafik (kg) - Blank Lines', () => {
		const cueGrafik = ['', 'kg bund', '', 'TEXT MORETEXT', '', 'some@email.fakeTLD', '']
		const result = ParseCue(cueGrafik)
		expect(result).toEqual(
			literal<CueDefinition>({
				type: CueType.Grafik,
				template: 'bund',
				cue: 'kg',
				textFields: ['TEXT MORETEXT', 'some@email.fakeTLD'],
				adlib: true,
				iNewsCommand: 'kg'
			})
		)
	})

	test('Grafik (kg) - Single line', () => {
		const cueGrafik = ['kg bund 2']
		const result = ParseCue(cueGrafik)
		expect(result).toEqual(
			literal<CueDefinition>({
				type: CueType.Grafik,
				template: 'bund',
				cue: 'kg',
				textFields: ['2'],
				adlib: true,
				iNewsCommand: 'kg'
			})
		)
	})

	test('Grafik (kg) - star', () => {
		const cueGrafik = ['*kg bund 2']
		const result = ParseCue(cueGrafik)
		expect(result).toEqual(
			literal<CueDefinition>({
				type: CueType.Grafik,
				template: 'bund',
				cue: 'kg',
				textFields: ['2'],
				adlib: true,
				iNewsCommand: '*kg'
			})
		)
	})

	test('Grafik (kg) - Hash', () => {
		const cueGrafik = ['#kg bund 2']
		const result = ParseCue(cueGrafik)
		expect(result).toEqual(
			literal<CueDefinition>({
				type: CueType.Grafik,
				template: 'bund',
				cue: 'kg',
				textFields: ['2'],
				adlib: true,
				iNewsCommand: '#kg'
			})
		)
	})

	test('Grafik (kg) - ident_nyhederne with space', () => {
		const cueGrafik = ['#kg ident_nyhederne ', 'Ident Nyhederne', ';0.01']
		const result = ParseCue(cueGrafik)
		expect(result).toEqual(
			literal<CueDefinition>({
				type: CueType.Grafik,
				template: 'ident_nyhederne',
				cue: 'kg',
				start: {
					seconds: 1
				},
				textFields: ['Ident Nyhederne'],
				iNewsCommand: '#kg'
			})
		)
	})

	test('Grafik (kg) - All out', () => {
		const cueGrafik = ['kg ovl-all-out', 'CLEAR OVERLAY', ';0.00']
		const result = ParseCue(cueGrafik)
		expect(result).toEqual(
			literal<CueDefinitionClearGrafiks>({
				type: CueType.ClearGrafiks,
				start: {
					seconds: 0
				},
				iNewsCommand: 'kg'
			})
		)
	})

	test('Grafik (kg) - altud', () => {
		const cueGrafik = ['kg altud', 'CLEAR OVERLAY', ';0.00']
		const result = ParseCue(cueGrafik)
		expect(result).toEqual(
			literal<CueDefinitionClearGrafiks>({
				type: CueType.ClearGrafiks,
				start: {
					seconds: 0
				},
				iNewsCommand: 'kg'
			})
		)
	})

	test('Grafik (kg) - Start and end time', () => {
		const cueGrafik = ['kg bund TEXT MORETEXT', 'Comma, sepearated, text', ';0.27-0.31']
		const result = ParseCue(cueGrafik)
		expect(result).toEqual(
			literal<CueDefinition>({
				type: CueType.Grafik,
				start: {
					seconds: 27
				},
				end: {
					seconds: 31
				},
				template: 'bund',
				cue: 'kg',
				textFields: ['TEXT MORETEXT', 'Comma, sepearated, text'],
				iNewsCommand: 'kg'
			})
		)
	})

	test('Grafik (kg) - direkte', () => {
		const cueGrafik = ['#kg direkte KØBENHAVN', ';0.00']
		const result = ParseCue(cueGrafik)
		expect(result).toEqual(
			literal<CueDefinition>({
				type: CueType.Grafik,
				start: {
					seconds: 0
				},
				template: 'direkte',
				cue: 'kg',
				textFields: ['KØBENHAVN'],
				iNewsCommand: '#kg'
			})
		)
	})

	test('Grafik (kg) - BillederFra_logo', () => {
		const cueGrafik = ['#kg BillederFra_logo KØBENHAVN', ';0.01']
		const result = ParseCue(cueGrafik)
		expect(result).toEqual(
			literal<CueDefinition>({
				type: CueType.Grafik,
				start: {
					seconds: 1
				},
				template: 'BillederFra_logo',
				cue: 'kg',
				textFields: ['KØBENHAVN'],
				iNewsCommand: '#kg'
			})
		)
	})

	test('DIGI', () => {
		const cueDigi = ['DIGI=VO', 'Dette er en VO tekst', 'Dette er linje 2', ';0.00']
		const result = ParseCue(cueDigi)
		expect(result).toEqual(
			literal<CueDefinition>({
				type: CueType.Grafik,
				start: {
					seconds: 0
				},
				template: 'VO',
				cue: 'DIGI',
				textFields: ['Dette er en VO tekst', 'Dette er linje 2'],
				iNewsCommand: 'DIGI'
			})
		)
	})

	test('KG=DESIGN_FODBOLD', () => {
		const cueGrafik = ['KG=DESIGN_FODBOLD', ';0.00.01']
		const result = ParseCue(cueGrafik)
		expect(result).toEqual(
			literal<CueDefinition>({
				type: CueType.Grafik,
				start: {
					frames: 1,
					seconds: 0
				},
				template: 'DESIGN_FODBOLD',
				cue: 'KG',
				textFields: [],
				iNewsCommand: 'KG'
			})
		)
		expect(result).toBeTruthy()
	})

	test('MOS object', () => {
		const cueMOS = [
			']] S3.0 M 0 [[',
			'cg4 ]] 2 YNYAB 0 [[ pilotdata',
			'TELEFON/KORT//LIVE_KABUL',
			'VCPID=2552305',
			'ContinueCount=3',
			'TELEFON/KORT//LIVE_KABUL'
		]
		const result = ParseCue(cueMOS)
		expect(result).toEqual(
			literal<CueDefinition>({
				type: CueType.MOS,
				name: 'TELEFON/KORT//LIVE_KABUL',
				vcpid: 2552305,
				continueCount: 3,
				start: {
					seconds: 0
				},
				iNewsCommand: 'VCP'
			})
		)
	})

	test('MOS object', () => {
		const cueMOS = [
			']] S3.0 M 0 [[',
			'cg4 ]] 2 YNYBB 0 [[ pilotdata',
			'Senderplan/23-10-2019',
			'VCPID=2565134',
			'ContinueCount=-1',
			'Senderplan/23-10-2019'
		]
		const result = ParseCue(cueMOS)
		expect(result).toEqual(
			literal<CueDefinition>({
				type: CueType.MOS,
				name: 'Senderplan/23-10-2019',
				vcpid: 2565134,
				continueCount: -1,
				start: {
					seconds: 0
				},
				iNewsCommand: 'VCP'
			})
		)
	})

	test('MOS object', () => {
		const cueMOS = [
			']] S3.0 M 0 [[',
			'cg4 ]] 3 YNYAB 0 [[ pilotdata',
			'Senderplan/23-10-2019',
			'VCPID=2565134',
			'ContinueCount=-1',
			'Senderplan/23-10-2019'
		]
		const result = ParseCue(cueMOS)
		expect(result).toEqual(
			literal<CueDefinition>({
				type: CueType.MOS,
				name: 'Senderplan/23-10-2019',
				vcpid: 2565134,
				continueCount: -1,
				start: {
					seconds: 0
				},
				iNewsCommand: 'VCP'
			})
		)
	})

	test('MOS object', () => {
		const cueMOS = [
			'#cg4 pilotdata',
			'Senderplan/23-10-2019',
			'VCPID=2552305',
			'ContinueCount=1',
			'Senderplan/23-10-2019'
		]
		const result = ParseCue(cueMOS)
		expect(result).toEqual(
			literal<CueDefinition>({
				type: CueType.MOS,
				engine: '4',
				name: 'Senderplan/23-10-2019',
				vcpid: 2552305,
				continueCount: 1,
				start: {
					seconds: 0
				},
				iNewsCommand: 'VCP'
			})
		)
	})

	test('MOS object with timing - adlib + O', () => {
		const cueMOS = [
			']] S3.0 M 0 [[',
			'cg4 ]] 1 YNYAB 0 [[ pilotdata',
			'LgfxWeb/-ETKAEM_07-05-2019_17:55:42/Mosart=L|M|O',
			'VCPID=2520177',
			'ContinueCount=-1',
			'LgfxWeb/-ETKAEM_07-05-2019_17:55:42/Mosart=L|M|O'
		]
		const result = ParseCue(cueMOS)
		expect(result).toEqual(
			literal<CueDefinitionMOS>({
				type: CueType.MOS,
				name: 'LgfxWeb/-ETKAEM_07-05-2019_17:55:42/Mosart=L|M|O',
				vcpid: 2520177,
				continueCount: -1,
				adlib: true,
				end: {
					infiniteMode: 'O'
				},
				iNewsCommand: 'VCP'
			})
		)
	})

	test('MOS object with timing - adlib + 00:30', () => {
		const cueMOS = [
			']] S3.0 M 0 [[',
			'cg4 ]] 1 YNYAB 0 [[ pilotdata',
			'LgfxWeb/-ETKAEM_07-05-2019_17:55:42/Mosart=L|M|00:30',
			'VCPID=2520177',
			'ContinueCount=-1',
			'LgfxWeb/-ETKAEM_07-05-2019_17:55:42/Mosart=L|M|00:30'
		]
		const result = ParseCue(cueMOS)
		expect(result).toEqual(
			literal<CueDefinitionMOS>({
				type: CueType.MOS,
				name: 'LgfxWeb/-ETKAEM_07-05-2019_17:55:42/Mosart=L|M|00:30',
				vcpid: 2520177,
				continueCount: -1,
				adlib: true,
				end: {
					seconds: 30
				},
				iNewsCommand: 'VCP'
			})
		)
	})

	test('MOS object with timing - time + O', () => {
		const cueMOS = [
			']] S3.0 M 0 [[',
			'cg4 ]] 1 YNYAB 0 [[ pilotdata',
			'LgfxWeb/-ETKAEM_07-05-2019_17:55:42/Mosart=L|00:02|O',
			'VCPID=2520177',
			'ContinueCount=-1',
			'LgfxWeb/-ETKAEM_07-05-2019_17:55:42/Mosart=L|00:02|O'
		]
		const result = ParseCue(cueMOS)
		expect(result).toEqual(
			literal<CueDefinitionMOS>({
				type: CueType.MOS,
				name: 'LgfxWeb/-ETKAEM_07-05-2019_17:55:42/Mosart=L|00:02|O',
				vcpid: 2520177,
				continueCount: -1,
				start: {
					seconds: 2
				},
				end: {
					infiniteMode: 'O'
				},
				iNewsCommand: 'VCP'
			})
		)
	})

	test('#cg4 pilotdata', () => {
		const cueMOS = [
			'#cg4 pilotdata',
			'TELEFON/KORT//LIVE_KABUL',
			'VCPID=2552305',
			'ContinueCount=3',
			'TELEFON/KORT//LIVE_KABUL'
		]
		const result = ParseCue(cueMOS)
		expect(result).toEqual(
			literal<CueDefinition>({
				type: CueType.MOS,
				name: 'TELEFON/KORT//LIVE_KABUL',
				vcpid: 2552305,
				continueCount: 3,
				start: {
					seconds: 0
				},
				engine: '4',
				iNewsCommand: 'VCP'
			})
		)
	})

	test('GRAFIK=FULL', () => {
		const cueGrafik = ['GRAFIK=FULL', 'INP1=', 'INP=']
		const result = ParseCue(cueGrafik)
		expect(result).toEqual(
			literal<CueDefinition>({
				type: CueType.TargetEngine,
				rawType: 'GRAFIK=FULL',
				data: {
					engine: 'FULL'
				},
				content: {
					INP1: '',
					INP: ''
				},
				iNewsCommand: 'GRAFIK'
			})
		)
	})

	test('GRAFIK=takeover', () => {
		const cueGrafik = ['GRAFIK=takeover']
		const result = ParseCue(cueGrafik)
		expect(result).toEqual(
			literal<CueDefinition>({
				type: CueType.TargetEngine,
				rawType: 'GRAFIK=takeover',
				data: {
					engine: 'takeover'
				},
				content: {},
				iNewsCommand: 'GRAFIK'
			})
		)
	})

	test('cg12 pilotdata', () => {
		const cueMOS = [
			'cg12 pilotdata',
			'TELEFON/KORT//LIVE_KABUL',
			'VCPID=2552305',
			'ContinueCount=3',
			'TELEFON/KORT//LIVE_KABUL'
		]
		const result = ParseCue(cueMOS)
		expect(result).toEqual(
			literal<CueDefinition>({
				type: CueType.MOS,
				name: 'TELEFON/KORT//LIVE_KABUL',
				vcpid: 2552305,
				continueCount: 3,
				start: {
					seconds: 0
				},
				engine: '12',
				iNewsCommand: 'VCP'
			})
		)
	})

	test('#cg4 pilotdata with timing', () => {
		const cueMOS = [
			'*cg4 pilotdata',
			'TELEFON/KORT//LIVE_KABUL',
			'VCPID=2552305',
			'ContinueCount=3',
			'TELEFON/KORT//LIVE_KABUL'
		]
		const result = ParseCue(cueMOS)
		expect(result).toEqual(
			literal<CueDefinition>({
				type: CueType.MOS,
				name: 'TELEFON/KORT//LIVE_KABUL',
				vcpid: 2552305,
				continueCount: 3,
				start: {
					seconds: 0
				},
				engine: '4',
				iNewsCommand: 'VCP'
			})
		)
	})

	test('MOS object with timing - start time + end time', () => {
		const cueMOS = [
			']] S3.0 M 0 [[',
			'cg4 ]] 1 YNYAB 0 [[ pilotdata',
			'LgfxWeb/-ETKAEM_07-05-2019_17:55:42/Mosart=L|00:00|00:10',
			'VCPID=2520177',
			'ContinueCount=-1',
			'LgfxWeb/-ETKAEM_07-05-2019_17:55:42/Mosart=L|00:00|00:1O'
		]
		const result = ParseCue(cueMOS)
		expect(result).toEqual(
			literal<CueDefinitionMOS>({
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
			})
		)
	})

	test('EKSTERN', () => {
		const cueEkstern = ['EKSTERN=LIVE 1']
		const result = ParseCue(cueEkstern)
		expect(result).toEqual(
			literal<CueDefinition>({
				type: CueType.Ekstern,
				source: 'LIVE 1',
				iNewsCommand: 'EKSTERN'
			})
		)
	})

	test('DVE', () => {
		const cueDVE = ['DVE=sommerfugl', 'INP1=KAM 1', 'INP2=LIVE 1', 'BYNAVN=Odense\\København']
		const result = ParseCue(cueDVE)
		expect(result).toEqual(
			literal<CueDefinition>({
				type: CueType.DVE,
				template: 'sommerfugl',
				sources: { INP1: 'KAM 1', INP2: 'LIVE 1' },
				labels: ['Odense', 'København'],
				iNewsCommand: 'DVE'
			})
		)
	})

	test('DVE', () => {
		const cueDVE = ['DVE=sommerfugl', 'INP1=KAM 1', 'INP2=LIVE 1', 'BYNAVN=Odense/København']
		const result = ParseCue(cueDVE)
		expect(result).toEqual(
			literal<CueDefinition>({
				type: CueType.DVE,
				template: 'sommerfugl',
				sources: { INP1: 'KAM 1', INP2: 'LIVE 1' },
				labels: ['Odense', 'København'],
				iNewsCommand: 'DVE'
			})
		)
	})

	test('DVE', () => {
		const cueDVE = ['DVE=sommerfugl', 'inp1=KAM 1', 'INP2=LIVE 1', 'BYNAVN=Odense/København']
		const result = ParseCue(cueDVE)
		expect(result).toEqual(
			literal<CueDefinition>({
				type: CueType.DVE,
				template: 'sommerfugl',
				sources: { INP1: 'KAM 1', INP2: 'LIVE 1' },
				labels: ['Odense', 'København'],
				iNewsCommand: 'DVE'
			})
		)
	})

	test('TELEFON with Grafik', () => {
		const cueTelefon = ['TELEFON=TLF 2', 'kg bund', 'TEXT MORETEXT', 'some@email.fakeTLD', ';0.02']
		const result = ParseCue(cueTelefon)
		expect(result).toEqual(
			literal<CueDefinition>({
				type: CueType.Telefon,
				source: 'TLF 2',
				vizObj: {
					type: CueType.Grafik,
					start: {
						seconds: 2
					},
					template: 'bund',
					cue: 'kg',
					textFields: ['TEXT MORETEXT', 'some@email.fakeTLD'],
					iNewsCommand: 'kg'
				},
				iNewsCommand: 'TELEFON'
			})
		)
	})

	test('TELEFON with pilot', () => {
		const cueTelefon = [
			'TELEFON=TLF 2',
			']] S3.0 M 0 [[',
			'cg4 ]] 1 YNYAB 0 [[ pilotdata',
			'LgfxWeb/-ETKAEM_07-05-2019_17:55:42/Mosart=L|M|O',
			'VCPID=2520177',
			'ContinueCount=-1',
			'LgfxWeb/-ETKAEM_07-05-2019_17:55:42/Mosart=L|M|O'
		]
		const result = ParseCue(cueTelefon)
		expect(result).toEqual(
			literal<CueDefinition>({
				type: CueType.Telefon,
				source: 'TLF 2',
				vizObj: {
					type: CueType.MOS,
					name: 'LgfxWeb/-ETKAEM_07-05-2019_17:55:42/Mosart=L|M|O',
					vcpid: 2520177,
					continueCount: -1,
					adlib: true,
					end: {
						infiniteMode: 'O'
					},
					iNewsCommand: 'VCP'
				},
				iNewsCommand: 'TELEFON'
			})
		)
	})

	test('TELEFON without Grafik', () => {
		const cueTelefon = ['TELEFON=TLF 2']
		const result = ParseCue(cueTelefon)
		expect(result).toEqual(
			literal<CueDefinition>({
				type: CueType.Telefon,
				source: 'TLF 2',
				iNewsCommand: 'TELEFON'
			})
		)
	})

	test('VIZ Cue', () => {
		const cueViz = ['VIZ=grafik-design', 'triopage=DESIGN_SC', ';0.00.04']
		const result = ParseCue(cueViz)
		expect(result).toEqual(
			literal<CueDefinition>({
				type: CueType.VIZ,
				rawType: 'VIZ=grafik-design',
				design: 'grafik-design',
				content: {
					TRIOPAGE: 'DESIGN_SC'
				},
				start: {
					frames: 4,
					seconds: 0
				},
				iNewsCommand: 'VIZ'
			})
		)
	})

	test('VIZ Cue', () => {
		const cueViz = ['VIZ=full-triopage', 'triopage=DESIGN_SC', ';0.00.04']
		const result = ParseCue(cueViz)
		expect(result).toEqual(
			literal<CueDefinition>({
				type: CueType.VIZ,
				rawType: 'VIZ=full-triopage',
				design: 'full-triopage',
				content: {
					TRIOPAGE: 'DESIGN_SC'
				},
				start: {
					frames: 4,
					seconds: 0
				},
				iNewsCommand: 'VIZ'
			})
		)
	})

	test('VIZ Cue', () => {
		const cueViz = ['VIZ=dve-triopage', 'triopage=DESIGN_SC', ';0.00.04']
		const result = ParseCue(cueViz)
		expect(result).toEqual(
			literal<CueDefinition>({
				type: CueType.VIZ,
				rawType: 'VIZ=dve-triopage',
				design: 'dve-triopage',
				content: {
					TRIOPAGE: 'DESIGN_SC'
				},
				start: {
					frames: 4,
					seconds: 0
				},
				iNewsCommand: 'VIZ'
			})
		)
	})

	test('VIZ Cue', () => {
		const cueViz = ['VIZ=dve-triopage', 'GRAFIK=DESIGN_SC', ';0.00.04']
		const result = ParseCue(cueViz)
		expect(result).toEqual(
			literal<CueDefinition>({
				type: CueType.VIZ,
				rawType: 'VIZ=dve-triopage',
				design: 'dve-triopage',
				content: {
					GRAFIK: 'DESIGN_SC'
				},
				start: {
					frames: 4,
					seconds: 0
				},
				iNewsCommand: 'VIZ'
			})
		)
	})

	test('VIZ Cue', () => {
		const cueViz = ['VIZ=dve-triopage', 'grafik=DESIGN_SC', ';0.00.04']
		const result = ParseCue(cueViz)
		expect(result).toEqual(
			literal<CueDefinition>({
				type: CueType.VIZ,
				rawType: 'VIZ=dve-triopage',
				design: 'dve-triopage',
				content: {
					GRAFIK: 'DESIGN_SC'
				},
				start: {
					frames: 4,
					seconds: 0
				},
				iNewsCommand: 'VIZ'
			})
		)
	})

	test('VIZ Cue', () => {
		const cueViz = ['VIZ=full', 'INP1=EVS 1', ';0.00']
		const result = ParseCue(cueViz)
		expect(result).toEqual(
			literal<CueDefinitionTargetEngine>({
				type: CueType.TargetEngine,
				data: {
					engine: 'full'
				},
				rawType: 'VIZ=full',
				content: {
					INP1: 'EVS 1'
				},
				start: {
					seconds: 0
				},
				iNewsCommand: 'VIZ'
			})
		)
	})

	test('Mics', () => {
		const cueMic = [
			'STUDIE=MIC ON OFF',
			'ST2vrt1=OFF',
			'ST2vrt2=OFF',
			'ST2gst1=OFF',
			'ST2gst2=OFF',
			'kom1=OFF',
			'kom2=OFF',
			'ST4vrt=ON',
			'ST4gst=',
			';0.00'
		]
		const result = ParseCue(cueMic)
		expect(result).toEqual(
			literal<CueDefinition>({
				type: CueType.Mic,
				start: {
					seconds: 0
				},
				mics: {
					ST2vrt1: false,
					ST2vrt2: false,
					ST2gst1: false,
					ST2gst2: false,
					kom1: false,
					kom2: false,
					ST4vrt: true,
					ST4gst: false
				},
				iNewsCommand: 'STUDIE'
			})
		)
	})

	test('AdLib', () => {
		const cueAdLib = ['ADLIBPIX=MORBARN', 'INP1=LIVE 1', 'INP2=KAM 1', 'BYNAVN=']
		const result = ParseCue(cueAdLib)
		expect(result).toEqual(
			literal<CueDefinition>({
				type: CueType.AdLib,
				variant: 'MORBARN',
				inputs: { INP1: 'LIVE 1', INP2: 'KAM 1' },
				iNewsCommand: 'ADLIBPIX'
			})
		)
	})

	test('AdLib Server', () => {
		const cueAdLib = ['ADLIBPIX=server']
		const result = ParseCue(cueAdLib)
		expect(result).toEqual(
			literal<CueDefinition>({
				type: CueType.AdLib,
				variant: 'server',
				inputs: {},
				iNewsCommand: 'ADLIBPIX'
			})
		)
	})

	test('AdLib Server', () => {
		const cueAdLib = ['ADLIBPX=server']
		const result = ParseCue(cueAdLib)
		expect(result).toEqual(
			literal<CueDefinition>({
				type: CueType.AdLib,
				variant: 'server',
				inputs: {},
				iNewsCommand: 'ADLIBPIX'
			})
		)
	})

	test('Kommando', () => {
		const cueKommando = ['KOMMANDO=GRAPHICSPROFILE', 'TV2 SPORT 2016', ';0.00']
		const result = ParseCue(cueKommando)
		expect(result).toEqual(
			literal<CueDefinition>({
				type: CueType.Profile,
				start: {
					seconds: 0
				},
				profile: 'TV2 SPORT 2016',
				iNewsCommand: 'KOMMANDO'
			})
		)
	})

	test('SS=', () => {
		// TODO: Screen type
		const cueSS = ['SS=3-SPORTSDIGI', ';0.00.01']
		const result = ParseCue(cueSS)
		expect(result).toEqual(
			literal<CueDefinitionTargetEngine>({
				type: CueType.TargetEngine,
				data: {
					engine: '3-SPORTSDIGI'
				},
				start: {
					seconds: 0,
					frames: 1
				},
				rawType: `SS=3-SPORTSDIGI`,
				content: {},
				iNewsCommand: 'SS'
			})
		)
	})

	test('SS=SC-STILLS', () => {
		const cueSS = ['SS=SC-STILLS', ';0.00.01']
		const result = ParseCue(cueSS)
		expect(result).toEqual(
			literal<CueDefinitionTargetEngine>({
				type: CueType.TargetEngine,
				data: {
					engine: 'SC-STILLS'
				},
				start: {
					seconds: 0,
					frames: 1
				},
				rawType: `SS=SC-STILLS`,
				content: {},
				iNewsCommand: 'SS'
			})
		)
	})

	test('ss=sc-stills', () => {
		const cueSS = ['ss=sc-stills', ';0.00.01']
		const result = ParseCue(cueSS)
		expect(result).toEqual(
			literal<CueDefinitionTargetEngine>({
				type: CueType.TargetEngine,
				data: {
					engine: 'sc-stills'
				},
				start: {
					seconds: 0,
					frames: 1
				},
				rawType: `ss=sc-stills`,
				content: {},
				iNewsCommand: 'ss'
			})
		)
	})

	test('LYD', () => {
		const cueLYD = ['LYD=SPORT_BED', ';0.35']
		const result = ParseCue(cueLYD)
		expect(result).toEqual(
			literal<CueDefinitionLYD>({
				type: CueType.LYD,
				start: {
					seconds: 35
				},
				variant: 'SPORT_BED',
				iNewsCommand: 'LYD'
			})
		)
	})

	test('LYD Adlib', () => {
		const cueLYD = ['LYD=SPORT_BED', ';x.xx']
		const result = ParseCue(cueLYD)
		expect(result).toEqual(
			literal<CueDefinitionLYD>({
				type: CueType.LYD,
				adlib: true,
				variant: 'SPORT_BED',
				iNewsCommand: 'LYD'
			})
		)
	})

	test('JINGLE', () => {
		const cueJingle = ['JINGLE2=SN_intro_19']
		const result = ParseCue(cueJingle)
		expect(result).toEqual(
			literal<CueDefinitionJingle>({
				type: CueType.Jingle,
				clip: 'SN_intro_19',
				iNewsCommand: 'JINGLE'
			})
		)
	})

	test('Wall graphic', () => {
		const wallCue = [
			']] S3.0 M 0 [[',
			'cg4 ]] 1 YNYAB 0 [[ pilotdata',
			'ST4_WALL/_20-11-2019_10:57:48',
			'VCPID=2572853',
			'ContinueCount=-1',
			'ST4_WALL/_20-11-2019_10:57:48'
		]
		const result = ParseCue(wallCue)
		expect(result).toEqual(
			literal<CueDefinitionMOS>({
				type: CueType.MOS,
				name: 'ST4_WALL/_20-11-2019_10:57:48',
				vcpid: 2572853,
				continueCount: -1,
				isActuallyWall: true,
				start: {
					seconds: 0
				},
				iNewsCommand: 'VCP'
			})
		)
	})

	/** All-out cues */
	/** These tests are also used to catch case sensitivity / cue start symbols */
	test('All out', () => {
		const cueViz = ['KG=ovl-all-out', ';0.00.01']
		const result = ParseCue(cueViz)
		expect(result).toEqual(
			literal<CueDefinitionClearGrafiks>({
				type: CueType.ClearGrafiks,
				start: {
					frames: 1,
					seconds: 0
				},
				iNewsCommand: 'KG'
			})
		)
	})

	test('All out', () => {
		const cueViz = ['KG ovl-all-out', ';0.00.01']
		const result = ParseCue(cueViz)
		expect(result).toEqual(
			literal<CueDefinitionClearGrafiks>({
				type: CueType.ClearGrafiks,
				start: {
					frames: 1,
					seconds: 0
				},
				iNewsCommand: 'KG'
			})
		)
	})

	test('All out', () => {
		const cueViz = ['kg=ovl-all-out', ';0.00.01']
		const result = ParseCue(cueViz)
		expect(result).toEqual(
			literal<CueDefinitionClearGrafiks>({
				type: CueType.ClearGrafiks,
				start: {
					frames: 1,
					seconds: 0
				},
				iNewsCommand: 'kg'
			})
		)
	})

	test('All out', () => {
		const cueViz = ['kg ovl-all-out', ';0.00.01']
		const result = ParseCue(cueViz)
		expect(result).toEqual(
			literal<CueDefinitionClearGrafiks>({
				type: CueType.ClearGrafiks,
				start: {
					frames: 1,
					seconds: 0
				},
				iNewsCommand: 'kg'
			})
		)
	})

	test('All out', () => {
		const cueViz = ['#KG=ovl-all-out', ';0.00.01']
		const result = ParseCue(cueViz)
		expect(result).toEqual(
			literal<CueDefinitionClearGrafiks>({
				type: CueType.ClearGrafiks,
				start: {
					frames: 1,
					seconds: 0
				},
				iNewsCommand: '#KG'
			})
		)
	})

	test('All out', () => {
		const cueViz = ['#KG ovl-all-out', ';0.00.01']
		const result = ParseCue(cueViz)
		expect(result).toEqual(
			literal<CueDefinitionClearGrafiks>({
				type: CueType.ClearGrafiks,
				start: {
					frames: 1,
					seconds: 0
				},
				iNewsCommand: '#KG'
			})
		)
	})

	test('All out', () => {
		const cueViz = ['#kg=ovl-all-out', ';0.00.01']
		const result = ParseCue(cueViz)
		expect(result).toEqual(
			literal<CueDefinitionClearGrafiks>({
				type: CueType.ClearGrafiks,
				start: {
					frames: 1,
					seconds: 0
				},
				iNewsCommand: '#kg'
			})
		)
	})

	test('All out', () => {
		const cueViz = ['#kg ovl-all-out', ';0.00.01']
		const result = ParseCue(cueViz)
		expect(result).toEqual(
			literal<CueDefinitionClearGrafiks>({
				type: CueType.ClearGrafiks,
				start: {
					frames: 1,
					seconds: 0
				},
				iNewsCommand: '#kg'
			})
		)
	})

	test('All out', () => {
		const cueViz = ['kg altud', ';0.00.01']
		const result = ParseCue(cueViz)
		expect(result).toEqual(
			literal<CueDefinitionClearGrafiks>({
				type: CueType.ClearGrafiks,
				start: {
					frames: 1,
					seconds: 0
				},
				iNewsCommand: 'kg'
			})
		)
	})

	test('All out', () => {
		const cueViz = ['kg=altud', ';0.00.01']
		const result = ParseCue(cueViz)
		expect(result).toEqual(
			literal<CueDefinitionClearGrafiks>({
				type: CueType.ClearGrafiks,
				start: {
					frames: 1,
					seconds: 0
				},
				iNewsCommand: 'kg'
			})
		)
	})

	test('All out', () => {
		const cueViz = ['kg   	altud', ';0.00.01']
		const result = ParseCue(cueViz)
		expect(result).toEqual(
			literal<CueDefinitionClearGrafiks>({
				type: CueType.ClearGrafiks,
				start: {
					frames: 1,
					seconds: 0
				},
				iNewsCommand: 'kg'
			})
		)
	})

	test('All out', () => {
		const cueViz = ['kg altud', ';0.0x']
		const result = ParseCue(cueViz)
		expect(result).toEqual(
			literal<CueDefinitionClearGrafiks>({
				type: CueType.ClearGrafiks,
				adlib: true,
				iNewsCommand: 'kg'
			})
		)
	})

	test('All out', () => {
		const cueViz = ['kg altud', ';x.xx']
		const result = ParseCue(cueViz)
		expect(result).toEqual(
			literal<CueDefinitionClearGrafiks>({
				type: CueType.ClearGrafiks,
				adlib: true,
				iNewsCommand: 'kg'
			})
		)
	})

	/** End of all-out cues */
})
