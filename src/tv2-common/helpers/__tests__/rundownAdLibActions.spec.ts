import { ActionTakeWithTransitionVariantDip, ParseTransitionString } from 'tv2-common'

describe('rundownAdLibActions', () => {
	describe('ParseTransitionString', () => {
		it('should parses Mix 12', () => {
			const result = ParseTransitionString('MIX 12')
			expect(result).toEqual({
				type: 'mix',
				frames: 12
			})
		})

		it('should parse Mix 9', () => {
			const result = ParseTransitionString('mix9')
			expect(result).toEqual({
				type: 'mix',
				frames: 9
			})
		})

		it('should parse EFFEKT 1', () => {
			const result = ParseTransitionString('EFFEKT 1')
			expect(result).toEqual({
				type: 'breaker',
				breaker: '1'
			})
		})

		it('should parse effekt2', () => {
			const result = ParseTransitionString('effekt2')
			expect(result).toEqual({
				type: 'breaker',
				breaker: '2'
			})
		})

		it('should parse 13 as breaker', () => {
			const result = ParseTransitionString('13')
			expect(result).toEqual({
				type: 'breaker',
				breaker: '13'
			})
		})

		it('should parse INTRO_19', () => {
			const result = ParseTransitionString('INTRO_19')
			expect(result).toEqual({
				type: 'breaker',
				breaker: 'INTRO_19'
			})
		})

		it('should parse / Branded Transition', () => {
			const result = ParseTransitionString('/ Branded Transition')
			expect(result).toEqual({
				type: 'breaker',
				breaker: '/ Branded Transition'
			})
		})

		it('should return Dip when transitionSetting is Dip', () => {
			const result = ParseTransitionString('dip 1')
			expect(result.type).toEqual('dip')
		})

		it('should return a dip with 4 frames when transitionSetting is dip 4', () => {
			const result = ParseTransitionString('dip 4')
			expect((result as ActionTakeWithTransitionVariantDip).frames).toEqual(4)
		})

		it('should return a dip with 15 frames when transitionSetting is dip 15', () => {
			const result = ParseTransitionString('dip 15')
			expect((result as ActionTakeWithTransitionVariantDip).frames).toEqual(15)
		})
	})
})
