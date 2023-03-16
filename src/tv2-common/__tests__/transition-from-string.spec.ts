import { TransitionStyle } from 'tv2-common'
import { parseTransitionStyle } from '../transitionStyleFromString'

describe('Transition From String', () => {
	it('Converts strings', () => {
		expect(parseTransitionStyle('mix')).toEqual(TransitionStyle.MIX)
		expect(parseTransitionStyle('MIX')).toEqual(TransitionStyle.MIX)
		expect(parseTransitionStyle('dip')).toEqual(TransitionStyle.DIP)
		expect(parseTransitionStyle('DIP')).toEqual(TransitionStyle.DIP)
		expect(parseTransitionStyle('wipe')).toEqual(TransitionStyle.WIPE)
		expect(parseTransitionStyle('WIPE')).toEqual(TransitionStyle.WIPE)
		expect(parseTransitionStyle('sting')).toEqual(TransitionStyle.STING)
		expect(parseTransitionStyle('STING')).toEqual(TransitionStyle.STING)
		expect(parseTransitionStyle('cut')).toEqual(TransitionStyle.CUT)
		expect(parseTransitionStyle('CUT')).toEqual(TransitionStyle.CUT)
		expect(parseTransitionStyle('unknown')).toEqual(TransitionStyle.CUT)
	})
})
