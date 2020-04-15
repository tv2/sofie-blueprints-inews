import { AtemTransitionStyle } from 'timeline-state-resolver-types'
import { TransitionFromString } from '../transitionFromString'

describe('Transition From String', () => {
	it('Converts strings', () => {
		expect(TransitionFromString('mix')).toEqual(AtemTransitionStyle.MIX)
		expect(TransitionFromString('MIX')).toEqual(AtemTransitionStyle.MIX)
		expect(TransitionFromString('dip')).toEqual(AtemTransitionStyle.DIP)
		expect(TransitionFromString('DIP')).toEqual(AtemTransitionStyle.DIP)
		expect(TransitionFromString('wipe')).toEqual(AtemTransitionStyle.WIPE)
		expect(TransitionFromString('WIPE')).toEqual(AtemTransitionStyle.WIPE)
		expect(TransitionFromString('sting')).toEqual(AtemTransitionStyle.STING)
		expect(TransitionFromString('STING')).toEqual(AtemTransitionStyle.STING)
		expect(TransitionFromString('cut')).toEqual(AtemTransitionStyle.CUT)
		expect(TransitionFromString('CUT')).toEqual(AtemTransitionStyle.CUT)
		expect(TransitionFromString('unknown')).toEqual(AtemTransitionStyle.CUT)
	})
})
