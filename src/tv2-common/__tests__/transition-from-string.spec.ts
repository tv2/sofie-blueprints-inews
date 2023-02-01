import { TransitionStyle } from 'tv2-common'
import { TransitionStyleFromString } from '../transitionStyleFromString'

describe('Transition From String', () => {
	it('Converts strings', () => {
		expect(TransitionStyleFromString('mix')).toEqual(TransitionStyle.MIX)
		expect(TransitionStyleFromString('MIX')).toEqual(TransitionStyle.MIX)
		expect(TransitionStyleFromString('dip')).toEqual(TransitionStyle.DIP)
		expect(TransitionStyleFromString('DIP')).toEqual(TransitionStyle.DIP)
		expect(TransitionStyleFromString('wipe')).toEqual(TransitionStyle.WIPE)
		expect(TransitionStyleFromString('WIPE')).toEqual(TransitionStyle.WIPE)
		expect(TransitionStyleFromString('sting')).toEqual(TransitionStyle.STING)
		expect(TransitionStyleFromString('STING')).toEqual(TransitionStyle.STING)
		expect(TransitionStyleFromString('cut')).toEqual(TransitionStyle.CUT)
		expect(TransitionStyleFromString('CUT')).toEqual(TransitionStyle.CUT)
		expect(TransitionStyleFromString('unknown')).toEqual(TransitionStyle.CUT)
	})
})
