import { CueType, PartType } from 'tv2-constants'
import { literal } from '../../../util'
import { FindTargetPair, PartDefinitionUnknown } from '../ParseBody'
import {
	CueDefinitionGraphic,
	CueDefinitionTelefon,
	CueDefinitionUnpairedPilot,
	CueDefinitionUnpairedTarget,
	GraphicPilot
} from '../ParseCue'

describe('Find target pair', () => {
	test('TargetEngine + Pilot', () => {
		const part = literal<PartDefinitionUnknown>({
			type: PartType.Unknown,
			variant: {},
			externalId: '00001',
			script: '',
			rawType: '',
			fields: {},
			modified: 0,
			segmentExternalId: '',
			cues: [
				literal<CueDefinitionUnpairedTarget>({
					type: CueType.UNPAIRED_TARGET,
					target: 'FULL',
					iNewsCommand: 'GRAFIK',
					mergeable: true
				}),
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
			segmentExternalId: '',
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
					engineNumber: 4,
					start: {
						seconds: 0
					},
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

	test('TLF + Pilot', () => {
		const part = literal<PartDefinitionUnknown>({
			type: PartType.Unknown,
			variant: {},
			externalId: '00001',
			script: '',
			rawType: '',
			fields: {},
			modified: 0,
			segmentExternalId: '',
			cues: [
				literal<CueDefinitionTelefon>({
					type: CueType.Telefon,
					source: 'TLF 2',
					iNewsCommand: 'TELEFON'
				}),
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
			segmentExternalId: '',
			cues: [
				literal<CueDefinitionTelefon>({
					type: CueType.Telefon,
					source: 'TLF 2',
					iNewsCommand: 'TELEFON',
					graphic: literal<CueDefinitionGraphic<GraphicPilot>>({
						type: CueType.Graphic,
						target: 'TLF',
						graphic: {
							type: 'pilot',
							name: 'TELEFON/KORT//LIVE_KABUL',
							vcpid: 2552305,
							continueCount: 3
						},
						start: {
							seconds: 0
						},
						engineNumber: 4,
						iNewsCommand: 'TELEFON'
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
