import { IBlueprintRundownDB, PlaylistTimingType, TSR } from '@tv2media/blueprints-integration'
import { RemoteType, SourceDefinitionKam, SourceDefinitionRemote } from 'tv2-common'
import { CueType, SourceType } from 'tv2-constants'
import { SegmentUserContext } from '../../../../__mocks__/context'
import { defaultShowStyleConfig, defaultStudioConfig } from '../../../../tv2_afvd_showstyle/__tests__/configs'
import { getConfig, parseConfig as parseShowStyleConfig } from '../../../../tv2_afvd_showstyle/helpers/config'
import { parseConfig as parseStudioConfig } from '../../../../tv2_afvd_studio/helpers/config'
import mappingsDefaults from '../../../../tv2_afvd_studio/migrations/mappings-defaults'
import { literal } from '../../../util'
import {
	CueDefinitionAdLib,
	CueDefinitionBackgroundLoop,
	CueDefinitionClearGrafiks,
	CueDefinitionDVE,
	CueDefinitionEkstern,
	CueDefinitionGraphic,
	CueDefinitionGraphicDesign,
	CueDefinitionJingle,
	CueDefinitionLYD,
	CueDefinitionMic,
	CueDefinitionMixMinus,
	CueDefinitionPgmClean,
	CueDefinitionProfile,
	CueDefinitionTelefon,
	CueDefinitionUnknown,
	CueDefinitionUnpairedPilot,
	CueDefinitionUnpairedTarget,
	GraphicInternal,
	GraphicPilot,
	isTime,
	ParseCue,
	parseTime
} from '../ParseCue'

const RUNDOWN_EXTERNAL_ID = 'TEST.SOFIE.JEST'

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
const SOURCE_DEFINITION_LIVE_1: SourceDefinitionRemote = {
	sourceType: SourceType.REMOTE,
	remoteType: RemoteType.LIVE,
	id: '1',
	name: 'LIVE 1',
	raw: 'LIVE 1'
}
const SOURCE_DEFINITION_LIVE_2: SourceDefinitionRemote = {
	sourceType: SourceType.REMOTE,
	remoteType: RemoteType.LIVE,
	id: '2',
	name: 'LIVE 2',
	raw: 'LIVE 2'
}

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

describe('Cue parser', () => {
	test('Null Cue', () => {
		const result = ParseCue(null, config)
		expect(result).toEqual(undefined)
	})

	test('Empty Cue', () => {
		const result = ParseCue([], config)
		expect(result).toEqual(undefined)
	})

	test('Empty String', () => {
		const result = ParseCue([''], config)
		expect(result).toEqual(undefined)
	})

	test('Cues Sofie should ignore', () => {
		expect(ParseCue(['    '], config)).toEqual(
			literal<CueDefinitionUnknown>({
				type: CueType.UNKNOWN,
				iNewsCommand: ''
			})
		)
		expect(ParseCue(['Some text for the producer'], config)).toEqual(
			literal<CueDefinitionUnknown>({
				type: CueType.UNKNOWN,
				iNewsCommand: ''
			})
		)
		expect(
			ParseCue(
				['Some text for the producer', '', 'across multiple lines', '', 'with blank lines', 'with GRAFIK= in the text'],
				config
			)
		).toEqual(
			literal<CueDefinitionUnknown>({
				type: CueType.UNKNOWN,
				iNewsCommand: ''
			})
		)
		expect(ParseCue(['Instructions on how to use GRAFIK=FULL'], config)).toEqual(
			literal<CueDefinitionUnknown>({
				type: CueType.UNKNOWN,
				iNewsCommand: ''
			})
		)
		expect(ParseCue(['Some text with GRAFIK='], config)).toEqual(
			literal<CueDefinitionUnknown>({
				type: CueType.UNKNOWN,
				iNewsCommand: ''
			})
		)
		expect(ParseCue(['GGRAFIK='], config)).toEqual(
			literal<CueDefinitionUnknown>({
				type: CueType.UNKNOWN,
				iNewsCommand: ''
			})
		)
		expect(ParseCue(['GRAFIC='], config)).toEqual(
			literal<CueDefinitionUnknown>({
				type: CueType.UNKNOWN,
				iNewsCommand: ''
			})
		)
		expect(ParseCue(['Some text with kg #kg KG', 'and some more text', 'and time', ';0.01'], config)).toEqual(
			literal<CueDefinitionUnknown>({
				type: CueType.UNKNOWN,
				iNewsCommand: ''
			})
		)
		expect(ParseCue(['Something that looks like time ;0.01'], config)).toEqual(
			literal<CueDefinitionUnknown>({
				type: CueType.UNKNOWN,
				iNewsCommand: ''
			})
		)
		expect(ParseCue(['Something that looks like floated time ;x.xx'], config)).toEqual(
			literal<CueDefinitionUnknown>({
				type: CueType.UNKNOWN,
				iNewsCommand: ''
			})
		)
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
		const result = ParseCue(cueGrafik, config)
		expect(result).toEqual(
			literal<CueDefinitionGraphic<GraphicInternal>>({
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
		)
	})

	test('Grafik (kg) - AdLib ;x.xx', () => {
		const cueGrafik = ['kg bund TEXT MORETEXT', 'some@email.fakeTLD', ';x.xx']
		const result = ParseCue(cueGrafik, config)
		expect(result).toEqual(
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
			})
		)
	})

	test('Grafik (kg) - AdLib ;x.xx-O', () => {
		const cueGrafik = ['kg bund TEXT MORETEXT', 'some@email.fakeTLD', ';x.xx-O']
		const result = ParseCue(cueGrafik, config)
		expect(result).toEqual(
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
				iNewsCommand: 'kg',
				end: {
					infiniteMode: 'O'
				}
			})
		)
	})

	test('Grafik (kg) - AdLib ;x.xx-S', () => {
		const cueGrafik = ['kg bund TEXT MORETEXT', 'some@email.fakeTLD', ';x.xx-S']
		const result = ParseCue(cueGrafik, config)
		expect(result).toEqual(
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
				iNewsCommand: 'kg',
				end: {
					infiniteMode: 'S'
				}
			})
		)
	})

	test('Grafik (kg) - AdLib ;x.xx-B', () => {
		const cueGrafik = ['kg bund TEXT MORETEXT', 'some@email.fakeTLD', ';x.xx-B']
		const result = ParseCue(cueGrafik, config)
		expect(result).toEqual(
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
				iNewsCommand: 'kg',
				end: {
					infiniteMode: 'B'
				}
			})
		)
	})

	test('Grafik (kg) - AdLib ;x.xx-0.30', () => {
		const cueGrafik = ['kg bund TEXT MORETEXT', 'some@email.fakeTLD', ';x.xx-0.30']
		const result = ParseCue(cueGrafik, config)
		expect(result).toEqual(
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
				iNewsCommand: 'kg',
				end: {
					seconds: 30
				}
			})
		)
	})

	test('Grafik (kg) - Multiline text fields', () => {
		const cueGrafik = ['kg bund', 'TEXT MORETEXT', 'some@email.fakeTLD', ';0.02']
		const result = ParseCue(cueGrafik, config)
		expect(result).toEqual(
			literal<CueDefinitionGraphic<GraphicInternal>>({
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
		)
	})

	test('Grafik (kg) - No time', () => {
		const cueGrafik = ['kg bund TEXT MORETEXT', 'some@email.fakeTLD']
		const result = ParseCue(cueGrafik, config)
		expect(result).toEqual(
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
			})
		)
	})

	test('Grafik (kg) - Blank Lines', () => {
		const cueGrafik = ['', 'kg bund', '', 'TEXT MORETEXT', '', 'some@email.fakeTLD', '']
		const result = ParseCue(cueGrafik, config)
		expect(result).toEqual(
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
			})
		)
	})

	test('Grafik (kg) - Single line', () => {
		const cueGrafik = ['kg bund 2']
		const result = ParseCue(cueGrafik, config)
		expect(result).toEqual(
			literal<CueDefinitionGraphic<GraphicInternal>>({
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
			})
		)
	})

	test('Grafik (kg) - star', () => {
		const cueGrafik = ['*kg bund 2']
		const result = ParseCue(cueGrafik, config)
		expect(result).toEqual(
			literal<CueDefinitionGraphic<GraphicInternal>>({
				type: CueType.Graphic,
				target: 'OVL',

				graphic: {
					type: 'internal',
					template: 'bund',
					cue: '*kg',
					textFields: ['2']
				},
				adlib: true,
				iNewsCommand: '*kg'
			})
		)
	})

	test('Grafik (kg) - Hash', () => {
		const cueGrafik = ['#kg bund 2']
		const result = ParseCue(cueGrafik, config)
		expect(result).toEqual(
			literal<CueDefinitionGraphic<GraphicInternal>>({
				type: CueType.Graphic,
				target: 'OVL',

				graphic: {
					type: 'internal',
					template: 'bund',
					cue: '#kg',
					textFields: ['2']
				},
				adlib: true,
				iNewsCommand: '#kg'
			})
		)
	})

	test('Grafik (kg) - ident_nyhederne with space', () => {
		const cueGrafik = ['#kg ident_nyhederne ', 'Ident Nyhederne', ';0.01']
		const result = ParseCue(cueGrafik, config)
		expect(result).toEqual(
			literal<CueDefinitionGraphic<GraphicInternal>>({
				type: CueType.Graphic,
				target: 'OVL',

				graphic: {
					type: 'internal',
					template: 'ident_nyhederne',
					cue: '#kg',
					textFields: ['Ident Nyhederne']
				},
				start: {
					seconds: 1
				},
				iNewsCommand: '#kg'
			})
		)
	})

	test('Grafik (kg) - All out', () => {
		const cueGrafik = ['kg ovl-all-out', 'CLEAR OVERLAY', ';0.00']
		const result = ParseCue(cueGrafik, config)
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
		const result = ParseCue(cueGrafik, config)
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
		const result = ParseCue(cueGrafik, config)
		expect(result).toEqual(
			literal<CueDefinitionGraphic<GraphicInternal>>({
				type: CueType.Graphic,
				target: 'OVL',

				graphic: {
					type: 'internal',
					template: 'bund',
					cue: 'kg',
					textFields: ['TEXT MORETEXT', 'Comma, sepearated, text']
				},
				start: {
					seconds: 27
				},
				end: {
					seconds: 31
				},
				iNewsCommand: 'kg'
			})
		)
	})

	test('Grafik (kg) - direkte', () => {
		const cueGrafik = ['#kg direkte KØBENHAVN', ';0.00']
		const result = ParseCue(cueGrafik, config)
		expect(result).toEqual(
			literal<CueDefinitionGraphic<GraphicInternal>>({
				type: CueType.Graphic,
				target: 'OVL',

				graphic: {
					type: 'internal',
					template: 'direkte',
					cue: '#kg',
					textFields: ['KØBENHAVN']
				},
				start: {
					seconds: 0
				},
				iNewsCommand: '#kg'
			})
		)
	})

	test('Grafik (kg) - direkte - create adlib', () => {
		const cueGrafik = ['#kg direkte KØBENHAVN', ';x.xx']
		const result = ParseCue(cueGrafik, config)
		expect(result).toEqual(
			literal<CueDefinitionGraphic<GraphicInternal>>({
				type: CueType.Graphic,
				target: 'OVL',

				graphic: {
					type: 'internal',
					template: 'direkte',
					cue: '#kg',
					textFields: ['KØBENHAVN']
				},
				adlib: true,
				iNewsCommand: '#kg'
			})
		)
	})

	test('Grafik (kg) - BillederFra_logo', () => {
		const cueGrafik = ['#kg BillederFra_logo KØBENHAVN', ';0.01']
		const result = ParseCue(cueGrafik, config)
		expect(result).toEqual(
			literal<CueDefinitionGraphic<GraphicInternal>>({
				type: CueType.Graphic,
				target: 'OVL',

				graphic: {
					type: 'internal',
					template: 'BillederFra_logo',
					cue: '#kg',
					textFields: ['KØBENHAVN']
				},
				start: {
					seconds: 1
				},
				iNewsCommand: '#kg'
			})
		)
	})

	test('DIGI', () => {
		const cueDigi = ['DIGI=VO', 'Dette er en VO tekst', 'Dette er linje 2', ';0.00']
		const result = ParseCue(cueDigi, config)
		expect(result).toEqual(
			literal<CueDefinitionGraphic<GraphicInternal>>({
				type: CueType.Graphic,
				target: 'OVL',

				graphic: {
					type: 'internal',
					template: 'VO',
					cue: 'DIGI',
					textFields: ['Dette er en VO tekst', 'Dette er linje 2']
				},
				start: {
					seconds: 0
				},

				iNewsCommand: 'DIGI'
			})
		)
	})

	test('Find KG=DESIGN_FODBOLD in design templates', () => {
		const cueGrafik = ['KG=DESIGN_FODBOLD_22', ';0.00.01']
		const result = ParseCue(cueGrafik, config)
		expect(result).toEqual(
			literal<CueDefinitionGraphicDesign>({
				type: CueType.GraphicDesign,
				design: 'DESIGN_FODBOLD_22',
				start: {
					frames: 1,
					seconds: 0
				},

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
		const result = ParseCue(cueMOS, config)
		expect(result).toEqual(
			literal<CueDefinitionUnpairedPilot>({
				type: CueType.UNPAIRED_PILOT,
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
		const result = ParseCue(cueMOS, config)
		expect(result).toEqual(
			literal<CueDefinitionUnpairedPilot>({
				type: CueType.UNPAIRED_PILOT,
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
		const result = ParseCue(cueMOS, config)
		expect(result).toEqual(
			literal<CueDefinitionUnpairedPilot>({
				type: CueType.UNPAIRED_PILOT,
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
		const result = ParseCue(cueMOS, config)
		expect(result).toEqual(
			literal<CueDefinitionUnpairedPilot>({
				type: CueType.UNPAIRED_PILOT,
				engineNumber: 4,
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

	test('MOS object manual', () => {
		const cueMOS = [
			'*cg4 pilotdata',
			'LgfxWeb/18-AARIG_02-03-2022_13:15:42/Mosart=L|M|00:10',
			'VCPID=2762780',
			'ContinueCount=1',
			'LgfxWeb/18-AARIG_02-03-2022_13:15:42/Mosart=L|M|00:10'
		]
		const result = ParseCue(cueMOS, config)
		expect(result).toEqual(
			literal<CueDefinitionGraphic<GraphicPilot>>({
				type: CueType.Graphic,
				adlib: true,
				end: {
					seconds: 10
				},
				engineNumber: 4,
				graphic: {
					type: 'pilot',
					name: 'LgfxWeb/18-AARIG_02-03-2022_13:15:42',
					vcpid: 2762780,
					continueCount: 1
				},
				iNewsCommand: 'VCP',
				target: 'OVL'
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
		const result = ParseCue(cueMOS, config)
		expect(result).toEqual(
			literal<CueDefinitionGraphic<GraphicPilot>>({
				type: CueType.Graphic,
				target: 'OVL',

				graphic: {
					type: 'pilot',
					name: 'LgfxWeb/-ETKAEM_07-05-2019_17:55:42',
					vcpid: 2520177,
					continueCount: -1
				},
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
		const result = ParseCue(cueMOS, config)
		expect(result).toEqual(
			literal<CueDefinitionGraphic<GraphicPilot>>({
				type: CueType.Graphic,
				target: 'OVL',

				graphic: {
					type: 'pilot',
					name: 'LgfxWeb/-ETKAEM_07-05-2019_17:55:42',
					vcpid: 2520177,
					continueCount: -1
				},
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
		const result = ParseCue(cueMOS, config)
		expect(result).toEqual(
			literal<CueDefinitionGraphic<GraphicPilot>>({
				type: CueType.Graphic,
				target: 'OVL',

				graphic: {
					type: 'pilot',
					name: 'LgfxWeb/-ETKAEM_07-05-2019_17:55:42',
					vcpid: 2520177,
					continueCount: -1
				},
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

	// TODO: ADD tests for MOSART=F, MOSART=W

	test('#cg4 pilotdata', () => {
		const cueMOS = [
			'#cg4 pilotdata',
			'TELEFON/KORT//LIVE_KABUL',
			'VCPID=2552305',
			'ContinueCount=3',
			'TELEFON/KORT//LIVE_KABUL'
		]
		const result = ParseCue(cueMOS, config)
		expect(result).toEqual(
			literal<CueDefinitionUnpairedPilot>({
				type: CueType.UNPAIRED_PILOT,
				name: 'TELEFON/KORT//LIVE_KABUL',
				vcpid: 2552305,
				continueCount: 3,
				start: {
					seconds: 0
				},
				engineNumber: 4,
				iNewsCommand: 'VCP'
			})
		)
	})

	test('GRAFIK=FULL', () => {
		const cueGrafik = ['GRAFIK=FULL', 'INP1=', 'INP=']
		const result = ParseCue(cueGrafik, config)
		expect(result).toEqual(
			literal<CueDefinitionUnpairedTarget>({
				type: CueType.UNPAIRED_TARGET,
				target: 'FULL',
				routing: {
					type: CueType.Routing,
					target: 'FULL',
					INP1: undefined,
					INP: undefined,
					iNewsCommand: ''
				},
				iNewsCommand: 'GRAFIK',
				mergeable: true
			})
		)
	})

	test('GRAFIK=takeover', () => {
		const cueGrafik = ['GRAFIK=takeover']
		const result = ParseCue(cueGrafik, config)
		expect(result).toEqual(
			literal<CueDefinitionUnpairedTarget>({
				type: CueType.UNPAIRED_TARGET,
				target: 'FULL',
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
		const result = ParseCue(cueMOS, config)
		expect(result).toEqual(
			literal<CueDefinitionUnpairedPilot>({
				type: CueType.UNPAIRED_PILOT,
				name: 'TELEFON/KORT//LIVE_KABUL',
				vcpid: 2552305,
				continueCount: 3,
				start: {
					seconds: 0
				},
				engineNumber: 12,
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
		const result = ParseCue(cueMOS, config)
		expect(result).toEqual(
			literal<CueDefinitionUnpairedPilot>({
				type: CueType.UNPAIRED_PILOT,
				name: 'TELEFON/KORT//LIVE_KABUL',
				vcpid: 2552305,
				continueCount: 3,
				start: {
					seconds: 0
				},
				engineNumber: 4,
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
		const result = ParseCue(cueMOS, config)
		expect(result).toEqual(
			literal<CueDefinitionGraphic<GraphicPilot>>({
				type: CueType.Graphic,
				target: 'OVL',

				graphic: {
					type: 'pilot',
					name: 'LgfxWeb/-ETKAEM_07-05-2019_17:55:42',
					vcpid: 2520177,
					continueCount: -1
				},
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
		const result = ParseCue(cueEkstern, config)
		expect(result).toEqual(
			literal<CueDefinitionEkstern>({
				type: CueType.Ekstern,
				sourceDefinition: SOURCE_DEFINITION_LIVE_1,
				iNewsCommand: 'EKSTERN',
				transition: {}
			})
		)
	})

	test('EKSTERN EFFEKT 1', () => {
		const cueEkstern = ['EKSTERN=LIVE 1 EFFEKT 1']
		const result = ParseCue(cueEkstern, config)
		expect(result).toEqual(
			literal<CueDefinitionEkstern>({
				type: CueType.Ekstern,
				sourceDefinition: SOURCE_DEFINITION_LIVE_1,
				iNewsCommand: 'EKSTERN',
				transition: {
					effekt: 1
				}
			})
		)
	})

	test('EKSTERN MIX 10', () => {
		const cueEkstern = ['EKSTERN=LIVE 1 MIX 10']
		const result = ParseCue(cueEkstern, config)
		expect(result).toEqual(
			literal<CueDefinitionEkstern>({
				type: CueType.Ekstern,
				sourceDefinition: SOURCE_DEFINITION_LIVE_1,
				iNewsCommand: 'EKSTERN',
				transition: {
					transition: {
						style: TSR.AtemTransitionStyle.MIX,
						duration: 10
					}
				}
			})
		)
	})

	test('DVE', () => {
		const cueDVE = ['DVE=sommerfugl', 'INP1=KAM 1', 'INP2=LIVE 1', 'BYNAVN=Odense\\København']
		const result = ParseCue(cueDVE, config)
		expect(result).toEqual(
			literal<CueDefinitionDVE>({
				type: CueType.DVE,
				template: 'sommerfugl',
				sources: { INP1: SOURCE_DEFINITION_KAM_1, INP2: SOURCE_DEFINITION_LIVE_1 },
				labels: ['Odense', 'København'],
				iNewsCommand: 'DVE'
			})
		)
	})

	test('DVE', () => {
		const cueDVE = ['DVE=sommerfugl', 'INP1=KAM 1', 'INP2=LIVE 1', 'BYNAVN=Odense/København']
		const result = ParseCue(cueDVE, config)
		expect(result).toEqual(
			literal<CueDefinitionDVE>({
				type: CueType.DVE,
				template: 'sommerfugl',
				sources: { INP1: SOURCE_DEFINITION_KAM_1, INP2: SOURCE_DEFINITION_LIVE_1 },
				labels: ['Odense', 'København'],
				iNewsCommand: 'DVE'
			})
		)
	})

	test('DVE', () => {
		const cueDVE = ['DVE=sommerfugl', 'inp1=KAM 1', 'INP2=LIVE 1', 'BYNAVN=Odense/København']
		const result = ParseCue(cueDVE, config)
		expect(result).toEqual(
			literal<CueDefinitionDVE>({
				type: CueType.DVE,
				template: 'sommerfugl',
				sources: { INP1: SOURCE_DEFINITION_KAM_1, INP2: SOURCE_DEFINITION_LIVE_1 },
				labels: ['Odense', 'København'],
				iNewsCommand: 'DVE'
			})
		)
	})

	test('TELEFON with Grafik', () => {
		const cueTelefon = ['TELEFON=TLF 2', 'kg bund', 'TEXT MORETEXT', 'some@email.fakeTLD', ';0.02']
		const result = ParseCue(cueTelefon, config)
		expect(result).toEqual(
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
		const result = ParseCue(cueTelefon, config)
		expect(result).toEqual(
			literal<CueDefinitionTelefon>({
				type: CueType.Telefon,
				source: 'TLF 2',
				graphic: literal<CueDefinitionGraphic<GraphicPilot>>({
					type: CueType.Graphic,
					target: 'TLF',

					graphic: {
						type: 'pilot',
						name: 'LgfxWeb/-ETKAEM_07-05-2019_17:55:42',
						vcpid: 2520177,
						continueCount: -1
					},
					adlib: true,
					end: {
						infiniteMode: 'O'
					},
					iNewsCommand: 'VCP'
				}),
				iNewsCommand: 'TELEFON'
			})
		)
	})

	test('TELEFON without Grafik', () => {
		const cueTelefon = ['TELEFON=TLF 2']
		const result = ParseCue(cueTelefon, config)
		expect(result).toEqual(
			literal<CueDefinitionTelefon>({
				type: CueType.Telefon,
				source: 'TLF 2',
				iNewsCommand: 'TELEFON'
			})
		)
	})

	test('VIZ Cue', () => {
		// Currently unused
		const cueViz = ['VIZ=grafik-design', 'triopage=DESIGN_SC', ';0.00.04']
		const result = ParseCue(cueViz, config)
		expect(result).toEqual(undefined)
	})

	test('VIZ Cue', () => {
		const cueViz = ['VIZ=full-triopage', 'triopage=DESIGN_SC', ';0.00.04']
		const result = ParseCue(cueViz, config)
		expect(result).toEqual(
			literal<CueDefinitionBackgroundLoop>({
				type: CueType.BackgroundLoop,
				target: 'FULL',
				backgroundLoop: 'DESIGN_SC',
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
		const result = ParseCue(cueViz, config)
		expect(result).toEqual(
			literal<CueDefinitionBackgroundLoop>({
				type: CueType.BackgroundLoop,
				target: 'DVE',
				backgroundLoop: 'DESIGN_SC',
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
		const result = ParseCue(cueViz, config)
		expect(result).toEqual(
			literal<CueDefinitionBackgroundLoop>({
				type: CueType.BackgroundLoop,
				target: 'DVE',
				backgroundLoop: 'DESIGN_SC',
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
		const result = ParseCue(cueViz, config)
		expect(result).toEqual(
			literal<CueDefinitionBackgroundLoop>({
				type: CueType.BackgroundLoop,
				target: 'DVE',
				backgroundLoop: 'DESIGN_SC',
				start: {
					frames: 4,
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
		const result = ParseCue(cueMic, config)
		expect(result).toEqual(
			literal<CueDefinitionMic>({
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
		const result = ParseCue(cueAdLib, config)
		expect(result).toEqual(
			literal<CueDefinitionAdLib>({
				type: CueType.AdLib,
				variant: 'MORBARN',
				inputs: { INP1: SOURCE_DEFINITION_LIVE_1, INP2: SOURCE_DEFINITION_KAM_1 },
				iNewsCommand: 'ADLIBPIX'
			})
		)
	})

	test('AdLib Server', () => {
		const cueAdLib = ['ADLIBPIX=server']
		const result = ParseCue(cueAdLib, config)
		expect(result).toEqual(
			literal<CueDefinitionAdLib>({
				type: CueType.AdLib,
				variant: 'server',
				inputs: {},
				iNewsCommand: 'ADLIBPIX'
			})
		)
	})

	test('AdLib Server', () => {
		const cueAdLib = ['ADLIBPX=server']
		const result = ParseCue(cueAdLib, config)
		expect(result).toEqual(
			literal<CueDefinitionAdLib>({
				type: CueType.AdLib,
				variant: 'server',
				inputs: {},
				iNewsCommand: 'ADLIBPIX'
			})
		)
	})

	test('Kommando', () => {
		const cueKommando = ['KOMMANDO=GRAPHICSPROFILE', 'TV2 SPORT 2016', ';0.00']
		const result = ParseCue(cueKommando, config)
		expect(result).toEqual(
			literal<CueDefinitionProfile>({
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
		const cueSS = ['SS=sc-stills', ';0.00.01']
		const result = ParseCue(cueSS, config)
		expect(result).toEqual(
			literal<CueDefinitionUnpairedTarget>({
				type: CueType.UNPAIRED_TARGET,
				target: 'WALL',
				start: {
					seconds: 0,
					frames: 1
				},
				iNewsCommand: 'SS',
				mergeable: true
			})
		)
	})

	test('SS=SC-STILLS', () => {
		const cueSS = ['SS=SC-STILLS', ';0.00.01']
		const result = ParseCue(cueSS, config)
		expect(result).toEqual(
			literal<CueDefinitionUnpairedTarget>({
				type: CueType.UNPAIRED_TARGET,
				target: 'WALL',
				start: {
					seconds: 0,
					frames: 1
				},
				iNewsCommand: 'SS',
				mergeable: true
			})
		)
	})

	test('ss=sc-stills', () => {
		const cueSS = ['ss=sc-stills', ';0.00.01']
		const result = ParseCue(cueSS, config)
		expect(result).toEqual(
			literal<CueDefinitionUnpairedTarget>({
				type: CueType.UNPAIRED_TARGET,
				target: 'WALL',
				start: {
					seconds: 0,
					frames: 1
				},
				iNewsCommand: 'ss',
				mergeable: true
			})
		)
	})

	test('SS=sc_loop_clean', () => {
		const cueSS = ['SS=sc_loop_clean', ';0.00.01']
		const result = ParseCue(cueSS, config)
		expect(result).toEqual(
			literal<CueDefinitionGraphic<GraphicInternal>>({
				type: CueType.Graphic,
				target: 'WALL',
				graphic: {
					type: 'internal',
					template: 'SN_S4_LOOP_CLEAN',
					textFields: [],
					cue: 'sc_loop_clean'
				},
				start: {
					seconds: 0,
					frames: 1
				},
				iNewsCommand: 'SS'
			})
		)
	})

	test('LYD', () => {
		const cueLYD = ['LYD=SPORT_BED', ';0.35']
		const result = ParseCue(cueLYD, config)
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
		const result = ParseCue(cueLYD, config)
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
		const result = ParseCue(cueJingle, config)
		expect(result).toEqual(
			literal<CueDefinitionJingle>({
				type: CueType.Jingle,
				clip: 'SN_intro_19',
				iNewsCommand: 'JINGLE'
			})
		)
	})

	test('PGMCLEAN', () => {
		const cueJingle = ['PGMCLEAN=Live 1']
		const result = ParseCue(cueJingle, config)
		expect(result).toEqual(
			literal<CueDefinitionPgmClean>({
				type: CueType.PgmClean,
				sourceDefinition: { ...SOURCE_DEFINITION_LIVE_1, raw: 'Live 1' },
				iNewsCommand: 'PGMCLEAN'
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
		const result = ParseCue(wallCue, config)
		expect(result).toEqual(
			literal<CueDefinitionUnpairedPilot>({
				type: CueType.UNPAIRED_PILOT,
				name: 'ST4_WALL/_20-11-2019_10:57:48',
				vcpid: 2572853,
				continueCount: -1,
				start: {
					seconds: 0
				},
				iNewsCommand: 'VCP'
			})
		)
	})

	test('MINUSKAM=KAM 1', () => {
		const minusKamCue = ['MINUSKAM=KAM 1']
		const result = ParseCue(minusKamCue, config)
		expect(result).toEqual(
			literal<CueDefinitionMixMinus>({
				type: CueType.MixMinus,
				sourceDefinition: SOURCE_DEFINITION_KAM_1,
				iNewsCommand: 'MINUSKAM'
			})
		)
	})

	test('MINUSKAM=KAM 2', () => {
		const minusKamCue = ['MINUSKAM=KAM 2']
		const result = ParseCue(minusKamCue, config)
		expect(result).toEqual(
			literal<CueDefinitionMixMinus>({
				type: CueType.MixMinus,
				sourceDefinition: SOURCE_DEFINITION_KAM_2,
				iNewsCommand: 'MINUSKAM'
			})
		)
	})

	test('MINUSKAM=KAMERA 1', () => {
		const minusKamCue = ['MINUSKAM=KAMERA 1']
		const result = ParseCue(minusKamCue, config)
		expect(result).toEqual(
			literal<CueDefinitionMixMinus>({
				type: CueType.MixMinus,
				sourceDefinition: { ...SOURCE_DEFINITION_KAM_1, raw: 'KAMERA 1' },
				iNewsCommand: 'MINUSKAM'
			})
		)
	})

	test('MINUSKAM=KAMERA 2', () => {
		const minusKamCue = ['MINUSKAM=KAMERA 2']
		const result = ParseCue(minusKamCue, config)
		expect(result).toEqual(
			literal<CueDefinitionMixMinus>({
				type: CueType.MixMinus,
				sourceDefinition: { ...SOURCE_DEFINITION_KAM_2, raw: 'KAMERA 2' },
				iNewsCommand: 'MINUSKAM'
			})
		)
	})

	test('MINUSKAM=LIVE 1', () => {
		const minusKamCue = ['MINUSKAM=LIVE 1']
		const result = ParseCue(minusKamCue, config)
		expect(result).toEqual(
			literal<CueDefinitionMixMinus>({
				type: CueType.MixMinus,
				sourceDefinition: SOURCE_DEFINITION_LIVE_1,
				iNewsCommand: 'MINUSKAM'
			})
		)
	})

	test('MINUSKAM=LIVE 2', () => {
		const minusKamCue = ['MINUSKAM=LIVE 2']
		const result = ParseCue(minusKamCue, config)
		expect(result).toEqual(
			literal<CueDefinitionMixMinus>({
				type: CueType.MixMinus,
				sourceDefinition: SOURCE_DEFINITION_LIVE_2,
				iNewsCommand: 'MINUSKAM'
			})
		)
	})

	test('MINUSKAM=SERVER', () => {
		const minusKamCue = ['MINUSKAM=SERVER']
		const result = ParseCue(minusKamCue, config)
		expect(result).toEqual(
			literal<CueDefinitionMixMinus>({
				type: CueType.MixMinus,
				sourceDefinition: { sourceType: SourceType.SERVER },
				iNewsCommand: 'MINUSKAM'
			})
		)
	})

	test('MINUSKAM = SERVER', () => {
		const minusKamCue = ['MINUSKAM = SERVER']
		const result = ParseCue(minusKamCue, config)
		expect(result).toEqual(
			literal<CueDefinitionMixMinus>({
				type: CueType.MixMinus,
				sourceDefinition: { sourceType: SourceType.SERVER },
				iNewsCommand: 'MINUSKAM'
			})
		)
	})

	test('MINUSKAM = LIVE 1', () => {
		const minusKamCue = ['MINUSKAM = LIVE 1']
		const result = ParseCue(minusKamCue, config)
		expect(result).toEqual(
			literal<CueDefinitionMixMinus>({
				type: CueType.MixMinus,
				sourceDefinition: SOURCE_DEFINITION_LIVE_1,
				iNewsCommand: 'MINUSKAM'
			})
		)
	})

	test('MINUSKAM=LIVE 2 ', () => {
		const minusKamCue = ['MINUSKAM=LIVE 2 ']
		const result = ParseCue(minusKamCue, config)
		expect(result).toEqual(
			literal<CueDefinitionMixMinus>({
				type: CueType.MixMinus,
				sourceDefinition: SOURCE_DEFINITION_LIVE_2,
				iNewsCommand: 'MINUSKAM'
			})
		)
	})

	test('MINUSKAM=', () => {
		const minusKamCue = ['MINUSKAM=']
		const result = ParseCue(minusKamCue, config)
		expect(result).toEqual(undefined)
	})

	test('minuskam=Kam 2', () => {
		const minusKamCue = ['minuskam=Kam 2']
		const result = ParseCue(minusKamCue, config)
		expect(result).toEqual(
			literal<CueDefinitionMixMinus>({
				type: CueType.MixMinus,
				sourceDefinition: { ...SOURCE_DEFINITION_KAM_2, raw: 'Kam 2' },
				iNewsCommand: 'MINUSKAM'
			})
		)
	})

	test('minuskam = Kam 2 ', () => {
		const minusKamCue = ['minuskam = Kam 2 ']
		const result = ParseCue(minusKamCue, config)
		expect(result).toEqual(
			literal<CueDefinitionMixMinus>({
				type: CueType.MixMinus,
				sourceDefinition: { ...SOURCE_DEFINITION_KAM_2, raw: 'Kam 2' },
				iNewsCommand: 'MINUSKAM'
			})
		)
	})

	/** All-out cues */
	/** These tests are also used to catch case sensitivity / cue start symbols */
	test('All out', () => {
		const cueViz = ['KG=ovl-all-out', ';0.00.01']
		const result = ParseCue(cueViz, config)
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
		const result = ParseCue(cueViz, config)
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
		const result = ParseCue(cueViz, config)
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
		const result = ParseCue(cueViz, config)
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
		const result = ParseCue(cueViz, config)
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
		const result = ParseCue(cueViz, config)
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
		const result = ParseCue(cueViz, config)
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
		const result = ParseCue(cueViz, config)
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
		const result = ParseCue(cueViz, config)
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
		const result = ParseCue(cueViz, config)
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
		const result = ParseCue(cueViz, config)
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
		const result = ParseCue(cueViz, config)
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
		const result = ParseCue(cueViz, config)
		expect(result).toEqual(
			literal<CueDefinitionClearGrafiks>({
				type: CueType.ClearGrafiks,
				adlib: true,
				iNewsCommand: 'kg'
			})
		)
	})

	test('All out', () => {
		const cueViz = ['LYD=SN_intro', ';0.0x']
		const result = ParseCue(cueViz, config)
		expect(result).toEqual(
			literal<CueDefinitionLYD>({
				type: CueType.LYD,
				adlib: true,
				variant: 'SN_intro',
				iNewsCommand: 'LYD'
			})
		)
	})

	/** End of all-out cues */
})
