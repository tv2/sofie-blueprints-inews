// @todo: rewrite for Atem and TriCaster
/*import { TSR } from 'blueprints-integration'
import { PartType } from '../../tv2-constants'
import { AtemSourceIndex } from '../../types/atem'
import { TV2BlueprintConfigBase, TV2ShowStyleConfig, TV2StudioConfigBase } from '../blueprintConfig'
import { PartDefinition, PartTransition } from '../inewsConversion'

const DURATION: number = 50

describe('transitionsSettingsSuite', () => {
	let mockConfig: TV2ShowStyleConfig

	beforeEach(() => {
		mockConfig = ({} as unknown) as TV2ShowStyleConfig
	})

	describe('TransitionSettings', () => {
		it('return empty when no transition', () => {
			const partDefinition: PartDefinition = createPartDefinition()

			const result = TransitionSettings(mockConfig, partDefinition)

			expect(result).toEqual({})
		})

		it('should return empty when no duration on transition', () => {
			const transition: PartTransition = {
				duration: undefined,
				style: TSR.AtemTransitionStyle.DUMMY
			}
			const partDefinition: PartDefinition = createPartDefinition(transition)
			const result = TransitionSettings(mockConfig, partDefinition)

			expect(result).toEqual({})
		})

		it('should return Wipe when transition is style Wip', () => {
			const transition: PartTransition = {
				style: TSR.AtemTransitionStyle.WIPE,
				duration: DURATION
			}
			const partDefinition: PartDefinition = createPartDefinition(transition)

			const result = TransitionSettings(mockConfig, partDefinition)
			const expectedResult: TSR.AtemTransitionSettings = {
				wipe: {
					rate: DURATION
				}
			}
			expect(result).toEqual(expectedResult)
		})

		it('should return Mix when transition is style Mix', () => {
			const transition: PartTransition = {
				style: TSR.AtemTransitionStyle.MIX,
				duration: DURATION
			}
			const partDefinition: PartDefinition = createPartDefinition(transition)

			const result = TransitionSettings(mockConfig, partDefinition)
			const expectedResult: TSR.AtemTransitionSettings = {
				mix: {
					rate: DURATION
				}
			}
			expect(result).toEqual(expectedResult)
		})

		it('should return Dip when style is Dip', () => {
			const transition: PartTransition = {
				style: TSR.AtemTransitionStyle.DIP,
				duration: DURATION
			}
			const partDefinition: PartDefinition = createPartDefinition(transition)

			const result = TransitionSettings(mockConfig, partDefinition)
			const expectedResult: TSR.AtemTransitionSettings = {
				dip: {
					rate: DURATION,
					input: AtemSourceIndex.Col2
				}
			}
			expect(result).toEqual(expectedResult)
		})

		it('should return 100 in Dip.input when AtemSource.Dip config value is 100', () => {
			const dipConfigInputSource = 100
			assertDipInputValueFromConfig(mockConfig, dipConfigInputSource)
		})

		it('should return 4 in Dip.input when AtemSource.Dip config value is 4', () => {
			const dipConfigInputSource = 4
			assertDipInputValueFromConfig(mockConfig, dipConfigInputSource)
		})

		it('should return 150 in Dip.input when AtemSource.Dip config value is 150', () => {
			const dipConfigInputSource = 150
			assertDipInputValueFromConfig(mockConfig, dipConfigInputSource)
		})
	})

	describe('DipTransitionSettings', () => {
		it('should return AtemSourceIndex.Col2 when no AtemSource.Dip is configured', () => {
			const transition: PartTransition = {
				style: TSR.AtemTransitionStyle.DIP,
				duration: DURATION
			}
			const partDefinition: PartDefinition = createPartDefinition(transition)

			const result = TransitionSettings(mockConfig, partDefinition)
			const expectedResult: TSR.AtemTransitionSettings = {
				dip: {
					rate: DURATION,
					input: AtemSourceIndex.Col2
				}
			}
			expect(result).toEqual(expectedResult)
		})
	})
})

function createPartDefinition(transition?: PartTransition): PartDefinition {
	return {
		externalId: `externalId_${Math.random() * 1000}`,
		cues: [],
		type: PartType.REMOTE,
		script: '',
		fields: {},
		modified: 123,
		storyName: 'someName',
		segmentExternalId: `segmentExternalId_${Math.random() * 1000}`,
		rawType: '',
		transition
	}
}

function assertDipInputValueFromConfig(
	mockConfig: TV2BlueprintConfigBase<TV2StudioConfigBase>,
	dipInputSource: number
) {
	mockConfig.studio = ({
		SwitcherSource: createAtemSourceConfig(dipInputSource)
	} as any) as TV2StudioConfigBase
	const transition: PartTransition = {
		style: TSR.AtemTransitionStyle.DIP,
		duration: DURATION
	}
	const partDefinition: PartDefinition = createPartDefinition(transition)

	const result = TransitionSettings(mockConfig, partDefinition)
	const expectedResult: TSR.AtemTransitionSettings = {
		dip: {
			rate: DURATION,
			input: dipInputSource
		}
	}
	expect(result).toEqual(expectedResult)
}

function createAtemSourceConfig(dip: number) {
	return {
		Dip: dip,
		Default: 1,
		SplitArtF: 1,
		SplitArtK: 1,
		DSK: []
	}
}
*/
