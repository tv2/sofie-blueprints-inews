import { TSR } from 'tv-automation-sofie-blueprints-integration'
import { TransitionFromString } from '../transitionFromString'

describe('Transition From String', () => {
	it('Converts strings', () => {
		expect(TransitionFromString('mix')).toEqual(TSR.AtemTransitionStyle.MIX)
		expect(TransitionFromString('MIX')).toEqual(TSR.AtemTransitionStyle.MIX)
		expect(TransitionFromString('dip')).toEqual(TSR.AtemTransitionStyle.DIP)
		expect(TransitionFromString('DIP')).toEqual(TSR.AtemTransitionStyle.DIP)
		expect(TransitionFromString('wipe')).toEqual(TSR.AtemTransitionStyle.WIPE)
		expect(TransitionFromString('WIPE')).toEqual(TSR.AtemTransitionStyle.WIPE)
		expect(TransitionFromString('sting')).toEqual(TSR.AtemTransitionStyle.STING)
		expect(TransitionFromString('STING')).toEqual(TSR.AtemTransitionStyle.STING)
		expect(TransitionFromString('cut')).toEqual(TSR.AtemTransitionStyle.CUT)
		expect(TransitionFromString('CUT')).toEqual(TSR.AtemTransitionStyle.CUT)
		expect(TransitionFromString('unknown')).toEqual(TSR.AtemTransitionStyle.CUT)
	})
})
