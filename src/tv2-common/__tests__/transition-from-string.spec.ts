import { TSR } from 'blueprints-integration'
import { AtemTransitionStyleFromString } from '../atemTransitionStyleFromString'

describe('Transition From String', () => {
	it('Converts strings', () => {
		expect(AtemTransitionStyleFromString('mix')).toEqual(TSR.AtemTransitionStyle.MIX)
		expect(AtemTransitionStyleFromString('MIX')).toEqual(TSR.AtemTransitionStyle.MIX)
		expect(AtemTransitionStyleFromString('dip')).toEqual(TSR.AtemTransitionStyle.DIP)
		expect(AtemTransitionStyleFromString('DIP')).toEqual(TSR.AtemTransitionStyle.DIP)
		expect(AtemTransitionStyleFromString('wipe')).toEqual(TSR.AtemTransitionStyle.WIPE)
		expect(AtemTransitionStyleFromString('WIPE')).toEqual(TSR.AtemTransitionStyle.WIPE)
		expect(AtemTransitionStyleFromString('sting')).toEqual(TSR.AtemTransitionStyle.STING)
		expect(AtemTransitionStyleFromString('STING')).toEqual(TSR.AtemTransitionStyle.STING)
		expect(AtemTransitionStyleFromString('cut')).toEqual(TSR.AtemTransitionStyle.CUT)
		expect(AtemTransitionStyleFromString('CUT')).toEqual(TSR.AtemTransitionStyle.CUT)
		expect(AtemTransitionStyleFromString('unknown')).toEqual(TSR.AtemTransitionStyle.CUT)
	})
})
