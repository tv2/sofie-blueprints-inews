import { literal } from '../../../../common/util'
import { FindTargetPair, PartDefinitionUnknown, PartType } from '../ParseBody'
import { CueDefinitionMOS, CueDefinitionTargetEngine, CueDefinitionTelefon, CueType } from '../ParseCue'

describe('Find target pair', () => {
	test('TargetEngine + MOS', () => {
		const part = literal<PartDefinitionUnknown>({
			type: PartType.Unknown,
			variant: {},
			externalId: '00001',
			script: '',
			rawType: '',
			fields: {},
			modified: 0,
			cues: [
				literal<CueDefinitionTargetEngine>({
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
				}),
				literal<CueDefinitionMOS>({
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
			],
			storyName: ''
		})
		const expectedResult = literal<PartDefinitionUnknown>({
			type: PartType.Unknown,
			variant: {},
			externalId: '00001',
			script: '',
			rawType: '',
			fields: {},
			modified: 0,
			cues: [
				literal<CueDefinitionTargetEngine>({
					type: CueType.TargetEngine,
					rawType: 'GRAFIK=FULL',
					data: {
						engine: 'FULL'
					},
					content: {
						INP1: '',
						INP: ''
					},
					grafik: literal<CueDefinitionMOS>({
						type: CueType.MOS,
						name: 'TELEFON/KORT//LIVE_KABUL',
						vcpid: 2552305,
						continueCount: 3,
						start: {
							seconds: 0
						},
						engine: '4',
						iNewsCommand: 'VCP'
					}),
					iNewsCommand: 'GRAFIK'
				})
			],
			storyName: ''
		})
		expect(FindTargetPair(part)).toBe(true)
		expect(part).toEqual(expectedResult)
		expect(FindTargetPair(part)).toBe(false)
		expect(part).toEqual(expectedResult)
	})

	test('TLF + MOS', () => {
		const part = literal<PartDefinitionUnknown>({
			type: PartType.Unknown,
			variant: {},
			externalId: '00001',
			script: '',
			rawType: '',
			fields: {},
			modified: 0,
			cues: [
				literal<CueDefinitionTelefon>({
					type: CueType.Telefon,
					source: 'TLF 2',
					iNewsCommand: 'TELEFON'
				}),
				literal<CueDefinitionMOS>({
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
			],
			storyName: ''
		})
		const expectedResult = literal<PartDefinitionUnknown>({
			type: PartType.Unknown,
			variant: {},
			externalId: '00001',
			script: '',
			rawType: '',
			fields: {},
			modified: 0,
			cues: [
				literal<CueDefinitionTelefon>({
					type: CueType.Telefon,
					source: 'TLF 2',
					iNewsCommand: 'TELEFON',
					vizObj: literal<CueDefinitionMOS>({
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
				})
			],
			storyName: ''
		})
		expect(FindTargetPair(part)).toBe(true)
		expect(part).toEqual(expectedResult)
		expect(FindTargetPair(part)).toBe(false)
		expect(part).toEqual(expectedResult)
	})
})
