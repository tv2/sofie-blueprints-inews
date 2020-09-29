import {
	ActionTakeWithTransition,
	ActionTakeWithTransitionVariantBreaker,
	ActionTakeWithTransitionVariantMix,
	literal,
	ParseTransitionSetting
} from 'tv2-common'
import { AdlibActionType } from 'tv2-constants'

describe('Parse Transition Setting', () => {
	it('Parses Mix', () => {
		let result = ParseTransitionSetting('MIX 12', true)

		expect(result).toEqual(
			literal<ActionTakeWithTransition>({
				type: AdlibActionType.TAKE_WITH_TRANSITION,
				variant: literal<ActionTakeWithTransitionVariantMix>({
					type: 'mix',
					frames: 12
				}),
				takeNow: true
			})
		)

		result = ParseTransitionSetting('mix9', false)

		expect(result).toEqual(
			literal<ActionTakeWithTransition>({
				type: AdlibActionType.TAKE_WITH_TRANSITION,
				variant: literal<ActionTakeWithTransitionVariantMix>({
					type: 'mix',
					frames: 9
				}),
				takeNow: false
			})
		)
	})

	it('Parses EFFEKT', () => {
		let result = ParseTransitionSetting('EFFEKT 1', true)

		expect(result).toEqual(
			literal<ActionTakeWithTransition>({
				type: AdlibActionType.TAKE_WITH_TRANSITION,
				variant: literal<ActionTakeWithTransitionVariantBreaker>({
					type: 'breaker',
					breaker: '1'
				}),
				takeNow: true
			})
		)

		result = ParseTransitionSetting('effekt2', false)

		expect(result).toEqual(
			literal<ActionTakeWithTransition>({
				type: AdlibActionType.TAKE_WITH_TRANSITION,
				variant: literal<ActionTakeWithTransitionVariantBreaker>({
					type: 'breaker',
					breaker: '2'
				}),
				takeNow: false
			})
		)

		result = ParseTransitionSetting('13', false)

		expect(result).toEqual(
			literal<ActionTakeWithTransition>({
				type: AdlibActionType.TAKE_WITH_TRANSITION,
				variant: literal<ActionTakeWithTransitionVariantBreaker>({
					type: 'breaker',
					breaker: '13'
				}),
				takeNow: false
			})
		)
	})

	it('Parses Transition', () => {
		let result = ParseTransitionSetting('INTRO_19', true)

		expect(result).toEqual(
			literal<ActionTakeWithTransition>({
				type: AdlibActionType.TAKE_WITH_TRANSITION,
				variant: literal<ActionTakeWithTransitionVariantBreaker>({
					type: 'breaker',
					breaker: 'INTRO_19'
				}),
				takeNow: true
			})
		)

		result = ParseTransitionSetting('/ Branded Transition', false)

		expect(result).toEqual(
			literal<ActionTakeWithTransition>({
				type: AdlibActionType.TAKE_WITH_TRANSITION,
				variant: literal<ActionTakeWithTransitionVariantBreaker>({
					type: 'breaker',
					breaker: '/ Branded Transition'
				}),
				takeNow: false
			})
		)
	})
})
